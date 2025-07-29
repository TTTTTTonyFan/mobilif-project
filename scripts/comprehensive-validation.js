#!/usr/bin/env node

/**
 * MobiLiF 项目完整验证流程
 * 
 * 此脚本执行全面的项目验证，包括：
 * 1. 文件结构验证
 * 2. 语法错误检查
 * 3. 模块导入测试
 * 4. 配置文件格式验证
 * 5. 生成详细验证报告
 * 
 * 使用方法: npm run validate 或 node scripts/comprehensive-validation.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const util = require('util');

// 控制台颜色常量
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bg_red: '\x1b[41m',
    bg_green: '\x1b[42m',
    bg_yellow: '\x1b[43m'
};

/**
 * 日志工具类
 */
class Logger {
    static info(message, prefix = 'INFO') {
        console.log(`${colors.blue}[${prefix}]${colors.reset} ${message}`);
    }

    static success(message, prefix = 'SUCCESS') {
        console.log(`${colors.green}[${prefix}]${colors.reset} ${message}`);
    }

    static warning(message, prefix = 'WARNING') {
        console.log(`${colors.yellow}[${prefix}]${colors.reset} ${message}`);
    }

    static error(message, prefix = 'ERROR') {
        console.log(`${colors.red}[${prefix}]${colors.reset} ${message}`);
    }

    static debug(message, prefix = 'DEBUG') {
        if (process.env.DEBUG === 'true') {
            console.log(`${colors.dim}[${prefix}]${colors.reset} ${message}`);
        }
    }

    static section(title) {
        const line = '='.repeat(60);
        console.log(`\n${colors.cyan}${line}${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright} ${title} ${colors.reset}`);
        console.log(`${colors.cyan}${line}${colors.reset}\n`);
    }

    static subsection(title) {
        console.log(`\n${colors.magenta}${colors.bright}── ${title} ──${colors.reset}\n`);
    }
}

/**
 * 验证结果类
 */
class ValidationResult {
    constructor() {
        this.results = [];
        this.summary = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            startTime: new Date(),
            endTime: null
        };
    }

    addResult(category, name, status, message, details = null) {
        const result = {
            category,
            name,
            status, // 'pass', 'fail', 'warning'
            message,
            details,
            timestamp: new Date()
        };

        this.results.push(result);
        this.summary.total++;

        switch (status) {
            case 'pass':
                this.summary.passed++;
                break;
            case 'fail':
                this.summary.failed++;
                break;
            case 'warning':
                this.summary.warnings++;
                break;
        }
    }

    finalize() {
        this.summary.endTime = new Date();
        this.summary.duration = this.summary.endTime - this.summary.startTime;
    }

    getOverallStatus() {
        if (this.summary.failed > 0) return 'FAILED';
        if (this.summary.warnings > 0) return 'WARNING';
        return 'PASSED';
    }
}

/**
 * 文件结构验证器
 */
class FileStructureValidator {
    constructor() {
        // 定义必需的文件和目录结构
        this.requiredStructure = {
            files: [
                'package.json',
                'README.md',
                '.gitignore',
                '.env.example',
                'docker-compose.yml',
                'Dockerfile'
            ],
            directories: [
                'scripts',
                'config',
                'docs',
                'scripts/deployment'
            ],
            scriptFiles: [
                'scripts/server-manager.js',
                'scripts/test-remote-api.js',
                'scripts/quick-test.js',
                'scripts/setup.js',
                'scripts/verify-setup.js',
                'scripts/deployment/deploy.sh',
                'scripts/deployment/server-init.sh',
                'scripts/deployment/database-setup.sh'
            ],
            configFiles: [
                'config/api.js',
                'config/api-client.js',
                '.env.production'
            ],
            docFiles: [
                'docs/local-development.md'
            ]
        };
    }

    async validate(result) {
        Logger.subsection('文件结构验证');

        const projectRoot = process.cwd();

        // 验证基础文件
        await this.validateFiles(result, projectRoot, this.requiredStructure.files, '基础文件');
        
        // 验证目录结构
        await this.validateDirectories(result, projectRoot, this.requiredStructure.directories, '目录结构');
        
        // 验证脚本文件
        await this.validateFiles(result, projectRoot, this.requiredStructure.scriptFiles, '脚本文件');
        
        // 验证配置文件
        await this.validateFiles(result, projectRoot, this.requiredStructure.configFiles, '配置文件');
        
        // 验证文档文件
        await this.validateFiles(result, projectRoot, this.requiredStructure.docFiles, '文档文件');

        // 验证文件权限
        await this.validatePermissions(result, projectRoot);
    }

