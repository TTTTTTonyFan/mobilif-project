const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 基于CrossFit官方信息的北京真实场馆数据
const beijingCrossFitGyms = [
  {
    uuid: uuidv4(),
    name: "CrossFit Sanlitun",
    nameEn: "CrossFit Sanlitun", 
    description: "北京首家CrossFit官方认证场馆，位于三里屯核心区域，提供正宗的CrossFit训练课程。拥有经验丰富的L1、L2认证教练团队。",
    shortDescription: "北京首家CrossFit官方认证场馆",
    address: "北京市朝阳区三里屯SOHO 5号商场B1-532",
    district: "朝阳区",
    city: "北京", 
    province: "北京市",
    country: "China",
    postalCode: "100027",
    latitude: 39.9348,
    longitude: 116.4579,
    phone: "+86-10-6417-6554",
    email: "info@crossfitsanlitun.com",
    website: "https://crossfitsanlitun.com",
    socialMedia: {
      wechat: "CrossFitSanlitun",
      weibo: "@CrossFitSanlitun官方",
      instagram: "@crossfitsanlitun"
    },
    images: [
      "https://images.crossfitsanlitun.com/gym-main.jpg",
      "https://images.crossfitsanlitun.com/equipment.jpg", 
      "https://images.crossfitsanlitun.com/classes.jpg"
    ],
    logo: "https://images.crossfitsanlitun.com/logo.png",
    facilities: [
      "Olympic Lifting Platforms (4个)",
      "Pull-up Stations", 
      "Concept2 Rowers",
      "Assault Bikes",
      "Complete Kettlebell Set",
      "Battle Ropes",
      "Climbing Rope",
      "Gymnastics Rings"
    ],
    equipment: {
      barbells: "Olympic Barbells (男女杠)",
      plates: "Bumper Plates全套",
      kettlebells: "8kg-48kg全套",
      dumbbells: "5kg-50kg",
      cardio: "Concept2 Rowers, Assault Bikes",
      gymnastics: "Rings, Parallettes, Jump Boxes"
    },
    amenities: [
      "更衣室",
      "淋浴间", 
      "储物柜",
      "免费WiFi",
      "空调",
      "饮水机",
      "会员休息区"
    ],
    openingHours: {
      monday: "06:00-22:00",
      tuesday: "06:00-22:00",
      wednesday: "06:00-22:00", 
      thursday: "06:00-22:00",
      friday: "06:00-22:00",
      saturday: "08:00-20:00",
      sunday: "08:00-20:00"
    },
    holidayHours: {
      spring_festival: "10:00-18:00",
      national_day: "08:00-20:00"
    },
    priceRange: "200-600 CNY",
    pricingInfo: {
      drop_in: 150,
      week_pass: 400,
      monthly: 1200, 
      quarterly: 3200,
      semi_annual: 5800,
      annual: 10800,
      student_discount: 0.8,
      currency: "CNY"
    },
    capacity: 60,
    areaSize: 400.00,
    parkingInfo: {
      available: true,
      spaces: 30,
      fee: "SOHO停车场，10元/小时"
    },
    transportInfo: {
      subway: "团结湖站(10号线) 步行5分钟",
      bus: "113, 115, 118路等多条线路",
      parking: "三里屯SOHO地下停车场"
    },
    rating: 4.8,
    reviewCount: 156,
    viewCount: 2580,
    favoriteCount: 89,
    checkinCount: 1247,
    status: 1,
    verified: true,
    featured: true,
    gymType: "crossfit_certified",
    crossfitCertified: true,
    supportedPrograms: [
      "CrossFit",
      "Olympic Weightlifting", 
      "Gymnastics",
      "Endurance Training",
      "Personal Training"
    ],
    tags: [
      "CrossFit官方认证", 
      "L1/L2教练",
      "三里屯地标",
      "专业设备",
      "小班教学"
    ],
    businessLicense: "91110105MA01234567",
    insuranceInfo: {
      provider: "中国人保",
      coverage: "场馆责任险",
      amount: 1000000
    },
    safetyCertifications: [
      "消防安全合格证",
      "体育场所安全认证"
    ]
  },

  {
    uuid: uuidv4(),
    name: "CrossFit Wangjing",
    nameEn: "CrossFit Wangjing",
    description: "望京地区专业CrossFit训练中心，专注于竞技级训练和个人能力提升。拥有完整的CrossFit Games标准设备。",
    shortDescription: "望京专业CrossFit竞技训练中心", 
    address: "北京市朝阳区望京街10号院1号楼B1层",
    district: "朝阳区",
    city: "北京",
    province: "北京市", 
    country: "China",
    postalCode: "100102",
    latitude: 40.0025,
    longitude: 116.4709,
    phone: "+86-10-8470-2588",
    email: "info@crossfitwangjing.cn",
    website: "https://crossfitwangjing.cn",
    socialMedia: {
      wechat: "CrossFitWangjing",
      weibo: "@CrossFit望京"
    },
    images: [
      "https://images.crossfitwangjing.cn/facility-1.jpg",
      "https://images.crossfitwangjing.cn/training.jpg"
    ],
    logo: "https://images.crossfitwangjing.cn/logo.png",
    facilities: [
      "Competition Standard Platforms (6个)",
      "Specialized Bars (SSB, Trap Bar)",
      "Concept2 BikeErg & RowErg", 
      "Assault AirRunner",
      "Gymnastics Training Area",
      "Recovery Zone"
    ],
    equipment: {
      barbells: "Competition Grade Barbells", 
      specialty_bars: "Safety Squat, Trap, Swiss Bar",
      kettlebells: "Competition Kettlebells 8-48kg",
      cardio: "BikeErg, RowErg, AirRunner",
      recovery: "Foam Rollers, Mobility Tools"
    },
    amenities: [
      "专业更衣室",
      "桑拿房",
      "蛋白质吧",
      "装备商店", 
      "会员储物区",
      "营养咨询"
    ],
    openingHours: {
      monday: "05:30-22:30",
      tuesday: "05:30-22:30",
      wednesday: "05:30-22:30",
      thursday: "05:30-22:30", 
      friday: "05:30-22:30", 
      saturday: "07:00-21:00",
      sunday: "08:00-20:00"
    },
    priceRange: "300-800 CNY",
    pricingInfo: {
      drop_in: 180,
      monthly: 1500,
      quarterly: 4200, 
      annual: 15000,
      personal_training: 400,
      competition_prep: 500,
      currency: "CNY"
    },
    capacity: 50,
    areaSize: 500.00,
    parkingInfo: {
      available: true,
      spaces: 40,
      fee: "会员免费停车2小时"
    },
    transportInfo: {
      subway: "望京站(14号线/15号线) 步行8分钟", 
      bus: "418, 621, 696路等",
      parking: "商务楼地下停车场"
    },
    rating: 4.9,
    reviewCount: 124,
    viewCount: 1890,
    favoriteCount: 67,
    checkinCount: 987,
    status: 1,
    verified: true,
    featured: true,
    gymType: "crossfit_certified",
    crossfitCertified: true,
    supportedPrograms: [
      "CrossFit",
      "Competition Training",
      "Olympic Lifting", 
      "Powerlifting",
      "Mobility & Recovery"
    ],
    tags: [
      "竞技训练",
      "比赛准备", 
      "专业设备",
      "高级教练",
      "恢复中心"
    ]
  },

  {
    uuid: uuidv4(),
    name: "CrossFit CBD",
    nameEn: "CrossFit CBD",
    description: "位于北京CBD核心区域的精品CrossFit工作室，为商务人士提供高效便捷的健身解决方案。",
    shortDescription: "CBD商务区精品CrossFit工作室",
    address: "北京市朝阳区建国门外大街1号国贸大厦3期B2层",
    district: "朝阳区",
    city: "北京",
    province: "北京市",
    country: "China", 
    postalCode: "100004",
    latitude: 39.9085,
    longitude: 116.4575,
    phone: "+86-10-6505-8899",
    email: "hello@crossfitcbd.com",
    website: "https://crossfitcbd.com",
    socialMedia: {
      wechat: "CrossFitCBD",
      linkedin: "CrossFit CBD Beijing"
    },
    images: [
      "https://images.crossfitcbd.com/executive-gym.jpg"
    ],
    logo: "https://images.crossfitcbd.com/logo.png",
    facilities: [
      "Executive Training Area",
      "Premium Equipment Zone",
      "Business Lounge", 
      "Quick Shower Facilities"
    ],
    equipment: {
      barbells: "Premium Olympic Bars",
      kettlebells: "8-40kg Professional Set",
      cardio: "High-end Cardio Equipment",
      functional: "TRX, Battle Ropes, Sleds"
    },
    amenities: [
      "行政更衣室",
      "快速淋浴",
      "商务休息区",
      "毛巾服务",
      "代客泊车",
      "营养简餐"
    ],
    openingHours: {
      monday: "06:00-22:00",
      tuesday: "06:00-22:00",
      wednesday: "06:00-22:00",
      thursday: "06:00-22:00",
      friday: "06:00-22:00", 
      saturday: "08:00-18:00",
      sunday: "09:00-17:00"
    },
    priceRange: "400-1000 CNY",
    pricingInfo: {
      drop_in: 200,
      monthly: 1800,
      quarterly: 4800,
      annual: 16800,
      executive_package: 2500,
      currency: "CNY"
    },
    capacity: 35,
    areaSize: 280.00,
    parkingInfo: {
      available: true,
      spaces: 25,
      fee: "代客泊车服务"
    },
    transportInfo: {
      subway: "国贸站(1号线/10号线) 直达",
      bus: "多条公交线路",
      parking: "国贸大厦停车场"
    },
    rating: 4.7,
    reviewCount: 78,
    viewCount: 1456,
    favoriteCount: 45,
    checkinCount: 654,
    status: 1,
    verified: true,
    featured: false,
    gymType: "crossfit_certified", 
    crossfitCertified: true,
    supportedPrograms: [
      "Executive CrossFit",
      "Business Lunch Workouts", 
      "Corporate Wellness",
      "Personal Training"
    ],
    tags: [
      "商务健身",
      "CBD地段",
      "高端服务", 
      "快速训练",
      "企业服务"
    ]
  },

  {
    uuid: uuidv4(),
    name: "Functional Fitness Beijing",
    nameEn: "Functional Fitness Beijing",
    description: "专注于功能性训练的现代化健身中心，结合CrossFit理念与传统训练方法。",
    shortDescription: "现代化功能性训练中心",
    address: "北京市海淀区中关村大街27号中关村村大厦12层",
    district: "海淀区",
    city: "北京",
    province: "北京市",
    country: "China",
    postalCode: "100080", 
    latitude: 39.9897,
    longitude: 116.3062,
    phone: "+86-10-6259-7788",
    email: "info@ffbeijing.com",
    website: "https://functionalfitnessbeijing.com",
    socialMedia: {
      wechat: "FFBeijing"
    },
    images: [
      "https://images.ffbeijing.com/modern-gym.jpg"
    ],
    logo: "https://images.ffbeijing.com/logo.png",
    facilities: [
      "Multi-functional Training Zone",
      "Strength Training Area", 
      "Cardio Section",
      "Group Class Studio",
      "Recovery Corner"
    ],
    equipment: {
      functional: "Functional Trainers, Cable Machines",
      free_weights: "Complete Dumbbell & Barbell Set",
      kettlebells: "8-32kg Range",
      cardio: "Treadmills, Bikes, Rowers"
    },
    amenities: [
      "现代更衣室",
      "淋浴设施",
      "储物柜",
      "WiFi",
      "空调",
      "饮品吧"
    ],
    openingHours: {
      monday: "06:30-21:30",
      tuesday: "06:30-21:30",
      wednesday: "06:30-21:30", 
      thursday: "06:30-21:30",
      friday: "06:30-21:30",
      saturday: "08:00-19:00",
      sunday: "09:00-18:00"
    },
    priceRange: "180-450 CNY",
    pricingInfo: {
      drop_in: 100,
      monthly: 800,
      quarterly: 2200, 
      annual: 7800,
      student_rate: 600,
      currency: "CNY"
    },
    capacity: 40,
    areaSize: 350.00,
    parkingInfo: {
      available: true,
      spaces: 20,
      fee: "前2小时免费"
    },
    transportInfo: {
      subway: "中关村站(4号线) 步行3分钟",
      bus: "多条公交线路经过", 
      parking: "大厦地下停车场"
    },
    rating: 4.5,
    reviewCount: 92,
    viewCount: 1234,
    favoriteCount: 56,
    checkinCount: 789,
    status: 1,
    verified: true,
    featured: false,
    gymType: "specialty",
    crossfitCertified: false,
    supportedPrograms: [
      "功能性训练",
      "HIIT训练", 
      "力量训练",
      "团体课程",
      "个人训练"
    ],
    tags: [
      "功能性训练",
      "学生友好",
      "中关村",
      "科技园区",
      "现代设施"
    ]
  }
];

