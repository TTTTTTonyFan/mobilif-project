# 场馆列表功能端到端测试指南

## 测试环境准备

### 1. 系统要求

- Node.js >= 16.x
- MySQL >= 8.0
- npm 或 yarn
- Git

### 2. 快速开始

```bash
# 克隆项目（如果还没有）
cd ~/mobilif-project

# 运行一键测试脚本
./scripts/run-e2e-test.sh
```

## 详细测试步骤

### 步骤 1: 环境检查

```bash
# 检查Node.js版本
node --version  # 应该 >= 16.x

# 检查MySQL服务
mysql --version

# 检查npm
npm --version
```

### 步骤 2: 安装依赖

```bash
# 后端依赖
cd ~/mobilif-project
npm install

# 前端依赖
cd frontend
npm install
cd ..
```

### 步骤 3: 配置环境变量

创建 `.env` 文件：

```bash
# ~/mobilif-project/.env
NODE_ENV=development
PORT=3000

# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/mobilif_test"
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=mobilif_test

# JWT配置（测试用）
JWT_SECRET=test_secret_key_12345
JWT_EXPIRES_IN=7d

# 其他配置
LOG_LEVEL=debug
```

### 步骤 4: 数据库设置

#### 4.1 创建测试数据库

```bash
# 登录MySQL
mysql -u root -p

# 在MySQL中执行
CREATE DATABASE IF NOT EXISTS mobilif_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mobilif_test;
exit;
```

#### 4.2 初始化Prisma

```bash
# 生成Prisma客户端
npx prisma generate

# 推送schema到数据库
npx prisma db push
```

#### 4.3 执行迁移脚本

```bash
# 执行表结构更新
mysql -u root -p mobilif_test < prisma/migrations/001_add_gym_type_and_programs.sql

# 插入测试数据
mysql -u root -p mobilif_test < prisma/seeds/gym_seed_data.sql
```

### 步骤 5: 启动后端服务

```bash
# 开发模式启动
npm run start:dev

# 或者生产模式
npm run build
npm run start:prod
```

后端应该在 http://localhost:3000 启动

### 步骤 6: 验证后端API

#### 6.1 健康检查

```bash
curl http://localhost:3000/health
```

预期响应：
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

#### 6.2 测试场馆列表API

```bash
# 获取北京的场馆列表
curl "http://localhost:3000/api/gyms?city=北京&page=1&pageSize=20" \
  -H "Authorization: Bearer test-token"
```

#### 6.3 测试位置查询

```bash
# 根据经纬度查询附近场馆
curl "http://localhost:3000/api/gyms?lat=39.9042&lng=116.4074&radius=10" \
  -H "Authorization: Bearer test-token"
```

#### 6.4 测试搜索功能

```bash
# 搜索包含"CrossFit"的场馆
curl "http://localhost:3000/api/gyms?keyword=CrossFit" \
  -H "Authorization: Bearer test-token"
```

#### 6.5 测试筛选功能

```bash
# 筛选CrossFit认证场馆
curl "http://localhost:3000/api/gyms?gymType=crossfit_certified&programs=CrossFit,Olympic%20Lifting" \
  -H "Authorization: Bearer test-token"
```

### 步骤 7: 启动前端应用

新开一个终端窗口：

```bash
cd ~/mobilif-project/frontend

# Web版本
npm start
# 访问 http://localhost:8080

# 或iOS模拟器
npx react-native run-ios

# 或Android模拟器
npx react-native run-android
```

### 步骤 8: 前端功能测试

#### 8.1 页面加载测试

1. 打开应用，进入"Drop-in预约"板块
2. 应该看到场馆列表页面
3. 验证页面元素：
   - 城市选择器显示当前城市
   - 搜索栏可见
   - 筛选按钮可见
   - 场馆列表加载

#### 8.2 位置权限测试

1. 首次进入会提示位置权限
2. 允许后应该按距离排序显示场馆
3. 拒绝后应该显示默认城市的场馆

