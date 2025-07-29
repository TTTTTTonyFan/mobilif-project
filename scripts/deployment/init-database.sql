-- MobiLiF数据库初始化脚本
-- 创建数据库、用户和基础表结构

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `mobilif` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `mobilif`;

-- 创建用户和权限
CREATE USER IF NOT EXISTS 'mobilif_user'@'%' IDENTIFIED BY 'MobiLiF@2025!';
GRANT ALL PRIVILEGES ON mobilif.* TO 'mobilif_user'@'%';

-- 创建只读用户（用于从库）
CREATE USER IF NOT EXISTS 'mobilif_readonly'@'%' IDENTIFIED BY 'MobiLiF@2025!';
GRANT SELECT ON mobilif.* TO 'mobilif_readonly'@'%';

FLUSH PRIVILEGES;

-- ========================================
-- 用户模块表结构
-- ========================================

-- 用户基础信息表
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `union_id` VARCHAR(100) NULL UNIQUE COMMENT '微信UnionID',
  `open_id` VARCHAR(100) NULL UNIQUE COMMENT '微信OpenID',
  `phone` VARCHAR(20) NULL UNIQUE COMMENT '手机号',
  `email` VARCHAR(100) NULL COMMENT '邮箱',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(500) NULL COMMENT '头像URL',
  `gender` TINYINT NOT NULL DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
  `birthday` DATE NULL COMMENT '生日',
  `height` DECIMAL(5,2) NULL COMMENT '身高(cm)',
  `weight` DECIMAL(5,2) NULL COMMENT '体重(kg)',
  `fitness_level` VARCHAR(20) DEFAULT 'beginner' COMMENT '健身水平',
  `bio` TEXT NULL COMMENT '个人简介',
  `location` VARCHAR(100) NULL COMMENT '所在地区',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '用户状态：0-禁用，1-正常',
  `last_login_at` TIMESTAMP NULL COMMENT '最后登录时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_union_id` (`union_id`),
  INDEX `idx_open_id` (`open_id`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';

-- 用户认证表
CREATE TABLE `user_auths` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `auth_type` VARCHAR(20) NOT NULL COMMENT '认证类型：wechat,phone,email',
  `auth_key` VARCHAR(100) NOT NULL COMMENT '认证标识',
  `auth_secret` VARCHAR(200) NULL COMMENT '认证密钥',
  `expires_at` TIMESTAMP NULL COMMENT '过期时间',
  `is_verified` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已验证',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_auth` (`auth_type`, `auth_key`),
  KEY `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户认证表';

-- ========================================
-- 场馆模块表结构
-- ========================================

-- 健身房表
CREATE TABLE `gyms` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '场馆名称',
  `description` TEXT NULL COMMENT '场馆描述',
  `address` VARCHAR(200) NOT NULL COMMENT '详细地址',
  `district` VARCHAR(50) NOT NULL COMMENT '所在区域',
  `city` VARCHAR(50) NOT NULL COMMENT '所在城市',
  `province` VARCHAR(50) NOT NULL COMMENT '所在省份',
  `latitude` DECIMAL(10,7) NOT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) NOT NULL COMMENT '经度',
  `phone` VARCHAR(20) NULL COMMENT '联系电话',
  `email` VARCHAR(100) NULL COMMENT '邮箱',
  `website` VARCHAR(200) NULL COMMENT '官网',
  `images` JSON NULL COMMENT '场馆图片',
  `facilities` JSON NULL COMMENT '设施列表',
  `opening_hours` JSON NOT NULL COMMENT '营业时间',
  `price_range` VARCHAR(50) NULL COMMENT '价格区间',
  `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分',
  `review_count` INT UNSIGNED DEFAULT 0 COMMENT '评价数量',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-停业，1-营业',
  `verified` TINYINT NOT NULL DEFAULT 0 COMMENT '是否认证',
  `owner_id` BIGINT UNSIGNED NULL COMMENT '场馆管理员ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_location` (`city`, `district`),
  KEY `idx_coordinates` (`latitude`, `longitude`),
  KEY `idx_status` (`status`),
  KEY `idx_rating` (`rating`),
  FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='健身房表';

-- 教练表
CREATE TABLE `trainers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `gym_id` BIGINT UNSIGNED NOT NULL COMMENT '所属场馆ID',
  `name` VARCHAR(50) NOT NULL COMMENT '教练姓名',
  `avatar` VARCHAR(500) NULL COMMENT '头像',
  `specialties` JSON NULL COMMENT '专长领域',
  `certifications` JSON NULL COMMENT '认证证书',
  `experience_years` INT NULL COMMENT '从业年限',
  `bio` TEXT NULL COMMENT '个人简介',
  `hourly_rate` DECIMAL(8,2) NULL COMMENT '课时费',
  `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分',
  `review_count` INT UNSIGNED DEFAULT 0 COMMENT '评价数量',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-离职，1-在职',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_gym_id` (`gym_id`),
  KEY `idx_status` (`status`),
  KEY `idx_rating` (`rating`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教练表';

-- ========================================
-- 课程和预约模块
-- ========================================

-- 课程表
CREATE TABLE `classes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `gym_id` BIGINT UNSIGNED NOT NULL COMMENT '场馆ID',
  `trainer_id` BIGINT UNSIGNED NOT NULL COMMENT '教练ID',
  `name` VARCHAR(100) NOT NULL COMMENT '课程名称',
  `description` TEXT NULL COMMENT '课程描述',
  `type` VARCHAR(50) NOT NULL COMMENT '课程类型',
  `level` VARCHAR(20) NOT NULL COMMENT '难度等级',
  `duration` INT NOT NULL COMMENT '课程时长(分钟)',
  `max_participants` INT NOT NULL COMMENT '最大人数',
  `price` DECIMAL(8,2) NOT NULL COMMENT '课程价格',
  `equipment_needed` JSON NULL COMMENT '所需器材',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-取消，1-正常，2-已满',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gym_id` (`gym_id`),
  KEY `idx_trainer_id` (`trainer_id`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`trainer_id`) REFERENCES `trainers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- 预约表
CREATE TABLE `bookings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `class_id` BIGINT UNSIGNED NOT NULL COMMENT '课程ID',
  `booking_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '预约时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-取消，1-预约成功，2-已完成，3-缺席',
  `payment_status` TINYINT NOT NULL DEFAULT 0 COMMENT '支付状态：0-未支付，1-已支付，2-已退款',
  `payment_amount` DECIMAL(8,2) NULL COMMENT '支付金额',
  `payment_method` VARCHAR(20) NULL COMMENT '支付方式',
  `payment_time` TIMESTAMP NULL COMMENT '支付时间',
  `cancel_reason` VARCHAR(200) NULL COMMENT '取消原因',
  `notes` TEXT NULL COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_class` (`user_id`, `class_id`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约表';

-- ========================================
-- 技能地图模块
-- ========================================

-- 技能节点表
CREATE TABLE `skill_nodes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '技能名称',
  `name_en` VARCHAR(100) NULL COMMENT '英文名称',
  `description` TEXT NULL COMMENT '技能描述',
  `category` VARCHAR(50) NOT NULL COMMENT '技能分类',
  `level` TINYINT NOT NULL COMMENT '技能等级：1-5',
  `prerequisites` JSON NULL COMMENT '前置技能ID列表',
  `points_required` INT NOT NULL DEFAULT 0 COMMENT '解锁所需积分',
  `demonstration_video` VARCHAR(500) NULL COMMENT '示范视频URL',
  `tutorial_content` JSON NULL COMMENT '教学内容',
  `verification_criteria` JSON NOT NULL COMMENT '认证标准',
  `position_x` INT NOT NULL COMMENT 'X坐标',
  `position_y` INT NOT NULL COMMENT 'Y坐标',
  `icon` VARCHAR(200) NULL COMMENT '图标URL',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_level` (`level`),
  KEY `idx_position` (`position_x`, `position_y`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='技能节点表';

-- 用户技能进度表
CREATE TABLE `user_skill_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `skill_id` BIGINT UNSIGNED NOT NULL COMMENT '技能ID',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-未解锁，1-进行中，2-已完成，3-已认证',
  `progress_percentage` DECIMAL(5,2) DEFAULT 0.00 COMMENT '完成百分比',
  `attempts` INT DEFAULT 0 COMMENT '尝试次数',
  `best_score` DECIMAL(8,2) NULL COMMENT '最佳成绩',
  `certified_at` TIMESTAMP NULL COMMENT '认证时间',
  `certified_by` BIGINT UNSIGNED NULL COMMENT '认证教练ID',
  `notes` TEXT NULL COMMENT '备注',
  `started_at` TIMESTAMP NULL COMMENT '开始时间',
  `completed_at` TIMESTAMP NULL COMMENT '完成时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_skill` (`user_id`, `skill_id`),
  KEY `idx_status` (`status`),
  KEY `idx_certified_by` (`certified_by`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`skill_id`) REFERENCES `skill_nodes` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`certified_by`) REFERENCES `trainers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户技能进度表';

-- ========================================
-- 游戏化系统
-- ========================================

-- 用户积分表
CREATE TABLE `user_points` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `total_points` INT NOT NULL DEFAULT 0 COMMENT '总积分',
  `available_points` INT NOT NULL DEFAULT 0 COMMENT '可用积分',
  `level` INT NOT NULL DEFAULT 1 COMMENT '用户等级',
  `experience` INT NOT NULL DEFAULT 0 COMMENT '经验值',
  `streak_days` INT NOT NULL DEFAULT 0 COMMENT '连续签到天数',
  `last_checkin` DATE NULL COMMENT '最后签到日期',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_level` (`level`),
  KEY `idx_total_points` (`total_points`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分表';

-- 积分记录表
CREATE TABLE `point_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` VARCHAR(20) NOT NULL COMMENT '交易类型：earn,spend,expired',
  `points` INT NOT NULL COMMENT '积分数量',
  `source` VARCHAR(50) NOT NULL COMMENT '积分来源',
  `reference_id` BIGINT UNSIGNED NULL COMMENT '关联ID',
  `description` VARCHAR(200) NULL COMMENT '描述',
  `expires_at` TIMESTAMP NULL COMMENT '过期时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_source` (`source`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分记录表';

-- ========================================
-- 社交模块
-- ========================================

-- 好友关系表
CREATE TABLE `friendships` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `friend_id` BIGINT UNSIGNED NOT NULL COMMENT '好友ID',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-申请中，1-已接受，2-已拒绝，3-已删除',
  `requested_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `responded_at` TIMESTAMP NULL COMMENT '响应时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_friendship` (`user_id`, `friend_id`),
  KEY `idx_friend_id` (`friend_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友关系表';

-- 动态表
CREATE TABLE `posts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `content` TEXT NOT NULL COMMENT '动态内容',
  `images` JSON NULL COMMENT '图片URL列表',
  `videos` JSON NULL COMMENT '视频URL列表',
  `location` VARCHAR(100) NULL COMMENT '位置',
  `workout_data` JSON NULL COMMENT '训练数据',
  `privacy` TINYINT NOT NULL DEFAULT 1 COMMENT '隐私设置：0-私密，1-公开，2-好友可见',
  `like_count` INT UNSIGNED DEFAULT 0 COMMENT '点赞数',
  `comment_count` INT UNSIGNED DEFAULT 0 COMMENT '评论数',
  `share_count` INT UNSIGNED DEFAULT 0 COMMENT '分享数',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_privacy` (`privacy`),
  KEY `idx_is_deleted` (`is_deleted`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='动态表';

-- ========================================
-- 系统配置表
-- ========================================

-- 系统配置表
CREATE TABLE `system_configs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
  `config_value` TEXT NULL COMMENT '配置值',
  `config_type` VARCHAR(20) NOT NULL DEFAULT 'string' COMMENT '配置类型',
  `description` VARCHAR(200) NULL COMMENT '配置描述',
  `is_public` TINYINT NOT NULL DEFAULT 0 COMMENT '是否公开',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 插入默认系统配置
INSERT INTO `system_configs` (`config_key`, `config_value`, `config_type`, `description`, `is_public`) VALUES
('app_name', 'MobiLiF', 'string', '应用名称', 1),
('app_version', '1.0.0', 'string', '应用版本', 1),
('maintenance_mode', '0', 'boolean', '维护模式', 0),
('max_file_size', '10485760', 'integer', '最大文件大小(字节)', 0),
('allowed_file_types', '["jpg","jpeg","png","gif","mp4","mov"]', 'json', '允许的文件类型', 0);

SET FOREIGN_KEY_CHECKS = 1;