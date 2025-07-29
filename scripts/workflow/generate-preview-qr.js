#!/usr/bin/env node

/**
 * 生成小程序预览二维码脚本
 * 使用微信开发者工具CLI生成预览二维码
 */

const fs = require('fs');
const path = require('path');

class PreviewQRGenerator {
  constructor() {
    this.ci = null;
    this.config = {
      appid: process.env.MINIPROGRAM_APP_ID || 'wx0a950fd30b3c2146',
      privateKeyPath: '',
      projectPath: '',
      outputPath: 'preview-qr-code.png',
      desc: '预览版本',
      pagePath: 'pages/index/index',
      searchQuery: '',
      scene: 1001,
      qrcodeFormat: 'image'
    };
  }

  /**
   * 初始化微信CI
   */
  async initializeCI() {
    try {
      this.ci = require('miniprogram-ci');
      console.log('✅ 微信CI初始化成功');
    } catch (error) {
      console.error('❌ 微信CI初始化失败，请安装 miniprogram-ci');
      console.error('运行: npm install -g miniprogram-ci');
      throw error;
    }
  }

  /**
   * 生成预览二维码
   */
  async generateQRCode(options) {
    console.log('📱 开始生成小程序预览二维码...');
    
    try {
      // 初始化CI
      await this.initializeCI();
      
      // 解析配置
      this.parseOptions(options);
      
      // 验证配置
      await this.validateConfig();
      
      // 创建项目对象
      const project = new this.ci.Project({
        appid: this.config.appid,
        type: 'miniProgram',
        projectPath: this.config.projectPath,
        privateKeyPath: this.config.privateKeyPath,
        ignores: this.getIgnorePatterns(),
      });

      console.log(`📋 预览配置:`);
      console.log(`  - AppID: ${this.config.appid}`);
      console.log(`  - 项目路径: ${this.config.projectPath}`);
      console.log(`  - 输出路径: ${this.config.outputPath}`);
      console.log(`  - 页面路径: ${this.config.pagePath}`);
      console.log(`  - 场景值: ${this.config.scene}`);

      // 生成预览
      const previewResult = await this.ci.preview({
        project,
        desc: this.config.desc,
        setting: this.getPreviewSettings(),
        qrcodeFormat: this.config.qrcodeFormat,
        qrcodeOutputDest: this.config.outputPath,
        pagePath: this.config.pagePath,
        searchQuery: this.config.searchQuery,
        scene: this.config.scene,
        onProgressUpdate: this.handleProgressUpdate.bind(this),
      });

      console.log('✅ 预览二维码生成成功！');
      console.log(`📱 二维码文件: ${this.config.outputPath}`);
      console.log(`📊 文件大小: ${this.getFileSize(this.config.outputPath)}`);

      // 保存预览结果信息
      await this.savePreviewInfo(previewResult);
      
      // 生成预览说明
      await this.generatePreviewInstructions();

      return {
        success: true,
        qrCodePath: this.config.outputPath,
        result: previewResult
      };

    } catch (error) {
      console.error('❌ 生成预览二维码失败:', error.message);
      
      // 保存错误信息
      await this.saveErrorInfo(error);
      
      throw error;
    }
  }

  /**
   * 解析命令行选项
   */
  parseOptions(options) {
    this.config.appid = options.appid || this.config.appid;
    this.config.privateKeyPath = options.privateKey || this.config.privateKeyPath;
    this.config.projectPath = options.projectPath || this.config.projectPath;
    this.config.outputPath = options.output || this.config.outputPath;
    this.config.desc = options.desc || this.config.desc;
    this.config.pagePath = options.pagePath || this.config.pagePath;
    this.config.searchQuery = options.searchQuery || this.config.searchQuery;
    this.config.scene = parseInt(options.scene) || this.config.scene;

    // 验证必需参数
    if (!this.config.appid) {
      throw new Error('缺少 AppID 参数');
    }
    if (!this.config.privateKeyPath) {
      throw new Error('缺少私钥文件路径');
    }
    if (!this.config.projectPath) {
      throw new Error('缺少项目路径');
    }
  }

