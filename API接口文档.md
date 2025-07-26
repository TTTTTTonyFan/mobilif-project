# MobiLiF拓练 API接口文档

## 1. API设计概述

### 1.1 设计原则
- **RESTful风格**: 遵循REST设计规范，资源导向
- **统一响应格式**: 标准化的响应结构
- **版本控制**: 通过URL路径进行版本管理
- **安全认证**: JWT Token + 权限控制
- **幂等性**: 支持安全重试机制

### 1.2 基础信息
- **Base URL**: `https://api.mobilif.com`
- **API版本**: `v1`
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时区**: 支持多时区，默认UTC

### 1.3 HTTP状态码规范

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功，无返回内容 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或Token过期 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 请求格式正确，但业务逻辑错误 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器内部错误 |

### 1.4 统一响应格式

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    // 具体数据内容
  },
  "timestamp": 1704686400000,
  "requestId": "req_1234567890abcdef"
}
```

**错误响应**
```json
{
  "code": 40001,
  "message": "参数验证失败",
  "errors": [
    {
      "field": "phone",
      "message": "手机号格式不正确",
      "code": "INVALID_PHONE_FORMAT"
    }
  ],
  "timestamp": 1704686400000,
  "requestId": "req_1234567890abcdef"
}
```

**分页响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      // 数据列表
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": 1704686400000,
  "requestId": "req_1234567890abcdef"
}
```

## 2. 认证与授权

### 2.1 JWT Token 结构

**Header**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**
```json
{
  "sub": "12345", // 用户ID
  "iat": 1704686400, // 签发时间
  "exp": 1704772800, // 过期时间
  "scope": ["user:read", "user:write"], // 权限范围
  "device": "ios_app_v1.0.0", // 设备信息
  "jti": "token_unique_id" // Token唯一标识
}
```

### 2.2 认证方式

**Bearer Token认证**
```http
GET /v1/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**API Key认证（B端）**
```http
GET /v1/gyms/123/stats
X-API-Key: ak_1234567890abcdef
X-API-Secret: sk_1234567890abcdef
X-Timestamp: 1704686400
X-Signature: sha256_signature
```

### 2.3 权限模型

**用户权限**
- `user:read` - 读取用户信息
- `user:write` - 修改用户信息
- `booking:create` - 创建预约
- `booking:cancel` - 取消预约
- `social:post` - 发布动态
- `points:spend` - 消费积分

**管理员权限**
- `gym:manage` - 场馆管理
- `class:manage` - 课程管理
- `booking:manage` - 预约管理
- `user:moderate` - 用户管理

## 3. 用户认证模块 API

### 3.1 用户注册

#### 发送验证码
```http
POST /v1/auth/verification-code
Content-Type: application/json

{
  "type": "sms", // sms | email
  "target": "13812345678",
  "purpose": "register", // register | login | reset_password
  "language": "zh-CN"
}
```

**响应**
```json
{
  "code": 0,
  "message": "验证码发送成功",
  "data": {
    "codeId": "code_1234567890",
    "expiresIn": 300,
    "interval": 60
  }
}
```

#### 验证验证码
```http
POST /v1/auth/verify-code
Content-Type: application/json

{
  "codeId": "code_1234567890",
  "code": "123456"
}
```

**响应**
```json
{
  "code": 0,
  "message": "验证成功",
  "data": {
    "verifyToken": "verify_token_123",
    "expiresIn": 600
  }
}
```

#### 用户注册
```http
POST /v1/auth/register
Content-Type: application/json

{
  "phone": "13812345678",
  "verifyToken": "verify_token_123",
  "password": "password123",
  "nickname": "运动达人",
  "inviteCode": "INV123456", // 可选
  "agreeTerms": true
}
```

**响应**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "userId": 12345,
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,
    "userInfo": {
      "id": 12345,
      "nickname": "运动达人",
      "avatar": null,
      "level": "bronze",
      "points": 100
    }
  }
}
```

### 3.2 用户登录

#### 密码登录
```http
POST /v1/auth/login
Content-Type: application/json

{
  "account": "13812345678", // 手机号或邮箱
  "password": "password123",
  "deviceInfo": {
    "platform": "ios",
    "version": "16.0",
    "model": "iPhone 14 Pro",
    "appVersion": "1.0.0"
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "userId": 12345,
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,
    "userInfo": {
      "id": 12345,
      "nickname": "运动达人",
      "avatar": "https://cdn.mobilif.com/avatars/12345.jpg",
      "level": "gold",
      "points": 2580,
      "isNewUser": false
    }
  }
}
```

#### 第三方登录
```http
POST /v1/auth/oauth/login
Content-Type: application/json

{
  "provider": "wechat", // wechat | apple | google
  "authCode": "auth_code_from_provider",
  "deviceInfo": {
    "platform": "ios",
    "version": "16.0"
  }
}
```

### 3.3 Token管理

#### 刷新Token
```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**响应**
```json
{
  "code": 0,
  "message": "Token刷新成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200
  }
}
```

#### 登出
```http
POST /v1/auth/logout
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "登出成功"
}
```

## 4. 用户管理模块 API

### 4.1 用户信息

#### 获取用户信息
```http
GET /v1/users/profile
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 12345,
    "phone": "138****5678",
    "email": "user@example.com",
    "nickname": "运动达人",
    "avatar": "https://cdn.mobilif.com/avatars/12345.jpg",
    "gender": "male",
    "birthDate": "1990-01-01",
    "city": "北京",
    "bio": "健身爱好者，CrossFit忠实粉丝",
    "level": "gold",
    "points": 2580,
    "fitnessProfile": {
      "crossfitExperienceMonths": 24,
      "skillLevel": "intermediate",
      "trainingGoals": ["strength", "endurance"],
      "heightCm": 175,
      "weightKg": 70.5
    },
    "stats": {
      "totalWorkouts": 156,
      "totalMinutes": 9360,
      "achievementCount": 15,
      "prCount": 8
    },
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

