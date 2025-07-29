#!/usr/bin/env node

/**
 * 微信小程序CI官方解决方案
 * 严格按照官方文档规范实现
 * 文档: https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html
 */

const ci = require('miniprogram-ci');
const fs = require('fs');
const path = require('path');

class OfficialWeChatCI {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    
    // 从配置文件加载配置
    this.config = this.loadConfig();
    
    // 创建项目实例
    this.project = null;
  }

  loadConfig() {
    const configPath = path.join(this.projectRoot, 'config/miniprogram-config.json');
    
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    // 默认配置
    return {
      appid: 'wx0a950fd30b3c2146',
      type: 'miniProgram',
      projectPath: '/Users/tonyfan/WeChatProjects/miniprogram-1',
      privateKeyPath: path.join(this.projectRoot, 'config/keys/private.wx0a950fd30b3c2146.key'),
      ignores: ['node_modules/**/*', '.git/**/*', '*.log', '.DS_Store']
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: '\x1b[36m',     // 青色
      success: '\x1b[32m',  // 绿色
      warning: '\x1b[33m',  // 黄色
      error: '\x1b[31m',    // 红色
      reset: '\x1b[0m'      // 重置
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async initProject() {
    try {
      this.log('🔧 初始化项目配置...', 'info');
      
      // 验证必要文件
      if (!fs.existsSync(this.config.privateKeyPath)) {
        throw new Error(`私钥文件不存在: ${this.config.privateKeyPath}`);
      }
      
      if (!fs.existsSync(this.config.projectPath)) {
        throw new Error(`项目目录不存在: ${this.config.projectPath}`);
      }
      
      // 创建项目实例 - 严格按照官方文档
      this.project = new ci.Project({
        appid: this.config.appid,
        type: this.config.type || 'miniProgram',
        projectPath: this.config.projectPath,
        privateKeyPath: this.config.privateKeyPath,
        ignores: this.config.ignores || ['node_modules/**/*']
      });
      
      this.log('✅ 项目初始化成功', 'success');
      return true;
      
    } catch (error) {
      this.log(`❌ 项目初始化失败: ${error.message}`, 'error');
      return false;
    }
  }

  async preview(options = {}) {
    const {
      desc = '预览版本 - ' + new Date().toLocaleString(),
      qrcodeFormat = 'image',
      qrcodeOutputDest = path.join(this.projectRoot, 'preview-qrcode.jpg'),
      pagePath = 'pages/index/index',
      searchQuery = '',
      scene = 1011
    } = options;

    try {
      this.log('📱 开始生成预览二维码...', 'info');
      
      // 确保输出目录存在
      const outputDir = path.dirname(qrcodeOutputDest);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // 调用预览方法 - 严格按照官方文档
      const previewResult = await ci.preview({
        project: this.project,
        desc: desc,
        setting: {
          ...this.config.setting,
          es6: true,
          enhance: true,
          minified: true
        },
        qrcodeFormat: qrcodeFormat,
        qrcodeOutputDest: qrcodeOutputDest,
        pagePath: pagePath,
        searchQuery: searchQuery,
        scene: scene
      });
      
      this.log('✅ 预览二维码生成成功！', 'success');
      this.log(`📄 二维码文件: ${qrcodeOutputDest}`, 'info');
      
      // 显示使用说明
      console.log('\n📋 使用说明:');
      console.log('1. 使用微信扫描生成的二维码');
      console.log('2. 在手机上查看小程序预览效果');
      console.log('3. 二维码有效期为30分钟\n');
      
      return previewResult;
      
    } catch (error) {
      this.log(`❌ 预览失败: ${error.message}`, 'error');
      this.handleError(error);
      throw error;
    }
  }

  async upload(options = {}) {
    const {
      version = '1.0.0',
      desc = '版本更新 - ' + new Date().toLocaleString(),
      robot = 1
    } = options;

    try {
      this.log('📤 开始上传小程序...', 'info');
      this.log(`📦 版本号: ${version}`, 'info');
      this.log(`📝 描述: ${desc}`, 'info');
      
      // 调用上传方法 - 严格按照官方文档
      const uploadResult = await ci.upload({
        project: this.project,
        version: version,
        desc: desc,
        setting: {
          ...this.config.setting,
          es6: true,
          enhance: true,
          minified: true
        },
        robot: robot
      });
      
      this.log('✅ 小程序上传成功！', 'success');
      
      console.log('\n📋 后续步骤:');
      console.log('1. 登录微信公众平台');
      console.log('2. 在版本管理中查看上传的开发版本');
      console.log('3. 进行测试后提交审核\n');
      
      return uploadResult;
      
    } catch (error) {
      this.log(`❌ 上传失败: ${error.message}`, 'error');
      this.handleError(error);
      throw error;
    }
  }

  handleError(error) {
    const errorMessage = error.message || error.toString();
    
    console.log('\n💡 错误分析和解决方案:');
    console.log('==========================');
    
    if (errorMessage.includes('-80011')) {
      console.log('❌ 错误代码: -80011');
      console.log('📝 可能原因:');
      console.log('  1. 私钥文件格式错误或已失效');
      console.log('  2. AppID与私钥不匹配');
      console.log('  3. 私钥刚生成，需要等待几分钟生效');
      console.log('💡 解决方案:');
      console.log('  1. 重新生成并下载私钥文件');
      console.log('  2. 确认AppID正确: wx0a950fd30b3c2146');
      console.log('  3. 等待5-10分钟后重试');
    }
    
    if (errorMessage.includes('-10008') || errorMessage.includes('invalid ip')) {
      console.log('❌ 错误代码: -10008');
      console.log('📝 IP白名单问题');
      
      // 提取IP地址
      const ipMatch = errorMessage.match(/invalid ip: ([\w\.:]+)/);
      if (ipMatch) {
        console.log(`🌐 当前IP: ${ipMatch[1]}`);
        console.log('💡 解决方案:');
        console.log('  1. 登录微信公众平台');
        console.log('  2. 开发 → 开发管理 → 开发设置');
        console.log('  3. 在"小程序代码上传"部分添加IP白名单:');
        console.log(`     ${ipMatch[1]}`);
        
        // IPv6地址检测
        if (ipMatch[1].includes(':')) {
          console.log('\n⚠️  注意: 检测到IPv6地址');
          console.log('微信暂不支持IPv6白名单，建议:');
          console.log('  1. 使用IPv4网络环境');
          console.log('  2. 在系统中禁用IPv6');
          console.log('  3. 使用代理强制IPv4连接');
        }
      }
    }
    
    if (errorMessage.includes('private key')) {
      console.log('❌ 私钥文件问题');
      console.log('💡 解决方案:');
      console.log('  1. 确认私钥文件存在且可读');
      console.log('  2. 检查私钥格式是否正确');
      console.log('  3. 重新下载私钥文件');
    }
    
    if (errorMessage.includes('project')) {
      console.log('❌ 项目配置问题');
      console.log('💡 解决方案:');
      console.log('  1. 确认项目路径正确');
      console.log('  2. 检查project.config.json文件');
      console.log('  3. 确保AppID一致');
    }
    
    console.log('\n📚 参考文档:');
    console.log('https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html');
  }

  async checkEnvironment() {
    this.log('🔍 环境检查...', 'info');
    
    console.log('\n📋 配置信息:');
    console.log(`  AppID: ${this.config.appid}`);
    console.log(`  项目路径: ${this.config.projectPath}`);
    console.log(`  私钥文件: ${this.config.privateKeyPath}`);
    
    // 检查私钥文件
    if (fs.existsSync(this.config.privateKeyPath)) {
      const keyContent = fs.readFileSync(this.config.privateKeyPath, 'utf8');
      const keyType = keyContent.includes('BEGIN RSA PRIVATE KEY') ? 'RSA' : 
                     keyContent.includes('BEGIN PRIVATE KEY') ? 'PKCS#8' : '未知';
      console.log(`  私钥格式: ${keyType}`);
      console.log(`  私钥大小: ${keyContent.length} 字符`);
    } else {
      console.log('  私钥文件: ❌ 不存在');
    }
    
    // 检查项目目录
    if (fs.existsSync(this.config.projectPath)) {
      const hasAppJson = fs.existsSync(path.join(this.config.projectPath, 'app.json'));
      const hasProjectConfig = fs.existsSync(path.join(this.config.projectPath, 'project.config.json'));
      console.log(`  app.json: ${hasAppJson ? '✅' : '❌'}`);
      console.log(`  project.config.json: ${hasProjectConfig ? '✅' : '❌'}`);
    } else {
      console.log('  项目目录: ❌ 不存在');
    }
    
    // 检查网络
    console.log('\n🌐 网络信息:');
    console.log(`  NODE_OPTIONS: ${process.env.NODE_OPTIONS || '未设置'}`);
    console.log(`  HTTP_PROXY: ${process.env.HTTP_PROXY || '未设置'}`);
    console.log(`  HTTPS_PROXY: ${process.env.HTTPS_PROXY || '未设置'}`);
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    console.log('🎯 微信小程序CI工具（官方规范版）');
    console.log('=====================================\n');

    try {
      // 环境检查
      await this.checkEnvironment();
      console.log('');
      
      // 初始化项目
      const initialized = await this.initProject();
      if (!initialized) {
        return;
      }

      switch (command) {
        case 'preview':
          const previewDesc = args.slice(1).join(' ') || undefined;
          await this.preview({ desc: previewDesc });
          break;

        case 'upload':
          const version = args[1] || '1.0.0';
          const uploadDesc = args.slice(2).join(' ') || undefined;
          await this.upload({ version, desc: uploadDesc });
          break;

        case 'check':
          this.log('✅ 环境检查完成', 'success');
          break;

        case 'help':
        default:
          this.showHelp();
          break;
      }

    } catch (error) {
      this.log(`❌ 执行失败: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  showHelp() {
    console.log('📖 使用说明:');
    console.log('=====================================');
    console.log('预览:    node wechat-ci-official.js preview [描述]');
    console.log('上传:    node wechat-ci-official.js upload <版本> [描述]');
    console.log('检查:    node wechat-ci-official.js check');
    console.log('帮助:    node wechat-ci-official.js help');
    console.log('');
    console.log('📝 示例:');
    console.log('node wechat-ci-official.js preview "新功能测试"');
    console.log('node wechat-ci-official.js upload 1.0.1 "修复登录问题"');
  }
}

// 运行
const wechatCI = new OfficialWeChatCI();
wechatCI.run();