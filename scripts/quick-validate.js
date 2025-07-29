#!/usr/bin/env node

/**
 * MobiLiF 快速验证脚本
 * 
 * 执行基础的项目验证检查，适用于日常开发和快速检查
 * 相比完整验证，此脚本更快更轻量
 * 
 * 使用方法: npm run quick-validate 或 node scripts/quick-validate.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 控制台颜色
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m'
};

/**
 * 日志工具
 */
const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    section: (title) => {
        console.log(`\n${colors.cyan}${colors.bright}${title}${colors.reset}`);
        console.log(`${colors.cyan}${'─'.repeat(title.length)}${colors.reset}`);
    }
};

/**
 * 快速验证类
 */
class QuickValidator {
    constructor() {
        this.errors = 0;
        this.warnings = 0;
        this.checks = 0;
    }

    /**
     * 执行快速验证
     */
    async run() {
        console.log(`${colors.bright}🚀 MobiLiF 快速验证${colors.reset}\n`);

        try {
            // 检查核心文件
            await this.checkCoreFiles();

            // 检查脚本语法
            await this.checkScriptSyntax();

            // 检查模块导入
            await this.checkModuleImports();

            // 检查配置文件
            await this.checkConfigurations();

            // 显示结果
            this.showResults();

        } catch (error) {
            log.error(`验证过程出错: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * 检查核心文件是否存在
     */
    async checkCoreFiles() {
        log.section('核心文件检查');

        const coreFiles = [
            'package.json',
            'README.md',
            '.gitignore',
            'config/api.js',
            'config/api-client.js',
            'scripts/setup.js',
            'scripts/comprehensive-validation.js'
        ];

        for (const file of coreFiles) {
            this.checks++;
            if (fs.existsSync(file)) {
                log.success(`${file}`);
            } else {
                log.error(`${file} - 文件缺失`);
                this.errors++;
            }
        }
    }

    /**
     * 检查关键脚本语法
     */
    async checkScriptSyntax() {
        log.section('脚本语法检查');

        const scripts = [
            'config/api.js',
            'config/api-client.js',
            'scripts/setup.js'
        ];

        for (const script of scripts) {
            this.checks++;
            
            if (!fs.existsSync(script)) {
                log.warning(`${script} - 文件不存在，跳过检查`);
                this.warnings++;
                continue;
            }

            try {
                execSync(`node --check "${script}"`, { stdio: 'pipe' });
                log.success(`${script} - 语法正确`);
            } catch (error) {
                log.error(`${script} - 语法错误`);
                this.errors++;
            }
        }
    }

    /**
     * 检查模块导入
     */
    async checkModuleImports() {
        log.section('模块导入检查');

        const modules = [
            { name: 'API配置', path: '../config/api.js' },
            { name: 'API客户端', path: '../config/api-client.js' }
        ];

        for (const module of modules) {
            this.checks++;
            
            try {
                // 清除缓存
                const absolutePath = path.resolve(module.path);
                delete require.cache[absolutePath];

                // 尝试导入
                const imported = require(module.path);
                
                if (imported && typeof imported === 'object') {
                    log.success(`${module.name} - 导入成功`);
                } else {
                    log.warning(`${module.name} - 导入成功但结构异常`);
                    this.warnings++;
                }
            } catch (error) {
                log.error(`${module.name} - 导入失败: ${error.message}`);
                this.errors++;
            }
        }
    }

    /**
     * 检查配置文件
     */
    async checkConfigurations() {
        log.section('配置文件检查');

        // 检查 package.json
        this.checks++;
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            const requiredScripts = ['setup', 'validate', 'quick-test'];
            const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
            
            if (missingScripts.length === 0) {
                log.success('package.json - 脚本配置完整');
            } else {
                log.warning(`package.json - 缺少脚本: ${missingScripts.join(', ')}`);
                this.warnings++;
            }
        } catch (error) {
            log.error(`package.json - 读取失败: ${error.message}`);
            this.errors++;
        }

        // 检查环境文件
        this.checks++;
        if (fs.existsSync('.env.example')) {
            log.success('.env.example - 存在');
        } else {
            log.error('.env.example - 缺失');
            this.errors++;
        }

        this.checks++;
        if (fs.existsSync('.env.production')) {
            log.success('.env.production - 存在');
        } else {
            log.error('.env.production - 缺失');
            this.errors++;
        }
    }

    /**
     * 显示验证结果
     */
    showResults() {
        console.log(`\n${colors.bright}📊 验证结果${colors.reset}`);
        console.log(`${colors.cyan}${'─'.repeat(20)}${colors.reset}`);
        console.log(`总检查项: ${this.checks}`);
        console.log(`${colors.green}通过: ${this.checks - this.errors - this.warnings}${colors.reset}`);
        console.log(`${colors.yellow}警告: ${this.warnings}${colors.reset}`);
        console.log(`${colors.red}错误: ${this.errors}${colors.reset}`);

        // 整体状态
        let status, statusColor, statusIcon;
        
        if (this.errors > 0) {
            status = '失败';
            statusColor = colors.red;
            statusIcon = '❌';
        } else if (this.warnings > 0) {
            status = '警告';
            statusColor = colors.yellow;
            statusIcon = '⚠️';
        } else {
            status = '通过';
            statusColor = colors.green;
            statusIcon = '✅';
        }

        console.log(`\n${statusIcon} ${statusColor}状态: ${status}${colors.reset}`);

        // 建议
        if (this.errors > 0) {
            console.log(`\n${colors.bright}💡 建议:${colors.reset}`);
            console.log(`运行完整验证以获取详细信息: ${colors.cyan}npm run validate${colors.reset}`);
        }

        // 设置退出码
        if (this.errors > 0) {
            process.exit(1);
        }
    }
}

// 主函数
async function main() {
    const validator = new QuickValidator();
    await validator.run();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('快速验证失败:', error);
        process.exit(1);
    });
}

module.exports = QuickValidator;