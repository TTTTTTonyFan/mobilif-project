# 🚀 MobiLiF 完整开发-测试-部署 Workflow 使用指南

## 📖 概述

本指南描述了 MobiLiF 项目的完整自动化工作流程，从用户故事输入到生产环境部署的全流程自动化。

## 🔄 工作流程架构

### 新版工作流程（包含iPhone模拟器）
```
用户故事输入 → 自动开发 → 本地模拟器展示 → 手动测试 → 自动化测试 → GitHub同步 → 微信部署 → 生产环境
     ↓            ↓            ↓             ↓         ↓          ↓         ↓          ↓
  Claude解析  → 代码生成 → iPhone模拟器 → 功能验证 → 测试套件 → 代码仓库 → 微信预览 → 服务器部署
```

## 🛠️ 环境准备

### 必需工具
- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker & Docker Compose
- Git
- MySQL 8.0
- Redis 7.0
- Xcode (macOS) - 用于iPhone模拟器
- Android Studio (可选) - 用于Android模拟器

### 环境变量设置
```bash
# 数据库配置
export DATABASE_URL="mysql://root:password@localhost:3306/mobilif_dev"
export REDIS_URL="redis://localhost:6379"

# JWT配置
export JWT_SECRET="your-jwt-secret-key"

# 微信小程序配置
export MINIPROGRAM_APP_ID="wx0a950fd30b3c2146"
export WECHAT_CI_KEY="path/to/private.key"

# 部署配置
export DEPLOYMENT_SERVER="8.147.235.48"
export DEPLOYMENT_SSH_KEY="path/to/ssh/key"

# Docker配置
export DOCKER_REGISTRY="registry.cn-hangzhou.aliyuncs.com"
export DOCKER_NAMESPACE="mobilif"
```

## 🎯 完整工作流执行

### 方式一：一键执行完整流程

```bash
# 执行完整的开发-测试-部署流程
npm run workflow:complete "作为用户，我希望查看附近的健身房列表，以便选择合适的场馆"
```

### 方式二：分步执行

#### 第一步：开发阶段
```bash
# 执行开发workflow（包含iPhone模拟器）
npm run workflow:dev "作为用户，我希望查看附近的健身房列表，以便选择合适的场馆"

# 可选参数
npm run workflow:dev "用户故事" --skip-tests --skip-format --skip-interaction

# 指定iPhone设备型号
npm run workflow:dev "用户故事" --device="iPhone 15 Pro"
```

**工作流步骤：**
1. 📝 解析用户故事
2. 🔧 生成技术任务
3. 💻 生成代码
4. 🔗 集成代码
5. 🚀 启动本地服务
6. 📱 部署到iPhone模拟器
7. 🧪 等待手动测试确认
8. 📊 生成开发报告

**输出结果：**
- 生成的前后端代码文件
- 数据库迁移文件
- 测试文件
- iPhone模拟器运行状态
- 开发报告 (`dev-workflow-report.md`)

#### 第二步：手动测试确认（iPhone模拟器）

在iPhone模拟器中进行手动测试：

**测试要点：**
- ✅ 功能测试：验证新功能是否正常工作
- 🎨 UI测试：检查界面显示是否正确
- 📱 响应式测试：检查不同屏幕尺寸的适配
- 🔗 交互测试：验证触摸、滑动等手势操作
- 🚀 性能测试：检查页面加载速度和响应时间

**调试工具：**
- Safari开发者工具：Safari → 开发 → Simulator → iPhone
- Xcode调试工具：Xcode → Window → Devices and Simulators
- 性能监控：Xcode → Open Developer Tool → Instruments

#### 第三步：自动化测试阶段
```bash
# 手动测试通过后，执行自动化测试
npm run test:all

# 可选参数
npm run test:all -- --continue --skip="性能测试"
```

**测试类型：**
- ✅ 单元测试 (Jest)
- ✅ 集成测试 (数据库 + API)
- ✅ API测试 (Postman/Newman)
- ✅ E2E测试 (端到端)
- ⚡ 性能测试 (可选)

**输出结果：**
- 测试报告 (`automated-test-report.html`)
- 覆盖率报告 (`coverage/`)
- 性能测试结果

