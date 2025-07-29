# 📚 MobiLiF 功能使用示例指南

> 本指南详细介绍了如何使用 MobiLiF 项目中创建的各种功能模块

## 🎯 概览

`examples/usage-examples.js` 文件提供了完整的使用示例，展示了如何正确使用项目中的各种功能模块。包括：

1. **API客户端使用示例** - 如何使用 API 客户端进行各种网络请求
2. **服务器管理示例** - 如何远程管理服务器和服务
3. **环境配置示例** - 如何正确配置和使用环境变量
4. **错误处理示例** - 如何处理各种类型的错误
5. **综合使用示例** - 实际业务场景中的完整应用

## 🚀 快速开始

### 运行所有示例

```bash
# 运行所有使用示例
npm run examples

# 或直接运行
node examples/usage-examples.js
```

### 运行特定示例

```bash
# API客户端示例
npm run examples:api

# 服务器管理示例  
npm run examples:server

# 环境配置示例
npm run examples:config

# 错误处理示例
npm run examples:error

# 综合使用示例
npm run examples:integrated
```

## 📋 详细示例说明

### 1. API客户端使用示例

展示了如何使用 `config/api-client.js` 模块：

#### 基本用法
```javascript
const { APIClient, APIError, NetworkError } = require('./config/api-client');

// 创建客户端实例
const apiClient = new APIClient({
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    retries: 3
});

// 执行健康检查
const health = await apiClient.health();
console.log('API状态:', health.status);
```

#### 错误处理
```javascript
try {
    const users = await apiClient.getUsers();
} catch (error) {
    if (error instanceof APIError) {
        console.error('API错误:', error.status, error.message);
    } else if (error instanceof NetworkError) {
        console.error('网络错误:', error.message);
    }
}
```

#### 认证和授权
```javascript
// 用户登录
const loginResult = await apiClient.login({
    username: 'user@example.com',
    password: 'password123'
});

// 设置认证令牌
apiClient.setAuthToken(loginResult.token);

// 现在可以访问需要认证的接口
const profile = await apiClient.getUserProfile('user123');
```

### 2. 服务器管理示例

展示了如何使用 `scripts/server-manager.js` 模块：

#### 基本服务器操作
```javascript
const ServerManager = require('./scripts/server-manager');

const serverManager = new ServerManager({
    host: '8.147.235.48',
    user: 'root',
    projectPath: '/opt/mobilif'
});

// 检查服务器状态
const status = await serverManager.getStatus();
console.log('服务器状态:', status);

// 重启服务
await serverManager.restart();

// 创建备份
const backup = await serverManager.backup();
console.log('备份创建成功:', backup.path);
```

#### 远程命令执行
```javascript
// 执行自定义命令
const diskUsage = await serverManager.executeSSH('df -h');
console.log('磁盘使用情况:', diskUsage);

const processes = await serverManager.executeSSH('pm2 status');
console.log('进程状态:', processes);
```

### 3. 环境配置示例

展示了如何使用 `config/api.js` 配置模块：

#### 配置访问
```javascript
const apiConfig = require('./config/api');

// 访问当前环境配置
console.log('当前环境:', apiConfig.NODE_ENV);
console.log('API基础URL:', apiConfig.api.baseURL);
console.log('数据库配置:', apiConfig.server);

// 环境判断
if (apiConfig.isDevelopment) {
    console.log('开发环境配置');
} else if (apiConfig.isProduction) {
    console.log('生产环境配置');
}
```

#### 配置验证
```javascript
// 验证配置
if (typeof apiConfig.validateConfig === 'function') {
    const errors = apiConfig.validateConfig();
    if (errors.length > 0) {
        console.error('配置错误:', errors);
    }
}
```

#### 动态配置使用
```javascript
// JWT配置
const jwtOptions = {
    secret: apiConfig.jwt.secret,
    expiresIn: apiConfig.jwt.expiresIn
};

// 数据库连接
const dbUrl = `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}`;
```

### 4. 错误处理示例

展示了完整的错误处理策略：

#### 错误分类处理
```javascript
const handleApiRequest = async (apiCall) => {
    try {
        return await apiCall();
    } catch (error) {
        if (error instanceof APIError) {
            // API错误 - 根据状态码处理
            switch (error.status) {
                case 401: return '认证失败';
                case 403: return '权限不足';
                case 404: return '资源不存在';
                case 500: return '服务器错误';
            }
        } else if (error instanceof NetworkError) {
            // 网络错误 - 检查连接
            return '网络连接失败';
        } else if (error instanceof TimeoutError) {
            // 超时错误 - 建议重试
            return `请求超时 (${error.timeout}ms)`;
        }
    }
};
```

#### 重试机制
```javascript
const requestWithRetry = async (apiCall, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            if (shouldRetry(error) && attempt < maxRetries) {
                const delay = 1000 * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
};
```

