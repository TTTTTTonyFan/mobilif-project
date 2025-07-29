#!/usr/bin/env node

/**
 * 彻底验证和测试微信小程序CI
 * 清理环境、验证私钥、测试连接
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class WeChatCIVerifier {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, 'config/miniprogram-config.json');
    this.privateKeyPath = path.join(this.projectRoot, 'config/keys/private.wx0a950fd30b3c2146.key');
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[34m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message, stdout, stderr });
        } else {
          resolve({ success: true, stdout: stdout.trim(), stderr });
        }
      });
    });
  }

  async clearAllProxy() {
    this.log('🧹 彻底清除所有代理设置...', 'info');
    
    const commands = [
      'unset HTTP_PROXY',
      'unset HTTPS_PROXY',
      'unset http_proxy',
      'unset https_proxy',
      'npm config delete proxy',
      'npm config delete https-proxy',
      'git config --global --unset http.proxy',
      'git config --global --unset https.proxy'
    ];

    for (const cmd of commands) {
      const result = await this.execCommand(cmd);
      if (result.success) {
        this.log(`✅ ${cmd}`, 'success');
      }
    }

    // 清除环境变量
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;

    this.log('✅ 代理设置已彻底清除', 'success');
  }

  async verifyPrivateKey() {
    this.log('🔍 验证私钥文件...', 'info');
    
    if (!fs.existsSync(this.privateKeyPath)) {
      this.log('❌ 私钥文件不存在', 'error');
      this.log(`📍 期望位置: ${this.privateKeyPath}`, 'info');
      return false;
    }

    const keyContent = fs.readFileSync(this.privateKeyPath, 'utf8');
    
    // 检查私钥格式
    if (!keyContent.includes('-----BEGIN PRIVATE KEY-----') || 
        !keyContent.includes('-----END PRIVATE KEY-----')) {
      this.log('❌ 私钥文件格式不正确', 'error');
      this.log('💡 私钥应该包含 BEGIN PRIVATE KEY 和 END PRIVATE KEY 标识', 'warning');
      return false;
    }

    // 检查私钥长度
    const keyLines = keyContent.trim().split('\\n').filter(line => 
      !line.includes('BEGIN') && !line.includes('END')
    );
    
    if (keyLines.length < 10) {
      this.log('⚠️ 私钥内容可能不完整', 'warning');
    }

    this.log('✅ 私钥文件格式正确', 'success');
    this.log(`📄 私钥文件大小: ${keyContent.length} 字符`, 'info');
    return true;
  }

  async testNetworkConnectivity() {
    this.log('🌐 测试网络连接...', 'info');
    
    const testUrls = [
      'https://servicewechat.com',
      'https://api.weixin.qq.com'
    ];

    for (const url of testUrls) {
      const result = await this.execCommand(`curl -s -o /dev/null -w "%{http_code}" "${url}"`);
      
      if (result.success && result.stdout === '200') {
        this.log(`✅ ${url} 连接正常`, 'success');
      } else {
        this.log(`❌ ${url} 连接失败`, 'error');
      }
    }
  }

  async testMiniprogramCI() {
    this.log('🧪 测试微信小程序CI预览...', 'info');
    
    // 设置纯净的环境变量
    const cleanEnv = {
      ...process.env,
      HTTP_PROXY: undefined,
      HTTPS_PROXY: undefined,
      http_proxy: undefined,
      https_proxy: undefined,
      NODE_OPTIONS: '--dns-result-order=ipv4first'
    };

    try {
      const ci = require('miniprogram-ci');
      
      const project = new ci.Project({
        appid: 'wx0a950fd30b3c2146',
        type: 'miniProgram',
        projectPath: '/Users/tonyfan/WeChatProjects/miniprogram-1',
        privateKeyPath: this.privateKeyPath,
        ignores: ['node_modules/**/*']
      });

      console.log('');
      this.log('📱 项目配置验证成功', 'success');
      this.log('🚀 开始生成预览二维码...', 'info');

      const result = await ci.preview({
        project,
        desc: '验证测试版本 - ' + new Date().toLocaleString(),
        setting: {
          es6: true,
          es7: true,
          minify: false,
          codeProtect: false,
          uploadWithSourceMap: true
        },
        qrcodeFormat: 'image',
        qrcodeOutputDest: path.join(this.projectRoot, 'preview-qr-code.png'),
        pagePath: 'pages/index/index',
        searchQuery: '',
        scene: 1001,
        robot: 1
      });

      this.log('🎉 预览二维码生成成功！', 'success');
      this.log(`📱 二维码保存位置: ${path.join(this.projectRoot, 'preview-qr-code.png')}`, 'info');
      
      return true;

    } catch (error) {
      this.log(`❌ 预览生成失败: ${error.message}`, 'error');
      
      // 分析错误类型
      if (error.message.includes('invalid ip')) {
        this.log('💡 IP白名单问题，请确认以下IP已添加:', 'warning');
        console.log('   - 152.67.99.47');
        console.log('   - 192.168.1.4');
      } else if (error.message.includes('private key') || error.message.includes('ticket')) {
        this.log('💡 私钥或认证问题，请检查:', 'warning');
        console.log('   1. 私钥文件是否为最新重置的版本');
        console.log('   2. 微信公众平台私钥是否已生效');
        console.log('   3. AppID是否正确: wx0a950fd30b3c2146');
      }
      
      return false;
    }
  }

  async generateDiagnosticReport() {
    this.log('📊 生成诊断报告...', 'info');
    
    const report = {
      timestamp: new Date().toISOString(),
      privateKeyExists: fs.existsSync(this.privateKeyPath),
      privateKeySize: fs.existsSync(this.privateKeyPath) ? 
        fs.readFileSync(this.privateKeyPath, 'utf8').length : 0,
      configExists: fs.existsSync(this.configPath),
      projectExists: fs.existsSync('/Users/tonyfan/WeChatProjects/miniprogram-1'),
      networkTest: await this.execCommand('curl -s https://httpbin.org/ip'),
      environmentVariables: {
        HTTP_PROXY: process.env.HTTP_PROXY,
        HTTPS_PROXY: process.env.HTTPS_PROXY,
        NODE_OPTIONS: process.env.NODE_OPTIONS
      }
    };

    fs.writeFileSync(
      path.join(this.projectRoot, 'wechat-ci-diagnostic.json'), 
      JSON.stringify(report, null, 2)
    );

    this.log('✅ 诊断报告已保存: wechat-ci-diagnostic.json', 'success');
  }

  async run() {
    console.log('🔧 MobiLiF 微信小程序CI验证工具');
    console.log('================================');

    try {
      // 1. 清除代理设置
      await this.clearAllProxy();
      console.log('');

      // 2. 验证私钥文件
      const keyValid = await this.verifyPrivateKey();
      console.log('');

      // 3. 测试网络连接
      await this.testNetworkConnectivity();
      console.log('');

      // 4. 测试微信小程序CI
      const testSuccess = await this.testMiniprogramCI();
      console.log('');

      // 5. 生成诊断报告
      await this.generateDiagnosticReport();
      console.log('');

      if (testSuccess) {
        this.log('🎉 微信小程序CI测试成功！', 'success');
        console.log('');
        console.log('📱 现在你可以正常使用以下命令:');
        console.log('• npm run mp:preview "描述" - 生成预览');
        console.log('• npm run mp:upload "版本" "描述" - 上传版本');
      } else {
        this.log('❌ 微信小程序CI仍有问题', 'error');
        console.log('');
        console.log('🔍 请检查诊断报告: wechat-ci-diagnostic.json');
        console.log('💡 常见解决方案:');
        console.log('1. 确认私钥文件是最新重置的版本');
        console.log('2. 等待微信公众平台私钥生效（可能需要几分钟）');
        console.log('3. 确认IP白名单包含当前网络的所有IP');
      }

    } catch (error) {
      this.log(`❌ 验证过程失败: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

const verifier = new WeChatCIVerifier();
verifier.run();