#### 第四步：GitHub同步
```bash
# 自动化测试通过后，同步到GitHub
npm run sync:github

# 或在工作流中会自动提示
```

#### 第五步：小程序同步
```bash
# 同步到微信开发助手
npm run workflow:miniprogram

# 指定版本和描述
npm run workflow:miniprogram --version "1.2.3" --desc "新增健身房列表功能"
```

**执行流程：**
1. 🔨 构建小程序代码
2. 📱 上传到微信开发者平台
3. 🔍 生成预览二维码
4. 📋 创建测试指南
5. 📝 生成GitHub Issue

**输出结果：**
- 预览二维码 (`preview-qr-code.png`)
- 测试指南 (`miniprogram-test-guide.md`)
- GitHub测试Issue

#### 第六步：微信小程序测试确认

1. **扫描预览二维码**
   - 使用微信扫描生成的二维码
   - 在微信中打开小程序预览版本

2. **进行功能测试**
   - 验证新功能是否正常工作
   - 检查用户界面是否正确显示
   - 测试API接口调用是否成功

3. **反馈测试结果**
   - 在相应的GitHub Issue中回复
   - 评论 "测试通过" 以触发自动部署
   - 或报告发现的问题

#### 第七步：生产部署
```bash
# 手动触发部署
npm run workflow:deploy --force

# 跳过某些步骤
npm run workflow:deploy --force --skip-tests --skip-migrations
```

**部署流程：**
1. 🔍 环境检查
2. 🔨 构建Docker镜像
3. 🧪 运行部署前测试
4. 💾 备份当前版本
5. 🚀 部署到服务器
6. 🗄️ 运行数据库迁移
7. 🔍 健康检查
8. 📊 生成部署报告

## 📋 GitHub Actions 自动化

### 触发方式

1. **开发触发**
   ```bash
   # 推送到开发分支
   git push origin development
   
   # 或手动触发
   gh workflow run development.yml -f user_story="用户故事内容"
   ```

2. **测试触发**
   - 开发workflow完成后自动触发
   - 或推送到main分支时触发

3. **小程序同步触发**
   - 测试workflow完成后自动触发
   - 生成预览二维码和测试Issue

4. **生产部署触发**
   - 用户在测试Issue中回复"测试通过"
   - 或手动触发生产部署workflow

### GitHub Secrets 配置

在GitHub仓库设置中添加以下Secrets：

```
DATABASE_URL=mysql://username:password@host:3306/database
REDIS_URL=redis://host:6379
JWT_SECRET=your-jwt-secret
WECHAT_CI_KEY=your-wechat-private-key-content
DEPLOYMENT_SSH_KEY=your-ssh-private-key
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

## 🧪 测试策略

### 单元测试
```bash
# 运行所有单元测试
npm run test

# 运行特定模块测试
npm run test -- --testPathPattern=gym

# 生成覆盖率报告
npm run test:cov
```

### 集成测试
```bash
# 运行集成测试
npm run test:integration

# 调试模式
npm run test:integration -- --verbose
```

### API测试
```bash
# 使用Postman集合
npm run test:api

# 手动测试特定端点
curl http://localhost:3000/api/health
```

### E2E测试
```bash
# 运行端到端测试
npm run test:e2e

# 指定浏览器
npm run test:e2e -- --browser=chrome
```

## 🍎 iPhone模拟器开发测试

### 快速启动
```bash
# 启动iPhone模拟器（默认iPhone 15）
npm run ios-simulator

# 使用特定设备
npm run xcode -- --device "iPhone 15 Pro"

# 快捷命令
npm run ios
```

### 模拟器控制快捷键
- **Cmd+Shift+H**: 回到主屏幕
- **Cmd+R**: 刷新页面
- **Cmd+K**: 切换键盘
- **Cmd+1/2/3**: 切换缩放级别
- **Device → Rotate**: 旋转设备
- **Device → Shake**: 摇晃设备

### Safari调试
1. 在Mac Safari中启用开发菜单
2. 在iPhone模拟器中打开应用
3. Safari → 开发 → Simulator → iPhone
4. 可以检查元素、调试JavaScript、查看网络请求

### 性能分析
```bash
# 使用Instruments进行性能分析
# Xcode → Open Developer Tool → Instruments
```

### 截图和录屏
```bash
# 截取屏幕截图
xcrun simctl io booted screenshot screenshot.png

