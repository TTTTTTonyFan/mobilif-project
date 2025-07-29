-- MobiLiF 场馆测试数据 SQL 插入脚本
-- 包含北京和上海地区的CrossFit场馆数据
-- 执行前请确保数据库 mobilif_db 已创建并且 gyms 表存在

USE mobilif_db;

-- 插入北京场馆数据
INSERT INTO gyms (
    uuid, name, name_en, description, short_description, 
    address, district, city, province, country, postal_code,
    latitude, longitude, phone, email, website, 
    social_media, images, logo, facilities, equipment, amenities,
    opening_hours, price_range, pricing_info, capacity, area_size,
    parking_info, transport_info, rating, review_count,
    status, verified, featured, gym_type, crossfit_certified, 
    supported_programs, tags, created_at, updated_at
) VALUES 
-- CrossFit Sanlitun
(
    UUID(), 'CrossFit Sanlitun', 'CrossFit Sanlitun',
    '北京三里屯核心地带的专业CrossFit训练场馆，拥有完整的CrossFit认证设备和专业教练团队。',
    '三里屯专业CrossFit训练中心',
    '北京市朝阳区三里屯路19号院', '朝阳区', '北京', '北京市', 'China', '100027',
    39.9348, 116.4579, '+86-10-8532-1234', 'info@crossfitsanlitun.com', 'https://crossfitsanlitun.com',
    JSON_OBJECT('wechat', 'CrossFitSLT', 'weibo', '@CrossFitSanlitun', 'instagram', '@crossfitsanlitun'),
    JSON_ARRAY('https://example.com/gym1-1.jpg', 'https://example.com/gym1-2.jpg', 'https://example.com/gym1-3.jpg'),
    'https://example.com/crossfit-sanlitun-logo.jpg',
    JSON_ARRAY('Olympic Lifting Platform', 'Pull-up Rigs', 'Kettlebells', 'Battle Ropes', 'Rowing Machines', 'Assault Bikes'),
    JSON_OBJECT('barbells', 20, 'kettlebells', '8kg-32kg range', 'dumbbells', '5kg-50kg range', 'pullup_bars', 8, 'rowing_machines', 6, 'assault_bikes', 4),
    JSON_ARRAY('Changing Rooms', 'Showers', 'Lockers', 'Parking', 'WiFi', 'Air Conditioning'),
    JSON_OBJECT('monday', '06:00-22:00', 'tuesday', '06:00-22:00', 'wednesday', '06:00-22:00', 'thursday', '06:00-22:00', 'friday', '06:00-22:00', 'saturday', '08:00-20:00', 'sunday', '08:00-18:00'),
    '200-500 CNY',
    JSON_OBJECT('drop_in', 100, 'monthly', 800, 'quarterly', 2100, 'annual', 7200, 'currency', 'CNY'),
    50, 300.00,
    JSON_OBJECT('available', true, 'spaces', 20, 'fee', '10 CNY/hour'),
    JSON_OBJECT('subway', '团结湖站 (Line 10)', 'bus', '多条公交线路', 'parking', '场馆专用停车场'),
    4.7, 128, 1, true, true, 'crossfit_certified', true,
    JSON_ARRAY('CrossFit', 'Olympic Lifting', 'Gymnastics'),
    JSON_ARRAY('CrossFit', 'Olympic Lifting', 'Professional', 'Central Location'),
    NOW(), NOW()
),

-- Beast Mode CrossFit
(
    UUID(), 'Beast Mode CrossFit', 'Beast Mode CrossFit',
    '位于北京望京的高端CrossFit训练基地，专注于竞技性训练和个人提升。',
    '望京高端CrossFit训练基地',
    '北京市朝阳区望京街10号楼B1', '朝阳区', '北京', '北京市', 'China', '100102',
    40.0025, 116.4709, '+86-10-6435-5678', 'hello@beastmodecf.com', 'https://beastmodecrossfit.cn',
    JSON_OBJECT('wechat', 'BeastModeCF', 'weibo', '@BeastModeBeijing'),
    JSON_ARRAY('https://example.com/gym2-1.jpg', 'https://example.com/gym2-2.jpg'),
    'https://example.com/beast-mode-logo.jpg',
    JSON_ARRAY('Competition Platform', 'Gymnastic Rings', 'Rope Climbing', 'Sled Track', 'Recovery Zone'),
    JSON_OBJECT('barbells', 15, 'kettlebells', '12kg-40kg range', 'specialty_bars', 'Safety Squat Bar, Trap Bar', 'gymnastics_equipment', 'Rings, Parallettes, Rope'),
    JSON_ARRAY('Premium Changing Rooms', 'Sauna', 'Protein Bar', 'Equipment Shop', 'Member Lounge'),
    JSON_OBJECT('monday', '05:30-22:30', 'tuesday', '05:30-22:30', 'wednesday', '05:30-22:30', 'thursday', '05:30-22:30', 'friday', '05:30-22:30', 'saturday', '07:00-21:00', 'sunday', '08:00-19:00'),
    '300-800 CNY',
    JSON_OBJECT('drop_in', 150, 'monthly', 1200, 'quarterly', 3200, 'annual', 10800, 'personal_training', 300, 'currency', 'CNY'),
    40, 450.00,
    JSON_OBJECT('available', true, 'spaces', 30, 'fee', 'Free for members'),
    JSON_OBJECT('subway', '望京站', 'bus', '多条公交线路', 'parking', '商务楼停车场'),
    4.8, 89, 1, true, false, 'crossfit_certified', true,
    JSON_ARRAY('CrossFit', 'Olympic Lifting', 'Powerlifting', 'Gymnastics'),
    JSON_ARRAY('CrossFit', 'Competition', 'High-End', 'Personal Training'),
    NOW(), NOW()
),

