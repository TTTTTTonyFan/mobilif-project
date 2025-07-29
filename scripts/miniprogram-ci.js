#!/usr/bin/env node

/**
 * 微信小程序CI工具
 * 支持预览、上传、管理版本等功能
 * IP白名单: 115.171.9.126
 * 私钥文件: private.wx0a950fd30b3c2146.key
 */

const fs = require('fs');
const path = require('path');

class MiniprogramCI {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, 'config/miniprogram-config.json');
    
    // 加载配置文件
    if (fs.existsSync(this.configPath)) {
      this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } else {
      this.config = {
        appid: 'wx0a950fd30b3c2146',
        type: 'miniProgram',
        projectPath: '/Users/tonyfan/WeChatProjects/miniprogram-1',
        privateKeyPath: path.join(this.projectRoot, 'config/keys/private.wx0a950fd30b3c2146.key'),
        ignores: ['node_modules/**/*'],
        robot: 1,
        setting: {
          es6: true,
          es7: true,
          minify: false,
          codeProtect: false,
          minifyJS: false,
          minifyWXML: false,
          minifyWXSS: false,
          autoPrefixWXSS: true
        }
      };
    }
    
    this.allowedIP = this.config.ipWhitelist || '115.171.9.126';
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[34m',     // 蓝色
      success: '\x1b[32m',  // 绿色
      warning: '\x1b[33m',  // 黄色
      error: '\x1b[31m',    // 红色
      reset: '\x1b[0m'      // 重置
    };
    
    const timestamp = new Date().toLocaleTimeString();
    const icon = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${icon[type]} ${message}${colors.reset}`);
  }

  async checkPrerequisites() {
    const issues = [];

    // 检查miniprogram-ci依赖
    try {
      require.resolve('miniprogram-ci');
      this.log('miniprogram-ci 依赖检查通过', 'success');
    } catch (error) {
      issues.push({
        type: 'error',
        message: 'miniprogram-ci 未安装',
        solution: '运行: npm install miniprogram-ci --save-dev'
      });
    }

    // 检查私钥文件
    const privateKeyPath = this.config.privateKeyPath || path.join(this.projectRoot, 'config/keys/private.wx0a950fd30b3c2146.key');
    if (!fs.existsSync(privateKeyPath)) {
      issues.push({
        type: 'error',
        message: '私钥文件不存在',
        solution: `请确保私钥文件存在: ${privateKeyPath}`
      });
    } else {
      this.log('私钥文件检查通过', 'success');
    }

    // 检查小程序项目路径
    if (!fs.existsSync(this.config.projectPath)) {
      issues.push({
        type: 'warning',
        message: '小程序项目路径不存在',
        solution: `请创建或调整项目路径: ${this.config.projectPath}`
      });
    } else {
      this.log('小程序项目路径检查通过', 'success');
    }

    // 检查IP白名单提示
    this.log(`当前配置的IP白名单: ${this.allowedIP}`, 'info');
    this.log('请确认当前IP是否在微信公众平台的开发者工具白名单中', 'warning');

    return issues;
  }

  async getPublicIP() {
    try {
      const https = require('https');
      return new Promise((resolve) => {
        const req = https.get('https://httpbin.org/ip', { timeout: 5000 }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              resolve(result.origin);
            } catch (e) {
              resolve(null);
            }
          });
        });

        req.on('error', () => {
          // 备用方法：使用ifconfig获取本地IP
          const { exec } = require('child_process');
          exec('ifconfig | grep "inet " | grep -v 127.0.0.1 | awk \'{print $2}\'', (error, stdout) => {
            if (!error && stdout) {
              resolve(stdout.trim().split('\n')[0]);
            } else {
              resolve('无法获取IP');
            }
          });
        });

        req.on('timeout', () => {
          req.abort();
          resolve('获取超时');
        });
      });
    } catch (error) {
      return '获取失败';
    }
  }

  async preview(options = {}) {
    const {
      desc = '开发预览版本',
      qrcodeFormat = 'image',
      qrcodeOutputDest = './preview-qr-code.png',
      pagePath = 'pages/index/index',
      scene = 1001,
      robot = this.config.robot
    } = options;

    this.log('🚀 开始生成预览二维码...', 'info');

    try {
      // 检查依赖
      const ci = require('miniprogram-ci');

      // 创建项目对象
      const project = new ci.Project({
        appid: this.config.appid,
        type: this.config.type,
        projectPath: this.config.projectPath,
        privateKeyPath: this.config.privateKeyPath,
        ignores: this.config.ignores,
      });

      // 生成预览
      const previewResult = await ci.preview({
        project,
        desc,
        setting: this.config.setting,
        qrcodeFormat,
        qrcodeOutputDest: path.resolve(this.projectRoot, qrcodeOutputDest),
        pagePath,
        searchQuery: '',
        scene,
        robot
      });

      this.log('✅ 预览二维码生成成功！', 'success');
      this.log(`📱 二维码保存位置: ${path.resolve(this.projectRoot, qrcodeOutputDest)}`, 'info');
      this.log(`🤖 使用机器人: ${robot}`, 'info');
      this.log(`📝 版本描述: ${desc}`, 'info');

      // 显示使用说明
      console.log('\n📋 使用说明:');
      console.log('1. 用微信扫描生成的二维码');
      console.log('2. 在手机上预览小程序效果');
      console.log('3. 测试功能和界面是否正常');
      console.log('4. 确认无误后可进行正式上传');

      return previewResult;

    } catch (error) {
      this.log('❌ 预览生成失败: ' + error.message, 'error');
      
      // 提供详细的错误处理指导
      if (error.message.includes('appid')) {
        this.log('💡 AppID配置错误，请检查小程序AppID是否正确', 'warning');
      } else if (error.message.includes('private key')) {
        this.log('💡 私钥文件问题，请检查私钥文件路径和内容', 'warning');
      } else if (error.message.includes('ip')) {
        const currentIP = await this.getPublicIP();
        this.log(`💡 IP白名单问题，当前IP: ${currentIP}, 白名单IP: ${this.allowedIP}`, 'warning');
        this.log('   请在微信公众平台添加当前IP到白名单', 'warning');
      }
      
      throw error;
    }
  }

  async upload(options = {}) {
    const {
      version = '1.0.' + Date.now(),
      desc = '自动上传版本',
      robot = this.config.robot,
      threads = 4
    } = options;

    this.log(`🚀 开始上传小程序版本: ${version}`, 'info');

    try {
      const ci = require('miniprogram-ci');

      const project = new ci.Project({
        appid: this.config.appid,
        type: this.config.type,
        projectPath: this.config.projectPath,
        privateKeyPath: this.config.privateKeyPath,
        ignores: this.config.ignores,
      });

      const uploadResult = await ci.upload({
        project,
        version,
        desc,
        setting: this.config.setting,
        robot,
        threads,
        onProgressUpdate: (task) => {
          this.log(`上传进度: ${Math.round(task.progress * 100)}%`, 'info');
        }
      });

      this.log('✅ 小程序上传成功！', 'success');
      this.log(`📦 版本号: ${version}`, 'info');
      this.log(`🤖 使用机器人: ${robot}`, 'info');
      this.log(`📝 版本描述: ${desc}`, 'info');

      // 显示后续步骤
      console.log('\n📋 后续步骤:');
      console.log('1. 登录微信公众平台 (mp.weixin.qq.com)');
      console.log('2. 进入 版本管理 → 开发版本');
      console.log('3. 查看刚上传的版本并进行测试');
      console.log('4. 测试通过后提交审核');

      return uploadResult;

    } catch (error) {
      this.log('❌ 上传失败: ' + error.message, 'error');
      throw error;
    }
  }

  async checkIPWhitelist() {
    this.log('🔍 检查IP白名单配置...', 'info');
    
    const currentIP = await this.getPublicIP();
    if (currentIP) {
      this.log(`🌐 当前公网IP: ${currentIP}`, 'info');
      this.log(`📋 配置的白名单IP: ${this.allowedIP}`, 'info');
      
      if (currentIP === this.allowedIP) {
        this.log('✅ IP地址匹配白名单', 'success');
      } else {
        this.log('⚠️  IP地址不匹配白名单', 'warning');
        this.log('💡 解决方案:', 'info');
        console.log('   1. 登录微信公众平台 (mp.weixin.qq.com)');
        console.log('   2. 进入 开发 → 开发管理 → 开发设置');
        console.log('   3. 在 "小程序代码上传" 部分，添加IP白名单');
        console.log(`   4. 添加当前IP: ${currentIP}`);
      }
    }
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    console.log('🎯 MobiLiF 微信小程序 CI 工具');
    console.log('================================');

    try {
      // 检查前置条件
      const issues = await this.checkPrerequisites();
      
      if (issues.length > 0) {
        console.log('\n⚠️  发现以下问题:');
        issues.forEach((issue, index) => {
          const icon = issue.type === 'error' ? '❌' : '⚠️';
          console.log(`${icon} ${index + 1}. ${issue.message}`);
          console.log(`   解决方案: ${issue.solution}`);
        });

        const hasErrors = issues.some(issue => issue.type === 'error');
        if (hasErrors) {
          this.log('请先解决上述错误后重试', 'error');
          process.exit(1);
        }
      }

      switch (command) {
        case 'preview':
          await this.checkIPWhitelist();
          const desc = args[1] || '开发预览版本 - ' + new Date().toLocaleString();
          await this.preview({ desc });
          break;

        case 'upload':
          await this.checkIPWhitelist();
          const version = args[1] || '1.0.' + Date.now();
          const uploadDesc = args[2] || '自动上传版本 - ' + new Date().toLocaleString();
          await this.upload({ version, desc: uploadDesc });
          break;

        case 'check-ip':
          await this.checkIPWhitelist();
          break;

        case 'help':
        default:
          this.showHelp();
          break;
      }

    } catch (error) {
      this.log('❌ 执行失败: ' + error.message, 'error');
      process.exit(1);
    }
  }

  showHelp() {
    console.log('\n📖 使用说明:');
    console.log('================================');
    console.log('preview [描述]          生成预览二维码');
    console.log('upload [版本] [描述]     上传小程序版本');
    console.log('check-ip               检查IP白名单状态');
    console.log('help                   显示帮助信息');
    console.log('');
    console.log('📝 示例:');
    console.log('node scripts/miniprogram-ci.js preview "新增场馆列表功能"');
    console.log('node scripts/miniprogram-ci.js upload "1.0.1" "修复用户登录问题"');
    console.log('');
    console.log('⚙️  配置信息:');
    console.log(`AppID: ${this.config.appid}`);
    console.log(`私钥文件: ${this.config.privateKeyPath}`);
    console.log(`IP白名单: ${this.allowedIP}`);
    console.log(`项目路径: ${this.config.projectPath}`);
  }
}

// 运行CI工具
const ci = new MiniprogramCI();
ci.run().catch(console.error);

module.exports = MiniprogramCI;