  /**
   * 验证配置
   */
  async validateConfig() {
    console.log('🔍 验证配置...');
    
    // 验证私钥文件
    if (!fs.existsSync(this.config.privateKeyPath)) {
      throw new Error(`私钥文件不存在: ${this.config.privateKeyPath}`);
    }
    
    // 验证项目目录
    if (!fs.existsSync(this.config.projectPath)) {
      throw new Error(`项目目录不存在: ${this.config.projectPath}`);
    }
    
    // 验证项目配置文件
    const projectConfigPath = path.join(this.config.projectPath, 'project.config.json');
    if (!fs.existsSync(projectConfigPath)) {
      throw new Error('项目配置文件 project.config.json 不存在');
    }
    
    // 验证app.json
    const appJsonPath = path.join(this.config.projectPath, 'app.json');
    if (!fs.existsSync(appJsonPath)) {
      throw new Error('应用配置文件 app.json 不存在');
    }
    
    // 验证app.js
    const appJsPath = path.join(this.config.projectPath, 'app.js');
    if (!fs.existsSync(appJsPath)) {
      throw new Error('应用入口文件 app.js 不存在');
    }
    
    // 验证指定页面存在
    if (this.config.pagePath && this.config.pagePath !== 'pages/index/index') {
      const pageJsPath = path.join(this.config.projectPath, `${this.config.pagePath}.js`);
      if (!fs.existsSync(pageJsPath)) {
        console.warn(`⚠️ 指定页面不存在: ${this.config.pagePath}，将使用默认首页`);
        this.config.pagePath = 'pages/index/index';
      }
    }
    
    // 确保输出目录存在
    const outputDir = path.dirname(this.config.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('✅ 配置验证通过');
  }

  /**
   * 获取忽略模式
   */
  getIgnorePatterns() {
    return [
      'node_modules/**/*',
      '.git/**/*',
      '.github/**/*',
      '*.log',
      '*.md',
      '.DS_Store',
      'Thumbs.db',
      '*.tmp',
      '*.bak',
      'coverage/**/*',
      'docs/**/*',
      'scripts/**/*',
      '.env*',
      'package-lock.json',
      'yarn.lock'
    ];
  }

  /**
   * 获取预览设置
   */
  getPreviewSettings() {
    return {
      es6: true,
      es7: true,
      minify: false, // 预览版本不压缩，便于调试
      codeProtect: false,
      minifyJS: false,
      minifyWXML: false,
      minifyWXSS: false,
      autoPrefixWXSS: true,
      uploadWithSourceMap: true,
      compileHotReLoad: false,
      useMultiFrameRuntime: true,
      useApiHook: true,
      useApiHostProcess: true,
      babelSetting: {
        ignore: [],
        disablePlugins: [],
        outputPath: ""
      }
    };
  }

  /**
   * 处理进度更新
   */
  handleProgressUpdate(progress) {
    const percentage = Math.round(progress * 100);
    console.log(`📊 生成进度: ${percentage}%`);
  }

  /**
   * 获取文件大小
   */
  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const bytes = stats.size;
      
      if (bytes < 1024) {
        return `${bytes} B`;
      } else if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
      } else {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }
    } catch (error) {
      return '未知';
    }
  }

  /**
   * 保存预览信息
   */
  async savePreviewInfo(result) {
    const previewInfo = {
      ...result,
      config: this.config,
      generateTime: new Date().toISOString(),
      qrCodePath: this.config.outputPath
    };
    
    const infoPath = 'miniprogram-preview-info.json';
    fs.writeFileSync(infoPath, JSON.stringify(previewInfo, null, 2));
    
    console.log(`📄 预览信息已保存: ${infoPath}`);
  }

  /**
   * 生成预览说明
   */
  async generatePreviewInstructions() {
    const instructions = `# 🔍 小程序预览指南

## 📱 扫码预览

1. 打开微信，使用扫一扫功能
2. 扫描下方二维码
3. 在微信中打开小程序预览版本

## 📋 预览信息

- **生成时间**: ${new Date().toLocaleString()}
- **AppID**: ${this.config.appid}
- **入口页面**: ${this.config.pagePath}
- **场景值**: ${this.config.scene}
- **描述**: ${this.config.desc}

## 🧪 测试要点

### 功能测试
- [ ] 页面加载正常
- [ ] 导航功能正常
- [ ] API接口调用正常
- [ ] 数据显示正确

### UI测试  
- [ ] 页面布局正确
- [ ] 组件显示正常
- [ ] 交互反馈及时
- [ ] 适配不同机型

### 性能测试
- [ ] 页面加载速度
- [ ] 操作响应时间
- [ ] 内存使用情况
- [ ] 网络请求效率

## 🐛 问题反馈

如发现问题，请在GitHub Issue中反馈：
- 问题描述
- 复现步骤  
- 设备信息
- 截图或录屏

## 🔄 刷新预览

如需更新预览版本，请重新运行生成命令。

---
*预览生成时间: ${new Date().toLocaleString()}*
`;

    const instructionsPath = 'miniprogram-preview-guide.md';
    fs.writeFileSync(instructionsPath, instructions);
    
    console.log(`📖 预览指南已生成: ${instructionsPath}`);
  }

  /**
   * 保存错误信息
   */
  async saveErrorInfo(error) {
    const errorInfo = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      config: this.config,
      timestamp: new Date().toISOString()
    };
    
    const errorPath = 'miniprogram-preview-error.json';
    fs.writeFileSync(errorPath, JSON.stringify(errorInfo, null, 2));
    
    console.log(`📄 错误信息已保存: ${errorPath}`);
  }

  /**
   * 生成多个场景的预览
   */
  async generateMultipleScenes(options, scenes) {
    console.log('📱 生成多场景预览二维码...');
    
    const results = [];
    
    for (const scene of scenes) {
      try {
        console.log(`\n🎬 生成场景 ${scene.name} (${scene.value})...`);
        
        const sceneOptions = {
          ...options,
          scene: scene.value,
          pagePath: scene.pagePath || options.pagePath,
          output: `preview-qr-${scene.name.toLowerCase()}.png`,
          desc: `预览 - ${scene.name}`
        };
        
        const result = await this.generateQRCode(sceneOptions);
        results.push({
          scene: scene.name,
          ...result
        });
        
      } catch (error) {
        console.error(`❌ 场景 ${scene.name} 生成失败:`, error.message);
        results.push({
          scene: scene.name,
          success: false,
          error: error.message
        });
      }
    }
    
    // 生成汇总报告
    await this.generateSceneSummary(results);
    
    return results;
  }

  /**
   * 生成场景汇总报告
   */
  async generateSceneSummary(results) {
    let summary = `# 📱 多场景预览汇总\n\n`;
    summary += `**生成时间**: ${new Date().toLocaleString()}\n\n`;
    summary += `## 📋 场景列表\n\n`;
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      summary += `### ${status} ${result.scene}\n`;
      
      if (result.success) {
        summary += `- 二维码文件: ${result.qrCodePath}\n`;
        summary += `- 状态: 生成成功\n\n`;
      } else {
        summary += `- 状态: 生成失败\n`;
        summary += `- 错误: ${result.error}\n\n`;
      }
    });
    
    const summaryPath = 'miniprogram-scenes-summary.md';
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`📊 场景汇总已生成: ${summaryPath}`);
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      const value = args[i + 1];
      options[key] = value;
      i++; // 跳过value
    }
  }

  // 检查是否是多场景模式
  if (options.scenes) {
    const predefinedScenes = [
      { name: 'Home', value: 1001, pagePath: 'pages/index/index' },
      { name: 'GymList', value: 1005, pagePath: 'pages/gym/list' },
      { name: 'Login', value: 1011, pagePath: 'pages/auth/login' },
      { name: 'Booking', value: 1020, pagePath: 'pages/booking/create' }
    ];
    
    try {
      const generator = new PreviewQRGenerator();
      const results = await generator.generateMultipleScenes(options, predefinedScenes);
      
      const successCount = results.filter(r => r.success).length;
      console.log(`\n🎉 多场景预览生成完成！成功: ${successCount}/${results.length}`);
      
    } catch (error) {
      console.error('❌ 多场景预览生成失败:', error.message);
      process.exit(1);
    }
    return;
  }

  // 单个预览模式
  if (!options.appid || !options['private-key'] || !options['project-path']) {
    console.error('❌ 缺少必需参数');
    console.error('使用方法:');
    console.error('  node generate-preview-qr.js \\');
    console.error('    --appid "wx0a950fd30b3c2146" \\');
    console.error('    --private-key "/path/to/private.key" \\');
    console.error('    --project-path "/path/to/miniprogram" \\');
    console.error('    --output "preview-qr-code.png"');
    console.error('');
    console.error('多场景预览:');
    console.error('  添加 --scenes 参数生成多个场景的预览');
    process.exit(1);
  }

  try {
    const generator = new PreviewQRGenerator();
    
    const config = {
      appid: options.appid,
      privateKey: options['private-key'],
      projectPath: options['project-path'],
      output: options.output,
      desc: options.desc,
      pagePath: options['page-path'],
      searchQuery: options['search-query'],
      scene: options.scene
    };

    const result = await generator.generateQRCode(config);
    
    if (result.success) {
      console.log('🎉 预览二维码生成完成！');
    }
    
  } catch (error) {
    console.error('❌ 生成失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PreviewQRGenerator };