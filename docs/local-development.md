# MobiLiF 本地开发指南

> 本指南帮助新开发者快速搭建 MobiLiF 项目的本地开发环境

## 📋 目录
- [项目结构说明](#项目结构说明)
- [环境配置步骤](#环境配置步骤)
- [常用命令说明](#常用命令说明)
- [故障排除指南](#故障排除指南)
- [VSCode配置](#vscode配置)
- [开发工作流](#开发工作流)

## 🗂️ 项目结构说明

```
mobilif-project/
├── 📁 config/                     # 配置文件
│   ├── api.js                     # API环境配置
│   ├── api-client.js              # API客户端
│   └── production/                # 生产环境配置
│       ├── docker-compose.production.yml
│       ├── nginx.conf
│       └── .env.production
│
├── 📁 docs/                       # 项目文档
│   ├── api/                       # API文档
│   └── deployment/                # 部署文档
│
├── 📁 scripts/                    # 脚本工具
│   ├── deployment/                # 部署脚本
│   │   ├── deploy.sh              # 主部署脚本
│   │   ├── init-database.sql      # 数据库初始化
│   │   ├── quick-setup.sh         # 快速安装
│   │   └── server-init.sh         # 服务器初始化
│   ├── server-manager.js          # 服务器管理工具
│   ├── test-remote-api.js         # API测试工具
│   └── quick-test.js              # 快速测试工具
│
├── 📁 src/                        # 源代码
│   ├── config/                    # 应用配置
│   ├── controllers/               # 控制器
│   ├── database/                  # 数据库相关
│   │   ├── migrations/            # 数据库迁移
│   │   └── seeds/                 # 初始数据
│   ├── middlewares/               # 中间件
│   ├── models/                    # 数据模型
│   ├── modules/                   # 业务模块
│   │   ├── booking/               # 预订模块
│   │   ├── game/                  # 游戏化模块
│   │   ├── gym/                   # 健身房模块
│   │   ├── notification/          # 通知模块
│   │   ├── social/                # 社交模块
│   │   └── user/                  # 用户模块
│   ├── services/                  # 服务层
│   └── utils/                     # 工具函数
│
├── 📁 tests/                      # 测试文件
│   ├── e2e/                       # 端到端测试
│   ├── integration/               # 集成测试
│   └── unit/                      # 单元测试
│
├── 📁 prisma/                     # Prisma ORM
│   └── schema.prisma              # 数据库模型
│
├── 📄 .env.example                # 环境变量示例
├── 📄 .env                        # 环境变量配置（需要创建）
├── 📄 package.json                # 项目依赖
├── 📄 docker-compose.yml          # Docker编排
├── 📄 Dockerfile                  # Docker镜像
└── 📄 README.md                   # 项目说明
```

## ⚙️ 环境配置步骤

### 1. 系统要求

确保你的开发环境满足以下要求：

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 
- **Git**: 最新版本
- **MySQL**: >= 8.0 （可选，可用Docker代替）
- **Redis**: >= 6.0 （可选，可用Docker代替）

检查版本：
```bash
node --version    # 应显示 v18.x.x 或更高
npm --version     # 应显示 8.x.x 或更高
git --version     # 确认已安装
```

### 2. 克隆项目

```bash
# 克隆项目到本地
git clone https://github.com/your-username/mobilif-project.git
cd mobilif-project

# 查看项目结构
ls -la
```

### 3. 安装依赖

```bash
# 安装项目依赖
npm install

# 验证安装
npm list --depth=0
```

如果遇到安装问题，可以尝试：
```bash
# 清理缓存后重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 4. 环境变量配置

#### 4.1 创建环境配置文件

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
code .env  # 使用 VSCode 编辑
# 或
nano .env  # 使用 nano 编辑
```

#### 4.2 配置必要的环境变量

编辑 `.env` 文件，设置以下关键配置：

```bash
# ==========================================
# 基础配置
# ==========================================
NODE_ENV=development
PORT=3000
APP_NAME=MobiLiF
APP_URL=http://localhost:3000

# ==========================================
# 数据库配置
# ==========================================
DATABASE_URL="mysql://mobilif_app:your_password@localhost:3306/mobilif"
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=mobilif_app
DB_PASSWORD=your_strong_password_here
DB_DATABASE=mobilif

# ==========================================
# Redis配置
# ==========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ==========================================
# JWT配置（开发环境可用默认值）
# ==========================================
JWT_SECRET=your-dev-jwt-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-dev-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# ==========================================
# 微信小程序配置
# ==========================================
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret

# ==========================================
# 开发配置
# ==========================================
DEBUG_ENABLED=true
SWAGGER_ENABLED=true
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=false
```

> ⚠️ **重要提示**: 
> - 将 `your_password` 替换为你的数据库密码
> - 生产环境中请使用强密码
> - 不要将 `.env` 文件提交到版本控制

### 5. 数据库设置

#### 5.1 使用 Docker（推荐）

```bash
# 启动数据库服务
docker-compose up -d mysql redis

# 检查服务状态
docker-compose ps
```

#### 5.2 本地安装 MySQL

如果你更喜欢本地安装：

**macOS (使用 Homebrew):**
```bash
# 安装 MySQL
brew install mysql

# 启动服务
brew services start mysql

# 连接 MySQL
mysql -u root -p
```

**创建数据库和用户:**
```sql
-- 创建数据库
CREATE DATABASE mobilif CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'mobilif_app'@'localhost' IDENTIFIED BY 'your_strong_password_here';

-- 授权
GRANT ALL PRIVILEGES ON mobilif.* TO 'mobilif_app'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 6. 数据库迁移

```bash
# 运行数据库迁移
npm run migration:run

# 填充初始数据
npm run seed
```

### 7. 启动开发服务器

```bash
# 启动开发服务器
npm run start:dev

# 如果一切正常，你应该看到：
# [INFO] 服务器启动成功
# [INFO] 端口: 3000
# [INFO] 环境: development
# [INFO] API文档: http://localhost:3000/api/docs
```

## 🛠️ 常用命令说明

### 开发命令

```bash
# 启动开发服务器（热重载）
npm run start:dev

# 启动调试模式
npm run start:debug

# 构建项目
npm run build

# 启动生产模式
npm run start:prod
```

### 测试命令

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:cov

# 运行端到端测试
npm run test:e2e

# 测试远程API连接
npm run test:api

# 快速测试所有功能
npm run quick-test
```

### 数据库命令

```bash
# 生成新的迁移文件
npm run migration:generate -- -n CreateUserTable

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert

# 填充数据
npm run seed
```

### 代码质量

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint -- --fix

# 格式化代码
npm run format
```

### 服务器管理

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

## 🚨 故障排除指南

### 1. 端口占用问题

**问题**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方法**:
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>

# 或者更改端口
export PORT=3001
npm run start:dev
```

### 2. 数据库连接失败

**问题**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方法**:
```bash
# 检查MySQL是否运行
brew services list | grep mysql
# 或
docker ps | grep mysql

# 启动MySQL服务
brew services start mysql
# 或
docker-compose up -d mysql

# 测试连接
mysql -h localhost -u mobilif_app -p mobilif
```

### 3. 依赖安装失败

**问题**: npm install 出现错误

**解决方法**:
```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 使用yarn代替npm
npm install -g yarn
yarn install
```

### 4. 权限问题

**问题**: `Error: EACCES: permission denied`

**解决方法**:
```bash
# 修复npm权限
sudo chown -R $(whoami) ~/.npm

# 或者使用nvm管理Node.js版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 5. 环境变量问题

**问题**: `JWT_SECRET is not defined`

**解决方法**:
```bash
# 检查.env文件是否存在
ls -la | grep .env

# 验证环境变量
node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET)"

# 确保.env文件格式正确（无空格，正确的等号）
```

### 6. TypeScript编译错误

**问题**: 类型错误或编译失败

**解决方法**:
```bash
# 重新构建
npm run build

# 检查TypeScript配置
npx tsc --showConfig

# 更新类型定义
npm update @types/node @types/express
```

## 💻 VSCode配置

### 1. 推荐扩展

在项目根目录创建 `.vscode/extensions.json`：

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-docker",
    "ckolkman.vscode-postgres",
    "redhat.vscode-yaml"
  ]
}
```

### 2. VSCode设置

创建 `.vscode/settings.json`：

```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
```

### 3. VSCode任务配置

创建 `.vscode/tasks.json`：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "启动开发服务器",
      "type": "npm",
      "script": "start:dev",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": ["$tsc-watch"]
    },
    {
      "label": "运行测试",
      "type": "npm",
      "script": "test",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "构建项目",
      "type": "npm",
      "script": "build",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "代码检查",
      "type": "npm",
      "script": "lint",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "problemMatcher": ["$eslint-stylish"]
    },
    {
      "label": "API测试",
      "type": "npm",
      "script": "test:api",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "快速测试",
      "type": "npm",
      "script": "quick-test",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

### 4. 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "启动开发服务器",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/main.js",
      "preLaunchTask": "构建项目",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "envFile": "${workspaceFolder}/.env",
      "console": "integratedTerminal",
      "restart": true,
      "runtimeArgs": ["--nolazy"],
      "sourceMaps": true
    },
    {
      "name": "调试测试",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### 5. 使用VSCode任务

#### 运行任务
1. 按 `Ctrl+Shift+P` (macOS: `Cmd+Shift+P`)
2. 输入 "Tasks: Run Task"
3. 选择要运行的任务

#### 快捷键
- `Ctrl+Shift+P` → "Tasks: Run Build Task" → 运行默认构建任务
- `F5` → 启动调试
- `Ctrl+Shift+\`` → 打开新终端

#### 任务面板
- 查看 → 终端 → 选择任务输出
- 可以同时运行多个任务

## 🔄 开发工作流

### 1. 日常开发流程

```bash
# 1. 更新代码
git pull origin main

# 2. 安装新依赖（如果有）
npm install

# 3. 启动开发服务器
npm run start:dev

# 4. 进行开发...
# 5. 运行测试
npm test

# 6. 代码检查
npm run lint

# 7. 提交代码
git add .
git commit -m "feat: 添加新功能"
git push origin feature/new-feature
```

### 2. 分支管理

```bash
# 创建新功能分支
git checkout -b feature/user-authentication

# 开发完成后合并到主分支
git checkout main
git merge feature/user-authentication

# 删除已合并的分支
git branch -d feature/user-authentication
```

### 3. 代码提交规范

使用约定式提交格式：

```bash
git commit -m "feat: 添加用户认证功能"
git commit -m "fix: 修复登录页面验证错误"
git commit -m "docs: 更新API文档"
git commit -m "style: 格式化代码"
git commit -m "refactor: 重构用户服务"
git commit -m "test: 添加用户服务测试"
```

### 4. 发布流程

```bash
# 1. 更新版本号
npm version patch  # 补丁版本
npm version minor  # 次版本
npm version major  # 主版本

# 2. 构建生产版本
npm run build

# 3. 运行完整测试
npm run test:cov

# 4. 部署到服务器
npm run server:deploy
```

## 📚 其他资源

### 相关文档
- [API接口文档](../API接口文档.md)
- [数据库设计文档](../数据库设计文档.md)
- [技术架构详细设计](../MobiLiF技术架构详细设计.md)

### 在线资源
- [NestJS 官方文档](https://nestjs.com/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Prisma 官方文档](https://www.prisma.io/)
- [Docker 官方文档](https://docs.docker.com/)

### 社区支持
- 项目Issue: [GitHub Issues](https://github.com/your-username/mobilif-project/issues)
- 技术讨论: [GitHub Discussions](https://github.com/your-username/mobilif-project/discussions)

---

## ❓ 需要帮助？

如果你在本地开发过程中遇到问题：

1. **查看日志**: `npm run server:logs`
2. **运行诊断**: `npm run quick-test`
3. **检查配置**: 确认 `.env` 文件配置正确
4. **重启服务**: `npm run server:restart`
5. **提交Issue**: 在GitHub上创建新Issue

> 💡 **提示**: 建议首次设置时按照本指南逐步操作，确保每个步骤都成功完成后再进行下一步。

**Happy Coding! 🎉**