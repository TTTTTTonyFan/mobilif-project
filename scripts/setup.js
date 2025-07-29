#!/usr/bin/env node

/**
 * MobiLiF 一键环境设置脚本
 * 自动化项目初始设置和配置
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

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
    rocket: '🚀',
    check: '✅',
    cross: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    gear: '⚙️',
    package: '📦',
    folder: '📁',
    file: '📄',
    database: '💾',
    network: '🌐',
    success: '🎉',
    time: '⏱️',
    star: '⭐',
    arrow: '➡️',
    lightning: '⚡',
    tools: '🛠️'
};

/**
 * 设置进度跟踪器
 */
class SetupProgress {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
        this.startTime = Date.now();
        this.stepStartTime = Date.now();
    }

    addStep(name, description) {
        this.steps.push({
            name,
            description,
            status: 'pending', // pending, running, completed, failed
            startTime: null,
            endTime: null,
            error: null
        });
    }

    startStep(index) {
        this.currentStep = index;
        this.steps[index].status = 'running';
        this.steps[index].startTime = Date.now();
        this.stepStartTime = Date.now();
    }

    completeStep(index, error = null) {
        this.steps[index].status = error ? 'failed' : 'completed';
        this.steps[index].endTime = Date.now();
        this.steps[index].error = error;
    }

    getProgress() {
        const completed = this.steps.filter(s => s.status === 'completed').length;
        return {
            completed,
            total: this.steps.length,
            percentage: Math.round((completed / this.steps.length) * 100)
        };
    }

    getTotalTime() {
        return Date.now() - this.startTime;
    }

    getStepTime() {
        return Date.now() - this.stepStartTime;
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

    step: (stepNumber, totalSteps, title, description) => {
        console.log(`\n${colors.blue}${colors.bright}[${stepNumber}/${totalSteps}] ${emojis.gear} ${title}${colors.reset}`);
        console.log(`${colors.cyan}${description}${colors.reset}`);
        console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);
    },

    progress: (current, total, percentage) => {
        const filled = Math.round(percentage / 5);
        const empty = 20 - filled;
        const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
        console.log(`${colors.cyan}进度: [${progressBar}] ${percentage}% (${current}/${total})${colors.reset}`);
    },

    success: (message, details = '') => {
        console.log(`${emojis.check} ${colors.green}${message}${colors.reset}`);
        if (details) {
            console.log(`   ${colors.cyan}${details}${colors.reset}`);
        }
    },

    error: (message, details = '') => {
        console.log(`${emojis.cross} ${colors.red}${message}${colors.reset}`);
        if (details) {
            console.log(`   ${colors.red}${details}${colors.reset}`);
        }
    },

    warning: (message, details = '') => {
        console.log(`${emojis.warning} ${colors.yellow}${message}${colors.reset}`);
        if (details) {
            console.log(`   ${colors.yellow}${details}${colors.reset}`);
        }
    },

    info: (message, details = '') => {
        console.log(`${emojis.info} ${colors.blue}${message}${colors.reset}`);
        if (details) {
            console.log(`   ${colors.cyan}${details}${colors.reset}`);
        }
    },

    divider: () => {
        console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    },

    box: (title, items, emoji = '') => {
        const header = emoji ? `${emoji} ${title}` : title;
        console.log(`\n${colors.cyan}┌─ ${header} ${'─'.repeat(Math.max(0, 50 - header.length))}┐${colors.reset}`);
        items.forEach(item => {
            const cleanItem = typeof item === 'string' ? item : item.toString();
            const paddingLength = Math.max(0, 55 - cleanItem.replace(/\x1b\[[0-9;]*m/g, '').length);
            console.log(`${colors.cyan}│${colors.reset} ${cleanItem}${' '.repeat(paddingLength)}${colors.cyan}│${colors.reset}`);
        });
        console.log(`${colors.cyan}└${'─'.repeat(57)}┘${colors.reset}\n`);
    }
};

