// pages/profile/profile.js
Page({
  data: {
    user: null,
    menuItems: [
      {
        icon: '🏃‍♂️',
        title: '我的预约',
        desc: '查看预约记录',
        url: '/pages/bookings/my-bookings'
      },
      {
        icon: '🏆',
        title: '成就中心',
        desc: '查看成就和里程碑',
        url: '/pages/achievements/achievements'
      },
      {
        icon: '💰',
        title: '积分商城',
        desc: '使用积分兑换奖励',
        url: '/pages/points/points-mall'
      },
      {
        icon: '⚙️',
        title: '设置',
        desc: '账户和隐私设置',
        url: '/pages/settings/settings'
      }
    ]
  },

  onLoad: function () {
    this.loadUserProfile();
  },

  onShow: function () {
    // 每次显示时刷新用户信息
    this.loadUserProfile();
  },

  // 加载用户资料
  loadUserProfile() {
    // 获取微信用户信息
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          user: {
            avatarUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName,
            points: 1250, // 示例积分
            level: 'Gold', // 示例等级
            totalWorkouts: 45 // 示例锻炼次数
          }
        });
      },
      fail: () => {
        // 如果获取失败，显示默认信息
        this.setData({
          user: {
            avatarUrl: '/assets/icons/default-avatar.png',
            nickName: '未登录用户',
            points: 0,
            level: 'Bronze',
            totalWorkouts: 0
          }
        });
      }
    });
  },

  // 点击菜单项
  onMenuTap(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
      // TODO: 实现页面跳转
      // wx.navigateTo({ url });
    }
  },

  // 点击头像或登录
  onAvatarTap() {
    if (!this.data.user || this.data.user.nickName === '未登录用户') {
      this.login();
    } else {
      wx.showToast({
        title: '已登录',
        icon: 'success'
      });
    }
  },

  // 登录
  login() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          user: {
            ...res.userInfo,
            points: 1250,
            level: 'Gold',
            totalWorkouts: 45
          }
        });
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '登录失败',
          icon: 'error'
        });
      }
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            user: {
              avatarUrl: '/assets/icons/default-avatar.png',
              nickName: '未登录用户',
              points: 0,
              level: 'Bronze',
              totalWorkouts: 0
            }
          });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
});