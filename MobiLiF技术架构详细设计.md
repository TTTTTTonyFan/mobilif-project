# MobiLiF拓练 技术架构详细设计

## 1. 技术架构方案

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          前端层                                  │
├─────────────────────────┬───────────────────────────────────────┤
│    微信小程序            │         Web管理后台                    │
│  (原生小程序开发)        │      (Vue 3 + Element Plus)          │
│  - 用户端主要入口        │      - B端场馆管理                     │
│  - 场馆预约             │      - 数据统计分析                     │
│  - 技能地图             │      - 内容审核                         │
│  - 社交互动             │      - 系统配置                         │
└─────────────────────────┴───────────────────────────────────────┘
                          │
                    HTTPS / WebSocket
                          │
┌─────────────────────────────────────────────────────────────────┐
│                        网关层                                    │
│                   Nginx + Kong                                  │
│  - SSL终结          - 路由转发        - 限流熔断                │
│  - 负载均衡        - 认证鉴权        - 日志记录                │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────────┐
│                      微服务层                                    │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ 用户服务     │ 场馆服务     │ 预约服务     │ 游戏化服务        │
│ user-service │ gym-service  │ booking-svc  │ game-service      │
│ - 用户注册   │ - 场馆管理   │ - 课程预约   │ - 积分系统        │
│ - 认证授权   │ - 教练管理   │ - 支付处理   │ - 技能地图        │
│ - 个人资料   │ - 课程发布   │ - 订单管理   │ - 成就系统        │
├──────────────┼──────────────┼──────────────┼───────────────────┤
│ 社交服务     │ 通知服务     │ 内容服务     │ 数据服务          │
│ social-svc   │ notify-svc   │ content-svc  │ analytics-svc     │
│ - 好友关系   │ - 推送通知   │ - WOD管理    │ - 数据统计        │
│ - 动态发布   │ - 短信邮件   │ - 内容审核   │ - 报表生成        │
│ - 评论互动   │ - 站内消息   │ - 素材管理   │ - 用户画像        │
└──────────────┴──────────────┴──────────────┴───────────────────┘
                          │
┌─────────────────────────────────────────────────────────────────┐
│                      中间件层                                    │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│ 消息队列    │ 缓存服务    │ 搜索引擎    │ 配置中心            │
│ RocketMQ    │ Redis       │ ES          │ Nacos               │
│ - 异步消息  │ - 热点缓存  │ - 全文搜索  │ - 配置管理          │
│ - 事件驱动  │ - 会话存储  │ - 地理位置  │ - 服务发现          │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────────┐
│                      数据存储层                                  │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│ 主数据库    │ 缓存数据库  │ 对象存储    │ 时序数据库          │
│ MySQL 8.0   │ Redis 7.0   │ 阿里云OSS   │ InfluxDB 2.0        │
│ - 业务数据  │ - 热点数据  │ - 图片视频  │ - 训练数据          │
│ - 主从分离  │ - 会话缓存  │ - 静态资源  │ - 监控指标          │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
```

### 1.2 技术选型详解

#### 前端技术栈

**微信小程序**
```json
{
  "framework": "原生小程序",
  "language": "TypeScript",
  "stateManagement": "MobX",
  "uiComponents": "Vant Weapp",
  "build": "miniprogram-build",
  "testing": "miniprogram-simulate"
}
```

**Web管理后台**
```json
{
  "framework": "Vue 3.3+",
  "language": "TypeScript 5.0",
  "uiLibrary": "Element Plus",
  "stateManagement": "Pinia",
  "router": "Vue Router 4",
  "httpClient": "Axios",
  "charts": "ECharts 5.0",
  "buildTool": "Vite 4.0"
}
```

#### 后端技术栈

**微服务框架**
```json
{
  "language": "Node.js 18 LTS",
  "framework": "NestJS 10.0",
  "typeSystem": "TypeScript 5.0",
  "database": "TypeORM 0.3",
  "validation": "class-validator",
  "swagger": "swagger-ui-express",
  "testing": "Jest + Supertest"
}
```

**基础设施**
```json
{
  "container": "Docker",
  "orchestration": "Kubernetes",
  "serviceRegistry": "Nacos",
  "apiGateway": "Kong",
  "messageQueue": "RocketMQ",
  "cache": "Redis Cluster",
  "database": "MySQL 8.0",
  "monitoring": "Prometheus + Grafana",
  "logging": "ELK Stack"
}
```

### 1.3 阿里云部署架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     阿里云基础设施                               │
├─────────────────────────────────────────────────────────────────┤
│                        网络层                                    │
│  VPC(专有网络) + ECS(云服务器) + SLB(负载均衡)                  │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────────┐
│                      容器服务层                                  │
│                   ACK (容器服务)                                 │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │ Namespace1  │ Namespace2  │ Namespace3  │ Namespace4      │  │
│  │ user-svc    │ gym-svc     │ booking-svc │ game-svc        │  │
│  │ social-svc  │ notify-svc  │ content-svc │ analytics-svc   │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────────────┐
│                      数据服务层                                  │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │ RDS MySQL   │ Redis集群   │ 对象存储OSS │ Elasticsearch   │  │
│  │ - 主从分离  │ - 分片集群  │ - CDN加速   │ - 日志分析      │  │
│  │ - 读写分离  │ - 高可用    │ - 全球节点  │ - 全文搜索      │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**具体配置**
```yaml
# ACK集群配置
cluster:
  name: mobilif-production
  version: 1.24.6-aliyun.1
  nodes:
    master: 3 # 高可用主节点
    worker: 6 # 工作节点（可扩展）
  nodeType: ecs.c6.2xlarge # 8核16G
  networkPlugin: Terway
  
