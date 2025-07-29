#!/usr/bin/env node

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
      console.log(`   AppID: ${this.config.appid}`);
      console.log(`   项目路径: ${this.config.projectPath}`);
      console.log(`   私钥文件: ${this.config.privateKeyPath}`);
      console.log(`   描述: ${desc}`);
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
            this.log(`📊 预览进度: ${Math.round(task.progress * 100)}%`, 'info');
          }
        }
      });

      this.log('✅ 预览二维码生成成功！', 'success');
      this.log(`📱 二维码位置: ${path.join(this.projectRoot, 'preview-qr-code.png')}`, 'info');
      this.log('🔧 使用机器人: ' + (this.config.robot || 1), 'info');
      
      console.log('');
      console.log('📋 使用说明:');
      console.log('1. 用微信扫描生成的二维码');
      console.log('2. 在手机上预览小程序效果');
      console.log('3. 确认功能正常后可进行上传');

      return result;

    } catch (error) {
      this.log(`❌ 预览失败: ${error.message}`, 'error');
      
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
