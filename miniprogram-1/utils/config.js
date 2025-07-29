// utils/config.js
// 小程序配置文件

const config = {
  // 基本信息
  appid: 'wx0a950fd30b3c2146',
  
  // API配置
  api: {
    baseUrl: 'http://localhost:3000', // 开发环境
    // baseUrl: 'https://api.mobilif.com', // 生产环境
    timeout: 10000,
    retries: 3
  },
  
  // 版本信息
  version: '1.0.1',
  description: '新增场馆列表功能',
  
  // 功能开关
  features: {
    gymList: true,
    userProfile: true,
    booking: true,
    payment: false, // 暂未开放
    social: false   // 暂未开放
  },
  
  // 页面配置
  pages: {
    index: 'pages/index/index',
    gymList: 'pages/gyms/gym-list/gym-list',
    gymDetail: 'pages/gyms/gym-detail/gym-detail',
    profile: 'pages/profile/profile'
  },
  
  // 默认设置
  defaults: {
    city: '北京',
    pageSize: 20,
    maxDistance: 50, // 最大搜索距离（公里）
    cacheExpiry: 300000 // 缓存过期时间（毫秒）
  },
  
  // 地图配置
  map: {
    key: '', // 腾讯地图key（如需要）
    defaultLocation: {
      latitude: 39.9042,
      longitude: 116.4074
    }
  },
  
  // 样式配置
  theme: {
    primaryColor: '#ff4d4f',
    secondaryColor: '#1890ff',
    successColor: '#52c41a',
    warningColor: '#faad14',
    errorColor: '#f5222d',
    textColor: '#333333',
    subTextColor: '#666666',
    borderColor: '#d9d9d9'
  },
  
  // 错误信息
  errorMessages: {
    network: '网络连接失败，请检查网络设置',
    location: '获取位置信息失败，请检查定位权限',
    server: '服务器繁忙，请稍后重试',
    data: '数据加载失败，请下拉刷新'
  }
};

module.exports = config;