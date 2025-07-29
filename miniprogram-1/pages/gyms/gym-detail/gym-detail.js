// pages/gyms/gym-detail/gym-detail.js
Page({
  data: {
    gym: null,
    loading: true,
    images: [],
    currentImageIndex: 0
  },

  onLoad: function (options) {
    const gymId = options.id;
    if (gymId) {
      this.loadGymDetail(gymId);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载场馆详情
  loadGymDetail(gymId) {
    this.setData({ loading: true });
    
    wx.request({
      url: 'http://localhost:3000/api/gyms/' + gymId,
      method: 'GET',
      header: {
        'Authorization': 'Bearer test-token'
      },
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({
            gym: res.data.data,
            images: res.data.data.images || [],
            loading: false
          });
          
          // 设置页面标题
          wx.setNavigationBarTitle({
            title: res.data.data.name
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
      }
    });
  },

  // 图片切换
  onImageChange(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  // 预览图片
  previewImages() {
    if (this.data.images.length > 0) {
      wx.previewImage({
        urls: this.data.images,
        current: this.data.images[this.data.currentImageIndex]
      });
    }
  },

  // 拨打电话
  callPhone() {
    if (this.data.gym && this.data.gym.phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.gym.phone
      });
    }
  },

  // 查看位置
  viewLocation() {
    if (this.data.gym && this.data.gym.latitude && this.data.gym.longitude) {
      wx.openLocation({
        latitude: this.data.gym.latitude,
        longitude: this.data.gym.longitude,
        name: this.data.gym.name,
        address: this.data.gym.address
      });
    }
  },

  // 立即预约
  bookNow() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});