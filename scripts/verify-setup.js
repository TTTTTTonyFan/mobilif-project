#!/usr/bin/env node

/**
 * MobiLiF 安装验证脚本
 * 检查项目配置完整性和环境准备情况
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 控制台颜色和表情符号
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const emojis = {
    check: '✅',
    cross: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    rocket: '🚀',
    gear: '⚙️',
    file: '📄',
    folder: '📁',
    network: '🌐',
    database: '💾',
    key: '🔑',
    package: '📦',
    bug: '🐛',
    success: '🎉',
    time: '⏱️'
};

/**
 * 验证结果收集器
 */
class VerificationResults {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
        this.categories = {
            files: { passed: 0, failed: 0, warnings: 0 },
            environment: { passed: 0, failed: 0, warnings: 0 },
            dependencies: { passed: 0, failed: 0, warnings: 0 },
            network: { passed: 0, failed: 0, warnings: 0 },
            configuration: { passed: 0, failed: 0, warnings: 0 }
        };
    }

    add(category, name, status, message = '', details = null) {
        const result = {
            category,
            name,
            status, // 'pass', 'fail', 'warning'
            message,
            details,
            timestamp: new Date().toISOString()
        };

        this.results.push(result);
        this.categories[category][status === 'pass' ? 'passed' : (status === 'fail' ? 'failed' : 'warnings')]++;
    }

    getTotalTime() {
        return Date.now() - this.startTime;
    }

    getTotalTests() {
        return this.results.length;
    }

    getTotalPassed() {
        return this.results.filter(r => r.status === 'pass').length;
    }

    getTotalFailed() {
        return this.results.filter(r => r.status === 'fail').length;
    }

    getTotalWarnings() {
        return this.results.filter(r => r.status === 'warning').length;
    }

    isSetupValid() {
        return this.getTotalFailed() === 0;
    }
}

/**
 * 美化输出工具
 */
const display = {
    title: (text) => {
        console.log(`\n${colors.cyan}${colors.bright}╔${'═'.repeat(text.length + 4)}╗${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}║  ${text}  ║${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}╚${'═'.repeat(text.length + 4)}╝${colors.reset}\n`);
    },

    section: (emoji, title) => {
        console.log(`\n${colors.blue}${colors.bright}${emoji} ${title}${colors.reset}`);
        console.log(`${colors.blue}${'─'.repeat(title.length + 3)}${colors.reset}`);
    },

    result: (status, message, details = '') => {
        const emoji = status === 'pass' ? emojis.check : (status === 'fail' ? emojis.cross : emojis.warning);
        const color = status === 'pass' ? colors.green : (status === 'fail' ? colors.red : colors.yellow);
        
        console.log(`${emoji} ${color}${message}${colors.reset}`);
        if (details) {
            console.log(`   ${colors.cyan}${details}${colors.reset}`);
        }
    },

    divider: () => {
        console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    }
};

/**
 * 文件系统验证器
 */
class FileVerifier {
    constructor(results) {
        this.results = results;
        this.requiredFiles = [
            { path: 'package.json', description: '项目配置文件' },
            { path: '.env.example', description: '环境变量示例文件' },
            { path: 'src/main.ts', description: '应用入口文件' },
            { path: 'docker-compose.yml', description: 'Docker编排文件' },
            { path: 'Dockerfile', description: 'Docker构建文件' },
            { path: 'prisma/schema.prisma', description: 'Prisma数据库模型' },
            { path: 'tsconfig.json', description: 'TypeScript配置文件' },
            { path: 'README.md', description: '项目说明文件' }
        ];

        this.requiredDirectories = [
            { path: 'src', description: '源代码目录' },
            { path: 'src/modules', description: '业务模块目录' },
            { path: 'src/config', description: '配置文件目录' },
            { path: 'scripts', description: '脚本文件目录' },
            { path: 'tests', description: '测试文件目录' },
            { path: 'docs', description: '文档目录' },
            { path: 'config', description: '项目配置目录' }
        ];

        this.scriptFiles = [
            { path: 'scripts/server-manager.js', description: '服务器管理脚本' },
            { path: 'scripts/test-remote-api.js', description: 'API测试脚本' },
            { path: 'scripts/quick-test.js', description: '快速测试脚本' },
            { path: 'scripts/deployment/deploy.sh', description: '部署脚本' },
            { path: 'config/api.js', description: 'API配置文件' },
            { path: 'config/api-client.js', description: 'API客户端配置' }
        ];
    }