    async validateFiles(result, projectRoot, files, category) {
        for (const file of files) {
            const filePath = path.join(projectRoot, file);
            
            try {
                const stats = fs.statSync(filePath);
                
                if (stats.isFile()) {
                    result.addResult('文件结构', `${category}: ${file}`, 'pass', '文件存在且可访问');
                    Logger.success(`✓ ${file}`);
                } else {
                    result.addResult('文件结构', `${category}: ${file}`, 'fail', '路径存在但不是文件');
                    Logger.error(`✗ ${file} - 不是文件`);
                }
            } catch (error) {
                result.addResult('文件结构', `${category}: ${file}`, 'fail', `文件不存在: ${error.message}`);
                Logger.error(`✗ ${file} - 文件不存在`);
            }
        }
    }

    async validateDirectories(result, projectRoot, directories, category) {
        for (const dir of directories) {
            const dirPath = path.join(projectRoot, dir);
            
            try {
                const stats = fs.statSync(dirPath);
                
                if (stats.isDirectory()) {
                    result.addResult('文件结构', `${category}: ${dir}`, 'pass', '目录存在且可访问');
                    Logger.success(`✓ ${dir}/`);
                } else {
                    result.addResult('文件结构', `${category}: ${dir}`, 'fail', '路径存在但不是目录');
                    Logger.error(`✗ ${dir}/ - 不是目录`);
                }
            } catch (error) {
                result.addResult('文件结构', `${category}: ${dir}`, 'fail', `目录不存在: ${error.message}`);
                Logger.error(`✗ ${dir}/ - 目录不存在`);
            }
        }
    }

    async validatePermissions(result, projectRoot) {
        const executableFiles = [
            'scripts/deployment/deploy.sh',
            'scripts/deployment/server-init.sh', 
            'scripts/deployment/database-setup.sh'
        ];

        Logger.info('检查脚本文件执行权限...');

        for (const file of executableFiles) {
            const filePath = path.join(projectRoot, file);
            
            try {
                fs.accessSync(filePath, fs.constants.F_OK);
                
                const stats = fs.statSync(filePath);
                const mode = stats.mode;
                const isExecutable = !!(mode & parseInt('111', 8));
                
                if (isExecutable) {
                    result.addResult('文件权限', file, 'pass', '脚本文件具有执行权限');
                    Logger.success(`✓ ${file} - 可执行`);
                } else {
                    result.addResult('文件权限', file, 'warning', '脚本文件缺少执行权限');
                    Logger.warning(`⚠ ${file} - 缺少执行权限，可运行: chmod +x ${file}`);
                }
            } catch (error) {
                result.addResult('文件权限', file, 'fail', `无法检查权限: ${error.message}`);
                Logger.error(`✗ ${file} - 权限检查失败`);
            }
        }
    }
}

/**
 * 语法错误检查器
 */
class SyntaxValidator {
    constructor() {
        this.jsFiles = [];
        this.jsonFiles = [];
        this.shFiles = [];
    }

    async validate(result) {
        Logger.subsection('语法错误检查');

        // 收集需要检查的文件
        await this.collectFiles();

        // 检查 JavaScript 文件
        await this.validateJavaScriptFiles(result);

        // 检查 JSON 文件
        await this.validateJsonFiles(result);

        // 检查 Shell 脚本文件
        await this.validateShellFiles(result);
    }

    async collectFiles() {
        const projectRoot = process.cwd();
        
        // JavaScript 文件
        this.jsFiles = [
            'config/api.js',
            'config/api-client.js',
            'scripts/server-manager.js',
            'scripts/test-remote-api.js',
            'scripts/quick-test.js',
            'scripts/setup.js',
            'scripts/verify-setup.js'
        ].map(file => path.join(projectRoot, file));

        // JSON 文件
        this.jsonFiles = [
            'package.json'
        ].map(file => path.join(projectRoot, file));

        // Shell 脚本文件
        this.shFiles = [
            'scripts/deployment/deploy.sh',
            'scripts/deployment/server-init.sh',
            'scripts/deployment/database-setup.sh'
        ].map(file => path.join(projectRoot, file));
    }

