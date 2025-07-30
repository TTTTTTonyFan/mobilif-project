// MobiLiF拓练 - 场馆详情页面 - 完全按照gym_detail_page2.html实现
Page({
  data: {
    // 基础数据
    loading: true,
    gymId: null,
    
    // 场馆详细信息
    gym: {
      id: 'terminal-station',
      name: 'CrossFit Terminal Station',
      type: 'crossfit',
      typeLabel: 'CrossFit官方认证场馆',
      images: [
        'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=400&fit=crop'
      ],
      phone: '010-8888-8888',
      email: 'info@terminal-station.com',
      address: '北京市朝阳区建国门外大街1号',
      latitude: 39.9042,
      longitude: 116.4074,
      distance: 2.3,
      rating: 4.8,
      reviewCount: 128,
      businessStatus: '营业中',
      todayHours: '06:00-22:00',
      isFavorited: false,
      supportedPrograms: ['WOD训练', 'Olympic Lifting', 'Gymnastics', 'Powerlifting', '私教课程'],
      // 线上渠道
      miniProgram: {
        appId: 'wx1234567890',
        path: 'pages/index/index',
        name: 'Terminal Station CF'
      },
      instagram: '@terminal_station_cf',
      website: {
        url: 'https://terminal-station.com',
        domain: 'terminal-station.com'
      },
      // 价格信息
      pricing: {
        dropInPrice: 120,
        memberPrice: 80,
        weeklyPass: 400,
        monthlyPass: 1200,
        specialNote: '新用户首次训练免费！需购买运动意外保险（¥5/次）',
        paymentMethods: ['现金', '支付宝', '微信支付', '信用卡']
      },
      // 交通信息
      transportation: {
        walkTime: '15分钟',
        driveTime: '8分钟',
        subway: '地铁1号线 建国门站B口 步行5分钟',
        bus: '公交站：建国门外大街 步行2分钟',
        parking: '地下停车场：免费停车2小时'
      }
    },
    
    // 图片轮播
    currentImageIndex: 0,
    
    // Tab状态
    activeTab: 'contact',
    
    // 营业时间展开状态
    hoursExpanded: false,
    
    // 一周营业时间
    weeklyHours: [
      { day: '今天 (周一)', hours: '06:00 - 22:00', isToday: true, isClosed: false },
      { day: '周二', hours: '06:00 - 22:00', isToday: false, isClosed: false },
      { day: '周三', hours: '06:00 - 22:00', isToday: false, isClosed: false },
      { day: '周四', hours: '06:00 - 22:00', isToday: false, isClosed: false },
      { day: '周五', hours: '06:00 - 23:00', isToday: false, isClosed: false },
      { day: '周六', hours: '08:00 - 21:00', isToday: false, isClosed: false },
      { day: '周日', hours: '休息', isToday: false, isClosed: true }
    ],
    
    // 设施设备数据
    facilities: [
      { name: '停车位', desc: '免费停车', icon: '🚗', available: true },
      { name: '淋浴间', desc: '热水供应', icon: '🚿', available: true },
      { name: '更衣室', desc: '男女分开', icon: '👕', available: true },
      { name: '储物柜', desc: '免费使用', icon: '🔒', available: true },
      { name: '杠铃', desc: '20套奥林匹克杠铃', icon: '🏋️', available: true },
      { name: '壶铃', desc: '8-32kg全套', icon: '⚖️', available: true },
      { name: '引体架', desc: 'Rogue品牌', icon: '🤸', available: true },
      { name: '划船机', desc: 'Concept2', icon: '🚣', available: true },
      { name: '风阻单车', desc: 'Assault Bike', icon: '🚴', available: true },
      { name: '休息区', desc: '舒适沙发', icon: '🛋️', available: true },
      { name: '营养补给', desc: '蛋白粉、饮料', icon: '☕', available: true },
      { name: '装备售卖', desc: '暂未提供', icon: '🛍️', available: false }
    ]
  },

  onLoad: function (options) {
    const gymId = options.id || 'terminal-station';
    this.setData({ gymId });
    this.loadGymDetail(gymId);
    this.updateBusinessStatus();
  },

  onShow: function () {
    this.updateBusinessStatus();
  },

  // 加载场馆详情
  loadGymDetail(gymId) {
    this.setData({ loading: true });
    
    // 模拟API调用，实际项目中应该从服务器获取数据
    setTimeout(() => {
      // 根据gymId从gym-list中获取对应的场馆数据
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      
      if (prevPage && prevPage.data.allGyms) {
        const gymData = prevPage.data.allGyms.find(gym => gym.id === gymId) || 
                       prevPage.data.additionalGyms.find(gym => gym.id === gymId);
        
        if (gymData) {
          // 扩展场馆数据
          const enhancedGym = {
            ...this.data.gym,
            id: gymData.id,
            name: gymData.name,
            images: gymData.image ? [gymData.image, gymData.image, gymData.image] : this.data.gym.images,
            typeLabel: gymData.badge.text,
            distance: gymData.distance,
            rating: gymData.rating,
            businessStatus: gymData.status.open ? '营业中' : '未营业',
            todayHours: gymData.status.hours,
            supportedPrograms: gymData.courses.map(course => this.getCourseLabel(course))
          };
          
          this.setData({
            gym: enhancedGym,
            loading: false
          });
          
          // 设置页面标题
          wx.setNavigationBarTitle({
            title: enhancedGym.name
          });
        }
      } else {
        this.setData({ loading: false });
      }
    }, 800);
  },

  // 获取课程标签
  getCourseLabel(courseType) {
    const courseMap = {
      'crossfit': 'WOD训练',
      'weightlifting': 'Olympic Lifting',
      'gymnastics': 'Gymnastics',
      'stretching': '拉伸恢复',
      'yoga': '瑜伽',
      'hyrox': 'Hyrox'
    };
    return courseMap[courseType] || courseType;
  },

  // 更新营业状态
  updateBusinessStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0=周日, 1=周一, ...
    
    let businessStatus = '未营业';
    if (currentDay === 0) { // 周日休息
      businessStatus = '休息中';
    } else if (currentHour >= 6 && currentHour < 22) {
      businessStatus = '营业中';
    }
    
    this.setData({
      'gym.businessStatus': businessStatus
    });
  },

  // 图片轮播切换
  onImageChange(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  // 预览图片
  previewImages() {
    wx.previewImage({
      urls: this.data.gym.images,
      current: this.data.gym.images[this.data.currentImageIndex]
    });
  },

  // Tab切换
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 营业时间展开/收起
  toggleHours() {
    this.setData({
      hoursExpanded: !this.data.hoursExpanded
    });
  },

  // 收藏功能
  toggleFavorite() {
    const isFavorited = !this.data.gym.isFavorited;
    this.setData({
      'gym.isFavorited': isFavorited
    });
    
    wx.showToast({
      title: isFavorited ? '已添加到收藏' : '已取消收藏',
      icon: 'none'
    });
  },

  // 分享功能
  shareGym() {
    // 微信小程序分享会自动触发onShareAppMessage
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  // 联系场馆 - 拨打电话
  callGym() {
    wx.makePhoneCall({
      phoneNumber: this.data.gym.phone,
      fail: () => {
        wx.showToast({
          title: '拨号失败',
          icon: 'error'
        });
      }
    });
  },

  // 复制Email
  copyEmail() {
    wx.setClipboardData({
      data: this.data.gym.email,
      success: () => {
        wx.showToast({
          title: 'Email地址已复制',
          icon: 'none'
        });
      }
    });
  },

  // 复制地址
  copyAddress() {
    wx.setClipboardData({
      data: this.data.gym.address,
      success: () => {
        wx.showToast({
          title: '地址已复制',
          icon: 'none'
        });
      }
    });
  },

  // 打开小程序
  openMiniProgram() {
    const miniProgram = this.data.gym.miniProgram;
    wx.navigateToMiniProgram({
      appId: miniProgram.appId,
      path: miniProgram.path,
      success: () => {
        console.log('小程序跳转成功');
      },
      fail: () => {
        wx.showToast({
          title: '小程序跳转失败',
          icon: 'error'
        });
      }
    });
  },

  // 复制Instagram账号
  copyInstagram() {
    wx.setClipboardData({
      data: this.data.gym.instagram,
      success: () => {
        wx.showToast({
          title: '已复制Instagram账号',
          icon: 'none'
        });
      }
    });
  },

  // 打开官网
  openWebsite() {
    const website = this.data.gym.website;
    // 在小程序内置浏览器中打开
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(website.url)}&title=${encodeURIComponent('官网')}`
    });
  },

  // 打开地图导航
  openNavigation() {
    const gym = this.data.gym;
    wx.openLocation({
      latitude: gym.latitude,
      longitude: gym.longitude,
      name: gym.name,
      address: gym.address,
      scale: 18
    });
  },

  // 分享应用消息
  onShareAppMessage() {
    const gym = this.data.gym;
    return {
      title: `${gym.name} - 推荐一个很棒的CrossFit场馆`,
      path: `/pages/gyms/gym-detail/gym-detail?id=${gym.id}`,
      imageUrl: gym.images[0]
    };
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack({
      fail: () => {
        // 如果无法返回，则跳转到场馆列表页
        wx.redirectTo({
          url: '/pages/gyms/gym-list/gym-list'
        });
      }
    });
  },

  // 分享朋友圈
  onShareTimeline() {
    const gym = this.data.gym;
    return {
      title: `${gym.name} - MobiLiF拓练`,
      imageUrl: gym.images[0]
    };
  }
});