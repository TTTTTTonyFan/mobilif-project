#!/usr/bin/env node

/**
 * 微信小程序CI配置向导
 * 帮助用户设置正确的小程序项目路径和配置
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class MiniprogramSetup {
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
    
    const icon = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    console.log(`${colors[type]}${icon[type]} ${message}${colors.reset}`);
  }

  async prompt(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  async checkCurrentConfig() {
    this.log('🔍 检查当前配置...', 'info');
    
    // 检查私钥文件
    if (fs.existsSync(this.privateKeyPath)) {
      this.log('私钥文件存在: ' + this.privateKeyPath, 'success');
    } else {
      this.log('私钥文件不存在: ' + this.privateKeyPath, 'error');
      return false;
    }

    // 检查现有配置
    if (fs.existsSync(this.configPath)) {
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      this.log('发现现有配置:', 'info');
      console.log(JSON.stringify(config, null, 2));
      return config;
    }

    return null;
  }

  async findWeChatProjects() {
    this.log('🔍 搜索微信小程序项目...', 'info');
    
    const possiblePaths = [
      path.join(process.env.HOME, 'WeChatProjects'),
      path.join(process.env.HOME, 'Documents/WeChatProjects'),
      path.join(process.env.HOME, 'Desktop/WeChatProjects'),
      path.join(process.env.HOME, 'Desktop/MobiLiF项目/小程序代码'),
      '/Users/tonyfan/WeChatProjects'
    ];

    const foundProjects = [];

    for (const dir of possiblePaths) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const projectPath = path.join(dir, file);
            const stat = fs.statSync(projectPath);
            if (stat.isDirectory()) {
              // 检查是否是微信小程序项目
              const appJsonPath = path.join(projectPath, 'app.json');
              const projectConfigPath = path.join(projectPath, 'project.config.json');
              
              if (fs.existsSync(appJsonPath) || fs.existsSync(projectConfigPath)) {
                foundProjects.push({
                  name: file,
                  path: projectPath,
                  hasAppJson: fs.existsSync(appJsonPath),
                  hasProjectConfig: fs.existsSync(projectConfigPath)
                });
              }
            }
          }
        } catch (error) {
          // 忽略无法访问的目录
        }
      }
    }

    return foundProjects;
  }

  async setupConfiguration() {
    console.log('🎯 MobiLiF 微信小程序 CI 配置向导');
    console.log('=================================');

    // 检查当前配置
    const currentConfig = await this.checkCurrentConfig();
    if (currentConfig === false) {
      this.log('请先确保私钥文件存在后重新运行配置向导', 'error');
      return;
    }

    // 搜索小程序项目
    const projects = await this.findWeChatProjects();
    
    let selectedProjectPath;

    if (projects.length > 0) {
      this.log('找到以下微信小程序项目:', 'success');
      projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name}`);
        console.log(`   路径: ${project.path}`);
        console.log(`   app.json: ${project.hasAppJson ? '✅' : '❌'}`);
        console.log(`   project.config.json: ${project.hasProjectConfig ? '✅' : '❌'}`);
        console.log('');
      });

      const choice = await this.prompt(`请选择项目 (1-${projects.length}), 或输入 'custom' 自定义路径: `);
      
      if (choice.toLowerCase() === 'custom') {
        selectedProjectPath = await this.prompt('请输入小程序项目的完整路径: ');
      } else {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < projects.length) {
          selectedProjectPath = projects[index].path;
        } else {
          this.log('无效选择，使用默认路径', 'warning');
          selectedProjectPath = '/Users/tonyfan/WeChatProjects/miniprogram-1';
        }
      }
    } else {
      this.log('未找到微信小程序项目，请手动输入项目路径', 'warning');
      selectedProjectPath = await this.prompt('请输入小程序项目的完整路径: ');
    }

    // 验证项目路径
    if (!fs.existsSync(selectedProjectPath)) {
      const createDir = await this.prompt(`项目路径不存在，是否创建? (y/n): `);
      if (createDir.toLowerCase() === 'y' || createDir.toLowerCase() === 'yes') {
        try {
          fs.mkdirSync(selectedProjectPath, { recursive: true });
          this.log('目录创建成功: ' + selectedProjectPath, 'success');
        } catch (error) {
          this.log('目录创建失败: ' + error.message, 'error');
          return;
        }
      } else {
        this.log('配置取消', 'warning');
        return;
      }
    }

    // 获取其他配置信息
    const version = await this.prompt('请输入默认版本号 (默认: 1.0.0): ') || '1.0.0';
    const robot = await this.prompt('请输入机器人编号 (1-30, 默认: 1): ') || '1';

    // 创建配置
    const config = {
      appid: 'wx0a950fd30b3c2146',
      projectPath: selectedProjectPath,
      privateKeyPath: this.privateKeyPath,
      ipWhitelist: '115.171.9.126',
      version: version,
      robot: parseInt(robot),
      type: 'miniProgram',
      ignores: [
        'node_modules/**/*',
        '.git/**/*',
        '*.log',
        '.DS_Store'
      ],
      setting: {
        es6: true,
        es7: true,
        minify: true,
        codeProtect: false,
        minifyJS: true,
        minifyWXML: true,
        minifyWXSS: true,
        autoPrefixWXSS: true
      },
      preview: {
        qrcodeFormat: 'image',
        qrcodeOutputDest: './preview-qr-code.png',
        pagePath: 'pages/index/index',
        scene: 1001
      }
    };

    // 保存配置
    try {
      const configDir = path.dirname(this.configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      this.log('配置文件保存成功: ' + this.configPath, 'success');
    } catch (error) {
      this.log('配置文件保存失败: ' + error.message, 'error');
      return;
    }

    // 显示配置摘要
    console.log('\n✅ 配置完成！');
    console.log('==================');
    console.log(`AppID: ${config.appid}`);
    console.log(`项目路径: ${config.projectPath}`);
    console.log(`私钥文件: ${config.privateKeyPath}`);
    console.log(`IP白名单: ${config.ipWhitelist}`);
    console.log(`默认版本: ${config.version}`);
    console.log(`机器人编号: ${config.robot}`);

    console.log('\n📋 后续操作:');
    console.log('1. 确保微信公众平台已添加IP白名单: ' + config.ipWhitelist);
    console.log('2. 运行 npm run mp:check 检查配置');
    console.log('3. 运行 npm run mp:preview 生成预览二维码');
    console.log('4. 运行 npm run mp:upload 上传小程序版本');
  }

  async run() {
    try {
      await this.setupConfiguration();
    } catch (error) {
      this.log('配置失败: ' + error.message, 'error');
      process.exit(1);
    }
  }
}

// 运行配置向导
const setup = new MiniprogramSetup();
setup.run();