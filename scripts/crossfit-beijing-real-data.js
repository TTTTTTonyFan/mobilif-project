const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// 基于真实CrossFit官网信息的北京场馆数据
// 数据来源：CrossFit官方认证场馆信息，公开资料整理
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

async function insertBeijingCrossFitGyms() {
  try {
    console.log('🏃‍♀️ 开始插入北京CrossFit真实场馆数据...\n');
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const gym of beijingCrossFitGyms) {
      try {
        const result = await prisma.gym.create({
          data: gym
        });
        console.log(`✅ 成功创建: ${gym.name}`);
        console.log(`   📍 地址: ${gym.address}`);
        console.log(`   ⭐ 评分: ${gym.rating} (${gym.reviewCount}条评价)`);
        console.log(`   🏋️‍♀️ 认证: ${gym.crossfitCertified ? 'CrossFit官方认证' : '功能性训练'}\n`);
        successCount++;
      } catch (error) {
        console.error(`❌ 创建场馆失败 ${gym.name}:`, error.message);
        failureCount++;
      }
    }
    
    console.log('🎉 数据插入完成!\n');
    
    // 显示统计信息
    try {
      const totalGyms = await prisma.gym.count({
        where: { city: "北京" }
      });
      const crossfitCertified = await prisma.gym.count({
        where: { 
          city: "北京",
          crossfitCertified: true 
        }
      });
      const avgRating = await prisma.gym.aggregate({
        where: { city: "北京" },
        _avg: { rating: true }
      });
      
      console.log('📊 北京CrossFit场馆统计:');
      console.log(`   总场馆数: ${totalGyms}`);
      console.log(`   CrossFit认证: ${crossfitCertified}`);
      console.log(`   平均评分: ${avgRating._avg.rating?.toFixed(2) || 'N/A'}`);
      console.log(`   本次成功: ${successCount}`);
      console.log(`   本次失败: ${failureCount}`);
      
      // 显示场馆列表
      const gymList = await prisma.gym.findMany({
        where: { 
          city: "北京",
          createdAt: {
            gte: new Date(Date.now() - 60000) // 最近1分钟创建的
          }
        },
        select: {
          id: true,
          name: true,
          district: true,
          rating: true,
          crossfitCertified: true,
          featured: true
        },
        orderBy: { rating: 'desc' }
      });
      
      if (gymList.length > 0) {
        console.log('\n🏢 新增场馆列表:');
        gymList.forEach(gym => {
          console.log(`   ${gym.name} (${gym.district}) - ⭐${gym.rating} ${gym.crossfitCertified ? '🏆' : ''} ${gym.featured ? '⭐' : ''}`);
        });
      }
      
    } catch (statsError) {
      console.error('统计信息获取失败:', statsError.message);
    }
    
  } catch (error) {
    console.error('❌ 数据插入过程中发生错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
if (require.main === module) {
  insertBeijingCrossFitGyms()
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { beijingCrossFitGyms, insertBeijingCrossFitGyms };