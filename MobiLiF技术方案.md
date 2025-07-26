# MobiLiF拓练 技术方案文档

## 1. 项目概述

### 1.1 产品定位
MobiLiF拓练是一款革命性的运动游戏化社交平台，将全球CrossFit训练场馆连接成统一的虚拟游戏宇宙，让每个运动者都能参与跨地域的实时竞技与社交。

### 1.2 技术愿景
构建一个高性能、可扩展、全球化的运动科技平台，通过先进的技术架构支撑游戏化运动体验，实现"让每座训练场馆成为地球游戏厅的终端机"的产品愿景。

### 1.3 核心技术挑战
- **全球化架构**: 支持多地域部署，低延迟访问
- **实时性能**: 运动数据实时同步，跨地域竞技
- **AI智能**: 动作识别、数据分析、个性化推荐
- **游戏化体验**: 流畅的3D渲染、实时排行榜、成就系统
- **高并发处理**: 支持10万+并发用户，百万级日活

## 2. 技术架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                          客户端层                                │
├─────────────────────────┬───────────────────┬───────────────────┤
│    iOS/Android App      │   Web管理后台     │  微信小程序       │
│  (React Native/Flutter) │  (React + TS)     │  (原生开发)       │
└────────────┬───────────┴───────────────────┴───────────────────┘
             │                    HTTPS/WSS
┌────────────┴────────────────────────────────────────────────────┐
│                          API网关层                               │
│                    (Kong/AWS API Gateway)                        │
│  - 路由转发  - 认证授权  - 限流熔断  - 日志监控                 │
└────────────┬────────────────────────────────────────────────────┘
             │                    
┌────────────┴────────────────────────────────────────────────────┐
│                          微服务层                                │
├─────────────┬─────────────┬─────────────┬──────────────────────┤
│  用户服务   │  场馆服务   │  预约服务   │   游戏化服务         │
│  - 注册登录 │  - 场馆管理 │  - 课程预约 │   - 积分系统        │
│  - 用户信息 │  - 教练管理 │  - 支付处理 │   - 成就系统        │
│  - 认证授权 │  - 课程管理 │  - 订单管理 │   - 技能树          │
├─────────────┼─────────────┼─────────────┼──────────────────────┤
│  社交服务   │  数据服务   │  通知服务   │   AI服务             │
│  - 好友系统 │  - 数据采集 │  - 推送通知 │   - 动作识别        │
│  - 动态分享 │  - 数据分析 │  - 短信邮件 │   - 推荐算法        │
│  - 实时聊天 │  - 报表生成 │  - 站内信   │   - 数据分析        │
└─────────────┴─────────────┴─────────────┴──────────────────────┘
             │                    
┌────────────┴────────────────────────────────────────────────────┐
│                          中间件层                                │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ 消息队列     │  缓存服务    │  搜索引擎    │  配置中心         │
│ (Kafka)      │  (Redis)     │  (ES)        │  (Nacos)          │
└──────────────┴──────────────┴──────────────┴───────────────────┘
             │                    
