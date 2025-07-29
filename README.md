# 🚀 MobiLiF - 移动健身游戏化社交平台

![MobiLiF Logo](https://img.shields.io/badge/MobiLiF-v1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Redis](https://img.shields.io/badge/Redis-7.0-red)

## 📖 项目简介

MobiLiF 是一个基于微信小程序的创新移动健身游戏化社交平台，专注于 CrossFit 健身教学和社交互动。通过游戏化机制、技能地图、积分系统等功能，为健身爱好者提供完整的训练、学习和社交体验。

### 🎯 产品特色
- **游戏化体验**: 通过积分、徽章、等级系统激励用户持续锻炼
- **技能地图**: 系统化的 CrossFit 技能学习路径
- **社交互动**: 好友系统、群组训练、成就分享
- **智能匹配**: 基于位置和水平的健身房推荐
- **数据驱动**: 详细的训练记录和进度分析

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

## 🚀 快速开始

### 📋 环境要求
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **MySQL**: >= 8.0 (可选，可用 Docker 代替)
- **Redis**: >= 6.0 (可选，可用 Docker 代替)
- **Docker**: >= 20.0.0 (推荐)
- **Docker Compose**: >= 2.0.0 (推荐)

### ⚡ 一键启动（5分钟部署）

```bash
# 1. 克隆项目
git clone https://github.com/your-username/mobilif-project.git
cd mobilif-project

# 2. 快速设置（自动安装依赖、配置环境、启动服务）
npm run quick-setup

# 3. 验证安装
npm run quick-test
```

### 🛠️ 详细安装步骤

#### 1. 克隆和安装
```bash
# 克隆项目
git clone https://github.com/your-username/mobilif-project.git
cd mobilif-project

# 安装依赖
npm install
```

#### 2. 环境配置
```bash
# 复制环境配置文件
cp .env.example .env

# 编辑配置文件（设置数据库密码、服务器地址等）
code .env  # 或使用其他编辑器
```

**重要配置项**:
```env
# 服务器配置
SERVER_HOST=localhost           # 改为你的服务器IP
SERVER_PORT=3000
SERVER_API_BASE=http://localhost:3000

# 数据库配置
DB_HOST=localhost
DB_USERNAME=mobilif_app
DB_PASSWORD=your_strong_password_here  # 设置强密码
DB_DATABASE=mobilif

# JWT密钥（生产环境必须修改）
JWT_SECRET=your-super-secret-jwt-key
```

#### 3. 启动服务

**方式一：使用 Docker（推荐）**
```bash
# 启动所有服务
docker-compose up -d

# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

**方式二：本地安装**
```bash
# 启动 MySQL 和 Redis（需要本地安装）
brew services start mysql  # macOS
brew services start redis

# 启动开发服务器
npm run start:dev
```

#### 4. 数据库初始化
```bash
# 运行数据库迁移
npm run migration:run

# 填充测试数据
npm run seed
```

#### 5. 验证安装
```bash
# 运行完整测试
npm run quick-test

# 测试 API 连接
npm run test:api

# 检查服务器状态
npm run server:status
```

### 🌐 访问应用

安装完成后，你可以访问：

- **API 服务**: http://localhost:3000
- **API 文档**: http://localhost:3000/api/docs
- **健康检查**: http://localhost:3000/health
- **管理后台**: http://localhost:3001 (如果已配置)

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

## 🔗 本地开发设置

详细的本地开发环境设置请参考：[本地开发指南](docs/local-development.md)

包含内容：
- 📁 详细的项目结构说明
- ⚙️ 逐步环境配置指导
- 🛠️ VSCode 开发配置
- 🚨 常见问题故障排除
- 🔄 开发工作流程

## 📚 API 文档

### 在线文档
- **Swagger UI**: http://localhost:3000/api/docs (启动项目后访问)
- **API 接口文档**: [API接口文档.md](API接口文档.md)
- **数据库设计**: [数据库设计文档.md](数据库设计文档.md)

### API 端点概览
```
GET    /health              # 健康检查
GET    /api/users           # 获取用户列表
GET    /api/gyms            # 获取健身房列表
GET    /api/stats           # 获取统计数据
POST   /api/auth/login      # 用户登录
```

### 快速测试 API
```bash
# 测试健康检查
curl http://localhost:3000/health

# 测试所有 API 端点
npm run test:api
```

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

## 🚀 部署说明

### 🖥️ 服务器部署

#### 自动化部署
```bash
# 一键部署到生产服务器
npm run server:deploy

# 检查部署状态
npm run server:status

# 查看服务日志
npm run server:logs
```

#### 手动部署步骤
```bash
# 1. 服务器初始化（仅首次部署需要）
chmod +x scripts/deployment/server-init.sh
sudo ./scripts/deployment/server-init.sh

# 2. 数据库设置
chmod +x scripts/deployment/init-database.sql
./scripts/deployment/init-database.sql

# 3. 应用部署
chmod +x scripts/deployment/deploy.sh
./scripts/deployment/deploy.sh
```

### 🐳 Docker 部署

```bash
# 构建并启动所有服务
docker-compose -f docker-compose.yml up -d

# 生产环境部署
docker-compose -f config/production/docker-compose.production.yml up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f mobilif-backend
```

### ☁️ 云服务器部署

**支持的云平台**:
- ✅ 阿里云 ECS
- ✅ 腾讯云 CVM  
- ✅ AWS EC2
- ✅ 华为云 ECS

**部署配置**:
```bash
# 配置服务器信息（编辑 .env 文件）
SERVER_HOST=你的服务器IP
SSH_HOST=你的服务器IP
SSH_USER=root
REMOTE_PROJECT_PATH=/opt/mobilif

# 执行远程部署
npm run server:deploy
```

### 📊 监控和日志
- **应用监控**: PM2 进程管理 + 健康检查
- **服务监控**: Docker 容器状态监控
- **日志管理**: 自动日志轮转 + 远程日志查看
- **备份管理**: 定时数据库备份 + 文件备份

### 🔧 部署工具链
- **进程管理**: PM2
- **反向代理**: Nginx
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (可选配置)
- **监控**: Prometheus + Grafana (可选配置)

## 📋 常用命令列表

### 🚀 开发命令
```bash
# 启动开发服务器（热重载）
npm run start:dev

# 启动调试模式
npm run start:debug

# 构建项目
npm run build

# 启动生产模式
npm run start:prod

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 🧪 测试命令
```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 测试覆盖率报告
npm run test:cov

# 端到端测试
npm run test:e2e

# API 连接测试
npm run test:api

# 快速功能测试
npm run quick-test
```

### 🗄️ 数据库命令
```bash
# 生成新迁移文件
npm run migration:generate -- -n CreateUserTable

# 运行数据库迁移
npm run migration:run

# 回滚迁移
npm run migration:revert

# 填充测试数据
npm run seed
```

### 🖥️ 服务器管理命令
```bash
# 查看服务器状态
npm run server:status

# 重启服务器服务
npm run server:restart

# 创建服务器备份
npm run server:backup

# 查看服务器日志
npm run server:logs

# 重新部署服务器
npm run server:deploy
```

### 🐳 Docker 命令
```bash
# 启动所有服务
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [service-name]

# 停止所有服务
docker-compose down

# 重建并启动
docker-compose up -d --build
```

### 🔧 开发工具命令
```bash
# 安装新依赖
npm install [package-name]

# 安装开发依赖
npm install -D [package-name]

# 更新依赖
npm update

# 查看过时依赖
npm outdated

# 清理 node_modules
rm -rf node_modules && npm install
```

### 🔍 调试命令
```bash
# 查看应用配置
node -e "console.log(require('./config/api'))"

# 测试数据库连接
npm run migration:run

# 检查端口占用
lsof -i :3000

# 查看进程状态
ps aux | grep node
```

## 🤝 贡献指南

### 开发流程
1. **Fork 项目** 到你的 GitHub 账户
2. **克隆项目** `git clone your-fork-url`
3. **创建分支** `git checkout -b feature/amazing-feature`
4. **进行开发** 并遵循代码规范
5. **运行测试** `npm run test`
6. **提交代码** `git commit -m 'feat: add amazing feature'`
7. **推送分支** `git push origin feature/amazing-feature`
8. **创建 PR** 提交 Pull Request

### 代码规范
- 使用 **TypeScript** 进行类型检查
- 遵循 **ESLint** 规则
- 使用 **Prettier** 格式化代码
- 编写 **单元测试** 覆盖新功能
- 更新相关 **文档**

### 提交信息规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

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