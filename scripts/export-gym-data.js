const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 北京和上海CrossFit场馆测试数据
const gymData = [
  // 北京场馆
  {
    uuid: uuidv4(),
    name: "CrossFit Sanlitun",
    nameEn: "CrossFit Sanlitun",
    description: "北京三里屯核心地带的专业CrossFit训练场馆，拥有完整的CrossFit认证设备和专业教练团队。",
    shortDescription: "三里屯专业CrossFit训练中心",
    address: "北京市朝阳区三里屯路19号院",
    district: "朝阳区",
    city: "北京",
    province: "北京市",
    country: "China",
    postalCode: "100027",
    latitude: 39.9348,
    longitude: 116.4579,
    phone: "+86-10-8532-1234",
    email: "info@crossfitsanlitun.com",
    website: "https://crossfitsanlitun.com",
    socialMedia: {
      wechat: "CrossFitSLT",
      weibo: "@CrossFitSanlitun",
      instagram: "@crossfitsanlitun"
    },
    images: [
      "https://example.com/gym1-1.jpg",
      "https://example.com/gym1-2.jpg",
      "https://example.com/gym1-3.jpg"
    ],
    logo: "https://example.com/crossfit-sanlitun-logo.jpg",
    facilities: [
      "Olympic Lifting Platform",
      "Pull-up Rigs",
      "Kettlebells",
      "Battle Ropes",
      "Rowing Machines",
      "Assault Bikes"
    ],
    equipment: {
      barbells: 20,
      kettlebells: "8kg-32kg range",
      dumbbells: "5kg-50kg range",
      pullup_bars: 8,
      rowing_machines: 6,
      assault_bikes: 4
    },
    amenities: [
      "Changing Rooms",
      "Showers",
      "Lockers",
      "Parking",
      "WiFi",
      "Air Conditioning"
    ],
    openingHours: {
      monday: "06:00-22:00",
      tuesday: "06:00-22:00", 
      wednesday: "06:00-22:00",
      thursday: "06:00-22:00",
      friday: "06:00-22:00",
      saturday: "08:00-20:00",
      sunday: "08:00-18:00"
    },
    priceRange: "200-500 CNY",
    pricingInfo: {
      drop_in: 100,
      monthly: 800,
      quarterly: 2100,
      annual: 7200,
      currency: "CNY"
    },
    capacity: 50,
    areaSize: 300.00,
    parkingInfo: {
      available: true,
      spaces: 20,
      fee: "10 CNY/hour"
    },
    transportInfo: {
      subway: "团结湖站 (Line 10)",
      bus: "多条公交线路",
      parking: "场馆专用停车场"
    },
    rating: 4.7,
    reviewCount: 128,
    status: 1,
    verified: true,
    featured: true,
    gymType: "crossfit_certified",
    crossfitCertified: true,
    supportedPrograms: ["CrossFit", "Olympic Lifting", "Gymnastics"],
    tags: ["CrossFit", "Olympic Lifting", "Professional", "Central Location"]
  },
  {
    uuid: uuidv4(),
    name: "Beast Mode CrossFit",
    nameEn: "Beast Mode CrossFit",
    description: "位于北京望京的高端CrossFit训练基地，专注于竞技性训练和个人提升。",
    shortDescription: "望京高端CrossFit训练基地",
    address: "北京市朝阳区望京街10号楼B1",
    district: "朝阳区",
    city: "北京",
    province: "北京市",
    country: "China",
    postalCode: "100102",
    latitude: 40.0025,
    longitude: 116.4709,
    phone: "+86-10-6435-5678",
    email: "hello@beastmodecf.com",
    website: "https://beastmodecrossfit.cn",
    socialMedia: {
      wechat: "BeastModeCF",
      weibo: "@BeastModeBeijing"
    },
    images: [
      "https://example.com/gym2-1.jpg",
      "https://example.com/gym2-2.jpg"
    ],
    logo: "https://example.com/beast-mode-logo.jpg",
    facilities: [
      "Competition Platform",
      "Gymnastic Rings",
      "Rope Climbing",
      "Sled Track",
      "Recovery Zone"
    ],
    equipment: {
      barbells: 15,
      kettlebells: "12kg-40kg range", 
      specialty_bars: "Safety Squat Bar, Trap Bar",
      gymnastics_equipment: "Rings, Parallettes, Rope"
    },
    amenities: [
      "Premium Changing Rooms",
      "Sauna",
      "Protein Bar",
      "Equipment Shop",
      "Member Lounge"
    ],
    openingHours: {
      monday: "05:30-22:30",
      tuesday: "05:30-22:30",
      wednesday: "05:30-22:30", 
      thursday: "05:30-22:30",
      friday: "05:30-22:30",
      saturday: "07:00-21:00",
      sunday: "08:00-19:00"
    },
    priceRange: "300-800 CNY",
    pricingInfo: {
      drop_in: 150,
      monthly: 1200,
      quarterly: 3200,
      annual: 10800,
      personal_training: 300,
      currency: "CNY"
    },
    capacity: 40,
    areaSize: 450.00,
    parkingInfo: {
      available: true,
      spaces: 30,
      fee: "Free for members"
    },
    rating: 4.8,
    reviewCount: 89,
    status: 1,
    verified: true,
    featured: false,
    gymType: "crossfit_certified",
    crossfitCertified: true,
    supportedPrograms: ["CrossFit", "Olympic Lifting", "Powerlifting", "Gymnastics"],
    tags: ["CrossFit", "Competition", "High-End", "Personal Training"]
  },
  {
    uuid: uuidv4(),
    name: "Iron Temple CrossFit",
    nameEn: "Iron Temple CrossFit",
    description: "朝阳公园附近的专业CrossFit工作室，提供小班精品训练课程。",
    shortDescription: "朝阳公园专业CrossFit工作室",
    address: "北京市朝阳区朝阳公园南路8号",
    district: "朝阳区", 
    city: "北京",
    province: "北京市",
    country: "China",
    postalCode: "100125",
    latitude: 39.9236,
    longitude: 116.4582,
    phone: "+86-10-5987-4321",
    email: "info@irontemplecf.com",
    website: "https://irontemple.cn",
    socialMedia: {
      wechat: "IronTempleCF"
    },
    images: [
      "https://example.com/gym3-1.jpg"
    ],
    logo: "https://example.com/iron-temple-logo.jpg",
    facilities: [
      "Lifting Platforms",
      "Functional Movement Zone",
      "Cardio Area",
      "Stretching Space"
    ],
    openingHours: {
      monday: "06:00-21:00",
      tuesday: "06:00-21:00",
      wednesday: "06:00-21:00",
      thursday: "06:00-21:00", 
      friday: "06:00-21:00",
      saturday: "08:00-18:00",
      sunday: "09:00-17:00"
    },
    priceRange: "180-400 CNY",
    pricingInfo: {
      drop_in: 80,
      monthly: 650,
      quarterly: 1800,
      annual: 6000,
      currency: "CNY"
    },
    capacity: 25,
    areaSize: 200.00,
    rating: 4.5,
    reviewCount: 56,
    status: 1,
    verified: true,
    gymType: "specialty",
    crossfitCertified: false,
    supportedPrograms: ["Functional Fitness", "Weight Training", "HIIT"],
    tags: ["Functional Fitness", "Small Classes", "Beginner Friendly"]
  },

  // 上海场馆
  {
    uuid: uuidv4(),
    name: "CrossFit Lujiazui",
    nameEn: "CrossFit Lujiazui",
    description: "上海陆家嘴金融中心的标志性CrossFit场馆，为金融精英提供专业健身服务。",
    shortDescription: "陆家嘴金融中心CrossFit场馆",
    address: "上海市浦东新区陆家嘴环路1000号",
    district: "浦东新区",
    city: "上海",
    province: "上海市", 
    country: "China",
    postalCode: "200120",
    latitude: 31.2397,
    longitude: 121.4990,
    phone: "+86-21-6841-2345",
    email: "info@crossfitlujiazui.com",
    website: "https://crossfitlujiazui.com",
    socialMedia: {
      wechat: "CrossFitLJZ",
      weibo: "@CrossFitLujiazui",
      instagram: "@crossfitlujiazui"
    },
    images: [
      "https://example.com/gym4-1.jpg",
      "https://example.com/gym4-2.jpg",
      "https://example.com/gym4-3.jpg",
      "https://example.com/gym4-4.jpg"
    ],
    logo: "https://example.com/crossfit-lujiazui-logo.jpg",
    facilities: [
      "Premium Olympic Platforms", 
      "Concept2 Rowers",
      "Assault Bikes",
      "TRX Suspension",
      "Battle Ropes",
      "Gymnastics Area"
    ],
    equipment: {
      barbells: 25,
      kettlebells: "8kg-48kg range",
      dumbbells: "2.5kg-50kg range", 
      concept2_rowers: 8,
      assault_bikes: 6,
      specialty_equipment: "Sleds, Tires, Sandbags"
    },
    amenities: [
      "Executive Locker Rooms",
      "Steam Room", 
      "Juice Bar",
      "Towel Service",
      "Premium WiFi",
      "Valet Parking"
    ],
    openingHours: {
      monday: "05:00-23:00",
      tuesday: "05:00-23:00",
      wednesday: "05:00-23:00",
      thursday: "05:00-23:00",
      friday: "05:00-23:00", 
      saturday: "07:00-22:00",
      sunday: "08:00-20:00"
    },
    priceRange: "400-1200 CNY",
    pricingInfo: {
      drop_in: 200,
      monthly: 1500,
      quarterly: 4200,
      annual: 15000,
      executive_package: 2500,
      currency: "CNY"
    },
    capacity: 80,
    areaSize: 600.00,
    parkingInfo: {
      available: true,
      spaces: 50,
      fee: "Valet service included"
    },
    transportInfo: {
      subway: "陆家嘴站 (Line 2)",
      bus: "多条公交线路直达",
      parking: "商务楼专用停车场"
    },
    rating: 4.9,
    reviewCount: 245,
    status: 1,
    verified: true,
    featured: true,
    gymType: "crossfit_certified",
    crossfitCertified: true,
    supportedPrograms: ["CrossFit", "Olympic Lifting", "Executive Training", "Corporate Wellness"],
    tags: ["CrossFit", "Executive", "Premium", "Financial District", "Corporate"]
  },
  {
    uuid: uuidv4(),
    name: "Forge CrossFit Shanghai",
    nameEn: "Forge CrossFit Shanghai", 
    description: "徐汇区专业CrossFit训练中心，提供全面的功能性训练课程。",
    shortDescription: "徐汇专业CrossFit训练中心",
    address: "上海市徐汇区淮海中路1337号",
    district: "徐汇区",
    city: "上海",
    province: "上海市",
    country: "China",
    postalCode: "200031",
    latitude: 31.2165,
    longitude: 121.4365,
    phone: "+86-21-5467-8901",
    email: "hello@forgecrossfit.sh",
    website: "https://forgecrossfit.cn",
    socialMedia: {
      wechat: "ForgeCrossfit",
      weibo: "@ForgeCrossFitSH"
    },
    images: [
      "https://example.com/gym5-1.jpg",
      "https://example.com/gym5-2.jpg"
    ],
    logo: "https://example.com/forge-crossfit-logo.jpg",
    facilities: [
      "CrossFit Games Equipment",
      "Olympic Weightlifting Area", 
      "Mobility Station",
      "Outdoor Training Space",
      "Recovery Room"
    ],
    equipment: {
      barbells: 18,
      kettlebells: "8kg-36kg range",
      plates: "Bumper plates full set",
      gymnastics: "Rings, Parallettes, Rope Climbs"
    },
    amenities: [
      "Modern Changing Rooms",
      "Showers",
      "Equipment Rental",
      "Supplement Store",
      "Member Events"
    ],
    openingHours: {
      monday: "06:00-22:00",
      tuesday: "06:00-22:00",
      wednesday: "06:00-22:00",
      thursday: "06:00-22:00",
      friday: "06:00-22:00",
      saturday: "08:00-20:00", 
      sunday: "09:00-18:00"
    },
    priceRange: "250-600 CNY",
    pricingInfo: {
      drop_in: 120,
      monthly: 980,
      quarterly: 2700,
      annual: 9600,
      unlimited: 1200,
      currency: "CNY"
    },
    capacity: 45,
    areaSize: 350.00,
    parkingInfo: {
      available: true,
      spaces: 15,
      fee: "15 CNY/hour"
    },
    rating: 4.6,
    reviewCount: 134,
    status: 1,
    verified: true,
    featured: false,
    gymType: "crossfit_certified",
    crossfitCertified: true,
    supportedPrograms: ["CrossFit", "Olympic Lifting", "Functional Movement", "Competition Prep"],
    tags: ["CrossFit", "Competition", "Functional Movement", "Community"]
  },
  {
    uuid: uuidv4(),
    name: "Warrior Fitness Studio",
    nameEn: "Warrior Fitness Studio",
    description: "静安区精品健身工作室，专注于CrossFit和功能性训练。",
    shortDescription: "静安精品CrossFit工作室",
    address: "上海市静安区南京西路1601号",
    district: "静安区",
    city: "上海", 
    province: "上海市",
    country: "China",
    postalCode: "200040",
    latitude: 31.2304,
    longitude: 121.4478,
    phone: "+86-21-3214-5679",
    email: "info@warriorfit.sh",
    website: "https://warriorfitness.studio",
    socialMedia: {
      wechat: "WarriorFit"
    },
    images: [
      "https://example.com/gym6-1.jpg"
    ],
    logo: "https://example.com/warrior-fitness-logo.jpg",
    facilities: [
      "Functional Training Zone",
      "Cardio Equipment",
      "Free Weights Area",
      "Group Class Studio"
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
    priceRange: "200-450 CNY",
    pricingInfo: {
      drop_in: 90,
      monthly: 720,
      quarterly: 2000,
      annual: 7200,
      currency: "CNY"
    },
    capacity: 30,
    areaSize: 180.00,
    rating: 4.4,
    reviewCount: 78,
    status: 1,
    verified: true,
    gymType: "specialty",
    crossfitCertified: false,
    supportedPrograms: ["Functional Training", "HIIT", "Weight Training", "Bootcamp"],
    tags: ["Functional Training", "Small Groups", "Boutique", "Personalized"]
  },
  {
    uuid: uuidv4(),
    name: "Elite Performance CrossFit",
    nameEn: "Elite Performance CrossFit",
    description: "浦东新区高性能训练中心，为运动员和健身爱好者提供专业指导。",
    shortDescription: "浦东高性能CrossFit训练中心",
    address: "上海市浦东新区张江高科技园区达尔文路88号",
    district: "浦东新区",
    city: "上海",
    province: "上海市",
    country: "China",
    postalCode: "201203",
    latitude: 31.2077,
    longitude: 121.6056,
    phone: "+86-21-2896-1234",
    email: "elite@performancecf.com",
    website: "https://eliteperformancecf.com",
    socialMedia: {
      wechat: "ElitePerformCF",
      weibo: "@ElitePerformanceSH"
    },
    images: [
      "https://example.com/gym7-1.jpg",
      "https://example.com/gym7-2.jpg",
      "https://example.com/gym7-3.jpg"
    ],
    logo: "https://example.com/elite-performance-logo.jpg",
    facilities: [
      "Competition Standard Equipment",
      "Performance Testing Lab",
      "Recovery Center",
      "Sports Medicine Clinic",
      "Nutrition Center"
    ],
    equipment: {
      barbells: 30,
      specialty_bars: "Full range including SSB, Trap Bar, Swiss Bar",
      kettlebells: "6kg-48kg full range",
      machines: "Assault bikes, Concept2 rowers, SkiErg",
      technology: "Force plates, velocity trackers"
    },
    amenities: [
      "Athlete Locker Rooms",
      "Ice Baths",
      "Compression Therapy",
      "Massage Therapy",
      "Performance Analysis",
      "Meal Prep Service"
    ],
    openingHours: {
      monday: "05:00-23:00",
      tuesday: "05:00-23:00",
      wednesday: "05:00-23:00",
      thursday: "05:00-23:00",
      friday: "05:00-23:00",
      saturday: "06:00-22:00",
      sunday: "07:00-21:00"
    },
    priceRange: "500-1500 CNY", 
    pricingInfo: {
      drop_in: 250,
      monthly: 1800,
      quarterly: 5000,
      annual: 18000,
      athlete_program: 2500,
      elite_coaching: 3500,
      currency: "CNY"
    },
    capacity: 60,
    areaSize: 800.00,
    parkingInfo: {
      available: true,
      spaces: 40,
      fee: "Free for members"
    },
    transportInfo: {
      subway: "张江高科站 (Line 2)",
      bus: "园区班车服务",
      parking: "免费会员停车"
    },
    rating: 4.8,
    reviewCount: 167,
    status: 1,
    verified: true,
    featured: true,
    gymType: "crossfit_certified",
    crossfitCertified: true,
    supportedPrograms: ["CrossFit", "Olympic Lifting", "Powerlifting", "Athletic Performance", "Recovery"],
    tags: ["CrossFit", "Elite Performance", "Athletic Training", "Recovery", "Technology"]
  }
];

// 生成不同格式的数据导出
function exportData() {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  
  // 导出 JSON 格式
  const jsonData = {
    metadata: {
      exportTime: new Date().toISOString(),
      totalGyms: gymData.length,
      cities: [...new Set(gymData.map(gym => gym.city))],
      crossfitCertified: gymData.filter(g => g.crossfitCertified).length
    },
    gyms: gymData
  };
  
  fs.writeFileSync(`gym-data-export-${timestamp}.json`, JSON.stringify(jsonData, null, 2));
  
  // 导出精简版 JSON (只包含基本信息)
  const simplifiedData = gymData.map(gym => ({
    name: gym.name,
    city: gym.city,
    district: gym.district,
    address: gym.address,
    latitude: gym.latitude,
    longitude: gym.longitude,
    phone: gym.phone,
    rating: gym.rating,
    crossfitCertified: gym.crossfitCertified,
    priceRange: gym.priceRange
  }));
  
  fs.writeFileSync(`gym-data-simplified-${timestamp}.json`, JSON.stringify(simplifiedData, null, 2));
  
  // 生成数据统计报告
  const stats = {
    summary: {
      totalGyms: gymData.length,
      beijingGyms: gymData.filter(g => g.city === '北京').length,
      shanghaiGyms: gymData.filter(g => g.city === '上海').length,
      crossfitCertified: gymData.filter(g => g.crossfitCertified).length,
      featured: gymData.filter(g => g.featured).length,
      averageRating: (gymData.reduce((sum, g) => sum + g.rating, 0) / gymData.length).toFixed(2)
    },
    byCity: {
      北京: gymData.filter(g => g.city === '北京').map(g => ({ name: g.name, rating: g.rating, certified: g.crossfitCertified })),
      上海: gymData.filter(g => g.city === '上海').map(g => ({ name: g.name, rating: g.rating, certified: g.crossfitCertified }))
    },
    ratingDistribution: {
      '4.0-4.4': gymData.filter(g => g.rating >= 4.0 && g.rating < 4.5).length,
      '4.5-4.7': gymData.filter(g => g.rating >= 4.5 && g.rating < 4.8).length,
      '4.8-5.0': gymData.filter(g => g.rating >= 4.8).length
    }
  };
  
  fs.writeFileSync(`gym-data-stats-${timestamp}.json`, JSON.stringify(stats, null, 2));
  
  console.log(`✅ 数据导出完成!`);
  console.log(`📁 生成文件:`);
  console.log(`   - gym-data-export-${timestamp}.json (完整数据)`);
  console.log(`   - gym-data-simplified-${timestamp}.json (精简数据)`);
  console.log(`   - gym-data-stats-${timestamp}.json (统计报告)`);
  console.log(`\n📊 数据统计:`);
  console.log(`   总场馆数: ${stats.summary.totalGyms}`);
  console.log(`   北京场馆: ${stats.summary.beijingGyms}`);
  console.log(`   上海场馆: ${stats.summary.shanghaiGyms}`);
  console.log(`   CrossFit认证: ${stats.summary.crossfitCertified}`);
  console.log(`   平均评分: ${stats.summary.averageRating}`);
}

// 如果直接运行此脚本，执行数据导出
if (require.main === module) {
  exportData();
}

module.exports = { gymData, exportData };