    async validateJavaScriptFiles(result) {
        Logger.info('检查 JavaScript 文件语法...');

        for (const filePath of this.jsFiles) {
            const fileName = path.basename(filePath);
            
            try {
                if (!fs.existsSync(filePath)) {
                    result.addResult('JavaScript语法', fileName, 'warning', '文件不存在，跳过检查');
                    Logger.warning(`⚠ ${fileName} - 文件不存在`);
                    continue;
                }

                // 使用 Node.js 检查语法
                execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
                result.addResult('JavaScript语法', fileName, 'pass', '语法正确');
                Logger.success(`✓ ${fileName} - 语法正确`);

            } catch (error) {
                const errorMessage = error.stderr ? error.stderr.toString() : error.message;
                result.addResult('JavaScript语法', fileName, 'fail', `语法错误: ${errorMessage}`);
                Logger.error(`✗ ${fileName} - 语法错误`);
                Logger.error(`  ${errorMessage.trim()}`);
            }
        }
    }

    async validateJsonFiles(result) {
        Logger.info('检查 JSON 文件格式...');

        for (const filePath of this.jsonFiles) {
            const fileName = path.basename(filePath);
            
            try {
                if (!fs.existsSync(filePath)) {
                    result.addResult('JSON格式', fileName, 'warning', '文件不存在，跳过检查');
                    Logger.warning(`⚠ ${fileName} - 文件不存在`);
                    continue;
                }

                const content = fs.readFileSync(filePath, 'utf8');
                JSON.parse(content);
                
                result.addResult('JSON格式', fileName, 'pass', 'JSON格式正确');
                Logger.success(`✓ ${fileName} - JSON格式正确`);

            } catch (error) {
                result.addResult('JSON格式', fileName, 'fail', `JSON格式错误: ${error.message}`);
                Logger.error(`✗ ${fileName} - JSON格式错误`);
                Logger.error(`  ${error.message}`);
            }
        }
    }

    async validateShellFiles(result) {
        Logger.info('检查 Shell 脚本语法...');

        for (const filePath of this.shFiles) {
            const fileName = path.basename(filePath);
            
            try {
                if (!fs.existsSync(filePath)) {
                    result.addResult('Shell语法', fileName, 'warning', '文件不存在，跳过检查');
                    Logger.warning(`⚠ ${fileName} - 文件不存在`);
                    continue;
                }

                // 使用 bash -n 检查语法
                execSync(`bash -n "${filePath}"`, { stdio: 'pipe' });
                result.addResult('Shell语法', fileName, 'pass', 'Shell语法正确');
                Logger.success(`✓ ${fileName} - Shell语法正确`);

            } catch (error) {
                const errorMessage = error.stderr ? error.stderr.toString() : error.message;
                result.addResult('Shell语法', fileName, 'fail', `Shell语法错误: ${errorMessage}`);
                Logger.error(`✗ ${fileName} - Shell语法错误`);
                Logger.error(`  ${errorMessage.trim()}`);
            }
        }
    }
}

/**
 * 模块导入测试器
 */
class ModuleImportValidator {
    async validate(result) {
        Logger.subsection('模块导入测试');

        const modules = [
            { name: 'API配置', path: '../config/api.js' },
            { name: 'API客户端', path: '../config/api-client.js' },
            { name: '服务器管理器', path: './server-manager.js' }
        ];

        for (const module of modules) {
            await this.testModuleImport(result, module.name, module.path);
        }
    }

    async testModuleImport(result, moduleName, modulePath) {
        try {
            // 清除缓存以确保重新加载
            const absolutePath = path.resolve(modulePath);
            delete require.cache[absolutePath];

            // 尝试导入模块
            const importedModule = require(modulePath);
            
            // 基本验证
            if (importedModule && typeof importedModule === 'object') {
                result.addResult('模块导入', moduleName, 'pass', '模块导入成功');
                Logger.success(`✓ ${moduleName} - 导入成功`);
                
                // 记录导出的主要属性
                const exportedKeys = Object.keys(importedModule);
                Logger.debug(`  导出属性: ${exportedKeys.join(', ')}`);
                
            } else {
                result.addResult('模块导入', moduleName, 'warning', '模块导入成功但结构可能不正确');
                Logger.warning(`⚠ ${moduleName} - 导入成功但结构异常`);
            }

        } catch (error) {
            result.addResult('模块导入', moduleName, 'fail', `模块导入失败: ${error.message}`);
            Logger.error(`✗ ${moduleName} - 导入失败`);
            Logger.error(`  ${error.message}`);
        }
    }
}

