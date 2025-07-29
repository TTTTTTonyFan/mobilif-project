/**
 * 微信小程序配置文件
 * MobiLiF 小程序开发和部署配置
 */

require('dotenv').config({ path: '.env.miniprogram' });

module.exports = {
  // 基本信息
  appid: process.env.MINIPROGRAM_APP_ID || 'wx0a950fd30b3c2146',
  appSecret: process.env.MINIPROGRAM_APP_SECRET || 'c55f8125dbe552f3af1fc0ee13b6fb8b',
  
  // 项目路径
  projectPath: process.env.MINIPROGRAM_PROJECT_PATH || '/Users/tonyfan/WeChatProjects/miniprogram-1',
  
  // 版本信息
  version: process.env.CURRENT_VERSION || '1.0.1',
  description: process.env.CURRENT_DESCRIPTION || '新增场馆列表功能',
  
  // API配置
  api: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? process.env.API_BASE_URL_PROD 
      : process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
    retries: 3
  },
  
  // 上传配置
  upload: {
    robot: parseInt(process.env.UPLOAD_ROBOT) || 1,
    setting: {
      es6: process.env.UPLOAD_SETTING_ES6 === 'true',
      es7: true,
      minify: process.env.UPLOAD_SETTING_MINIFY === 'true',
      codeProtect: process.env.UPLOAD_SETTING_CODE_PROTECT === 'true',
      minifyJS: true,
      minifyWXML: true,
      minifyWXSS: true,
      autoPrefixWXSS: true
    },
    ignores: [
      'node_modules/**/*',
      'logs/**/*',
      '*.log',
      'test/**/*',
      'docs/**/*',
      '.git/**/*',
      '.gitignore',
      'README.md'
    ]
  },
  
  // 开发配置
  development: {
    urlCheck: process.env.DEV_URL_CHECK === 'true',
    es6: process.env.DEV_ES6 !== 'false',
    enhance: process.env.DEV_ENHANCE !== 'false',
    postcss: process.env.DEV_POSTCSS !== 'false',
    preloadBackgroundData: false,
    minified: false,
    newFeature: true,
    autoAudits: false
  },
  
  // 预览配置
  preview: {
    qrcodeFormat: 'image',
    qrcodeOutputDest: 'preview-qr-code.png',
    setting: {
      es6: true,
      es7: true,
      minify: false,
      codeProtect: false
    }
  },
  
  // 页面路径配置
  pages: [
    'pages/index/index',
    'pages/gyms/gym-list/gym-list',
    'pages/gyms/gym-detail/gym-detail',
    'pages/profile/profile'
  ],
  
  // tabBar配置
  tabBar: {
    color: '#999999',
    selectedColor: '#ff4d4f',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/gyms/gym-list/gym-list',
        text: 'Drop-in预约',
        iconPath: 'assets/icons/gym.png',
        selectedIconPath: 'assets/icons/gym-active.png'
      },
      {
        pagePath: 'pages/profile/profile',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ]
  },
  
  // 权限配置
  permission: {
    'scope.userLocation': {
      desc: '您的位置信息将用于获取附近的健身房'
    }
  },
  
  // 网络超时配置
  networkTimeout: {
    request: 10000,
    connectSocket: 10000,
    uploadFile: 10000,
    downloadFile: 10000
  },
  
  // 域名配置（生产环境使用）
  domains: {
    request: [
      'https://api.mobilif.com',
      'https://mobilif.com'
    ],
    socket: [],
    uploadFile: [],
    downloadFile: []
  },
  
  // 功能开关
  features: {
    gymList: true,
    userProfile: true,
    booking: true,
    payment: false, // 暂未开放
    social: false   // 暂未开放
  }
};