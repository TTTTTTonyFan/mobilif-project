// MobiLiF拓练 - 探索场馆页面 - 完全按照venues_explorer_miniprogram.html实现
const locationService = require('../../../utils/location-service.js');
const gymDataService = require('../../../utils/gym-data-service.js');

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

Page({
  data: {
    // 系统状态
    currentTime: '9:41',
    batteryLevel: 100,
    
    // 页面状态
    loading: false,
    hasMoreData: true,
    currentPage: 1,
    
    // 搜索和筛选
    searchTerm: '',
    filterVisible: false,
    filterContentExpanded: false,
    filterCount: 0,
    
    // 临时筛选器和确认筛选器
    tempFilters: {
      gymType: [],
      courseType: []
    },
    filters: {
      gymType: [],
      courseType: []
    },
    
    // 位置相关
    currentCityId: 'beijing',
    currentCityName: '北京市',
    cityDescription: '已发现 12 个训练场馆',
    cityModalVisible: false,
    
    // 底部导航
    currentTab: 'discover',
    navItems: [
      { tab: 'discover', icon: 'ri-compass-line', label: '发现场馆' },
      { tab: 'map', icon: 'ri-map-line', label: '足迹地图' },
      { tab: 'profile', icon: 'ri-user-line', label: '我的' }
    ],
    
    // 提示toast
    toastVisible: false,
    toastMessage: '',
    
    // 数据选项
    gymTypeOptions: [
      { value: 'crossfit', label: 'CrossFit认证' },
      { value: 'comprehensive', label: '综合训练馆' }
    ],
    courseTypeOptions: [
      'crossfit', 'weightlifting', 'gymnastics', 
      'stretching', 'yoga', 'hyrox'
    ],
    
    // 课程类型映射
    courseTypeMap: {
      'crossfit': 'CrossFit',
      'weightlifting': '举重',
      'gymnastics': '体操',
      'stretching': '拉伸',
      'yoga': '瑜伽',
      'hyrox': 'Hyrox'
    },
    
    // 城市选择相关状态
    citySelectionLevel: 'country', // 'country', 'province', 'city'
    selectedCountry: null,
    selectedProvince: null,
    
    // 地区数据结构
    locationData: {
      '中国': {
        '北京': {
          '北京市': { id: 'beijing', venueCount: 12 }
        },
        '上海': {
          '上海市': { id: 'shanghai', venueCount: 18 }
        },
        '广东': {
          '广州市': { id: 'guangzhou', venueCount: 8 },
          '深圳市': { id: 'shenzhen', venueCount: 15 }
        },
        '浙江': {
          '杭州市': { id: 'hangzhou', venueCount: 6 }
        },
        '四川': {
          '成都市': { id: 'chengdu', venueCount: 9 }
        },
        '湖北': {
          '武汉市': { id: 'wuhan', venueCount: 5 }
        },
        '陕西': {
          '西安市': { id: 'xian', venueCount: 4 }
        }
      },
      '美国': {
        '加利福尼亚': {
          '洛杉矶': { id: 'losangeles', venueCount: 25 },
          '旧金山': { id: 'sanfrancisco', venueCount: 18 }
        },
        '纽约': {
          '纽约市': { id: 'newyork', venueCount: 32 }
        }
      }
    },
    
    // 当前显示的选项列表
    currentLocationOptions: [],
    
    // 场馆数据
    allGyms: [
      {
        id: 'terminal-station',
        name: 'CrossFit Terminal Station',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
        badge: { type: 'crossfit', text: 'CrossFit认证' },
        location: '北京市朝阳区建国门外大街1号 · 2.3km',
        status: { open: true, hours: '06:00-22:00' },
        courses: ['crossfit', 'weightlifting', 'gymnastics'],
        distance: 2.3,
        rating: 4.8,
        price: 80
      },
      {
        id: 'galaxy-hub',
        name: 'Galaxy Fitness Hub',
        image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=200&fit=crop',
        badge: { type: 'comprehensive', text: '综合训练馆' },
        location: '北京市海淀区中关村大街1号 · 4.7km',
        status: { open: true, hours: '05:30-23:00' },
        courses: ['crossfit', 'weightlifting', 'stretching', 'yoga'],
        distance: 4.7,
        rating: 4.6,
        price: 68
      },
      {
        id: 'stellar-lab',
        name: 'Stellar Movement Lab',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop',
        badge: { type: 'crossfit', text: 'CrossFit认证' },
        location: '北京市朝阳区三里屯太古里 · 3.1km',
        status: { open: true, hours: '07:00-21:30' },
        courses: ['crossfit', 'weightlifting', 'gymnastics'],
        distance: 3.1,
        rating: 4.9,
        price: 120
      },
      {
        id: 'cosmic-training',
        name: 'Cosmic Training Center',
        image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&h=200&fit=crop',
        badge: { type: 'comprehensive', text: '综合训练馆' },
        location: '北京市西城区金融街 · 6.2km',
        status: { open: true, hours: '24小时营业' },
        courses: ['hyrox', 'crossfit', 'weightlifting'],
        distance: 6.2,
        rating: 4.5,
        price: 95
      },
      {
        id: 'orbit-fitness',
        name: 'Orbit Fitness Studio',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop',
        badge: { type: 'comprehensive', text: '综合训练馆' },
        location: '北京市东城区王府井大街 · 5.8km',
        status: { open: false, hours: '明日06:00营业' },
        courses: ['yoga', 'stretching'],
        distance: 5.8,
        rating: 4.4,
        price: 75
      }
    ],
    
    additionalGyms: [
      {
        id: 'power-station',
        name: 'Power Station Gym',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
        badge: { type: 'crossfit', text: 'CrossFit认证' },
        location: '北京市丰台区丽泽商务区 · 7.8km',
        status: { open: true, hours: '06:00-22:00' },
        courses: ['crossfit', 'weightlifting', 'hyrox'],
        distance: 7.8,
        rating: 4.7,
        price: 85
      },
      {
        id: 'zen-movement',
        name: 'Zen Movement Studio',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop',
        badge: { type: 'comprehensive', text: '综合训练馆' },
        location: '北京市昌平区回龙观 · 8.5km',
        status: { open: true, hours: '07:00-21:00' },
        courses: ['yoga', 'stretching'],
        distance: 8.5,
        rating: 4.3,
        price: 60
      },
      {
        id: 'titan-fitness',
        name: 'Titan Fitness Center',
        image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=200&fit=crop',
        badge: { type: 'comprehensive', text: '综合训练馆' },
        location: '北京市通州区副中心 · 9.2km',
        status: { open: false, hours: '明日05:30营业' },
        courses: ['crossfit', 'weightlifting', 'gymnastics', 'hyrox'],
        distance: 9.2,
        rating: 4.6,
        price: 90
      }
    ],
    
    // 筛选后的场馆列表
    filteredGyms: []
  },

  onLoad: function (options) {
    this.updateCurrentTime();
    this.updateBatteryLevel();
    this.initTempFilters();
    this.initLocationOptions();
    this.applyFilters();
    
    // 创建防抖和节流函数
    this.debouncedSearch = debounce(this.handleSearch.bind(this), 300);
    this.throttledLoadMore = throttle(this.loadMoreGyms.bind(this), 500);
  },

  onShow: function () {
    this.updateCurrentTime();
    this.updateBatteryLevel();
  },

  // 更新当前时间
  updateCurrentTime() {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    this.setData({ currentTime: time });
  },

  // 更新电池电量
  updateBatteryLevel() {
    wx.getBatteryInfo({
      success: (res) => {
        this.setData({ batteryLevel: res.level });
      },
      fail: () => {
        this.setData({ batteryLevel: 100 });
      }
    });
  },

  // Toast 提示函数
  showToast(message, duration = 2000) {
    this.setData({
      toastVisible: true,
      toastMessage: message
    });
    
    setTimeout(() => {
      this.setData({ toastVisible: false });
    }, duration);
  },

  // 搜索输入处理
  onSearchInput(e) {
    const searchTerm = e.detail.value;
    this.setData({ searchTerm });
    this.debouncedSearch(searchTerm);
  },

  // 搜索处理
  handleSearch(searchTerm) {
    this.applyFilters();
  },

  // 筛选器切换
  toggleFilter() {
    const filterVisible = !this.data.filterVisible;
    this.setData({ 
      filterVisible,
      filterContentExpanded: filterVisible
    });
    
    if (filterVisible) {
      this.initTempFilters();
    }
  },

  // 筛选器内容展开切换
  toggleFilterContent() {
    const filterContentExpanded = !this.data.filterContentExpanded;
    this.setData({ filterContentExpanded });
  },

  // 筛选选项点击处理
  onFilterOptionTap(e) {
    const { value, type } = e.currentTarget.dataset;
    let { tempFilters } = this.data;
    
    // 创建新的tempFilters对象以确保视图更新
    tempFilters = {
      gymType: [...tempFilters.gymType],
      courseType: [...tempFilters.courseType]
    };
    
    if (type === 'gymType') {
      const index = tempFilters.gymType.indexOf(value);
      if (index > -1) {
        tempFilters.gymType.splice(index, 1);
      } else {
        tempFilters.gymType.push(value);
      }
    } else if (type === 'courseType') {
      const index = tempFilters.courseType.indexOf(value);
      if (index > -1) {
        tempFilters.courseType.splice(index, 1);
      } else {
        tempFilters.courseType.push(value);
      }
    }
    
    // 更新数据并重新计算计数
    this.setData({ tempFilters }, () => {
      this.updateTempFilterCount();
    });
  },

  // 初始化临时筛选器
  initTempFilters() {
    const tempFilters = {
      gymType: [...this.data.filters.gymType],
      courseType: [...this.data.filters.courseType]
    };
    this.setData({ tempFilters });
    this.updateTempFilterCount();
  },

  // 更新临时筛选计数
  updateTempFilterCount() {
    const count = this.data.tempFilters.gymType.length + this.data.tempFilters.courseType.length;
    this.setData({ filterCount: count });
  },

  // 确认筛选
  confirmFilters() {
    const filters = {
      gymType: [...this.data.tempFilters.gymType],
      courseType: [...this.data.tempFilters.courseType]
    };
    
    this.setData({ 
      filters,
      filterVisible: false,
      filterContentExpanded: false
    });
    
    this.applyFilters();
    this.showToast('筛选条件已应用');
  },

  // 重置筛选器
  resetFilters() {
    const tempFilters = { gymType: [], courseType: [] };
    const filters = { gymType: [], courseType: [] };
    
    this.setData({ 
      tempFilters,
      filters,
      filterVisible: false,
      filterContentExpanded: false,
      filterCount: 0
    });
    
    this.applyFilters();
    this.showToast('筛选条件已重置');
  },

  // 应用筛选器
  applyFilters() {
    const { allGyms, searchTerm, filters } = this.data;
    
    let filteredGyms = allGyms.filter(gym => {
      // 搜索词筛选
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          gym.name.toLowerCase().includes(searchLower) ||
          gym.location.toLowerCase().includes(searchLower) ||
          gym.courses.some(course => 
            this.data.courseTypeMap[course].toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }
      
      // 场馆类型筛选
      if (filters.gymType.length > 0) {
        if (!filters.gymType.includes(gym.badge.type)) {
          return false;
        }
      }
      
      // 课程类型筛选
      if (filters.courseType.length > 0) {
        const hasMatchingCourse = filters.courseType.some(type => 
          gym.courses.includes(type)
        );
        if (!hasMatchingCourse) return false;
      }
      
      return true;
    });

    this.setData({ filteredGyms });
    this.updateCityDescription();
  },

  // 更新城市描述
  updateCityDescription() {
    const count = this.data.filteredGyms.length;
    const hasFiltersOrSearch = this.data.searchTerm || this.hasActiveFilters();
    
    let cityDescription;
    if (hasFiltersOrSearch) {
      cityDescription = `筛选结果: ${count} 个训练场馆`;
    } else {
      cityDescription = `已发现 ${this.data.allGyms.length} 个训练场馆`;
    }
    
    this.setData({ cityDescription });
  },

  // 检查是否有活跃的筛选器
  hasActiveFilters() {
    return this.data.filters.gymType.length > 0 || this.data.filters.courseType.length > 0;
  },

  // 初始化位置选项 - 默认显示城市列表
  initLocationOptions() {
    const { currentCityId, locationData } = this.data;
    
    // 找到当前城市对应的国家和省份
    let currentCountry = null;
    let currentProvince = null;
    
    for (const country of Object.keys(locationData)) {
      for (const province of Object.keys(locationData[country])) {
        for (const city of Object.keys(locationData[country][province])) {
          if (locationData[country][province][city].id === currentCityId) {
            currentCountry = country;
            currentProvince = province;
            break;
          }
        }
        if (currentCountry) break;
      }
      if (currentCountry) break;
    }
    
    // 显示当前省份的所有城市
    const cities = currentCountry && currentProvince ? 
      Object.keys(locationData[currentCountry][currentProvince]).map(city => ({
        type: 'city',
        name: city,
        key: locationData[currentCountry][currentProvince][city].id,
        venueCount: locationData[currentCountry][currentProvince][city].venueCount
      })) : [];
    
    this.setData({ 
      currentLocationOptions: cities,
      citySelectionLevel: 'city',
      selectedCountry: currentCountry,
      selectedProvince: currentProvince
    });
  },

  // 城市选择点击
  onCityTap() {
    this.initLocationOptions();
    this.setData({ cityModalVisible: true });
  },

  // 隐藏城市模态框
  hideCityModal() {
    this.setData({ 
      cityModalVisible: false,
      citySelectionLevel: 'country',
      selectedCountry: null,
      selectedProvince: null
    });
  },

  // 位置选项点击处理
  onLocationOptionTap(e) {
    const { type, name, key } = e.currentTarget.dataset;
    
    if (type === 'country') {
      this.selectCountry(name);
    } else if (type === 'province') {
      this.selectProvince(name);
    } else if (type === 'city') {
      this.selectCity(key, name);
    }
  },

  // 选择国家
  selectCountry(country) {
    const provinces = Object.keys(this.data.locationData[country]);
    const currentLocationOptions = provinces.map(province => ({
      type: 'province',
      name: province,
      key: province
    }));
    
    this.setData({
      selectedCountry: country,
      currentLocationOptions,
      citySelectionLevel: 'province'
    });
  },

  // 选择省份
  selectProvince(province) {
    const { selectedCountry, locationData } = this.data;
    const cities = Object.keys(locationData[selectedCountry][province]);
    const currentLocationOptions = cities.map(city => ({
      type: 'city',
      name: city,
      key: locationData[selectedCountry][province][city].id,
      venueCount: locationData[selectedCountry][province][city].venueCount
    }));
    
    this.setData({
      selectedProvince: province,
      currentLocationOptions,
      citySelectionLevel: 'city'
    });
  },

  // 选择城市
  selectCity(cityId, cityName) {
    this.setData({
      currentCityId: cityId,
      currentCityName: cityName,
      cityModalVisible: false,
      citySelectionLevel: 'country',
      selectedCountry: null,
      selectedProvince: null
    });
    
    this.loadCityGyms(cityId);
    this.showToast(`已切换到${cityName}`);
  },

  // 返回上一级选择 - 按城市->省份->国家顺序
  goBackLocationLevel() {
    const { citySelectionLevel, selectedCountry, selectedProvince } = this.data;
    
    if (citySelectionLevel === 'city') {
      // 从城市返回到省份选择
      this.goToProvinceLevel();
    } else if (citySelectionLevel === 'province') {
      // 从省份返回到国家选择
      this.goToCountryLevel();
    }
  },

  // 切换到省份级别
  goToProvinceLevel() {
    const { selectedCountry, locationData } = this.data;
    const provinces = Object.keys(locationData[selectedCountry]);
    const currentLocationOptions = provinces.map(province => ({
      type: 'province',
      name: province,
      key: province
    }));
    
    this.setData({
      currentLocationOptions,
      citySelectionLevel: 'province'
    });
  },

  // 切换到国家级别
  goToCountryLevel() {
    const countries = Object.keys(this.data.locationData);
    const currentLocationOptions = countries.map(country => ({
      type: 'country',
      name: country,
      key: country
    }));
    
    this.setData({ 
      currentLocationOptions,
      citySelectionLevel: 'country',
      selectedCountry: null,
      selectedProvince: null
    });
  },

  // 加载城市场馆数据
  async loadCityGyms(cityId) {
    console.log(`Loading gyms for city: ${cityId}`);
    
    // 显示加载状态
    this.setData({ loading: true });
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 重置数据
      this.setData({
        hasMoreData: true,
        currentPage: 1
      });
      
      this.applyFilters();
      
    } catch (error) {
      console.error('Failed to load city gyms:', error);
      this.showToast('加载失败，请重试');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 场馆详情查看
  viewGymDetail(e) {
    const gymId = e.currentTarget.dataset.gymId;
    console.log(`Navigating to gym detail: ${gymId}`);
    this.showToast('正在跳转到场馆详情页...');
    
    // 这里应该进行实际的路由跳转
    wx.navigateTo({
      url: `/pages/gyms/gym-detail/gym-detail?id=${gymId}`
    });
  },

  // 切换底部Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    // 更新tab状态
    this.setData({ currentTab: tab });
    
    const tabName = {
      'discover': '发现场馆',
      'map': '足迹地图',
      'profile': '我的'
    }[tab];
    
    this.showToast(`正在切换到: ${tabName}`);
    console.log(`Switching to tab: ${tab}`);
    
    // 这里可以添加实际的页面跳转逻辑
    if (tab === 'map') {
      wx.navigateTo({
        url: '/pages/map/map'
      });
    } else if (tab === 'profile') {
      wx.navigateTo({
        url: '/pages/profile/profile'
      });
    }
  },

  // 无限滚动加载更多
  loadMoreGyms() {
    if (this.data.loading || !this.data.hasMoreData) return;
    
    this.throttledLoadMore();
  },

  // 实际加载更多场馆
  async loadMoreGymsImpl() {
    if (this.data.loading || !this.data.hasMoreData) return;
    
    this.setData({ loading: true });
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { currentPage, additionalGyms, allGyms } = this.data;
      const startIndex = (currentPage - 1) * 3;
      const endIndex = Math.min(startIndex + 3, additionalGyms.length);
      
      // 添加新数据
      const newAllGyms = [...allGyms];
      for (let i = startIndex; i < endIndex; i++) {
        if (additionalGyms[i]) {
          newAllGyms.push(additionalGyms[i]);
        }
      }
      
      // 检查是否还有更多数据
      const hasMoreData = endIndex < additionalGyms.length;
      
      this.setData({
        allGyms: newAllGyms,
        currentPage: currentPage + 1,
        hasMoreData
      });
      
      // 重新应用筛选并渲染
      this.applyFilters();
      
    } catch (error) {
      console.error('Failed to load more gyms:', error);
      this.showToast('加载失败，请重试');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 错误处理
  onError(e) {
    console.error('Page error:', e);
    this.showToast('页面发生错误，请重试');
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'MobiLiF拓练 - 发现身边的CrossFit训练场馆',
      path: '/pages/gyms/gym-list/gym-list',
      imageUrl: '/images/share-gym-list.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: 'MobiLiF拓练 - 发现身边的CrossFit训练场馆',
      imageUrl: '/images/share-gym-list.jpg'
    };
  }
});