-- MobiLiF 测试数据脚本
-- 用于开发和测试环境
-- 创建时间: 2024-01-01

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE `mobilif`;

-- ========================================
-- 清空现有数据（谨慎使用）
-- ========================================

-- TRUNCATE TABLE `point_transactions`;
-- TRUNCATE TABLE `user_skill_progress`;
-- TRUNCATE TABLE `user_points`;
-- TRUNCATE TABLE `posts`;
-- TRUNCATE TABLE `friendships`;
-- TRUNCATE TABLE `bookings`;
-- TRUNCATE TABLE `classes`;
-- TRUNCATE TABLE `class_categories`;
-- TRUNCATE TABLE `trainers`;
-- TRUNCATE TABLE `gyms`;
-- TRUNCATE TABLE `skill_nodes`;
-- TRUNCATE TABLE `user_sessions`;
-- TRUNCATE TABLE `user_auths`;
-- TRUNCATE TABLE `users`;

-- ========================================
-- 插入测试用户数据
-- ========================================

-- 插入测试用户
INSERT INTO `users` (`uuid`, `nickname`, `real_name`, `phone`, `email`, `gender`, `birthday`, `height`, `weight`, `fitness_level`, `bio`, `location`, `avatar`, `status`, `phone_verified`, `email_verified`) VALUES
('550e8400-e29b-41d4-a716-446655440001', '健身达人小王', '王小明', '13800138001', 'wangxiaoming@example.com', 1, '1992-05-15', 175.00, 70.50, 'intermediate', '热爱CrossFit，已坚持健身3年', '北京市朝阳区', 'https://example.com/avatar1.jpg', 1, 1, 1),
('550e8400-e29b-41d4-a716-446655440002', '瑜伽女神Lisa', '李丽莎', '13800138002', 'lisa@example.com', 2, '1995-08-20', 165.00, 52.00, 'advanced', '瑜伽教练，专注身心平衡', '上海市浦东新区', 'https://example.com/avatar2.jpg', 1, 1, 1),
('550e8400-e29b-41d4-a716-446655440003', '力量型男Mike', '张迈克', '13800138003', 'mike@example.com', 1, '1988-12-10', 180.00, 85.00, 'expert', '力量举世界冠军，CrossFit教练', '深圳市南山区', 'https://example.com/avatar3.jpg', 1, 1, 1),
('550e8400-e29b-41d4-a716-446655440004', '新手小美', '陈小美', '13800138004', 'xiaomei@example.com', 2, '1998-03-25', 160.00, 50.00, 'beginner', '刚开始健身，希望遇到好的教练', '广州市天河区', 'https://example.com/avatar4.jpg', 1, 1, 1),
('550e8400-e29b-41d4-a716-446655440005', '跑步狂人Jack', '杰克逊', '13800138005', 'jack@example.com', 1, '1990-07-08', 172.00, 65.00, 'advanced', '马拉松爱好者，跑龄8年', '成都市锦江区', 'https://example.com/avatar5.jpg', 1, 1, 1);

