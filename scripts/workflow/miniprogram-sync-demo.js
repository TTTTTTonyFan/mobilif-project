#!/usr/bin/env node

/**
 * MobiLiF 小程序同步演示脚本
 * 模拟将场馆列表功能同步到微信小程序
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MiniprogramSyncDemo {
  constructor() {
    this.config = {
      appid: 'wx0a950fd30b3c2146',
      appSecret: 'c55f8125dbe552f3af1fc0ee13b6fb8b',
      version: '1.0.1',
      desc: '新增场馆列表功能',
      projectPath: '/Users/tonyfan/WeChatProjects/miniprogram-1',
      syncFiles: []
    };
    this.results = {
      synced: [],
      created: [],
      updated: [],
      errors: []
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[34m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  parseArgs() {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--version' && args[i + 1]) {
        this.config.version = args[i + 1];
        i++;
      } else if (args[i] === '--desc' && args[i + 1]) {
        this.config.desc = args[i + 1];
        i++;
      }
    }
  }

  async checkEnvironment() {
    this.log('🔍 检查小程序开发环境...', 'info');
    
    // 检查项目路径
    if (!fs.existsSync(this.config.projectPath)) {
      throw new Error(`小程序项目路径不存在: ${this.config.projectPath}`);
    }
    
    // 检查关键文件
    const requiredFiles = [
      'app.js',
      'app.json', 
      'project.config.json'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.config.projectPath, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`缺少必要文件: ${file}`);
      }
    }
    
    this.log('✅ 小程序环境检查通过', 'success');
  }

  async syncAppConfig() {
    this.log('📱 同步应用配置...', 'info');
    
    const appJsonPath = path.join(this.config.projectPath, 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // 更新页面路径
    const newPages = [
      'pages/index/index',
      'pages/gyms/gym-list/gym-list',
      'pages/gyms/gym-detail/gym-detail',
      'pages/profile/profile'
    ];
    
    // 更新tabBar配置
    const newTabBar = {
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
    };
    
    appJson.pages = newPages;
    appJson.tabBar = newTabBar;
    appJson.networkTimeout = {
      request: 10000,
      connectSocket: 10000,
      uploadFile: 10000,
      downloadFile: 10000
    };
    
    // 添加权限声明
    appJson.permission = {
      'scope.userLocation': {
        desc: '您的位置信息将用于获取附近的健身房'
      }
    };
    
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    this.results.updated.push('app.json');
    this.log('✅ 应用配置更新完成', 'success');
  }

  async createGymListPage() {
    this.log('🏢 创建场馆列表页面...', 'info');
    
    const gymListDir = path.join(this.config.projectPath, 'pages/gyms/gym-list');
    if (!fs.existsSync(gymListDir)) {
      fs.mkdirSync(gymListDir, { recursive: true });
    }
    
    // 创建 gym-list.js
    const jsContent = `// pages/gyms/gym-list/gym-list.js
Page({
  data: {
    currentCity: '北京',
    searchKeyword: '',
    filterVisible: false,
    selectedFilters: {
      gymType: '',
      programs: []
    },
    gymList: [],
    loading: false,
    refreshing: false,
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  onLoad: function (options) {
    this.loadGymList();
    this.requestLocationPermission();
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.refreshGymList();
  },

  onPullDownRefresh: function () {
    this.refreshGymList();
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreGyms();
    }
  },

  // 请求位置权限
  requestLocationPermission() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.getCurrentLocation();
            },
            fail: () => {
              wx.showToast({
                title: '获取位置权限失败，将显示默认城市场馆',
                icon: 'none'
              });
            }
          });
        } else {
          this.getCurrentLocation();
        }
      }
    });
  },

  // 获取当前位置
  getCurrentLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.setData({
          userLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        this.loadGymList();
      }
    });
  },

  // 加载场馆列表
  loadGymList() {
    this.setData({ loading: true });
    
    const params = {
      city: this.data.currentCity,
      keyword: this.data.searchKeyword,
      page: 1,
      pageSize: this.data.pageSize
    };
    
    if (this.data.userLocation) {
      params.lat = this.data.userLocation.latitude;
      params.lng = this.data.userLocation.longitude;
    }
    
    if (this.data.selectedFilters.gymType) {
      params.gymType = this.data.selectedFilters.gymType;
    }
    
    if (this.data.selectedFilters.programs.length > 0) {
      params.programs = this.data.selectedFilters.programs.join(',');
    }
    
    wx.request({
      url: 'http://localhost:3000/api/gyms',
      method: 'GET',
      data: params,
      header: {
        'Authorization': 'Bearer test-token'
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            gymList: res.data.data.list,
            hasMore: res.data.data.pagination.hasNext,
            loading: false,
            page: 1
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'error'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'error'
        });
        this.setData({ loading: false });
      },
      complete: () => {
        wx.stopPullDownRefresh();
      }
    });
  },

  // 刷新场馆列表
  refreshGymList() {
    this.setData({ refreshing: true });
    this.loadGymList();
  },

  // 加载更多场馆
  loadMoreGyms() {
    const nextPage = this.data.page + 1;
    // 实现分页加载逻辑
    // ... 代码省略
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索确认
  onSearchConfirm() {
    this.loadGymList();
  },

  // 城市选择
  onCityTap() {
    wx.showActionSheet({
      itemList: ['北京', '上海', '广州', '深圳', '杭州'],
      success: (res) => {
        const cities = ['北京', '上海', '广州', '深圳', '杭州'];
        this.setData({
          currentCity: cities[res.tapIndex]
        });
        this.loadGymList();
      }
    });
  },

  // 显示筛选
  showFilter() {
    this.setData({ filterVisible: true });
  },

  // 隐藏筛选
  hideFilter() {
    this.setData({ filterVisible: false });
  },

  // 场馆详情
  onGymTap(e) {
    const gymId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: \`/pages/gyms/gym-detail/gym-detail?id=\${gymId}\`
    });
  }
});`;

    // 创建 gym-list.wxml
    const wxmlContent = `<!--pages/gyms/gym-list/gym-list.wxml-->
<view class="container">
  <!-- 城市选择器 -->
  <view class="city-selector" bindtap="onCityTap">
    <text class="city-name">{{currentCity}}</text>
    <text class="city-arrow">▼</text>
  </view>

  <!-- 搜索和筛选栏 -->
  <view class="search-bar">
    <view class="search-input-wrapper">
      <input class="search-input" 
             placeholder="搜索场馆名称或地址" 
             value="{{searchKeyword}}"
             bindinput="onSearchInput"
             bindconfirm="onSearchConfirm" />
    </view>
    <view class="filter-btn" bindtap="showFilter">
      <text>筛选</text>
    </view>
  </view>

  <!-- 场馆列表 -->
  <scroll-view class="gym-list" 
               scroll-y="true"
               enable-back-to-top="true"
               refresher-enabled="true"
               refresher-triggered="{{refreshing}}"
               bindrefresherrefresh="refreshGymList">
    <view wx:for="{{gymList}}" 
          wx:key="id" 
          class="gym-card"
          bindtap="onGymTap"
          data-id="{{item.id}}">
      
      <view class="gym-header">
        <text class="gym-name">{{item.name}}</text>
        <text wx:if="{{item.distance}}" class="gym-distance">{{item.distance}}km</text>
      </view>
      
      <text class="gym-address">{{item.address}}</text>
      
      <view class="gym-info">
        <view class="gym-rating">
          <text class="rating-stars">★</text>
          <text>{{item.rating}} ({{item.reviewCount}})</text>
        </view>
        <view class="gym-status {{item.businessStatus === '营业中' ? 'status-open' : 'status-closed'}}">
          {{item.businessStatus}}
        </view>
      </view>
      
      <view class="gym-tags">
        <text wx:for="{{item.tags}}" 
              wx:for-item="tag" 
              wx:key="*this" 
              class="gym-tag {{tag === 'CrossFit认证' ? 'tag-crossfit' : ''}}">
          {{tag}}
        </text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view wx:if="{{loading}}" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 空状态 -->
    <view wx:if="{{!loading && gymList.length === 0}}" class="empty-state">
      <text>暂无场馆数据</text>
    </view>
  </scroll-view>

  <!-- 筛选弹窗 -->
  <view wx:if="{{filterVisible}}" class="filter-modal">
    <view class="filter-content">
      <view class="filter-header">
        <text>筛选条件</text>
        <text bindtap="hideFilter">×</text>
      </view>
      
      <view class="filter-section">
        <text class="filter-title">场馆类型</text>
        <!-- 筛选选项 -->
      </view>
      
      <view class="filter-section">
        <text class="filter-title">课程类型</text>
        <!-- 筛选选项 -->
      </view>
      
      <view class="filter-actions">
        <button bindtap="resetFilter">重置</button>
        <button type="primary" bindtap="applyFilter">确定</button>
      </view>
    </view>
  </view>
</view>`;

    // 创建 gym-list.wxss
    const wxssContent = `/* pages/gyms/gym-list/gym-list.wxss */
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.city-selector {
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.city-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.city-arrow {
  color: #999;
  font-size: 12px;
}

.search-bar {
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid #eee;
}

.search-input-wrapper {
  flex: 1;
}

.search-input {
  height: 36px;
  background: #f5f5f5;
  border-radius: 18px;
  padding: 0 16px;
  font-size: 14px;
}

.filter-btn {
  width: 60px;
  height: 36px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.gym-list {
  flex: 1;
  padding: 16px;
}

.gym-card {
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.gym-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.gym-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.gym-distance {
  font-size: 12px;
  color: #666;
}

.gym-address {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.3;
}

.gym-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.gym-rating {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.rating-stars {
  color: #ffa940;
  margin-right: 4px;
}

.gym-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.status-open {
  background: #f6ffed;
  color: #52c41a;
}

.status-closed {
  background: #fff2e8;
  color: #fa8c16;
}

.gym-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.gym-tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 10px;
  background: #f0f0f0;
  color: #666;
}

.tag-crossfit {
  background: #fff0f6;
  color: #c41d7f;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.filter-content {
  background: #fff;
  border-radius: 12px 12px 0 0;
  padding: 20px;
  width: 100%;
  max-height: 70vh;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.filter-actions button {
  flex: 1;
  height: 44px;
  line-height: 44px;
  border-radius: 8px;
}`;

    // 创建 gym-list.json
    const jsonContent = `{
  "usingComponents": {},
  "navigationBarTitleText": "场馆列表",
  "enablePullDownRefresh": true,
  "onReachBottomDistance": 50
}`;

    // 写入文件
    fs.writeFileSync(path.join(gymListDir, 'gym-list.js'), jsContent);
    fs.writeFileSync(path.join(gymListDir, 'gym-list.wxml'), wxmlContent);
    fs.writeFileSync(path.join(gymListDir, 'gym-list.wxss'), wxssContent);
    fs.writeFileSync(path.join(gymListDir, 'gym-list.json'), jsonContent);

    this.results.created.push('pages/gyms/gym-list/');
    this.log('✅ 场馆列表页面创建完成', 'success');
  }

  async createUtilsAndServices() {
    this.log('🔧 创建工具类和服务...', 'info');
    
    // 创建utils目录
    const utilsDir = path.join(this.config.projectPath, 'utils');
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }
    
    // 创建API服务
    const apiServiceContent = `// utils/api.js
const API_BASE_URL = 'http://localhost:3000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = 'test-token';
  }

  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseURL + options.url,
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Authorization': \`Bearer \${this.token}\`,
          'Content-Type': 'application/json',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(\`请求失败: \${res.statusCode}\`));
          }
        },
        fail: reject
      });
    });
  }

  // 获取场馆列表
  getGymList(params) {
    return this.request({
      url: '/api/gyms',
      data: params
    });
  }

  // 获取场馆详情
  getGymDetail(id) {
    return this.request({
      url: \`/api/gyms/\${id}\`
    });
  }

  // 获取城市列表
  getCities() {
    return this.request({
      url: '/api/gyms/cities'
    });
  }
}

module.exports = new ApiService();`;

    // 创建位置服务
    const locationServiceContent = `// utils/location.js
class LocationService {
  constructor() {
    this.userLocation = null;
  }

  // 获取用户位置权限
  async requestLocationPermission() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation']) {
            resolve(true);
          } else {
            wx.authorize({
              scope: 'scope.userLocation',
              success: () => resolve(true),
              fail: () => reject(new Error('位置权限被拒绝'))
            });
          }
        },
        fail: reject
      });
    });
  }

  // 获取当前位置
  async getCurrentLocation() {
    try {
      await this.requestLocationPermission();
      
      return new Promise((resolve, reject) => {
        wx.getLocation({
          type: 'wgs84',
          success: (res) => {
            this.userLocation = {
              latitude: res.latitude,
              longitude: res.longitude
            };
            resolve(this.userLocation);
          },
          fail: reject
        });
      });
    } catch (error) {
      console.error('获取位置失败:', error);
      throw error;
    }
  }

  // 计算距离
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

module.exports = new LocationService();`;

    fs.writeFileSync(path.join(utilsDir, 'api.js'), apiServiceContent);
    fs.writeFileSync(path.join(utilsDir, 'location.js'), locationServiceContent);

    this.results.created.push('utils/api.js', 'utils/location.js');
    this.log('✅ 工具类和服务创建完成', 'success');
  }

  async updateProjectConfig() {
    this.log('⚙️ 更新项目配置...', 'info');
    
    const projectConfigPath = path.join(this.config.projectPath, 'project.config.json');
    const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'));
    
    // 更新项目信息
    projectConfig.projectname = 'MobiLiF';
    projectConfig.appid = this.config.appid;
    projectConfig.libVersion = '2.32.0';
    
    // 更新编译设置
    projectConfig.setting = {
      ...projectConfig.setting,
      urlCheck: false, // 开发环境不校验域名
      es6: true,
      enhance: true,
      postcss: true,
      preloadBackgroundData: false,
      minified: false,
      newFeature: true,
      autoAudits: false,
      showShadowRootInWxmlPanel: true,
      packNpmManually: false,
      packNpmRelationList: [],
      minifyWXSS: true
    };
    
    fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2));
    this.results.updated.push('project.config.json');
    this.log('✅ 项目配置更新完成', 'success');
  }

  generateVersionInfo() {
    const versionInfo = {
      version: this.config.version,
      description: this.config.desc,
      timestamp: new Date().toISOString(),
      features: [
        '新增场馆列表功能',
        '支持地理位置搜索',
        '支持关键词搜索',
        '支持场馆类型筛选',
        '支持课程类型筛选',
        '支持城市切换',
        '支持下拉刷新和上拉加载',
        '营业状态实时显示'
      ],
      changes: [
        'app.json - 添加场馆列表页面和tabBar配置',
        'pages/gyms/gym-list/ - 新增场馆列表页面',
        'utils/api.js - 新增API服务',
        'utils/location.js - 新增位置服务',
        'project.config.json - 更新项目配置'
      ]
    };

    const versionPath = path.join(this.config.projectPath, 'version.json');
    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
    this.results.created.push('version.json');
    
    return versionInfo;
  }

  async run() {
    this.log('🚀 开始小程序同步工作流', 'info');
    this.log(`📱 AppID: ${this.config.appid}`, 'info');
    this.log(`📦 版本: ${this.config.version}`, 'info');
    this.log(`📝 描述: ${this.config.desc}`, 'info');
    console.log('=====================================');

    try {
      this.parseArgs();
      await this.checkEnvironment();
      await this.syncAppConfig();
      await this.createGymListPage();
      await this.createUtilsAndServices();
      await this.updateProjectConfig();
      
      const versionInfo = this.generateVersionInfo();
      
      console.log('=====================================');
      this.log('📊 同步结果汇总', 'info');
      console.log('=====================================');
      
      this.log(`✅ 创建文件: ${this.results.created.length}个`, 'success');
      this.results.created.forEach(file => {
        console.log(`   + ${file}`);
      });
      
      this.log(`📝 更新文件: ${this.results.updated.length}个`, 'success');
      this.results.updated.forEach(file => {
        console.log(`   ~ ${file}`);
      });
      
      if (this.results.errors.length > 0) {
        this.log(`❌ 错误: ${this.results.errors.length}个`, 'error');
        this.results.errors.forEach(error => {
          console.log(`   ! ${error}`);
        });
      }
      
      console.log('=====================================');
      this.log('🎉 小程序同步完成！', 'success');
      console.log('=====================================');
      
      console.log('📋 下一步操作:');
      console.log('1. 打开微信开发者工具，导入项目:');
      console.log(`   ${this.config.projectPath}`);
      console.log('2. 在开发者工具中预览和调试场馆列表功能');
      console.log('3. 确认功能正常后，可以上传到微信平台');
      console.log('4. 在微信公众平台配置服务器域名和业务域名');
      console.log('');
      console.log('⚠️  注意事项:');
      console.log('- 请确保后端API服务正在运行 (localhost:3000)');
      console.log('- 生产环境需要配置HTTPS域名');
      console.log('- 需要在微信公众平台配置request域名白名单');
      
    } catch (error) {
      this.log(`❌ 同步失败: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// 运行同步脚本
const syncDemo = new MiniprogramSyncDemo();
syncDemo.run();