┌────────────┴────────────────────────────────────────────────────┐
│                          数据存储层                              │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ 关系数据库   │  NoSQL       │  对象存储    │  时序数据库       │
│ (MySQL)      │  (MongoDB)   │  (OSS/S3)    │  (InfluxDB)       │
└──────────────┴──────────────┴──────────────┴───────────────────┘
```

### 2.2 技术栈选型

#### 2.2.1 前端技术栈

**移动端 APP**
- **框架**: React Native 0.72+ / Flutter 3.0+
- **状态管理**: Redux Toolkit / MobX
- **UI组件库**: NativeBase 3.0
- **导航**: React Navigation 6.0
- **网络请求**: Axios + 拦截器
- **WebSocket**: Socket.io-client
- **本地存储**: AsyncStorage / SQLite
- **性能监控**: Sentry
- **热更新**: CodePush

**Web管理后台**
- **框架**: React 18 + TypeScript 5.0
- **UI框架**: Ant Design Pro 5.0
- **状态管理**: Redux Toolkit + RTK Query
- **路由**: React Router 6
- **构建工具**: Vite 4.0
- **图表**: ECharts 5.0
- **表格**: AG-Grid

**微信小程序**
- **框架**: 原生小程序 + TypeScript
- **状态管理**: MobX-miniprogram
- **UI组件**: Vant Weapp
- **网络请求**: wx.request 封装
- **构建工具**: Gulp + Webpack

#### 2.2.2 后端技术栈

**核心框架**
- **语言**: Node.js 18 LTS + TypeScript 5.0
- **Web框架**: NestJS 10.0
- **API文档**: Swagger/OpenAPI 3.0
- **验证**: class-validator
- **ORM**: TypeORM 0.3 / Prisma 5.0
- **任务队列**: Bull (基于Redis)

**微服务基础设施**
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes 1.28
- **服务网格**: Istio
- **API网关**: Kong 3.0
- **服务注册**: Consul / Eureka
- **配置中心**: Apollo / Nacos

**数据存储**
- **主数据库**: MySQL 8.0 (主从复制)
- **缓存**: Redis 7.0 (集群模式)
- **NoSQL**: MongoDB 6.0 (副本集)
- **搜索引擎**: Elasticsearch 8.0
- **对象存储**: 阿里云OSS / AWS S3
- **时序数据**: InfluxDB 2.0

**中间件**
- **消息队列**: Apache Kafka 3.0
- **定时任务**: XXL-JOB
- **分布式事务**: Seata
- **限流熔断**: Sentinel

#### 2.2.3 AI/ML技术栈

- **框架**: TensorFlow.js / PyTorch
- **模型服务**: TensorFlow Serving
- **特征工程**: Apache Spark
- **模型管理**: MLflow
- **推理加速**: ONNX Runtime

#### 2.2.4 运维技术栈

- **CI/CD**: GitLab CI / GitHub Actions
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **链路追踪**: Jaeger / SkyWalking
- **告警**: AlertManager + 钉钉/企业微信

### 2.3 安全架构

#### 2.3.1 认证授权
- **JWT Token**: 用户认证，支持刷新机制
- **OAuth 2.0**: 第三方登录(微信、Apple ID)
- **RBAC**: 基于角色的权限控制
- **API Key**: B端接口认证

#### 2.3.2 数据安全
- **传输加密**: HTTPS/TLS 1.3
- **存储加密**: AES-256加密敏感数据
- **密码安全**: BCrypt + Salt
- **防SQL注入**: 参数化查询
- **XSS防护**: 输入过滤，输出编码

#### 2.3.3 接口安全
- **限流**: 基于IP/用户的请求限制
- **防重放**: 时间戳+Nonce验证
- **签名验证**: HMAC-SHA256
- **黑白名单**: IP/设备指纹

## 3. 数据库设计

### 3.1 核心数据模型

#### 3.1.1 用户体系

```sql
-- 用户主表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    nickname VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(500),
    gender ENUM('male', 'female', 'other'),
    birth_date DATE,
    city VARCHAR(100),
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户认证表
CREATE TABLE user_auth (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    auth_type ENUM('password', 'wechat', 'apple', 'google') NOT NULL,
    identifier VARCHAR(100) NOT NULL,
    credential VARCHAR(500),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_auth (auth_type, identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户运动档案
CREATE TABLE user_fitness_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    crossfit_experience_months INT DEFAULT 0,
    skill_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'beginner',
    training_goals JSON,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3.1.2 场馆体系

```sql
-- 场馆表
CREATE TABLE gyms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    business_hours JSON,
    facilities JSON,
    tags JSON,
    rating DECIMAL(2,1) DEFAULT 0,
    rating_count INT DEFAULT 0,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (latitude, longitude),
    INDEX idx_city (city),
    INDEX idx_status (status),
    FULLTEXT idx_name (name, name_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 教练表
CREATE TABLE coaches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    gym_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    certifications JSON,
    specialties JSON,
    experience_years INT DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    rating_count INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms(id),
    INDEX idx_gym (gym_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 课程表
CREATE TABLE classes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    gym_id BIGINT NOT NULL,
    coach_id BIGINT,
    name VARCHAR(100) NOT NULL,
    type ENUM('wod', 'weightlifting', 'gymnastics', 'conditioning', 'beginner', 'private') NOT NULL,
    description TEXT,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
    start_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    max_capacity INT NOT NULL DEFAULT 20,
    current_bookings INT DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms(id),
    FOREIGN KEY (coach_id) REFERENCES coaches(id),
    INDEX idx_gym_time (gym_id, start_time),
    INDEX idx_status (status),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3.1.3 预约订单体系

```sql
-- 预约订单表
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_no VARCHAR(32) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    gym_id BIGINT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded', 'partial_refund') DEFAULT 'unpaid',
    amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_time DATETIME,
    check_in_time DATETIME,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (gym_id) REFERENCES gyms(id),
    INDEX idx_booking_no (booking_no),
    INDEX idx_user_status (user_id, status),
    INDEX idx_class (class_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 支付记录表
CREATE TABLE payment_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_no VARCHAR(64) UNIQUE NOT NULL,
    booking_id BIGINT,
    user_id BIGINT NOT NULL,
    type ENUM('booking', 'membership', 'points', 'refund') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    payment_method ENUM('wechat', 'alipay', 'card', 'balance', 'points') NOT NULL,
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_transaction (transaction_no),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3.1.4 游戏化体系

```sql
-- 用户积分表
CREATE TABLE user_points (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    current_points INT DEFAULT 0,
    total_earned INT DEFAULT 0,
    total_spent INT DEFAULT 0,
    level ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond') DEFAULT 'bronze',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uk_user (user_id),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 积分流水表
CREATE TABLE point_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type ENUM('earn', 'spend') NOT NULL,
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    source VARCHAR(50) NOT NULL,
    source_id BIGINT,
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_type (user_id, type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 成就定义表
CREATE TABLE achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('training', 'skill', 'social', 'special') NOT NULL,
    type ENUM('milestone', 'badge') NOT NULL,
    icon_url VARCHAR(500),
    points_reward INT DEFAULT 0,
    requirements JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户成就表
CREATE TABLE user_achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    achievement_id BIGINT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 100,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE KEY uk_user_achievement (user_id, achievement_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 技能树节点表
CREATE TABLE skill_nodes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category ENUM('weightlifting', 'gymnastics', 'conditioning') NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    requirements JSON NOT NULL,
    points_reward INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_skill_level (skill_name, level),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户技能进度表
CREATE TABLE user_skills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    skill_node_id BIGINT NOT NULL,
    status ENUM('locked', 'in_review', 'unlocked', 'disputed') DEFAULT 'locked',
    video_url VARCHAR(500),
    performance_data JSON,
    review_notes TEXT,
    unlocked_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (skill_node_id) REFERENCES skill_nodes(id),
    UNIQUE KEY uk_user_skill (user_id, skill_node_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3.1.5 社交体系

```sql
-- 用户关系表
CREATE TABLE user_relationships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    type ENUM('friend', 'follow', 'block') NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'accepted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (target_user_id) REFERENCES users(id),
    UNIQUE KEY uk_relationship (user_id, target_user_id, type),
    INDEX idx_target_user (target_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 动态表
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type ENUM('workout', 'achievement', 'challenge', 'share') NOT NULL,
    content TEXT,
    images JSON,
    video_url VARCHAR(500),
    workout_data JSON,
    visibility ENUM('public', 'friends', 'private') DEFAULT 'public',
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_type (type),
    INDEX idx_visibility (visibility)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.2 数据库优化策略

#### 3.2.1 索引优化
- 基于查询模式创建复合索引
- 使用覆盖索引减少回表
- 定期分析慢查询日志
- 避免过度索引

#### 3.2.2 分库分表
- 用户数据按ID哈希分片
- 订单数据按时间分片
- 热点数据独立存储
- 使用ShardingSphere中间件

#### 3.2.3 读写分离
- 主从复制架构
- 读操作路由到从库
- 写操作使用主库
- 延迟监控和处理

#### 3.2.4 缓存策略
- 热点数据Redis缓存
- 查询结果缓存
- 缓存预热机制
- 缓存失效策略

## 4. API设计规范

### 4.1 RESTful API设计

#### 4.1.1 URL规范
```
# 基础URL格式
https://api.mobilif.com/v1/{resource}

# 示例
GET    /v1/users              # 获取用户列表
GET    /v1/users/{id}         # 获取单个用户
POST   /v1/users              # 创建用户
PUT    /v1/users/{id}         # 更新用户
DELETE /v1/users/{id}         # 删除用户

GET    /v1/gyms               # 获取场馆列表
GET    /v1/gyms/{id}/classes  # 获取场馆课程
POST   /v1/bookings           # 创建预约
```

#### 4.1.2 请求响应格式

**成功响应**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": 12345,
        "name": "张三",
        "phone": "138****1234"
    },
    "timestamp": 1704686400000
}
```

**错误响应**
```json
{
    "code": 40001,
    "message": "参数错误",
    "errors": [
        {
            "field": "phone",
            "message": "手机号格式不正确"
        }
    ],
    "timestamp": 1704686400000
}
```

**分页响应**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "list": [...],
        "pagination": {
            "page": 1,
            "pageSize": 20,
            "total": 100,
            "totalPages": 5
        }
    },
    "timestamp": 1704686400000
}
```

#### 4.1.3 状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 成功 |
| 201 | Created | 创建成功 |
| 204 | No Content | 删除成功 |
| 400 | Bad Request | 参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 429 | Too Many Requests | 请求过频 |
| 500 | Internal Server Error | 服务器错误 |

### 4.2 核心API接口

#### 4.2.1 用户认证接口

**注册接口**
```
POST /v1/auth/register
Content-Type: application/json

{
    "phone": "13812345678",
    "code": "123456",
    "password": "********",
    "nickname": "运动达人"
}

Response:
{
    "code": 0,
    "message": "注册成功",
    "data": {
        "userId": 12345,
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
}
```

**登录接口**
```
POST /v1/auth/login
Content-Type: application/json

{
    "phone": "13812345678",
    "password": "********"
}

Response:
{
    "code": 0,
    "message": "登录成功",
    "data": {
        "userId": 12345,
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
        "userInfo": {
            "nickname": "运动达人",
            "avatar": "https://...",
            "level": "gold"
        }
    }
}
```

#### 4.2.2 场馆预约接口

**搜索场馆**
```
GET /v1/gyms/search?lat=39.9042&lng=116.4074&radius=5000&keyword=crossfit
Authorization: Bearer {token}

Response:
{
    "code": 0,
    "message": "success",
    "data": {
        "list": [
            {
                "id": 1001,
                "name": "MobiLiF CrossFit北京站",
                "distance": 1200,
                "rating": 4.8,
                "address": "北京市朝阳区...",
                "price": "80-150",
                "tags": ["新手友好", "停车免费", "淋浴间"]
            }
        ],
        "total": 15
    }
}
```

**创建预约**
```
POST /v1/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
    "classId": 5001,
    "paymentMethod": "wechat",
    "specialRequests": "第一次参加，请多指导"
}

Response:
{
    "code": 0,
    "message": "预约成功",
    "data": {
        "bookingId": 20001,
        "bookingNo": "BK202401150001",
        "status": "confirmed",
        "qrCode": "https://..."
    }
}
```

### 4.3 WebSocket实时通信

#### 4.3.1 连接建立
```javascript
// 客户端连接
const ws = new WebSocket('wss://ws.mobilif.com/v1/realtime');

// 认证
ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'auth',
        token: 'Bearer {token}'
    }));
};

// 订阅频道
ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['workout:12345', 'global:leaderboard']
}));
```

#### 4.3.2 实时数据推送
```javascript
// 训练数据实时更新
{
    "type": "workout_update",
    "channel": "workout:12345",
    "data": {
        "userId": 12345,
        "exercise": "snatch",
        "weight": 60,
        "reps": 3,
        "timestamp": 1704686400000
    }
}

// 排行榜更新
{
    "type": "leaderboard_update",
    "channel": "global:leaderboard",
    "data": {
        "rankings": [
            {"userId": 12345, "score": 580, "rank": 1},
            {"userId": 12346, "score": 575, "rank": 2}
        ]
    }
}
```

## 5. 核心功能实现方案

### 5.1 全球化多语言支持

#### 5.1.1 i18n架构
- 基于 i18next 框架
- 支持动态语言切换
- 服务端渲染支持
- 语言包CDN分发

#### 5.1.2 支持语言
- 简体中文 (zh-CN)
- 英语 (en-US)
- 泰语 (th-TH)
- 马来语 (ms-MY)
- 印尼语 (id-ID)

### 5.2 实时竞技系统

#### 5.2.1 架构设计
```
用户A (北京) ─┐
              ├─→ WebSocket Gateway ─→ Redis Pub/Sub ─→ 实时排名计算
用户B (曼谷) ─┘                                          │
                                                        ↓
                                               推送给所有参与者
```

#### 5.2.2 实现要点
- WebSocket长连接管理
- Redis发布订阅机制
- 实时排名算法优化
- 网络延迟补偿

### 5.3 AI动作识别

#### 5.3.1 技术方案
- 端侧推理：TensorFlow Lite
- 姿态估计：MediaPipe Pose
- 动作分类：自训练CNN模型
- 准确率目标：>90%

#### 5.3.2 处理流程
1. 视频帧提取（30fps）
2. 人体关键点检测（17个关键点）
3. 动作特征提取
4. 模型推理分类
5. 结果后处理和平滑

### 5.4 支付系统集成

#### 5.4.1 支付渠道
- 国内：微信支付、支付宝
- 国际：Stripe、PayPal
- 数字货币：USDT（未来规划）

#### 5.4.2 支付安全
- PCI DSS合规
- 支付令牌化
- 3D Secure验证
- 风控系统集成

## 6. 性能优化方案

### 6.1 前端性能优化

#### 6.1.1 加载优化
- 代码分割和懒加载
- 图片懒加载和WebP格式
- 资源预加载和预连接
- Service Worker缓存

#### 6.1.2 渲染优化
- 虚拟列表（大数据列表）
- 防抖和节流
- React.memo和useMemo
- GPU加速动画

### 6.2 后端性能优化

#### 6.2.1 接口优化
- GraphQL按需查询
- 数据分页和游标
- 字段投影
- 批量接口合并

#### 6.2.2 缓存策略
- 多级缓存架构
- 缓存预热
- 缓存更新策略
- 热点数据识别

### 6.3 数据库优化

#### 6.3.1 查询优化
- 慢查询分析
- 索引优化
- 查询重写
- 连接池配置

#### 6.3.2 架构优化
- 读写分离
- 分库分表
- 冷热数据分离
- 数据归档策略

## 7. 安全防护方案

### 7.1 应用安全

#### 7.1.1 认证授权
- JWT双Token机制
- 权限最小化原则
- 动态权限控制
- 单点登录SSO

#### 7.1.2 数据安全
- 敏感数据加密
- SQL注入防护
- XSS/CSRF防护
- 文件上传安全

### 7.2 网络安全

#### 7.2.1 传输安全
- HTTPS强制
- 证书固定
- 防中间人攻击
- VPN专线（B端）

#### 7.2.2 DDoS防护
- 云防护服务
- 限流熔断
- IP黑白名单
- 行为分析

### 7.3 业务安全

#### 7.3.1 防作弊
- 设备指纹
- 行为分析
- 视频水印
- AI检测

#### 7.3.2 内容安全
- 敏感词过滤
- 图片鉴黄
- 视频审核
- 人工复审

## 8. 监控告警体系

### 8.1 监控指标

#### 8.1.1 业务指标
- 用户活跃度（DAU/MAU）
- 预约转化率
- 支付成功率
- 用户留存率

#### 8.1.2 技术指标
- 接口响应时间
- 错误率
- 可用性（SLA 99.9%）
- 资源使用率

### 8.2 告警机制

#### 8.2.1 告警级别
- P0：严重故障（5分钟响应）
- P1：重要问题（30分钟响应）
- P2：一般问题（2小时响应）
- P3：提醒信息（工作时间处理）

#### 8.2.2 告警渠道
- 短信告警
- 电话告警
- 企业微信/钉钉
- 邮件告警

## 9. 容灾备份方案

### 9.1 多活架构
- 异地多活部署
- 数据实时同步
- 就近访问路由
- 故障自动切换

### 9.2 备份策略
- 数据库实时备份
- 定期全量备份
- 异地灾备存储
- 恢复演练机制

## 10. 开发流程规范

### 10.1 开发规范
- 代码规范（ESLint + Prettier）
- Git Flow工作流
- Code Review机制
- 单元测试覆盖率>80%

### 10.2 部署流程
- CI/CD自动化
- 蓝绿部署
- 灰度发布
- 回滚机制

### 10.3 文档规范
- API文档自动生成
- 代码注释规范
- 技术文档维护
- 知识库建设

## 11. 项目里程碑

### Phase 1: MVP版本（3个月）
- 基础用户系统
- 场馆预约功能
- 简单积分系统
- 支付功能集成

### Phase 2: Beta版本（6个月）
- 完整游戏化系统
- 技能树功能
- 社交功能
- AI动作识别基础版

### Phase 3: 正式版本（12个月）
- 全球化多语言
- 实时竞技系统
- 高级AI功能
- 数据分析平台

### Phase 4: 扩展版本（18个月）
- AR/VR集成
- 区块链积分
- 全球赛事系统
- 生态合作平台

## 12. 技术团队组建

### 12.1 核心团队
- 技术总监 × 1
- 架构师 × 2
- 前端工程师 × 6
- 后端工程师 × 8
- 移动端工程师 × 4
- AI工程师 × 2
- 测试工程师 × 4
- 运维工程师 × 3
- UI/UX设计师 × 3

### 12.2 技能要求
- 分布式系统经验
- 高并发处理能力
- 游戏化产品经验
- 运动健身行业了解
- 英语沟通能力

## 13. 成本预算估算

### 13.1 技术成本
- 云服务器：10万/月
- CDN流量：5万/月
- 第三方服务：3万/月
- 开发工具：2万/月

### 13.2 人力成本
- 技术团队：200万/月
- 外包支持：30万/月

### 13.3 总体预算
- MVP阶段：800万
- Beta阶段：1500万
- 正式版本：2500万
- 年度运营：3000万

## 14. 风险评估与应对

### 14.1 技术风险
- **风险**：高并发处理能力不足
- **应对**：提前进行压力测试，准备弹性扩容方案

### 14.2 安全风险
- **风险**：用户数据泄露
- **应对**：实施多层安全防护，定期安全审计

### 14.3 业务风险
- **风险**：用户增长不及预期
- **应对**：快速迭代，数据驱动决策

## 15. 总结

MobiLiF拓练技术方案充分考虑了产品的创新性和技术挑战，通过采用先进的技术架构和最佳实践，确保平台能够支撑百万级用户规模，提供流畅的游戏化运动体验。技术团队将持续优化和创新，推动产品不断进化，实现"让每座训练场馆成为地球游戏厅的终端机"的伟大愿景。