#### 8.3 搜索功能测试

1. 在搜索栏输入"CrossFit"
2. 列表应该实时更新，只显示包含"CrossFit"的场馆
3. 清空搜索，应该显示所有场馆

#### 8.4 筛选功能测试

1. 点击"筛选"按钮
2. 选择"CrossFit认证场馆"
3. 选择课程类型"CrossFit"和"Olympic Lifting"
4. 点击"应用筛选"
5. 列表应该只显示符合条件的场馆

#### 8.5 城市切换测试

1. 点击顶部城市名称
2. 选择"热门城市"中的"上海"
3. 列表应该更新为上海的场馆
4. 再切换到其他国家的城市测试

#### 8.6 下拉刷新测试

1. 在列表顶部下拉
2. 应该看到刷新动画
3. 列表数据应该重新加载

#### 8.7 上拉加载测试

1. 滚动到列表底部
2. 如果有更多数据，应该自动加载
3. 加载时显示加载指示器

## 测试检查清单

### 功能测试 ✓

- [ ] 场馆列表正常显示
- [ ] 距离计算准确（有位置权限时）
- [ ] 营业状态显示正确（根据当前时间）
- [ ] 场馆类型标识正确
- [ ] 支持的课程标签显示完整
- [ ] 搜索功能正常工作
- [ ] 筛选功能正常工作
- [ ] 城市切换功能正常
- [ ] 分页加载正常
- [ ] 空状态显示正确

### 性能测试 ⚡

- [ ] API响应时间 < 200ms
- [ ] 列表滚动流畅
- [ ] 搜索输入无延迟
- [ ] 图片加载优化

### 兼容性测试 📱

- [ ] Web浏览器正常显示
- [ ] iOS模拟器/真机测试
- [ ] Android模拟器/真机测试
- [ ] 不同屏幕尺寸适配

### 边界情况测试 🔍

- [ ] 无网络时的表现
- [ ] 位置权限被拒绝
- [ ] 搜索无结果
- [ ] 服务器错误处理
- [ ] Token过期处理

## 常见问题解决

### 1. MySQL连接失败

```bash
# 检查MySQL服务状态
sudo service mysql status

# 启动MySQL
sudo service mysql start

# 检查用户权限
mysql -u root -p
GRANT ALL PRIVILEGES ON mobilif_test.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Prisma错误

```bash
# 重新生成客户端
npx prisma generate

# 重置数据库
npx prisma db push --force-reset
```

### 3. 端口被占用

```bash
# 查找占用3000端口的进程
lsof -i :3000

# 结束进程
kill -9 <PID>
```

### 4. 前端启动失败

```bash
# 清理缓存
cd frontend
rm -rf node_modules
npm cache clean --force
npm install
```

## 测试数据说明

测试数据包含10个示例场馆：
- 北京：3个场馆（含1个CrossFit认证）
- 上海：2个场馆（含1个CrossFit认证）
- 广州：2个场馆
- 深圳：2个场馆（含1个CrossFit认证）
- 杭州：1个场馆（CrossFit认证）

每个场馆都有完整的信息，包括：
- 营业时间（用于测试营业状态）
- 支持的课程类型
- 场馆类型
- 评分和评价数
- 地理位置坐标

## 性能基准

目标性能指标：
- API响应时间：< 200ms
- 首屏加载时间：< 3s
- 列表滚动FPS：> 50
- 内存使用：< 200MB

## 测试报告模板

```markdown
# 端到端测试报告

测试日期：2024-01-XX
测试人员：XXX
测试环境：开发环境

## 测试结果摘要
- 总测试用例：25个
- 通过：XX个
- 失败：XX个
- 跳过：XX个

## 详细结果
[列出每个测试的结果]

## 发现的问题
[列出发现的bug和问题]

## 性能测试结果
[API响应时间、加载时间等]

## 建议和改进
[提出的改进建议]
```