// utils/api.js
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
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
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
      url: `/api/gyms/${id}`
    });
  }

  // 获取城市列表
  getCities() {
    return this.request({
      url: '/api/gyms/cities'
    });
  }
}

module.exports = new ApiService();