# RDS配置
database:
  engine: MySQL 8.0
  instance: rds.mysql.c1.large # 4核8G
  storage: 500GB SSD
  backup: 自动备份7天
  readReplicas: 2 # 只读实例
  
# Redis配置
cache:
  engine: Redis 7.0
  mode: cluster # 集群模式
  nodes: 6 # 3主3从
  memory: 16GB per node
  
# OSS配置
storage:
  bucket: mobilif-assets
  cdn: enabled
  redundancy: LRS # 本地冗余
```

## 2. 数据库结构设计

### 2.1 用户体系表

#### 用户主表
```sql
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `union_id` VARCHAR(100) UNIQUE COMMENT '微信UnionID',
  `open_id` VARCHAR(100) UNIQUE COMMENT '微信OpenID',
  `phone` VARCHAR(20) UNIQUE COMMENT '手机号',
  `nickname` VARCHAR(50) NOT NULL COMMENT '昵称',
  `avatar_url` VARCHAR(500) COMMENT '头像URL',
  `real_name` VARCHAR(50) COMMENT '真实姓名',
  `gender` ENUM('male','female','unknown') DEFAULT 'unknown' COMMENT '性别',
  `birth_date` DATE COMMENT '出生日期',
  `city_code` VARCHAR(10) COMMENT '城市编码',
  `city_name` VARCHAR(50) COMMENT '城市名称',
  `province` VARCHAR(50) COMMENT '省份',
  `country` VARCHAR(50) DEFAULT 'CN' COMMENT '国家',
  `language` VARCHAR(10) DEFAULT 'zh-CN' COMMENT '语言偏好',
  `timezone` VARCHAR(50) DEFAULT 'Asia/Shanghai' COMMENT '时区',
  `status` ENUM('active','inactive','banned') DEFAULT 'active' COMMENT '状态',
  `source` ENUM('wechat','phone','admin') DEFAULT 'wechat' COMMENT '注册来源',
  `last_login_at` DATETIME COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(45) COMMENT '最后登录IP',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_union_id` (`union_id`),
  UNIQUE KEY `uk_open_id` (`open_id`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_city_status` (`city_code`, `status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户主表';

-- 用户运动档案表
CREATE TABLE `user_fitness_profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '档案ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `crossfit_level` ENUM('beginner','intermediate','advanced','elite') DEFAULT 'beginner' COMMENT 'CrossFit等级',
  `experience_months` INT DEFAULT 0 COMMENT '经验月数',
  `training_frequency` INT DEFAULT 0 COMMENT '每周训练次数',
  `height_cm` DECIMAL(5,2) COMMENT '身高(cm)',
  `weight_kg` DECIMAL(5,2) COMMENT '体重(kg)',
  `body_fat_rate` DECIMAL(4,2) COMMENT '体脂率(%)',
  `training_goals` JSON COMMENT '训练目标',
  `injury_history` JSON COMMENT '伤病史',
  `emergency_contact` JSON COMMENT '紧急联系人',
  `medical_conditions` TEXT COMMENT '健康状况',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  CONSTRAINT `fk_fitness_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户运动档案表';

-- 用户设备表
CREATE TABLE `user_devices` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '设备ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `device_id` VARCHAR(100) NOT NULL COMMENT '设备唯一标识',
  `platform` ENUM('wechat','ios','android','web') NOT NULL COMMENT '平台类型',
  `device_model` VARCHAR(100) COMMENT '设备型号',
  `os_version` VARCHAR(50) COMMENT '系统版本',
  `app_version` VARCHAR(50) COMMENT 'APP版本',
  `push_token` VARCHAR(500) COMMENT '推送Token',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否活跃',
  `last_active_at` DATETIME COMMENT '最后活跃时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_device_id` (`device_id`),
  KEY `idx_user_platform` (`user_id`, `platform`),
  CONSTRAINT `fk_device_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户设备表';
```

### 2.2 场馆管理表

#### 场馆基础表
```sql
-- 场馆表
CREATE TABLE `gyms` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '场馆ID',
  `name` VARCHAR(100) NOT NULL COMMENT '场馆名称',
  `name_en` VARCHAR(100) COMMENT '英文名称',
  `brand_id` BIGINT UNSIGNED COMMENT '品牌ID',
  `business_license` VARCHAR(100) COMMENT '营业执照号',
  `legal_person` VARCHAR(50) COMMENT '法人代表',
  `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `contact_email` VARCHAR(100) COMMENT '联系邮箱',
  `wechat_account` VARCHAR(50) COMMENT '微信号',
  `address` VARCHAR(500) NOT NULL COMMENT '详细地址',
  `latitude` DECIMAL(10,8) NOT NULL COMMENT '纬度',
  `longitude` DECIMAL(11,8) NOT NULL COMMENT '经度',
  `geohash` VARCHAR(20) COMMENT 'GeoHash编码',
  `province` VARCHAR(50) NOT NULL COMMENT '省份',
  `city` VARCHAR(50) NOT NULL COMMENT '城市',
  `district` VARCHAR(50) COMMENT '区县',
  `area_code` VARCHAR(10) COMMENT '区域编码',
  `cover_image` VARCHAR(500) COMMENT '封面图',
  `images` JSON COMMENT '场馆图片',
  `description` TEXT COMMENT '场馆描述',
  `facilities` JSON COMMENT '设施设备',
  `services` JSON COMMENT '服务项目',
  `business_hours` JSON COMMENT '营业时间',
  `parking_info` VARCHAR(200) COMMENT '停车信息',
  `transportation` TEXT COMMENT '交通信息',
  `price_range` VARCHAR(50) COMMENT '价格区间',
  `trial_price` DECIMAL(10,2) COMMENT '体验价格',
  `rating` DECIMAL(2,1) DEFAULT 0.0 COMMENT '评分',
  `rating_count` INT DEFAULT 0 COMMENT '评价数量',
  `member_count` INT DEFAULT 0 COMMENT '会员数量',
  `verification_status` ENUM('pending','verified','rejected') DEFAULT 'pending' COMMENT '认证状态',
  `verified_at` DATETIME COMMENT '认证时间',
  `status` ENUM('active','inactive','closed') DEFAULT 'active' COMMENT '营业状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_location` (`latitude`, `longitude`),
  KEY `idx_geohash` (`geohash`),
  KEY `idx_city_status` (`city`, `status`),
  KEY `idx_rating` (`rating` DESC),
  FULLTEXT KEY `ft_name` (`name`, `name_en`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场馆表';

-- 场馆管理员表
CREATE TABLE `gym_managers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `gym_id` BIGINT UNSIGNED NOT NULL COMMENT '场馆ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `role` ENUM('owner','manager','staff') DEFAULT 'staff' COMMENT '角色',
  `permissions` JSON COMMENT '权限配置',
  `status` ENUM('active','inactive') DEFAULT 'active' COMMENT '状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_gym_user` (`gym_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_gym_manager_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gym_manager_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场馆管理员表';

-- 教练表
CREATE TABLE `coaches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '教练ID',
  `gym_id` BIGINT UNSIGNED NOT NULL COMMENT '所属场馆ID',
  `user_id` BIGINT UNSIGNED COMMENT '关联用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '教练姓名',
  `name_en` VARCHAR(50) COMMENT '英文名',
  `avatar_url` VARCHAR(500) COMMENT '头像',
  `gender` ENUM('male','female') COMMENT '性别',
  `phone` VARCHAR(20) COMMENT '联系电话',
  `bio` TEXT COMMENT '个人简介',
  `specialties` JSON COMMENT '专长领域',
  `certifications` JSON COMMENT '资质证书',
  `experience_years` INT DEFAULT 0 COMMENT '从业年限',
  `education_background` VARCHAR(200) COMMENT '教育背景',
  `achievements` JSON COMMENT '获奖成就',
  `training_philosophy` TEXT COMMENT '训练理念',
  `languages` JSON COMMENT '语言能力',
  `hourly_rate` DECIMAL(10,2) COMMENT '课时费',
  `rating` DECIMAL(2,1) DEFAULT 0.0 COMMENT '评分',
  `rating_count` INT DEFAULT 0 COMMENT '评价数量',
  `class_count` INT DEFAULT 0 COMMENT '授课次数',
  `status` ENUM('active','inactive','vacation') DEFAULT 'active' COMMENT '状态',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gym_id` (`gym_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_rating` (`rating` DESC),
  CONSTRAINT `fk_coach_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教练表';

-- 课程表
CREATE TABLE `classes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '课程ID',
  `gym_id` BIGINT UNSIGNED NOT NULL COMMENT '场馆ID',
  `coach_id` BIGINT UNSIGNED COMMENT '教练ID',
  `name` VARCHAR(100) NOT NULL COMMENT '课程名称',
  `type` ENUM('wod','weightlifting','gymnastics','cardio','mobility','beginner','private') NOT NULL COMMENT '课程类型',
  `level` ENUM('beginner','intermediate','advanced','all') DEFAULT 'all' COMMENT '难度等级',
  `description` TEXT COMMENT '课程描述',
  `wod_content` TEXT COMMENT 'WOD内容',
  `equipment_needed` JSON COMMENT '所需器材',
  `max_participants` INT NOT NULL DEFAULT 20 COMMENT '最大人数',
  `min_participants` INT DEFAULT 1 COMMENT '最少开课人数',
  `duration_minutes` INT NOT NULL DEFAULT 60 COMMENT '课程时长(分钟)',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单次价格',
  `member_price` DECIMAL(10,2) COMMENT '会员价格',
  `trial_price` DECIMAL(10,2) COMMENT '体验价格',
  `current_bookings` INT DEFAULT 0 COMMENT '当前预约数',
  `waitlist_count` INT DEFAULT 0 COMMENT '候补人数',
  `booking_deadline` DATETIME COMMENT '预约截止时间',
  `cancellation_deadline` DATETIME COMMENT '取消截止时间',
  `status` ENUM('scheduled','ongoing','completed','cancelled') DEFAULT 'scheduled' COMMENT '状态',
  `cancel_reason` VARCHAR(200) COMMENT '取消原因',
  `notes` TEXT COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gym_time` (`gym_id`, `start_time`),
  KEY `idx_coach_time` (`coach_id`, `start_time`),
  KEY `idx_type_level` (`type`, `level`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_class_gym` FOREIGN KEY (`gym_id`) REFERENCES `gyms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';
```

### 2.3 技能地图表

#### 技能体系表
```sql
-- 技能分类表
CREATE TABLE `skill_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `code` VARCHAR(50) NOT NULL COMMENT '分类代码',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `name_en` VARCHAR(100) COMMENT '英文名称',
  `description` TEXT COMMENT '分类描述',
  `icon_url` VARCHAR(500) COMMENT '图标URL',
  `color_theme` VARCHAR(20) COMMENT '主题色',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='技能分类表';

-- 插入基础技能分类
INSERT INTO `skill_categories` (`code`, `name`, `name_en`, `description`, `sort_order`) VALUES
('weightlifting', '举重', 'Weightlifting', '奥林匹克举重和力量训练', 1),
('gymnastics', '体操', 'Gymnastics', '体操技巧和身体控制', 2),
('cardio', '体能', 'Cardio', '心肺功能和耐力训练', 3);

-- 技能节点表
CREATE TABLE `skill_nodes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '技能ID',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
  `parent_id` BIGINT UNSIGNED COMMENT '父技能ID',
  `code` VARCHAR(50) NOT NULL COMMENT '技能代码',
  `name` VARCHAR(100) NOT NULL COMMENT '技能名称',
  `name_en` VARCHAR(100) COMMENT '英文名称',
  `description` TEXT COMMENT '技能描述',
  `level` INT NOT NULL DEFAULT 1 COMMENT '技能等级',
  `max_level` INT NOT NULL DEFAULT 3 COMMENT '最大等级',
  `icon_url` VARCHAR(500) COMMENT '图标URL',
  `demo_video_url` VARCHAR(500) COMMENT '示范视频',
  `tutorial_content` JSON COMMENT '教程内容',
  `requirements` JSON COMMENT '解锁要求',
  `evaluation_criteria` JSON COMMENT '评估标准',
  `point_reward` INT DEFAULT 0 COMMENT '积分奖励',
  `difficulty_score` INT DEFAULT 1 COMMENT '难度系数',
  `prerequisite_skills` JSON COMMENT '前置技能',
  `equipment_needed` JSON COMMENT '所需器材',
  `safety_tips` TEXT COMMENT '安全提示',
  `common_mistakes` JSON COMMENT '常见错误',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code_level` (`code`, `level`),
  KEY `idx_category` (`category_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_level` (`level`),
  CONSTRAINT `fk_skill_category` FOREIGN KEY (`category_id`) REFERENCES `skill_categories` (`id`),
  CONSTRAINT `fk_skill_parent` FOREIGN KEY (`parent_id`) REFERENCES `skill_nodes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='技能节点表';

-- 用户技能进度表
CREATE TABLE `user_skills` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `skill_id` BIGINT UNSIGNED NOT NULL COMMENT '技能ID',
  `current_level` INT DEFAULT 0 COMMENT '当前等级',
  `status` ENUM('locked','available','in_progress','submitted','approved','mastered') DEFAULT 'locked' COMMENT '状态',
  `progress_data` JSON COMMENT '进度数据',
  `best_performance` JSON COMMENT '最佳表现',
  `submission_data` JSON COMMENT '提交数据',
  `video_url` VARCHAR(500) COMMENT '认证视频',
  `submission_time` DATETIME COMMENT '提交时间',
  `review_time` DATETIME COMMENT '审核时间',
  `reviewer_id` BIGINT UNSIGNED COMMENT '审核人ID',
  `review_score` INT COMMENT '审核评分',
  `review_feedback` TEXT COMMENT '审核反馈',
  `approval_time` DATETIME COMMENT '通过时间',
  `practice_count` INT DEFAULT 0 COMMENT '练习次数',
  `last_practice_time` DATETIME COMMENT '最后练习时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_skill` (`user_id`, `skill_id`),
  KEY `idx_status` (`status`),
  KEY `idx_submission_time` (`submission_time`),
  CONSTRAINT `fk_user_skill_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_skill_skill` FOREIGN KEY (`skill_id`) REFERENCES `skill_nodes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户技能进度表';

-- 技能认证记录表
CREATE TABLE `skill_certifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '认证ID',
  `user_skill_id` BIGINT UNSIGNED NOT NULL COMMENT '用户技能ID',
  `certification_no` VARCHAR(32) NOT NULL COMMENT '认证编号',
  `level` INT NOT NULL COMMENT '认证等级',
  `performance_data` JSON NOT NULL COMMENT '表现数据',
  `video_url` VARCHAR(500) COMMENT '认证视频',
  `assessor_id` BIGINT UNSIGNED COMMENT '评估师ID',
  `assessment_score` INT COMMENT '评估分数',
  `assessment_notes` TEXT COMMENT '评估备注',
  `status` ENUM('pending','approved','rejected','expired') DEFAULT 'pending' COMMENT '状态',
  `certified_at` DATETIME COMMENT '认证时间',
  `expires_at` DATETIME COMMENT '过期时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_certification_no` (`certification_no`),
  KEY `idx_user_skill` (`user_skill_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_certification_user_skill` FOREIGN KEY (`user_skill_id`) REFERENCES `user_skills` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='技能认证记录表';
```

### 2.4 积分权益表

#### 积分系统表
```sql
-- 用户积分表
CREATE TABLE `user_points` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '积分ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `total_points` INT NOT NULL DEFAULT 0 COMMENT '累计积分',
  `available_points` INT NOT NULL DEFAULT 0 COMMENT '可用积分',
  `frozen_points` INT NOT NULL DEFAULT 0 COMMENT '冻结积分',
  `used_points` INT NOT NULL DEFAULT 0 COMMENT '已使用积分',
  `expired_points` INT NOT NULL DEFAULT 0 COMMENT '已过期积分',
  `level` ENUM('bronze','silver','gold','platinum','diamond') DEFAULT 'bronze' COMMENT '会员等级',
  `level_points` INT NOT NULL DEFAULT 0 COMMENT '等级积分',
  `level_progress` DECIMAL(5,4) DEFAULT 0.0000 COMMENT '等级进度',
  `next_level_points` INT DEFAULT 500 COMMENT '下级所需积分',
  `last_earned_at` DATETIME COMMENT '最后获得积分时间',
  `last_used_at` DATETIME COMMENT '最后使用积分时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  KEY `idx_level` (`level`),
  KEY `idx_available_points` (`available_points` DESC),
  CONSTRAINT `fk_user_points_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户积分表';

-- 积分流水表
CREATE TABLE `point_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '流水ID',
  `transaction_no` VARCHAR(32) NOT NULL COMMENT '流水号',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `type` ENUM('earn','spend','freeze','unfreeze','expire','adjust') NOT NULL COMMENT '交易类型',
  `amount` INT NOT NULL COMMENT '积分数量',
  `balance_before` INT NOT NULL COMMENT '变更前余额',
  `balance_after` INT NOT NULL COMMENT '变更后余额',
  `source_type` VARCHAR(50) NOT NULL COMMENT '来源类型',
  `source_id` VARCHAR(64) COMMENT '来源ID',
  `business_type` VARCHAR(50) COMMENT '业务类型',
  `description` VARCHAR(200) NOT NULL COMMENT '描述',
  `extra_data` JSON COMMENT '扩展数据',
  `expire_time` DATETIME COMMENT '过期时间',
  `status` ENUM('pending','completed','failed','cancelled') DEFAULT 'completed' COMMENT '状态',
  `operator_id` BIGINT UNSIGNED COMMENT '操作人ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_transaction_no` (`transaction_no`),
  KEY `idx_user_type` (`user_id`, `type`),
  KEY `idx_source` (`source_type`, `source_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_expire_time` (`expire_time`),
  CONSTRAINT `fk_point_transaction_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分流水表';

-- 积分规则表
CREATE TABLE `point_rules` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '规则ID',
  `code` VARCHAR(50) NOT NULL COMMENT '规则代码',
  `name` VARCHAR(100) NOT NULL COMMENT '规则名称',
  `description` VARCHAR(200) COMMENT '规则描述',
  `type` ENUM('earn','spend') NOT NULL COMMENT '规则类型',
  `trigger_event` VARCHAR(50) NOT NULL COMMENT '触发事件',
  `point_amount` INT NOT NULL COMMENT '积分数量',
  `calculation_formula` VARCHAR(500) COMMENT '计算公式',
  `conditions` JSON COMMENT '触发条件',
  `daily_limit` INT COMMENT '每日限制',
  `weekly_limit` INT COMMENT '每周限制',
  `monthly_limit` INT COMMENT '每月限制',
  `total_limit` INT COMMENT '总限制',
  `user_level_limit` JSON COMMENT '用户等级限制',
  `validity_period` INT COMMENT '有效期(天)',
  `priority` INT DEFAULT 0 COMMENT '优先级',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `start_time` DATETIME COMMENT '开始时间',
  `end_time` DATETIME COMMENT '结束时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_type_event` (`type`, `trigger_event`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分规则表';

-- 权益产品表
CREATE TABLE `benefit_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '权益ID',
  `code` VARCHAR(50) NOT NULL COMMENT '权益代码',
  `name` VARCHAR(100) NOT NULL COMMENT '权益名称',
  `description` TEXT COMMENT '权益描述',
  `type` ENUM('discount','privilege','service','physical','virtual') NOT NULL COMMENT '权益类型',
  `category` VARCHAR(50) COMMENT '权益分类',
  `icon_url` VARCHAR(500) COMMENT '图标URL',
  `image_url` VARCHAR(500) COMMENT '展示图片',
  `point_price` INT NOT NULL COMMENT '积分价格',
  `cash_price` DECIMAL(10,2) COMMENT '现金价格',
  `original_value` DECIMAL(10,2) COMMENT '原价值',
  `discount_rate` DECIMAL(3,2) COMMENT '折扣率',
  `stock_total` INT COMMENT '总库存',
  `stock_available` INT COMMENT '可用库存',
  `exchange_limit_daily` INT COMMENT '每日兑换限制',
  `exchange_limit_monthly` INT COMMENT '每月兑换限制',
  `exchange_limit_total` INT COMMENT '总兑换限制',
  `user_level_requirement` JSON COMMENT '用户等级要求',
  `validity_days` INT DEFAULT 30 COMMENT '有效期(天)',
  `usage_rules` TEXT COMMENT '使用规则',
  `terms_conditions` TEXT COMMENT '条款条件',
  `provider_info` JSON COMMENT '提供方信息',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `is_featured` TINYINT(1) DEFAULT 0 COMMENT '是否推荐',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `start_time` DATETIME COMMENT '开始时间',
  `end_time` DATETIME COMMENT '结束时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_type_category` (`type`, `category`),
  KEY `idx_point_price` (`point_price`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权益产品表';

-- 用户权益表
CREATE TABLE `user_benefits` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `benefit_id` BIGINT UNSIGNED NOT NULL COMMENT '权益ID',
  `order_no` VARCHAR(32) NOT NULL COMMENT '兑换订单号',
  `exchange_time` DATETIME NOT NULL COMMENT '兑换时间',
  `points_cost` INT NOT NULL COMMENT '消费积分',
  `cash_cost` DECIMAL(10,2) DEFAULT 0.00 COMMENT '现金支付',
  `status` ENUM('active','used','expired','cancelled') DEFAULT 'active' COMMENT '状态',
  `activation_time` DATETIME COMMENT '激活时间',
  `expiry_time` DATETIME NOT NULL COMMENT '过期时间',
  `usage_time` DATETIME COMMENT '使用时间',
  `usage_location` VARCHAR(200) COMMENT '使用地点',
  `usage_details` JSON COMMENT '使用详情',
  `coupon_code` VARCHAR(50) COMMENT '优惠券码',
  `verification_code` VARCHAR(20) COMMENT '核销码',
  `notes` TEXT COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  UNIQUE KEY `uk_coupon_code` (`coupon_code`),
  KEY `idx_user_status` (`user_id`, `status`),
  KEY `idx_benefit_id` (`benefit_id`),
  KEY `idx_expiry_time` (`expiry_time`),
  CONSTRAINT `fk_user_benefit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_user_benefit_product` FOREIGN KEY (`benefit_id`) REFERENCES `benefit_products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户权益表';
```

## 3. API接口设计

### 3.1 RESTful API规范

#### API设计原则
```javascript
// 统一的API响应格式
{
  "code": 0,          // 业务状态码
  "message": "success", // 消息
  "data": {},         // 数据
  "timestamp": 1704067200000, // 时间戳
  "requestId": "req_123456",  // 请求ID
  "pagination": {     // 分页信息(列表接口)
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "hasNext": true
  }
}

// URL设计规范
GET    /api/v1/users             // 获取用户列表
GET    /api/v1/users/{id}        // 获取用户详情
POST   /api/v1/users             // 创建用户
PUT    /api/v1/users/{id}        // 更新用户
DELETE /api/v1/users/{id}        // 删除用户

// 嵌套资源
GET    /api/v1/gyms/{gymId}/classes        // 获取场馆课程
POST   /api/v1/gyms/{gymId}/classes        // 创建课程
GET    /api/v1/users/{userId}/skills       // 获取用户技能
```

#### HTTP状态码使用
```javascript
// 成功状态码
200 OK              // 请求成功
201 Created         // 创建成功
204 No Content      // 删除成功

// 客户端错误
400 Bad Request     // 参数错误
401 Unauthorized    // 未认证
403 Forbidden       // 权限不足
404 Not Found       // 资源不存在
409 Conflict        // 资源冲突
422 Unprocessable Entity // 业务逻辑错误

// 服务端错误
500 Internal Server Error // 服务器错误
502 Bad Gateway          // 网关错误
503 Service Unavailable  // 服务不可用
```

### 3.2 用户认证鉴权

#### JWT Token设计
```typescript
// JWT Payload结构
interface JWTPayload {
  sub: string;        // 用户ID
  openId: string;     // 微信OpenID
  unionId?: string;   // 微信UnionID
  role: string;       // 用户角色
  permissions: string[]; // 权限列表
  iat: number;        // 签发时间
  exp: number;        // 过期时间
  jti: string;        // Token唯一标识
}

// Token刷新机制
interface TokenPair {
  accessToken: string;   // 访问令牌(2小时)
  refreshToken: string;  // 刷新令牌(30天)
  expiresIn: number;     // 过期时间
}
```

#### 认证接口设计
```typescript
// 微信登录接口
POST /api/v1/auth/wechat/login
{
  "code": "wx_auth_code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "gender": 1,
    "city": "城市",
    "province": "省份"
  }
}

// 手机号绑定
POST /api/v1/auth/phone/bind
{
  "encryptedData": "加密数据",
  "iv": "初始向量"
}

// Token刷新
POST /api/v1/auth/refresh
{
  "refreshToken": "refresh_token"
}

// 登出
POST /api/v1/auth/logout
// Header: Authorization: Bearer {accessToken}
```

#### 权限控制中间件
```typescript
// 权限验证装饰器
@UseGuards(JwtAuthGuard, PermissionGuard)
@Permissions('gym:manage', 'class:create')
@Controller('gyms')
export class GymController {
  
  @Post(':gymId/classes')
  async createClass(
    @Param('gymId') gymId: string,
    @Body() createClassDto: CreateClassDto,
    @CurrentUser() user: UserEntity
  ) {
    // 验证用户是否有该场馆的管理权限
    return this.gymService.createClass(gymId, createClassDto, user);
  }
}

// 角色权限配置
const ROLE_PERMISSIONS = {
  'user': ['user:read', 'user:write', 'booking:create'],
  'gym_manager': ['gym:manage', 'class:manage', 'booking:manage'],
  'admin': ['*']
};
```

### 3.3 支付接口集成

#### 微信支付集成
```typescript
// 微信支付配置
interface WechatPayConfig {
  appId: string;       // 小程序AppID
  mchId: string;       // 商户号
  apiKey: string;      // API密钥
  certPath: string;    // 证书路径
  notifyUrl: string;   // 回调地址
}

// 统一下单接口
POST /api/v1/payments/wechat/unifiedorder
{
  "body": "课程费用",
  "totalFee": 8000,     // 金额(分)
  "outTradeNo": "ORDER123456",
  "openId": "user_openid",
  "attach": "{\"orderId\":\"20240115001\"}"
}

// 响应数据
{
  "code": 0,
  "data": {
    "timeStamp": "1704067200",
    "nonceStr": "random_string",
    "package": "prepay_id=wx201701101221432217",
    "signType": "RSA",
    "paySign": "signature_string"
  }
}

// 支付回调处理
POST /api/v1/payments/wechat/notify
// 微信支付结果通知
```

#### 支付服务设计
```typescript
@Injectable()
export class PaymentService {
  
  // 创建支付订单
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentEntity> {
    const payment = new PaymentEntity();
    payment.orderNo = this.generateOrderNo();
    payment.amount = createPaymentDto.amount;
    payment.currency = 'CNY';
    payment.status = PaymentStatus.PENDING;
    
    return this.paymentRepository.save(payment);
  }
  
  // 处理支付回调
  async handlePaymentCallback(callbackData: WechatPayCallback): Promise<void> {
    const payment = await this.findByOrderNo(callbackData.out_trade_no);
    
    if (callbackData.result_code === 'SUCCESS') {
      payment.status = PaymentStatus.SUCCESS;
      payment.paidAt = new Date();
      payment.transactionId = callbackData.transaction_id;
      
      // 触发支付成功事件
      this.eventEmitter.emit('payment.success', payment);
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = callbackData.err_code_des;
    }
    
    await this.paymentRepository.save(payment);
  }
}
```

### 3.4 第三方登录

#### 微信小程序登录流程
```typescript
// 小程序登录服务
@Injectable()
export class WechatMiniProgramService {
  
  // 获取微信用户信息
  async login(loginDto: WechatLoginDto): Promise<LoginResponse> {
    // 1. 通过code获取session_key和openid
    const wechatUser = await this.getWechatUserInfo(loginDto.code);
    
    // 2. 查找或创建用户
    let user = await this.userService.findByOpenId(wechatUser.openid);
    if (!user) {
      user = await this.createUserFromWechat(wechatUser, loginDto.userInfo);
    }
    
    // 3. 生成JWT token
    const tokenPair = await this.authService.generateTokenPair(user);
    
    return {
      user: this.userService.toUserResponse(user),
      ...tokenPair
    };
  }
  
  // 绑定手机号
  async bindPhone(bindPhoneDto: BindPhoneDto, user: UserEntity): Promise<void> {
    const phoneNumber = await this.decryptWechatData(
      bindPhoneDto.encryptedData,
      bindPhoneDto.iv,
      user.sessionKey
    );
    
    user.phone = phoneNumber.phoneNumber;
    await this.userService.save(user);
  }
  
  // 解密微信数据
  private async decryptWechatData(encryptedData: string, iv: string, sessionKey: string): Promise<any> {
    const crypto = require('crypto');
    const decipher = crypto.createDecipheriv('aes-128-cbc', 
      Buffer.from(sessionKey, 'base64'), 
      Buffer.from(iv, 'base64')
    );
    
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}
```

#### Apple ID登录(未来扩展)
```typescript
// Apple登录服务
@Injectable()
export class AppleAuthService {
  
  async verifyAppleToken(identityToken: string): Promise<AppleUserInfo> {
    // 验证Apple ID Token
    const decoded = jwt.decode(identityToken, { complete: true });
    
    // 验证签名
    const publicKey = await this.getApplePublicKey(decoded.header.kid);
    const verified = jwt.verify(identityToken, publicKey, {
      audience: this.configService.get('apple.clientId'),
      issuer: 'https://appleid.apple.com'
    });
    
    return {
      sub: verified.sub,
      email: verified.email,
      emailVerified: verified.email_verified
    };
  }
}
```

### 3.5 核心业务接口

#### 场馆相关接口
```typescript
// 场馆控制器
@Controller('gyms')
export class GymController {
  
  // 搜索附近场馆
  @Get('search')
  async searchNearbyGyms(@Query() searchDto: GymSearchDto): Promise<GymListResponse> {
    return this.gymService.searchNearby(searchDto);
  }
  
  // 获取场馆详情
  @Get(':id')
  async getGymDetail(@Param('id') id: string): Promise<GymDetailResponse> {
    return this.gymService.getDetail(id);
  }
  
  // 获取场馆课程
  @Get(':id/classes')
  async getGymClasses(
    @Param('id') gymId: string,
    @Query() query: ClassQueryDto
  ): Promise<ClassListResponse> {
    return this.classService.getByGym(gymId, query);
  }
}

// 预约控制器
@Controller('bookings')
export class BookingController {
  
  // 创建预约
  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: UserEntity
  ): Promise<BookingResponse> {
    return this.bookingService.create(createBookingDto, user);
  }
  
  // 取消预约
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity
  ): Promise<void> {
    return this.bookingService.cancel(id, user);
  }
  
  // 签到
  @Post(':id/checkin')
  @UseGuards(JwtAuthGuard)
  async checkIn(
    @Param('id') id: string,
    @Body() checkInDto: CheckInDto,
    @CurrentUser() user: UserEntity
  ): Promise<CheckInResponse> {
    return this.bookingService.checkIn(id, checkInDto, user);
  }
}
```

#### 技能地图接口
```typescript
// 技能控制器
@Controller('skills')
export class SkillController {
  
  // 获取技能地图概览
  @Get('overview')
  @UseGuards(JwtAuthGuard)
  async getSkillOverview(@CurrentUser() user: UserEntity): Promise<SkillOverviewResponse> {
    return this.skillService.getOverview(user.id);
  }
  
  // 获取技能分类详情
  @Get('categories/:code')
  @UseGuards(JwtAuthGuard)
  async getSkillCategory(
    @Param('code') code: string,
    @CurrentUser() user: UserEntity
  ): Promise<SkillCategoryResponse> {
    return this.skillService.getCategoryDetail(code, user.id);
  }
  
  // 提交技能认证
  @Post('certifications')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async submitCertification(
    @Body() submitDto: SubmitCertificationDto,
    @UploadedFile() video: Express.Multer.File,
    @CurrentUser() user: UserEntity
  ): Promise<CertificationResponse> {
    return this.skillService.submitCertification(submitDto, video, user);
  }
}
```

#### 积分权益接口
```typescript
// 积分控制器
@Controller('points')
export class PointController {
  
  // 获取积分信息
  @Get()
  @UseGuards(JwtAuthGuard)
  async getPointInfo(@CurrentUser() user: UserEntity): Promise<PointInfoResponse> {
    return this.pointService.getUserPointInfo(user.id);
  }
  
  // 获取积分流水
  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getPointTransactions(
    @Query() query: PointTransactionQueryDto,
    @CurrentUser() user: UserEntity
  ): Promise<PointTransactionListResponse> {
    return this.pointService.getTransactions(user.id, query);
  }
  
  // 积分兑换权益
  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  async redeemBenefit(
    @Body() redeemDto: RedeemBenefitDto,
    @CurrentUser() user: UserEntity
  ): Promise<RedeemResponse> {
    return this.benefitService.redeem(redeemDto, user);
  }
}

// 权益控制器
@Controller('benefits')
export class BenefitController {
  
  // 获取权益商城
  @Get('mall')
  async getBenefitMall(@Query() query: BenefitQueryDto): Promise<BenefitMallResponse> {
    return this.benefitService.getMall(query);
  }
  
  // 获取用户权益
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getUserBenefits(
    @Query() query: UserBenefitQueryDto,
    @CurrentUser() user: UserEntity
  ): Promise<UserBenefitListResponse> {
    return this.benefitService.getUserBenefits(user.id, query);
  }
}
```

## 4. 部署配置

### 4.1 Docker配置

#### Dockerfile示例
```dockerfile
# Node.js应用Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  # API网关
  kong:
    image: kong:3.0-alpine
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: postgres
      KONG_PG_DATABASE: kong
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: kong123
    ports:
      - "8000:8000"
      - "8443:8443"
      - "8001:8001"
      - "8444:8444"
    depends_on:
      - postgres
    networks:
      - mobilif-network

  # 用户服务
  user-service:
    build:
      context: ./services/user-service
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: mysql-master
      DB_PORT: 3306
      DB_USERNAME: mobilif
      DB_PASSWORD: mobilif123
      DB_DATABASE: mobilif_user
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - mysql-master
      - redis
    networks:
      - mobilif-network

  # 场馆服务
  gym-service:
    build:
      context: ./services/gym-service
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: mysql-master
      DB_DATABASE: mobilif_gym
    depends_on:
      - mysql-master
      - redis
    networks:
      - mobilif-network

  # MySQL主库
  mysql-master:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: mobilif
      MYSQL_USER: mobilif
      MYSQL_PASSWORD: mobilif123
    volumes:
      - mysql-master-data:/var/lib/mysql
      - ./configs/mysql/master.cnf:/etc/mysql/conf.d/master.cnf
    ports:
      - "3306:3306"
    networks:
      - mobilif-network

  # MySQL从库
  mysql-slave:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: mobilif
      MYSQL_USER: mobilif
      MYSQL_PASSWORD: mobilif123
    volumes:
      - mysql-slave-data:/var/lib/mysql
      - ./configs/mysql/slave.cnf:/etc/mysql/conf.d/slave.cnf
    depends_on:
      - mysql-master
    networks:
      - mobilif-network

  # Redis集群
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - mobilif-network

volumes:
  mysql-master-data:
  mysql-slave-data:
  redis-data:

networks:
  mobilif-network:
    driver: bridge
```

### 4.2 Kubernetes配置

#### 服务部署配置
```yaml
# user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: mobilif
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: registry.cn-beijing.aliyuncs.com/mobilif/user-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: db.host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db.password
        resources:
          requests:
            memory: "512Mi"
            cpu: "200m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: mobilif
spec:
  selector:
    app: user-service
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

#### ConfigMap和Secret配置
```yaml
# app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: mobilif
data:
  db.host: "rm-bp1xxx.mysql.rds.aliyuncs.com"
  db.port: "3306"
  redis.host: "r-bp1xxx.redis.rds.aliyuncs.com"
  redis.port: "6379"
  jwt.issuer: "mobilif.com"

---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: mobilif
type: Opaque
data:
  db.password: bW9iaWxpZjEyMw== # base64编码
  redis.password: cmVkaXMxMjM=
  jwt.secret: and0X3NlY3JldF9rZXk=
  wechat.appSecret: d3hfc2VjcmV0
```

### 4.3 阿里云ACK部署配置

#### 集群创建配置
```yaml
# cluster-config.yaml
apiVersion: cs.alibabacloud.com/v1
kind: Cluster
metadata:
  name: mobilif-production
spec:
  clusterType: ManagedKubernetes
  kubernetesVersion: 1.24.6-aliyun.1
  region: cn-beijing
  vpcId: vpc-bp1xxxxx
  vswitchIds:
    - vsw-bp1xxxxx
    - vsw-bp2xxxxx
  nodePools:
    - name: worker-pool
      instanceTypes: 
        - ecs.c6.2xlarge
      scalingConfig:
        minSize: 3
        maxSize: 10
        desiredCapacity: 6
      systemDiskCategory: cloud_essd
      systemDiskSize: 120
      dataDisks:
        - category: cloud_essd
          size: 200
          encrypted: true
  addons:
    - name: terway-eniip
    - name: csi-plugin
    - name: csi-provisioner
    - name: nginx-ingress-controller
    - name: ack-node-problem-detector
```

#### Ingress配置
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mobilif-ingress
  namespace: mobilif
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.mobilif.com
    secretName: mobilif-tls
  rules:
  - host: api.mobilif.com
    http:
      paths:
      - path: /api/v1/users
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 80
      - path: /api/v1/gyms
        pathType: Prefix
        backend:
          service:
            name: gym-service
            port:
              number: 80
      - path: /api/v1/bookings
        pathType: Prefix
        backend:
          service:
            name: booking-service
            port:
              number: 80
```

### 4.4 监控和日志配置

#### Prometheus监控配置
```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
    
    - job_name: 'mobilif-services'
      static_configs:
      - targets:
        - user-service:3000
        - gym-service:3000
        - booking-service:3000
```

这套完整的技术架构方案为MobiLiF提供了：

1. **可扩展的微服务架构** - 支持业务快速迭代
2. **完整的数据库设计** - 覆盖所有核心业务场景  
3. **标准化的API接口** - 确保前后端高效协作
4. **云原生部署方案** - 利用阿里云ACK实现高可用
5. **完善的监控体系** - 保障服务稳定运行

整个方案充分考虑了MobiLiF作为CrossFit游戏化社交平台的特殊需求，通过合理的技术选型和架构设计，确保系统能够支撑大规模用户访问和复杂的业务逻辑。