/**
 * 依赖检查和安装器
 */
class DependencyManager {
    constructor() {
        this.requiredCommands = [
            { name: 'node', command: 'node --version', minVersion: '18.0.0' },
            { name: 'npm', command: 'npm --version', minVersion: '8.0.0' },
            { name: 'git', command: 'git --version', required: true }
        ];

        this.optionalCommands = [
            { name: 'docker', command: 'docker --version' },
            { name: 'docker-compose', command: 'docker-compose --version' }
        ];
    }

    async checkSystemDependencies() {
        display.info('检查系统依赖...');

        const results = { required: [], optional: [] };

        // 检查必需的命令
        for (const dep of this.requiredCommands) {
            try {
                const { stdout } = await execAsync(dep.command);
                const version = this.extractVersion(stdout);
                
                if (dep.minVersion && !this.isVersionSufficient(version, dep.minVersion)) {
                    results.required.push({
                        ...dep,
                        status: 'insufficient',
                        currentVersion: version,
                        message: `版本过低 (当前: ${version}, 需要: ${dep.minVersion}+)`
                    });
                } else {
                    results.required.push({
                        ...dep,
                        status: 'ok',
                        currentVersion: version,
                        message: `版本: ${version}`
                    });
                }
            } catch (error) {
                results.required.push({
                    ...dep,
                    status: 'missing',
                    message: '未安装'
                });
            }
        }

        // 检查可选的命令
        for (const dep of this.optionalCommands) {
            try {
                const { stdout } = await execAsync(dep.command);
                const version = this.extractVersion(stdout);
                results.optional.push({
                    ...dep,
                    status: 'ok',
                    currentVersion: version,
                    message: `版本: ${version}`
                });
            } catch (error) {
                results.optional.push({
                    ...dep,
                    status: 'missing',
                    message: '未安装 (可选)'
                });
            }
        }

        // 显示结果
        this.displayDependencyResults(results);

        // 检查是否有必需依赖缺失
        const missingRequired = results.required.filter(dep => 
            dep.status === 'missing' || dep.status === 'insufficient'
        );

        if (missingRequired.length > 0) {
            display.error('缺少必需的系统依赖');
            this.showInstallationInstructions(missingRequired);
            throw new Error('系统依赖检查失败');
        }

        return results;
    }

    extractVersion(output) {
        const versionMatch = output.match(/v?(\d+\.\d+\.\d+)/);
        return versionMatch ? versionMatch[1] : 'unknown';
    }

    isVersionSufficient(current, required) {
        if (current === 'unknown') return false;
        
        const currentParts = current.split('.').map(Number);
        const requiredParts = required.split('.').map(Number);
        
        for (let i = 0; i < 3; i++) {
            const currentPart = currentParts[i] || 0;
            const requiredPart = requiredParts[i] || 0;
            
            if (currentPart > requiredPart) return true;
            if (currentPart < requiredPart) return false;
        }
        
        return true; // 版本相等
    }

    displayDependencyResults(results) {
        console.log(`\n${emojis.package} 系统依赖检查结果:`);
        
        results.required.forEach(dep => {
            const emoji = dep.status === 'ok' ? emojis.check : emojis.cross;
            const color = dep.status === 'ok' ? colors.green : colors.red;
            console.log(`  ${emoji} ${color}${dep.name}${colors.reset}: ${dep.message}`);
        });

        if (results.optional.length > 0) {
            console.log(`\n  可选依赖:`);
            results.optional.forEach(dep => {
                const emoji = dep.status === 'ok' ? emojis.check : emojis.warning;
                const color = dep.status === 'ok' ? colors.green : colors.yellow;
                console.log(`  ${emoji} ${color}${dep.name}${colors.reset}: ${dep.message}`);
            });
        }
    }

