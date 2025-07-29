// utils/gym-data-service.js
// 场馆数据服务 - 实现AC1-AC3所有功能需求

const locationService = require('./location-service.js');

class GymDataService {
  constructor() {
    // 模拟场馆数据 - 基于真实的CrossFit场馆信息
    this.gymsData = [
      {
        id: 'gym_001',
        name: 'CrossFit Sanlitun',
        type: 'crossfit_certified', // crossfit_certified 或 comprehensive
        city: '北京',
        district: '朝阳区',
        address: '朝阳区三里屯太古里SOHO 2号楼 B1层',
        location: {
          latitude: 39.9344,
          longitude: 116.4561
        },
        businessHours: {
          weekday: '06:00-22:00',
          weekend: '08:00-20:00',
          today: '06:00-22:00'
        },
        supportedPrograms: ['CrossFit', '举重', '体操', '拉伸放松'],
        rating: 4.8,
        reviewCount: 156,
        images: ['/assets/images/gym-placeholder.jpg'],
        phone: '+86 138-0001-0001',
        description: '北京首家CrossFit认证圼楼，提供专业的CrossFit训练和指导'
      },
      {
        id: 'gym_002', 
        name: 'CrossFit Wangjing',
        type: 'crossfit_certified',
        city: '北京',
        district: '朝阳区',
        address: '朝阳区望京商业中心 3层',
        location: {
          latitude: 39.9963,
          longitude: 116.4749
        },
        businessHours: {
          weekday: '06:00-23:00',
          weekend: '07:00-21:00', 
          today: '06:00-23:00'
        },
        supportedPrograms: ['CrossFit', '举重', 'Hyrox', '体操'],
        rating: 4.7,
        reviewCount: 203,
        images: ['/assets/images/gym-placeholder.jpg'],
        phone: '+86 138-0001-0002',
        description: '朝阳区高端健身会所，设备先进，教练专业'
      },
      {
        id: 'gym_003',
        name: 'Beast Mode Fitness',
        type: 'comprehensive',
        city: '北京', 
        district: '海淀区',
        address: '海淀区中关村大街18号中科楼 2层',
        location: {
          latitude: 39.9847,
          longitude: 116.3203
        },
        businessHours: {
          weekday: '05:30-23:30',
          weekend: '06:00-23:00',
          today: '05:30-23:30'
        },
        supportedPrograms: ['CrossFit', '举重', '瑜伽'],
        rating: 4.6,
        reviewCount: 89,
        images: ['/assets/images/gym-placeholder.jpg'],
        phone: '+86 138-0001-0003',
        description: '综合型健身工作室，提供多种运动课程'
      },
      {
        id: 'gym_004',
        name: 'Zen Yoga Studio',
        type: 'comprehensive',
        city: '北京',
        district: '东城区',
        address: '东城区王府井大街88号 3层',
        location: {
          latitude: 39.9097,
          longitude: 116.4074
        },
        businessHours: {
          weekday: '07:00-21:00',
          weekend: '08:00-20:00',
          today: '07:00-21:00'
        },
        supportedPrograms: ['瑜伽', '拉伸放松'],
        rating: 4.9,
        reviewCount: 167,
        images: ['/assets/images/gym-placeholder.jpg'],
        phone: '+86 138-0001-0004',
        description: '专业瑜伽工作室，环境优雅，教学专业'
      },
      {
        id: 'gym_005',
        name: 'Iron House Gym',
        type: 'comprehensive',
        city: '北京',
        district: '朝阳区',
        address: '朝阳区三元桥地铁45号世界城 B2层',
        location: {
          latitude: 39.9526,
          longitude: 116.4316
        },
        businessHours: {
          weekday: '06:00-24:00',
          weekend: '06:00-24:00',
          today: '06:00-24:00'
        },
        supportedPrograms: ['举重', 'Hyrox', '体操'],
        rating: 4.5,
        reviewCount: 312,
        images: ['/assets/images/gym-placeholder.jpg'],
        phone: '+86 138-0001-0005',
        description: '24小时健身房，设备齐全，适合力量训练'
      },
      // 上海场馆
      {
        id: 'gym_101',
        name: 'CrossFit Lujiazui',
        type: 'crossfit_certified',
        city: '上海',
        district: '浦东新区',
        address: '浦东新区陆家嘴环路1000号恒丰广场 3层',
        location: {
          latitude: 31.2396,
          longitude: 121.4996
        },
        businessHours: {
          weekday: '06:00-22:00',
          weekend: '08:00-20:00',
          today: '06:00-22:00'
        },
        supportedPrograms: ['CrossFit', '举重', '体操'],
        rating: 4.8,
        reviewCount: 245,
        images: ['/assets/images/gym-placeholder.jpg'],
        phone: '+86 138-0002-0001',
        description: '上海顶级CrossFit圼楼，位于金融中心'
      },
      {
        id: 'gym_102',
        name: 'Flex Yoga Center',
        type: 'comprehensive',
        city: '上海',
        district: '徐汇区', 
        address: '徐汇区淡水路99号永新大厦 15层',
        location: {
          latitude: 31.1886,
          longitude: 121.4365
        },
        businessHours: {
          weekday: '07:00-21:30',
          weekend: '08:00-20:00',
          today: '07:00-21:30'
        },
        supportedPrograms: ['瑜伽', '拉伸放松'],
        rating: 4.7,
        reviewCount: 128,
        images: ['/assets/images/gym-placeholder.jpg'],
        phone: '+86 138-0002-0002',
        description: '上海知名瑜伽中心，环境优雅，师资一流'
      }
    ];
  }