/**
 * 配置文件格式验证器
 */
class ConfigValidator {
    async validate(result) {
        Logger.subsection('配置文件格式验证');

        // 验证 package.json
        await this.validatePackageJson(result);

        // 验证环境配置文件
        await this.validateEnvFiles(result);

        // 验证 Docker 配置
        await this.validateDockerFiles(result);

        // 验证 API 配置
        await this.validateApiConfig(result);
    }

    async validatePackageJson(result) {
        const filePath = path.join(process.cwd(), 'package.json');
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const packageJson = JSON.parse(content);

            // 检查必需字段
            const requiredFields = ['name', 'version', 'description', 'scripts', 'dependencies'];
            const missingFields = requiredFields.filter(field => !packageJson[field]);

            if (missingFields.length === 0) {
                result.addResult('配置验证', 'package.json', 'pass', '包含所有必需字段');
                Logger.success('✓ package.json - 格式正确');
            } else {
                result.addResult('配置验证', 'package.json', 'warning', `缺少字段: ${missingFields.join(', ')}`);
                Logger.warning(`⚠ package.json - 缺少字段: ${missingFields.join(', ')}`);
            }

            // 检查脚本命令
            const expectedScripts = ['setup', 'verify', 'quick-test', 'server:deploy'];
            const missingScripts = expectedScripts.filter(script => !packageJson.scripts[script]);

            if (missingScripts.length === 0) {
                result.addResult('配置验证', 'package.json scripts', 'pass', '包含所有预期脚本');
                Logger.success('✓ package.json scripts - 完整');
            } else {
                result.addResult('配置验证', 'package.json scripts', 'warning', `缺少脚本: ${missingScripts.join(', ')}`);
                Logger.warning(`⚠ package.json scripts - 缺少: ${missingScripts.join(', ')}`);
            }

        } catch (error) {
            result.addResult('配置验证', 'package.json', 'fail', `验证失败: ${error.message}`);
            Logger.error(`✗ package.json - 验证失败: ${error.message}`);
        }
    }

    async validateEnvFiles(result) {
        const envFiles = [
            { name: '.env.example', required: true },
            { name: '.env.production', required: true },
            { name: '.env', required: false }
        ];

        for (const envFile of envFiles) {
            const filePath = path.join(process.cwd(), envFile.name);
            
            try {
                if (!fs.existsSync(filePath)) {
                    if (envFile.required) {
                        result.addResult('环境配置', envFile.name, 'fail', '必需的环境文件不存在');
                        Logger.error(`✗ ${envFile.name} - 文件不存在`);
                    } else {
                        result.addResult('环境配置', envFile.name, 'warning', '可选的环境文件不存在');
                        Logger.warning(`⚠ ${envFile.name} - 文件不存在（可选）`);
                    }
                    continue;
                }

                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
                
                // 检查基本的环境变量格式
                let validLines = 0;
                let invalidLines = 0;

                for (const line of lines) {
                    if (line.includes('=')) {
                        validLines++;
                    } else {
                        invalidLines++;
                    }
                }

                if (invalidLines === 0) {
                    result.addResult('环境配置', envFile.name, 'pass', `格式正确，包含 ${validLines} 个变量`);
                    Logger.success(`✓ ${envFile.name} - 格式正确 (${validLines} 变量)`);
                } else {
                    result.addResult('环境配置', envFile.name, 'warning', `格式可能有问题，${invalidLines} 行格式异常`);
                    Logger.warning(`⚠ ${envFile.name} - ${invalidLines} 行格式异常`);
                }

            } catch (error) {
                result.addResult('环境配置', envFile.name, 'fail', `验证失败: ${error.message}`);
                Logger.error(`✗ ${envFile.name} - 验证失败: ${error.message}`);
            }
        }
    }

    async validateDockerFiles(result) {
        const dockerFiles = ['Dockerfile', 'docker-compose.yml'];

        for (const dockerFile of dockerFiles) {
            const filePath = path.join(process.cwd(), dockerFile);
            
            try {
                if (!fs.existsSync(filePath)) {
                    result.addResult('Docker配置', dockerFile, 'fail', 'Docker配置文件不存在');
                    Logger.error(`✗ ${dockerFile} - 文件不存在`);
                    continue;
                }

                const content = fs.readFileSync(filePath, 'utf8');
                
                if (content.trim().length === 0) {
                    result.addResult('Docker配置', dockerFile, 'fail', 'Docker配置文件为空');
                    Logger.error(`✗ ${dockerFile} - 文件为空`);
                } else {
                    result.addResult('Docker配置', dockerFile, 'pass', 'Docker配置文件存在且不为空');
                    Logger.success(`✓ ${dockerFile} - 配置正常`);
                }

            } catch (error) {
                result.addResult('Docker配置', dockerFile, 'fail', `验证失败: ${error.message}`);
                Logger.error(`✗ ${dockerFile} - 验证失败: ${error.message}`);
            }
        }
    }

    async validateApiConfig(result) {
        try {
            // 验证 API 配置文件
            const apiConfigPath = path.join(process.cwd(), 'config/api.js');
            
            if (!fs.existsSync(apiConfigPath)) {
                result.addResult('API配置', 'config/api.js', 'fail', 'API配置文件不存在');
                Logger.error('✗ config/api.js - 文件不存在');
                return;
            }

            delete require.cache[path.resolve(apiConfigPath)];
            const apiConfig = require(apiConfigPath);

            // 检查必需的配置项
            const requiredKeys = ['api', 'server', 'jwt'];
            const missingKeys = requiredKeys.filter(key => !apiConfig[key]);

            if (missingKeys.length === 0) {
                result.addResult('API配置', 'config/api.js', 'pass', 'API配置结构正确');
                Logger.success('✓ config/api.js - 配置结构正确');
            } else {
                result.addResult('API配置', 'config/api.js', 'warning', `缺少配置项: ${missingKeys.join(', ')}`);
                Logger.warning(`⚠ config/api.js - 缺少配置项: ${missingKeys.join(', ')}`);
            }

            // 检查配置完整性
            if (apiConfig.configs && typeof apiConfig.configs === 'object') {
                result.addResult('API配置', 'config/api.js 环境配置', 'pass', '环境配置完整');
                Logger.success('✓ config/api.js - 环境配置完整');
            } else {
                result.addResult('API配置', 'config/api.js 环境配置', 'warning', '环境配置不完整');
                Logger.warning('⚠ config/api.js - 环境配置不完整');
            }

        } catch (error) {
            result.addResult('API配置', 'config/api.js', 'fail', `配置验证失败: ${error.message}`);
            Logger.error(`✗ config/api.js - 验证失败: ${error.message}`);
        }
    }
}