    showInstallationInstructions(missingDeps) {
        display.box('安装指导', [
            '请安装以下必需的系统依赖:',
            '',
            ...missingDeps.map(dep => {
                switch (dep.name) {
                    case 'node':
                        return '• Node.js: https://nodejs.org/ (推荐 LTS 版本)';
                    case 'npm':
                        return '• npm: 通常与 Node.js 一起安装';
                    case 'git':
                        return '• Git: https://git-scm.com/downloads';
                    default:
                        return `• ${dep.name}: 请查看官方文档`;
                }
            }),
            '',
            '或使用包管理器安装 (macOS):',
            'brew install node git'
        ], emojis.tools);
    }

    async installProjectDependencies() {
        display.info('安装项目依赖包...');

        try {
            // 检查 package.json 是否存在
            const packageJsonPath = path.join(process.cwd(), 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                throw new Error('package.json 文件不存在');
            }

            // 检查是否已安装
            const nodeModulesPath = path.join(process.cwd(), 'node_modules');
            if (fs.existsSync(nodeModulesPath)) {
                display.info('检测到已有 node_modules，检查依赖完整性...');
                
                // 运行 npm ls 检查依赖
                try {
                    await execAsync('npm ls --depth=0 --production', { timeout: 30000 });
                    display.success('依赖包已正确安装');
                    return;
                } catch (error) {
                    display.warning('依赖不完整，重新安装...');
                }
            }

            // 安装依赖
            display.info('正在安装依赖包... (这可能需要几分钟)');
            
            await this.runCommandWithProgress('npm install', {
                timeout: 300000, // 5分钟超时
                cwd: process.cwd()
            });

            display.success('项目依赖安装完成');

            // 验证关键依赖
            await this.verifyKeyDependencies();

        } catch (error) {
            display.error('依赖安装失败', error.message);
            throw error;
        }
    }

