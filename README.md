# MobiLiF - 移动健身游戏化社交平台

![MobiLiF Logo](https://img.shields.io/badge/MobiLiF-v1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Redis](https://img.shields.io/badge/Redis-7.0-red)

## 项目简介

MobiLiF是一个基于微信小程序的移动健身游戏化社交平台，专注于CrossFit健身教学和社交互动。通过游戏化机制、技能地图、积分系统等功能，为健身爱好者提供完整的训练、学习和社交体验。

## 核心功能

- 🏃‍♂️ **用户系统**: 微信授权登录、用户档案管理、身体数据追踪
- 🏟️ **场馆管理**: 健身房信息、教练管理、课程预约系统
- 🎯 **技能地图**: CrossFit技能树、技能认证、进度追踪
- 🎮 **游戏化系统**: 积分奖励、等级系统、成就徽章、排行榜
- 👥 **社交功能**: 好友系统、动态分享、群组训练、互动评论
- 📊 **数据分析**: 训练记录、数据可视化、个人报告
- 💰 **支付体系**: 微信支付、会员制度、课程购买

## 技术架构

### 后端技术栈
- **框架**: NestJS 10.x + TypeScript 5.x
- **数据库**: MySQL 8.0 (主从复制) + Redis 7.0 (集群)
- **消息队列**: RocketMQ
- **容器化**: Docker + Kubernetes
- **API网关**: Kong
- **服务发现**: Nacos
- **监控**: Prometheus + Grafana

### 前端技术栈
- **小程序**: 微信原生开发
- **管理后台**: Vue 3 + Element Plus
- **实时通讯**: WebSocket

### 微服务架构
```
┌─────────────────┬─────────────────┬─────────────────┐
│   用户服务      │   场馆服务      │   预约服务      │
│  User Service   │   Gym Service   │ Booking Service │
└─────────────────┴─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┬─────────────────┐
│   游戏服务      │   社交服务      │   通知服务      │
│  Game Service   │ Social Service  │ Notify Service  │
└─────────────────┴─────────────────┴─────────────────┘
```

## 项目结构

```
mobilif-project/
├── src/                          # 源代码
│   ├── controllers/               # 控制器
│   ├── services/                  # 业务逻辑服务
│   ├── models/                    # 数据模型
│   ├── middlewares/               # 中间件
│   ├── utils/                     # 工具函数
│   ├── config/                    # 配置文件
│   └── modules/                   # 功能模块
│       ├── user/                  # 用户模块
│       ├── gym/                   # 场馆模块
│       ├── booking/               # 预约模块
│       ├── game/                  # 游戏模块
│       ├── social/                # 社交模块
│       └── notification/          # 通知模块
├── tests/                         # 测试文件
│   ├── unit/                      # 单元测试
│   ├── integration/               # 集成测试
│   └── e2e/                       # 端到端测试
├── docs/                          # 文档
│   ├── api/                       # API文档
│   └── deployment/                # 部署文档
├── scripts/                       # 脚本文件
├── logs/                          # 日志文件
├── config/                        # 配置文件
├── docker-compose.yml             # Docker编排文件
├── Dockerfile                     # Docker构建文件
├── package.json                   # 项目依赖
└── README.md                      # 项目说明
```

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- Docker >= 20.0.0
- Docker Compose >= 2.0.0

### 本地开发环境搭建

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd mobilif-project
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **环境配置**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库和其他服务连接信息
   ```

4. **启动开发环境**
   ```bash
   # 启动所有服务（数据库、Redis、消息队列等）
   docker-compose up -d
   
   # 等待服务启动完成后，启动应用
   npm run start:dev
   ```

5. **数据库初始化**
   ```bash
   # 运行数据库迁移
   npm run migration:run
   
   # 运行种子数据
   npm run seed
   ```

### Docker 部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f mobilif-backend
```

## 开发指南

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用 Conventional Commits 规范提交信息

### 测试
```bash
# 单元测试
npm run test

# 集成测试
npm run test:e2e

# 测试覆盖率
npm run test:cov
```

### API 文档
启动项目后访问 `http://localhost:3000/api` 查看 Swagger API 文档

## 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=mobilif_user
DB_PASSWORD=mobilif_pass
DB_DATABASE=mobilif

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret

# 支付配置
WECHAT_MCH_ID=your-merchant-id
WECHAT_KEY=your-payment-key
```

## 部署说明

### 生产环境部署
1. 使用 Kubernetes 进行容器编排
2. 配置 Ingress 进行流量管理
3. 使用 Helm Charts 管理部署
4. 配置监控和日志收集

### 监控和日志
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **链路追踪**: Jaeger
- **错误追踪**: Sentry

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系我们

- 项目地址: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 技术支持: [技术团队邮箱]

## 更新日志

### v1.0.0 (2024-01-01)
- 🎉 项目初始化
- ✨ 用户系统基础功能
- ✨ 场馆管理系统
- ✨ 预约系统
- ✨ 技能地图功能
- ✨ 游戏化系统
- ✨ 社交功能基础版本