-- 插入用户认证信息
INSERT INTO `user_auths` (`user_id`, `auth_type`, `auth_key`, `auth_secret`, `is_verified`) VALUES
(1, 'phone', '13800138001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(1, 'email', 'wangxiaoming@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(2, 'phone', '13800138002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(2, 'email', 'lisa@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(3, 'phone', '13800138003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(3, 'email', 'mike@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(4, 'phone', '13800138004', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(4, 'email', 'xiaomei@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(5, 'phone', '13800138005', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1),
(5, 'email', 'jack@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1);

-- ========================================
-- 插入健身房数据
-- ========================================

INSERT INTO `gyms` (`uuid`, `name`, `description`, `address`, `district`, `city`, `province`, `latitude`, `longitude`, `phone`, `email`, `images`, `facilities`, `opening_hours`, `status`, `verified`, `owner_id`) VALUES
('gym-550e8400-e29b-41d4-a716-446655440001', 'CrossFit北京旗舰店', '北京最大的CrossFit训练基地，拥有专业器材和认证教练团队', '北京市朝阳区建国门外大街1号', '朝阳区', '北京市', '北京市', 39.908823, 116.397470, '010-85123456', 'beijing@crossfit.com', '["https://example.com/gym1_1.jpg", "https://example.com/gym1_2.jpg"]', '["杠铃区", "自由重量区", "有氧器械区", "功能训练区", "更衣室", "淋浴间"]', '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "08:00-20:00", "sunday": "08:00-20:00"}', 1, 1, 1),
('gym-550e8400-e29b-41d4-a716-446655440002', 'PowerFit上海中心', '上海市中心的高端健身会所，提供个性化训练方案', '上海市浦东新区陆家嘴环路1000号', '浦东新区', '上海市', '上海市', 31.235929, 121.506191, '021-68123456', 'shanghai@powerfit.com', '["https://example.com/gym2_1.jpg", "https://example.com/gym2_2.jpg"]', '["力量训练区", "有氧区", "瑜伽室", "动感单车房", "桑拿房", "按摩室"]', '{"monday": "06:00-23:00", "tuesday": "06:00-23:00", "wednesday": "06:00-23:00", "thursday": "06:00-23:00", "friday": "06:00-23:00", "saturday": "07:00-22:00", "sunday": "07:00-22:00"}', 1, 1, 2),
('gym-550e8400-e29b-41d4-a716-446655440003', 'FitZone深圳科技园', '科技园区白领的健身首选，智能化设备齐全', '深圳市南山区科技中一路1号', '南山区', '深圳市', '广东省', 22.535925, 113.937588, '0755-86123456', 'shenzhen@fitzone.com', '["https://example.com/gym3_1.jpg", "https://example.com/gym3_2.jpg"]', '["智能器械区", "团课教室", "拳击训练区", "攀岩墙", "休息区", "营养吧"]', '{"monday": "06:30-22:30", "tuesday": "06:30-22:30", "wednesday": "06:30-22:30", "thursday": "06:30-22:30", "friday": "06:30-22:30", "saturday": "08:00-21:00", "sunday": "08:00-21:00"}', 1, 1, 3);

-- ========================================
-- 插入教练数据
-- ========================================

INSERT INTO `trainers` (`uuid`, `user_id`, `gym_id`, `name`, `specialties`, `certifications`, `experience_years`, `bio`, `hourly_rate`, `rating`, `status`) VALUES
('trainer-550e8400-e29b-41d4-a716-446655440001', 3, 1, '张迈克', '["CrossFit", "力量训练", "奥林匹克举重"]', '["CrossFit Level 2", "NSCA-CSCS", "USAW Level 1"]', 8, '前举重运动员，现任CrossFit认证教练，擅长力量训练和技术指导', 300.00, 4.9, 1),
('trainer-550e8400-e29b-41d4-a716-446655440002', 2, 2, '李丽莎', '["瑜伽", "普拉提", "功能性训练"]', '["RYT-500", "Peak Pilates", "FMS Level 2"]', 6, '国际瑜伽联盟认证教练，专注身心平衡和柔韧性训练', 250.00, 4.8, 1),
('trainer-550e8400-e29b-41d4-a716-446655440003', 1, 3, '王小明', '["CrossFit", "减脂塑形", "功能性训练"]', '["CrossFit Level 1", "NASM-CPT"]', 3, '热情的健身教练，擅长帮助初学者建立正确的运动习惯', 200.00, 4.7, 1);

-- ========================================
-- 插入课程分类数据
-- ========================================

INSERT INTO `class_categories` (`name`, `name_en`, `description`, `icon`, `color`, `sort_order`, `is_active`) VALUES
('CrossFit训练', 'CrossFit', 'CrossFit功能性健身训练课程', 'crossfit-icon.svg', '#FF6B35', 1, 1),
('力量训练', 'Strength Training', '专注力量提升的训练课程', 'strength-icon.svg', '#4A90E2', 2, 1),
('有氧训练', 'Cardio', '心肺功能提升的有氧运动课程', 'cardio-icon.svg', '#7ED321', 3, 1),
('瑜伽', 'Yoga', '身心平衡的瑜伽课程', 'yoga-icon.svg', '#9013FE', 4, 1),
('拳击', 'Boxing', '拳击和格斗技巧训练', 'boxing-icon.svg', '#F5A623', 5, 1),
('舞蹈健身', 'Dance Fitness', '结合舞蹈元素的健身课程', 'dance-icon.svg', '#FF4081', 6, 1);

-- ========================================
-- 插入课程数据
-- ========================================

INSERT INTO `classes` (`uuid`, `gym_id`, `trainer_id`, `category_id`, `name`, `description`, `type`, `level`, `duration`, `max_participants`, `price`, `start_time`, `end_time`, `status`) VALUES
('class-550e8400-e29b-41d4-a716-446655440001', 1, 1, 1, 'CrossFit基础入门', 'CrossFit基础动作学习，适合初学者', 'CrossFit', 'beginner', 60, 12, 80.00, '2024-01-15 19:00:00', '2024-01-15 20:00:00', 1),
('class-550e8400-e29b-41d4-a716-446655440002', 1, 1, 1, 'CrossFit进阶训练', '高强度CrossFit训练，挑战你的极限', 'CrossFit', 'advanced', 75, 10, 120.00, '2024-01-16 20:00:00', '2024-01-16 21:15:00', 1),
('class-550e8400-e29b-41d4-a716-446655440003', 2, 2, 4, '哈他瑜伽', '经典哈他瑜伽，注重体式的精准练习', 'Yoga', 'beginner', 90, 20, 100.00, '2024-01-15 18:30:00', '2024-01-15 20:00:00', 1),
('class-550e8400-e29b-41d4-a716-446655440004', 2, 2, 4, '流瑜伽', '流畅的瑜伽序列，提升柔韧性和力量', 'Yoga', 'intermediate', 75, 15, 120.00, '2024-01-17 19:00:00', '2024-01-17 20:15:00', 1),
('class-550e8400-e29b-41d4-a716-446655440005', 3, 3, 2, '力量塑形', '全身力量训练，塑造完美身材', 'Strength', 'intermediate', 60, 8, 100.00, '2024-01-16 19:30:00', '2024-01-16 20:30:00', 1);

-- ========================================
-- 插入技能节点数据
-- ========================================

INSERT INTO `skill_nodes` (`uuid`, `code`, `name`, `name_en`, `description`, `category`, `level`, `difficulty`, `points_required`, `verification_criteria`, `position_x`, `position_y`, `icon`, `is_active`) VALUES
('skill-550e8400-e29b-41d4-a716-446655440001', 'SQUAT_BASIC', '深蹲基础', 'Basic Squat', '学习正确的深蹲技术，建立下肢力量基础', 'movement', 1, 'easy', 0, '{"form_check": true, "depth_requirement": "hip_below_knee", "reps": 10}', 100, 100, 'squat-icon.svg', 1),
('skill-550e8400-e29b-41d4-a716-446655440002', 'PUSHUP_BASIC', '俯卧撑基础', 'Basic Push-up', '掌握标准俯卧撑动作，发展上肢推力', 'movement', 1, 'easy', 0, '{"form_check": true, "chest_to_floor": true, "reps": 5}', 200, 100, 'pushup-icon.svg', 1),
('skill-550e8400-e29b-41d4-a716-446655440003', 'PULLUP_BASIC', '引体向上基础', 'Basic Pull-up', '完成标准引体向上，建立上肢拉力', 'movement', 2, 'medium', 100, '{"form_check": true, "chin_over_bar": true, "reps": 1}', 300, 150, 'pullup-icon.svg', 1),
('skill-550e8400-e29b-41d4-a716-446655440004', 'DEADLIFT_BASIC', '硬拉基础', 'Basic Deadlift', '学习硬拉技术，发展后链力量', 'movement', 2, 'medium', 150, '{"form_check": true, "weight": "bodyweight", "reps": 5}', 150, 200, 'deadlift-icon.svg', 1),
('skill-550e8400-e29b-41d4-a716-446655440005', 'HANDSTAND', '手倒立', 'Handstand', '完成靠墙手倒立，提升肩部稳定性', 'gymnastics', 3, 'hard', 300, '{"wall_assisted": true, "hold_time": 30, "form_check": true}', 400, 250, 'handstand-icon.svg', 1);

-- ========================================
-- 插入用户积分数据
-- ========================================

INSERT INTO `user_points` (`user_id`, `total_points`, `available_points`, `level`, `experience`, `streak_days`, `last_checkin`) VALUES
(1, 1250, 850, 3, 1250, 15, '2024-01-14'),
(2, 980, 680, 2, 980, 8, '2024-01-14'),
(3, 2150, 1350, 5, 2150, 25, '2024-01-14'),
(4, 320, 220, 1, 320, 3, '2024-01-13'),
(5, 1680, 1180, 4, 1680, 12, '2024-01-14');

-- ========================================
-- 插入预约数据
-- ========================================

INSERT INTO `bookings` (`uuid`, `booking_no`, `user_id`, `class_id`, `status`, `payment_status`, `payment_amount`, `payment_method`, `payment_time`) VALUES
('booking-550e8400-e29b-41d4-a716-446655440001', 'BK202401150001', 4, 1, 2, 1, 80.00, 'wechat_pay', '2024-01-14 15:30:00'),
('booking-550e8400-e29b-41d4-a716-446655440002', 'BK202401150002', 1, 2, 1, 1, 120.00, 'alipay', '2024-01-14 16:20:00'),
('booking-550e8400-e29b-41d4-a716-446655440003', 'BK202401150003', 2, 3, 4, 1, 100.00, 'wechat_pay', '2024-01-14 17:00:00'),
('booking-550e8400-e29b-41d4-a716-446655440004', 'BK202401150004', 5, 5, 1, 1, 100.00, 'wechat_pay', '2024-01-14 18:15:00');

-- ========================================
-- 插入用户技能进度数据
-- ========================================

INSERT INTO `user_skill_progress` (`user_id`, `skill_id`, `status`, `progress_percentage`, `attempts`, `unlocked_at`, `started_at`) VALUES
(1, 1, 4, 100.00, 5, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(1, 2, 4, 100.00, 3, '2024-01-01 10:00:00', '2024-01-01 10:00:00'),
(1, 3, 2, 60.00, 8, '2024-01-05 14:00:00', '2024-01-05 14:00:00'),
(2, 1, 4, 100.00, 2, '2024-01-02 09:00:00', '2024-01-02 09:00:00'),
(2, 2, 3, 100.00, 4, '2024-01-02 09:00:00', '2024-01-02 09:00:00'),
(3, 1, 4, 100.00, 1, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(3, 2, 4, 100.00, 1, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(3, 3, 4, 100.00, 2, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(3, 4, 4, 100.00, 3, '2024-01-01 08:00:00', '2024-01-01 08:00:00'),
(3, 5, 2, 40.00, 12, '2024-01-10 16:00:00', '2024-01-10 16:00:00'),
(4, 1, 1, 20.00, 2, '2024-01-12 20:00:00', '2024-01-12 20:00:00'),
(5, 1, 4, 100.00, 4, '2024-01-03 07:00:00', '2024-01-03 07:00:00'),
(5, 2, 3, 90.00, 6, '2024-01-03 07:00:00', '2024-01-03 07:00:00'),
(5, 3, 2, 30.00, 15, '2024-01-08 18:00:00', '2024-01-08 18:00:00');

-- ========================================
-- 插入积分交易记录
-- ========================================

INSERT INTO `point_transactions` (`uuid`, `user_id`, `type`, `points`, `source`, `description`, `balance_before`, `balance_after`) VALUES
('pt-550e8400-e29b-41d4-a716-446655440001', 1, 'earn', 10, 'daily_checkin', '每日签到奖励', 0, 10),
('pt-550e8400-e29b-41d4-a716-446655440002', 1, 'earn', 50, 'complete_class', '完成课程奖励', 10, 60),
('pt-550e8400-e29b-41d4-a716-446655440003', 1, 'earn', 100, 'skill_certification', '技能认证奖励', 60, 160),
('pt-550e8400-e29b-41d4-a716-446655440004', 1, 'spend', 50, 'unlock_skill', '解锁新技能', 160, 110),
('pt-550e8400-e29b-41d4-a716-446655440005', 2, 'earn', 10, 'daily_checkin', '每日签到奖励', 0, 10),
('pt-550e8400-e29b-41d4-a716-446655440006', 2, 'earn', 100, 'skill_certification', '技能认证奖励', 10, 110),
('pt-550e8400-e29b-41d4-a716-446655440007', 3, 'earn', 200, 'friend_referral', '推荐好友奖励', 500, 700),
('pt-550e8400-e29b-41d4-a716-446655440008', 4, 'earn', 10, 'daily_checkin', '每日签到奖励', 0, 10),
('pt-550e8400-e29b-41d4-a716-446655440009', 5, 'earn', 50, 'complete_class', '完成课程奖励', 100, 150);

-- ========================================
-- 插入好友关系数据
-- ========================================

INSERT INTO `friendships` (`user_id`, `friend_id`, `status`, `initiator_id`, `message`, `source`) VALUES
(1, 2, 1, 1, '我们一起训练吧！', 'gym'),
(1, 3, 1, 3, '欢迎来到CrossFit世界', 'recommendation'),
(2, 3, 1, 2, '听说你是力量达人，请多指教', 'search'),
(4, 1, 1, 4, '你好，我是新手，希望多交流', 'class'),
(5, 1, 1, 5, '一起跑步健身', 'recommendation');

-- ========================================
-- 插入动态数据
-- ========================================

INSERT INTO `posts` (`uuid`, `user_id`, `type`, `content`, `images`, `location`, `gym_id`, `privacy`, `like_count`, `comment_count`) VALUES
('post-550e8400-e29b-41d4-a716-446655440001', 1, 'workout', '今天完成了CrossFit WOD，感觉状态不错！💪 #CrossFit #健身打卡', '["https://example.com/workout1.jpg"]', 'CrossFit北京旗舰店', 1, 1, 15, 3),
('post-550e8400-e29b-41d4-a716-446655440002', 2, 'achievement', '终于完成了我的第一个引体向上！感谢教练的指导 🎉', '["https://example.com/achievement1.jpg"]', 'PowerFit上海中心', 2, 1, 28, 8),
('post-550e8400-e29b-41d4-a716-446655440003', 3, 'text', '今天教了一堂很棒的CrossFit课，看到学员们的进步真的很开心！教学相长 👨‍🏫', '[]', 'CrossFit北京旗舰店', 1, 1, 22, 5),
('post-550e8400-e29b-41d4-a716-446655440004', 4, 'checkin', '第一次来健身房，紧张又兴奋！希望能坚持下去 💪', '["https://example.com/checkin1.jpg"]', 'FitZone深圳科技园', 3, 1, 12, 6),
('post-550e8400-e29b-41d4-a716-446655440005', 5, 'workout', '晨跑10公里完成！今天的天气太棒了 ☀️ #晨跑 #坚持', '["https://example.com/running1.jpg"]', '深圳湾公园', NULL, 1, 18, 2);

-- ========================================
-- 更新课程参与人数
-- ========================================

UPDATE `classes` SET `current_participants` = (
    SELECT COUNT(*) FROM `bookings` 
    WHERE `bookings`.`class_id` = `classes`.`id` 
    AND `bookings`.`status` IN (1, 2, 3, 4)
);

-- ========================================
-- 更新用户统计数据
-- ========================================

-- 更新健身房评分和评价数量
UPDATE `gyms` g SET 
    `review_count` = (SELECT COUNT(*) FROM `bookings` b JOIN `classes` c ON b.class_id = c.id WHERE c.gym_id = g.id AND b.rating IS NOT NULL),
    `rating` = COALESCE((SELECT AVG(b.rating) FROM `bookings` b JOIN `classes` c ON b.class_id = c.id WHERE c.gym_id = g.id AND b.rating IS NOT NULL), 0);

-- 更新教练评分和评价数量
UPDATE `trainers` t SET 
    `review_count` = (SELECT COUNT(*) FROM `bookings` b JOIN `classes` c ON b.class_id = c.id WHERE c.trainer_id = t.id AND b.rating IS NOT NULL),
    `rating` = COALESCE((SELECT AVG(b.rating) FROM `bookings` b JOIN `classes` c ON b.class_id = c.id WHERE c.trainer_id = t.id AND b.rating IS NOT NULL), 0),
    `class_count` = (SELECT COUNT(*) FROM `classes` c WHERE c.trainer_id = t.id),
    `student_count` = (SELECT COUNT(DISTINCT b.user_id) FROM `bookings` b JOIN `classes` c ON b.class_id = c.id WHERE c.trainer_id = t.id);

-- ========================================
-- 插入额外的测试数据
-- ========================================

-- 插入更多课程（未来7天的课程）
INSERT INTO `classes` (`uuid`, `gym_id`, `trainer_id`, `category_id`, `name`, `description`, `type`, `level`, `duration`, `max_participants`, `price`, `start_time`, `end_time`, `status`) VALUES
-- 明天的课程
('class-550e8400-e29b-41d4-a716-446655440006', 1, 1, 1, 'CrossFit晨练', '早晨唤醒身体的CrossFit训练', 'CrossFit', 'intermediate', 60, 15, 100.00, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 8 HOUR, 1),
('class-550e8400-e29b-41d4-a716-446655440007', 2, 2, 4, '晨间瑜伽', '清晨瑜伽，开启美好一天', 'Yoga', 'beginner', 75, 20, 80.00, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 8 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 9 HOUR + INTERVAL 15 MINUTE, 1),
-- 后天的课程
('class-550e8400-e29b-41d4-a716-446655440008', 3, 3, 2, '力量进阶', '提升力量水平的进阶训练', 'Strength', 'advanced', 90, 10, 150.00, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 19 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 20 HOUR + INTERVAL 30 MINUTE, 1),
('class-550e8400-e29b-41d4-a716-446655440009', 1, 1, 1, 'CrossFit竞技训练', '高强度竞技级CrossFit训练', 'CrossFit', 'expert', 120, 8, 200.00, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 20 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 22 HOUR, 1);

-- 插入更多技能节点
INSERT INTO `skill_nodes` (`uuid`, `code`, `name`, `name_en`, `description`, `category`, `level`, `difficulty`, `points_required`, `verification_criteria`, `position_x`, `position_y`, `icon`, `is_active`) VALUES
('skill-550e8400-e29b-41d4-a716-446655440006', 'BURPEE', '波比跳', 'Burpee', '全身性有氧力量复合动作', 'cardio', 2, 'medium', 100, '{"form_check": true, "reps": 20, "time_limit": 60}', 250, 150, 'burpee-icon.svg', 1),
('skill-550e8400-e29b-41d4-a716-446655440007', 'KETTLEBELL_SWING', '壶铃摆动', 'Kettlebell Swing', '壶铃基础动作，发展爆发力', 'movement', 2, 'medium', 120, '{"form_check": true, "weight": "16kg", "reps": 50}', 350, 180, 'kettlebell-icon.svg', 1),
('skill-550e8400-e29b-41d4-a716-446655440008', 'MUSCLE_UP', '肌肉升起', 'Muscle-up', '高级体操动作，展现综合实力', 'gymnastics', 4, 'expert', 800, '{"strict_form": true, "reps": 1, "video_required": true}', 500, 300, 'muscleup-icon.svg', 1),
('skill-550e8400-e29b-41d4-a716-446655440009', 'BOX_JUMP', '箱子跳', 'Box Jump', '爆发力训练基础动作', 'plyometric', 1, 'easy', 50, '{"height": "20inch", "reps": 10, "safe_landing": true}', 180, 120, 'boxjump-icon.svg', 1),
('skill-550e8400-e29b-41d4-a716-446655440010', 'DOUBLE_UNDER', '双摇跳绳', 'Double Under', '跳绳进阶技巧，提升协调性', 'cardio', 3, 'hard', 250, '{"consecutive": 50, "form_check": true}', 450, 200, 'doubleunder-icon.svg', 1);

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 数据验证查询
-- ========================================

-- 验证插入的数据
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Gyms', COUNT(*) FROM gyms
UNION ALL
SELECT 'Trainers', COUNT(*) FROM trainers
UNION ALL
SELECT 'Classes', COUNT(*) FROM classes
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Skill Nodes', COUNT(*) FROM skill_nodes
UNION ALL
SELECT 'User Skills', COUNT(*) FROM user_skill_progress
UNION ALL
SELECT 'Point Transactions', COUNT(*) FROM point_transactions
UNION ALL
SELECT 'Friendships', COUNT(*) FROM friendships
UNION ALL
SELECT 'Posts', COUNT(*) FROM posts;

-- 显示用户等级分布
SELECT 
    up.level,
    COUNT(*) as user_count,
    AVG(up.total_points) as avg_points
FROM user_points up 
GROUP BY up.level 
ORDER BY up.level;

-- 显示课程预约情况
SELECT 
    c.name as class_name,
    c.max_participants,
    c.current_participants,
    ROUND((c.current_participants / c.max_participants) * 100, 2) as occupancy_rate
FROM classes c 
WHERE c.status = 1
ORDER BY occupancy_rate DESC;

SELECT '测试数据插入完成！' as message;