# 录制视频
xcrun simctl io booted recordVideo recording.mp4
```

## 📱 小程序开发和测试

### 本地开发
1. 安装微信开发者工具
2. 导入项目 (`/miniprogram` 目录)
3. 配置AppID: `wx0a950fd30b3c2146`
4. 启动本地服务器: `npm run start:dev`

### 预览和测试
```bash
# 生成预览二维码
npm run miniprogram:preview

# 生成多场景预览
npm run miniprogram:preview --scenes

# 上传开发版本
npm run miniprogram:upload --version "1.0.1" --desc "功能更新"
```

### 真机调试
1. 在微信开发者工具中开启远程调试
2. 扫描调试二维码
3. 在真机上进行功能测试

## 🚀 部署和运维

### 本地部署测试
```bash
# 使用Docker Compose
docker-compose up -d

# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 生产环境部署
```bash
# 完整部署流程
npm run deploy:production --force

# 快速部署（跳过测试）
npm run deploy:production --force --skip-tests

# 仅部署应用（跳过数据库迁移）
npm run deploy:production --force --skip-migrations
```

### 监控和维护
```bash
# 检查服务状态
npm run server:status

# 查看服务器日志
npm run server:logs

# 重启服务
npm run server:restart

# 创建备份
npm run server:backup
```

## 🔧 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库状态
npm run test:db-connection

# 重置数据库
npm run migration:reset
npm run seed
```

#### 2. Docker构建失败
```bash
# 清理Docker缓存
docker system prune -a

# 重新构建镜像
docker-compose build --no-cache
```

#### 3. 微信小程序上传失败
```bash
# 检查AppID和私钥
npm run miniprogram:validate

# 更新小程序配置
npm run miniprogram:config --appid "wx123456" --version "1.0.1"
```

#### 4. 部署失败回滚
```bash
# 自动回滚到上一版本
npm run deploy:rollback

# 手动指定回滚版本
npm run deploy:rollback --version "backup-20240101-120000"
```

#### 5. iPhone模拟器问题
```bash
# Xcode不可用
xcode-select --install

# 检查Xcode路径
xcode-select -p

# 模拟器启动失败
# 1. 重启Simulator应用
# 2. 清除模拟器缓存：Device → Erase All Content and Settings
# 3. 重新创建模拟器设备

# Safari开发者工具不显示
# 1. Mac Safari：偏好设置 → 高级 → 显示开发菜单
# 2. iPhone模拟器：设置 → Safari → 高级 → Web检查器
```

### 日志位置
- **开发日志**: `./logs/`
- **测试日志**: `./test-results/`
- **部署日志**: `./deployment-logs/`
- **服务器日志**: `/var/log/mobilif/`

## 📊 报告和监控

### 生成的报告
- **开发报告**: `dev-workflow-report.md`
- **测试报告**: `test-report.html`
- **部署报告**: `deployment-report.md`
- **性能报告**: `performance-report.json`

### 监控指标
- API响应时间
- 数据库连接状态
- 内存和CPU使用率
- 错误率和异常统计

## 🤝 团队协作

### 分支策略
```
main          (生产环境)
├── development (开发环境)
├── feature/xxx (功能分支)
└── hotfix/xxx  (紧急修复)
```

### 代码审查流程
1. 创建功能分支
2. 完成开发和测试
3. 创建Pull Request
4. 代码审查
5. 合并到development
6. 自动部署到测试环境

### 发布流程
1. 从development创建release分支
2. 最终测试和修复
3. 合并到main分支
4. 创建Release Tag
5. 自动部署到生产环境

## 📚 参考资源

- [NestJS文档](https://nestjs.com/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [Docker文档](https://docs.docker.com/)
- [GitHub Actions文档](https://docs.github.com/en/actions)

## 🆘 获取帮助

- **问题反馈**: [GitHub Issues](https://github.com/your-org/mobilif/issues)
- **功能请求**: [GitHub Discussions](https://github.com/your-org/mobilif/discussions)
- **紧急问题**: 联系开发团队

---

最后更新: 2025-07-29
版本: 2.0.0
主要更新: 集成Xcode iPhone模拟器到开发工作流