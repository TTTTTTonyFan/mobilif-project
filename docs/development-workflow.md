# MobiLiF 项目开发工作流程指南

> **版本**: v1.0  
> **更新日期**: 2025-07-28  
> **适用项目**: MobiLiF 移动健身游戏化社交平台

## 📋 目录

1. [环境准备](#环境准备)
2. [代码修改流程](#代码修改流程)
3. [测试流程](#测试流程)
4. [部署流程](#部署流程)
5. [故障排除流程](#故障排除流程)
6. [代码审查流程](#代码审查流程)
7. [VSCode 快捷操作](#vscode-快捷操作)
8. [常用命令速查](#常用命令速查)

---

## 🔧 环境准备

### 初始环境检查

```bash
# 1. 检查项目环境
npm run verify

# 2. 检查VSCode配置
npm run test:vscode-tasks

# 3. 一键环境设置（如果需要）
npm run setup
```

### 必需工具确认

- **Node.js**: ≥18.0.0
- **npm**: ≥8.0.0
- **MySQL**: ≥8.0
- **Redis**: ≥6.0
- **VSCode**: 推荐使用
- **Git**: 版本控制

---

## 💻 代码修改流程

### 1. 开始新功能开发

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 创建功能分支
git checkout -b feature/your-feature-name

# 3. 启动开发服务器
npm run start:dev
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 🚀 启动开发服务器
```

### 2. 开发过程中的常用操作

#### 代码编写
```bash
# 实时监控代码变化（已在start:dev中包含）
# 服务器会自动重启，无需手动重启

# 格式化代码
npm run format
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 💅 格式化代码

# 代码检查
npm run lint
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 🛠️ 代码检查
```

#### 数据库相关
```bash
# 生成新的数据库迁移
npm run migration:generate -- -n YourMigrationName

# 执行数据库迁移
npm run migration:run

# 回滚迁移（如果需要）
npm run migration:revert

# 运行数据库种子数据
npm run seed
```

### 3. 提交代码

```bash
# 1. 检查修改状态
git status

# 2. 添加修改文件
git add .

# 3. 提交代码（提交信息要清晰）
git commit -m "feat: 添加用户注册功能

- 实现用户注册API端点
- 添加邮箱验证功能
- 增加密码强度验证
- 更新用户模型和DTO"

# 4. 推送到远程分支
git push origin feature/your-feature-name
```

---

## 🧪 测试流程

### 1. 单元测试

```bash
# 运行所有测试
npm run test
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 🧪 运行测试

# 监控模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:cov

# 调试特定测试文件
npm run test:debug
```

### 2. 端到端测试

```bash
# 运行E2E测试
npm run test:e2e

# 在VSCode中调试E2E测试
# F5 → 选择 "🧪 调试测试"
```

### 3. API接口测试

```bash
# 测试远程API连接
npm run test:api
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 🌐 API测试

# 快速验证项目状态
npm run quick-validate
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → ⚡ 快速验证

# 完整项目验证
npm run validate
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 🔍 完整验证
```

### 4. 集成测试流程

```bash
# 1. 停止开发服务器
# Ctrl+C 停止 npm run start:dev

# 2. 构建项目
npm run build
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 🔨 构建项目

# 3. 启动生产模式
npm run start:prod

# 4. 运行完整测试流程
npm run test && npm run test:e2e && npm run test:api

# 5. 验证构建结果
npm run validate
```

---

## 🚀 部署流程

### 1. 本地部署准备

```bash
# 1. 确保所有测试通过
npm run test && npm run test:e2e

# 2. 代码检查和格式化
npm run lint && npm run format

# 3. 构建生产版本
npm run build

# 4. 完整验证
npm run validate
```

### 2. 服务器状态检查

```bash
# 检查远程服务器状态
npm run server:status
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 🖥️ 服务器状态
```

### 3. 部署到生产环境

```bash
# 自动部署到阿里云服务器
npm run server:deploy
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 🚀 部署项目

# 手动部署步骤（如果自动部署失败）
# 1. 上传代码到服务器
scp -r dist/ root@8.147.235.48:/opt/mobilif/

# 2. SSH连接服务器
ssh root@8.147.235.48

# 3. 在服务器上执行
cd /opt/mobilif
pm2 restart mobilif-api
pm2 logs mobilif-api
```

### 4. 部署后验证

```bash
# 1. 检查服务器服务状态
npm run server:status

# 2. 测试API连接
npm run test:api

# 3. 查看服务器日志
ssh root@8.147.235.48 "pm2 logs mobilif-api --lines 50"
```

---

## 🔍 故障排除流程

### 1. 开发环境故障

#### 服务器无法启动
```bash
# 1. 检查端口占用
lsof -i :3000
# 或
netstat -tulpn | grep 3000

# 2. 清理node_modules重新安装
rm -rf node_modules package-lock.json
npm install

# 3. 检查环境变量
cat .env
npm run verify

# 4. 检查数据库连接
# 查看MySQL服务状态
brew services list | grep mysql
# 或 (Linux)
systemctl status mysql

# 启动MySQL服务
brew services start mysql
# 或 (Linux)
systemctl start mysql
```

#### 数据库连接问题
```bash
# 1. 检查数据库服务
mysql -u root -p
SHOW DATABASES;
USE mobilif;
SHOW TABLES;

# 2. 重新运行数据库迁移
npm run migration:run

# 3. 检查数据库配置
cat .env | grep DB_
```

#### 代码编译错误
```bash
# 1. 清理构建缓存
rm -rf dist/

# 2. 重新构建
npm run build

# 3. 检查TypeScript配置
npx tsc --noEmit

# 4. 检查依赖版本兼容性
npm audit
npm update
```

### 2. 测试失败排除

```bash
# 1. 清理测试缓存
npm run test -- --clearCache

# 2. 重新运行特定测试
npm run test -- --testNamePattern="具体测试名称"

# 3. 详细错误信息
npm run test -- --verbose

# 4. 调试模式运行测试
npm run test:debug
```

### 3. 部署问题排除

```bash
# 1. 检查远程服务器连接
ssh root@8.147.235.48 "echo 'SSH连接正常'"

# 2. 检查服务器磁盘空间
ssh root@8.147.235.48 "df -h"

# 3. 检查服务器内存使用
ssh root@8.147.235.48 "free -h"

# 4. 检查PM2进程状态
ssh root@8.147.235.48 "pm2 status"

# 5. 查看详细错误日志
ssh root@8.147.235.48 "pm2 logs mobilif-api --err --lines 100"

# 6. 重启服务
npm run server:restart
# 或在VSCode中: Ctrl+Shift+P → Tasks: Run Task → 🔄 重启服务
```

### 4. 性能问题排除

```bash
# 1. 分析包大小
npx webpack-bundle-analyzer dist/

# 2. 检查内存泄漏
node --inspect dist/main.js

# 3. 分析数据库查询
# 在MySQL中启用慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

# 4. 检查Redis连接
redis-cli ping
```

---

## 📝 代码审查流程

### 1. 提交Pull Request前检查

```bash
# 1. 自我检查清单
npm run lint          # 代码规范检查
npm run format        # 代码格式化
npm run test          # 单元测试
npm run test:e2e      # 端到端测试
npm run build         # 构建检查
npm run validate      # 完整验证

# 2. 代码覆盖率要求
npm run test:cov
# 确保覆盖率 ≥ 80%
```

### 2. Pull Request模板

创建PR时使用以下模板：

```markdown
## 🎯 功能描述
- [ ] 新功能/Bug修复/性能优化/重构

## 📋 变更内容
- 
- 
- 

## 🧪 测试情况
- [ ] 单元测试通过
- [ ] 集成测试通过 
- [ ] 手动测试完成
- [ ] 覆盖率 ≥ 80%

## 📸 截图/演示
（如果是UI相关变更）

## 🔗 相关Issue
Fixes #issue_number

## ✅ 检查清单
- [ ] 代码符合项目规范
- [ ] 添加必要的注释
- [ ] 更新相关文档
- [ ] 数据库迁移文件（如需要）
- [ ] 环境配置更新（如需要）
```

### 3. 代码审查要点

#### 审查者检查清单：
- **功能正确性**: 代码是否实现了预期功能
- **代码质量**: 是否遵循项目编码规范
- **性能影响**: 是否引入性能问题
- **安全性**: 是否存在安全隐患
- **测试覆盖**: 测试是否充分
- **文档更新**: 是否更新相关文档

#### 常用审查命令：
```bash
# 检出PR分支进行本地测试
git fetch origin pull/PR_NUMBER/head:pr-branch-name
git checkout pr-branch-name

# 运行完整测试流程
npm install
npm run verify
npm run test
npm run build
```

### 4. 合并后流程

```bash
# 1. 更新本地主分支
git checkout main
git pull origin main

# 2. 删除已合并的功能分支
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name

# 3. 部署到生产环境（如果是主要版本）
npm run server:deploy
```

---

## ⚡ VSCode 快捷操作

### 命令面板快捷键
- `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac): 打开命令面板

### 常用任务快捷方式
1. **启动开发**: `Ctrl+Shift+P` → `Tasks: Run Task` → `🚀 启动开发服务器`
2. **运行测试**: `Ctrl+Shift+P` → `Tasks: Run Task` → `🧪 运行测试`
3. **构建项目**: `Ctrl+Shift+P` → `Tasks: Run Task` → `🔨 构建项目`
4. **代码检查**: `Ctrl+Shift+P` → `Tasks: Run Task` → `🛠️ 代码检查`
5. **格式化代码**: `Ctrl+Shift+P` → `Tasks: Run Task` → `💅 格式化代码`

### 调试快捷方式
- `F5`: 启动调试
- `Ctrl+F5`: 启动但不调试
- `F9`: 切换断点
- `F10`: 单步跳过
- `F11`: 单步进入

---

## 📚 常用命令速查

### 开发命令
```bash
npm run start:dev      # 启动开发服务器
npm run start:debug    # 调试模式启动
npm run build          # 构建项目
npm run format         # 格式化代码
npm run lint           # 代码检查
```

### 测试命令
```bash
npm run test           # 运行单元测试
npm run test:watch     # 监控模式测试
npm run test:cov       # 测试覆盖率
npm run test:e2e       # 端到端测试
npm run test:api       # API接口测试
```

### 数据库命令
```bash
npm run migration:generate -- -n MigrationName  # 生成迁移
npm run migration:run                           # 执行迁移  
npm run migration:revert                        # 回滚迁移
npm run seed                                    # 运行种子数据
```

### 服务器管理命令
```bash
npm run server:status    # 检查服务器状态
npm run server:restart   # 重启服务
npm run server:deploy    # 部署到服务器
npm run server:logs      # 查看服务器日志
```

### 验证命令
```bash
npm run verify           # 验证环境设置
npm run validate         # 完整项目验证
npm run quick-validate   # 快速验证
npm run setup           # 一键环境设置
```

### Git 常用命令
```bash
git status                          # 查看状态
git add .                          # 添加所有修改
git commit -m "message"            # 提交代码
git push origin branch-name        # 推送分支
git pull origin main               # 拉取主分支
git checkout -b feature/name       # 创建并切换分支
git merge main                     # 合并主分支
```

---

## 📞 支持和帮助

### 获取帮助
- **项目文档**: 参考 `docs/` 目录下的其他文档
- **API文档**: 启动服务器后访问 `/api/docs`
- **技术支持**: 联系项目维护团队

### 报告问题
1. 使用项目Issue模板报告Bug
2. 提供详细的错误信息和复现步骤
3. 包含相关的日志文件

### 贡献代码
1. Fork项目仓库
2. 创建功能分支
3. 遵循本文档的开发流程
4. 提交Pull Request

---

**注意**: 本文档会根据项目发展持续更新，请定期查看最新版本。

**最后更新**: 2025-07-28  
**文档版本**: v1.0