/**
 * 报告生成器
 */
class ReportGenerator {
    async generate(result) {
        Logger.section('生成验证报告');

        result.finalize();

        // 生成控制台报告
        this.generateConsoleReport(result);

        // 生成文件报告
        await this.generateFileReport(result);

        return result.getOverallStatus();
    }

    generateConsoleReport(result) {
        const { summary } = result;

        // 打印总结
        console.log(`\n${colors.bright}📊 验证结果总结${colors.reset}`);
        console.log(`${colors.dim}${'─'.repeat(40)}${colors.reset}`);
        console.log(`总计检查: ${colors.white}${summary.total}${colors.reset}`);
        console.log(`通过: ${colors.green}${summary.passed}${colors.reset}`);
        console.log(`失败: ${colors.red}${summary.failed}${colors.reset}`);
        console.log(`警告: ${colors.yellow}${summary.warnings}${colors.reset}`);
        console.log(`耗时: ${colors.cyan}${summary.duration}ms${colors.reset}`);

        // 整体状态
        const overallStatus = result.getOverallStatus();
        let statusColor = colors.green;
        let statusIcon = '✅';

        if (overallStatus === 'FAILED') {
            statusColor = colors.red;
            statusIcon = '❌';
        } else if (overallStatus === 'WARNING') {
            statusColor = colors.yellow;
            statusIcon = '⚠️';
        }

        console.log(`\n${statusIcon} ${statusColor}整体状态: ${overallStatus}${colors.reset}\n`);

        // 显示失败和警告的详细信息
        const failures = result.results.filter(r => r.status === 'fail');
        const warnings = result.results.filter(r => r.status === 'warning');

        if (failures.length > 0) {
            console.log(`${colors.red}${colors.bright}❌ 失败项目:${colors.reset}`);
            failures.forEach(failure => {
                console.log(`  ${colors.red}•${colors.reset} ${failure.category} - ${failure.name}`);
                console.log(`    ${colors.dim}${failure.message}${colors.reset}`);
            });
            console.log('');
        }

        if (warnings.length > 0) {
            console.log(`${colors.yellow}${colors.bright}⚠️  警告项目:${colors.reset}`);
            warnings.forEach(warning => {
                console.log(`  ${colors.yellow}•${colors.reset} ${warning.category} - ${warning.name}`);
                console.log(`    ${colors.dim}${warning.message}${colors.reset}`);
            });
            console.log('');
        }

        // 建议
        this.generateSuggestions(result);
    }