    async verify() {
        display.section(emojis.file, '检查必需文件');

        // 检查必需文件
        for (const file of this.requiredFiles) {
            const filePath = path.join(process.cwd(), file.path);
            const exists = fs.existsSync(filePath);
            
            if (exists) {
                const stats = fs.statSync(filePath);
                const size = this.formatFileSize(stats.size);
                this.results.add('files', file.path, 'pass', `${file.description} 存在`, `大小: ${size}`);
                display.result('pass', `${file.path} - ${file.description}`, `大小: ${size}`);
            } else {
                this.results.add('files', file.path, 'fail', `${file.description} 缺失`);
                display.result('fail', `${file.path} - ${file.description} 缺失`);
            }
        }

        // 检查必需目录
        display.section(emojis.folder, '检查必需目录');
        for (const dir of this.requiredDirectories) {
            const dirPath = path.join(process.cwd(), dir.path);
            const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
            
            if (exists) {
                const fileCount = fs.readdirSync(dirPath).length;
                this.results.add('files', dir.path, 'pass', `${dir.description} 存在`, `包含 ${fileCount} 个文件`);
                display.result('pass', `${dir.path}/ - ${dir.description}`, `包含 ${fileCount} 个文件`);
            } else {
                this.results.add('files', dir.path, 'fail', `${dir.description} 缺失`);
                display.result('fail', `${dir.path}/ - ${dir.description} 缺失`);
            }
        }

        // 检查脚本文件
        display.section(emojis.gear, '检查脚本文件');
        for (const script of this.scriptFiles) {
            const scriptPath = path.join(process.cwd(), script.path);
            const exists = fs.existsSync(scriptPath);
            
            if (exists) {
                // 检查脚本是否可执行
                const stats = fs.statSync(scriptPath);
                const isExecutable = script.path.endsWith('.sh') ? 
                    (stats.mode & parseInt('111', 8)) !== 0 : true;
                
                if (isExecutable || !script.path.endsWith('.sh')) {
                    this.results.add('files', script.path, 'pass', `${script.description} 存在且可执行`);
                    display.result('pass', `${script.path} - ${script.description}`);
                } else {
                    this.results.add('files', script.path, 'warning', `${script.description} 存在但不可执行`);
                    display.result('warning', `${script.path} - ${script.description}`, '建议运行: chmod +x ' + script.path);
                }
            } else {
                this.results.add('files', script.path, 'fail', `${script.description} 缺失`);
                display.result('fail', `${script.path} - ${script.description} 缺失`);
            }
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

/**
 * 环境配置验证器
 */
class EnvironmentVerifier {
    constructor(results) {
        this.results = results;
        this.requiredEnvVars = [
            { key: 'NODE_ENV', description: '运行环境', required: false, defaultValue: 'development' },
            { key: 'PORT', description: '服务端口', required: false, defaultValue: '3000' },
            { key: 'DB_HOST', description: '数据库主机', required: true },
            { key: 'DB_USERNAME', description: '数据库用户名', required: true },
            { key: 'DB_PASSWORD', description: '数据库密码', required: true },
            { key: 'DB_DATABASE', description: '数据库名称', required: true },
            { key: 'JWT_SECRET', description: 'JWT密钥', required: true },
            { key: 'REDIS_HOST', description: 'Redis主机', required: false, defaultValue: 'localhost' },
            { key: 'SERVER_HOST', description: '服务器地址', required: false },
            { key: 'WECHAT_APP_ID', description: '微信AppID', required: false }
        ];
    }

    async verify() {
        display.section(emojis.key, '检查环境变量配置');

        // 检查 .env 文件
        const envPath = path.join(process.cwd(), '.env');
        const envExists = fs.existsSync(envPath);
        
        if (envExists) {
            this.results.add('environment', '.env', 'pass', '.env 文件存在');
            display.result('pass', '.env 文件存在');
            
            // 验证环境变量
            for (const envVar of this.requiredEnvVars) {
                const value = process.env[envVar.key];
                
                if (value) {
                    // 检查是否为占位符
                    const isPlaceholder = this.isPlaceholderValue(value);
                    if (isPlaceholder) {
                        this.results.add('environment', envVar.key, 'warning', 
                            `${envVar.description} 仍为占位符值`, `当前值: ${value}`);
                        display.result('warning', `${envVar.key} - ${envVar.description}`, 
                            `仍为占位符值: ${value}`);
                    } else {
                        const displayValue = this.shouldMaskValue(envVar.key) ? '***' : value;
                        this.results.add('environment', envVar.key, 'pass', 
                            `${envVar.description} 已配置`, `值: ${displayValue}`);
                        display.result('pass', `${envVar.key} - ${envVar.description}`, 
                            `值: ${displayValue}`);
                    }
                } else if (envVar.required) {
                    this.results.add('environment', envVar.key, 'fail', 
                        `${envVar.description} 未配置（必需）`);
                    display.result('fail', `${envVar.key} - ${envVar.description} 未配置（必需）`);
                } else {
                    const defaultValue = envVar.defaultValue || '未设置';
                    this.results.add('environment', envVar.key, 'warning', 
                        `${envVar.description} 未配置（可选）`, `默认值: ${defaultValue}`);
                    display.result('warning', `${envVar.key} - ${envVar.description} 未配置`, 
                        `将使用默认值: ${defaultValue}`);
                }
            }
        } else {
            this.results.add('environment', '.env', 'fail', '.env 文件不存在');
            display.result('fail', '.env 文件不存在', '请运行: cp .env.example .env');
        }

        // 检查环境变量类型
        this.validateEnvironmentTypes();
    }

    isPlaceholderValue(value) {
        const placeholders = [
            'your-server-ip-or-domain',
            'your_password',
            'your_strong_password_here',
            'your-jwt-secret-key',
            'your-wechat-app-id',
            'your-wechat-app-secret',
            'localhost', // 在某些情况下可能是占位符
        ];
        return placeholders.some(placeholder => 
            value.toLowerCase().includes(placeholder.toLowerCase())
        );
    }

    shouldMaskValue(key) {
        const sensitiveKeys = [
            'PASSWORD', 'SECRET', 'KEY', 'TOKEN', 'PRIVATE'
        ];
        return sensitiveKeys.some(sensitive => 
            key.toUpperCase().includes(sensitive)
        );
    }

    validateEnvironmentTypes() {
        display.section(emojis.gear, '验证环境变量类型');

        // 验证端口号
        const port = process.env.PORT;
        if (port) {
            const portNum = parseInt(port);
            if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                this.results.add('environment', 'PORT_TYPE', 'fail', 'PORT 必须是有效的端口号 (1-65535)');
                display.result('fail', 'PORT 类型验证失败', `当前值: ${port} 不是有效端口号`);
            } else {
                this.results.add('environment', 'PORT_TYPE', 'pass', 'PORT 类型验证通过');
                display.result('pass', 'PORT 类型验证通过', `端口: ${portNum}`);
            }
        }

        // 验证布尔值
        const booleanVars = ['DEBUG_ENABLED', 'SWAGGER_ENABLED', 'RATE_LIMIT_ENABLED'];
        booleanVars.forEach(varName => {
            const value = process.env[varName];
            if (value && !['true', 'false'].includes(value.toLowerCase())) {
                this.results.add('environment', `${varName}_TYPE`, 'warning', 
                    `${varName} 应该是 true 或 false`, `当前值: ${value}`);
                display.result('warning', `${varName} 类型验证`, 
                    `应该是 true/false，当前: ${value}`);
            }
        });
    }
}

/**
 * 依赖包验证器
 */
class DependencyVerifier {
    constructor(results) {
        this.results = results;
    }

    async verify() {
        display.section(emojis.package, '检查依赖包安装');

        try {
            // 检查 node_modules 目录
            const nodeModulesPath = path.join(process.cwd(), 'node_modules');
            if (fs.existsSync(nodeModulesPath)) {
                this.results.add('dependencies', 'node_modules', 'pass', 'node_modules 目录存在');
                display.result('pass', 'node_modules 目录存在');

                // 统计已安装的包数量
                const packageCount = fs.readdirSync(nodeModulesPath).filter(name => 
                    !name.startsWith('.') && 
                    fs.statSync(path.join(nodeModulesPath, name)).isDirectory()
                ).length;
                
                this.results.add('dependencies', 'package_count', 'pass', 
                    `已安装 ${packageCount} 个包`);
                display.result('pass', `依赖包统计`, `已安装 ${packageCount} 个包`);
            } else {
                this.results.add('dependencies', 'node_modules', 'fail', 'node_modules 目录不存在');
                display.result('fail', 'node_modules 目录不存在', '请运行: npm install');
                return;
            }

            // 检查关键依赖包
            const criticalPackages = [
                '@nestjs/core',
                '@nestjs/common',
                'axios',
                'dotenv',
                'mysql2',
                'redis',
                'typescript'
            ];

            for (const packageName of criticalPackages) {
                await this.checkPackage(packageName);
            }

            // 验证 package.json 和 package-lock.json 同步
            await this.checkPackageIntegrity();

        } catch (error) {
            this.results.add('dependencies', 'verification', 'fail', 
                '依赖包验证过程中出错', error.message);
            display.result('fail', '依赖包验证出错', error.message);
        }
    }

    async checkPackage(packageName) {
        try {
            const packagePath = path.join(process.cwd(), 'node_modules', packageName);
            
            if (fs.existsSync(packagePath)) {
                // 尝试require包以验证其完整性
                const packageJsonPath = path.join(packagePath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                    this.results.add('dependencies', packageName, 'pass', 
                        `${packageName} 安装正常`, `版本: ${packageInfo.version}`);
                    display.result('pass', `${packageName}`, `版本: ${packageInfo.version}`);
                } else {
                    this.results.add('dependencies', packageName, 'warning', 
                        `${packageName} 安装不完整`);
                    display.result('warning', `${packageName}`, '安装不完整');
                }
            } else {
                this.results.add('dependencies', packageName, 'fail', 
                    `${packageName} 未安装`);
                display.result('fail', `${packageName}`, '未安装');
            }
        } catch (error) {
            this.results.add('dependencies', packageName, 'fail', 
                `${packageName} 验证失败`, error.message);
            display.result('fail', `${packageName}`, `验证失败: ${error.message}`);
        }
    }

    async checkPackageIntegrity() {
        try {
            // 检查是否存在安全漏洞
            const { stdout, stderr } = await execAsync('npm audit --json', { 
                timeout: 30000 
            }).catch(error => {
                // npm audit 在有漏洞时会返回非零退出码，但这是正常的
                return { stdout: error.stdout || '{}', stderr: error.stderr || '' };
            });

            if (stdout) {
                const auditResult = JSON.parse(stdout);
                const vulnerabilities = auditResult.metadata?.vulnerabilities;

                if (vulnerabilities) {
                    const { high = 0, critical = 0, moderate = 0, low = 0 } = vulnerabilities;
                    const total = high + critical + moderate + low;

                    if (critical > 0 || high > 0) {
                        this.results.add('dependencies', 'security', 'fail', 
                            `发现 ${critical} 个严重和 ${high} 个高危安全漏洞`);
                        display.result('fail', '安全审计', 
                            `严重: ${critical}, 高危: ${high}, 中等: ${moderate}, 低级: ${low}`);
                    } else if (moderate > 0) {
                        this.results.add('dependencies', 'security', 'warning', 
                            `发现 ${total} 个安全问题（无严重漏洞）`);
                        display.result('warning', '安全审计', 
                            `中等: ${moderate}, 低级: ${low} 个安全问题`);
                    } else {
                        this.results.add('dependencies', 'security', 'pass', 
                            '未发现安全漏洞');
                        display.result('pass', '安全审计', '未发现安全漏洞');
                    }
                }
            }
        } catch (error) {
            this.results.add('dependencies', 'security', 'warning', 
                '无法执行安全审计', error.message);
            display.result('warning', '安全审计', `无法执行: ${error.message}`);
        }
    }
}

/**
 * 网络连接验证器
 */
class NetworkVerifier {
    constructor(results) {
        this.results = results;
    }

    async verify() {
        display.section(emojis.network, '检查网络连接');

        // 检查本地端口可用性
        await this.checkPortAvailability();

        // 检查外部网络连接
        await this.checkExternalConnections();

        // 检查数据库连接
        await this.checkDatabaseConnection();
    }

    async checkPortAvailability() {
        const port = process.env.PORT || 3000;
        
        try {
            const { stdout } = await execAsync(`lsof -i :${port}`).catch(() => ({ stdout: '' }));
            
            if (stdout.trim()) {
                this.results.add('network', 'port_check', 'warning', 
                    `端口 ${port} 已被占用`);
                display.result('warning', `端口 ${port}`, '已被其他进程占用');
            } else {
                this.results.add('network', 'port_check', 'pass', 
                    `端口 ${port} 可用`);
                display.result('pass', `端口 ${port}`, '可用');
            }
        } catch (error) {
            this.results.add('network', 'port_check', 'warning', 
                '无法检查端口状态', error.message);
            display.result('warning', '端口检查', `无法执行: ${error.message}`);
        }
    }

    async checkExternalConnections() {
        const testUrls = [
            { url: 'https://www.google.com', name: '外网连接' },
            { url: 'https://registry.npmjs.org', name: 'NPM 仓库' },
            { url: 'https://api.github.com', name: 'GitHub API' }
        ];

        for (const test of testUrls) {
            await this.testConnection(test.url, test.name);
        }
    }

    async testConnection(url, name) {
        try {
            const { APIClient } = require('../config/api-client');
            const client = new APIClient({ 
                baseURL: url, 
                timeout: 10000,
                enableLogging: false 
            });

            await client.get('/', {}, { timeout: 5000 });
            
            this.results.add('network', `connection_${name}`, 'pass', 
                `${name} 连接正常`);
            display.result('pass', `${name}`, '连接正常');
        } catch (error) {
            if (error.name === 'TimeoutError') {
                this.results.add('network', `connection_${name}`, 'warning', 
                    `${name} 连接超时`);
                display.result('warning', `${name}`, '连接超时');
            } else {
                this.results.add('network', `connection_${name}`, 'fail', 
                    `${name} 连接失败`, error.message);
                display.result('fail', `${name}`, `连接失败: ${error.message}`);
            }
        }
    }

    async checkDatabaseConnection() {
        const dbHost = process.env.DB_HOST;
        const dbPort = process.env.DB_PORT || 3306;

        if (!dbHost) {
            this.results.add('network', 'database', 'warning', 
                '未配置数据库主机，跳过数据库连接测试');
            display.result('warning', '数据库连接', '未配置数据库主机');
            return;
        }

        try {
            // 简单的TCP连接测试
            const net = require('net');
            const socket = new net.Socket();
            
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    socket.destroy();
                    reject(new Error('连接超时'));
                }, 5000);

                socket.connect(dbPort, dbHost, () => {
                    clearTimeout(timeout);
                    socket.destroy();
                    resolve();
                });

                socket.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });

