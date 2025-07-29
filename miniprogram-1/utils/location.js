// utils/location.js
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

module.exports = new LocationService();