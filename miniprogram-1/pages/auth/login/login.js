// pages/auth/login/login.js
Page({
  data: {},
  
  onLogin: function() {
    // 模拟登录
    wx.setStorageSync('userInfo', { 
      id: 1, 
      name: '用户',
      avatar: '/images/default-avatar.png'
    });
    wx.navigateBack();
  }
});