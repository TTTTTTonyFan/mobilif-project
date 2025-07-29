#!/usr/bin/env node

/**
 * MobiLiF 服务器管理工具
 * 通过 SSH 连接远程服务器执行管理命令
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const execAsync = promisify(exec);

// 控制台颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

/**
 * 日志输出工具
 */
const logger = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${new Date().toISOString()} - ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${new Date().toISOString()} - ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${new Date().toISOString()} - ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${new Date().toISOString()} - ${msg}`),
    debug: (msg) => console.log(`${colors.magenta}[DEBUG]${colors.reset} ${new Date().toISOString()} - ${msg}`),
    header: (msg) => {
        console.log(`\n${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}${msg}${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}\n`);
    }
};

/**
 * 服务器管理类
 */
class ServerManager {
    constructor() {
        this.config = {
            host: process.env.SSH_HOST || process.env.SERVER_HOST || 'localhost',
            user: process.env.SSH_USER || 'root',
            port: process.env.SSH_PORT || 22,
            projectPath: process.env.REMOTE_PROJECT_PATH || '/opt/mobilif',
            timeout: 30000, // 30秒超时
        };

        // 验证必要的配置
        this.validateConfig();
    }

    /**
     * 验证配置
     */
    validateConfig() {
        if (!this.config.host || this.config.host === 'your-server-ip-or-domain') {
            throw new Error('请在 .env 文件中配置正确的 SSH_HOST 或 SERVER_HOST');
        }

        logger.info(`服务器配置: ${this.config.user}@${this.config.host}:${this.config.port}`);
        logger.info(`项目路径: ${this.config.projectPath}`);
    }

    /**
     * 执行SSH命令
     */
    async executeSSH(command, options = {}) {
        const { 
            timeout = this.config.timeout,
            showOutput = true,
            workingDir = this.config.projectPath
        } = options;

        // 构建SSH命令
        const sshCommand = `ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${this.config.user}@${this.config.host} -p ${this.config.port} "cd ${workingDir} && ${command}"`;
        
        logger.debug(`执行SSH命令: ${command}`);

        try {
            const { stdout, stderr } = await execAsync(sshCommand, { 
                timeout,
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });

            if (showOutput && stdout) {
                console.log(stdout);
            }

            if (stderr && !stderr.includes('Warning:') && !stderr.includes('Pseudo-terminal')) {
                logger.warning(`命令警告: ${stderr}`);
            }

            return {
                success: true,
                stdout: stdout.trim(),
                stderr: stderr.trim()
            };
        } catch (error) {
            const errorMsg = this.parseSSHError(error);
            logger.error(`SSH命令执行失败: ${errorMsg}`);
            
            return {
                success: false,
                error: errorMsg,
                stdout: error.stdout || '',
                stderr: error.stderr || ''
            };
        }
    }

    /**
     * 解析SSH错误
     */
    parseSSHError(error) {
        if (error.code === 'ENOTFOUND') {
            return `无法解析主机名: ${this.config.host}`;
        }
        if (error.message.includes('Connection refused')) {
            return `连接被拒绝，请检查SSH服务是否运行在端口 ${this.config.port}`;
        }
        if (error.message.includes('timeout')) {
            return '连接超时，请检查网络连接和服务器状态';
        }
        if (error.message.includes('Permission denied')) {
            return 'SSH认证失败，请检查密钥或密码配置';
        }
        if (error.message.includes('Host key verification failed')) {
            return 'SSH主机密钥验证失败';
        }
        return error.message || '未知SSH错误';
    }

    /**
     * 测试SSH连接
     */
    async testConnection() {
        logger.info('测试SSH连接...');
        const result = await this.executeSSH('echo "SSH连接成功"', { showOutput: false });
        
        if (result.success) {
            logger.success('SSH连接测试成功');
            return true;
        } else {
            logger.error('SSH连接测试失败');
            return false;
        }
    }

    /**
     * 获取服务器状态
     */
    async getStatus() {
        logger.header('获取服务器状态');

        try {
            // 系统信息
            logger.info('获取系统信息...');
            const systemInfo = await this.executeSSH('uname -a && uptime', { showOutput: false });
            
            if (systemInfo.success) {
                console.log(`${colors.cyan}系统信息:${colors.reset}`);
                console.log(systemInfo.stdout);
                console.log();
            }

            // 磁盘使用情况
            logger.info('检查磁盘使用情况...');
            const diskUsage = await this.executeSSH('df -h', { showOutput: false });
            
            if (diskUsage.success) {
                console.log(`${colors.cyan}磁盘使用情况:${colors.reset}`);
                console.log(diskUsage.stdout);
                console.log();
            }

            // 内存使用情况
            logger.info('检查内存使用情况...');
            const memoryUsage = await this.executeSSH('free -h', { showOutput: false });
            
            if (memoryUsage.success) {
                console.log(`${colors.cyan}内存使用情况:${colors.reset}`);
                console.log(memoryUsage.stdout);
                console.log();
            }

            // PM2 进程状态
            logger.info('检查PM2进程状态...');
            const pm2Status = await this.executeSSH('pm2 list', { showOutput: false });
            
            if (pm2Status.success) {
                console.log(`${colors.cyan}PM2进程状态:${colors.reset}`);
                console.log(pm2Status.stdout);
                console.log();
            }

            // Docker 容器状态
            logger.info('检查Docker容器状态...');
            const dockerStatus = await this.executeSSH('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"', { showOutput: false });
            
            if (dockerStatus.success) {
                console.log(`${colors.cyan}Docker容器状态:${colors.reset}`);
                console.log(dockerStatus.stdout);
                console.log();
            }

            // 网络连接
            logger.info('检查网络连接...');
            const networkStatus = await this.executeSSH('netstat -tlnp | grep :3000', { showOutput: false });
            
            if (networkStatus.success && networkStatus.stdout) {
                console.log(`${colors.cyan}网络监听状态:${colors.reset}`);
                console.log(networkStatus.stdout);
            } else {
                logger.warning('端口3000未监听');
            }

            logger.success('服务器状态检查完成');
            return true;

        } catch (error) {
            logger.error(`获取服务器状态失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 重启PM2服务
     */
    async restart() {
        logger.header('重启PM2服务');

        try {
            // 检查PM2进程
            logger.info('检查当前PM2进程...');
            const listResult = await this.executeSSH('pm2 list', { showOutput: false });
            
            if (listResult.success) {
                console.log(`${colors.cyan}当前PM2进程:${colors.reset}`);
                console.log(listResult.stdout);
                console.log();
            }

            // 重启所有进程
            logger.info('重启所有PM2进程...');
            const restartResult = await this.executeSSH('pm2 restart all');

            if (restartResult.success) {
                logger.success('PM2服务重启成功');
                
                // 等待服务启动
                logger.info('等待服务启动...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // 检查重启后状态
                const statusResult = await this.executeSSH('pm2 list', { showOutput: false });
                if (statusResult.success) {
                    console.log(`${colors.cyan}重启后状态:${colors.reset}`);
                    console.log(statusResult.stdout);
                }
                
                return true;
            } else {
                logger.error('PM2服务重启失败');
                return false;
            }

        } catch (error) {
            logger.error(`重启服务失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 创建备份
     */
    async backup() {
        logger.header('创建服务器备份');

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                             new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
            const backupDir = `${this.config.projectPath}/backups/backup_${timestamp}`;

            // 创建备份目录
            logger.info('创建备份目录...');
            await this.executeSSH(`mkdir -p ${backupDir}`);

            // 备份数据库
            logger.info('备份MySQL数据库...');
            const dbBackup = await this.executeSSH(
                `docker exec mobilif-mysql-master mysqldump -u root -pmobilif123456 --all-databases > ${backupDir}/database.sql`,
                { showOutput: false }
            );

            if (dbBackup.success) {
                logger.success('数据库备份完成');
            } else {
                logger.warning('数据库备份失败');
            }

            // 备份Redis数据
            logger.info('备份Redis数据...');
            const redisBackup = await this.executeSSH(`docker exec mobilif-redis redis-cli BGSAVE`);
            await this.executeSSH(`docker cp mobilif-redis:/data/dump.rdb ${backupDir}/redis.rdb`);

            // 备份配置文件
            logger.info('备份配置文件...');
            await this.executeSSH(`cp -r ${this.config.projectPath}/config ${backupDir}/`);
            await this.executeSSH(`cp ${this.config.projectPath}/.env* ${backupDir}/ 2>/dev/null || true`);

            // 备份上传文件
            logger.info('备份上传文件...');
            await this.executeSSH(`cp -r ${this.config.projectPath}/uploads ${backupDir}/ 2>/dev/null || true`);

            // 压缩备份
            logger.info('压缩备份文件...');
            const compressResult = await this.executeSSH(
                `cd ${this.config.projectPath}/backups && tar -czf backup_${timestamp}.tar.gz backup_${timestamp}`,
                { showOutput: false }
            );

            if (compressResult.success) {
                // 删除未压缩的备份目录
                await this.executeSSH(`rm -rf ${backupDir}`);
                logger.success(`备份创建完成: backup_${timestamp}.tar.gz`);
            }

            // 清理旧备份（保留最近7个）
            logger.info('清理旧备份...');
            await this.executeSSH(
                `cd ${this.config.projectPath}/backups && ls -t backup_*.tar.gz | tail -n +8 | xargs rm -f`,
                { showOutput: false }
            );

            return true;

        } catch (error) {
            logger.error(`创建备份失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 查看服务日志
     */
    async logs(options = {}) {
        const { 
            lines = 50, 
            follow = false, 
            service = 'all' 
        } = options;

        logger.header(`查看服务日志 (最近${lines}行)`);

        try {
            if (service === 'all' || service === 'pm2') {
                logger.info('获取PM2日志...');
                const pm2Logs = await this.executeSSH(`pm2 logs --lines ${lines} --nostream`);
                
                if (pm2Logs.success) {
                    console.log(`${colors.cyan}PM2服务日志:${colors.reset}`);
                    console.log(pm2Logs.stdout);
                    console.log();
                }
            }

            if (service === 'all' || service === 'docker') {
                logger.info('获取Docker日志...');
                const dockerLogs = await this.executeSSH(
                    `docker logs --tail ${lines} mobilif-backend 2>&1 || echo "Docker容器未运行"`,
                    { showOutput: false }
                );
                
                if (dockerLogs.success) {
                    console.log(`${colors.cyan}Docker容器日志:${colors.reset}`);
                    console.log(dockerLogs.stdout);
                    console.log();
                }
            }

            if (service === 'all' || service === 'nginx') {
                logger.info('获取Nginx日志...');
                const nginxLogs = await this.executeSSH(
                    `tail -n ${lines} /var/log/nginx/access.log 2>/dev/null || echo "Nginx日志文件不存在"`,
                    { showOutput: false }
                );
                
                if (nginxLogs.success) {
                    console.log(`${colors.cyan}Nginx访问日志:${colors.reset}`);
                    console.log(nginxLogs.stdout);
                }
            }

            if (follow) {
                logger.info('开始实时跟踪日志... (按 Ctrl+C 退出)');
                await this.executeSSH('pm2 logs --follow');
            }

            return true;

        } catch (error) {
            logger.error(`获取日志失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 重新部署服务
     */
    async deploy() {
        logger.header('重新部署服务');

        try {
            // 检查部署脚本是否存在
            logger.info('检查部署脚本...');
            const scriptCheck = await this.executeSSH(
                `ls -la ${this.config.projectPath}/scripts/deployment/deploy.sh`,
                { showOutput: false }
            );

            if (!scriptCheck.success) {
                logger.error('部署脚本不存在');
                return false;
            }

            // 执行部署脚本
            logger.info('开始执行部署脚本...');
            const deployResult = await this.executeSSH(
                `bash ${this.config.projectPath}/scripts/deployment/deploy.sh`,
                { timeout: 300000 } // 5分钟超时
            );

            if (deployResult.success) {
                logger.success('部署完成');
                return true;
            } else {
                logger.error('部署失败');
                return false;
            }

        } catch (error) {
            logger.error(`部署过程中发生错误: ${error.message}`);
            return false;
        }
    }
}

/**
 * 命令行界面
 */
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
        console.log(`
${colors.cyan}MobiLiF 服务器管理工具${colors.reset}

用法: node server-manager.js <命令> [选项]

命令:
  test        测试SSH连接
  status      获取服务器状态
  restart     重启PM2服务
  backup      创建备份
  logs        查看服务日志
  deploy      重新部署服务

选项:
  --lines <数量>    指定日志行数 (仅用于logs命令)
  --follow         实时跟踪日志 (仅用于logs命令)
  --service <类型>  指定服务类型: pm2|docker|nginx|all (仅用于logs命令)

示例:
  node server-manager.js status
  node server-manager.js logs --lines 100
  node server-manager.js logs --follow
  node server-manager.js logs --service nginx
        `);
        process.exit(0);
    }

    try {
        const serverManager = new ServerManager();

        // 首先测试连接
        if (command !== 'test') {
            const connected = await serverManager.testConnection();
            if (!connected) {
                logger.error('SSH连接失败，请检查配置');
                process.exit(1);
            }
        }

        let result = false;

        switch (command) {
            case 'test':
                result = await serverManager.testConnection();
                break;

            case 'status':
                result = await serverManager.getStatus();
                break;

            case 'restart':
                result = await serverManager.restart();
                break;

            case 'backup':
                result = await serverManager.backup();
                break;

            case 'logs':
                const logOptions = {};
                for (let i = 1; i < args.length; i++) {
                    if (args[i] === '--lines' && args[i + 1]) {
                        logOptions.lines = parseInt(args[i + 1]);
                        i++;
                    } else if (args[i] === '--follow') {
                        logOptions.follow = true;
                    } else if (args[i] === '--service' && args[i + 1]) {
                        logOptions.service = args[i + 1];
                        i++;
                    }
                }
                result = await serverManager.logs(logOptions);
                break;

            case 'deploy':
                result = await serverManager.deploy();
                break;

            default:
                logger.error(`未知命令: ${command}`);
                process.exit(1);
        }

        process.exit(result ? 0 : 1);

    } catch (error) {
        logger.error(`执行失败: ${error.message}`);
        process.exit(1);
    }
}

// 模块导出
module.exports = ServerManager;

// 直接运行检测
if (require.main === module) {
    main();
}