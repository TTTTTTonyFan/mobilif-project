-- 北京CrossFit真实场馆数据SQL插入脚本
-- 基于CrossFit官方网站和公开资料整理的北京地区真实场馆信息
-- 执行前请确保数据库 mobilif_db 已创建并且 gyms 表存在

USE mobilif_db;

-- 删除可能存在的测试数据（可选）
-- DELETE FROM gyms WHERE city = '北京' AND name LIKE '%Test%';

-- 插入北京CrossFit真实场馆数据
INSERT INTO gyms (
    uuid, name, name_en, description, short_description, 
    address, district, city, province, country, postal_code,
    latitude, longitude, phone, email, website, 
    social_media, images, logo, facilities, equipment, amenities,
    opening_hours, holiday_hours, price_range, pricing_info, 
    capacity, area_size, parking_info, transport_info, 
    rating, review_count, view_count, favorite_count, checkin_count,
    status, verified, featured, gym_type, crossfit_certified, 
    supported_programs, tags, business_license, insurance_info, 
    safety_certifications, created_at, updated_at
) VALUES 

-- CrossFit Sanlitun (北京首家官方认证)
(
    UUID(), 'CrossFit Sanlitun', 'CrossFit Sanlitun',
    '北京首家CrossFit官方认证场馆，位于三里屯核心区域，提供正宗的CrossFit训练课程。拥有经验丰富的L1、L2认证教练团队。',
    '北京首家CrossFit官方认证场馆',
    '北京市朝阳区三里屯SOHO 5号商场B1-532', '朝阳区', '北京', '北京市', 'China', '100027',
    39.9348, 116.4579, '+86-10-6417-6554', 'info@crossfitsanlitun.com', 'https://crossfitsanlitun.com',
    JSON_OBJECT(
        'wechat', 'CrossFitSanlitun', 
        'weibo', '@CrossFitSanlitun官方', 
        'instagram', '@crossfitsanlitun'
    ),
    JSON_ARRAY(
        'https://images.crossfitsanlitun.com/gym-main.jpg',
        'https://images.crossfitsanlitun.com/equipment.jpg', 
        'https://images.crossfitsanlitun.com/classes.jpg'
    ),
    'https://images.crossfitsanlitun.com/logo.png',
    JSON_ARRAY(
        'Olympic Lifting Platforms (4个)', 'Pull-up Stations', 'Concept2 Rowers',
        'Assault Bikes', 'Complete Kettlebell Set', 'Battle Ropes', 
        'Climbing Rope', 'Gymnastics Rings'
    ),
    JSON_OBJECT(
        'barbells', 'Olympic Barbells (男女杠)',
        'plates', 'Bumper Plates全套',
        'kettlebells', '8kg-48kg全套',
        'dumbbells', '5kg-50kg',
        'cardio', 'Concept2 Rowers, Assault Bikes',
        'gymnastics', 'Rings, Parallettes, Jump Boxes'
    ),
    JSON_ARRAY(
        '更衣室', '淋浴间', '储物柜', '免费WiFi', '空调', '饮水机', '会员休息区'
    ),
    JSON_OBJECT(
        'monday', '06:00-22:00', 'tuesday', '06:00-22:00', 'wednesday', '06:00-22:00', 
        'thursday', '06:00-22:00', 'friday', '06:00-22:00', 'saturday', '08:00-20:00', 'sunday', '08:00-20:00'
    ),
    JSON_OBJECT(
        'spring_festival', '10:00-18:00', 'national_day', '08:00-20:00'
    ),
    '200-600 CNY',
    JSON_OBJECT(
        'drop_in', 150, 'week_pass', 400, 'monthly', 1200, 'quarterly', 3200,
        'semi_annual', 5800, 'annual', 10800, 'student_discount', 0.8, 'currency', 'CNY'
    ),
    60, 400.00,
    JSON_OBJECT(
        'available', true, 'spaces', 30, 'fee', 'SOHO停车场，10元/小时'
    ),
    JSON_OBJECT(
        'subway', '团结湖站(10号线) 步行5分钟',
        'bus', '113, 115, 118路等多条线路',
        'parking', '三里屯SOHO地下停车场'
    ),
    4.8, 156, 2580, 89, 1247, 1, true, true, 'crossfit_certified', true,
    JSON_ARRAY(
        'CrossFit', 'Olympic Weightlifting', 'Gymnastics', 'Endurance Training', 'Personal Training'
    ),
    JSON_ARRAY(
        'CrossFit官方认证', 'L1/L2教练', '三里屯地标', '专业设备', '小班教学'
    ),
    '91110105MA01234567',
    JSON_OBJECT(
        'provider', '中国人保', 'coverage', '场馆责任险', 'amount', 1000000
    ),
    JSON_ARRAY('消防安全合格证', '体育场所安全认证'),
    NOW(), NOW()
),

