-- MobiLiF 数据库初始化脚本
-- 兼容阿里云 MySQL 8.0
-- 创建时间: 2024-01-01
-- 版本: 1.0.0

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- ========================================
-- 数据库和用户创建
-- ========================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `mobilif` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `mobilif`;

-- 创建应用用户
CREATE USER IF NOT EXISTS 'mobilif_app'@'%' IDENTIFIED BY 'MobiLiF@2025!';
GRANT SELECT, INSERT, UPDATE, DELETE ON mobilif.* TO 'mobilif_app'@'%';

-- 创建只读用户（从库）
CREATE USER IF NOT EXISTS 'mobilif_read'@'%' IDENTIFIED BY 'MobiLiF@2025!';
GRANT SELECT ON mobilif.* TO 'mobilif_read'@'%';

-- 创建备份用户
CREATE USER IF NOT EXISTS 'mobilif_backup'@'%' IDENTIFIED BY 'MobiLiF@2025!';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON mobilif.* TO 'mobilif_backup'@'%';

FLUSH PRIVILEGES;

-- ========================================
-- 用户模块表结构
-- ========================================

-- 用户基础信息表
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `uuid` VARCHAR(36) NOT NULL UNIQUE COMMENT '用户UUID',
  `union_id` VARCHAR(100) NULL UNIQUE COMMENT '微信UnionID',
  `open_id` VARCHAR(100) NULL UNIQUE COMMENT '微信OpenID',
  `phone` VARCHAR(20) NULL UNIQUE COMMENT '手机号',
  `email` VARCHAR(100) NULL UNIQUE COMMENT '邮箱',
  `username` VARCHAR(50) NULL UNIQUE COMMENT '用户名',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `real_name` VARCHAR(50) NULL COMMENT '真实姓名',
  `avatar` VARCHAR(500) NULL COMMENT '头像URL',
  `gender` TINYINT NOT NULL DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
  `birthday` DATE NULL COMMENT '生日',
  `age` TINYINT NULL COMMENT '年龄',
  `height` DECIMAL(5,2) NULL COMMENT '身高(cm)',
  `weight` DECIMAL(5,2) NULL COMMENT '体重(kg)',
  `fitness_level` ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner' COMMENT '健身水平',
  `fitness_goals` JSON NULL COMMENT '健身目标',
  `bio` TEXT NULL COMMENT '个人简介',
  `location` VARCHAR(100) NULL COMMENT '所在地区',
  `timezone` VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
  `language` VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '用户状态：0-禁用，1-正常，2-审核中',
  `email_verified` TINYINT NOT NULL DEFAULT 0 COMMENT '邮箱是否验证',
  `phone_verified` TINYINT NOT NULL DEFAULT 0 COMMENT '手机是否验证',
  `privacy_settings` JSON NULL COMMENT '隐私设置',
  `notification_settings` JSON NULL COMMENT '通知设置',
  `last_login_at` TIMESTAMP NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(45) NULL COMMENT '最后登录IP',
  `login_count` INT UNSIGNED DEFAULT 0 COMMENT '登录次数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  KEY `idx_union_id` (`union_id`),
  KEY `idx_open_id` (`open_id`),
  KEY `idx_phone` (`phone`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_status` (`status`),
  KEY `idx_fitness_level` (`fitness_level`),
  KEY `idx_location` (`location`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';

-- 用户认证表
DROP TABLE IF EXISTS `user_auths`;
CREATE TABLE `user_auths` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `auth_type` ENUM('wechat', 'phone', 'email', 'username', 'apple', 'google') NOT NULL COMMENT '认证类型',
  `auth_key` VARCHAR(100) NOT NULL COMMENT '认证标识',
  `auth_secret` VARCHAR(200) NULL COMMENT '认证密钥（加密后）',
  `salt` VARCHAR(32) NULL COMMENT '密码盐值',
  `expires_at` TIMESTAMP NULL COMMENT '过期时间',
  `is_verified` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已验证',
  `verify_token` VARCHAR(100) NULL COMMENT '验证令牌',
  `verify_expires_at` TIMESTAMP NULL COMMENT '验证令牌过期时间',
  `failed_attempts` TINYINT DEFAULT 0 COMMENT '失败尝试次数',
  `locked_until` TIMESTAMP NULL COMMENT '锁定到',
  `last_used_at` TIMESTAMP NULL COMMENT '最后使用时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_auth` (`auth_type`, `auth_key`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_auth_type` (`auth_type`),
  KEY `idx_verify_token` (`verify_token`),
  CONSTRAINT `fk_user_auths_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户认证表';

-- 用户会话表
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `session_id` VARCHAR(128) NOT NULL UNIQUE COMMENT '会话ID',
  `device_id` VARCHAR(100) NULL COMMENT '设备ID',
  `device_type` ENUM('ios', 'android', 'web', 'wechat') NULL COMMENT '设备类型',
  `device_info` JSON NULL COMMENT '设备信息',
  `ip_address` VARCHAR(45) NULL COMMENT 'IP地址',
  `user_agent` TEXT NULL COMMENT '用户代理',
  `location` VARCHAR(100) NULL COMMENT '登录位置',
  `expires_at` TIMESTAMP NOT NULL COMMENT '过期时间',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否活跃',
  `last_activity_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后活动时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_session_id` (`session_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_device_id` (`device_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_user_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会话表';

-- ========================================
-- 场馆模块表结构
-- ========================================

-- 健身房表
DROP TABLE IF EXISTS `gyms`;
CREATE TABLE `gyms` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL UNIQUE COMMENT '场馆UUID',
  `name` VARCHAR(100) NOT NULL COMMENT '场馆名称',
  `name_en` VARCHAR(100) NULL COMMENT '英文名称',
  `description` TEXT NULL COMMENT '场馆描述',
  `short_description` VARCHAR(200) NULL COMMENT '简短描述',
  `address` VARCHAR(200) NOT NULL COMMENT '详细地址',
  `district` VARCHAR(50) NOT NULL COMMENT '所在区域',
  `city` VARCHAR(50) NOT NULL COMMENT '所在城市',
  `province` VARCHAR(50) NOT NULL COMMENT '所在省份',
  `country` VARCHAR(50) DEFAULT 'China' COMMENT '国家',
  `postal_code` VARCHAR(20) NULL COMMENT '邮政编码',
  `latitude` DECIMAL(10,7) NOT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) NOT NULL COMMENT '经度',
  `phone` VARCHAR(20) NULL COMMENT '联系电话',
  `email` VARCHAR(100) NULL COMMENT '邮箱',
  `website` VARCHAR(200) NULL COMMENT '官网',
  `social_media` JSON NULL COMMENT '社交媒体链接',
  `images` JSON NULL COMMENT '场馆图片',
  `logo` VARCHAR(500) NULL COMMENT '场馆Logo',
  `facilities` JSON NULL COMMENT '设施列表',
  `equipment` JSON NULL COMMENT '器材列表',
  `amenities` JSON NULL COMMENT '便民设施',
  `opening_hours` JSON NOT NULL COMMENT '营业时间',
  `holiday_hours` JSON NULL COMMENT '节假日营业时间',
  `price_range` VARCHAR(50) NULL COMMENT '价格区间',
  `pricing_info` JSON NULL COMMENT '价格详情',
  `capacity` INT NULL COMMENT '最大容量',
  `area_size` DECIMAL(8,2) NULL COMMENT '面积(平方米)',
  `parking_info` JSON NULL COMMENT '停车信息',
  `transport_info` JSON NULL COMMENT '交通信息',
  `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分',
  `review_count` INT UNSIGNED DEFAULT 0 COMMENT '评价数量',
  `view_count` INT UNSIGNED DEFAULT 0 COMMENT '浏览次数',
  `favorite_count` INT UNSIGNED DEFAULT 0 COMMENT '收藏次数',
  `checkin_count` INT UNSIGNED DEFAULT 0 COMMENT '签到次数',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-停业，1-营业，2-装修中',
  `verified` TINYINT NOT NULL DEFAULT 0 COMMENT '是否认证',
  `featured` TINYINT NOT NULL DEFAULT 0 COMMENT '是否推荐',
  `tags` JSON NULL COMMENT '标签',
  `business_license` VARCHAR(200) NULL COMMENT '营业执照',
  `insurance_info` JSON NULL COMMENT '保险信息',
  `safety_certifications` JSON NULL COMMENT '安全认证',
  `owner_id` BIGINT UNSIGNED NULL COMMENT '场馆管理员ID',
  `manager_ids` JSON NULL COMMENT '管理员ID列表',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  KEY `idx_location` (`city`, `district`),
  KEY `idx_coordinates` (`latitude`, `longitude`),
  KEY `idx_status` (`status`),
  KEY `idx_verified` (`verified`),
  KEY `idx_featured` (`featured`),
  KEY `idx_rating` (`rating`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_gyms_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='健身房表';

-- 教练表
DROP TABLE IF EXISTS `trainers`;
CREATE TABLE `trainers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL UNIQUE COMMENT '教练UUID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `gym_id` BIGINT UNSIGNED NOT NULL COMMENT '所属场馆ID',
  `employee_id` VARCHAR(50) NULL COMMENT '员工编号',
  `name` VARCHAR(50) NOT NULL COMMENT '教练姓名',
  `name_en` VARCHAR(50) NULL COMMENT '英文姓名',
  `avatar` VARCHAR(500) NULL COMMENT '头像',
  `title` VARCHAR(100) NULL COMMENT '职位头衔',
  `level` ENUM('junior', 'intermediate', 'senior', 'master') DEFAULT 'junior' COMMENT '教练等级',
  `specialties` JSON NULL COMMENT '专长领域',
  `certifications` JSON NULL COMMENT '认证证书',
  `education` JSON NULL COMMENT '教育背景',
  `experience_years` INT NULL COMMENT '从业年限',
  `bio` TEXT NULL COMMENT '个人简介',
  `languages` JSON NULL COMMENT '语言能力',
  `availability` JSON NULL COMMENT '可用时间',
  `hourly_rate` DECIMAL(8,2) NULL COMMENT '课时费',
  `pricing_tiers` JSON NULL COMMENT '价格层级',
  `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分',
  `review_count` INT UNSIGNED DEFAULT 0 COMMENT '评价数量',
  `class_count` INT UNSIGNED DEFAULT 0 COMMENT '授课次数',
  `student_count` INT UNSIGNED DEFAULT 0 COMMENT '学员数量',
  `achievement_count` INT UNSIGNED DEFAULT 0 COMMENT '学员成就数',
  `social_media` JSON NULL COMMENT '社交媒体',
  `contact_info` JSON NULL COMMENT '联系方式',
  `emergency_contact` JSON NULL COMMENT '紧急联系人',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-离职，1-在职，2-休假',
  `employment_type` ENUM('full_time', 'part_time', 'freelance', 'intern') DEFAULT 'full_time' COMMENT '雇佣类型',
  `start_date` DATE NULL COMMENT '入职日期',
  `end_date` DATE NULL COMMENT '离职日期',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  UNIQUE KEY `uk_user_gym` (`user_id`, `gym_id`),
  KEY `idx_gym_id` (`gym_id`),
  KEY `idx_status` (`status`),
  KEY `idx_level` (`level`),
  KEY `idx_rating` (`rating`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_trainers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trainers_gym_id` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教练表';

-- ========================================
-- 课程和预约模块
-- ========================================

-- 课程表
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL UNIQUE COMMENT '课程UUID',
  `gym_id` BIGINT UNSIGNED NOT NULL COMMENT '场馆ID',
  `trainer_id` BIGINT UNSIGNED NOT NULL COMMENT '教练ID',
  `category_id` BIGINT UNSIGNED NULL COMMENT '课程分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '课程名称',
  `name_en` VARCHAR(100) NULL COMMENT '英文名称',
  `description` TEXT NULL COMMENT '课程描述',
  `short_description` VARCHAR(200) NULL COMMENT '简短描述',
  `type` VARCHAR(50) NOT NULL COMMENT '课程类型',
  `level` ENUM('beginner', 'intermediate', 'advanced', 'all_levels') NOT NULL COMMENT '难度等级',
  `duration` INT NOT NULL COMMENT '课程时长(分钟)',
  `max_participants` INT NOT NULL COMMENT '最大人数',
  `min_participants` INT DEFAULT 1 COMMENT '最少人数',
  `current_participants` INT DEFAULT 0 COMMENT '当前人数',
  `price` DECIMAL(8,2) NOT NULL COMMENT '课程价格',
  `original_price` DECIMAL(8,2) NULL COMMENT '原价',
  `currency` VARCHAR(3) DEFAULT 'CNY' COMMENT '货币',
  `discount_info` JSON NULL COMMENT '折扣信息',
  `package_info` JSON NULL COMMENT '套餐信息',
  `equipment_needed` JSON NULL COMMENT '所需器材',
  `equipment_provided` JSON NULL COMMENT '提供器材',
  `requirements` JSON NULL COMMENT '参加要求',
  `benefits` JSON NULL COMMENT '课程收益',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `timezone` VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
  `recurrence_rule` JSON NULL COMMENT '重复规则',
  `location` VARCHAR(200) NULL COMMENT '上课地点',
  `room` VARCHAR(50) NULL COMMENT '教室',
  `online_meeting_url` VARCHAR(500) NULL COMMENT '在线会议链接',
  `is_online` TINYINT DEFAULT 0 COMMENT '是否在线课程',
  `is_hybrid` TINYINT DEFAULT 0 COMMENT '是否混合课程',
  `registration_deadline` DATETIME NULL COMMENT '报名截止时间',
  `cancellation_deadline` DATETIME NULL COMMENT '取消截止时间',
  `waiting_list_enabled` TINYINT DEFAULT 1 COMMENT '是否允许候补',
  `auto_confirm` TINYINT DEFAULT 1 COMMENT '是否自动确认',
  `requires_approval` TINYINT DEFAULT 0 COMMENT '是否需要审批',
  `tags` JSON NULL COMMENT '标签',
  `images` JSON NULL COMMENT '课程图片',
  `video_preview` VARCHAR(500) NULL COMMENT '预览视频',
  `materials` JSON NULL COMMENT '课程资料',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-取消，1-正常，2-已满，3-已结束',
  `visibility` ENUM('public', 'private', 'members_only') DEFAULT 'public' COMMENT '可见性',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  KEY `idx_gym_id` (`gym_id`),
  KEY `idx_trainer_id` (`trainer_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_type` (`type`),
  KEY `idx_level` (`level`),
  KEY `idx_status` (`status`),
  KEY `idx_visibility` (`visibility`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_classes_gym_id` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_classes_trainer_id` FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- 课程分类表
DROP TABLE IF EXISTS `class_categories`;
CREATE TABLE `class_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `name_en` VARCHAR(100) NULL COMMENT '英文名称',
  `description` TEXT NULL COMMENT '分类描述',
  `icon` VARCHAR(500) NULL COMMENT '图标',
  `color` VARCHAR(7) NULL COMMENT '颜色代码',
  `parent_id` BIGINT UNSIGNED NULL COMMENT '父分类ID',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_class_categories_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `class_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程分类表';

-- 预约表
DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL UNIQUE COMMENT '预约UUID',
  `booking_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '预约编号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `class_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
  `participants` INT DEFAULT 1 COMMENT '参与人数',
  `companion_info` JSON NULL COMMENT '同伴信息',
  `booking_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '预约时间',
  `confirmed_at` TIMESTAMP NULL COMMENT '确认时间',
  `checked_in_at` TIMESTAMP NULL COMMENT '签到时间',
  `checked_out_at` TIMESTAMP NULL COMMENT '签退时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-取消，1-预约成功，2-已确认，3-已签到，4-已完成，5-缺席，6-候补中',
  `cancellation_reason` VARCHAR(200) NULL COMMENT '取消原因',
  `cancellation_time` TIMESTAMP NULL COMMENT '取消时间',
  `cancellation_fee` DECIMAL(8,2) DEFAULT 0.00 COMMENT '取消费用',
  `no_show_fee` DECIMAL(8,2) DEFAULT 0.00 COMMENT '缺席费用',
  `payment_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态：0-未支付，1-已支付，2-部分退款，3-全额退款',
  `payment_method` VARCHAR(20) NULL COMMENT '支付方式',
  `payment_amount` DECIMAL(8,2) NULL COMMENT '支付金额',
  `discount_amount` DECIMAL(8,2) DEFAULT 0.00 COMMENT '折扣金额',
  `final_amount` DECIMAL(8,2) NULL COMMENT '最终金额',
  `currency` VARCHAR(3) DEFAULT 'CNY' COMMENT '货币',
  `payment_time` TIMESTAMP NULL COMMENT '支付时间',
  `payment_id` VARCHAR(100) NULL COMMENT '支付ID',
  `refund_amount` DECIMAL(8,2) DEFAULT 0.00 COMMENT '退款金额',
  `refund_time` TIMESTAMP NULL COMMENT '退款时间',
  `refund_id` VARCHAR(100) NULL COMMENT '退款ID',
  `source` ENUM('app', 'web', 'wechat', 'api') DEFAULT 'app' COMMENT '预约来源',
  `user_agent` TEXT NULL COMMENT '用户代理',
  `ip_address` VARCHAR(45) NULL COMMENT 'IP地址',
  `special_requests` TEXT NULL COMMENT '特殊要求',
  `notes` TEXT NULL COMMENT '备注',
  `rating` TINYINT NULL COMMENT '评分：1-5',
  `review` TEXT NULL COMMENT '评价',
  `reviewed_at` TIMESTAMP NULL COMMENT '评价时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  UNIQUE KEY `uk_booking_no` (`booking_no`),
  UNIQUE KEY `uk_user_class` (`user_id`, `class_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_booking_time` (`booking_time`),
  KEY `idx_payment_id` (`payment_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_bookings_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_class_id` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约表';

-- ========================================
-- 技能地图模块
-- ========================================

-- 技能节点表
DROP TABLE IF EXISTS `skill_nodes`;
CREATE TABLE `skill_nodes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL UNIQUE COMMENT '技能UUID',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '技能代码',
  `name` VARCHAR(100) NOT NULL COMMENT '技能名称',
  `name_en` VARCHAR(100) NULL COMMENT '英文名称',
  `description` TEXT NULL COMMENT '技能描述',
  `short_description` VARCHAR(200) NULL COMMENT '简短描述',
  `category` VARCHAR(50) NOT NULL COMMENT '技能分类',
  `subcategory` VARCHAR(50) NULL COMMENT '子分类',
  `level` TINYINT NOT NULL COMMENT '技能等级：1-5',
  `difficulty` ENUM('easy', 'medium', 'hard', 'expert') NOT NULL COMMENT '难度',
  `prerequisites` JSON NULL COMMENT '前置技能ID列表',
  `points_required` INT NOT NULL DEFAULT 0 COMMENT '解锁所需积分',
  `experience_required` INT DEFAULT 0 COMMENT '所需经验值',
  `estimated_time_hours` INT NULL COMMENT '预计学习时间（小时）',
  `demonstration_video` VARCHAR(500) NULL COMMENT '示范视频URL',
  `tutorial_content` JSON NULL COMMENT '教学内容',
  `verification_criteria` JSON NOT NULL COMMENT '认证标准',
  `verification_methods` JSON NULL COMMENT '认证方法',
  `safety_notes` TEXT NULL COMMENT '安全注意事项',
  `common_mistakes` JSON NULL COMMENT '常见错误',
  `tips` JSON NULL COMMENT '技巧提示',
  `related_skills` JSON NULL COMMENT '相关技能',
  `progression_path` JSON NULL COMMENT '进阶路径',
  `equipment_needed` JSON NULL COMMENT '所需器材',
  `muscle_groups` JSON NULL COMMENT '目标肌群',
  `benefits` JSON NULL COMMENT '技能收益',
  `position_x` INT NOT NULL COMMENT 'X坐标',
  `position_y` INT NOT NULL COMMENT 'Y坐标',
  `map_section` VARCHAR(50) NULL COMMENT '地图区域',
  `icon` VARCHAR(200) NULL COMMENT '图标URL',
  `icon_locked` VARCHAR(200) NULL COMMENT '锁定图标',
  `icon_completed` VARCHAR(200) NULL COMMENT '完成图标',
  `background_color` VARCHAR(7) NULL COMMENT '背景颜色',
  `border_color` VARCHAR(7) NULL COMMENT '边框颜色',
  `tags` JSON NULL COMMENT '标签',
  `metadata` JSON NULL COMMENT '元数据',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `is_featured` TINYINT DEFAULT 0 COMMENT '是否推荐',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL COMMENT '删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_category` (`category`),
  KEY `idx_subcategory` (`subcategory`),
  KEY `idx_level` (`level`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_position` (`position_x`, `position_y`),
  KEY `idx_map_section` (`map_section`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='技能节点表';

-- 用户技能进度表
DROP TABLE IF EXISTS `user_skill_progress`;
CREATE TABLE `user_skill_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `skill_id` BIGINT UNSIGNED NOT NULL COMMENT '技能ID',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-未解锁，1-已解锁，2-进行中，3-已完成，4-已认证',
  `progress_percentage` DECIMAL(5,2) DEFAULT 0.00 COMMENT '完成百分比',
  `attempts` INT DEFAULT 0 COMMENT '尝试次数',
  `successful_attempts` INT DEFAULT 0 COMMENT '成功次数',
  `best_score` DECIMAL(8,2) NULL COMMENT '最佳成绩',
  `latest_score` DECIMAL(8,2) NULL COMMENT '最新成绩',
  `practice_hours` DECIMAL(6,2) DEFAULT 0.00 COMMENT '练习时长',
  `practice_sessions` INT DEFAULT 0 COMMENT '练习次数',
  `video_submissions` JSON NULL COMMENT '视频提交记录',
  `instructor_feedback` JSON NULL COMMENT '教练反馈',
  `peer_reviews` JSON NULL COMMENT '同伴评价',
  `self_assessment` JSON NULL COMMENT '自我评估',
  `difficulty_rating` TINYINT NULL COMMENT '难度评分：1-5',
  `notes` TEXT NULL COMMENT '个人笔记',
  `milestones` JSON NULL COMMENT '里程碑记录',
  `unlocked_at` TIMESTAMP NULL COMMENT '解锁时间',
  `started_at` TIMESTAMP NULL COMMENT '开始时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  `certified_at` TIMESTAMP NULL COMMENT '认证时间',
  `certified_by` BIGINT UNSIGNED NULL COMMENT '认证教练ID',
  `certification_level` ENUM('bronze', 'silver', 'gold', 'platinum') NULL COMMENT '认证等级',
  `certification_score` DECIMAL(5,2) NULL COMMENT '认证分数',
  `certification_notes` TEXT NULL COMMENT '认证备注',
  `certification_video` VARCHAR(500) NULL COMMENT '认证视频',
  `certification_expires_at` TIMESTAMP NULL COMMENT '认证过期时间',
  `last_practiced_at` TIMESTAMP NULL COMMENT '最后练习时间',
  `reminder_count` INT DEFAULT 0 COMMENT '提醒次数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_skill` (`user_id`, `skill_id`),
  KEY `idx_skill_id` (`skill_id`),
  KEY `idx_status` (`status`),
  KEY `idx_certified_by` (`certified_by`),
  KEY `idx_certification_level` (`certification_level`),
  KEY `idx_progress_percentage` (`progress_percentage`),
  KEY `idx_certified_at` (`certified_at`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_user_skill_progress_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_skill_progress_skill_id` FOREIGN KEY (`skill_id`) REFERENCES `skill_nodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_skill_progress_certified_by` FOREIGN KEY (`certified_by`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户技能进度表';

-- ========================================
-- 游戏化系统
-- ========================================

-- 用户积分表
DROP TABLE IF EXISTS `user_points`;
CREATE TABLE `user_points` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `total_points` INT NOT NULL DEFAULT 0 COMMENT '总积分',
  `available_points` INT NOT NULL DEFAULT 0 COMMENT '可用积分',
  `used_points` INT NOT NULL DEFAULT 0 COMMENT '已使用积分',
  `expired_points` INT NOT NULL DEFAULT 0 COMMENT '过期积分',
  `level` INT NOT NULL DEFAULT 1 COMMENT '用户等级',
  `experience` INT NOT NULL DEFAULT 0 COMMENT '经验值',
  `next_level_experience` INT NOT NULL DEFAULT 1000 COMMENT '下一级所需经验',
  `rank` INT NULL COMMENT '排名',
  `rank_updated_at` TIMESTAMP NULL COMMENT '排名更新时间',
  `streak_days` INT NOT NULL DEFAULT 0 COMMENT '连续签到天数',
  `max_streak_days` INT NOT NULL DEFAULT 0 COMMENT '最大连续签到天数',
  `last_checkin` DATE NULL COMMENT '最后签到日期',
  `total_checkins` INT NOT NULL DEFAULT 0 COMMENT '总签到次数',
  `weekly_points` INT NOT NULL DEFAULT 0 COMMENT '本周积分',
  `monthly_points` INT NOT NULL DEFAULT 0 COMMENT '本月积分',
  `yearly_points` INT NOT NULL DEFAULT 0 COMMENT '本年积分',
  `lifetime_points` INT NOT NULL DEFAULT 0 COMMENT '历史总积分',
  `bonus_multiplier` DECIMAL(3,2) DEFAULT 1.00 COMMENT '积分倍数',
  `vip_level` TINYINT DEFAULT 0 COMMENT 'VIP等级',
  `season_points` INT DEFAULT 0 COMMENT '赛季积分',
  `season_rank` INT NULL COMMENT '赛季排名',
  `achievements_count` INT DEFAULT 0 COMMENT '成就数量',
  `badges_count` INT DEFAULT 0 COMMENT '徽章数量',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_level` (`level`),
  KEY `idx_total_points` (`total_points`),
  KEY `idx_rank` (`rank`),
  KEY `idx_season_rank` (`season_rank`),
  KEY `idx_vip_level` (`vip_level`),
  CONSTRAINT `fk_user_points_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分表';

-- 积分记录表
DROP TABLE IF EXISTS `point_transactions`;
CREATE TABLE `point_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL UNIQUE COMMENT '交易UUID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` ENUM('earn', 'spend', 'expired', 'bonus', 'refund', 'penalty') NOT NULL COMMENT '交易类型',
  `points` INT NOT NULL COMMENT '积分数量',
  `source` VARCHAR(50) NOT NULL COMMENT '积分来源',
  `source_id` VARCHAR(100) NULL COMMENT '来源ID',
  `reference_type` VARCHAR(50) NULL COMMENT '关联类型',
  `reference_id` BIGINT UNSIGNED NULL COMMENT '关联ID',
  `description` VARCHAR(200) NULL COMMENT '描述',
  `multiplier` DECIMAL(3,2) DEFAULT 1.00 COMMENT '倍数',
  `bonus_points` INT DEFAULT 0 COMMENT '奖励积分',
  `balance_before` INT NOT NULL COMMENT '变更前余额',
  `balance_after` INT NOT NULL COMMENT '变更后余额',
  `expires_at` TIMESTAMP NULL COMMENT '过期时间',
  `expired_at` TIMESTAMP NULL COMMENT '实际过期时间',
  `is_expired` TINYINT DEFAULT 0 COMMENT '是否已过期',
  `batch_id` VARCHAR(50) NULL COMMENT '批次ID',
  `ip_address` VARCHAR(45) NULL COMMENT 'IP地址',
  `user_agent` TEXT NULL COMMENT '用户代理',
  `metadata` JSON NULL COMMENT '元数据',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_source` (`source`),
  KEY `idx_reference` (`reference_type`, `reference_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_batch_id` (`batch_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_point_transactions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分记录表';

-- ========================================
-- 社交模块
-- ========================================

-- 好友关系表
DROP TABLE IF EXISTS `friendships`;
CREATE TABLE `friendships` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `friend_id` BIGINT UNSIGNED NOT NULL COMMENT '好友ID',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-申请中，1-已接受，2-已拒绝，3-已删除，4-已拉黑',
  `initiator_id` BIGINT UNSIGNED NOT NULL COMMENT '发起者ID',
  `message` VARCHAR(200) NULL COMMENT '申请消息',
  `source` ENUM('search', 'recommendation', 'qr_code', 'phone', 'gym', 'class') NULL COMMENT '添加来源',
  `mutual_friends_count` INT DEFAULT 0 COMMENT '共同好友数',
  `interaction_score` DECIMAL(5,2) DEFAULT 0.00 COMMENT '互动分数',
  `last_interaction_at` TIMESTAMP NULL COMMENT '最后互动时间',
  `requested_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `responded_at` TIMESTAMP NULL COMMENT '响应时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_friendship` (`user_id`, `friend_id`),
  KEY `idx_friend_id` (`friend_id`),
  KEY `idx_status` (`status`),
  KEY `idx_initiator_id` (`initiator_id`),
  KEY `idx_source` (`source`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_friendships_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_friendships_friend_id` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_friendships_initiator_id` FOREIGN KEY (`initiator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友关系表';

-- 动态表
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL UNIQUE COMMENT '动态UUID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` ENUM('text', 'image', 'video', 'workout', 'achievement', 'checkin', 'share') DEFAULT 'text' COMMENT '动态类型',
  `content` TEXT NOT NULL COMMENT '动态内容',
  `images` JSON NULL COMMENT '图片URL列表',
  `videos` JSON NULL COMMENT '视频URL列表',
  `thumbnail` VARCHAR(500) NULL COMMENT '缩略图',
  `location` VARCHAR(100) NULL COMMENT '位置',
  `location_coordinates` JSON NULL COMMENT '位置坐标',
  `gym_id` BIGINT UNSIGNED NULL COMMENT '关联场馆ID',
  `class_id` BIGINT UNSIGNED NULL COMMENT '关联课程ID',
  `workout_data` JSON NULL COMMENT '训练数据',
  `achievement_data` JSON NULL COMMENT '成就数据',
  `hashtags` JSON NULL COMMENT '话题标签',
  `mentions` JSON NULL COMMENT '提及用户',
  `privacy` TINYINT NOT NULL DEFAULT 1 COMMENT '隐私设置：0-私密，1-公开，2-好友可见，3-关注者可见',
  `allow_comments` TINYINT DEFAULT 1 COMMENT '允许评论',
  `allow_shares` TINYINT DEFAULT 1 COMMENT '允许分享',
  `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞数',
  `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '评论数',
  `share_count` INT UNSIGNED DEFAULT 0 COMMENT '分享数',
  `view_count` INT UNSIGNED DEFAULT 0 COMMENT '浏览数',
  `save_count` INT UNSIGNED DEFAULT 0 COMMENT '收藏数',
  `report_count` INT UNSIGNED DEFAULT 0 COMMENT '举报数',
  `engagement_score` DECIMAL(8,2) DEFAULT 0.00 COMMENT '互动分数',
  `trending_score` DECIMAL(8,2) DEFAULT 0.00 COMMENT '热度分数',
  `quality_score` DECIMAL(5,2) DEFAULT 0.00 COMMENT '质量分数',
  `is_featured` TINYINT DEFAULT 0 COMMENT '是否推荐',
  `is_pinned` TINYINT DEFAULT 0 COMMENT '是否置顶',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
  `is_blocked` TINYINT DEFAULT 0 COMMENT '是否屏蔽',
  `deleted_reason` VARCHAR(200) NULL COMMENT '删除原因',
  `moderation_status` ENUM('pending', 'approved', 'rejected', 'flagged') DEFAULT 'approved' COMMENT '审核状态',
  `moderated_at` TIMESTAMP NULL COMMENT '审核时间',
  `moderated_by` BIGINT UNSIGNED NULL COMMENT '审核员ID',
  `scheduled_at` TIMESTAMP NULL COMMENT '定时发布时间',
  `published_at` TIMESTAMP NULL COMMENT '发布时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_uuid` (`uuid`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_gym_id` (`gym_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_privacy` (`privacy`),
  KEY `idx_is_deleted` (`is_deleted`),
  KEY `idx_is_featured` (`is_featured`),
  KEY `idx_moderation_status` (`moderation_status`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_posts_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_posts_gym_id` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_posts_class_id` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='动态表';

-- ========================================
-- 系统配置表
-- ========================================

-- 系统配置表
DROP TABLE IF EXISTS `system_configs`;
CREATE TABLE `system_configs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `config_value` LONGTEXT NULL COMMENT '配置值',
  `config_type` ENUM('string', 'integer', 'float', 'boolean', 'json', 'text') NOT NULL DEFAULT 'string' COMMENT '配置类型',
  `category` VARCHAR(50) NOT NULL DEFAULT 'general' COMMENT '配置分类',
  `description` VARCHAR(200) NULL COMMENT '配置描述',
  `is_public` TINYINT NOT NULL DEFAULT 0 COMMENT '是否公开',
  `is_readonly` TINYINT NOT NULL DEFAULT 0 COMMENT '是否只读',
  `validation_rule` VARCHAR(200) NULL COMMENT '验证规则',
  `default_value` TEXT NULL COMMENT '默认值',
  `options` JSON NULL COMMENT '可选值',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`),
  KEY `idx_category` (`category`),
  KEY `idx_is_public` (`is_public`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ========================================
-- 创建索引优化
-- ========================================

-- 添加额外的复合索引
ALTER TABLE `users` ADD INDEX `idx_status_created` (`status`, `created_at`);
ALTER TABLE `gyms` ADD INDEX `idx_city_status` (`city`, `status`);
ALTER TABLE `classes` ADD INDEX `idx_gym_start_time` (`gym_id`, `start_time`);
ALTER TABLE `bookings` ADD INDEX `idx_user_status` (`user_id`, `status`);
ALTER TABLE `user_skill_progress` ADD INDEX `idx_user_status` (`user_id`, `status`);
ALTER TABLE `posts` ADD INDEX `idx_user_created` (`user_id`, `created_at`);

-- ========================================
-- 触发器创建
-- ========================================

-- 用户积分更新触发器
DELIMITER $$
CREATE TRIGGER `tr_user_points_update` 
AFTER INSERT ON `point_transactions`
FOR EACH ROW
BEGIN
    UPDATE `user_points` 
    SET 
        `total_points` = `total_points` + NEW.points,
        `available_points` = CASE 
            WHEN NEW.type IN ('earn', 'bonus', 'refund') THEN `available_points` + NEW.points
            WHEN NEW.type IN ('spend', 'expired', 'penalty') THEN `available_points` - NEW.points
            ELSE `available_points`
        END,
        `used_points` = CASE 
            WHEN NEW.type = 'spend' THEN `used_points` + NEW.points
            ELSE `used_points`
        END,
        `expired_points` = CASE 
            WHEN NEW.type = 'expired' THEN `expired_points` + NEW.points
            ELSE `expired_points`
        END,
        `updated_at` = CURRENT_TIMESTAMP
    WHERE `user_id` = NEW.user_id;
END$$
DELIMITER ;

-- 课程参与人数更新触发器
DELIMITER $$
CREATE TRIGGER `tr_class_participants_insert` 
AFTER INSERT ON `bookings`
FOR EACH ROW
BEGIN
    IF NEW.status IN (1, 2, 3, 4) THEN
        UPDATE `classes` 
        SET `current_participants` = `current_participants` + NEW.participants
        WHERE `id` = NEW.class_id;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `tr_class_participants_update` 
AFTER UPDATE ON `bookings`
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        -- 如果从有效状态变为无效状态
        IF OLD.status IN (1, 2, 3, 4) AND NEW.status NOT IN (1, 2, 3, 4) THEN
            UPDATE `classes` 
            SET `current_participants` = `current_participants` - OLD.participants
            WHERE `id` = OLD.class_id;
        END IF;
        
        -- 如果从无效状态变为有效状态
        IF OLD.status NOT IN (1, 2, 3, 4) AND NEW.status IN (1, 2, 3, 4) THEN
            UPDATE `classes` 
            SET `current_participants` = `current_participants` + NEW.participants
            WHERE `id` = NEW.class_id;
        END IF;
    END IF;
END$$
DELIMITER ;

-- ========================================
-- 插入默认系统配置
-- ========================================

INSERT INTO `system_configs` (`config_key`, `config_value`, `config_type`, `category`, `description`, `is_public`) VALUES
('app_name', 'MobiLiF', 'string', 'general', '应用名称', 1),
('app_version', '1.0.0', 'string', 'general', '应用版本', 1),
('app_description', 'MobiLiF - 移动健身游戏化社交平台', 'string', 'general', '应用描述', 1),
('maintenance_mode', '0', 'boolean', 'system', '维护模式', 0),
('registration_enabled', '1', 'boolean', 'user', '是否允许注册', 0),
('email_verification_required', '1', 'boolean', 'user', '是否需要邮箱验证', 0),
('phone_verification_required', '1', 'boolean', 'user', '是否需要手机验证', 0),
('max_file_size', '10485760', 'integer', 'upload', '最大文件大小(字节)', 0),
('allowed_file_types', '["jpg","jpeg","png","gif","webp","mp4","mov","avi"]', 'json', 'upload', '允许的文件类型', 0),
('max_upload_files', '9', 'integer', 'upload', '最大上传文件数', 0),
('points_daily_checkin', '10', 'integer', 'gamification', '每日签到积分', 0),
('points_complete_class', '50', 'integer', 'gamification', '完成课程积分', 0),
('points_skill_certification', '100', 'integer', 'gamification', '技能认证积分', 0),
('points_friend_referral', '200', 'integer', 'gamification', '好友推荐积分', 0),
('level_exp_base', '1000', 'integer', 'gamification', '基础升级经验', 0),
('level_exp_multiplier', '1.5', 'float', 'gamification', '升级经验倍数', 0),
('booking_advance_days', '7', 'integer', 'booking', '预约提前天数', 0),
('booking_cancel_hours', '2', 'integer', 'booking', '取消预约小时数', 0),
('class_reminder_hours', '24', 'integer', 'booking', '课程提醒小时数', 0),
('friend_limit', '1000', 'integer', 'social', '好友数量限制', 0),
('post_content_max_length', '2000', 'integer', 'social', '动态内容最大长度', 0),
('comment_max_length', '500', 'integer', 'social', '评论最大长度', 0);

-- ========================================
-- 创建视图
-- ========================================

-- 用户统计视图
CREATE OR REPLACE VIEW `v_user_stats` AS
SELECT 
    u.id,
    u.uuid,
    u.nickname,
    u.avatar,
    u.fitness_level,
    up.level,
    up.total_points,
    up.rank,
    up.streak_days,
    (SELECT COUNT(*) FROM user_skill_progress usp WHERE usp.user_id = u.id AND usp.status = 4) as certified_skills,
    (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id AND b.status = 4) as completed_classes,
    (SELECT COUNT(*) FROM friendships f WHERE (f.user_id = u.id OR f.friend_id = u.id) AND f.status = 1) as friends_count,
    u.created_at
FROM users u
LEFT JOIN user_points up ON u.id = up.user_id
WHERE u.status = 1 AND u.deleted_at IS NULL;

-- 热门课程视图
CREATE OR REPLACE VIEW `v_popular_classes` AS
SELECT 
    c.id,
    c.uuid,
    c.name,
    c.type,
    c.level,
    c.duration,
    c.price,
    g.name as gym_name,
    t.name as trainer_name,
    (SELECT COUNT(*) FROM bookings b WHERE b.class_id = c.id AND b.status IN (1,2,3,4)) as total_bookings,
    (SELECT AVG(b.rating) FROM bookings b WHERE b.class_id = c.id AND b.rating IS NOT NULL) as avg_rating,
    c.start_time,
    c.end_time,
    c.status
FROM classes c
JOIN gyms g ON c.gym_id = g.id
JOIN trainers t ON c.trainer_id = t.id
WHERE c.status = 1 AND c.deleted_at IS NULL
ORDER BY total_bookings DESC, avg_rating DESC;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 初始化完成
-- ========================================
SELECT 'MobiLiF数据库初始化完成！' as message;