-- Iron Temple CrossFit
(
    UUID(), 'Iron Temple CrossFit', 'Iron Temple CrossFit',
    '朝阳公园附近的专业CrossFit工作室，提供小班精品训练课程。',
    '朝阳公园专业CrossFit工作室',
    '北京市朝阳区朝阳公园南路8号', '朝阳区', '北京', '北京市', 'China', '100125',
    39.9236, 116.4582, '+86-10-5987-4321', 'info@irontemplecf.com', 'https://irontemple.cn',
    JSON_OBJECT('wechat', 'IronTempleCF'),
    JSON_ARRAY('https://example.com/gym3-1.jpg'),
    'https://example.com/iron-temple-logo.jpg',
    JSON_ARRAY('Lifting Platforms', 'Functional Movement Zone', 'Cardio Area', 'Stretching Space'),
    JSON_OBJECT('barbells', 12, 'kettlebells', '8kg-28kg range', 'dumbbells', '5kg-30kg range'),
    JSON_ARRAY('Changing Rooms', 'Showers', 'Lockers', 'WiFi'),
    JSON_OBJECT('monday', '06:00-21:00', 'tuesday', '06:00-21:00', 'wednesday', '06:00-21:00', 'thursday', '06:00-21:00', 'friday', '06:00-21:00', 'saturday', '08:00-18:00', 'sunday', '09:00-17:00'),
    '180-400 CNY',
    JSON_OBJECT('drop_in', 80, 'monthly', 650, 'quarterly', 1800, 'annual', 6000, 'currency', 'CNY'),
    25, 200.00,
    JSON_OBJECT('available', true, 'spaces', 10, 'fee', '免费会员停车'),
    JSON_OBJECT('subway', '朝阳公园站', 'bus', '公交线路', 'parking', '有停车位'),
    4.5, 56, 1, true, false, 'specialty', false,
    JSON_ARRAY('Functional Fitness', 'Weight Training', 'HIIT'),
    JSON_ARRAY('Functional Fitness', 'Small Classes', 'Beginner Friendly'),
    NOW(), NOW()
);