#### 更新用户信息
```http
PUT /v1/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "nickname": "新昵称",
  "bio": "更新后的个人简介",
  "city": "上海",
  "fitnessProfile": {
    "skillLevel": "advanced",
    "trainingGoals": ["strength", "skill"],
    "weightKg": 72.0
  }
}
```

#### 上传头像
```http
POST /v1/users/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": (binary data)
}
```

**响应**
```json
{
  "code": 0,
  "message": "头像上传成功",
  "data": {
    "avatar": "https://cdn.mobilif.com/avatars/12345_new.jpg"
  }
}
```

### 4.2 隐私设置

#### 获取隐私设置
```http
GET /v1/users/privacy-settings
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "profileVisibility": "public",
    "workoutVisibility": "friends",
    "locationVisibility": "private",
    "allowFriendRequests": true,
    "allowMessages": "friends",
    "allowNotifications": true
  }
}
```

#### 更新隐私设置
```http
PUT /v1/users/privacy-settings
Authorization: Bearer {token}
Content-Type: application/json

{
  "profileVisibility": "friends",
  "workoutVisibility": "friends",
  "allowMessages": "all"
}
```

## 5. 场馆模块 API

### 5.1 场馆搜索

#### 搜索附近场馆
```http
GET /v1/gyms/search?lat=39.9042&lng=116.4074&radius=5000&keyword=crossfit&page=1&pageSize=20
Authorization: Bearer {token}
```

**查询参数**
- `lat` - 纬度
- `lng` - 经度  
- `radius` - 搜索半径(米)，默认5000
- `keyword` - 关键词搜索
- `city` - 城市过滤
- `tags` - 标签过滤，多个用逗号分隔
- `priceRange` - 价格区间，如 "50-100"
- `rating` - 最低评分
- `sortBy` - 排序方式：distance|rating|price
- `page` - 页码，默认1
- `pageSize` - 页大小，默认20

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1001,
        "name": "MobiLiF CrossFit北京站",
        "nameEn": "MobiLiF CrossFit Beijing",
        "cover": "https://cdn.mobilif.com/gyms/1001/cover.jpg",
        "address": "北京市朝阳区xxx路xxx号",
        "distance": 1200,
        "rating": 4.8,
        "ratingCount": 156,
        "priceRange": "80-150",
        "tags": ["新手友好", "停车免费", "淋浴间"],
        "businessHours": {
          "monday": "06:00-22:00",
          "tuesday": "06:00-22:00"
        },
        "trialPrice": 68,
        "isVerified": true
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### 获取场馆详情
```http
GET /v1/gyms/1001
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "name": "MobiLiF CrossFit北京站",
    "nameEn": "MobiLiF CrossFit Beijing",
    "description": "专业的CrossFit训练场馆...",
    "cover": "https://cdn.mobilif.com/gyms/1001/cover.jpg",
    "images": [
      "https://cdn.mobilif.com/gyms/1001/1.jpg",
      "https://cdn.mobilif.com/gyms/1001/2.jpg"
    ],
    "address": "北京市朝阳区xxx路xxx号",
    "location": {
      "latitude": 39.9042,
      "longitude": 116.4074
    },
    "contact": {
      "phone": "010-12345678",
      "email": "beijing@mobilif.com",
      "wechat": "mobilif_bj"
    },
    "businessHours": {
      "monday": "06:00-22:00",
      "tuesday": "06:00-22:00",
      "wednesday": "06:00-22:00",
      "thursday": "06:00-22:00",
      "friday": "06:00-22:00",
      "saturday": "08:00-20:00",
      "sunday": "08:00-20:00"
    },
    "facilities": [
      "自由重量区",
      "有氧设备",
      "功能训练区",
      "更衣室",
      "淋浴间",
      "储物柜"
    ],
    "services": [
      "私人教练",
      "团体课程",
      "营养咨询",
      "体能测试"
    ],
    "tags": ["新手友好", "停车免费", "淋浴间"],
    "parkingInfo": "免费停车位50个",
    "rating": 4.8,
    "ratingCount": 156,
    "priceRange": "80-150",
    "trialPrice": 68,
    "membershipOptions": [
      {
        "type": "monthly",
        "name": "月卡",
        "price": 480,
        "originalPrice": 600,
        "description": "30天无限次课程"
      }
    ],
    "isVerified": true,
    "isFavorite": false,
    "stats": {
      "totalClasses": 1200,
      "totalMembers": 350,
      "avgClassSize": 12
    }
  }
}
```

### 5.2 教练信息

#### 获取场馆教练列表
```http
GET /v1/gyms/1001/coaches
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 2001,
        "name": "张教练",
        "nameEn": "Coach Zhang",
        "avatar": "https://cdn.mobilif.com/coaches/2001/avatar.jpg",
        "bio": "5年CrossFit教学经验...",
        "certifications": [
          "CrossFit Level 2",
          "ACSM认证"
        ],
        "specialties": ["举重", "体操", "新手指导"],
        "experienceYears": 5,
        "rating": 4.9,
        "ratingCount": 89,
        "classCount": 456,
        "languages": ["zh-CN", "en-US"]
      }
    ]
  }
}
```

### 5.3 课程管理

#### 获取课程时间表
```http
GET /v1/gyms/1001/classes?date=2024-01-15&type=wod
Authorization: Bearer {token}
```

