#!/usr/bin/env node

/**
 * 更新小程序配置脚本
 * 自动更新小程序项目配置文件
 */

const fs = require('fs');
const path = require('path');

class MiniprogramConfigUpdater {
  constructor() {
    this.configFiles = {
      project: 'project.config.json',
      app: 'app.json',
      package: 'package.json',
      ci: 'ci.config.json'
    };
  }

  /**
   * 更新小程序配置
   */
  async updateConfig(options) {
    console.log('⚙️ 开始更新小程序配置...');
    
    try {
      const { version, appid, projectPath = '.' } = options;
      
      // 更新项目配置
      if (version) {
        await this.updateProjectConfig(projectPath, { version });
      }
      
      if (appid) {
        await this.updateAppId(projectPath, appid);
      }
      
      // 更新app.json
      await this.updateAppJson(projectPath, { version });
      
      // 更新package.json
      await this.updatePackageJson(projectPath, { version });
      
      // 更新CI配置
      await this.updateCiConfig(projectPath, { version, appid });
      
      console.log('✅ 小程序配置更新完成');
      
    } catch (error) {
      console.error('❌ 更新小程序配置失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新项目配置文件
   */
  async updateProjectConfig(projectPath, options) {
    const configPath = path.join(projectPath, 'project.config.json');
    
    if (!fs.existsSync(configPath)) {
      console.log('📝 创建项目配置文件...');
      await this.createProjectConfig(configPath, options);
      return;
    }
    
    console.log('📝 更新 project.config.json...');
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // 更新版本信息
      if (options.version) {
        config.version = options.version;
      }
      
      // 更新时间戳
      config.lastModified = new Date().toISOString();
      
      // 确保必要的配置存在
      config.description = config.description || 'MobiLiF CrossFit社交平台小程序';
      config.projectname = config.projectname || 'MobiLiF';
      
      // 优化设置
      config.setting = {
        ...config.setting,
        es6: true,
        es7: true,
        minified: true,
        postcss: true,
        minifyWXSS: true,
        minifyWXML: true,
        minifyJS: true,
        enhance: true,
        showShadowRootInWxmlPanel: true,
        packNpmRelationList: [],
        babelSetting: {
          ignore: [],
          disablePlugins: [],
          outputPath: ""
        }
      };
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`✅ project.config.json 更新完成 (版本: ${options.version})`);
      
    } catch (error) {
      console.error('❌ 更新 project.config.json 失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新AppID
   */
  async updateAppId(projectPath, appid) {
    const configPath = path.join(projectPath, 'project.config.json');
    
    if (!fs.existsSync(configPath)) {
      console.warn('⚠️ project.config.json 不存在，跳过AppID更新');
      return;
    }
    
    console.log(`📱 更新 AppID: ${appid}`);
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config.appid = appid;
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log('✅ AppID 更新完成');
      
    } catch (error) {
      console.error('❌ 更新 AppID 失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新app.json
   */
  async updateAppJson(projectPath, options) {
    const appJsonPath = path.join(projectPath, 'app.json');
    
    if (!fs.existsSync(appJsonPath)) {
      console.log('📝 创建 app.json...');
      await this.createAppJson(appJsonPath, options);
      return;
    }
    
    console.log('📝 更新 app.json...');
    
    try {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      
      // 更新版本信息
      if (options.version) {
        appJson.version = options.version;
        appJson.versionName = `v${options.version}`;
      }
      
      // 更新时间戳
      appJson.updateTime = new Date().toISOString();
      
      // 确保基本配置存在
      appJson.pages = appJson.pages || [
        "pages/index/index",
        "pages/gym/list",
        "pages/auth/login",
        "pages/booking/create"
      ];
      
      appJson.window = {
        backgroundTextStyle: "light",
        navigationBarBackgroundColor: "#fff",
        navigationBarTitleText: "MobiLiF",
        navigationBarTextStyle: "black",
        ...appJson.window
      };
      
      appJson.tabBar = appJson.tabBar || {
        color: "#7A7E83",
        selectedColor: "#3cc51f",
        borderStyle: "black",
        backgroundColor: "#ffffff",
        list: [
          {
            pagePath: "pages/index/index",
            iconPath: "images/icon_home.png",
            selectedIconPath: "images/icon_home_selected.png",
            text: "首页"
          },
          {
            pagePath: "pages/gym/list",
            iconPath: "images/icon_gym.png",
            selectedIconPath: "images/icon_gym_selected.png",
            text: "健身房"
          }
        ]
      };
      
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
      console.log('✅ app.json 更新完成');
      
    } catch (error) {
      console.error('❌ 更新 app.json 失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新package.json
   */
  async updatePackageJson(projectPath, options) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log('📝 创建小程序 package.json...');
      await this.createMiniprogramPackageJson(packageJsonPath, options);
      return;
    }
    
    console.log('📝 更新小程序 package.json...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // 更新版本
      if (options.version) {
        packageJson.version = options.version;
      }
      
      // 确保基本信息存在
      packageJson.name = packageJson.name || 'mobilif-miniprogram';
      packageJson.description = packageJson.description || 'MobiLiF CrossFit社交平台小程序';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ 小程序 package.json 更新完成');
      
    } catch (error) {
      console.error('❌ 更新小程序 package.json 失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新CI配置
   */
  async updateCiConfig(projectPath, options) {
    const ciConfigPath = path.join(projectPath, 'ci.config.json');
    
    if (!fs.existsSync(ciConfigPath)) {
      console.log('📝 复制CI配置文件...');
      const templatePath = path.join(__dirname, '../../config/miniprogram/ci.config.json');
      if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, ciConfigPath);
      }
    }
    
    if (!fs.existsSync(ciConfigPath)) {
      console.warn('⚠️ CI配置文件不存在，跳过更新');
      return;
    }
    
    console.log('📝 更新 CI 配置...');
    
    try {
      const ciConfig = JSON.parse(fs.readFileSync(ciConfigPath, 'utf8'));
      
      // 更新版本
      if (options.version) {
        ciConfig.version = options.version;
      }
      
      // 更新AppID
      if (options.appid) {
        ciConfig.appid = options.appid;
      }
      
      fs.writeFileSync(ciConfigPath, JSON.stringify(ciConfig, null, 2));
      console.log('✅ CI 配置更新完成');
      
    } catch (error) {
      console.error('❌ 更新 CI 配置失败:', error.message);
      throw error;
    }
  }

  /**
   * 创建项目配置文件
   */
  async createProjectConfig(configPath, options) {
    const defaultConfig = {
      description: "MobiLiF CrossFit社交平台小程序",
      packOptions: {
        ignore: [],
        include: []
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
        lazyloadPlaceholderEnable: false,
        useMultiFrameRuntime: true,
        useApiHook: true,
        useApiHostProcess: true,
        babelSetting: {
          ignore: [],
          disablePlugins: [],
          outputPath: ""
        },
        enableEngineNative: false,
        useIsolateContext: false,
        userConfirmedBundleSwitch: false,
        packNpmManually: false,
        packNpmRelationList: [],
        minifyWXSS: true,
        disableUseStrict: false,
        minifyWXML: true,
        showES6CompileOption: false,
        useCompilerPlugins: false,
        ignoreUploadUnusedFiles: true
      },
      compileType: "miniprogram",
      libVersion: "2.32.1",
      appid: "wx0a950fd30b3c2146", // 默认AppID
      projectname: "MobiLiF",
      version: options.version || "1.0.0",
      lastModified: new Date().toISOString()
    };
    
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    console.log('✅ 项目配置文件创建完成');
  }

  /**
   * 创建app.json
   */
  async createAppJson(appJsonPath, options) {
    const defaultAppJson = {
      pages: [
        "pages/index/index",
        "pages/gym/list",
        "pages/auth/login",
        "pages/booking/create"
      ],
      window: {
        backgroundTextStyle: "light",
        navigationBarBackgroundColor: "#fff",
        navigationBarTitleText: "MobiLiF",
        navigationBarTextStyle: "black"
      },
      tabBar: {
        color: "#7A7E83",
        selectedColor: "#3cc51f",
        borderStyle: "black",
        backgroundColor: "#ffffff",
        list: [
          {
            pagePath: "pages/index/index",
            iconPath: "images/icon_home.png",
            selectedIconPath: "images/icon_home_selected.png",
            text: "首页"
          },
          {
            pagePath: "pages/gym/list",
            iconPath: "images/icon_gym.png",
            selectedIconPath: "images/icon_gym_selected.png",
            text: "健身房"
          }
        ]
      },
      version: options.version || "1.0.0",
      updateTime: new Date().toISOString()
    };
    
    fs.writeFileSync(appJsonPath, JSON.stringify(defaultAppJson, null, 2));
    console.log('✅ app.json 创建完成');
  }

  /**
   * 创建小程序package.json
   */
  async createMiniprogramPackageJson(packageJsonPath, options) {
    const defaultPackageJson = {
      name: "mobilif-miniprogram",
      version: options.version || "1.0.0",
      description: "MobiLiF CrossFit社交平台小程序",
      main: "app.js",
      scripts: {
        "build": "echo 'Building miniprogram...'",
        "dev": "echo 'Development mode...'",
        "preview": "echo 'Generating preview...'"
      },
      keywords: [
        "miniprogram",
        "wechat",
        "crossfit",
        "fitness",
        "mobilif"
      ],
      author: "MobiLiF Team",
      license: "MIT"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(defaultPackageJson, null, 2));
    console.log('✅ 小程序 package.json 创建完成');
  }

  /**
   * 验证配置文件
   */
  async validateConfigs(projectPath) {
    console.log('🔍 验证配置文件...');
    
    const errors = [];
    
    // 检查必需文件
    const requiredFiles = [
      'project.config.json',
      'app.json',
      'app.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(projectPath, file);
      if (!fs.existsSync(filePath)) {
        errors.push(`缺少必需文件: ${file}`);
      }
    }
    
    // 验证project.config.json
    const projectConfigPath = path.join(projectPath, 'project.config.json');
    if (fs.existsSync(projectConfigPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
        if (!config.appid) {
          errors.push('project.config.json 缺少 appid');
        }
        if (!config.projectname) {
          errors.push('project.config.json 缺少 projectname');
        }
      } catch (error) {
        errors.push(`project.config.json 格式错误: ${error.message}`);
      }
    }
    
    // 验证app.json
    const appJsonPath = path.join(projectPath, 'app.json');
    if (fs.existsSync(appJsonPath)) {
      try {
        const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
        if (!appJson.pages || appJson.pages.length === 0) {
          errors.push('app.json 缺少 pages 配置');
        }
      } catch (error) {
        errors.push(`app.json 格式错误: ${error.message}`);
      }
    }
    
    if (errors.length > 0) {
      console.error('❌ 配置验证失败:');
      errors.forEach(error => console.error(`  - ${error}`));
      throw new Error('配置文件验证失败');
    }
    
    console.log('✅ 配置文件验证通过');
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

  if (!options.version && !options.appid) {
    console.error('❌ 请提供至少一个更新参数');
    console.error('使用方法:');
    console.error('  node update-miniprogram-config.js --version "1.0.0" --appid "wx123456"');
    process.exit(1);
  }

  try {
    const updater = new MiniprogramConfigUpdater();
    
    // 更新配置
    await updater.updateConfig(options);
    
    // 验证配置
    const projectPath = options['project-path'] || '.';
    await updater.validateConfigs(projectPath);
    
    console.log('🎉 小程序配置更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MiniprogramConfigUpdater };