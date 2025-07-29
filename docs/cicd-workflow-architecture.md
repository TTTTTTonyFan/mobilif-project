# MobiLiF CI/CD Workflow 架构设计

## 概述

本文档定义了MobiLiF项目完整的开发-测试-部署工作流程，支持从需求输入到生产环境部署的全自动化流程。

## 工作流程架构

### 第一阶段：需求驱动开发
```
用户故事输入 → 需求分析 → 技术设计 → 前后端开发
```

#### 输入格式
- 用户故事格式：`作为[角色]，我希望[功能]，以便[价值]`
- 支持的业务域：用户管理、场馆管理、预约系统、游戏化系统、社交功能

#### 自动化开发流程
1. **需求解析**：Claude Code解析用户故事，生成技术任务
2. **API设计**：自动生成RESTful API接口定义
3. **数据库设计**：更新Prisma schema，生成迁移文件
4. **前端组件**：基于React/TypeScript生成UI组件
5. **后端服务**：基于NestJS生成控制器和服务

### 第二阶段：自动化测试
```
代码提交 → 单元测试 → 集成测试 → API测试 → E2E测试
```

#### 测试层级
1. **单元测试** (Jest)
   - 后端服务逻辑测试
   - 前端组件测试
   - 工具函数测试

2. **集成测试**
   - 数据库连接测试
   - Redis缓存测试
   - 第三方服务集成测试

3. **API测试** (Postman/Newman)
   - RESTful API端点测试
   - 认证授权测试
   - 数据验证测试

4. **E2E测试**
   - 用户流程测试
   - 跨模块功能测试

### 第三阶段：微信开发助手同步
```
测试通过 → 构建小程序包 → 上传开发版 → 生成预览二维码
```

#### 同步机制
1. **自动构建**：编译微信小程序代码
2. **版本管理**：自动版本号递增
3. **上传机制**：使用微信开发者工具CLI
4. **通知系统**：生成预览链接和二维码

### 第四阶段：GitHub部署
```
用户确认 → 代码合并 → GitHub Actions → 自动部署
```

#### 部署流程
1. **代码审查**：自动代码质量检查
2. **构建镜像**：Docker镜像构建和推送
3. **环境部署**：生产环境自动部署
4. **健康检查**：服务状态监控

## 技术组件

### 开发环境
- **后端**: NestJS + TypeScript + MySQL + Redis
- **前端**: React + TypeScript + Redux
- **小程序**: 微信小程序原生开发
- **数据库**: MySQL + Prisma ORM

### 测试工具
- **单元测试**: Jest + Supertest
- **API测试**: Postman + Newman
- **E2E测试**: 自定义测试脚本
- **代码质量**: ESLint + Prettier

### CI/CD工具
- **版本控制**: Git + GitHub
- **自动化**: GitHub Actions
- **容器化**: Docker + Docker Compose
- **部署**: 阿里云服务器
- **监控**: 自定义监控脚本

### 微信开发助手集成
- **CLI工具**: 微信开发者工具命令行
- **自动上传**: ci 机器人
- **预览生成**: 二维码自动生成

## 配置文件结构

```
mobilif-project/
├── .github/
│   └── workflows/
│       ├── development.yml      # 开发环境workflow
│       ├── testing.yml          # 测试workflow  
│       ├── miniprogram.yml      # 小程序同步workflow
│       └── production.yml       # 生产环境部署workflow
├── scripts/
│   ├── workflow/
│   │   ├── dev-workflow.js      # 开发流程脚本
│   │   ├── test-workflow.js     # 测试流程脚本
│   │   ├── miniprogram-sync.js  # 小程序同步脚本
│   │   └── deploy-workflow.js   # 部署流程脚本
│   └── automation/
│       ├── story-parser.js      # 用户故事解析
│       ├── code-generator.js    # 代码生成器
│       └── test-runner.js       # 测试运行器
├── config/
│   ├── workflow/
│   │   ├── development.json     # 开发环境配置
│   │   ├── testing.json         # 测试环境配置
│   │   └── production.json      # 生产环境配置
│   └── miniprogram/
│       ├── project.config.json  # 小程序项目配置
│       └── ci.config.json       # CI配置
└── docs/
    ├── workflow-guide.md        # 工作流使用指南
    ├── testing-guide.md         # 测试指南
    └── deployment-guide.md      # 部署指南
```

## 执行命令

### 完整工作流程
```bash
# 启动完整开发workflow
npm run workflow:dev "作为用户，我希望查看附近的健身房列表，以便选择合适的场馆"

# 运行测试流程
npm run workflow:test

# 同步到微信开发助手
npm run workflow:miniprogram

# 部署到生产环境
npm run workflow:deploy
```

### 分步执行
```bash
# 开发阶段
npm run dev:story-parse        # 解析用户故事
npm run dev:generate          # 生成代码
npm run dev:integrate         # 集成到现有代码

# 测试阶段  
npm run test:unit             # 单元测试
npm run test:integration      # 集成测试
npm run test:api              # API测试
npm run test:e2e              # E2E测试

# 部署阶段
npm run deploy:build          # 构建应用
npm run deploy:miniprogram    # 部署小程序
npm run deploy:production     # 部署生产环境
```

## 质量保证

### 代码质量
- TypeScript 严格模式
- ESLint + Prettier 代码规范
- 测试覆盖率 > 80%
- 代码审查机制

### 测试覆盖
- 单元测试覆盖率 > 90%
- API测试覆盖所有端点
- E2E测试覆盖核心用户流程
- 性能测试和安全测试

### 部署安全
- 环境变量管理
- 数据库迁移验证
- 回滚机制
- 健康检查和监控

## 监控和日志

### 实时监控
- 服务健康状态
- API响应时间
- 数据库连接状态
- 错误率监控

### 日志管理
- 结构化日志记录
- 错误追踪和报警
- 性能指标收集
- 审计日志

## 扩展性

### 支持的功能模块
- 用户认证和授权
- 场馆管理和搜索
- 预约和支付系统
- 游戏化积分系统
- 社交互动功能
- 通知推送系统

### 可扩展组件
- 新的测试类型
- 额外的部署环境
- 第三方服务集成
- 监控和报警系统

这个workflow架构提供了完整的自动化开发流程，支持从需求输入到生产部署的全生命周期管理。