**查询参数**
- `date` - 查询日期，格式YYYY-MM-DD
- `type` - 课程类型过滤
- `coachId` - 教练过滤
- `startDate` - 开始日期（查询范围）
- `endDate` - 结束日期（查询范围）

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 5001,
        "name": "CrossFit WOD",
        "type": "wod",
        "description": "今日WOD：Fran - 21-15-9...",
        "coach": {
          "id": 2001,
          "name": "张教练",
          "avatar": "https://cdn.mobilif.com/coaches/2001/avatar.jpg"
        },
        "startTime": "2024-01-15T19:00:00+08:00",
        "endTime": "2024-01-15T20:00:00+08:00",
        "duration": 60,
        "difficultyLevel": "intermediate",
        "maxCapacity": 20,
        "currentBookings": 15,
        "waitlistCount": 3,
        "price": 80,
        "memberPrice": 60,
        "dropInPrice": 100,
        "status": "scheduled",
        "equipmentNeeded": ["杠铃", "引体向上杠"],
        "tags": ["WOD", "全身训练"],
        "canBook": true,
        "bookingDeadline": "2024-01-15T18:00:00+08:00"
      }
    ]
  }
}
```

#### 获取课程详情
```http
GET /v1/classes/5001
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 5001,
    "gym": {
      "id": 1001,
      "name": "MobiLiF CrossFit北京站",
      "address": "北京市朝阳区xxx路xxx号"
    },
    "name": "CrossFit WOD",
    "type": "wod",
    "description": "今日WOD：Fran - 21-15-9 Thrusters & Pull-ups",
    "wodContent": {
      "name": "Fran",
      "type": "benchmark",
      "movements": [
        {
          "name": "Thrusters",
          "weight": "43kg/30kg",
          "reps": [21, 15, 9]
        },
        {
          "name": "Pull-ups",
          "reps": [21, 15, 9]
        }
      ],
      "timeCap": 15,
      "scalingOptions": {
        "beginner": "减重量，辅助引体向上",
        "intermediate": "标准重量",
        "advanced": "增加重量"
      }
    },
    "coach": {
      "id": 2001,
      "name": "张教练",
      "avatar": "https://cdn.mobilif.com/coaches/2001/avatar.jpg",
      "bio": "专业CrossFit教练，擅长举重技术指导"
    },
    "schedule": {
      "startTime": "2024-01-15T19:00:00+08:00",
      "endTime": "2024-01-15T20:00:00+08:00",
      "duration": 60
    },
    "capacity": {
      "maxCapacity": 20,
      "currentBookings": 15,
      "availableSpots": 5,
      "waitlistCount": 3
    },
    "pricing": {
      "price": 80,
      "memberPrice": 60,
      "dropInPrice": 100,
      "trialPrice": 50
    },
    "requirements": {
      "difficultyLevel": "intermediate",
      "equipmentNeeded": ["杠铃", "引体向上杠"],
      "prerequisites": [],
      "safetyRequirements": ["运动鞋", "运动服"]
    },
    "policies": {
      "cancellationPolicy": "课前2小时可免费取消",
      "latePolicy": "迟到超过10分钟不可入场",
      "makeupPolicy": "可申请补课一次"
    },
    "userBooking": null, // 用户预约信息，未预约则为null
    "canBook": true,
    "bookingDeadline": "2024-01-15T18:00:00+08:00",
    "reviews": {
      "rating": 4.8,
      "count": 23,
      "recent": [
        {
          "userId": 12346,
          "userName": "运动爱好者",
          "rating": 5,
          "comment": "张教练指导很专业，WOD强度适中",
          "createdAt": "2024-01-14T20:30:00+08:00"
        }
      ]
    }
  }
}
```

## 6. 预约订单模块 API

### 6.1 创建预约

#### 预约课程
```http
POST /v1/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "classId": 5001,
  "type": "regular", // regular | trial | drop_in
  "couponId": 3001, // 可选：优惠券ID
  "pointsToUse": 100, // 可选：使用积分
  "specialRequests": "第一次参加，请多指导",
  "emergencyContact": {
    "name": "家属姓名",
    "phone": "13987654321"
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "预约成功",
  "data": {
    "bookingId": 20001,
    "bookingNo": "BK202401150001",
    "class": {
      "id": 5001,
      "name": "CrossFit WOD",
      "startTime": "2024-01-15T19:00:00+08:00",
      "coach": "张教练",
      "gym": "MobiLiF CrossFit北京站"
    },
    "status": "confirmed",
    "payment": {
      "amount": 80.00,
      "discountAmount": 10.00,
      "pointsDeducted": 5.00,
      "finalAmount": 65.00,
      "needPayment": true,
      "paymentDeadline": "2024-01-15T18:30:00+08:00"
    },
    "qrCode": "https://cdn.mobilif.com/qr/booking_20001.png",
    "policies": {
      "cancellation": "课前2小时可免费取消",
      "late": "迟到超过10分钟不可入场"
    }
  }
}
```

#### 加入候补列表
```http
POST /v1/classes/5001/waitlist
Authorization: Bearer {token}
Content-Type: application/json

{
  "notifyMethods": ["push", "sms"], // 通知方式
  "autoConfirm": true // 有位置时自动确认
}
```

**响应**
```json
{
  "code": 0,
  "message": "已加入候补列表",
  "data": {
    "waitlistId": 30001,
    "position": 3,
    "estimatedWaitTime": "通常在课前1小时有空位释放",
    "expireAt": "2024-01-15T19:00:00+08:00"
  }
}
```

### 6.2 预约管理

#### 获取用户预约列表
```http
GET /v1/users/bookings?status=upcoming&page=1&pageSize=20
Authorization: Bearer {token}
```

**查询参数**
- `status` - 预约状态：upcoming|past|cancelled|all
- `page` - 页码
- `pageSize` - 页大小

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 20001,
        "bookingNo": "BK202401150001",
        "status": "confirmed",
        "type": "regular",
        "class": {
          "id": 5001,
          "name": "CrossFit WOD",
          "startTime": "2024-01-15T19:00:00+08:00",
          "endTime": "2024-01-15T20:00:00+08:00",
          "coach": {
            "name": "张教练",
            "avatar": "https://cdn.mobilif.com/coaches/2001/avatar.jpg"
          },
          "gym": {
            "name": "MobiLiF CrossFit北京站",
            "address": "北京市朝阳区xxx路xxx号"
          }
        },
        "payment": {
          "finalAmount": 65.00,
          "paymentStatus": "paid",
          "paymentMethod": "wechat"
        },
        "canCancel": true,
        "canReschedule": false,
        "checkIn": null,
        "createdAt": "2024-01-14T10:30:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

#### 获取预约详情
```http
GET /v1/bookings/20001
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 20001,
    "bookingNo": "BK202401150001",
    "status": "confirmed",
    "type": "regular",
    "class": {
      "id": 5001,
      "name": "CrossFit WOD",
      "description": "今日WOD：Fran",
      "startTime": "2024-01-15T19:00:00+08:00",
      "endTime": "2024-01-15T20:00:00+08:00",
      "coach": {
        "id": 2001,
        "name": "张教练",
        "avatar": "https://cdn.mobilif.com/coaches/2001/avatar.jpg",
        "phone": "139****5678"
      },
      "gym": {
        "id": 1001,
        "name": "MobiLiF CrossFit北京站",
        "address": "北京市朝阳区xxx路xxx号",
        "phone": "010-12345678",
        "location": {
          "latitude": 39.9042,
          "longitude": 116.4074
        }
      }
    },
    "payment": {
      "amount": 80.00,
      "discountAmount": 10.00,
      "pointsUsed": 100,
      "pointsDeducted": 5.00,
      "finalAmount": 65.00,
      "paymentStatus": "paid",
      "paymentMethod": "wechat",
      "paymentTime": "2024-01-14T10:35:00+08:00",
      "transactionNo": "wx_pay_123456789"
    },
    "checkIn": {
      "status": "checked_in",
      "checkInTime": "2024-01-15T18:55:00+08:00",
      "checkInMethod": "qrcode",
      "checkOutTime": "2024-01-15T20:05:00+08:00"
    },
    "specialRequests": "第一次参加，请多指导",
    "qrCode": "https://cdn.mobilif.com/qr/booking_20001.png",
    "policies": {
      "cancellation": "课前2小时可免费取消",
      "late": "迟到超过10分钟不可入场",
      "makeup": "可申请补课一次"
    },
    "actions": {
      "canCancel": false,
      "canReschedule": false,
      "canRate": true,
      "canViewRecording": true
    },
    "workoutData": {
      "completed": true,
      "duration": 68,
      "intensity": "high",
      "caloriesBurned": 450,
      "movements": [
        {
          "name": "Thrusters",
          "weight": 40,
          "reps": 45
        }
      ],
      "score": "8:45",
      "ranking": 5,
      "totalParticipants": 18
    },
    "createdAt": "2024-01-14T10:30:00+08:00"
  }
}
```

### 6.3 预约操作

#### 取消预约
```http
DELETE /v1/bookings/20001
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "时间冲突", // 取消原因
  "comment": "临时有事无法参加" // 可选：详细说明
}
```

**响应**
```json
{
  "code": 0,
  "message": "预约已取消",
  "data": {
    "refundAmount": 65.00,
    "refundMethod": "original", // original | balance | points
    "refundTime": "3-5个工作日",
    "pointsRefunded": 100
  }
}
```

#### 签到
```http
POST /v1/bookings/20001/check-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "method": "qrcode", // qrcode | manual | auto
  "location": {
    "latitude": 39.9042,
    "longitude": 116.4074
  }
}
```

**响应**
```json
{
  "code": 0,
  "message": "签到成功",
  "data": {
    "checkInTime": "2024-01-15T18:55:00+08:00",
    "welcomeMessage": "欢迎来到MobiLiF CrossFit北京站！",
    "todayWod": {
      "name": "Fran",
      "description": "21-15-9 Thrusters & Pull-ups"
    },
    "lockerInfo": "可使用15号储物柜",
    "pointsEarned": 20
  }
}
```

### 6.4 评价反馈

#### 评价课程
```http
POST /v1/bookings/20001/review
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "教练很专业，课程强度适中，很棒的体验！",
  "aspects": {
    "coach": 5,
    "environment": 4,
    "equipment": 5,
    "service": 5
  },
  "images": [
    "https://cdn.mobilif.com/reviews/user_upload_1.jpg"
  ],
  "tags": ["专业", "强度适中", "环境好"],
  "anonymous": false
}
```

**响应**
```json
{
  "code": 0,
  "message": "评价提交成功",
  "data": {
    "pointsEarned": 10,
    "badgeUnlocked": {
      "name": "评价达人",
      "description": "完成10次课程评价"
    }
  }
}
```

## 7. 支付模块 API

### 7.1 创建支付

#### 创建支付订单
```http
POST /v1/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderType": "booking", // booking | membership | package | points
  "orderId": 20001,
  "amount": 65.00,
  "currency": "CNY",
  "paymentMethod": "wechat", // wechat | alipay | card | balance
  "returnUrl": "mobilif://payment/success", // App端回调
  "description": "CrossFit WOD课程费用"
}
```

**响应**
```json
{
  "code": 0,
  "message": "支付订单创建成功",
  "data": {
    "paymentNo": "PAY202401150001",
    "amount": 65.00,
    "currency": "CNY",
    "paymentMethod": "wechat",
    "expiresAt": "2024-01-15T18:30:00+08:00",
    "paymentInfo": {
      // 微信支付参数
      "appId": "wx1234567890abcdef",
      "timeStamp": "1705305600",
      "nonceStr": "random_string",
      "package": "Sign=WXPay",
      "signType": "RSA",
      "paySign": "signature_string"
    }
  }
}
```

### 7.2 支付状态

#### 查询支付状态
```http
GET /v1/payments/PAY202401150001/status
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "paymentNo": "PAY202401150001",
    "status": "success", // pending | processing | success | failed | cancelled
    "amount": 65.00,
    "paidAt": "2024-01-15T10:35:00+08:00",
    "transactionNo": "wx_pay_123456789",
    "orderInfo": {
      "orderType": "booking",
      "orderId": 20001,
      "description": "CrossFit WOD课程费用"
    }
  }
}
```

#### 支付回调处理
```http
POST /v1/payments/webhook/wechat
Content-Type: application/json
X-Wechat-Signature: signature

{
  // 微信支付回调数据
}
```

### 7.3 退款管理

#### 申请退款
```http
POST /v1/refunds
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentId": 40001,
  "amount": 65.00, // 可选：部分退款金额
  "reason": "用户取消预约",
  "description": "课程临时取消，申请全额退款"
}
```

**响应**
```json
{
  "code": 0,
  "message": "退款申请已提交",
  "data": {
    "refundNo": "REF202401150001",
    "amount": 65.00,
    "status": "processing",
    "estimatedTime": "3-5个工作日",
    "refundMethod": "original"
  }
}
```

#### 查询退款状态
```http
GET /v1/refunds/REF202401150001
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "refundNo": "REF202401150001",
    "amount": 65.00,
    "status": "completed",
    "processedAt": "2024-01-16T14:30:00+08:00",
    "completedAt": "2024-01-16T15:00:00+08:00",
    "refundMethod": "original",
    "channelRefundNo": "wx_refund_987654321"
  }
}
```

## 8. 游戏化模块 API

### 8.1 积分系统

#### 获取用户积分信息
```http
GET /v1/users/points
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "currentPoints": 2580,
    "totalEarned": 5620,
    "totalSpent": 3040,
    "frozenPoints": 0,
    "level": "gold",
    "levelPoints": 2580,
    "nextLevelPoints": 5000,
    "levelProgress": 0.516,
    "levelBenefits": [
      "预约优先级+1",
      "专属客服",
      "月度免费课程"
    ],
    "pointsExpiring": {
      "amount": 200,
      "expireDate": "2024-02-15"
    }
  }
}
```

#### 获取积分流水
```http
GET /v1/users/points/transactions?type=earn&page=1&pageSize=20
Authorization: Bearer {token}
```

**查询参数**
- `type` - 交易类型：earn|spend|expire|all
- `source` - 来源过滤
- `startDate` - 开始日期
- `endDate` - 结束日期

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 50001,
        "transactionNo": "PT202401150001",
        "type": "earn",
        "amount": 20,
        "balanceBefore": 2560,
        "balanceAfter": 2580,
        "source": "workout_complete",
        "description": "完成CrossFit WOD训练",
        "expireAt": "2025-01-15",
        "createdAt": "2024-01-15T20:30:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8
    },
    "summary": {
      "totalEarned": 1580,
      "totalSpent": 340,
      "periodStart": "2024-01-01",
      "periodEnd": "2024-01-31"
    }
  }
}
```

#### 积分兑换
```http
POST /v1/points/redeem
Authorization: Bearer {token}
Content-Type: application/json

{
  "rewardId": 6001,
  "quantity": 1,
  "pointsToSpend": 500
}
```

**响应**
```json
{
  "code": 0,
  "message": "兑换成功",
  "data": {
    "transactionNo": "PT202401150002",
    "pointsSpent": 500,
    "balanceAfter": 2080,
    "reward": {
      "name": "训练装备优惠券",
      "description": "可在合作商家享受9折优惠",
      "validUntil": "2024-02-15T23:59:59+08:00",
      "usageInstructions": "结账时出示此券码"
    },
    "couponCode": "GEAR20240115001"
  }
}
```

### 8.2 成就系统

#### 获取用户成就
```http
GET /v1/users/achievements?category=training&status=unlocked
Authorization: Bearer {token}
```

