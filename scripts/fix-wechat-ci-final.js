#!/usr/bin/env node

/**
 * 最终修复微信小程序CI工具
 * 解决私钥格式和IPv6网络问题
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const ci = require('miniprogram-ci');

class FinalWeChatCIFix {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, 'config/miniprogram-config.json');
    this.privateKeyPath = path.join(this.projectRoot, 'config/keys/private.wx0a950fd30b3c2146.key');
    this.pkcs8KeyPath = path.join(this.projectRoot, 'config/keys/private.wx0a950fd30b3c2146.pkcs8.key');
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',     // 青色
      success: '\x1b[32m',  // 绿色
      warning: '\x1b[33m',  // 黄色
      error: '\x1b[31m',    // 红色
      reset: '\x1b[0m'      // 重置
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  async execCommand(command, silent = false) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (!silent) {
          if (stdout) console.log(stdout);
          if (stderr) console.log(stderr);
        }
        
        if (error) {
          resolve({ success: false, error: error.message, stdout, stderr });
        } else {
          resolve({ success: true, stdout: stdout.trim(), stderr });
        }
      });
    });
  }

  async convertPrivateKeyToPKCS8() {
    this.log('🔑 转换私钥格式为PKCS#8...', 'info');
    
    if (!fs.existsSync(this.privateKeyPath)) {
      this.log('❌ 原私钥文件不存在', 'error');
      return false;
    }

    // 检查原私钥格式
    const originalKey = fs.readFileSync(this.privateKeyPath, 'utf8');
    if (originalKey.includes('BEGIN PRIVATE KEY')) {
      this.log('✅ 私钥已经是PKCS#8格式', 'success');
      return true;
    }

    // 使用OpenSSL转换RSA私钥到PKCS#8格式
    const convertCommand = `openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in "${this.privateKeyPath}" -out "${this.pkcs8KeyPath}"`;
    
    const result = await this.execCommand(convertCommand, true);
    
    if (result.success) {
      // 验证转换后的私钥
      if (fs.existsSync(this.pkcs8KeyPath)) {
        const convertedKey = fs.readFileSync(this.pkcs8KeyPath, 'utf8');
        if (convertedKey.includes('BEGIN PRIVATE KEY')) {
          this.log('✅ 私钥成功转换为PKCS#8格式', 'success');
          
          // 备份原文件并替换
          fs.copyFileSync(this.privateKeyPath, this.privateKeyPath + '.rsa.bak');
          fs.copyFileSync(this.pkcs8KeyPath, this.privateKeyPath);
          fs.unlinkSync(this.pkcs8KeyPath);
          
          this.log('✅ 私钥文件已更新', 'success');
          return true;
        }
      }
    }
    
    this.log('❌ 私钥转换失败，请确保系统已安装OpenSSL', 'error');
    this.log('💡 macOS用户可通过 brew install openssl 安装', 'info');
    return false;
  }

  async forceIPv4Connection() {
    this.log('🌐 配置强制IPv4连接...', 'info');
    
    // 清除所有代理设置
    const proxyCommands = [
      'unset HTTP_PROXY',
      'unset HTTPS_PROXY', 
      'unset http_proxy',
      'unset https_proxy'
    ];

    for (const cmd of proxyCommands) {
      await this.execCommand(cmd, true);
    }

    // 清除npm代理
    await this.execCommand('npm config delete proxy', true);
    await this.execCommand('npm config delete https-proxy', true);

    // 清除环境变量
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.http_proxy;
    delete process.env.https_proxy;

    this.log('✅ 代理设置已清除', 'success');
  }

  async testWithIPv4() {
    this.log('🧪 使用IPv4测试小程序预览...', 'info');
    
    try {
      // 设置强制IPv4的环境变量
      const env = {
        ...process.env,
        NODE_OPTIONS: '--dns-result-order=ipv4first',
        HTTP_PROXY: undefined,
        HTTPS_PROXY: undefined,
        http_proxy: undefined,
        https_proxy: undefined
      };

      // 创建项目实例
      const project = new ci.Project({
        appid: 'wx0a950fd30b3c2146',
        type: 'miniProgram',
        projectPath: '/Users/tonyfan/WeChatProjects/miniprogram-1',
        privateKeyPath: this.privateKeyPath,
        ignores: ['node_modules/**/*']
      });

      this.log('📱 开始生成预览二维码...', 'info');
      
      const previewResult = await ci.preview({
        project,
        desc: '最终修复测试版本 - ' + new Date().toLocaleString(),
        setting: {
          es6: true,
          es7: true,
          minify: false,
          codeProtect: false,
          uploadWithSourceMap: true
        },
        qrcodeFormat: 'image',
        qrcodeOutputDest: path.join(this.projectRoot, 'final-preview-qr.png'),
        pagePath: 'pages/index/index',
        searchQuery: '',
        scene: 1001,
        robot: 1
      });

      this.log('🎉 预览二维码生成成功！', 'success');
      this.log(`📱 二维码保存在: ${path.join(this.projectRoot, 'final-preview-qr.png')}`, 'info');
      
      console.log('\n📋 使用说明:');
      console.log('1. 使用微信扫描生成的二维码');
      console.log('2. 在手机上查看小程序预览效果');
      console.log('3. 二维码有效期为30分钟\n');
      
      return true;

    } catch (error) {
      this.log(`❌ 预览生成失败: ${error.message}`, 'error');
      
      // 详细错误分析
      const errorMessage = error.message;
      
      if (errorMessage.includes('-80011')) {
        this.log('🔍 错误分析: 私钥认证问题', 'warning');
        console.log('💡 可能的解决方案:');
        console.log('1. 私钥刚重置，等待5-10分钟后重试');
        console.log('2. 登录微信公众平台确认私钥状态');
        console.log('3. 重新下载最新的私钥文件');
      } else if (errorMessage.includes('-10008') || errorMessage.includes('invalid ip')) {
        this.log('🔍 错误分析: IP白名单问题', 'warning');
        console.log('💡 可能的解决方案:');
        console.log('1. 系统仍在使用IPv6，尝试系统级禁用IPv6');
        console.log('2. 使用IPv4热点或有线网络');
        console.log('3. 联系网络管理员配置IPv4优先');
      }
      
      return false;
    }
  }

  async generateSystemIPv6DisableScript() {
    this.log('📝 生成系统级IPv6禁用脚本...', 'info');
    
    const disableScript = `#!/bin/bash

# MobiLiF - 系统级禁用IPv6脚本
# 注意：此操作需要管理员权限，会影响系统网络设置

echo "🚫 正在禁用系统IPv6..."

# 临时禁用IPv6
sudo sysctl -w net.inet6.ip6.accept_rtadv=0
sudo sysctl -w net.inet6.ip6.forwarding=0

# 永久禁用IPv6（重启后生效）
if ! grep -q "net.inet6.ip6.accept_rtadv=0" /etc/sysctl.conf 2>/dev/null; then
    echo "net.inet6.ip6.accept_rtadv=0" | sudo tee -a /etc/sysctl.conf
fi

if ! grep -q "net.inet6.ip6.forwarding=0" /etc/sysctl.conf 2>/dev/null; then
    echo "net.inet6.ip6.forwarding=0" | sudo tee -a /etc/sysctl.conf
fi

echo "✅ IPv6已禁用，请重启系统后测试"
echo "💡 如需恢复IPv6，请删除 /etc/sysctl.conf 中添加的配置行"
`;

    fs.writeFileSync(path.join(this.projectRoot, 'disable-ipv6.sh'), disableScript);
    await this.execCommand(`chmod +x ${path.join(this.projectRoot, 'disable-ipv6.sh')}`, true);
    
    this.log('✅ IPv6禁用脚本已生成: disable-ipv6.sh', 'success');
  }

  async run() {
    console.log('🔧 MobiLiF 微信小程序CI最终修复工具');
    console.log('==========================================\n');

    try {
      // 1. 转换私钥格式
      const keyConverted = await this.convertPrivateKeyToPKCS8();
      console.log('');
      
      // 2. 强制IPv4连接
      await this.forceIPv4Connection();
      console.log('');
      
      // 3. 测试预览功能
      const testSuccess = await this.testWithIPv4();
      console.log('');
      
      if (testSuccess) {
        this.log('🎉 修复成功！微信小程序CI现在可以正常工作', 'success');
        console.log('\n📱 可用命令:');
        console.log('• npm run mp:preview "描述" - 生成预览');
        console.log('• npm run mp:upload "版本" "描述" - 上传版本');
        console.log('• node scripts/wechat-ci-official.js preview - 使用官方工具预览');
      } else {
        this.log('⚠️ 仍有问题需要解决', 'warning');
        
        // 4. 生成IPv6禁用脚本
        await this.generateSystemIPv6DisableScript();
        console.log('');
        
        console.log('🔧 进一步解决方案:');
        console.log('');
        console.log('私钥问题解决方案:');
        console.log('1. 等待5-10分钟后重试（新私钥需要时间生效）');
        console.log('2. 登录微信公众平台重新生成私钥');
        console.log('3. 确认AppID和私钥匹配');
        console.log('');
        console.log('IPv6网络问题解决方案:');
        console.log('1. 运行 ./disable-ipv6.sh 禁用系统IPv6（需要管理员权限）');
        console.log('2. 使用IPv4网络环境（如手机热点）');
        console.log('3. 联系网络管理员配置IPv4优先级');
        console.log('');
        console.log('📄 查看详细诊断: wechat-ci-diagnostic.json');
      }

    } catch (error) {
      this.log(`❌ 修复过程失败: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

const fixer = new FinalWeChatCIFix();
fixer.run();