#### 错误日志记录
```javascript
class ErrorLogger {
    log(error, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context,
            severity: this.determineSeverity(error)
        };
        
        // 根据严重程度处理
        switch (logEntry.severity) {
            case 'critical':
                console.error('🚨 CRITICAL:', logEntry);
                // 发送告警
                break;
            case 'error':
                console.error('❌ ERROR:', logEntry);
                break;
            case 'warning':
                console.warn('⚠️ WARNING:', logEntry);
                break;
        }
    }
}
```

### 5. 综合使用示例

展示了实际业务场景中的完整应用：

#### 应用初始化流程
```javascript
class MobiLifApplication {
    async initialize() {
        // 1. 加载配置
        this.config = require('./config/api');
        
        // 2. 初始化API客户端
        const { APIClient } = require('./config/api-client');
        this.apiClient = new APIClient({
            baseURL: this.config.api.baseURL,
            timeout: this.config.REQUEST_TIMEOUT
        });
        
        // 3. 设置错误处理
        this.setupErrorHandling();
        
        // 4. 健康检查
        await this.performHealthCheck();
        
        console.log('✅ 应用初始化完成');
    }
}
```

#### 业务流程示例
```javascript
// 用户预订课程的完整流程
const bookingWorkflow = async (userId, classId) => {
    try {
        // 1. 验证用户状态
        const user = await apiClient.getUser(userId);
        
        // 2. 检查课程可用性
        const classInfo = await apiClient.get(`/classes/${classId}`);
        
        // 3. 创建预订
        const booking = await apiClient.post('/bookings', {
            userId,
            classId
        });
        
        // 4. 发送通知
        await apiClient.post('/notifications', {
            userId,
            type: 'booking_confirmed',
            data: { bookingId: booking.id }
        });
        
        return { success: true, booking };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
```

#### 系统监控
```javascript
class SystemMonitor {
    startHealthMonitoring() {
        setInterval(async () => {
            const health = await Promise.all([
                this.checkApiHealth(),
                this.checkServerHealth(),
                this.checkDatabaseHealth()
            ]);
            
            const overallHealth = health.every(h => h.healthy);
            if (!overallHealth) {
                await this.handleHealthIssues(health);
            }
        }, 5 * 60 * 1000); // 每5分钟检查
    }
}
```

## 💡 使用建议

### 1. 开发环境使用

```bash
# 在开发过程中，经常运行示例来学习用法
npm run examples:api        # 学习API使用
npm run examples:config     # 了解配置管理
npm run examples:error      # 掌握错误处理
```

### 2. 调试和测试

```bash
# 使用示例验证功能是否正常
node examples/usage-examples.js api-client
node examples/usage-examples.js server-manager
```

### 3. 学习最佳实践

示例代码展示了：
- ✅ 正确的错误处理方式
- ✅ 合理的重试机制
- ✅ 完整的日志记录
- ✅ 优雅的资源管理
- ✅ 实际的业务场景应用

### 4. 自定义扩展

基于示例代码，你可以：
- 🔧 创建自己的API客户端配置
- 🔧 实现特定的错误处理策略
- 🔧 添加新的服务器管理功能
- 🔧 扩展监控和报警机制

## 📊 示例执行效果

### 成功输出示例
```
🚀 API客户端使用示例

── 导入和初始化 ──
✓ API客户端模块导入成功

── 1.1 使用默认客户端 ──
✓ 自定义客户端创建成功
→ 客户端配置: {...}

── 1.3 健康检查 ──
✓ 健康检查完成
→ 状态: healthy
```

### 错误处理示例
```
❌ 网络错误示例: NetworkError - 连接被拒绝
⚠️ 超时错误示例: TimeoutError - 请求超时 (30000ms)
```

## 🔗 相关文档

- [验证系统指南](validation-guide.md)
- [本地开发指南](local-development.md)
- [API 配置文档](../config/api.js)
- [API 客户端文档](../config/api-client.js)
- [服务器管理文档](../scripts/server-manager.js)

## ❓ 常见问题

### Q: 示例中的API请求失败怎么办？
**A**: 这是正常的，因为示例运行时服务器可能没有启动。示例主要展示用法，不依赖实际的API响应。

### Q: 如何在自己的代码中使用这些示例？
**A**: 直接复制相关的代码片段到你的项目中，根据实际需求进行调整。

### Q: 示例代码可以在生产环境使用吗？
**A**: 示例代码主要用于学习和测试，生产环境使用前请根据实际需求进行优化和安全加固。

### Q: 如何添加新的示例？
**A**: 在 `examples/usage-examples.js` 中添加新的示例函数，并在主函数中添加相应的命令行参数处理。

---

## 🎉 总结

使用示例系统为 MobiLiF 项目提供了：

✅ **完整的功能演示** - 展示所有核心功能的正确用法  
✅ **最佳实践指导** - 提供生产级的代码示例  
✅ **学习友好** - 详细的注释和说明  
✅ **实用性强** - 可直接应用于实际项目  
✅ **易于扩展** - 模块化设计便于添加新示例  

通过这些示例，开发者可以快速掌握 MobiLiF 项目各个模块的使用方法，提高开发效率和代码质量！

🚀 **开始探索 MobiLiF 功能的强大之处吧！**