    generateSuggestions(result) {
        const failures = result.results.filter(r => r.status === 'fail');
        const warnings = result.results.filter(r => r.status === 'warning');

        if (failures.length > 0 || warnings.length > 0) {
            console.log(`${colors.bright}💡 建议修复步骤:${colors.reset}`);

            // 权限问题
            const permissionIssues = result.results.filter(r => 
                r.category === '文件权限' && r.status === 'warning'
            );
            if (permissionIssues.length > 0) {
                console.log(`  ${colors.cyan}1.${colors.reset} 修复脚本执行权限:`);
                permissionIssues.forEach(issue => {
                    console.log(`     ${colors.dim}chmod +x ${issue.name}${colors.reset}`);
                });
            }

            // 文件缺失
            const missingFiles = result.results.filter(r => 
                r.category === '文件结构' && r.status === 'fail' && r.message.includes('不存在')
            );
            if (missingFiles.length > 0) {
                console.log(`  ${colors.cyan}2.${colors.reset} 创建缺失的文件:`);
                missingFiles.forEach(issue => {
                    console.log(`     ${colors.dim}创建 ${issue.name.split(': ')[1]}${colors.reset}`);
                });
            }

            // 语法错误
            const syntaxErrors = result.results.filter(r => 
                r.status === 'fail' && r.message.includes('语法')
            );
            if (syntaxErrors.length > 0) {
                console.log(`  ${colors.cyan}3.${colors.reset} 修复语法错误:`);
                console.log(`     ${colors.dim}检查并修复标记的语法问题${colors.reset}`);
            }

            console.log('');
        }
    }

    async generateFileReport(result) {
        const reportPath = path.join(process.cwd(), 'validation-report.json');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: result.summary,
            overallStatus: result.getOverallStatus(),
            results: result.results,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                cwd: process.cwd()
            }
        };

        try {
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
            Logger.success(`验证报告已保存到: ${reportPath}`);
        } catch (error) {
            Logger.error(`无法保存报告文件: ${error.message}`);
        }
    }
}

/**
 * 主验证器类
 */
class ComprehensiveValidator {
    constructor() {
        this.result = new ValidationResult();
        this.validators = [
            new FileStructureValidator(),
            new SyntaxValidator(),
            new ModuleImportValidator(),
            new ConfigValidator()
        ];
        this.reportGenerator = new ReportGenerator();
    }

    async run() {
        try {
            Logger.section('🔍 MobiLiF 项目完整验证');
            Logger.info(`开始时间: ${new Date().toLocaleString()}`);
            Logger.info(`项目目录: ${process.cwd()}`);

            // 运行所有验证器
            for (const validator of this.validators) {
                await validator.validate(this.result);
            }

            // 生成报告
            const overallStatus = await this.reportGenerator.generate(this.result);

            // 设置退出码
            if (overallStatus === 'FAILED') {
                process.exit(1);
            } else if (overallStatus === 'WARNING') {
                process.exit(0); // 警告不影响成功状态
            } else {
                process.exit(0);
            }

        } catch (error) {
            Logger.error(`验证过程发生错误: ${error.message}`);
            console.error(error.stack);
            process.exit(1);
        }
    }
}

// 主函数
async function main() {
    // 设置调试模式
    if (process.argv.includes('--debug')) {
        process.env.DEBUG = 'true';
    }

    const validator = new ComprehensiveValidator();
    await validator.run();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('未捕获的错误:', error);
        process.exit(1);
    });
}

module.exports = {
    ComprehensiveValidator,
    FileStructureValidator,
    SyntaxValidator,
    ModuleImportValidator,
    ConfigValidator,
    ReportGenerator,
    ValidationResult
};