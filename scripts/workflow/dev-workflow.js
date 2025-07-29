#!/usr/bin/env node

/**
 * 开发工作流脚本
 * 集成用户故事解析、代码生成和集成
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { StoryParser } = require('../automation/story-parser');
const { CodeGenerator } = require('../automation/code-generator');
const { XcodeSimulatorIntegration } = require('./xcode-simulator-integration');

class DevWorkflow {
  constructor() {
    this.workflowSteps = [
      { name: '解析用户故事', handler: 'parseUserStory' },
      { name: '生成技术任务', handler: 'generateTechnicalTasks' },
      { name: '生成代码', handler: 'generateCode' },
      { name: '集成代码', handler: 'integrateCode' },
      { name: '启动本地服务', handler: 'startLocalServices' },
      { name: '部署到iPhone模拟器', handler: 'deployToXcodeSimulator' },
      { name: '等待手动测试确认', handler: 'waitForManualTesting' },
      { name: '生成开发报告', handler: 'generateReport' }
    ];
    
    // 初始化Xcode模拟器集成
    this.xcodeSimulator = new XcodeSimulatorIntegration();
    
    this.results = {
      userStory: '',
      analysis: null,
      generatedCode: null,
      integrationStatus: null,
      localServices: null,
      xcodeSimulator: null,
      manualTestResult: null,
      testResults: null,
      report: null
    };
    
    this.startTime = Date.now();
  }

  /**
   * 执行完整的开发工作流
   */
  async executeWorkflow(userStory, options = {}) {
    console.log('🚀 开始执行开发工作流...');
    console.log(`📝 用户故事: ${userStory}`);
    console.log(`⏰ 开始时间: ${new Date().toLocaleString()}`);
    
    this.results.userStory = userStory;
    
    try {
      for (const step of this.workflowSteps) {
        console.log(`\n🔄 执行: ${step.name}...`);
        
        const stepStartTime = Date.now();
        await this[step.handler](options);
        const stepDuration = Date.now() - stepStartTime;
        
        console.log(`✅ ${step.name}完成 (耗时: ${Math.round(stepDuration / 1000)}秒)`);
      }
      
      const totalDuration = Date.now() - this.startTime;
      console.log(`\n🎉 开发工作流执行完成！总耗时: ${Math.round(totalDuration / 1000)}秒`);
      
      return this.results;
      
    } catch (error) {
      console.error(`❌ 开发工作流执行失败: ${error.message}`);
      
      // 保存错误信息
      await this.saveErrorReport(error);
      
      throw error;
    }
  }

  /**
   * 解析用户故事
   */
  async parseUserStory(options) {
    console.log('🔍 解析用户故事...');
    
    try {
      const parser = new StoryParser();
      const analysis = parser.parseUserStory(this.results.userStory);
      
      this.results.analysis = analysis;
      
      console.log(`📊 识别业务域: ${analysis.businessDomain}`);
      console.log(`⏱️ 预估工作量: ${analysis.estimatedHours}小时`);
      console.log(`📈 优先级: ${analysis.priority}`);
      
      // 保存分析结果
      const analysisPath = 'dev-workflow-analysis.json';
      fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
      console.log(`📄 分析结果已保存: ${analysisPath}`);
      
    } catch (error) {
      console.error('❌ 用户故事解析失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成技术任务
   */
  async generateTechnicalTasks(options) {
    console.log('📋 生成技术任务...');
    
    if (!this.results.analysis) {
      throw new Error('缺少用户故事分析结果');
    }
    
    const { technicalTasks, apiChanges, dbChanges } = this.results.analysis;
    
    console.log(`🔧 后端任务: ${technicalTasks.backend.length}个`);
    console.log(`📱 前端任务: ${technicalTasks.frontend.length}个`);
    console.log(`🗄️ 数据库任务: ${technicalTasks.database.length}个`);
    console.log(`🔌 API变更: ${apiChanges.endpoints.length}个端点`);
    
    // 显示任务详情
    this.displayTaskDetails(technicalTasks);
  }

  /**
   * 生成代码
   */
  async generateCode(options) {
    console.log('🔧 生成代码...');
    
    if (!this.results.analysis) {
      throw new Error('缺少用户故事分析结果');
    }
    
    try {
      const generator = new CodeGenerator();
      const { technicalTasks, apiChanges, dbChanges } = this.results.analysis;
      
      const generatedCode = await generator.generateCode(
        JSON.stringify(technicalTasks),
        JSON.stringify(apiChanges),
        JSON.stringify(dbChanges)
      );
      
      this.results.generatedCode = generatedCode;
      
      console.log(`✅ 代码生成完成:`);
      console.log(`  📝 后端文件: ${generatedCode.backend.length}`);
      console.log(`  📱 前端文件: ${generatedCode.frontend.length}`);
      console.log(`  🗄️ 数据库文件: ${generatedCode.database.length}`);
      console.log(`  🧪 测试文件: ${generatedCode.tests.length}`);
      
      // 保存生成结果
      const codeGenPath = 'dev-workflow-generated-code.json';
      fs.writeFileSync(codeGenPath, JSON.stringify(generatedCode, null, 2));
      console.log(`📄 代码生成结果已保存: ${codeGenPath}`);
      
    } catch (error) {
      console.error('❌ 代码生成失败:', error.message);
      throw error;
    }
  }

  /**
   * 集成代码
   */
  async integrateCode(options) {
    console.log('🔗 集成代码到现有项目...');
    
    if (!this.results.generatedCode) {
      throw new Error('缺少代码生成结果');
    }
    
    try {
      const integrationResults = {
        success: true,
        integratedFiles: [],
        conflicts: [],
        warnings: []
      };
      
      // 检查文件冲突
      await this.checkForConflicts(integrationResults);
      
      // 更新依赖
      await this.updateDependencies(integrationResults);
      
      // 更新配置文件
      await this.updateConfigurations(integrationResults);
      
      // 运行格式化
      if (!options.skipFormat) {
        await this.formatCode(integrationResults);
      }
      
      this.results.integrationStatus = integrationResults;
      
      console.log(`✅ 代码集成完成:`);
      console.log(`  📁 集成文件: ${integrationResults.integratedFiles.length}`);
      console.log(`  ⚠️ 冲突: ${integrationResults.conflicts.length}`);
      console.log(`  💡 警告: ${integrationResults.warnings.length}`);
      
      if (integrationResults.conflicts.length > 0) {
        console.warn('⚠️ 发现文件冲突，需要手动解决:');
        integrationResults.conflicts.forEach(conflict => {
          console.warn(`  - ${conflict}`);
        });
      }
      
    } catch (error) {
      console.error('❌ 代码集成失败:', error.message);
      throw error;
    }
  }

  /**
   * 运行测试
   */
  /**
   * 启动本地服务
   */
  async startLocalServices(options) {
    console.log('🚀 启动本地服务...');
    
    const serviceResults = {
      backend: false,
      database: false,
      redis: false,
      ports: {
        backend: 3000,
        database: 3306,
        redis: 6379
      }
    };
    
    try {
      // 检查数据库连接
      console.log('🗄️ 检查数据库连接...');
      try {
        await this.runCommand('npm run test:db-connection');
        serviceResults.database = true;
        console.log('✅ 数据库连接正常');
      } catch (error) {
        console.warn('⚠️ 数据库连接失败，请检查MySQL服务');
      }
      
      // 检查后端服务是否已在运行
      console.log('🔍 检查后端服务状态...');
      try {
        await this.runCommand('curl -f http://localhost:3000/health');
        serviceResults.backend = true;
        console.log('✅ 后端服务已在运行');
      } catch (error) {
        console.log('🚀 启动后端服务...');
        // 在生产环境下我们通常不会在这里启动服务
        // 这里只是检查服务状态
        console.log('💡 请确保后端服务已启动: npm run start:dev');
      }
      
      this.results.localServices = serviceResults;
      
      console.log('📊 本地服务状态:');
      console.log(`  🔧 后端服务: ${serviceResults.backend ? '✅ 运行中' : '❌ 未启动'}`);
      console.log(`  🗄️ 数据库: ${serviceResults.database ? '✅ 连接正常' : '❌ 连接失败'}`);
      console.log(`  🌐 访问地址: http://localhost:${serviceResults.ports.backend}`);
      
    } catch (error) {
      console.error('❌ 检查本地服务失败:', error.message);
      throw error;
    }
  }

  /**
   * 部署到iPhone模拟器
   */
  async deployToXcodeSimulator(options) {
    console.log('🍎 部署到iPhone模拟器...');
    
    try {
      // 启动iPhone模拟器
      const simulatorResult = await this.xcodeSimulator.launchSimulatorForWorkflow({
        device: options.device || 'iPhone 15',
        url: 'http://localhost:3000',
        waitForLaunch: true
      });
      
      this.results.xcodeSimulator = simulatorResult;
      
      if (simulatorResult.success) {
        console.log('✅ iPhone模拟器部署成功');
        console.log(`📱 设备: ${simulatorResult.deviceInfo.deviceName}`);
        console.log(`🌐 应用URL: ${simulatorResult.deviceInfo.appURL}`);
        
        // 生成测试建议
        const testingSuggestions = this.xcodeSimulator.generateTestingSuggestions();
        console.log('\n📋 测试建议:');
        testingSuggestions.forEach(suggestion => console.log(suggestion));
        
      } else {
        console.error('❌ iPhone模拟器部署失败:', simulatorResult.error);
        console.log('\n📋 备选方案:');
        simulatorResult.fallbackInstructions.forEach(instruction => console.log(instruction));
        
        // 不抛出错误，允许继续工作流
        console.log('⚠️ 继续工作流，但建议手动启动模拟器');
      }
      
    } catch (error) {
      console.error('❌ iPhone模拟器部署异常:', error.message);
      console.log('💡 您可以稍后手动运行: npm run ios-simulator');
      
      // 不阻断工作流
      this.results.xcodeSimulator = {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 等待手动测试确认
   */
  async waitForManualTesting(options) {
    console.log('🧪 等待手动测试确认...');
    
    console.log('\n📋 请在iPhone模拟器中进行以下测试:');
    console.log('  1. ✅ 功能测试: 验证新功能是否正常工作');
    console.log('  2. 🎨 UI测试: 检查界面显示是否正确');
    console.log('  3. 📱 响应式测试: 检查不同屏幕尺寸的适配');
    console.log('  4. 🔗 交互测试: 验证触摸、滑动等手势操作');
    console.log('  5. 🚀 性能测试: 检查页面加载速度和响应时间');
    console.log('');
    
    // 显示模拟器信息
    if (this.results.xcodeSimulator?.success) {
      console.log('🍎 iPhone模拟器信息:');
      console.log(`  📱 设备: ${this.results.xcodeSimulator.deviceInfo.deviceName}`);
      console.log(`  🌐 应用URL: ${this.results.xcodeSimulator.deviceInfo.appURL}`);
      console.log('  🔧 Safari调试: Safari → 开发 → Simulator → iPhone');
    }
    
    console.log('🔧 测试工具:');
    console.log(`  📊 API文档: http://localhost:3000/api`);
    console.log(`  💚 健康检查: http://localhost:3000/health`);
    console.log('');
    
    // 交互式确认
    if (!options.skipInteraction) {
      const testResult = await this.promptForTestConfirmation();
      this.results.manualTestResult = testResult;
      
      if (!testResult.passed) {
        console.log('❌ 手动测试未通过，工作流程终止');
        console.log('📝 问题描述:', testResult.issues.join(', '));
        throw new Error('手动测试未通过');
      }
      
      console.log('✅ 手动测试通过！');
    } else {
      console.log('⏭️ 跳过交互式确认');
      this.results.manualTestResult = { passed: true, skipped: true };
    }
  }

  /**
   * 交互式测试确认
   */
  async promptForTestConfirmation() {
    return new Promise((resolve) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      console.log('🤔 请确认iPhone模拟器测试结果 (输入 y/n):');
      console.log('  - y: 测试通过，继续后续流程');
      console.log('  - n: 测试发现问题，停止流程');
      
      rl.question('iPhone模拟器测试是否通过? (y/n): ', (answer) => {
        const passed = answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
        
        if (!passed) {
          rl.question('请描述发现的问题 (可选): ', (issues) => {
            rl.close();
            resolve({
              passed: false,
              issues: issues ? [issues] : ['用户报告iPhone模拟器测试未通过']
            });
          });
        } else {
          rl.close();
          resolve({
            passed: true,
            confirmedAt: new Date().toISOString(),
            platform: 'iPhone模拟器'
          });
        }
      });
    });
  }

  async runTests(options) {
    console.log('🧪 运行测试...');
    
    if (options.skipTests) {
      console.log('⏭️ 跳过测试');
      return;
    }
    
    try {
      // 运行TypeScript编译检查
      console.log('🔍 TypeScript编译检查...');
      await this.runCommand('npx tsc --noEmit');
      
      // 运行linting
      console.log('📏 代码规范检查...');
      await this.runCommand('npm run lint');
      
      // 运行单元测试
      console.log('🧪 运行单元测试...');
      const testResult = await this.runCommand('npm run test -- --passWithNoTests');
      
      this.results.testResults = {
        success: true,
        typescript: 'passed',
        linting: 'passed',
        unitTests: 'passed',
        details: testResult
      };
      
      console.log('✅ 所有测试通过');
      
    } catch (error) {
      this.results.testResults = {
        success: false,
        error: error.message
      };
      
      console.error('❌ 测试失败:', error.message);
      
      if (!options.continueOnFailure) {
        throw error;
      }
    }
  }

  /**
   * 生成报告
   */
  async generateReport(options) {
    console.log('📊 生成工作流报告...');
    
    const report = {
      userStory: this.results.userStory,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      success: this.isWorkflowSuccessful(),
      summary: this.generateSummary(),
      details: {
        analysis: this.results.analysis,
        generatedCode: this.results.generatedCode,
        integration: this.results.integrationStatus,
        tests: this.results.testResults
      }
    };
    
    this.results.report = report;
    
    // 保存详细报告
    const reportPath = 'dev-workflow-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 生成Markdown报告
    const markdownReport = this.generateMarkdownReport(report);
    const mdPath = 'dev-workflow-report.md';
    fs.writeFileSync(mdPath, markdownReport);
    
    console.log(`📄 工作流报告已生成:`);
    console.log(`  - JSON: ${reportPath}`);
    console.log(`  - Markdown: ${mdPath}`);
    
    // 显示摘要
    this.displaySummary(report);
  }

  /**
   * 检查文件冲突
   */
  async checkForConflicts(integrationResults) {
    console.log('🔍 检查文件冲突...');
    
    const { generatedCode } = this.results;
    const allFiles = [
      ...generatedCode.backend,
      ...generatedCode.frontend,
      ...generatedCode.database,
      ...generatedCode.tests
    ];
    
    for (const filePath of allFiles) {
      if (fs.existsSync(filePath)) {
        integrationResults.conflicts.push(filePath);
      } else {
        integrationResults.integratedFiles.push(filePath);
      }
    }
  }

  /**
   * 更新依赖
   */
  async updateDependencies(integrationResults) {
    console.log('📦 检查依赖更新...');
    
    // 检查是否需要安装新依赖
    const { analysis } = this.results;
    const requiredDependencies = this.extractRequiredDependencies(analysis);
    
    if (requiredDependencies.length > 0) {
      console.log(`📋 需要的依赖: ${requiredDependencies.join(', ')}`);
      integrationResults.warnings.push(`需要安装依赖: ${requiredDependencies.join(', ')}`);
    }
  }

  /**
   * 更新配置文件
   */
  async updateConfigurations(integrationResults) {
    console.log('⚙️ 更新配置文件...');
    
    // 这里可以添加更新模块导入、路由配置等逻辑
    // 暂时只记录警告
    integrationResults.warnings.push('请手动更新模块导入和路由配置');
  }

  /**
   * 格式化代码
   */
  async formatCode(integrationResults) {
    console.log('🎨 格式化代码...');
    
    try {
      await this.runCommand('npm run format');
      console.log('✅ 代码格式化完成');
    } catch (error) {
      integrationResults.warnings.push(`代码格式化失败: ${error.message}`);
    }
  }

  /**
   * 显示任务详情
   */
  displayTaskDetails(technicalTasks) {
    console.log('\n📋 技术任务详情:');
    
    if (technicalTasks.backend.length > 0) {
      console.log('\n🔧 后端任务:');
      technicalTasks.backend.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.component} (${task.action})`);
        task.files.forEach(file => {
          console.log(`     📄 ${file}`);
        });
      });
    }
    
    if (technicalTasks.frontend.length > 0) {
      console.log('\n📱 前端任务:');
      technicalTasks.frontend.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.component} (${task.action})`);
        task.files.forEach(file => {
          console.log(`     📄 ${file}`);
        });
      });
    }
  }

  /**
   * 判断工作流是否成功
   */
  isWorkflowSuccessful() {
    return this.results.testResults?.success !== false;
  }

  /**
   * 生成摘要
   */
  generateSummary() {
    const { analysis, generatedCode, integrationStatus, testResults } = this.results;
    
    return {
      businessDomain: analysis?.businessDomain || 'unknown',
      estimatedHours: analysis?.estimatedHours || 0,
      priority: analysis?.priority || 'low',
      filesGenerated: generatedCode ? 
        generatedCode.backend.length + generatedCode.frontend.length + 
        generatedCode.database.length + generatedCode.tests.length : 0,
      conflicts: integrationStatus?.conflicts.length || 0,
      testsStatus: testResults?.success ? 'passed' : 'failed'
    };
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport(report) {
    const duration = Math.round(report.duration / 1000);
    const status = report.success ? '✅ 成功' : '❌ 失败';
    
    return `# 🚀 开发工作流报告

## 📊 概览

- **状态**: ${status}
- **用户故事**: ${report.userStory}
- **执行时间**: ${report.timestamp}
- **总耗时**: ${duration}秒
- **业务域**: ${report.summary.businessDomain}
- **预估工作量**: ${report.summary.estimatedHours}小时
- **优先级**: ${report.summary.priority}

## 📈 执行结果

### 📝 代码生成
- **生成文件总数**: ${report.summary.filesGenerated}
- **后端文件**: ${report.details.generatedCode?.backend.length || 0}
- **前端文件**: ${report.details.generatedCode?.frontend.length || 0}
- **数据库文件**: ${report.details.generatedCode?.database.length || 0}
- **测试文件**: ${report.details.generatedCode?.tests.length || 0}

### 🔗 代码集成
- **集成文件**: ${report.details.integration?.integratedFiles.length || 0}
- **冲突文件**: ${report.summary.conflicts}
- **警告**: ${report.details.integration?.warnings.length || 0}

### 🧪 测试结果
- **状态**: ${report.summary.testsStatus}
- **TypeScript检查**: ${report.details.tests?.typescript || 'skipped'}
- **代码规范**: ${report.details.tests?.linting || 'skipped'}
- **单元测试**: ${report.details.tests?.unitTests || 'skipped'}

## 📋 下一步操作

${report.summary.conflicts > 0 ? `
### ⚠️ 解决冲突
需要手动解决以下文件冲突:
${report.details.integration?.conflicts.map(file => `- ${file}`).join('\n') || ''}
` : ''}

### 🔄 继续开发流程
1. 检查生成的代码是否符合预期
2. 运行完整测试套件: \`npm run test:all\`
3. 启动开发服务器: \`npm run start:dev\`
4. 进行功能验证测试

---
*报告生成时间: ${new Date().toLocaleString()}*`;
  }

  /**
   * 显示摘要
   */
  displaySummary(report) {
    const duration = Math.round(report.duration / 1000);
    const status = report.success ? '✅ 成功' : '❌ 失败';
    
    console.log('\n📊 工作流执行摘要:');
    console.log(`  状态: ${status}`);
    console.log(`  耗时: ${duration}秒`);
    console.log(`  业务域: ${report.summary.businessDomain}`);
    console.log(`  生成文件: ${report.summary.filesGenerated}个`);
    console.log(`  冲突: ${report.summary.conflicts}个`);
    console.log(`  测试: ${report.summary.testsStatus}`);
  }

  /**
   * 提取所需依赖
   */
  extractRequiredDependencies(analysis) {
    // 根据业务域和技术任务分析所需依赖
    const dependencies = [];
    
    if (analysis.businessDomain === 'gym') {
      dependencies.push('@nestjs/typeorm', 'typeorm');
    }
    if (analysis.businessDomain === 'user') {
      dependencies.push('@nestjs/jwt', '@nestjs/passport');
    }
    
    return dependencies;
  }

  /**
   * 运行命令
   */
  async runCommand(command) {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed: ${command}\n${stderr}`));
        }
      });
    });
  }

  /**
   * 保存错误报告
   */
  async saveErrorReport(error) {
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      userStory: this.results.userStory,
      completedSteps: Object.keys(this.results).filter(key => this.results[key] !== null)
    };
    
    const errorPath = 'dev-workflow-error.json';
    fs.writeFileSync(errorPath, JSON.stringify(errorReport, null, 2));
    
    console.log(`📄 错误报告已保存: ${errorPath}`);
  }
}

// 命令行接口
async function main() {
  const userStory = process.argv[2];
  
  if (!userStory) {
    console.error('❌ 请提供用户故事');
    console.error('使用方法: node dev-workflow.js "作为用户，我希望查看健身房列表，以便选择合适的场馆"');
    console.error('');
    console.error('选项:');
    console.error('  --skip-tests     跳过测试');
    console.error('  --skip-format    跳过代码格式化');
    console.error('  --continue       测试失败时继续执行');
    process.exit(1);
  }
  
  // 解析选项
  const options = {
    skipTests: process.argv.includes('--skip-tests'),
    skipFormat: process.argv.includes('--skip-format'),
    continueOnFailure: process.argv.includes('--continue')
  };
  
  try {
    const workflow = new DevWorkflow();
    const results = await workflow.executeWorkflow(userStory, options);
    
    if (results.report.success) {
      console.log('\n🎉 开发工作流执行成功！');
      process.exit(0);
    } else {
      console.log('\n⚠️ 开发工作流执行完成，但存在问题');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ 开发工作流执行失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DevWorkflow };