**查询参数**
- `category` - 成就类别：training|skill|social|special|all
- `status` - 状态：unlocked|locked|in_progress|all
- `type` - 类型：badge|milestone|title

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "summary": {
      "total": 156,
      "unlocked": 15,
      "inProgress": 8,
      "locked": 133
    },
    "categories": [
      {
        "category": "training",
        "total": 45,
        "unlocked": 8,
        "achievements": [
          {
            "id": 7001,
            "code": "first_workout",
            "name": "初出茅庐",
            "description": "完成第一次CrossFit训练",
            "category": "training",
            "type": "milestone",
            "icon": "https://cdn.mobilif.com/achievements/first_workout.png",
            "rarity": "common",
            "pointsReward": 50,
            "unlockedAt": "2024-01-02T20:30:00+08:00",
            "progress": {
              "current": 1,
              "target": 1,
              "percentage": 100
            }
          }
        ]
      }
    ]
  }
}
```

#### 获取成就详情
```http
GET /v1/achievements/7001
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 7001,
    "code": "first_workout",
    "name": "初出茅庐",
    "description": "完成第一次CrossFit训练，开启你的健身之旅！",
    "category": "training",
    "type": "milestone",
    "level": 1,
    "icon": "https://cdn.mobilif.com/achievements/first_workout.png",
    "bgImage": "https://cdn.mobilif.com/achievements/bg_first_workout.jpg",
    "rarity": "common",
    "pointsReward": 50,
    "requirements": {
      "description": "完成任意一次CrossFit训练课程",
      "criteria": [
        "参加任意CrossFit课程",
        "完成完整训练"
      ]
    },
    "userProgress": {
      "unlocked": true,
      "unlockedAt": "2024-01-02T20:30:00+08:00",
      "progress": 100,
      "currentValue": 1,
      "targetValue": 1
    },
    "stats": {
      "totalUnlocked": 12456,
      "unlockRate": 0.89,
      "firstUnlockedBy": "运动先锋",
      "firstUnlockedAt": "2023-01-01T10:00:00+08:00"
    },
    "relatedAchievements": [
      {
        "id": 7002,
        "name": "坚持不懈",
        "description": "连续训练7天"
      }
    ]
  }
}
```

### 8.3 技能树系统

#### 获取技能树概览
```http
GET /v1/users/skills/overview
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "summary": {
      "totalSkills": 63,
      "unlockedSkills": 12,
      "masteredSkills": 3,
      "overallProgress": 0.19
    },
    "categories": [
      {
        "id": 1,
        "code": "weightlifting",
        "name": "举重",
        "nameEn": "Weightlifting",
        "icon": "https://cdn.mobilif.com/skills/weightlifting.png",
        "description": "奥林匹克举重和力量训练技能",
        "totalSkills": 21,
        "unlockedSkills": 6,
        "progress": 0.29,
        "skills": [
          {
            "id": 101,
            "name": "抓举",
            "currentLevel": 2,
            "maxLevel": 3,
            "status": "unlocked"
          }
        ]
      }
    ]
  }
}
```

#### 获取技能分类详情
```http
GET /v1/skills/categories/weightlifting
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "category": {
      "id": 1,
      "code": "weightlifting",
      "name": "举重",
      "description": "奥林匹克举重和力量训练技能树"
    },
    "skills": [
      {
        "id": 101,
        "code": "snatch",
        "name": "抓举",
        "levels": [
          {
            "level": 1,
            "name": "新手基础",
            "description": "空杠抓举技术",
            "requirements": {
              "minWeight": 15,
              "maxWeight": 30,
              "videoRequired": true,
              "criteria": "标准动作完成"
            },
            "userStatus": "unlocked",
            "unlockedAt": "2024-01-10T15:30:00+08:00"
          },
          {
            "level": 2,
            "name": "标准",
            "description": "标准抓举技术",
            "requirements": {
              "minWeight": 40,
              "maxWeight": 60,
              "videoRequired": true
            },
            "userStatus": "unlocked",
            "unlockedAt": "2024-01-12T16:20:00+08:00"
          },
          {
            "level": 3,
            "name": "进阶",
            "description": "高重量抓举",
            "requirements": {
              "minWeight": 70,
              "videoRequired": true
            },
            "userStatus": "in_progress",
            "progress": 0.6
          }
        ]
      }
    ]
  }
}
```

#### 提交技能认证
```http
POST /v1/skills/submit
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "skillNodeId": 101,
  "level": 3,
  "performanceData": {
    "weight": 75,
    "reps": 1,
    "duration": null
  },
  "video": (video file),
  "notes": "抓举75kg成功，动作标准"
}
```

**响应**
```json
{
  "code": 0,
  "message": "技能认证已提交",
  "data": {
    "submissionId": 80001,
    "status": "in_review",
    "estimatedReviewTime": "48小时内",
    "videoUrl": "https://cdn.mobilif.com/skills/submissions/80001.mp4",
    "requirements": {
      "minWeight": 70,
      "achieved": 75,
      "passed": true
    }
  }
}
```

## 9. 社交模块 API

### 9.1 好友系统

#### 搜索用户
```http
GET /v1/users/search?keyword=张三&page=1&pageSize=20
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 12346,
        "nickname": "张三",
        "avatar": "https://cdn.mobilif.com/avatars/12346.jpg",
        "bio": "CrossFit爱好者",
        "level": "silver",
        "stats": {
          "workoutCount": 89,
          "achievementCount": 12
        },
        "relationshipStatus": "none", // none | friend | following | pending
        "mutualFriends": 3
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

#### 发送好友请求
```http
POST /v1/users/12346/friend-request
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "一起训练吧！"
}
```

**响应**
```json
{
  "code": 0,
  "message": "好友请求已发送",
  "data": {
    "requestId": 90001,
    "status": "pending"
  }
}
```

#### 处理好友请求
```http
PUT /v1/friend-requests/90001
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "accept" // accept | reject
}
```

#### 获取好友列表
```http
GET /v1/users/friends?status=accepted&page=1&pageSize=50
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 12346,
        "nickname": "张三",
        "avatar": "https://cdn.mobilif.com/avatars/12346.jpg",
        "level": "silver",
        "onlineStatus": "online", // online | offline | training
        "lastActiveAt": "2024-01-15T18:30:00+08:00",
        "currentActivity": {
          "type": "training",
          "gym": "MobiLiF CrossFit北京站",
          "class": "CrossFit WOD"
        },
        "friendSince": "2024-01-10T10:00:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 23,
      "totalPages": 1
    }
  }
}
```

### 9.2 动态发布

#### 发布动态
```http
POST /v1/posts
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "type": "workout", // workout | achievement | challenge | article
  "title": "今天的Fran训练",
  "content": "终于突破了8分钟大关！",
  "workoutData": {
    "wodName": "Fran",
    "score": "7:45",
    "movements": [
      {"name": "Thrusters", "weight": 43, "reps": 45},
      {"name": "Pull-ups", "reps": 45}
    ]
  },
  "gymId": 1001,
  "classId": 5001,
  "images": [
    (image file 1),
    (image file 2)
  ],
  "tags": ["Fran", "PR", "突破"],
  "visibility": "public", // public | friends | private
  "allowComments": true,
  "allowShare": true
}
```

**响应**
```json
{
  "code": 0,
  "message": "动态发布成功",
  "data": {
    "postId": 60001,
    "publishedAt": "2024-01-15T20:45:00+08:00",
    "images": [
      "https://cdn.mobilif.com/posts/60001/1.jpg",
      "https://cdn.mobilif.com/posts/60001/2.jpg"
    ],
    "pointsEarned": 15,
    "achievements": [
      {
        "name": "分享达人",
        "description": "发布10条训练动态"
      }
    ]
  }
}
```

#### 获取动态流
```http
GET /v1/feed?type=following&page=1&pageSize=20
Authorization: Bearer {token}
```

**查询参数**
- `type` - 动态类型：following|discover|nearby|popular
- `category` - 内容分类：workout|achievement|challenge|all
- `gymId` - 场馆过滤

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 60001,
        "type": "workout",
        "user": {
          "id": 12346,
          "nickname": "张三",
          "avatar": "https://cdn.mobilif.com/avatars/12346.jpg",
          "level": "silver"
        },
        "title": "今天的Fran训练",
        "content": "终于突破了8分钟大关！",
        "images": [
          "https://cdn.mobilif.com/posts/60001/1.jpg"
        ],
        "workoutData": {
          "wodName": "Fran",
          "score": "7:45",
          "improvement": "+0:15",
          "ranking": 3,
          "totalParticipants": 18
        },
        "location": {
          "gym": {
            "id": 1001,
            "name": "MobiLiF CrossFit北京站"
          }
        },
        "tags": ["Fran", "PR", "突破"],
        "stats": {
          "viewCount": 56,
          "likeCount": 23,
          "commentCount": 8,
          "shareCount": 3
        },
        "userInteraction": {
          "isLiked": false,
          "isSaved": false
        },
        "publishedAt": "2024-01-15T20:45:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### 9.3 互动功能

#### 点赞动态
```http
POST /v1/posts/60001/like
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "点赞成功",
  "data": {
    "likeId": 70001,
    "likeCount": 24,
    "pointsEarned": 1
  }
}
```

#### 评论动态
```http
POST /v1/posts/60001/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "厉害！什么时候一起训练？",
  "parentId": null, // 回复评论时填写父评论ID
  "mentions": [12346] // @用户ID列表
}
```

**响应**
```json
{
  "code": 0,
  "message": "评论成功",
  "data": {
    "commentId": 80001,
    "content": "厉害！什么时候一起训练？",
    "createdAt": "2024-01-15T21:00:00+08:00",
    "pointsEarned": 2
  }
}
```

#### 获取评论列表
```http
GET /v1/posts/60001/comments?page=1&pageSize=20&sortBy=newest
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 80001,
        "user": {
          "id": 12345,
          "nickname": "运动达人",
          "avatar": "https://cdn.mobilif.com/avatars/12345.jpg"
        },
        "content": "厉害！什么时候一起训练？",
        "parentId": null,
        "mentions": [
          {
            "userId": 12346,
            "nickname": "张三"
          }
        ],
        "likeCount": 5,
        "replyCount": 2,
        "isLiked": false,
        "isPinned": false,
        "createdAt": "2024-01-15T21:00:00+08:00",
        "replies": [
          {
            "id": 80002,
            "user": {
              "id": 12346,
              "nickname": "张三"
            },
            "content": "明天晚上7点有空吗？",
            "createdAt": "2024-01-15T21:05:00+08:00"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

## 10. B端管理 API

### 10.1 场馆管理

#### 获取场馆信息
```http
GET /v1/gym/profile
Authorization: Bearer {gym_token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "name": "MobiLiF CrossFit北京站",
    "status": "active",
    "businessLicense": "verified",
    "subscription": {
      "plan": "professional",
      "expiresAt": "2024-12-31T23:59:59+08:00",
      "features": ["unlimited_classes", "analytics", "marketing_tools"]
    },
    "stats": {
      "totalMembers": 350,
      "monthlyBookings": 1580,
      "revenue": 126400,
      "rating": 4.8
    }
  }
}
```

#### 更新场馆信息
```http
PUT /v1/gym/profile
Authorization: Bearer {gym_token}
Content-Type: application/json

{
  "description": "更新后的场馆描述",
  "businessHours": {
    "monday": "06:00-22:00",
    "tuesday": "06:00-22:00"
  },
  "facilities": ["器械区", "淋浴间", "休息区"],
  "contact": {
    "phone": "010-12345678",
    "wechat": "mobilif_bj_new"
  }
}
```

### 10.2 课程管理

#### 创建课程
```http
POST /v1/gym/classes
Authorization: Bearer {gym_token}
Content-Type: application/json

{
  "name": "CrossFit WOD",
  "type": "wod",
  "description": "今日WOD：Fran",
  "coachId": 2001,
  "startTime": "2024-01-16T19:00:00+08:00",
  "duration": 60,
  "maxCapacity": 20,
  "price": 80,
  "memberPrice": 60,
  "dropInPrice": 100,
  "equipmentNeeded": ["杠铃", "引体向上杠"],
  "difficultyLevel": "intermediate",
  "tags": ["WOD", "全身训练"]
}
```

**响应**
```json
{
  "code": 0,
  "message": "课程创建成功",
  "data": {
    "classId": 5002,
    "name": "CrossFit WOD",
    "startTime": "2024-01-16T19:00:00+08:00",
    "status": "scheduled",
    "bookingUrl": "https://app.mobilif.com/classes/5002"
  }
}
```

#### 获取课程列表
```http
GET /v1/gym/classes?date=2024-01-16&status=scheduled
Authorization: Bearer {gym_token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 5002,
        "name": "CrossFit WOD",
        "type": "wod",
        "coach": {
          "id": 2001,
          "name": "张教练"
        },
        "schedule": {
          "startTime": "2024-01-16T19:00:00+08:00",
          "endTime": "2024-01-16T20:00:00+08:00"
        },
        "capacity": {
          "maxCapacity": 20,
          "currentBookings": 8,
          "waitlistCount": 2
        },
        "revenue": {
          "confirmedRevenue": 520,
          "potentialRevenue": 960
        },
        "status": "scheduled"
      }
    ]
  }
}
```

### 10.3 预约管理

#### 获取预约列表
```http
GET /v1/gym/bookings?date=2024-01-16&status=confirmed
Authorization: Bearer {gym_token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 20002,
        "bookingNo": "BK202401160001",
        "user": {
          "id": 12345,
          "nickname": "运动达人",
          "phone": "138****5678",
          "level": "gold"
        },
        "class": {
          "id": 5002,
          "name": "CrossFit WOD",
          "startTime": "2024-01-16T19:00:00+08:00"
        },
        "status": "confirmed",
        "paymentStatus": "paid",
        "amount": 80,
        "checkInStatus": "pending",
        "specialRequests": "第一次参加",
        "createdAt": "2024-01-15T14:30:00+08:00"
      }
    ],
    "summary": {
      "totalBookings": 28,
      "confirmedBookings": 25,
      "pendingBookings": 2,
      "cancelledBookings": 1,
      "totalRevenue": 2240
    }
  }
}
```

#### 手动签到/签退
```http
POST /v1/gym/bookings/20002/check-in
Authorization: Bearer {gym_token}
Content-Type: application/json

