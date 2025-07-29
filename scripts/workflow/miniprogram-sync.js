#!/usr/bin/env node

/**
 * 微信小程序同步脚本
 * 上传小程序到微信开发者工具
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class MiniprogramSync {
  constructor() {
    this.ci = require('miniprogram-ci');
    this.config = {
      appid: process.env.MINIPROGRAM_APP_ID || 'wx0a950fd30b3c2146',
      appSecret: process.env.MINIPROGRAM_APP_SECRET || 'c55f8125dbe552f3af1fc0ee13b6fb8b',
      privateKeyPath: '',
      projectPath: process.env.MINIPROGRAM_PROJECT_PATH || '/Users/tonyfan/WeChatProjects/miniprogram-1',
      version: '',
      desc: '',
      robot: 1 // 默认使用机器人1
    };
  }

  /**
   * 上传小程序到微信
   */
  async uploadToWeChat(options) {
    console.log('🚀 开始上传小程序到微信开发者工具...');
    
    // 解析命令行参数
    this.parseOptions(options);
    
    try {
      // 创建项目对象
      const project = new this.ci.Project({
        appid: this.config.appid,
        type: 'miniProgram',
        projectPath: this.config.projectPath,
        privateKeyPath: this.config.privateKeyPath,
        ignores: ['node_modules/**/*'],
      });

      console.log(`📱 项目配置:`);
      console.log(`  - AppID: ${this.config.appid}`);
      console.log(`  - 项目路径: ${this.config.projectPath}`);
      console.log(`  - 版本: ${this.config.version}`);
      console.log(`  - 描述: ${this.config.desc}`);

      // 上传代码
      const uploadResult = await this.ci.upload({
        project,
        version: this.config.version,
        desc: this.config.desc,
        setting: {
          es6: true,
          es7: true,
          minify: true,
          codeProtect: false,
          minifyJS: true,
          minifyWXML: true,
          minifyWXSS: true,
          autoPrefixWXSS: true,
        },
        onProgressUpdate: (progress) => {
          console.log(`📊 上传进度: ${Math.round(progress * 100)}%`);
        },
      });

      console.log('✅ 小程序上传成功！');
      console.log(`📝 上传结果:`, uploadResult);

      // 保存上传结果
      await this.saveUploadResult(uploadResult);

      return uploadResult;

    } catch (error) {
      console.error('❌ 小程序上传失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成预览二维码
   */
  async generatePreview(options) {
    console.log('📱 生成预览二维码...');
    
    try {
      const project = new this.ci.Project({
        appid: this.config.appid,
        type: 'miniProgram',
        projectPath: this.config.projectPath,
        privateKeyPath: this.config.privateKeyPath,
        ignores: ['node_modules/**/*'],
      });

      const previewResult = await this.ci.preview({
        project,
        desc: this.config.desc,
        setting: {
          es6: true,
          es7: true,
          minify: false,
          codeProtect: false,
        },
        qrcodeFormat: 'image',
        qrcodeOutputDest: options.output || 'preview-qr-code.png',
        onProgressUpdate: (progress) => {
          console.log(`📊 预览生成进度: ${Math.round(progress * 100)}%`);
        },
      });

      console.log('✅ 预览二维码生成成功！');
      console.log(`📱 二维码保存位置: ${options.output || 'preview-qr-code.png'}`);

      return previewResult;

    } catch (error) {
      console.error('❌ 预览二维码生成失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取小程序信息
   */
  async getMiniprogramInfo() {
    console.log('📋 获取小程序信息...');
    
    try {
      const project = new this.ci.Project({
        appid: this.config.appid,
        type: 'miniProgram',
        projectPath: this.config.projectPath,
        privateKeyPath: this.config.privateKeyPath,
      });

      // 获取开发版本列表
      const devVersions = await this.ci.getDevSourceMap({
        project,
        robot: this.config.robot,
      });

      console.log('📱 开发版本信息:', devVersions);

      return devVersions;

    } catch (error) {
      console.error('❌ 获取小程序信息失败:', error.message);
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
    this.config.version = options.version || this.config.version;
    this.config.desc = options.desc || this.config.desc;

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
    if (!this.config.version) {
      throw new Error('缺少版本号');
    }

    // 验证文件存在性
    if (!fs.existsSync(this.config.privateKeyPath)) {
      throw new Error(`私钥文件不存在: ${this.config.privateKeyPath}`);
    }
    if (!fs.existsSync(this.config.projectPath)) {
      throw new Error(`项目目录不存在: ${this.config.projectPath}`);
    }
  }

  /**
   * 保存上传结果
   */
  async saveUploadResult(result) {
    const resultFile = path.join(process.cwd(), 'miniprogram-upload-result.json');
    const resultData = {
      ...result,
      uploadTime: new Date().toISOString(),
      config: this.config,
    };

    fs.writeFileSync(resultFile, JSON.stringify(resultData, null, 2));
    console.log(`📊 上传结果已保存到: ${resultFile}`);
  }

  /**
   * 验证小程序配置
   */
  async validateConfig() {
    console.log('🔍 验证小程序配置...');
    
    try {
      // 检查项目配置文件
      const projectConfigPath = path.join(this.config.projectPath, 'project.config.json');
      if (!fs.existsSync(projectConfigPath)) {
        throw new Error('未找到 project.config.json 文件');
      }

      const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
      
      if (projectConfig.appid !== this.config.appid) {
        console.warn(`⚠️ project.config.json 中的 AppID (${projectConfig.appid}) 与配置不匹配`);
      }

      // 检查必要文件
      const requiredFiles = ['app.js', 'app.json', 'app.wxss'];
      for (const file of requiredFiles) {
        const filePath = path.join(this.config.projectPath, file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`缺少必要文件: ${file}`);
        }
      }

      console.log('✅ 小程序配置验证通过');
      return true;

    } catch (error) {
      console.error('❌ 小程序配置验证失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新小程序版本信息
   */
  async updateVersionInfo() {
    console.log('📝 更新小程序版本信息...');
    
    try {
      const appJsonPath = path.join(this.config.projectPath, 'app.json');
      
      if (fs.existsSync(appJsonPath)) {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
        appJson.version = this.config.version;
        appJson.updateTime = new Date().toISOString();
        
        fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
        console.log(`✅ 已更新 app.json 版本信息: ${this.config.version}`);
      }

      // 更新 package.json（如果存在）
      const packageJsonPath = path.join(this.config.projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.version = this.config.version;
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(`✅ 已更新 package.json 版本信息: ${this.config.version}`);
      }

    } catch (error) {
      console.error('❌ 更新版本信息失败:', error.message);
      throw error;
    }
  }
}

// 从配置文件加载配置
function loadConfigFromFile() {
  const configPath = path.join(__dirname, '../../config/miniprogram-config.json');
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return {
      appid: config.appid,
      'private-key': config.privateKeyPath,
      'project-path': config.projectPath,
      version: config.version || '1.0.' + Date.now(),
      desc: 'Workflow自动上传 - ' + new Date().toLocaleString(),
      output: 'preview-qr-code.png'
    };
  }
  
  return null;
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

  // 如果没有提供参数，尝试从配置文件加载
  if (!options.appid && !options['private-key'] && !options['project-path']) {
    console.log('📋 未提供命令行参数，尝试从配置文件加载...');
    const configFromFile = loadConfigFromFile();
    
    if (configFromFile) {
      Object.assign(options, configFromFile);
      console.log('✅ 已从配置文件加载参数');
    } else {
      console.error('❌ 未找到配置文件，请提供命令行参数');
      console.error('使用方法:');
      console.error('  node miniprogram-sync.js \\');
      console.error('    --appid "wx0a950fd30b3c2146" \\');
      console.error('    --private-key "/path/to/private.key" \\');
      console.error('    --project-path "/path/to/miniprogram" \\');
      console.error('    --version "1.0.0" \\');
      console.error('    --desc "Upload description"');
      console.error('');
      console.error('或者使用更简单的命令:');
      console.error('  npm run mp:preview  # 生成预览');
      console.error('  npm run mp:upload   # 上传版本');
      process.exit(1);
    }
  }

  if (!options.appid || !options['private-key'] || !options['project-path']) {
    console.error('❌ 配置不完整，缺少必需参数');
    process.exit(1);
  }

  try {
    const sync = new MiniprogramSync();
    
    // 配置参数
    const config = {
      appid: options.appid,
      privateKey: options['private-key'],
      projectPath: options['project-path'],
      version: options.version || '1.0.' + Date.now(),
      desc: options.desc || 'Auto-generated upload - ' + new Date().toLocaleString(),
      output: options.output,
    };

    console.log('🚀 MobiLiF 微信小程序工作流');
    console.log('==============================');
    console.log(`📱 AppID: ${config.appid}`);
    console.log(`📂 项目路径: ${config.projectPath}`);
    console.log(`🔑 私钥文件: ${config.privateKey}`);
    console.log(`📦 版本: ${config.version}`);
    console.log(`📝 描述: ${config.desc}`);
    console.log('');

    // 验证配置
    sync.parseOptions(config);
    await sync.validateConfig();
    
    // 更新版本信息
    await sync.updateVersionInfo();
    
    // 上传小程序
    const uploadResult = await sync.uploadToWeChat(config);
    
    // 生成预览二维码
    console.log('📱 生成预览二维码...');
    await sync.generatePreview(config);

    console.log('');
    console.log('🎉 小程序同步完成！');
    console.log('==============================');
    console.log('📋 后续操作:');
    console.log('1. 登录微信公众平台查看上传的版本');
    console.log('2. 扫描预览二维码在手机上测试');
    console.log('3. 确认无误后提交审核');
    
  } catch (error) {
    console.error('❌ 小程序同步失败:', error.message);
    
    // 提供具体的错误处理建议
    if (error.message.includes('private key')) {
      console.error('💡 请检查私钥文件是否存在且格式正确');
    } else if (error.message.includes('project')) {
      console.error('💡 请检查小程序项目路径是否正确');
    } else if (error.message.includes('appid')) {
      console.error('💡 请检查AppID配置是否正确');
    }
    
    console.error('');
    console.error('🔧 可以尝试以下解决方案:');
    console.error('- 运行 npm run mp:check 检查配置');
    console.error('- 运行 npm run mp:setup 重新配置');
    console.error('- 运行 npm run mp:help 查看帮助');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MiniprogramSync };