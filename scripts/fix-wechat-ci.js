#!/usr/bin/env node

/**
 * 微信小程序CI问题修复脚本
 * 自动诊断和修复常见的CI连接问题
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class WeChatCIFixer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, 'config/miniprogram-config.json');
    this.results = {};
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[34m',     // 蓝色
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

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  async getAllIPAddresses() {
    this.log('🌐 获取所有可能的IP地址...', 'info');
    
    const addresses = {};

    try {
      // 获取IPv4地址
      const ipv4 = await this.execCommand('curl -4 -s https://ipv4.icanhazip.com');
      if (ipv4) {
        addresses.ipv4 = ipv4.trim();
        this.log(`📍 IPv4地址: ${addresses.ipv4}`, 'info');
      }
    } catch (error) {
      this.log('⚠️ 无法获取IPv4地址', 'warning');
    }

    try {
      // 获取IPv6地址
      const ipv6 = await this.execCommand('curl -6 -s https://ipv6.icanhazip.com');
      if (ipv6) {
        addresses.ipv6 = ipv6.trim();
        this.log(`📍 IPv6地址: ${addresses.ipv6}`, 'info');
      }
    } catch (error) {
      this.log('⚠️ 无法获取IPv6地址', 'warning');
    }

    try {
      // 获取本地网络接口IP
      const localIPs = await this.execCommand('ifconfig | grep "inet " | grep -v 127.0.0.1 | awk \'{print $2}\'');
      if (localIPs) {
        addresses.local = localIPs.split('\n').filter(ip => ip.trim());
        this.log(`🏠 本地IP地址: ${addresses.local.join(', ')}`, 'info');
      }
    } catch (error) {
      this.log('⚠️ 无法获取本地IP地址', 'warning');
    }

    this.results.addresses = addresses;
    return addresses;
  }

  async createMiniprogramProject() {
    this.log('📂 检查小程序项目目录...', 'info');
    
    const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    const projectPath = config.projectPath;

    if (!fs.existsSync(projectPath)) {
      this.log(`📁 创建小程序项目目录: ${projectPath}`, 'info');
      
      try {
        fs.mkdirSync(projectPath, { recursive: true });
        
        // 创建基本的小程序文件结构
        await this.createBasicMiniprogramFiles(projectPath, config.appid);
        
        this.log('✅ 小程序项目目录创建成功', 'success');
        return true;
      } catch (error) {
        this.log(`❌ 创建项目目录失败: ${error.message}`, 'error');
        return false;
      }
    } else {
      this.log('✅ 小程序项目目录已存在', 'success');
      return true;
    }
  }

  async createBasicMiniprogramFiles(projectPath, appid) {
    // 创建 app.js
    const appJs = `App({
  onLaunch() {
    console.log('MobiLiF小程序启动');
  },
  globalData: {
    version: '1.0.0'
  }
});`;

    // 创建 app.json
    const appJson = {
      pages: [
        "pages/index/index"
      ],
      window: {
        navigationBarTitleText: "MobiLiF拓练",
        navigationBarBackgroundColor: "#FF6B6B",
        navigationBarTextStyle: "white",
        backgroundColor: "#f8f9fa"
      },
      tabBar: {
        list: [
          {
            pagePath: "pages/index/index",
            text: "首页",
            iconPath: "images/home.png",
            selectedIconPath: "images/home-active.png"
          }
        ]
      },
      version: "1.0.0"
    };

    // 创建 app.wxss
    const appWxss = `page {
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  padding: 20rpx;
}`;

    // 创建 project.config.json
    const projectConfig = {
      description: "MobiLiF CrossFit社交平台",
      packOptions: {
        ignore: []
      },
      setting: {
        urlCheck: true,
        es6: true,
        enhance: true,
        postcss: true,
        preloadBackgroundData: false,
        minified: true,
        newFeature: false,
        coverView: true,
        nodeModules: false,
        autoAudits: false,
        showShadowRootInWxmlPanel: true,
        scopeDataCheck: false,
        uglifyFileName: false,
        checkInvalidKey: true,
        checkSiteMap: true,
        uploadWithSourceMap: true,
        compileHotReLoad: false,
        useMultiFrameRuntime: true,
        useApiHook: true,
        babelSetting: {
          ignore: [],
          disablePlugins: [],
          outputPath: ""
        },
        bundle: false,
        useIsolateContext: true,
        useCompilerModule: true,
        userConfirmedUseCompilerModuleSwitch: false
      },
      compileType: "miniprogram",
      libVersion: "2.19.4",
      appid: appid,
      projectname: "MobiLiF",
      debugOptions: {
        hidedInDevtools: []
      },
      scripts: {},
      isGameTourist: false,
      condition: {
        search: {
          current: -1,
          list: []
        },
        conversation: {
          current: -1,
          list: []
        },
        game: {
          current: -1,
          list: []
        },
        plugin: {
          current: -1,
          list: []
        },
        gamePlugin: {
          current: -1,
          list: []
        },
        miniprogram: {
          current: -1,
          list: []
        }
      }
    };

    // 创建首页
    const indexJs = `Page({
  data: {
    title: 'MobiLiF拓练',
    subtitle: '发现附近优质CrossFit场馆'
  },
  onLoad() {
    console.log('首页加载完成');
  }
});`;

    const indexWxml = `<view class="container">
  <view class="header">
    <text class="title">{{title}}</text>
    <text class="subtitle">{{subtitle}}</text>
  </view>
  <view class="content">
    <text class="description">欢迎来到MobiLiF CrossFit社交平台</text>
  </view>
</view>`;

    const indexWxss = `.container {
  padding: 40rpx;
  text-align: center;
}

.header {
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #FF6B6B;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.content {
  padding: 40rpx;
  background: white;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.description {
  font-size: 32rpx;
  color: #333;
}`;

    // 写入文件
    fs.writeFileSync(path.join(projectPath, 'app.js'), appJs);
    fs.writeFileSync(path.join(projectPath, 'app.json'), JSON.stringify(appJson, null, 2));
    fs.writeFileSync(path.join(projectPath, 'app.wxss'), appWxss);
    fs.writeFileSync(path.join(projectPath, 'project.config.json'), JSON.stringify(projectConfig, null, 2));

    // 创建pages目录和首页
    const pagesDir = path.join(projectPath, 'pages/index');
    fs.mkdirSync(pagesDir, { recursive: true });
    
    fs.writeFileSync(path.join(pagesDir, 'index.js'), indexJs);
    fs.writeFileSync(path.join(pagesDir, 'index.wxml'), indexWxml);
    fs.writeFileSync(path.join(pagesDir, 'index.wxss'), indexWxss);

    // 创建package.json
    const packageJson = {
      name: "mobilif-miniprogram",
      version: "1.0.0",
      description: "MobiLiF CrossFit社交平台小程序",
      main: "app.js",
      scripts: {
        "build": "echo 'Building miniprogram...'",
        "test": "echo 'Testing miniprogram...'"
      },
      keywords: ["miniprogram", "crossfit", "fitness"],
      author: "MobiLiF Team",
      license: "MIT"
    };

    fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    this.log('📝 基本小程序文件创建完成', 'success');
  }

  async fixProxySettings() {
    this.log('🔧 修复代理设置...', 'info');
    
    const proxyCommands = [
      'unset HTTP_PROXY',
      'unset HTTPS_PROXY', 
      'unset http_proxy',
      'unset https_proxy',
      'npm config delete proxy',
      'npm config delete https-proxy'
    ];

    for (const cmd of proxyCommands) {
      try {
        await this.execCommand(cmd);
        this.log(`✅ 执行: ${cmd}`, 'success');
      } catch (error) {
        // 忽略错误，某些命令可能没有设置
      }
    }

    this.log('✅ 代理设置已清除', 'success');
  }

  async generateIPWhitelistGuide() {
    const addresses = this.results.addresses || {};
    
    console.log('\n📋 IP白名单配置指南');
    console.log('=================================');
    console.log('请在微信公众平台添加以下IP地址到白名单：');
    console.log('');
    console.log('🔗 访问地址: https://mp.weixin.qq.com');
    console.log('📍 路径: 开发 → 开发管理 → 开发设置 → 小程序代码上传');
    console.log('');
    console.log('🌐 需要添加的IP地址:');
    
    if (addresses.ipv4) {
      console.log(`   IPv4: ${addresses.ipv4}`);
    }
    
    if (addresses.ipv6) {
      console.log(`   IPv6: ${addresses.ipv6}`);
    }
    
    if (addresses.local && addresses.local.length > 0) {
      console.log(`   本地: ${addresses.local.join(', ')}`);
    }
    
    console.log('');
    console.log('💡 建议同时添加IPv4和IPv6地址以确保兼容性');
  }

  async testPreviewAfterFix() {
    this.log('🧪 测试修复后的预览功能...', 'info');
    
    try {
      // 等待一秒确保环境变量生效
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await this.execCommand('npm run mp:preview "修复测试版本"');
      this.log('✅ 预览测试成功', 'success');
      return true;
    } catch (error) {
      this.log(`⚠️ 预览测试仍有问题: ${error.message}`, 'warning');
      
      if (error.message.includes('invalid ip')) {
        this.log('💡 IP白名单问题，请按照上述指南添加IP地址', 'info');
      }
      
      return false;
    }
  }

  async run() {
    console.log('🔧 MobiLiF 微信小程序CI修复工具');
    console.log('===================================');

    try {
      // 1. 获取所有IP地址
      await this.getAllIPAddresses();
      console.log('');

      // 2. 创建/检查小程序项目
      await this.createMiniprogramProject();
      console.log('');

      // 3. 修复代理设置
      await this.fixProxySettings();
      console.log('');

      // 4. 生成IP白名单配置指南
      await this.generateIPWhitelistGuide();
      console.log('');

      // 5. 测试修复效果
      this.log('🧪 准备测试修复效果...', 'info');
      console.log('请先按照上述指南配置IP白名单，然后运行以下命令测试：');
      console.log('');
      console.log('npm run mp:preview "修复后测试"');
      console.log('');

      this.log('✅ 修复流程完成！', 'success');
      console.log('');
      console.log('📋 后续步骤:');
      console.log('1. 按照IP白名单指南配置微信公众平台');
      console.log('2. 运行 npm run mp:preview "测试描述" 测试预览');
      console.log('3. 运行 npm run mp:upload "版本号" "描述" 上传版本');
      console.log('4. 如仍有问题，运行 npm run mp:check 进行诊断');

    } catch (error) {
      this.log(`❌ 修复过程中发生错误: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// 运行修复工具
const fixer = new WeChatCIFixer();
fixer.run();