  /**
   * 获取当前时间的营业状态
   */
  getBusinessStatus(businessHours) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // 当前时间（分钟）
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    const todayHours = isWeekend ? businessHours.weekend : businessHours.weekday;
    const [openTime, closeTime] = todayHours.split('-');
    
    const openMinutes = this.timeToMinutes(openTime);
    const closeMinutes = this.timeToMinutes(closeTime);
    
    // 处理跨夜情况（如 06:00-24:00）
    if (closeMinutes <= openMinutes) {
      // 跨夜营业
      return currentTime >= openMinutes || currentTime <= closeMinutes;
    } else {
      // 正常营业
      return currentTime >= openMinutes && currentTime <= closeMinutes;
    }
  }

  /**
   * 将时间字符串转换为分钟数
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * AC1: 获取附近场馆列表
   * 按距离排序，包含所有必需信息
   */
  async getNearbyGyms(userLocation, city = null, options = {}) {
    const {
      maxDistance = 50, // 最大距离（公里）
      limit = 20,
      searchKeyword = '',
      filters = {}
    } = options;

    // 筛选当前城市的场馆
    let filteredGyms = this.gymsData.filter(gym => {
      if (city && gym.city !== city) {
        return false;
      }
      return true;
    });

    // 应用搜索过滤
    if (searchKeyword) {
      filteredGyms = this.searchGymsByKeyword(filteredGyms, searchKeyword);
    }

    // 应用筛选条件
    if (Object.keys(filters).length > 0) {
      filteredGyms = this.applyFilters(filteredGyms, filters);
    }

    // 计算距离并排序
    const gymsWithDistance = filteredGyms.map(gym => {
      const distance = locationService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        gym.location.latitude,
        gym.location.longitude
      );

      return {
        ...gym,
        distance,
        distanceText: locationService.formatDistance(distance),
        businessStatus: this.getBusinessStatus(gym.businessHours) ? '营业中' : '未营业',
        todayHours: this.getTodayHours(gym.businessHours)
      };
    })
    .filter(gym => gym.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

    return {
      success: true,
      data: gymsWithDistance,
      total: gymsWithDistance.length,
      userLocation,
      city: city || '当前位置'
    };
  }

  /**
   * 获取今日营业时间
   */
  getTodayHours(businessHours) {
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    return isWeekend ? businessHours.weekend : businessHours.weekday;
  }

  /**
   * AC2: 按关键词搜索场馆
   * 全模糊匹配场馆名称
   */
  searchGymsByKeyword(gyms, keyword) {
    const lowerKeyword = keyword.toLowerCase().trim();
    if (!lowerKeyword) return gyms;

    return gyms.filter(gym => {
      return gym.name.toLowerCase().includes(lowerKeyword) ||
             gym.district.toLowerCase().includes(lowerKeyword) ||
             gym.address.toLowerCase().includes(lowerKeyword) ||
             gym.description.toLowerCase().includes(lowerKeyword);
    });
  }

  /**
   * AC2: 应用筛选条件
   */
  applyFilters(gyms, filters) {
    return gyms.filter(gym => {
      // 课程类型筛选
      if (filters.programTypes && filters.programTypes.length > 0) {
        const hasMatchingProgram = filters.programTypes.some(program => 
          gym.supportedPrograms.includes(program)
        );
        if (!hasMatchingProgram) return false;
      }

      // 场馆类型筛选
      if (filters.gymTypes && filters.gymTypes.length > 0) {
        if (!filters.gymTypes.includes(gym.type)) return false;
      }

      return true;
    });
  }

  /**
   * AC3: 获取可用城市列表
   */
  getAvailableCities() {
    const cities = [...new Set(this.gymsData.map(gym => gym.city))];
    return cities.map(city => {
      const gymCount = this.gymsData.filter(gym => gym.city === city).length;
      return {
        name: city,
        gymCount,
        country: '中国' // 现在只支持中国城市
      };
    });
  }

  /**
   * AC3: 获取可用国家列表
   */
  getAvailableCountries() {
    return [
      {
        name: '中国',
        code: 'CN',
        cities: this.getAvailableCities()
      }
      // 可以扩展其他国家
    ];
  }

  /**
   * 获取场馆详情
   */
  async getGymDetail(gymId) {
    const gym = this.gymsData.find(g => g.id === gymId);
    if (!gym) {
      return {
        success: false,
        error: '场馆不存在'
      };
    }

    return {
      success: true,
      data: {
        ...gym,
        businessStatus: this.getBusinessStatus(gym.businessHours) ? '营业中' : '未营业',
        todayHours: this.getTodayHours(gym.businessHours)
      }
    };
  }

  /**
   * 获取筛选选项
   */
  getFilterOptions() {
    return {
      programTypes: ['CrossFit', '举重', 'Hyrox', '体操', '拉伸放松', '瑜伽'],
      gymTypes: [
        { value: 'crossfit_certified', label: 'CrossFit认证' },
        { value: 'comprehensive', label: '综合训练馆' }
      ]
    };
  }

  /**
   * 按城市获取场馆列表 - 适配前端调用
   */
  async getGymsByCity(cityName, options = {}) {
    const {
      filters = {},
      keyword = '',
      userLocation = null
    } = options;

    // 筛选指定城市的场馆
    let filteredGyms = this.gymsData.filter(gym => gym.city === cityName);

    // 应用搜索关键词
    if (keyword) {
      filteredGyms = this.searchGymsByKeyword(filteredGyms, keyword);
    }

    // 应用筛选条件
    if (filters.gymType && filters.gymType !== 'all') {
      filteredGyms = filteredGyms.filter(gym => gym.type === filters.gymType);
    }

    if (filters.programTypes && filters.programTypes.length > 0) {
      filteredGyms = filteredGyms.filter(gym => 
        filters.programTypes.some(program => gym.supportedPrograms.includes(program))
      );
    }

    // 计算距离并处理数据
    const processedGyms = filteredGyms.map(gym => {
      let distance = 0;
      if (userLocation && gym.location) {
        distance = locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          gym.location.latitude,
          gym.location.longitude
        );
      }

      // 应用距离筛选
      if (filters.distance && filters.distance !== 'all') {
        const maxDistance = parseInt(filters.distance);
        if (distance > maxDistance) {
          return null;
        }
      }

      return {
        ...gym,
        distance: distance.toFixed(1),
        businessStatus: this.getBusinessStatus(gym.businessHours) ? '营业中' : '已打烊',
        todayHours: this.getTodayHours(gym.businessHours),
        isOpen: this.getBusinessStatus(gym.businessHours)
      };
    }).filter(gym => gym !== null);

    // 按距离排序
    if (userLocation) {
      processedGyms.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }

    return processedGyms;
  }
}

// 创建单例
const gymDataService = new GymDataService();

module.exports = gymDataService;