-- 插入上海场馆数据
INSERT INTO gyms (
    uuid, name, name_en, description, short_description, 
    address, district, city, province, country, postal_code,
    latitude, longitude, phone, email, website, 
    social_media, images, logo, facilities, equipment, amenities,
    opening_hours, price_range, pricing_info, capacity, area_size,
    parking_info, transport_info, rating, review_count,
    status, verified, featured, gym_type, crossfit_certified, 
    supported_programs, tags, created_at, updated_at
) VALUES 
-- CrossFit Lujiazui
(
    UUID(), 'CrossFit Lujiazui', 'CrossFit Lujiazui',
    '上海陆家嘴金融中心的标志性CrossFit场馆，为金融精英提供专业健身服务。',
    '陆家嘴金融中心CrossFit场馆',
    '上海市浦东新区陆家嘴环路1000号', '浦东新区', '上海', '上海市', 'China', '200120',
    31.2397, 121.4990, '+86-21-6841-2345', 'info@crossfitlujiazui.com', 'https://crossfitlujiazui.com',
    JSON_OBJECT('wechat', 'CrossFitLJZ', 'weibo', '@CrossFitLujiazui', 'instagram', '@crossfitlujiazui'),
    JSON_ARRAY('https://example.com/gym4-1.jpg', 'https://example.com/gym4-2.jpg', 'https://example.com/gym4-3.jpg', 'https://example.com/gym4-4.jpg'),
    'https://example.com/crossfit-lujiazui-logo.jpg',
    JSON_ARRAY('Premium Olympic Platforms', 'Concept2 Rowers', 'Assault Bikes', 'TRX Suspension', 'Battle Ropes', 'Gymnastics Area'),
    JSON_OBJECT('barbells', 25, 'kettlebells', '8kg-48kg range', 'dumbbells', '2.5kg-50kg range', 'concept2_rowers', 8, 'assault_bikes', 6, 'specialty_equipment', 'Sleds, Tires, Sandbags'),
    JSON_ARRAY('Executive Locker Rooms', 'Steam Room', 'Juice Bar', 'Towel Service', 'Premium WiFi', 'Valet Parking'),
    JSON_OBJECT('monday', '05:00-23:00', 'tuesday', '05:00-23:00', 'wednesday', '05:00-23:00', 'thursday', '05:00-23:00', 'friday', '05:00-23:00', 'saturday', '07:00-22:00', 'sunday', '08:00-20:00'),
    '400-1200 CNY',
    JSON_OBJECT('drop_in', 200, 'monthly', 1500, 'quarterly', 4200, 'annual', 15000, 'executive_package', 2500, 'currency', 'CNY'),
    80, 600.00,
    JSON_OBJECT('available', true, 'spaces', 50, 'fee', 'Valet service included'),
    JSON_OBJECT('subway', '陆家嘴站 (Line 2)', 'bus', '多条公交线路直达', 'parking', '商务楼专用停车场'),
    4.9, 245, 1, true, true, 'crossfit_certified', true,
    JSON_ARRAY('CrossFit', 'Olympic Lifting', 'Executive Training', 'Corporate Wellness'),
    JSON_ARRAY('CrossFit', 'Executive', 'Premium', 'Financial District', 'Corporate'),
    NOW(), NOW()
),

-- Forge CrossFit Shanghai
(
    UUID(), 'Forge CrossFit Shanghai', 'Forge CrossFit Shanghai',
    '徐汇区专业CrossFit训练中心，提供全面的功能性训练课程。',
    '徐汇专业CrossFit训练中心',
    '上海市徐汇区淮海中路1337号', '徐汇区', '上海', '上海市', 'China', '200031',
    31.2165, 121.4365, '+86-21-5467-8901', 'hello@forgecrossfit.sh', 'https://forgecrossfit.cn',
    JSON_OBJECT('wechat', 'ForgeCrossfit', 'weibo', '@ForgeCrossFitSH'),
    JSON_ARRAY('https://example.com/gym5-1.jpg', 'https://example.com/gym5-2.jpg'),
    'https://example.com/forge-crossfit-logo.jpg',
    JSON_ARRAY('CrossFit Games Equipment', 'Olympic Weightlifting Area', 'Mobility Station', 'Outdoor Training Space', 'Recovery Room'),
    JSON_OBJECT('barbells', 18, 'kettlebells', '8kg-36kg range', 'plates', 'Bumper plates full set', 'gymnastics', 'Rings, Parallettes, Rope Climbs'),
    JSON_ARRAY('Modern Changing Rooms', 'Showers', 'Equipment Rental', 'Supplement Store', 'Member Events'),
    JSON_OBJECT('monday', '06:00-22:00', 'tuesday', '06:00-22:00', 'wednesday', '06:00-22:00', 'thursday', '06:00-22:00', 'friday', '06:00-22:00', 'saturday', '08:00-20:00', 'sunday', '09:00-18:00'),
    '250-600 CNY',
    JSON_OBJECT('drop_in', 120, 'monthly', 980, 'quarterly', 2700, 'annual', 9600, 'unlimited', 1200, 'currency', 'CNY'),
    45, 350.00,
    JSON_OBJECT('available', true, 'spaces', 15, 'fee', '15 CNY/hour'),
    JSON_OBJECT('subway', '徐家汇站', 'bus', '多条公交线路', 'parking', '附近停车场'),
    4.6, 134, 1, true, false, 'crossfit_certified', true,
    JSON_ARRAY('CrossFit', 'Olympic Lifting', 'Functional Movement', 'Competition Prep'),
    JSON_ARRAY('CrossFit', 'Competition', 'Functional Movement', 'Community'),
    NOW(), NOW()
),