    async runCommandWithProgress(command, options = {}) {
        return new Promise((resolve, reject) => {
            const child = spawn('sh', ['-c', command], {
                stdio: ['inherit', 'pipe', 'pipe'],
                ...options
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
                // 显示安装进度
                const output = data.toString();
                if (output.includes('added') || output.includes('updated')) {
                    process.stdout.write('.');
                }
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                console.log(); // 换行
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`命令执行失败 (退出码: ${code})\n${stderr}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    async verifyKeyDependencies() {
        const keyPackages = [
            '@nestjs/core',
            '@nestjs/common',
            'axios',
            'dotenv',
            'mysql2',
            'redis'
        ];

        display.info('验证关键依赖包...');

        for (const pkg of keyPackages) {
            const pkgPath = path.join(process.cwd(), 'node_modules', pkg);
            if (fs.existsSync(pkgPath)) {
                display.success(`${pkg} 安装正确`);
            } else {
                display.warning(`${pkg} 可能安装不完整`);
            }
        }
    }
}

/**
 * 环境配置管理器
 */
class EnvironmentManager {
    constructor() {
        this.envPath = path.join(process.cwd(), '.env');
        this.envExamplePath = path.join(process.cwd(), '.env.example');
    }

    async setupEnvironmentFile() {
        display.info('设置环境配置文件...');

        // 检查 .env 文件是否存在
        if (fs.existsSync(this.envPath)) {
            display.info('.env 文件已存在，检查配置...');
            return this.validateEnvironmentFile();
        }

        // 检查 .env.example 是否存在
        if (!fs.existsSync(this.envExamplePath)) {
            display.error('.env.example 文件不存在');
            throw new Error('缺少环境配置模板文件');
        }

        // 复制 .env.example 到 .env
        try {
            fs.copyFileSync(this.envExamplePath, this.envPath);
            display.success('.env 文件已创建');
            
            // 引导用户修改配置
            this.showConfigurationGuidance();
            
            return true;
        } catch (error) {
            display.error('创建 .env 文件失败', error.message);
            throw error;
        }
    }

    async validateEnvironmentFile() {
        display.info('验证环境配置...');

        try {
            // 重新载入环境变量
            require('dotenv').config({ path: this.envPath, override: true });

            const requiredVars = [
                'DB_HOST',
                'DB_USERNAME', 
                'DB_PASSWORD',
                'DB_DATABASE',
                'JWT_SECRET'
            ];

            const missingVars = [];
            const placeholderVars = [];

            for (const varName of requiredVars) {
                const value = process.env[varName];
                
                if (!value) {
                    missingVars.push(varName);
                } else if (this.isPlaceholderValue(value)) {
                    placeholderVars.push({ name: varName, value });
                }
            }

            // 显示验证结果
            if (missingVars.length === 0 && placeholderVars.length === 0) {
                display.success('环境配置验证通过');
            } else {
                if (missingVars.length > 0) {
                    display.warning(`缺少环境变量: ${missingVars.join(', ')}`);
                }
                
                if (placeholderVars.length > 0) {
                    display.warning('发现占位符值，需要手动配置:');
                    placeholderVars.forEach(({ name, value }) => {
                        console.log(`  • ${name}: ${value}`);
                    });
                }
                
                this.showConfigurationGuidance();
            }

            return true;

        } catch (error) {
            display.error('环境配置验证失败', error.message);
            throw error;
        }
    }

    isPlaceholderValue(value) {
        const placeholders = [
            'your-server-ip-or-domain',
            'your_password',
            'your_strong_password_here',
            'your-jwt-secret-key',
            'your-wechat-app-id'
        ];
        
        return placeholders.some(placeholder => 
            value.toLowerCase().includes(placeholder.toLowerCase())
        );
    }

    showConfigurationGuidance() {
        display.box('环境配置指导', [
            `${emojis.gear} 请编辑 .env 文件，配置以下重要参数:`,
            '',
            '1. 数据库配置:',
            '   DB_HOST=localhost           # 数据库地址',
            '   DB_USERNAME=mobilif_app     # 数据库用户名',
            '   DB_PASSWORD=strong_password # 数据库密码',
            '   DB_DATABASE=mobilif         # 数据库名称',
            '',
            '2. 安全配置:',
            '   JWT_SECRET=your-secret-key  # JWT密钥 (请设置强密钥)',
            '',
            '3. 服务器配置 (可选):',
            '   SERVER_HOST=localhost       # 服务器地址',
            '   SERVER_PORT=3000           # 服务器端口',
            '',
            '4. 微信配置 (可选):',
            '   WECHAT_APP_ID=wx...        # 微信小程序 AppID',
            '',
            `${emojis.warning} 生产环境部署时，请使用强密码和密钥！`
        ], emojis.file);
    }
}

/**
 * 目录结构管理器
 */
class DirectoryManager {
    constructor() {
        this.requiredDirectories = [
            { path: 'logs', description: '日志文件目录' },
            { path: 'uploads', description: '上传文件目录' },
            { path: 'temp', description: '临时文件目录' },
            { path: 'backups', description: '备份文件目录' },
            { path: 'data', description: '数据文件目录' },
            { path: 'certs', description: '证书文件目录' }
        ];
    }

    async createDirectories() {
        display.info('创建必要的目录结构...');

        let createdCount = 0;
        let existingCount = 0;

        for (const dir of this.requiredDirectories) {
            const dirPath = path.join(process.cwd(), dir.path);
            
            try {
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                    
                    // 设置适当的权限
                    if (process.platform !== 'win32') {
                        fs.chmodSync(dirPath, 0o755);
                    }
                    
                    // 创建 .gitkeep 文件以确保目录被 git 跟踪
                    const gitkeepPath = path.join(dirPath, '.gitkeep');
                    fs.writeFileSync(gitkeepPath, '# 保持目录结构\n');
                    
                    display.success(`创建目录: ${dir.path}/`, dir.description);
                    createdCount++;
                } else {
                    display.info(`目录已存在: ${dir.path}/`, dir.description);
                    existingCount++;
                }
            } catch (error) {
                display.error(`创建目录失败: ${dir.path}`, error.message);
                throw error;
            }
        }

        display.success(`目录结构检查完成`, `创建: ${createdCount}, 已存在: ${existingCount}`);
    }

    async createGitignoreIfNeeded() {
        const gitignorePath = path.join(process.cwd(), '.gitignore');
        
        if (!fs.existsSync(gitignorePath)) {
            display.info('创建 .gitignore 文件...');
            
            const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Build output
dist/
build/

# Temp directories
temp/
tmp/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/settings.json
.idea/
*.swp
*.swo

# Database
*.sqlite
*.db

# Uploads
uploads/*
!uploads/.gitkeep

# Backups
backups/*
!backups/.gitkeep

# Certificates
certs/*
!certs/.gitkeep
`;

            try {
                fs.writeFileSync(gitignorePath, gitignoreContent);
                display.success('.gitignore 文件已创建');
            } catch (error) {
                display.warning('创建 .gitignore 失败', error.message);
            }
        }
    }
}

/**
 * 测试运行器
 */
class TestRunner {
    async runInitialTests() {
        display.info('运行初始验证测试...');

        try {
            // 1. 验证项目设置
            await this.runSetupVerification();

            // 2. 测试基本功能
            await this.runBasicTests();

            display.success('初始测试完成');

        } catch (error) {
            display.warning('部分测试失败，但设置可以继续', error.message);
        }
    }

    async runSetupVerification() {
        try {
            // 检查 verify-setup.js 是否存在
            const verifyScriptPath = path.join(process.cwd(), 'scripts', 'verify-setup.js');
            
            if (fs.existsSync(verifyScriptPath)) {
                display.info('运行设置验证...');
                
                const { runVerification } = require('./verify-setup');
                const result = await runVerification();
                
                if (result.success) {
                    display.success('设置验证通过');
                } else {
                    display.warning('设置验证发现一些问题，但不影响基本功能');
                }
            } else {
                display.info('跳过设置验证 (验证脚本不存在)');
            }
        } catch (error) {
            display.warning('设置验证失败', error.message);
        }
    }

    async runBasicTests() {
        try {
            // 测试配置加载
            display.info('测试配置加载...');
            
            const configPath = path.join(process.cwd(), 'config', 'api.js');
            if (fs.existsSync(configPath)) {
                delete require.cache[require.resolve('../config/api')];
                const config = require('../config/api');
                
                if (config.PORT && config.api) {
                    display.success('配置加载测试通过');
                } else {
                    display.warning('配置加载不完整');
                }
            }

            // 测试重要模块导入
            display.info('测试模块导入...');
            
            const modules = [
                { path: '../config/api-client', name: 'API客户端' },
                { path: './test-remote-api', name: 'API测试工具' }
            ];

            for (const module of modules) {
                try {
                    const modulePath = path.join(process.cwd(), module.path.replace('../', ''));
                    if (fs.existsSync(modulePath + '.js')) {
                        require(module.path);
                        display.success(`${module.name} 导入成功`);
                    }
                } catch (error) {
                    display.warning(`${module.name} 导入失败`, error.message);
                }
            }

        } catch (error) {
            display.warning('基本测试失败', error.message);
        }
    }
}

/**
 * 设置完成指导
 */
class CompletionGuide {
    show() {
        display.divider();
        display.title(`${emojis.success} 设置完成！`);

        this.showNextSteps();
        this.showUsefulCommands();
        this.showResourceLinks();
        this.showTroubleshooting();
    }

    showNextSteps() {
        display.box('下一步操作', [
            `${emojis.gear} 1. 配置环境变量`,
            '   编辑 .env 文件，设置数据库和其他服务配置',
            '',
            `${emojis.database} 2. 设置数据库`,
            '   docker-compose up -d mysql  # 启动MySQL',
            '   npm run migration:run       # 运行数据库迁移',
            '',
            `${emojis.rocket} 3. 启动开发服务器`,
            '   npm run start:dev           # 启动开发模式',
            '',
            `${emojis.network} 4. 验证安装`,
            '   npm run quick-test          # 运行快速测试',
            '   npm run test:api            # 测试API连接'
        ], emojis.star);
    }

    showUsefulCommands() {
        display.box('常用命令', [
            '开发命令:',
            `  ${colors.cyan}npm run start:dev${colors.reset}        # 启动开发服务器`,
            `  ${colors.cyan}npm run build${colors.reset}            # 构建项目`,
            `  ${colors.cyan}npm test${colors.reset}                 # 运行测试`,
            '',
            '管理命令:',
            `  ${colors.cyan}npm run server:status${colors.reset}    # 查看服务器状态`,
            `  ${colors.cyan}npm run server:logs${colors.reset}      # 查看服务器日志`,
            `  ${colors.cyan}npm run server:deploy${colors.reset}    # 部署到服务器`,
            '',
            '工具命令:',
            `  ${colors.cyan}npm run quick-test${colors.reset}       # 快速功能测试`,
            `  ${colors.cyan}npm run test:api${colors.reset}         # API连接测试`,
            `  ${colors.cyan}node scripts/verify-setup.js${colors.reset} # 验证设置`
        ], emojis.tools);
    }

    showResourceLinks() {
        display.box('文档和资源', [
            `${emojis.file} 本地开发指南: docs/local-development.md`,
            `${emojis.file} API文档: API接口文档.md`,
            `${emojis.file} 数据库设计: 数据库设计文档.md`,
            `${emojis.file} 技术架构: MobiLiF技术架构详细设计.md`,
            '',
            `${emojis.network} 在线资源:`,
            '  • API文档: http://localhost:3000/api/docs (启动后访问)',
            '  • 健康检查: http://localhost:3000/health',
            '',
            `${emojis.info} 获取帮助:`,
            '  • GitHub Issues: 报告问题和获取支持',
            '  • 项目文档: 查看 docs/ 目录下的详细文档'
        ], emojis.info);
    }

    showTroubleshooting() {
        display.box('常见问题解决', [
            `${emojis.warning} 端口占用问题:`,
            '  lsof -i :3000               # 查看端口占用',
            '  kill -9 <PID>               # 终止占用进程',
            '',
            `${emojis.warning} 数据库连接问题:`,
            '  docker-compose up -d mysql  # 启动数据库',
            '  npm run server:status       # 检查服务状态',
            '',
            `${emojis.warning} 依赖问题:`,
            '  rm -rf node_modules         # 清理依赖',
            '  npm install                 # 重新安装',
            '',
            `${emojis.warning} 权限问题:`,
            '  sudo chown -R $(whoami) .   # 修复文件权限',
            '  chmod +x scripts/*.sh       # 设置脚本权限'
        ], emojis.warning);
    }
}

/**
 * 主设置函数
 */
async function runSetup() {
    const progress = new SetupProgress();

    // 定义设置步骤
    progress.addStep('dependencies', '检查系统依赖');
    progress.addStep('packages', '安装项目依赖');
    progress.addStep('environment', '配置环境文件');
    progress.addStep('directories', '创建目录结构');
    progress.addStep('tests', '运行初始测试');

    display.title(`${emojis.rocket} MobiLiF 一键环境设置`);
    
    console.log(`${emojis.time} 开始时间: ${colors.bright}${new Date().toLocaleString()}${colors.reset}`);
    console.log(`${emojis.info} 项目目录: ${colors.cyan}${process.cwd()}${colors.reset}\n`);

    try {
        // 步骤 1: 检查系统依赖
        const stepIndex = 0;
        display.step(stepIndex + 1, progress.steps.length, progress.steps[stepIndex].name, progress.steps[stepIndex].description);
        progress.startStep(stepIndex);

        const depManager = new DependencyManager();
        await depManager.checkSystemDependencies();
        
        progress.completeStep(stepIndex);
        display.success('系统依赖检查完成', `耗时: ${(progress.getStepTime() / 1000).toFixed(1)}秒`);

        // 步骤 2: 安装项目依赖
        const step2Index = 1;
        display.step(step2Index + 1, progress.steps.length, progress.steps[step2Index].name, progress.steps[step2Index].description);
        progress.startStep(step2Index);

        await depManager.installProjectDependencies();
        
        progress.completeStep(step2Index);
        display.success('项目依赖安装完成', `耗时: ${(progress.getStepTime() / 1000).toFixed(1)}秒`);

        // 步骤 3: 配置环境文件
        const step3Index = 2;
        display.step(step3Index + 1, progress.steps.length, progress.steps[step3Index].name, progress.steps[step3Index].description);
        progress.startStep(step3Index);

        const envManager = new EnvironmentManager();
        await envManager.setupEnvironmentFile();
        
        progress.completeStep(step3Index);
        display.success('环境配置完成', `耗时: ${(progress.getStepTime() / 1000).toFixed(1)}秒`);

        // 步骤 4: 创建目录结构
        const step4Index = 3;
        display.step(step4Index + 1, progress.steps.length, progress.steps[step4Index].name, progress.steps[step4Index].description);
        progress.startStep(step4Index);

        const dirManager = new DirectoryManager();
        await dirManager.createDirectories();
        await dirManager.createGitignoreIfNeeded();
        
        progress.completeStep(step4Index);
        display.success('目录结构创建完成', `耗时: ${(progress.getStepTime() / 1000).toFixed(1)}秒`);

        // 步骤 5: 运行初始测试
        const step5Index = 4;
        display.step(step5Index + 1, progress.steps.length, progress.steps[step5Index].name, progress.steps[step5Index].description);
        progress.startStep(step5Index);

        const testRunner = new TestRunner();
        await testRunner.runInitialTests();
        
        progress.completeStep(step5Index);
        display.success('初始测试完成', `耗时: ${(progress.getStepTime() / 1000).toFixed(1)}秒`);

        // 显示最终进度
        const finalProgress = progress.getProgress();
        display.progress(finalProgress.completed, finalProgress.total, finalProgress.percentage);

        // 显示设置完成指导
        const guide = new CompletionGuide();
        guide.show();

        return {
            success: true,
            totalTime: progress.getTotalTime(),
            steps: progress.steps
        };

    } catch (error) {
        progress.completeStep(progress.currentStep, error);
        
        display.error('设置过程中发生错误', error.message);
        display.info('部分设置可能已完成，你可以手动完成剩余步骤');
        
        // 显示已完成的步骤
        const completedSteps = progress.steps.filter(s => s.status === 'completed');
        if (completedSteps.length > 0) {
            display.info(`已完成的步骤: ${completedSteps.map(s => s.name).join(', ')}`);
        }

        return {
            success: false,
            error: error.message,
            totalTime: progress.getTotalTime(),
            steps: progress.steps
        };
    }
}

/**
 * 主函数
 */
async function main() {
    try {
        const result = await runSetup();
        
        console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
        
        if (result.success) {
            console.log(`${emojis.success} ${colors.green}${colors.bright}环境设置完成！总耗时: ${(result.totalTime / 1000).toFixed(1)}秒${colors.reset}`);
            console.log(`${emojis.arrow} ${colors.cyan}现在可以开始开发了！运行 npm run start:dev 启动开发服务器${colors.reset}`);
            process.exit(0);
        } else {
            console.log(`${emojis.warning} ${colors.yellow}${colors.bright}环境设置未完全完成，请查看上方错误信息${colors.reset}`);
            console.log(`${emojis.info} ${colors.cyan}你可以手动完成剩余步骤，或重新运行此脚本${colors.reset}`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error(`${colors.red}${emojis.cross} 设置脚本执行失败: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// 模块导出
module.exports = {
    runSetup,
    DependencyManager,
    EnvironmentManager,
    DirectoryManager,
    TestRunner,
    CompletionGuide
};

// 直接运行检测
if (require.main === module) {
    main();
}