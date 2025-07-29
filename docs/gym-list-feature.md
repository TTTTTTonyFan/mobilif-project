# 场馆列表功能开发文档

## 功能概述

根据用户故事实现了完整的场馆列表功能，支持：

- 查看附近场馆列表，按距离排序
- 显示场馆详细信息（名称、地址、营业状态、类型、课程标签等）
- 搜索场馆（按名称关键词）
- 筛选场馆（按课程类型、场馆类型）
- 城市切换功能
- 地理位置获取和距离计算

## 技术架构

### 后端 (NestJS + Prisma + MySQL)

```
src/modules/gym/
├── gym.controller.ts     # API控制器
├── gym.service.ts        # 业务逻辑服务
├── gym.module.ts         # 模块定义
└── dto/
    └── gym.dto.ts        # 数据传输对象
```

#### 主要API接口

- `GET /api/gyms` - 获取场馆列表
- `GET /api/gyms/cities` - 获取支持的城市列表
- `GET /api/gyms/countries` - 获取支持的国家和城市列表

#### 查询参数

```typescript
interface GymSearchParams {
  lat?: number;           // 纬度
  lng?: number;           // 经度
  city?: string;          // 城市名称
  radius?: number;        // 搜索半径(km)
  keyword?: string;       // 关键词搜索
  gymType?: string;       // 场馆类型筛选
  programs?: string;      // 课程类型筛选
  sortBy?: string;        // 排序方式
  page?: number;          // 页码
  pageSize?: number;      // 每页数量
}
```

### 前端 (React Native + Redux)

```
frontend/src/
├── pages/DropInBooking/
│   └── GymList.tsx                 # 场馆列表页面
├── components/
│   ├── gym/
│   │   ├── GymCard.tsx             # 场馆卡片组件
│   │   ├── CitySelector.tsx        # 城市选择器  
│   │   └── FilterModal.tsx         # 筛选模态框
│   └── common/
│       ├── SearchBar.tsx           # 搜索栏
│       ├── LoadingSpinner.tsx      # 加载指示器
│       └── EmptyState.tsx          # 空状态组件
├── store/slices/
│   └── gymSlice.ts                 # Redux状态管理
├── services/
│   ├── api/
│   │   ├── gymAPI.ts               # 场馆API服务
│   │   └── client.ts               # API客户端
│   └── locationService.ts          # 地理位置服务
├── types/
│   └── gym.ts                      # TypeScript类型定义
└── styles/
    └── index.ts                    # 样式常量
```

## 数据库设计

### 新增字段

为`gyms`表添加了以下字段：

```sql
ALTER TABLE `gyms` 
ADD COLUMN `gym_type` ENUM('crossfit_certified', 'comprehensive', 'specialty') DEFAULT 'comprehensive';

ALTER TABLE `gyms` 
ADD COLUMN `crossfit_certified` BOOLEAN DEFAULT FALSE;

ALTER TABLE `gyms` 
ADD COLUMN `supported_programs` JSON;
```

### 场馆类型

- `crossfit_certified` - CrossFit认证场馆
- `comprehensive` - 综合训练馆  
- `specialty` - 专项训练馆

### 支持的课程类型

- CrossFit
- Olympic Lifting  
- Hyrox
- Gymnastics
- Powerlifting
- Functional Fitness

## 部署和使用

### 1. 数据库设置

```bash
# 运行数据库设置脚本
./scripts/setup-database.sh

# 或手动执行
npx prisma generate
npx prisma db push
```

### 2. 执行迁移和种子数据

```bash
# 执行迁移脚本
mysql -u用户名 -p -h主机 数据库名 < prisma/migrations/001_add_gym_type_and_programs.sql

# 插入示例数据
mysql -u用户名 -p -h主机 数据库名 < prisma/seeds/gym_seed_data.sql
```

### 3. 启动后端服务

```bash
cd mobilif-project
npm install
npm run start:dev
```

### 4. 启动前端应用

```bash
cd mobilif-project/frontend
npm install
npm start # Web版本
# 或
npx react-native run-ios # iOS版本
npx react-native run-android # Android版本
```

## API使用示例

### 获取附近场馆

```bash
curl "http://localhost:3000/api/gyms?lat=39.9042&lng=116.4074&radius=10&page=1&pageSize=20" \
  -H "Authorization: Bearer your-token"
```

### 搜索场馆

```bash
curl "http://localhost:3000/api/gyms?city=北京&keyword=CrossFit&gymType=crossfit_certified" \
  -H "Authorization: Bearer your-token"
```

### 筛选场馆

```bash
curl "http://localhost:3000/api/gyms?city=上海&programs=CrossFit,Olympic%20Lifting&sortBy=rating" \
  -H "Authorization: Bearer your-token"
```

## 示例响应

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "1",
        "name": "MobiLiF CrossFit北京站",
        "address": "北京市朝阳区三里屯太古里南区",
        "city": "北京",
        "district": "朝阳区",  
        "distance": 1.2,
        "rating": 4.8,
        "reviewCount": 156,
        "businessStatus": "营业中",
        "todayHours": "06:00-22:00",
        "gymType": "CrossFit认证场馆",
        "crossfitCertified": true,
        "supportedPrograms": ["CrossFit", "Olympic Lifting", "Gymnastics"],
        "tags": ["新手友好", "停车方便", "淋浴间"],
        "verified": true,
        "featured": true
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 15,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "currentCity": "北京"
  }
}
```

## 功能特性

### ✅ 已实现功能

- [x] 场馆列表展示，按距离排序
- [x] 显示场馆基本信息（名称、地址、距离、评分等）
- [x] 营业状态实时计算（基于当前时间和营业时间）
- [x] 场馆类型展示（CrossFit认证 vs 综合训练馆）
- [x] 支持的课程标签展示
- [x] 关键词搜索功能
- [x] 场馆类型筛选
- [x] 课程类型筛选
- [x] 城市切换功能
- [x] 地理位置获取和距离计算
- [x] Redux状态管理
- [x] 响应式设计，支持不同机型适配
- [x] 下拉刷新和上拉加载更多
- [x] 空状态和错误状态处理
- [x] 离线缓存支持

### 🔄 待优化功能

- [ ] API响应时间优化（目标<200ms）
- [ ] 更丰富的筛选条件
- [ ] 地图模式展示
- [ ] 场馆详情页跳转
- [ ] 用户收藏功能
- [ ] 实时营业状态推送

## 性能优化

### 后端优化

1. **数据库索引**：为经常查询的字段添加索引
2. **分页查询**：使用offset+limit实现分页
3. **字段选择**：只查询必要的字段，减少数据传输
4. **距离计算**：使用数学公式计算，避免复杂的地理空间查询

### 前端优化

1. **虚拟滚动**：处理大量数据时使用虚拟滚动
2. **图片懒加载**：场馆图片按需加载
3. **Redux缓存**：避免重复API调用
4. **防抖搜索**：搜索输入防抖处理
5. **离线缓存**：使用AsyncStorage缓存数据

## 扩展功能建议

1. **个性化推荐**：基于用户偏好推荐场馆
2. **社交功能**：用户评价、照片分享
3. **预约集成**：直接跳转到预约页面
4. **路线导航**：集成地图导航功能
5. **实时数据**：场馆实时人数、设备可用性
6. **多语言支持**：国际化和本地化
7. **无障碍支持**：提升可访问性

## 总结

该功能完整实现了用户故事中的所有需求，具备良好的扩展性和性能表现。代码结构清晰，遵循最佳实践，支持跨平台部署（Web、iOS、Android）。通过合理的架构设计，为后续功能扩展提供了坚实的基础。