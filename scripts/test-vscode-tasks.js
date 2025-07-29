#!/usr/bin/env node

/**
 * VSCode任务配置测试脚本
 * 
 * 功能：
 * 1. 验证VSCode配置文件结构和语法
 * 2. 测试每个任务的npm脚本是否存在
 * 3. 验证调试配置是否正确
 * 4. 生成详细的测试报告
 * 
 * 作者：MobiLiF项目组
 * 日期：2025-07-28
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 彩色输出配置
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

// 图标配置
const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  test: '🧪',
  config: '⚙️',
  task: '📋',
  debug: '🐛'
};

class VSCodeTaskValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.vscodeDir = path.join(this.projectRoot, '.vscode');
    this.tasksFile = path.join(this.vscodeDir, 'tasks.json');
    this.launchFile = path.join(this.vscodeDir, 'launch.json');
    this.settingsFile = path.join(this.vscodeDir, 'settings.json');
    this.packageJsonFile = path.join(this.projectRoot, 'package.json');
    
    this.results = {
      tests: [],
      warnings: [],
      errors: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  // 日志输出方法
  log(level, message, details = '') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `${colors.gray}[${timestamp}]${colors.reset}`;
    
    switch(level) {
      case 'success':
        console.log(`${prefix} ${colors.green}${icons.success} ${message}${colors.reset} ${details}`);
        break;
      case 'error':
        console.log(`${prefix} ${colors.red}${icons.error} ${message}${colors.reset} ${details}`);
        break;
      case 'warning':
        console.log(`${prefix} ${colors.yellow}${icons.warning} ${message}${colors.reset} ${details}`);
        break;
      case 'info':
        console.log(`${prefix} ${colors.blue}${icons.info} ${message}${colors.reset} ${details}`);
        break;
      case 'test':
        console.log(`${prefix} ${colors.cyan}${icons.test} ${message}${colors.reset} ${details}`);
        break;
    }
  }

  // 添加测试结果
  addResult(type, test, status, message, details = null) {
    const result = {
      type,
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    };

    this.results.tests.push(result);
    this.results.summary.total++;

    if (status === 'PASSED') {
      this.results.summary.passed++;
      this.log('success', `${test}: ${message}`);
    } else if (status === 'FAILED') {
      this.results.summary.failed++;
      this.results.errors.push(result);
      this.log('error', `${test}: ${message}`, details || '');
    } else if (status === 'WARNING') {
      this.results.summary.warnings++;
      this.results.warnings.push(result);
      this.log('warning', `${test}: ${message}`, details || '');
    }
  }

  // 检查文件是否存在
  async validateFileExists(filePath, description) {
    const exists = fs.existsSync(filePath);
    const testName = `文件存在性检查: ${description}`;
    
    if (exists) {
      this.addResult('file', testName, 'PASSED', `文件存在: ${path.relative(this.projectRoot, filePath)}`);
      return true;
    } else {
      this.addResult('file', testName, 'FAILED', `文件不存在: ${path.relative(this.projectRoot, filePath)}`);
      return false;
    }
  }

  // 验证JSON文件格式
  async validateJsonFile(filePath, description) {
    const testName = `JSON格式验证: ${description}`;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      this.addResult('json', testName, 'PASSED', `JSON格式正确`);
      return parsed;
    } catch (error) {
      this.addResult('json', testName, 'FAILED', `JSON格式错误: ${error.message}`);
      return null;
    }
  }

  // 验证tasks.json配置
  async validateTasksConfig(tasksConfig) {
    if (!tasksConfig) return;

    // 检查基本结构
    if (!tasksConfig.version) {
      this.addResult('config', 'Tasks版本检查', 'WARNING', '缺少version字段');
    } else if (tasksConfig.version !== '2.0.0') {
      this.addResult('config', 'Tasks版本检查', 'WARNING', `版本号不是2.0.0: ${tasksConfig.version}`);
    } else {
      this.addResult('config', 'Tasks版本检查', 'PASSED', `版本号正确: ${tasksConfig.version}`);
    }

    if (!tasksConfig.tasks || !Array.isArray(tasksConfig.tasks)) {
      this.addResult('config', 'Tasks数组检查', 'FAILED', 'tasks字段缺失或不是数组');
      return;
    }

    this.addResult('config', 'Tasks数组检查', 'PASSED', `发现 ${tasksConfig.tasks.length} 个任务`);

    // 验证每个任务
    for (let i = 0; i < tasksConfig.tasks.length; i++) {
      const task = tasksConfig.tasks[i];
      await this.validateSingleTask(task, i);
    }
  }

  // 验证单个任务配置
  async validateSingleTask(task, index) {
    const taskName = task.label || `任务${index + 1}`;
    
    // 检查必需字段
    const requiredFields = ['label', 'type'];
    for (const field of requiredFields) {
      if (!task[field]) {
        this.addResult('task', `任务字段检查: ${taskName}`, 'FAILED', `缺少必需字段: ${field}`);
      } else {
        this.addResult('task', `任务字段检查: ${taskName}.${field}`, 'PASSED', `字段值: ${task[field]}`);
      }
    }

    // 检查npm脚本任务
    if (task.type === 'npm' && task.script) {
      await this.validateNpmScript(task.script, taskName);
    }

    // 检查任务组配置
    if (task.group) {
      this.validateTaskGroup(task.group, taskName);
    }

    // 检查展示配置
    if (task.presentation) {
      this.validateTaskPresentation(task.presentation, taskName);
    }

    // 检查问题匹配器
    if (task.problemMatcher) {
      this.validateProblemMatcher(task.problemMatcher, taskName);
    }

    // 检查依赖任务
    if (task.dependsOn) {
      this.validateTaskDependencies(task.dependsOn, taskName);
    }
  }

  // 验证npm脚本是否存在
  async validateNpmScript(scriptName, taskName) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonFile, 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts[scriptName]) {
        this.addResult('script', `NPM脚本检查: ${taskName}`, 'PASSED', 
          `脚本存在: ${scriptName} -> ${packageJson.scripts[scriptName]}`);
      } else {
        this.addResult('script', `NPM脚本检查: ${taskName}`, 'FAILED', 
          `package.json中不存在脚本: ${scriptName}`);
      }
    } catch (error) {
      this.addResult('script', `NPM脚本检查: ${taskName}`, 'FAILED', 
        `无法读取package.json: ${error.message}`);
    }
  }

  // 验证任务组配置
  validateTaskGroup(group, taskName) {
    const validGroups = ['build', 'test'];
    const groupKind = typeof group === 'string' ? group : group.kind;
    
    if (validGroups.includes(groupKind)) {
      this.addResult('config', `任务组检查: ${taskName}`, 'PASSED', `任务组: ${groupKind}`);
    } else {
      this.addResult('config', `任务组检查: ${taskName}`, 'WARNING', `未知任务组: ${groupKind}`);
    }
  }

  // 验证任务展示配置
  validateTaskPresentation(presentation, taskName) {
    const validReveal = ['always', 'silent', 'never'];
    const validPanel = ['shared', 'dedicated', 'new'];
    
    if (presentation.reveal && !validReveal.includes(presentation.reveal)) {
      this.addResult('config', `展示配置检查: ${taskName}`, 'WARNING', 
        `无效的reveal值: ${presentation.reveal}`);
    } else if (presentation.reveal) {
      this.addResult('config', `展示配置检查: ${taskName}`, 'PASSED', 
        `reveal配置: ${presentation.reveal}`);
    }

    if (presentation.panel && !validPanel.includes(presentation.panel)) {
      this.addResult('config', `展示配置检查: ${taskName}`, 'WARNING', 
        `无效的panel值: ${presentation.panel}`);
    } else if (presentation.panel) {
      this.addResult('config', `展示配置检查: ${taskName}`, 'PASSED', 
        `panel配置: ${presentation.panel}`);
    }
  }

  // 验证问题匹配器
  validateProblemMatcher(problemMatcher, taskName) {
    const commonMatchers = ['$tsc', '$tsc-watch', '$eslint-stylish', '$node-sass'];
    
    if (Array.isArray(problemMatcher)) {
      problemMatcher.forEach(matcher => {
        if (typeof matcher === 'string' && matcher.startsWith('$')) {
          this.addResult('config', `问题匹配器检查: ${taskName}`, 'PASSED', 
            `使用预定义匹配器: ${matcher}`);
        }
      });
    } else if (typeof problemMatcher === 'string' && problemMatcher.startsWith('$')) {
      this.addResult('config', `问题匹配器检查: ${taskName}`, 'PASSED', 
        `使用预定义匹配器: ${problemMatcher}`);
    }
  }

  // 验证任务依赖
  validateTaskDependencies(dependsOn, taskName) {
    if (Array.isArray(dependsOn)) {
      this.addResult('config', `任务依赖检查: ${taskName}`, 'PASSED', 
        `依赖任务: ${dependsOn.join(', ')}`);
    } else if (typeof dependsOn === 'string') {
      this.addResult('config', `任务依赖检查: ${taskName}`, 'PASSED', 
        `依赖任务: ${dependsOn}`);
    }
  }

  // 验证launch.json配置
  async validateLaunchConfig(launchConfig) {
    if (!launchConfig) return;

    if (!launchConfig.version) {
      this.addResult('config', 'Launch版本检查', 'WARNING', '缺少version字段');
    } else {
      this.addResult('config', 'Launch版本检查', 'PASSED', `版本号: ${launchConfig.version}`);
    }

    if (!launchConfig.configurations || !Array.isArray(launchConfig.configurations)) {
      this.addResult('config', 'Launch配置数组检查', 'FAILED', 'configurations字段缺失或不是数组');
      return;
    }

    this.addResult('config', 'Launch配置数组检查', 'PASSED', 
      `发现 ${launchConfig.configurations.length} 个调试配置`);

    // 验证每个调试配置
    for (let i = 0; i < launchConfig.configurations.length; i++) {
      const config = launchConfig.configurations[i];
      await this.validateDebugConfig(config, i);
    }
  }

  // 验证调试配置
  async validateDebugConfig(config, index) {
    const configName = config.name || `调试配置${index + 1}`;
    
    // 检查必需字段
    const requiredFields = ['name', 'type', 'request'];
    for (const field of requiredFields) {
      if (!config[field]) {
        this.addResult('debug', `调试配置字段检查: ${configName}`, 'FAILED', `缺少必需字段: ${field}`);
      } else {
        this.addResult('debug', `调试配置字段检查: ${configName}.${field}`, 'PASSED', 
          `字段值: ${config[field]}`);
      }
    }

    // 检查program路径
    if (config.program) {
      const programPath = config.program.replace('${workspaceFolder}', this.projectRoot);
      if (fs.existsSync(programPath) || config.program.includes('node_modules')) {
        this.addResult('debug', `调试程序路径检查: ${configName}`, 'PASSED', 
          `程序路径: ${config.program}`);
      } else {
        this.addResult('debug', `调试程序路径检查: ${configName}`, 'WARNING', 
          `程序路径可能不存在: ${config.program}`);
      }
    }

    // 检查预启动任务
    if (config.preLaunchTask) {
      this.addResult('debug', `预启动任务检查: ${configName}`, 'PASSED', 
        `预启动任务: ${config.preLaunchTask}`);
    }

    // 检查环境变量文件
    if (config.envFile) {
      const envFilePath = config.envFile.replace('${workspaceFolder}', this.projectRoot);
      if (fs.existsSync(envFilePath)) {
        this.addResult('debug', `环境文件检查: ${configName}`, 'PASSED', 
          `环境文件存在: ${config.envFile}`);
      } else {
        this.addResult('debug', `环境文件检查: ${configName}`, 'WARNING', 
          `环境文件不存在: ${config.envFile}`);
      }
    }
  }

  // 验证settings.json配置
  async validateSettingsConfig(settingsConfig) {
    if (!settingsConfig) return;

    // 检查常用设置
    const recommendedSettings = {
      'editor.formatOnSave': 'boolean',
      'editor.tabSize': 'number',
      'typescript.preferences.importModuleSpecifier': 'string',
      'files.exclude': 'object',
      'search.exclude': 'object'
    };

    for (const [setting, expectedType] of Object.entries(recommendedSettings)) {
      if (settingsConfig[setting] !== undefined) {
        const actualType = typeof settingsConfig[setting];
        if (actualType === expectedType) {
          this.addResult('config', `设置项检查: ${setting}`, 'PASSED', 
            `设置值: ${JSON.stringify(settingsConfig[setting])}`);
        } else {
          this.addResult('config', `设置项检查: ${setting}`, 'WARNING', 
            `类型不匹配，期望: ${expectedType}，实际: ${actualType}`);
        }
      }
    }

    // 检查文件嵌套配置
    if (settingsConfig['explorer.fileNesting.enabled']) {
      this.addResult('config', '文件嵌套设置检查', 'PASSED', '文件嵌套功能已启用');
    }

    // 检查终端配置
    if (settingsConfig['terminal.integrated.defaultProfile.osx']) {
      this.addResult('config', '终端配置检查', 'PASSED', 
        `默认终端: ${settingsConfig['terminal.integrated.defaultProfile.osx']}`);
    }
  }

  // 测试任务执行能力
  async testTaskExecution() {
    this.log('test', '开始测试任务执行能力...');
    
    try {
      // 测试npm命令是否可用
      await execAsync('npm --version');
      this.addResult('execution', 'NPM可用性检查', 'PASSED', 'npm命令可用');
      
      // 测试package.json脚本
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonFile, 'utf8'));
      if (packageJson.scripts) {
        const scriptCount = Object.keys(packageJson.scripts).length;
        this.addResult('execution', 'Package.json脚本检查', 'PASSED', 
          `发现 ${scriptCount} 个npm脚本`);
      }
      
    } catch (error) {
      this.addResult('execution', 'NPM可用性检查', 'FAILED', 
        `npm命令不可用: ${error.message}`);
    }
  }

  // 生成测试报告
  generateReport() {
    const report = {
      title: 'VSCode任务配置测试报告',
      timestamp: new Date().toISOString(),
      project: path.basename(this.projectRoot),
      summary: this.results.summary,
      results: this.results.tests,
      warnings: this.results.warnings,
      errors: this.results.errors
    };

    return report;
  }

  // 打印详细报告
  printDetailedReport() {
    console.log('\n' + '='.repeat(80));
    console.log(`${colors.bold}${colors.blue}📊 VSCode任务配置测试报告${colors.reset}`);
    console.log('='.repeat(80));
    
    console.log(`\n${colors.cyan}📋 测试摘要:${colors.reset}`);
    console.log(`  总计测试: ${colors.bold}${this.results.summary.total}${colors.reset}`);
    console.log(`  通过: ${colors.green}${this.results.summary.passed}${colors.reset}`);
    console.log(`  失败: ${colors.red}${this.results.summary.failed}${colors.reset}`);
    console.log(`  警告: ${colors.yellow}${this.results.summary.warnings}${colors.reset}`);
    
    const successRate = ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1);
    console.log(`  成功率: ${colors.bold}${successRate}%${colors.reset}`);

    // 打印错误详情
    if (this.results.errors.length > 0) {
      console.log(`\n${colors.red}❌ 失败的测试:${colors.reset}`);
      this.results.errors.forEach((error, index) => {
        console.log(`\n  ${index + 1}. ${colors.red}${error.test}${colors.reset}`);
        console.log(`     ${colors.dim}${error.message}${colors.reset}`);
        if (error.details) {
          console.log(`     ${colors.dim}详情: ${error.details}${colors.reset}`);
        }
      });
    }

    // 打印警告详情
    if (this.results.warnings.length > 0) {
      console.log(`\n${colors.yellow}⚠️ 警告信息:${colors.reset}`);
      this.results.warnings.forEach((warning, index) => {
        console.log(`\n  ${index + 1}. ${colors.yellow}${warning.test}${colors.reset}`);
        console.log(`     ${colors.dim}${warning.message}${colors.reset}`);
      });
    }

    // 建议和推荐
    console.log(`\n${colors.cyan}💡 建议和推荐:${colors.reset}`);
    
    if (this.results.summary.failed > 0) {
      console.log(`  • 请修复上述失败的测试项目`);
    }
    
    if (this.results.summary.warnings > 0) {
      console.log(`  • 建议处理警告信息以获得更好的开发体验`);
    }
    
    console.log(`  • 定期运行此测试脚本确保配置正确性`);
    console.log(`  • 使用 Ctrl+Shift+P 打开命令面板测试VSCode任务`);
    console.log(`  • 检查VSCode扩展是否已正确安装和配置`);

    console.log('\n' + '='.repeat(80));
  }

  // 主测试流程
  async run() {
    console.log(`${colors.bold}${colors.blue}🧪 开始VSCode任务配置测试...${colors.reset}\n`);
    
    try {
      // 1. 检查文件存在性
      this.log('info', '检查VSCode配置文件...');
      const tasksExists = await this.validateFileExists(this.tasksFile, 'tasks.json');
      const launchExists = await this.validateFileExists(this.launchFile, 'launch.json');
      const settingsExists = await this.validateFileExists(this.settingsFile, 'settings.json');
      await this.validateFileExists(this.packageJsonFile, 'package.json');

      // 2. 验证JSON格式
      this.log('info', '验证JSON文件格式...');
      const tasksConfig = tasksExists ? await this.validateJsonFile(this.tasksFile, 'tasks.json') : null;
      const launchConfig = launchExists ? await this.validateJsonFile(this.launchFile, 'launch.json') : null;
      const settingsConfig = settingsExists ? await this.validateJsonFile(this.settingsFile, 'settings.json') : null;

      // 3. 验证配置内容
      this.log('info', '验证配置内容...');
      if (tasksConfig) {
        await this.validateTasksConfig(tasksConfig);
      }
      
      if (launchConfig) {
        await this.validateLaunchConfig(launchConfig);
      }
      
      if (settingsConfig) {
        await this.validateSettingsConfig(settingsConfig);
      }

      // 4. 测试执行环境
      this.log('info', '测试执行环境...');
      await this.testTaskExecution();

      // 5. 生成报告
      this.printDetailedReport();
      
      // 保存报告文件
      const report = this.generateReport();
      const reportPath = path.join(this.projectRoot, 'logs', 'vscode-task-test-report.json');
      
      // 确保logs目录存在
      const logsDir = path.dirname(reportPath);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n${colors.green}📄 详细报告已保存到: ${colors.bold}${reportPath}${colors.reset}`);

      // 返回测试结果
      return {
        success: this.results.summary.failed === 0,
        summary: this.results.summary,
        reportPath
      };

    } catch (error) {
      this.log('error', '测试过程中发生错误', error.message);
      console.error(`\n${colors.red}❌ 测试失败: ${error.message}${colors.reset}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 主函数
async function main() {
  const validator = new VSCodeTaskValidator();
  const result = await validator.run();
  
  // 根据测试结果设置退出码
  process.exit(result.success ? 0 : 1);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}❌ 脚本执行失败: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = VSCodeTaskValidator;