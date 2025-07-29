#!/usr/bin/env node

/**
 * 强制IPv4连接的微信小程序CI工具
 * 解决IPv6地址导致的IP白名单问题
 */

const fs = require('fs');
const path = require('path');
const dns = require('dns');

class ForceIPv4WeChat {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, 'config/miniprogram-config.json');
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

  async forceIPv4DNS() {
    this.log('🔧 配置强制IPv4 DNS解析...', 'info');
    
    // 设置DNS解析为仅IPv4
    dns.setDefaultResultOrder('ipv4first');
    
    // 创建自定义DNS解析配置
    const dnsConfig = `
# MobiLiF 微信小程序CI - 强制IPv4配置
# 添加到 /etc/hosts 文件中（需要管理员权限）

# 微信服务器IPv4地址（示例，实际需要查询）
# 183.3.226.35 servicewechat.com
# 183.3.226.35 api.weixin.qq.com
# 183.3.226.35 mp.weixin.qq.com
`;

    fs.writeFileSync(path.join(this.projectRoot, 'wechat-ipv4-hosts.txt'), dnsConfig);
    this.log('✅ IPv4配置文件已生成: wechat-ipv4-hosts.txt', 'success');
  }

  async createIPv4OnlyCI() {
    this.log('📝 创建强制IPv4的CI脚本...', 'info');
    
    const ipv4CIScript = `#!/usr/bin/env node

/**
 * IPv4-only 微信小程序CI
 * 强制使用IPv4连接，避免IPv6白名单问题
 */

const fs = require('fs');
const path = require('path');
const dns = require('dns');

// 强制IPv4解析
dns.setDefaultResultOrder('ipv4first');

class IPv4MiniprogramCI {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, 'config/miniprogram-config.json');
    this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
  }

  log(message, type = 'info') {
    const colors = {
      info: '\\x1b[34m',
      success: '\\x1b[32m',
      warning: '\\x1b[33m',
      error: '\\x1b[31m',
      reset: '\\x1b[0m'
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    console.log(\`\${colors[type]}\${icons[type]} \${message}\${colors.reset}\`);
  }

  async preview(desc = '强制IPv4预览版本') {
    this.log('🚀 使用IPv4连接生成预览...', 'info');
    
    try {
      // 设置环境变量强制IPv4
      process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';
      
      const ci = require('miniprogram-ci');
      
      const project = new ci.Project({
        appid: this.config.appid,
        type: this.config.type || 'miniProgram',
        projectPath: this.config.projectPath,
        privateKeyPath: this.config.privateKeyPath,
        ignores: this.config.ignores || ['node_modules/**/*'],
      });

      console.log('📱 项目信息:');
      console.log(\`   AppID: \${this.config.appid}\`);
      console.log(\`   项目路径: \${this.config.projectPath}\`);
      console.log(\`   私钥文件: \${this.config.privateKeyPath}\`);
      console.log(\`   描述: \${desc}\`);
      console.log('');

      const result = await ci.preview({
        project,
        desc,
        setting: {
          ...this.config.setting,
          es6: true,
          es7: true,
          minify: false,
          uploadWithSourceMap: true
        },
        qrcodeFormat: 'image',
        qrcodeOutputDest: path.join(this.projectRoot, 'preview-qr-code.png'),
        pagePath: 'pages/index/index',
        searchQuery: '',
        scene: 1001,
        robot: this.config.robot || 1,
        onProgressUpdate: (task) => {
          if (task.progress !== undefined) {
            this.log(\`📊 预览进度: \${Math.round(task.progress * 100)}%\`, 'info');
          }
        }
      });

      this.log('✅ 预览二维码生成成功！', 'success');
      this.log(\`📱 二维码位置: \${path.join(this.projectRoot, 'preview-qr-code.png')}\`, 'info');
      this.log('🔧 使用机器人: ' + (this.config.robot || 1), 'info');
      
      console.log('');
      console.log('📋 使用说明:');
      console.log('1. 用微信扫描生成的二维码');
      console.log('2. 在手机上预览小程序效果');
      console.log('3. 确认功能正常后可进行上传');

      return result;

    } catch (error) {
      this.log(\`❌ 预览失败: \${error.message}\`, 'error');
      
      if (error.message.includes('invalid ip')) {
        this.log('💡 仍有IP问题，可能需要更新白名单', 'warning');
      } else if (error.message.includes('private key')) {
        this.log('💡 私钥问题，请检查私钥文件是否正确', 'warning');
      }
      
      throw error;
    }
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0] || 'preview';
    const desc = args.slice(1).join(' ') || '强制IPv4预览版本';

    console.log('🎯 MobiLiF IPv4-Only 微信小程序 CI');
    console.log('===================================');

    try {
      if (command === 'preview') {
        await this.preview(desc);
      } else {
        console.log('使用方法: node ipv4-wechat-ci.js preview [描述]');
      }
    } catch (error) {
      console.error('❌ 执行失败:', error.message);
      process.exit(1);
    }
  }
}

const ci = new IPv4MiniprogramCI();
ci.run();
`;

    fs.writeFileSync(path.join(this.projectRoot, 'scripts/ipv4-wechat-ci.js'), ipv4CIScript);
    this.log('✅ IPv4-only CI脚本已创建', 'success');
  }

  async updateNetworkConfig() {
    this.log('⚙️ 更新网络配置...', 'info');
    
    // 创建网络配置脚本
    const networkScript = `#!/bin/bash

# 强制IPv4网络配置脚本
echo "🔧 配置强制IPv4网络环境..."

# 清除所有代理设置
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
npm config delete proxy 2>/dev/null || true
npm config delete https-proxy 2>/dev/null || true

# 设置Node.js使用IPv4优先
export NODE_OPTIONS="--dns-result-order=ipv4first"

# 禁用IPv6（临时）
# sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
# sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1

echo "✅ IPv4网络配置完成"
echo "💡 运行 'npm run mp:ipv4' 使用IPv4-only预览"
`;

    fs.writeFileSync(path.join(this.projectRoot, 'scripts/setup-ipv4-network.sh'), networkScript);
    
    // 给脚本添加执行权限
    const { exec } = require('child_process');
    exec('chmod +x scripts/setup-ipv4-network.sh', (error) => {
      if (error) {
        this.log('⚠️ 无法设置脚本权限', 'warning');
      } else {
        this.log('✅ IPv4网络配置脚本已创建', 'success');
      }
    });
  }

  async checkPrivateKey() {
    this.log('🔍 检查私钥文件...', 'info');
    
    const privateKeyPath = path.join(this.projectRoot, 'config/keys/private.wx0a950fd30b3c2146.key');
    
    if (fs.existsSync(privateKeyPath)) {
      const keyContent = fs.readFileSync(privateKeyPath, 'utf8');
      
      if (keyContent.includes('-----BEGIN PRIVATE KEY-----')) {
        this.log('✅ 私钥文件格式正确', 'success');
      } else {
        this.log('⚠️ 私钥文件格式可能有问题', 'warning');
      }
      
      this.log(`📄 私钥文件位置: ${privateKeyPath}`, 'info');
    } else {
      this.log('❌ 私钥文件不存在', 'error');
      this.log('💡 请确保私钥文件已放置在正确位置', 'info');
    }
  }

  async run() {
    console.log('🔧 MobiLiF 强制IPv4配置工具');
    console.log('===============================');

    try {
      // 1. 检查私钥文件
      await this.checkPrivateKey();
      console.log('');

      // 2. 配置强制IPv4 DNS
      await this.forceIPv4DNS();
      console.log('');

      // 3. 创建IPv4-only CI脚本
      await this.createIPv4OnlyCI();
      console.log('');

      // 4. 更新网络配置
      await this.updateNetworkConfig();
      console.log('');

      this.log('✅ IPv4配置完成！', 'success');
      console.log('');
      console.log('📋 后续步骤:');
      console.log('1. 运行 bash scripts/setup-ipv4-network.sh 配置网络');
      console.log('2. 运行 npm run mp:ipv4 "测试描述" 进行IPv4预览');
      console.log('3. 如果仍有问题，可能需要在路由器级别禁用IPv6');
      console.log('');
      console.log('💡 IPv4白名单确保包含: 152.67.99.47, 192.168.1.4');

    } catch (error) {
      this.log(`❌ 配置失败: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

const forceIPv4 = new ForceIPv4WeChat();
forceIPv4.run();