            this.results.add('network', 'database', 'pass', 
                `数据库连接测试通过`, `${dbHost}:${dbPort}`);
            display.result('pass', '数据库连接', `${dbHost}:${dbPort}`);
        } catch (error) {
            this.results.add('network', 'database', 'fail', 
                '数据库连接失败', `${dbHost}:${dbPort} - ${error.message}`);
            display.result('fail', '数据库连接', 
                `${dbHost}:${dbPort} - ${error.message}`);
        }
    }
}

/**
 * 配置验证器
 */
class ConfigurationVerifier {
    constructor(results) {
        this.results = results;
    }

    async verify() {
        display.section(emojis.gear, '检查项目配置');

        // 验证 package.json
        await this.verifyPackageJson();

        // 验证 TypeScript 配置
        await this.verifyTypeScriptConfig();

        // 验证 API 配置
        await this.verifyApiConfig();

        // 验证 Docker 配置
        await this.verifyDockerConfig();
    }

    async verifyPackageJson() {
        try {
            const packagePath = path.join(process.cwd(), 'package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            // 检查必需的脚本
            const requiredScripts = [
                'start', 'start:dev', 'build', 'test',
                'test:api', 'quick-test', 'server:status'
            ];

            const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
            
            if (missingScripts.length === 0) {
                this.results.add('configuration', 'package_scripts', 'pass', 
                    '所有必需的 npm 脚本都已配置');
                display.result('pass', 'package.json 脚本', '所有必需脚本已配置');
            } else {
                this.results.add('configuration', 'package_scripts', 'warning', 
                    `缺少 ${missingScripts.length} 个 npm 脚本`, 
                    `缺少: ${missingScripts.join(', ')}`);
                display.result('warning', 'package.json 脚本', 
                    `缺少: ${missingScripts.join(', ')}`);
            }

            // 检查项目信息
            if (packageJson.name && packageJson.version) {
                this.results.add('configuration', 'package_info', 'pass', 
                    '项目信息完整', `${packageJson.name}@${packageJson.version}`);
                display.result('pass', '项目信息', 
                    `${packageJson.name}@${packageJson.version}`);
            }

        } catch (error) {
            this.results.add('configuration', 'package_json', 'fail', 
                'package.json 验证失败', error.message);
            display.result('fail', 'package.json', `验证失败: ${error.message}`);
        }
    }

    async verifyTypeScriptConfig() {
        const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
        
        if (fs.existsSync(tsconfigPath)) {
            try {
                const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
                
                if (tsconfig.compilerOptions) {
                    this.results.add('configuration', 'typescript', 'pass', 
                        'TypeScript 配置正常');
                    display.result('pass', 'TypeScript 配置', '配置文件正常');
                } else {
                    this.results.add('configuration', 'typescript', 'warning', 
                        'TypeScript 配置可能不完整');
                    display.result('warning', 'TypeScript 配置', '配置可能不完整');
                }
            } catch (error) {
                this.results.add('configuration', 'typescript', 'fail', 
                    'TypeScript 配置格式错误', error.message);
                display.result('fail', 'TypeScript 配置', `格式错误: ${error.message}`);
            }
        } else {
            this.results.add('configuration', 'typescript', 'warning', 
                'tsconfig.json 文件不存在');
            display.result('warning', 'TypeScript 配置', 'tsconfig.json 不存在');
        }
    }

    async verifyApiConfig() {
        try {
            const apiConfigPath = path.join(process.cwd(), 'config/api.js');
            
            if (fs.existsSync(apiConfigPath)) {
                // 尝试加载配置
                delete require.cache[require.resolve('../config/api')];
                const config = require('../config/api');
                
                if (config.PORT && config.api && config.jwt) {
                    this.results.add('configuration', 'api_config', 'pass', 
                        'API 配置加载成功');
                    display.result('pass', 'API 配置', '配置加载成功');
                } else {
                    this.results.add('configuration', 'api_config', 'warning', 
                        'API 配置可能不完整');
                    display.result('warning', 'API 配置', '配置可能不完整');
                }
            } else {
                this.results.add('configuration', 'api_config', 'fail', 
                    'API 配置文件不存在');
                display.result('fail', 'API 配置', '配置文件不存在');
            }
        } catch (error) {
            this.results.add('configuration', 'api_config', 'fail', 
                'API 配置加载失败', error.message);
            display.result('fail', 'API 配置', `加载失败: ${error.message}`);
        }
    }

    async verifyDockerConfig() {
        const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
        
        if (fs.existsSync(dockerComposePath)) {
            this.results.add('configuration', 'docker', 'pass', 
                'Docker Compose 配置存在');
            display.result('pass', 'Docker 配置', 'docker-compose.yml 存在');
        } else {
            this.results.add('configuration', 'docker', 'warning', 
                'Docker Compose 配置不存在');
            display.result('warning', 'Docker 配置', 'docker-compose.yml 不存在');
        }
    }
}

/**
 * 生成验证报告
 */
function generateReport(results) {
    display.divider();
    display.section(emojis.success, '验证报告');

    const totalTime = results.getTotalTime();
    const totalTests = results.getTotalTests();
    const totalPassed = results.getTotalPassed();
    const totalFailed = results.getTotalFailed();
    const totalWarnings = results.getTotalWarnings();

    // 总体统计
    console.log(`${emojis.time} 验证耗时: ${colors.cyan}${(totalTime / 1000).toFixed(2)} 秒${colors.reset}`);
    console.log(`${emojis.info} 总检查项: ${colors.bright}${totalTests}${colors.reset}`);
    console.log(`${emojis.check} 通过: ${colors.green}${totalPassed}${colors.reset}`);
    console.log(`${emojis.cross} 失败: ${colors.red}${totalFailed}${colors.reset}`);
    console.log(`${emojis.warning} 警告: ${colors.yellow}${totalWarnings}${colors.reset}`);

    // 分类统计
    console.log(`\n${colors.cyan}分类统计:${colors.reset}`);
    Object.entries(results.categories).forEach(([category, stats]) => {
        const categoryName = {
            files: '文件检查',
            environment: '环境配置',
            dependencies: '依赖包',
            network: '网络连接',
            configuration: '项目配置'
        }[category] || category;

        console.log(`  ${categoryName}: ${colors.green}${stats.passed}${colors.reset}/${colors.red}${stats.failed}${colors.reset}/${colors.yellow}${stats.warnings}${colors.reset}`);
    });

    // 成功率
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;
    console.log(`\n${emojis.rocket} 成功率: ${colors.bright}${successRate}%${colors.reset}`);

    // 最终状态
    if (results.isSetupValid()) {
        console.log(`\n${colors.green}${colors.bright}${emojis.success} 设置验证通过！项目已准备就绪${colors.reset}`);
        
        if (totalWarnings > 0) {
            console.log(`${colors.yellow}注意: 有 ${totalWarnings} 个警告项目，建议查看并优化${colors.reset}`);
        }
    } else {
        console.log(`\n${colors.red}${colors.bright}${emojis.bug} 设置验证失败！请修复上述问题后重新运行${colors.reset}`);
    }

    // 建议操作
    generateRecommendations(results);

    return results.isSetupValid();
}

/**
 * 生成建议操作
 */
function generateRecommendations(results) {
    const failedResults = results.results.filter(r => r.status === 'fail');
    const warningResults = results.results.filter(r => r.status === 'warning');

    if (failedResults.length > 0 || warningResults.length > 0) {
        console.log(`\n${colors.yellow}${colors.bright}${emojis.gear} 建议操作:${colors.reset}`);

        // 关键问题修复
        if (failedResults.some(r => r.name === '.env')) {
            console.log(`  1. 创建环境配置文件: ${colors.cyan}cp .env.example .env${colors.reset}`);
        }

        if (failedResults.some(r => r.name === 'node_modules')) {
            console.log(`  2. 安装项目依赖: ${colors.cyan}npm install${colors.reset}`);
        }

        if (failedResults.some(r => r.category === 'environment')) {
            console.log(`  3. 配置环境变量: ${colors.cyan}编辑 .env 文件${colors.reset}`);
        }

        if (failedResults.some(r => r.category === 'network' && r.name === 'database')) {
            console.log(`  4. 启动数据库服务: ${colors.cyan}docker-compose up -d mysql${colors.reset}`);
        }

        // 优化建议
        if (warningResults.length > 0) {
            console.log(`\n${colors.cyan}优化建议:${colors.reset}`);
            console.log(`  • 运行完整测试: ${colors.cyan}npm run quick-test${colors.reset}`);
            console.log(`  • 检查服务状态: ${colors.cyan}npm run server:status${colors.reset}`);
            console.log(`  • 查看详细文档: ${colors.cyan}docs/local-development.md${colors.reset}`);
        }
    }
}

/**
 * 主验证函数
 */
async function runVerification() {
    const results = new VerificationResults();

    display.title(`${emojis.rocket} MobiLiF 设置验证工具`);

    console.log(`${emojis.time} 开始时间: ${colors.bright}${new Date().toLocaleString()}${colors.reset}`);
    console.log(`${emojis.info} 当前目录: ${colors.cyan}${process.cwd()}${colors.reset}\n`);

    try {
        // 1. 文件系统验证
        const fileVerifier = new FileVerifier(results);
        await fileVerifier.verify();

        // 2. 环境配置验证
        const envVerifier = new EnvironmentVerifier(results);
        await envVerifier.verify();

        // 3. 依赖包验证
        const depVerifier = new DependencyVerifier(results);
        await depVerifier.verify();

        // 4. 网络连接验证
        const netVerifier = new NetworkVerifier(results);
        await netVerifier.verify();

        // 5. 配置验证
        const configVerifier = new ConfigurationVerifier(results);
        await configVerifier.verify();

        // 6. 生成报告
        const isValid = generateReport(results);

        return { success: isValid, results };

    } catch (error) {
        console.error(`\n${colors.red}${emojis.bug} 验证过程中发生错误:${colors.reset}`);
        console.error(error);
        return { success: false, error: error.message };
    }
}

/**
 * 主函数
 */
async function main() {
    try {
        const result = await runVerification();
        
        console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
        
        if (result.success) {
            console.log(`${emojis.success} ${colors.green}${colors.bright}验证完成！设置正确${colors.reset}`);
            process.exit(0);
        } else {
            console.log(`${emojis.bug} ${colors.red}${colors.bright}验证失败！请修复问题后重试${colors.reset}`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error(`${colors.red}${emojis.bug} 验证工具执行失败: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// 模块导出
module.exports = {
    runVerification,
    VerificationResults,
    FileVerifier,
    EnvironmentVerifier,
    DependencyVerifier,
    NetworkVerifier,
    ConfigurationVerifier
};

// 直接运行检测
if (require.main === module) {
    main();
}