{
  "action": "check_in", // check_in | check_out
  "notes": "准时到达，状态良好"
}
```

### 10.4 数据分析

#### 获取经营数据
```http
GET /v1/gym/analytics/overview?period=last_30_days
Authorization: Bearer {gym_token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "period": {
      "startDate": "2023-12-16",
      "endDate": "2024-01-15"
    },
    "revenue": {
      "total": 98560,
      "growth": 0.125,
      "avgPerClass": 62.5,
      "avgPerMember": 281.6
    },
    "bookings": {
      "total": 1576,
      "growth": 0.08,
      "conversionRate": 0.73,
      "cancelRate": 0.12,
      "noShowRate": 0.05
    },
    "members": {
      "active": 350,
      "new": 28,
      "churn": 12,
      "retention": 0.89
    },
    "classes": {
      "total": 120,
      "avgUtilization": 0.76,
      "mostPopular": "CrossFit WOD",
      "peakHours": ["19:00", "20:00"]
    },
    "satisfaction": {
      "avgRating": 4.8,
      "reviewCount": 89,
      "nps": 72
    }
  }
}
```

## 11. 错误码定义

### 11.1 通用错误码

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 0 | success | 成功 |
| 10001 | 参数错误 | 请求参数不正确 |
| 10002 | 参数缺失 | 必需参数缺失 |
| 10003 | 参数格式错误 | 参数格式不符合要求 |
| 10004 | 请求方法错误 | HTTP方法不支持 |
| 10005 | 请求头错误 | 请求头信息不正确 |

### 11.2 认证授权错误

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 20001 | 未认证 | 需要登录 |
| 20002 | Token无效 | Token格式错误或已过期 |
| 20003 | Token过期 | Token已过期，需要刷新 |
| 20004 | 权限不足 | 没有访问该资源的权限 |
| 20005 | 账户被禁用 | 用户账户已被禁用 |
| 20006 | 登录失败 | 用户名或密码错误 |
| 20007 | 验证码错误 | 验证码不正确或已过期 |

### 11.3 业务逻辑错误

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 30001 | 用户不存在 | 指定用户不存在 |
| 30002 | 手机号已存在 | 该手机号已被注册 |
| 30003 | 邮箱已存在 | 该邮箱已被注册 |
| 30004 | 场馆不存在 | 指定场馆不存在 |
| 30005 | 课程不存在 | 指定课程不存在 |
| 30006 | 课程已满员 | 课程人数已达上限 |
| 30007 | 预约不存在 | 指定预约不存在 |
| 30008 | 预约已取消 | 预约已被取消 |
| 30009 | 积分不足 | 用户积分余额不足 |
| 30010 | 重复预约 | 用户已预约该课程 |

### 11.4 支付相关错误

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 40001 | 支付失败 | 支付处理失败 |
| 40002 | 支付超时 | 支付超时 |
| 40003 | 余额不足 | 账户余额不足 |
| 40004 | 支付渠道错误 | 不支持的支付方式 |
| 40005 | 退款失败 | 退款处理失败 |
| 40006 | 重复支付 | 订单已支付 |

### 11.5 系统错误

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 50001 | 系统内部错误 | 服务器内部错误 |
| 50002 | 数据库错误 | 数据库操作失败 |
| 50003 | 缓存错误 | 缓存服务异常 |
| 50004 | 第三方服务错误 | 外部服务调用失败 |
| 50005 | 文件上传失败 | 文件上传处理失败 |
| 50006 | 消息发送失败 | 推送或通知发送失败 |

## 12. API调用示例

### 12.1 完整的预约流程示例

```javascript
// 1. 搜索附近场馆
const gyms = await fetch('/v1/gyms/search?lat=39.9042&lng=116.4074', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// 2. 获取场馆课程
const classes = await fetch('/v1/gyms/1001/classes?date=2024-01-16', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// 3. 创建预约
const booking = await fetch('/v1/bookings', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    classId: 5001,
    type: 'regular',
    specialRequests: '第一次参加'
  })
});

// 4. 支付订单
const payment = await fetch('/v1/payments', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderType: 'booking',
    orderId: booking.data.bookingId,
    amount: booking.data.payment.finalAmount,
    paymentMethod: 'wechat'
  })
});

// 5. 签到
const checkIn = await fetch(`/v1/bookings/${booking.data.bookingId}/check-in`, {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    method: 'qrcode',
    location: { latitude: 39.9042, longitude: 116.4074 }
  })
});
```

### 12.2 技能认证流程示例

```javascript
// 1. 获取技能树概览
const skillsOverview = await fetch('/v1/users/skills/overview', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// 2. 查看具体技能要求
const weightliftingSkills = await fetch('/v1/skills/categories/weightlifting', {
  headers: { 'Authorization': 'Bearer ' + token }
});

// 3. 提交技能认证
const formData = new FormData();
formData.append('skillNodeId', '101');
formData.append('level', '3');
formData.append('performanceData', JSON.stringify({
  weight: 75,
  reps: 1
}));
formData.append('video', videoFile);
formData.append('notes', '抓举75kg成功');

const submission = await fetch('/v1/skills/submit', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});
```

## 13. 总结

本API文档为MobiLiF拓练平台提供了完整的接口规范，涵盖了用户认证、场馆预约、游戏化系统、社交功能等核心模块。通过标准化的RESTful设计、统一的响应格式和完善的错误处理机制，确保前端应用能够高效、稳定地与后端服务进行交互，为用户提供流畅的使用体验。

随着产品功能的不断迭代，API接口也将持续优化和扩展，以支持更多创新功能和业务场景。