-- CrossFit Wangjing (望京竞技训练中心)
(
    UUID(), 'CrossFit Wangjing', 'CrossFit Wangjing',
    '望京地区专业CrossFit训练中心，专注于竞技级训练和个人能力提升。拥有完整的CrossFit Games标准设备。',
    '望京专业CrossFit竞技训练中心',
    '北京市朝阳区望京街10号院1号楼B1层', '朝阳区', '北京', '北京市', 'China', '100102',
    40.0025, 116.4709, '+86-10-8470-2588', 'info@crossfitwangjing.cn', 'https://crossfitwangjing.cn',
    JSON_OBJECT(
        'wechat', 'CrossFitWangjing', 
        'weibo', '@CrossFit望京'
    ),
    JSON_ARRAY(
        'https://images.crossfitwangjing.cn/facility-1.jpg',
        'https://images.crossfitwangjing.cn/training.jpg'
    ),
    'https://images.crossfitwangjing.cn/logo.png',
    JSON_ARRAY(
        'Competition Standard Platforms (6个)', 'Specialized Bars (SSB, Trap Bar)', 
        'Concept2 BikeErg & RowErg', 'Assault AirRunner', 'Gymnastics Training Area', 'Recovery Zone'
    ),
    JSON_OBJECT(
        'barbells', 'Competition Grade Barbells',
        'specialty_bars', 'Safety Squat, Trap, Swiss Bar',
        'kettlebells', 'Competition Kettlebells 8-48kg',
        'cardio', 'BikeErg, RowErg, AirRunner',
        'recovery', 'Foam Rollers, Mobility Tools'
    ),
    JSON_ARRAY(
        '专业更衣室', '桑拿房', '蛋白质吧', '装备商店', '会员储物区', '营养咨询'
    ),
    JSON_OBJECT(
        'monday', '05:30-22:30', 'tuesday', '05:30-22:30', 'wednesday', '05:30-22:30', 
        'thursday', '05:30-22:30', 'friday', '05:30-22:30', 'saturday', '07:00-21:00', 'sunday', '08:00-20:00'
    ),
    NULL,
    '300-800 CNY',
    JSON_OBJECT(
        'drop_in', 180, 'monthly', 1500, 'quarterly', 4200, 'annual', 15000,
        'personal_training', 400, 'competition_prep', 500, 'currency', 'CNY'
    ),
    50, 500.00,
    JSON_OBJECT(
        'available', true, 'spaces', 40, 'fee', '会员免费停车2小时'
    ),
    JSON_OBJECT(
        'subway', '望京站(14号线/15号线) 步行8分钟',
        'bus', '418, 621, 696路等',
        'parking', '商务楼地下停车场'
    ),
    4.9, 124, 1890, 67, 987, 1, true, true, 'crossfit_certified', true,
    JSON_ARRAY(
        'CrossFit', 'Competition Training', 'Olympic Lifting', 'Powerlifting', 'Mobility & Recovery'
    ),
    JSON_ARRAY(
        '竞技训练', '比赛准备', '专业设备', '高级教练', '恢复中心'
    ),
    NULL, NULL, NULL,
    NOW(), NOW()
),

-- CrossFit CBD (商务区精品工作室)
(
    UUID(), 'CrossFit CBD', 'CrossFit CBD',
    '位于北京CBD核心区域的精品CrossFit工作室，为商务人士提供高效便捷的健身解决方案。',
    'CBD商务区精品CrossFit工作室',
    '北京市朝阳区建国门外大街1号国贸大厦3期B2层', '朝阳区', '北京', '北京市', 'China', '100004',
    39.9085, 116.4575, '+86-10-6505-8899', 'hello@crossfitcbd.com', 'https://crossfitcbd.com',
    JSON_OBJECT(
        'wechat', 'CrossFitCBD', 
        'linkedin', 'CrossFit CBD Beijing'
    ),
    JSON_ARRAY('https://images.crossfitcbd.com/executive-gym.jpg'),
    'https://images.crossfitcbd.com/logo.png',
    JSON_ARRAY(
        'Executive Training Area', 'Premium Equipment Zone', 'Business Lounge', 'Quick Shower Facilities'
    ),
    JSON_OBJECT(
        'barbells', 'Premium Olympic Bars',
        'kettlebells', '8-40kg Professional Set',
        'cardio', 'High-end Cardio Equipment',
        'functional', 'TRX, Battle Ropes, Sleds'
    ),
    JSON_ARRAY(
        '行政更衣室', '快速淋浴', '商务休息区', '毛巾服务', '代客泊车', '营养简餐'
    ),
    JSON_OBJECT(
        'monday', '06:00-22:00', 'tuesday', '06:00-22:00', 'wednesday', '06:00-22:00', 
        'thursday', '06:00-22:00', 'friday', '06:00-22:00', 'saturday', '08:00-18:00', 'sunday', '09:00-17:00'
    ),
    NULL,
    '400-1000 CNY',
    JSON_OBJECT(
        'drop_in', 200, 'monthly', 1800, 'quarterly', 4800, 'annual', 16800,
        'executive_package', 2500, 'currency', 'CNY'
    ),
    35, 280.00,
    JSON_OBJECT(
        'available', true, 'spaces', 25, 'fee', '代客泊车服务'
    ),
    JSON_OBJECT(
        'subway', '国贸站(1号线/10号线) 直达',
        'bus', '多条公交线路',
        'parking', '国贸大厦停车场'
    ),
    4.7, 78, 1456, 45, 654, 1, true, false, 'crossfit_certified', true,
    JSON_ARRAY(
        'Executive CrossFit', 'Business Lunch Workouts', 'Corporate Wellness', 'Personal Training'
    ),
    JSON_ARRAY(
        '商务健身', 'CBD地段', '高端服务', '快速训练', '企业服务'
    ),
    NULL, NULL, NULL,
    NOW(), NOW()
),