-- Warrior Fitness Studio
(
    UUID(), 'Warrior Fitness Studio', 'Warrior Fitness Studio',
    '静安区精品健身工作室，专注于CrossFit和功能性训练。',
    '静安精品CrossFit工作室',
    '上海市静安区南京西路1601号', '静安区', '上海', '上海市', 'China', '200040',
    31.2304, 121.4478, '+86-21-3214-5679', 'info@warriorfit.sh', 'https://warriorfitness.studio',
    JSON_OBJECT('wechat', 'WarriorFit'),
    JSON_ARRAY('https://example.com/gym6-1.jpg'),
    'https://example.com/warrior-fitness-logo.jpg',
    JSON_ARRAY('Functional Training Zone', 'Cardio Equipment', 'Free Weights Area', 'Group Class Studio'),
    JSON_OBJECT('barbells', 10, 'kettlebells', '8kg-32kg range', 'dumbbells', '5kg-40kg range'),
    JSON_ARRAY('Changing Rooms', 'Showers', 'Lockers', 'WiFi'),
    JSON_OBJECT('monday', '06:30-21:30', 'tuesday', '06:30-21:30', 'wednesday', '06:30-21:30', 'thursday', '06:30-21:30', 'friday', '06:30-21:30', 'saturday', '08:00-19:00', 'sunday', '09:00-18:00'),
    '200-450 CNY',
    JSON_OBJECT('drop_in', 90, 'monthly', 720, 'quarterly', 2000, 'annual', 7200, 'currency', 'CNY'),
    30, 180.00,
    JSON_OBJECT('available', true, 'spaces', 8, 'fee', '收费停车'),
    JSON_OBJECT('subway', '静安寺站', 'bus', '公交便利', 'parking', '周边停车场'),
    4.4, 78, 1, true, false, 'specialty', false,
    JSON_ARRAY('Functional Training', 'HIIT', 'Weight Training', 'Bootcamp'),
    JSON_ARRAY('Functional Training', 'Small Groups', 'Boutique', 'Personalized'),
    NOW(), NOW()
),

-- Elite Performance CrossFit
(
    UUID(), 'Elite Performance CrossFit', 'Elite Performance CrossFit',
    '浦东新区高性能训练中心，为运动员和健身爱好者提供专业指导。',
    '浦东高性能CrossFit训练中心',
    '上海市浦东新区张江高科技园区达尔文路88号', '浦东新区', '上海', '上海市', 'China', '201203',
    31.2077, 121.6056, '+86-21-2896-1234', 'elite@performancecf.com', 'https://eliteperformancecf.com',
    JSON_OBJECT('wechat', 'ElitePerformCF', 'weibo', '@ElitePerformanceSH'),
    JSON_ARRAY('https://example.com/gym7-1.jpg', 'https://example.com/gym7-2.jpg', 'https://example.com/gym7-3.jpg'),
    'https://example.com/elite-performance-logo.jpg',
    JSON_ARRAY('Competition Standard Equipment', 'Performance Testing Lab', 'Recovery Center', 'Sports Medicine Clinic', 'Nutrition Center'),
    JSON_OBJECT('barbells', 30, 'specialty_bars', 'Full range including SSB, Trap Bar, Swiss Bar', 'kettlebells', '6kg-48kg full range', 'machines', 'Assault bikes, Concept2 rowers, SkiErg', 'technology', 'Force plates, velocity trackers'),
    JSON_ARRAY('Athlete Locker Rooms', 'Ice Baths', 'Compression Therapy', 'Massage Therapy', 'Performance Analysis', 'Meal Prep Service'),
    JSON_OBJECT('monday', '05:00-23:00', 'tuesday', '05:00-23:00', 'wednesday', '05:00-23:00', 'thursday', '05:00-23:00', 'friday', '05:00-23:00', 'saturday', '06:00-22:00', 'sunday', '07:00-21:00'),
    '500-1500 CNY',
    JSON_OBJECT('drop_in', 250, 'monthly', 1800, 'quarterly', 5000, 'annual', 18000, 'athlete_program', 2500, 'elite_coaching', 3500, 'currency', 'CNY'),
    60, 800.00,
    JSON_OBJECT('available', true, 'spaces', 40, 'fee', 'Free for members'),
    JSON_OBJECT('subway', '张江高科站 (Line 2)', 'bus', '园区班车服务', 'parking', '免费会员停车'),
    4.8, 167, 1, true, true, 'crossfit_certified', true,
    JSON_ARRAY('CrossFit', 'Olympic Lifting', 'Powerlifting', 'Athletic Performance', 'Recovery'),
    JSON_ARRAY('CrossFit', 'Elite Performance', 'Athletic Training', 'Recovery', 'Technology'),
    NOW(), NOW()
);

-- 验证插入结果
SELECT 
    COUNT(*) as total_gyms,
    SUM(CASE WHEN city = '北京' THEN 1 ELSE 0 END) as beijing_gyms,
    SUM(CASE WHEN city = '上海' THEN 1 ELSE 0 END) as shanghai_gyms,
    SUM(CASE WHEN crossfit_certified = 1 THEN 1 ELSE 0 END) as crossfit_certified_gyms
FROM gyms 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- 显示刚插入的场馆信息
SELECT id, name, city, district, rating, crossfit_certified, featured
FROM gyms 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY city, name;