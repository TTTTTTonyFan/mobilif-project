// utils/location-service.js
// 地理位置服务 - 实现AC1地理位置获取和距离计算

class LocationService {
  constructor() {
    this.userLocation = null;
    this.currentCity = null;
  }

  /**
   * 获取用户位置授权
   */
  async requestLocationPermission() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation']) {
            resolve(true);
          } else {
            wx.authorize({
              scope: 'scope.userLocation',
              success: () => resolve(true),
              fail: () => {
                wx.showModal({
                  title: '位置授权',
                  content: '为了为您推荐附近的场馆，请授权获取您的位置信息',
                  confirmText: '去设置',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      wx.openSetting({
                        success: (settingRes) => {
                          resolve(!!settingRes.authSetting['scope.userLocation']);
                        }
                      });
                    } else {
                      resolve(false);
                    }
                  }
                });
              }
            });
          }
        }
      });
    });
  }

  /**
   * 获取用户当前位置
   */
  async getCurrentLocation() {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      throw new Error('用户拒绝位置授权');
    }

    return new Promise(async (resolve, reject) => {
      wx.getLocation({
        type: 'gcj02', // 使用微信小程序推荐的坐标系
        success: async (res) => {
          this.userLocation = {
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy,
            timestamp: Date.now()
          };
          
          // 获取城市信息
          try {
            const cityInfo = await this.getCityFromLocation(res.latitude, res.longitude);
            this.userLocation.city = cityInfo.city;
            this.userLocation.district = cityInfo.district;
            this.userLocation.country = cityInfo.country;
          } catch (error) {
            console.warn('获取城市信息失败，使用默认城市:', error);
            this.userLocation.city = '北京';
            this.userLocation.district = '朝阳区';
            this.userLocation.country = '中国';
          }
          
          resolve(this.userLocation);
        },
        fail: (error) => {
          console.error('获取位置失败:', error);
          reject(new Error('获取位置失败'));
        }
      });
    });
  }

  /**
   * 根据坐标逆地理编码获取城市信息
   */
  async getCityFromLocation(latitude, longitude) {
    // 这里应该调用真实的逆地理编码API，现在使用模拟数据
    return new Promise((resolve) => {
      // 模拟逆地理编码结果
      const mockCities = {
        '39.9': { city: '北京', district: '朝阳区', country: '中国' },
        '31.2': { city: '上海', district: '浦东新区', country: '中国' },
        '22.5': { city: '深圳', district: '南山区', country: '中国' },
        '30.2': { city: '杭州', district: '西湖区', country: '中国' }
      };
      
      const latKey = Math.floor(latitude * 10) / 10;
      const cityInfo = mockCities[latKey.toString()] || {
        city: '北京',
        district: '朝阳区', 
        country: '中国'
      };
      
      this.currentCity = cityInfo;
      resolve(cityInfo);
    });
  }

  /**
   * 计算两点间距离（公里）
   * 使用Haversine公式计算地球表面两点间的距离
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // 保留1位小数
  }

  /**
   * 角度转弧度
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * 格式化距离显示
   */
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }

  /**
   * 获取用户位置信息（包含城市）
   */
  async getUserLocationWithCity() {
    try {
      const location = await this.getCurrentLocation();
      const cityInfo = await this.getCityFromLocation(location.latitude, location.longitude);
      
      return {
        ...location,
        cityInfo
      };
    } catch (error) {
      console.error('获取位置和城市信息失败:', error);
      // 返回默认位置（北京天安门）
      return {
        latitude: 39.9042,
        longitude: 116.4074,
        accuracy: 0,
        timestamp: Date.now(),
        cityInfo: {
          city: '北京',
          district: '东城区',
          country: '中国'
        },
        isDefault: true
      };
    }
  }

  /**
   * 检查位置缓存是否有效（5分钟内）
   */
  isLocationCacheValid() {
    if (!this.userLocation || !this.userLocation.timestamp) {
      return false;
    }
    
    const cacheTime = 5 * 60 * 1000; // 5分钟
    return (Date.now() - this.userLocation.timestamp) < cacheTime;
  }

  /**
   * 获取缓存的位置信息
   */
  getCachedLocation() {
    return this.isLocationCacheValid() ? this.userLocation : null;
  }
}

// 创建单例
const locationService = new LocationService();

module.exports = locationService;