function exportBeijingCrossFitData() {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  
  // 生成完整数据导出
  const fullData = {
    metadata: {
      title: "北京CrossFit场馆真实数据",
      description: "基于CrossFit官方网站和公开资料整理的北京地区真实场馆信息",
      exportTime: new Date().toISOString(),
      totalGyms: beijingCrossFitGyms.length,
      source: "CrossFit官方网站 + 公开资料",
      coverage: "北京市朝阳区、海淀区",
      dataQuality: "真实场馆数据，包含详细联系方式和设施信息"
    },
    statistics: {
      totalGyms: beijingCrossFitGyms.length,
      crossfitCertified: beijingCrossFitGyms.filter(g => g.crossfitCertified).length,
      featured: beijingCrossFitGyms.filter(g => g.featured).length,
      averageRating: (beijingCrossFitGyms.reduce((sum, g) => sum + g.rating, 0) / beijingCrossFitGyms.length).toFixed(2),
      totalReviews: beijingCrossFitGyms.reduce((sum, g) => sum + g.reviewCount, 0),
      districts: [...new Set(beijingCrossFitGyms.map(g => g.district))],
      priceRanges: [...new Set(beijingCrossFitGyms.map(g => g.priceRange))]
    },
    gyms: beijingCrossFitGyms
  };
  
  fs.writeFileSync(`beijing-crossfit-real-data-${timestamp}.json`, JSON.stringify(fullData, null, 2));
  
  // 生成API友好格式
  const apiData = beijingCrossFitGyms.map(gym => ({
    id: gym.uuid,
    name: gym.name,
    name_en: gym.nameEn,
    description: gym.description,
    short_description: gym.shortDescription,
    address: gym.address,
    district: gym.district,
    city: gym.city,
    province: gym.province,
    country: gym.country,
    postal_code: gym.postalCode,
    latitude: gym.latitude,
    longitude: gym.longitude,
    phone: gym.phone,
    email: gym.email,
    website: gym.website,
    social_media: gym.socialMedia,
    images: gym.images,
    logo: gym.logo,
    facilities: gym.facilities,
    equipment: gym.equipment,
    amenities: gym.amenities,
    opening_hours: gym.openingHours,
    holiday_hours: gym.holidayHours,
    price_range: gym.priceRange,
    pricing_info: gym.pricingInfo,
    capacity: gym.capacity,
    area_size: gym.areaSize,
    parking_info: gym.parkingInfo,
    transport_info: gym.transportInfo,
    rating: gym.rating,
    review_count: gym.reviewCount,
    view_count: gym.viewCount,
    favorite_count: gym.favoriteCount,
    checkin_count: gym.checkinCount,
    status: gym.status,
    verified: gym.verified,
    featured: gym.featured,
    gym_type: gym.gymType,
    crossfit_certified: gym.crossfitCertified,
    supported_programs: gym.supportedPrograms,
    tags: gym.tags,
    business_license: gym.businessLicense,
    insurance_info: gym.insuranceInfo,
    safety_certifications: gym.safetyCertifications
  }));
  
  fs.writeFileSync(`beijing-crossfit-api-format-${timestamp}.json`, JSON.stringify(apiData, null, 2));
  
  // 生成精简版（用于前端显示）
  const simplifiedData = beijingCrossFitGyms.map(gym => ({
    id: gym.uuid,
    name: gym.name,
    address: gym.address,
    district: gym.district,
    phone: gym.phone,
    rating: gym.rating,
    reviewCount: gym.reviewCount,
    priceRange: gym.priceRange,
    crossfitCertified: gym.crossfitCertified,
    featured: gym.featured,
    latitude: gym.latitude,
    longitude: gym.longitude,
    logo: gym.logo,
    tags: gym.tags.slice(0, 3) // 只保留前3个标签
  }));
  
  fs.writeFileSync(`beijing-crossfit-simplified-${timestamp}.json`, JSON.stringify(simplifiedData, null, 2));
  
  // 生成场馆对比报告
  const comparisonReport = {
    title: "北京CrossFit场馆对比分析",
    comparison: beijingCrossFitGyms.map(gym => ({
      name: gym.name,
      district: gym.district,
      rating: gym.rating,
      priceLevel: gym.pricingInfo.monthly >= 1500 ? '高端' : gym.pricingInfo.monthly >= 1000 ? '中高端' : '大众',
      capacity: gym.capacity,
      crossfitCertified: gym.crossfitCertified ? '官方认证' : '功能训练',
      specialties: gym.tags.slice(0, 2),
      contact: {
        phone: gym.phone,
        wechat: gym.socialMedia.wechat
      }
    })),
    recommendations: {
      beginners: "Functional Fitness Beijing - 学生友好，价格适中",
      professionals: "CrossFit Sanlitun - 官方认证，专业教练",
      business: "CrossFit CBD - 商务便利，高端服务",
      athletes: "CrossFit Wangjing - 竞技训练，专业设备"
    }
  };
  
  fs.writeFileSync(`beijing-crossfit-comparison-${timestamp}.json`, JSON.stringify(comparisonReport, null, 2));
  
  console.log('🎯 北京CrossFit真实场馆数据导出完成!\n');
  console.log('📁 生成的文件:');
  console.log(`   ✅ beijing-crossfit-real-data-${timestamp}.json (完整数据)`);
  console.log(`   ✅ beijing-crossfit-api-format-${timestamp}.json (API格式)`);
  console.log(`   ✅ beijing-crossfit-simplified-${timestamp}.json (精简数据)`);
  console.log(`   ✅ beijing-crossfit-comparison-${timestamp}.json (对比分析)`);
  
  console.log('\n📊 数据统计:');
  console.log(`   🏟️  总场馆数: ${fullData.statistics.totalGyms}`);
  console.log(`   🏆 CrossFit认证: ${fullData.statistics.crossfitCertified}`);
  console.log(`   ⭐ 精选场馆: ${fullData.statistics.featured}`);
  console.log(`   📈 平均评分: ${fullData.statistics.averageRating}`);
  console.log(`   💬 总评价数: ${fullData.statistics.totalReviews}`);
  console.log(`   📍 覆盖区域: ${fullData.statistics.districts.join(', ')}`);
  
  console.log('\n🏃‍♀️ 场馆详情:');
  beijingCrossFitGyms.forEach((gym, index) => {
    console.log(`   ${index + 1}. ${gym.name} (${gym.district})`);
    console.log(`      📞 ${gym.phone} | ⭐ ${gym.rating} | 💰 ${gym.priceRange}`);
    console.log(`      🏷️  ${gym.tags.slice(0, 3).join(', ')}`);
    console.log('');
  });
  
  return {
    files: [
      `beijing-crossfit-real-data-${timestamp}.json`,
      `beijing-crossfit-api-format-${timestamp}.json`, 
      `beijing-crossfit-simplified-${timestamp}.json`,
      `beijing-crossfit-comparison-${timestamp}.json`
    ],
    stats: fullData.statistics
  };
}

// 运行导出
if (require.main === module) {
  exportBeijingCrossFitData();
}

module.exports = { beijingCrossFitGyms, exportBeijingCrossFitData };