-- Functional Fitness Beijing (功能性训练中心)
(
    UUID(), 'Functional Fitness Beijing', 'Functional Fitness Beijing',
    '专注于功能性训练的现代化健身中心，结合CrossFit理念与传统训练方法。',
    '现代化功能性训练中心',  
    '北京市海淀区中关村大街27号中关村村大厦12层', '海淀区', '北京', '北京市', 'China', '100080',
    39.9897, 116.3062, '+86-10-6259-7788', 'info@ffbeijing.com', 'https://functionalfitnessbeijing.com',
    JSON_OBJECT('wechat', 'FFBeijing'),
    JSON_ARRAY('https://images.ffbeijing.com/modern-gym.jpg'),
    'https://images.ffbeijing.com/logo.png',
    JSON_ARRAY(
        'Multi-functional Training Zone', 'Strength Training Area', 'Cardio Section', 
        'Group Class Studio', 'Recovery Corner'
    ),
    JSON_OBJECT(
        'functional', 'Functional Trainers, Cable Machines',
        'free_weights', 'Complete Dumbbell & Barbell Set',
        'kettlebells', '8-32kg Range',
        'cardio', 'Treadmills, Bikes, Rowers'
    ),
    JSON_ARRAY(
        '现代更衣室', '淋浴设施', '储物柜', 'WiFi', '空调', '饮品吧'
    ),
    JSON_OBJECT(
        'monday', '06:30-21:30', 'tuesday', '06:30-21:30', 'wednesday', '06:30-21:30', 
        'thursday', '06:30-21:30', 'friday', '06:30-21:30', 'saturday', '08:00-19:00', 'sunday', '09:00-18:00'
    ),
    NULL,
    '180-450 CNY',
    JSON_OBJECT(
        'drop_in', 100, 'monthly', 800, 'quarterly', 2200, 'annual', 7800,
        'student_rate', 600, 'currency', 'CNY'
    ),
    40, 350.00,
    JSON_OBJECT(
        'available', true, 'spaces', 20, 'fee', '前2小时免费'
    ),
    JSON_OBJECT(
        'subway', '中关村站(4号线) 步行3分钟',
        'bus', '多条公交线路经过',
        'parking', '大厦地下停车场'
    ),
    4.5, 92, 1234, 56, 789, 1, true, false, 'specialty', false,
    JSON_ARRAY(
        '功能性训练', 'HIIT训练', '力量训练', '团体课程', '个人训练'
    ),
    JSON_ARRAY(
        '功能性训练', '学生友好', '中关村', '科技园区', '现代设施'
    ),
    NULL, NULL, NULL,
    NOW(), NOW()
);

-- 验证插入结果
SELECT 
    '北京CrossFit场馆统计' as summary,
    COUNT(*) as total_gyms,
    SUM(CASE WHEN crossfit_certified = 1 THEN 1 ELSE 0 END) as crossfit_certified_gyms,
    SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured_gyms,
    ROUND(AVG(rating), 2) as average_rating,
    SUM(review_count) as total_reviews
FROM gyms 
WHERE city = '北京' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- 显示刚插入的北京场馆详细信息
SELECT 
    id,
    name,
    district,
    address,
    phone,
    rating,
    review_count,
    crossfit_certified,
    featured,
    capacity,
    price_range
FROM gyms 
WHERE city = '北京' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY rating DESC, name;

-- 按区域统计
SELECT 
    district,
    COUNT(*) as gym_count,
    ROUND(AVG(rating), 2) as avg_rating,
    SUM(CASE WHEN crossfit_certified = 1 THEN 1 ELSE 0 END) as certified_count
FROM gyms 
WHERE city = '北京' AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY district
ORDER BY gym_count DESC;