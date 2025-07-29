#!/usr/bin/env node

/**
 * MobiLiF 项目使用示例
 * 
 * 本文件展示了如何使用我们创建的各种功能模块，包括：
 * 1. API客户端使用示例
 * 2. 服务器管理示例
 * 3. 环境配置示例
 * 4. 错误处理示例
 * 
 * 运行方式: node examples/usage-examples.js [example-name]
 * 可用示例: api-client, server-manager, config, error-handling, all
 */

const path = require('path');
const fs = require('fs');

// 控制台颜色常量
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// 日志工具
const log = {
    title: (msg) => console.log(`\n${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.blue}${colors.bright}🚀 ${msg}${colors.reset}`),
    subsection: (msg) => console.log(`\n${colors.magenta}${colors.bright}── ${msg} ──${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    code: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`),
    result: (msg) => console.log(`${colors.green}→${colors.reset} ${msg}`)
};

/**
 * =======================================================
 * 1. API客户端使用示例
 * =======================================================
 */
async function demonstrateApiClient() {
    log.section('API客户端使用示例');
    
    try {
        // 导入API客户端
        log.subsection('导入和初始化');
        log.code('const { APIClient, APIError, NetworkError } = require("../config/api-client");');
        
        const { APIClient, APIError, NetworkError } = require('../config/api-client');
        
        log.success('API客户端模块导入成功');
        
        // 1.1 创建默认客户端实例
        log.subsection('1.1 使用默认客户端');
        log.code(`
// 使用默认配置创建客户端
const { default: apiClient } = require('../config/api-client');

// 或者使用便捷方法
const { health, getGyms, getUsers } = require('../config/api-client');`);
        
        // 1.2 创建自定义客户端实例
        log.subsection('1.2 创建自定义客户端');
        log.code(`
// 创建自定义配置的客户端
const customClient = new APIClient({
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    retries: 2,
    enableLogging: true
});`);
        
        const customClient = new APIClient({
            baseURL: 'http://localhost:3000/api',
            timeout: 10000,
            retries: 2,
            enableLogging: false // 禁用日志以保持示例输出清洁
        });
        
        log.success('自定义客户端创建成功');
        log.result(`客户端配置: ${JSON.stringify(customClient.getClientInfo(), null, 2)}`);
        
        // 1.3 健康检查示例
        log.subsection('1.3 健康检查');
        log.code(`
// 执行健康检查
const healthResult = await apiClient.health();
console.log('健康状态:', healthResult);`);
        
        try {
            const healthResult = await customClient.health();
            log.success('健康检查完成');
            log.result(`状态: ${healthResult.status}`);
        } catch (error) {
            log.warning(`健康检查失败 (这是正常的，因为服务器可能未运行): ${error.name}`);
        }
        
        // 1.4 GET 请求示例
        log.subsection('1.4 GET 请求示例');
        log.code(`
// 获取健身房列表
try {
    const gyms = await apiClient.getGyms({ 
        page: 1, 
        limit: 10,
        city: '北京' 
    });
    console.log('健身房列表:', gyms);
} catch (error) {
    console.error('请求失败:', error.message);
}`);
        
        // 1.5 POST 请求示例
        log.subsection('1.5 POST 请求示例');
        log.code(`
// 用户登录
try {
    const loginResult = await apiClient.login({
        username: 'testuser',
        password: 'password123'
    });
    
    // 设置认证令牌
    apiClient.setAuthToken(loginResult.token);
    
    console.log('登录成功:', loginResult);
} catch (error) {
    if (error instanceof APIError) {
        console.error('API错误:', error.message, '状态码:', error.status);
    } else if (error instanceof NetworkError) {
        console.error('网络错误:', error.message);
    } else {
        console.error('未知错误:', error.message);
    }
}`);
        
        // 1.6 搜索功能示例
        log.subsection('1.6 搜索功能示例');
        log.code(`
// 搜索健身房
const searchParams = {
    q: 'CrossFit',
    city: '上海',
    page: 1,
    limit: 5
};

try {
    const searchResults = await apiClient.searchGyms('CrossFit', searchParams);
    console.log('搜索结果:', searchResults);
} catch (error) {
    console.error('搜索失败:', error.message);
}`);
        
        // 1.7 批量请求示例
        log.subsection('1.7 批量请求示例');
        log.code(`
// 并发执行多个请求
const batchRequests = async () => {
    try {
        const [healthStatus, userStats, gymStats] = await Promise.all([
            apiClient.health(),
            apiClient.getUserStats(),
            apiClient.getGymStats()
        ]);
        
        return {
            health: healthStatus,
            userStats,
            gymStats
        };
    } catch (error) {
        console.error('批量请求失败:', error.message);
    }
};`);
        
        log.success('API客户端示例展示完成');
        
    } catch (error) {
        log.error(`API客户端示例执行失败: ${error.message}`);
    }
}

/**
 * =======================================================
 * 2. 服务器管理示例
 * =======================================================
 */
async function demonstrateServerManager() {
    log.section('服务器管理示例');
    
    try {
        // 导入服务器管理器
        log.subsection('导入和初始化');
        log.code('const ServerManager = require("../scripts/server-manager");');
        
        const ServerManager = require('../scripts/server-manager');
        log.success('服务器管理器模块导入成功');
        
        // 2.1 创建服务器管理器实例
        log.subsection('2.1 创建管理器实例');
        log.code(`
// 创建服务器管理器实例
const serverManager = new ServerManager({
    host: '8.147.235.48',
    user: 'root',
    projectPath: '/opt/mobilif'
});`);
        
        const serverManager = new ServerManager({
            host: '8.147.235.48',
            user: 'root',
            projectPath: '/opt/mobilif'
        });
        
        log.success('服务器管理器实例创建成功');
        
        // 2.2 检查服务器状态
        log.subsection('2.2 检查服务器状态');
        log.code(`
// 获取服务器状态
try {
    const status = await serverManager.getStatus();
    console.log('服务器状态:', status);
    
    // 检查具体服务
    if (status.services) {
        status.services.forEach(service => {
            console.log(\`\${service.name}: \${service.status}\`);
        });
    }
} catch (error) {
    console.error('状态检查失败:', error.message);
}`);
        
        // 注意：这里不实际执行SSH命令，只展示用法
        log.info('注意: 实际SSH连接需要配置密钥或密码');
        
        // 2.3 执行远程命令
        log.subsection('2.3 执行远程命令');
        log.code(`
// 执行自定义命令
const customCommand = async () => {
    try {
        const result = await serverManager.executeSSH('df -h');
        console.log('磁盘使用情况:', result);
        
        const memInfo = await serverManager.executeSSH('free -m');
        console.log('内存使用情况:', memInfo);
        
        const processInfo = await serverManager.executeSSH('ps aux | grep node');
        console.log('Node.js 进程:', processInfo);
    } catch (error) {
        console.error('命令执行失败:', error.message);
    }
};`);
        
        // 2.4 服务管理
        log.subsection('2.4 服务管理');
        log.code(`
// 重启服务
const restartServices = async () => {
    try {
        // 重启 PM2 管理的应用
        await serverManager.restart();
        console.log('应用重启成功');
        
        // 等待服务启动
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 检查服务状态
        const status = await serverManager.getStatus();
        console.log('重启后状态:', status);
    } catch (error) {
        console.error('服务重启失败:', error.message);
    }
};`);
        
        // 2.5 备份管理
        log.subsection('2.5 备份管理');
        log.code(`
// 创建备份
const createBackup = async () => {
    try {
        const backupResult = await serverManager.backup();
        console.log('备份创建成功:', backupResult);
        
        // 备份信息
        if (backupResult.path) {
            console.log('备份路径:', backupResult.path);
            console.log('备份大小:', backupResult.size);
            console.log('备份时间:', backupResult.timestamp);
        }
    } catch (error) {
        console.error('备份创建失败:', error.message);
    }
};`);
        
        // 2.6 日志查看
        log.subsection('2.6 日志管理');
        log.code(`
// 查看应用日志
const viewLogs = async () => {
    try {
        const logs = await serverManager.logs('mobilif-api', { lines: 50 });
        console.log('应用日志 (最近50行):');
        console.log(logs);
        
        // 实时日志监控
        const realtimeLogs = await serverManager.logs('mobilif-api', { 
            follow: true,
            lines: 10 
        });
        console.log('实时日志:', realtimeLogs);
    } catch (error) {
        console.error('日志查看失败:', error.message);
    }
};`);
        
        // 2.7 部署管理
        log.subsection('2.7 部署管理');
        log.code(`
// 执行部署
const deployApplication = async () => {
    try {
        // 部署前检查
        const preDeployStatus = await serverManager.getStatus();
        console.log('部署前状态:', preDeployStatus);
        
        // 执行部署
        const deployResult = await serverManager.deploy();
        console.log('部署结果:', deployResult);
        
        // 部署后验证
        const postDeployStatus = await serverManager.getStatus();
        console.log('部署后状态:', postDeployStatus);
        
        return {
            success: true,
            preDeployStatus,
            deployResult,
            postDeployStatus
        };
    } catch (error) {
        console.error('部署失败:', error.message);
        return { success: false, error: error.message };
    }
};`);
        
        // 2.8 监控和健康检查
        log.subsection('2.8 监控和健康检查');
        log.code(`
// 综合健康检查
const healthCheck = async () => {
    const health = {
        server: false,
        database: false,
        redis: false,
        application: false,
        disk: false,
        memory: false
    };
    
    try {
        // 检查服务器连接
        const pingResult = await serverManager.executeSSH('echo "ping"');
        health.server = pingResult.trim() === 'ping';
        
        // 检查数据库连接
        const dbCheck = await serverManager.executeSSH(
            'mysql -u root -e "SELECT 1" 2>/dev/null && echo "ok" || echo "fail"'
        );
        health.database = dbCheck.includes('ok');
        
        // 检查Redis
        const redisCheck = await serverManager.executeSSH(
            'redis-cli ping 2>/dev/null || echo "fail"'
        );
        health.redis = redisCheck.includes('PONG');
        
        // 检查应用进程
        const appCheck = await serverManager.executeSSH('pm2 status mobilif-api');
        health.application = appCheck.includes('online');
        
        // 检查磁盘空间
        const diskUsage = await serverManager.executeSSH("df / | awk 'NR==2 {print $5}' | sed 's/%//'");
        health.disk = parseInt(diskUsage) < 80; // 磁盘使用率低于80%
        
        // 检查内存使用
        const memUsage = await serverManager.executeSSH("free | awk 'NR==2{printf \"%.0f\", $3*100/$2}'");
        health.memory = parseInt(memUsage) < 80; // 内存使用率低于80%
        
        console.log('健康检查结果:', health);
        return health;
    } catch (error) {
        console.error('健康检查失败:', error.message);
        return health;
    }
};`);
        
        log.success('服务器管理示例展示完成');
        
    } catch (error) {
        log.error(`服务器管理示例执行失败: ${error.message}`);
    }
}

/**
 * =======================================================
 * 3. 环境配置示例
 * =======================================================
 */
async function demonstrateEnvironmentConfig() {
    log.section('环境配置示例');
    
    try {
        // 导入配置模块
        log.subsection('导入配置模块');
        log.code('const apiConfig = require("../config/api");');
        
        const apiConfig = require('../config/api');
        log.success('配置模块导入成功');
        
        // 3.1 基础配置使用
        log.subsection('3.1 基础配置访问');
        log.code(`
// 访问当前环境配置
console.log('当前环境:', apiConfig.NODE_ENV);
console.log('API基础URL:', apiConfig.api.baseURL);
console.log('服务器端口:', apiConfig.server.port);

// 检查环境类型
if (apiConfig.isDevelopment) {
    console.log('运行在开发环境');
} else if (apiConfig.isProduction) {
    console.log('运行在生产环境');
}`);
        
        log.result(`当前环境: ${process.env.NODE_ENV || 'development'}`);
        log.result(`API基础URL: ${apiConfig.api.baseURL}`);
        log.result(`服务器端口: ${apiConfig.server.port}`);
        log.result(`是否开发环境: ${apiConfig.isDevelopment}`);
        
        // 3.2 数据库配置
        log.subsection('3.2 数据库配置示例');
        log.code(`
// 构建数据库连接URL
const buildDatabaseUrl = () => {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        username: process.env.DB_USERNAME || 'mobilif_app',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'mobilif'
    };
    
    if (!dbConfig.password) {
        throw new Error('数据库密码未设置');
    }
    
    const url = \`mysql://\${dbConfig.username}:\${dbConfig.password}@\${dbConfig.host}:\${dbConfig.port}/\${dbConfig.database}\`;
    return { dbConfig, url };
};

// 使用示例
try {
    const { dbConfig, url } = buildDatabaseUrl();
    console.log('数据库配置:', dbConfig);
    console.log('连接URL:', url.replace(/:([^:@]+)@/, ':****@')); // 隐藏密码
} catch (error) {
    console.error('数据库配置错误:', error.message);
}`);
        
        // 演示数据库配置（不显示实际密码）
        try {
            const dbConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                username: process.env.DB_USERNAME || 'mobilif_app',
                database: process.env.DB_DATABASE || 'mobilif'
            };
            log.result(`数据库主机: ${dbConfig.host}:${dbConfig.port}`);
            log.result(`数据库用户: ${dbConfig.username}`);
            log.result(`数据库名称: ${dbConfig.database}`);
        } catch (error) {
            log.warning(`数据库配置示例: ${error.message}`);
        }
        
        // 3.3 JWT配置
        log.subsection('3.3 JWT配置示例');
        log.code(`
// JWT配置访问
const jwtConfig = apiConfig.jwt;

console.log('JWT配置:');
console.log('- 密钥长度:', jwtConfig.secret ? jwtConfig.secret.length : 0);
console.log('- 过期时间:', jwtConfig.expiresIn);
console.log('- 刷新过期时间:', jwtConfig.refreshExpiresIn);

// JWT工具函数
const createJwtPayload = (userId, userRole) => {
    return {
        sub: userId,
        role: userRole,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天
    };
};

// 使用示例
const payload = createJwtPayload('user123', 'member');
console.log('JWT载荷示例:', payload);`);
        
        log.result(`JWT密钥: ${apiConfig.jwt.secret ? '已设置' : '未设置'}`);
        log.result(`JWT过期时间: ${apiConfig.jwt.expiresIn}`);
        log.result(`刷新令牌过期时间: ${apiConfig.jwt.refreshExpiresIn}`);
        
        // 3.4 文件上传配置
        log.subsection('3.4 文件上传配置');
        log.code(`
// 文件上传配置
const uploadConfig = apiConfig.upload;

console.log('文件上传配置:');
console.log('- 上传目录:', uploadConfig.dest);
console.log('- 最大文件大小:', (uploadConfig.maxSize / 1024 / 1024).toFixed(2) + 'MB');
console.log('- 允许的文件类型:', uploadConfig.allowedTypes.join(', '));

// 文件验证函数
const validateFile = (file) => {
    const errors = [];
    
    // 检查文件大小
    if (file.size > uploadConfig.maxSize) {
        errors.push(\`文件大小超出限制 (\${(file.size / 1024 / 1024).toFixed(2)}MB > \${(uploadConfig.maxSize / 1024 / 1024).toFixed(2)}MB)\`);
    }
    
    // 检查文件类型
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    if (!uploadConfig.allowedTypes.includes(fileExt)) {
        errors.push(\`不支持的文件类型: \${fileExt}\`);
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

// 使用示例
const mockFile = {
    originalname: 'avatar.jpg',
    size: 2 * 1024 * 1024 // 2MB
};

const validation = validateFile(mockFile);
console.log('文件验证结果:', validation);`);
        
        log.result(`上传目录: ${apiConfig.upload.dest}`);
        log.result(`最大文件大小: ${(apiConfig.upload.maxSize / 1024 / 1024).toFixed(2)}MB`);
        log.result(`允许的文件类型: ${apiConfig.upload.allowedTypes.join(', ')}`);
        
        // 3.5 环境特定配置
        log.subsection('3.5 环境特定配置');
        log.code(`
// 访问不同环境的配置
const configs = apiConfig.configs;

console.log('可用环境:', Object.keys(configs));

// 比较不同环境的配置
const compareConfigs = (env1, env2) => {
    const config1 = configs[env1];
    const config2 = configs[env2];
    
    if (!config1 || !config2) {
        return '环境不存在';
    }
    
    const differences = {};
    
    // 比较主要配置项
    const keyFields = ['DEBUG_ENABLED', 'SWAGGER_ENABLED', 'RATE_LIMIT_ENABLED', 'LOG_LEVEL'];
    
    keyFields.forEach(key => {
        if (config1[key] !== config2[key]) {
            differences[key] = {
                [env1]: config1[key],
                [env2]: config2[key]
            };
        }
    });
    
    return differences;
};

// 使用示例
const diff = compareConfigs('development', 'production');
console.log('开发环境vs生产环境差异:', diff);`);
        
        if (apiConfig.configs) {
            const envs = Object.keys(apiConfig.configs);
            log.result(`可用环境: ${envs.join(', ')}`);
            
            // 显示当前环境的关键配置
            log.result(`调试模式: ${apiConfig.DEBUG_ENABLED ? '开启' : '关闭'}`);
            log.result(`Swagger文档: ${apiConfig.SWAGGER_ENABLED ? '开启' : '关闭'}`);
            log.result(`限流保护: ${apiConfig.RATE_LIMIT_ENABLED ? '开启' : '关闭'}`);
        }
        
        // 3.6 配置验证
        log.subsection('3.6 配置验证示例');
        log.code(`
// 配置验证
const validateConfiguration = () => {
    const errors = [];
    const warnings = [];
    
    // 检查必需的环境变量
    const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_DATABASE'];
    
    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            errors.push(\`缺少必需的环境变量: \${envVar}\`);
        }
    });
    
    // 检查生产环境特定要求
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-jwt-secret-key') {
            errors.push('生产环境必须设置安全的JWT_SECRET');
        }
        
        if (!process.env.DB_PASSWORD) {
            errors.push('生产环境必须设置数据库密码');
        }
        
        if (apiConfig.DEBUG_ENABLED) {
            warnings.push('生产环境不应开启调试模式');
        }
    }
    
    // 检查端口配置
    const port = parseInt(process.env.PORT);
    if (isNaN(port) || port < 1 || port > 65535) {
        errors.push('PORT必须是有效的端口号(1-65535)');
    }
    
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};

// 执行验证
const validation = validateConfiguration();
console.log('配置验证结果:', validation);`);
        
        // 执行实际的配置验证
        try {
            if (typeof apiConfig.validateConfig === 'function') {
                const validationErrors = apiConfig.validateConfig();
                if (validationErrors.length === 0) {
                    log.success('配置验证通过');
                } else {
                    log.warning(`配置验证发现 ${validationErrors.length} 个问题`);
                    validationErrors.forEach(error => log.warning(`- ${error}`));
                }
            }
        } catch (error) {
            log.warning(`配置验证: ${error.message}`);
        }
        
        log.success('环境配置示例展示完成');
        
    } catch (error) {
        log.error(`环境配置示例执行失败: ${error.message}`);
    }
}

/**
 * =======================================================
 * 4. 错误处理示例
 * =======================================================
 */
async function demonstrateErrorHandling() {
    log.section('错误处理示例');
    
    try {
        // 4.1 API错误处理
        log.subsection('4.1 API错误处理');
        log.code(`
// 导入错误类
const { APIError, NetworkError, TimeoutError } = require('../config/api-client');

// API错误处理示例
const handleApiRequest = async (apiCall) => {
    try {
        const result = await apiCall();
        return { success: true, data: result };
    } catch (error) {
        // 根据错误类型进行不同处理
        if (error instanceof APIError) {
            console.error('API错误:', {
                message: error.message,
                status: error.status,
                code: error.code,
                timestamp: error.timestamp
            });
            
            // 根据状态码进行特殊处理
            switch (error.status) {
                case 401:
                    return { success: false, error: '认证失败，请重新登录' };
                case 403:
                    return { success: false, error: '权限不足' };
                case 404:
                    return { success: false, error: '资源不存在' };
                case 429:
                    return { success: false, error: '请求过于频繁，请稍后重试' };
                case 500:
                    return { success: false, error: '服务器内部错误' };
                default:
                    return { success: false, error: error.message };
            }
        } else if (error instanceof NetworkError) {
            console.error('网络错误:', error.message);
            return { success: false, error: '网络连接失败，请检查网络设置' };
        } else if (error instanceof TimeoutError) {
            console.error('请求超时:', error.message);
            return { success: false, error: \`请求超时 (\${error.timeout}ms)\` };
        } else {
            console.error('未知错误:', error);
            return { success: false, error: '系统错误，请联系管理员' };
        }
    }
};`);
        
        // 演示错误处理
        const { APIError, NetworkError, TimeoutError } = require('../config/api-client');
        
        // 创建示例错误
        const apiError = new APIError('用户不存在', 'USER_NOT_FOUND', 404, null);
        const networkError = new NetworkError('连接被拒绝', new Error('ECONNREFUSED'));
        const timeoutError = new TimeoutError('请求超时', 30000);
        
        log.result(`API错误示例: ${apiError.name} - ${apiError.message} (状态码: ${apiError.status})`);
        log.result(`网络错误示例: ${networkError.name} - ${networkError.message}`);
        log.result(`超时错误示例: ${timeoutError.name} - ${timeoutError.message} (${timeoutError.timeout}ms)`);
        
        // 4.2 重试机制示例
        log.subsection('4.2 重试机制示例');
        log.code(`
// 带重试的请求函数
const requestWithRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(\`尝试第 \${attempt} 次请求...\`);
            
            const result = await apiCall();
            console.log(\`请求成功 (第 \${attempt} 次尝试)\`);
            return result;
            
        } catch (error) {
            lastError = error;
            console.log(\`第 \${attempt} 次请求失败: \${error.message}\`);
            
            // 判断是否应该重试
            if (shouldRetry(error) && attempt < maxRetries) {
                const waitTime = delay * Math.pow(2, attempt - 1); // 指数退避
                console.log(\`等待 \${waitTime}ms 后重试...\`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                break;
            }
        }
    }
    
    throw lastError;
};

// 判断是否应该重试
const shouldRetry = (error) => {
    // 网络错误或超时错误应该重试
    if (error instanceof NetworkError || error instanceof TimeoutError) {
        return true;
    }
    
    // 5xx服务器错误应该重试
    if (error instanceof APIError && error.status >= 500) {
        return true;
    }
    
    // 429 (Too Many Requests) 应该重试
    if (error instanceof APIError && error.status === 429) {
        return true;
    }
    
    return false;
};`);
        
        // 4.3 错误日志记录
        log.subsection('4.3 错误日志记录');
        log.code(`
// 错误日志记录器
class ErrorLogger {
    constructor() {
        this.logs = [];
    }
    
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
        
        this.logs.push(logEntry);
        
        // 根据严重程度选择不同的输出方式
        switch (logEntry.severity) {
            case 'critical':
                console.error('🚨 CRITICAL ERROR:', logEntry);
                // 发送告警邮件/短信
                break;
            case 'error':
                console.error('❌ ERROR:', logEntry);
                break;
            case 'warning':
                console.warn('⚠️ WARNING:', logEntry);
                break;
            default:
                console.log('ℹ️ INFO:', logEntry);
        }
        
        return logEntry;
    }
    
    determineSeverity(error) {
        if (error instanceof APIError) {
            if (error.status >= 500) return 'critical';
            if (error.status >= 400) return 'error';
            return 'warning';
        }
        
        if (error instanceof NetworkError) return 'error';
        if (error instanceof TimeoutError) return 'warning';
        
        return 'error';
    }
    
    getRecentLogs(minutes = 60) {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        return this.logs.filter(log => new Date(log.timestamp) > cutoff);
    }
    
    getLogsByType(errorType) {
        return this.logs.filter(log => log.error.name === errorType);
    }
}

// 使用示例
const errorLogger = new ErrorLogger();

// 记录不同类型的错误
errorLogger.log(new APIError('用户认证失败', 'AUTH_FAILED', 401), {
    userId: 'user123',
    endpoint: '/api/protected-resource'
});

errorLogger.log(new NetworkError('连接超时'), {
    url: 'https://api.example.com/data',
    timeout: 30000
});`);
        
        // 创建错误日志记录器示例
        class ErrorLogger {
            constructor() {
                this.logs = [];
            }
            
            log(error, context = {}) {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    error: {
                        name: error.name,
                        message: error.message
                    },
                    context,
                    severity: this.determineSeverity(error)
                };
                
                this.logs.push(logEntry);
                return logEntry;
            }
            
            determineSeverity(error) {
                if (error instanceof APIError) {
                    if (error.status >= 500) return 'critical';
                    if (error.status >= 400) return 'error';
                    return 'warning';
                }
                return 'error';
            }
        }
        
        const errorLogger = new ErrorLogger();
        const logEntry = errorLogger.log(apiError, { userId: 'demo123' });
        log.result(`错误日志记录: ${logEntry.severity} - ${logEntry.error.message}`);
        
        // 4.4 全局错误处理
        log.subsection('4.4 全局错误处理');
        log.code(`
// 全局错误处理器
class GlobalErrorHandler {
    constructor() {
        this.setupHandlers();
    }
    
    setupHandlers() {
        // 处理未捕获的异常
        process.on('uncaughtException', this.handleUncaughtException.bind(this));
        
        // 处理未处理的Promise拒绝
        process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));
        
        // 处理警告
        process.on('warning', this.handleWarning.bind(this));
    }
    
    handleUncaughtException(error) {
        console.error('💥 未捕获的异常:', error);
        
        // 记录错误
        this.logCriticalError(error, 'uncaughtException');
        
        // 优雅关闭
        this.gracefulShutdown();
    }
    
    handleUnhandledRejection(reason, promise) {
        console.error('🚫 未处理的Promise拒绝:', reason);
        console.error('Promise:', promise);
        
        // 记录错误
        this.logCriticalError(reason, 'unhandledRejection');
    }
    
    handleWarning(warning) {
        console.warn('⚠️ 系统警告:', warning.message);
        
        // 记录警告
        this.logWarning(warning);
    }
    
    logCriticalError(error, type) {
        const errorInfo = {
            type,
            error: error.message || error,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            process: {
                pid: process.pid,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        };
        
        // 写入错误日志文件
        // fs.appendFileSync('critical-errors.log', JSON.stringify(errorInfo) + '\\n');
        
        console.error('严重错误已记录:', errorInfo);
    }
    
    logWarning(warning) {
        const warningInfo = {
            message: warning.message,
            name: warning.name,
            timestamp: new Date().toISOString()
        };
        
        console.warn('警告已记录:', warningInfo);
    }
    
    gracefulShutdown() {
        console.log('开始优雅关闭...');
        
        // 停止接受新请求
        // 完成现有请求
        // 关闭数据库连接
        // 清理资源
        
        process.exit(1);
    }
}

// 初始化全局错误处理器
const globalErrorHandler = new GlobalErrorHandler();`);
        
        // 4.5 错误恢复策略
        log.subsection('4.5 错误恢复策略');
        log.code(`
// 错误恢复策略
class ErrorRecoveryStrategy {
    static async recoverFromDatabaseError(error, operation) {
        console.log('数据库错误恢复策略:', error.message);
        
        // 策略1: 重试连接
        try {
            await this.retryDatabaseConnection();
            return await operation();
        } catch (retryError) {
            console.log('重试失败，尝试备用数据库');
            
            // 策略2: 使用备用数据库
            try {
                await this.switchToBackupDatabase();
                return await operation();
            } catch (backupError) {
                console.log('备用数据库也失败，使用缓存数据');
                
                // 策略3: 使用缓存数据
                return await this.getFallbackData();
            }
        }
    }
    
    static async recoverFromNetworkError(error, request) {
        console.log('网络错误恢复策略:', error.message);
        
        // 策略1: 检查网络连接
        const isOnline = await this.checkNetworkConnectivity();
        if (!isOnline) {
            // 使用离线模式
            return await this.handleOfflineMode(request);
        }
        
        // 策略2: 使用备用API端点
        try {
            return await this.useBackupEndpoint(request);
        } catch (backupError) {
            // 策略3: 降级处理
            return await this.degradedServiceResponse(request);
        }
    }
    
    static async recoverFromServiceError(error, service) {
        console.log('服务错误恢复策略:', error.message);
        
        // 策略1: 重启服务
        try {
            await this.restartService(service);
            return { recovered: true, method: 'restart' };
        } catch (restartError) {
            // 策略2: 切换到备用服务
            try {
                await this.switchToBackupService(service);
                return { recovered: true, method: 'backup' };
            } catch (backupError) {
                // 策略3: 服务降级
                await this.enableDegradedMode(service);
                return { recovered: true, method: 'degraded' };
            }
        }
    }
    
    // 辅助方法（简化实现）
    static async retryDatabaseConnection() {
        console.log('重试数据库连接...');
        // 实际实现会重新连接数据库
    }
    
    static async switchToBackupDatabase() {
        console.log('切换到备用数据库...');
        // 实际实现会切换到备用数据库
    }
    
    static async getFallbackData() {
        console.log('获取缓存数据...');
        return { fallback: true, data: [] };
    }
    
    static async checkNetworkConnectivity() {
        console.log('检查网络连接...');
        return true; // 简化实现
    }
    
    static async handleOfflineMode(request) {
        console.log('启用离线模式...');
        return { offline: true, cached: true };
    }
    
    static async useBackupEndpoint(request) {
        console.log('使用备用API端点...');
        return { backup: true };
    }
    
    static async degradedServiceResponse(request) {
        console.log('降级服务响应...');
        return { degraded: true, limited: true };
    }
}

// 使用示例
const handleRequestWithRecovery = async (apiCall) => {
    try {
        return await apiCall();
    } catch (error) {
        if (error.message.includes('database')) {
            return await ErrorRecoveryStrategy.recoverFromDatabaseError(error, apiCall);
        } else if (error instanceof NetworkError) {
            return await ErrorRecoveryStrategy.recoverFromNetworkError(error, 'api-request');
        } else {
            throw error; // 无法恢复的错误继续抛出
        }
    }
};`);
        
        log.success('错误处理示例展示完成');
        
    } catch (error) {
        log.error(`错误处理示例执行失败: ${error.message}`);
    }
}

/**
 * =======================================================
 * 5. 综合使用示例
 * =======================================================
 */
async function demonstrateIntegratedUsage() {
    log.section('综合使用示例');
    
    try {
        log.subsection('5.1 完整的应用启动流程');
        log.code(`
// 完整的应用启动流程示例
class MobiLifApplication {
    constructor() {
        this.config = null;
        this.apiClient = null;
        this.serverManager = null;
        this.errorHandler = null;
    }
    
    async initialize() {
        try {
            // 1. 加载和验证配置
            console.log('🔧 加载应用配置...');
            this.config = require('../config/api');
            
            // 验证配置
            if (typeof this.config.validateConfig === 'function') {
                const configErrors = this.config.validateConfig();
                if (configErrors.length > 0) {
                    throw new Error(\`配置验证失败: \${configErrors.join(', ')}\`);
                }
            }
            
            // 2. 初始化API客户端
            console.log('🌐 初始化API客户端...');
            const { APIClient } = require('../config/api-client');
            this.apiClient = new APIClient({
                baseURL: this.config.api.baseURL,
                timeout: this.config.REQUEST_TIMEOUT,
                enableLogging: this.config.DEBUG_ENABLED
            });
            
            // 3. 初始化服务器管理器（如果需要）
            if (process.env.ENABLE_SERVER_MANAGEMENT === 'true') {
                console.log('🖥️ 初始化服务器管理器...');
                const ServerManager = require('../scripts/server-manager');
                this.serverManager = new ServerManager({
                    host: process.env.SERVER_HOST,
                    user: process.env.SSH_USER
                });
            }
            
            // 4. 设置错误处理
            console.log('🛡️ 设置错误处理...');
            this.setupErrorHandling();
            
            // 5. 执行健康检查
            console.log('❤️ 执行系统健康检查...');
            await this.performHealthCheck();
            
            console.log('✅ 应用初始化完成');
            return true;
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error.message);
            throw error;
        }
    }
    
    setupErrorHandling() {
        // 设置全局错误处理
        process.on('uncaughtException', (error) => {
            console.error('💥 未捕获异常:', error);
            this.gracefulShutdown();
        });
        
        process.on('unhandledRejection', (reason) => {
            console.error('🚫 未处理的Promise拒绝:', reason);
        });
    }
    
    async performHealthCheck() {
        const healthChecks = [];
        
        // API健康检查
        healthChecks.push(
            this.apiClient.health()
                .then(result => ({ api: result.status }))
                .catch(() => ({ api: 'unhealthy' }))
        );
        
        // 服务器健康检查
        if (this.serverManager) {
            healthChecks.push(
                this.serverManager.getStatus()
                    .then(status => ({ server: 'healthy' }))
                    .catch(() => ({ server: 'unhealthy' }))
            );
        }
        
        const results = await Promise.all(healthChecks);
        const health = Object.assign({}, ...results);
        
        console.log('健康检查结果:', health);
        return health;
    }
    
    async gracefulShutdown() {
        console.log('🔄 开始优雅关闭...');
        
        // 清理资源
        // 关闭数据库连接
        // 停止定时任务
        // 保存重要数据
        
        process.exit(0);
    }
}

// 使用示例
const app = new MobiLifApplication();
app.initialize()
    .then(() => {
        console.log('🚀 应用启动成功');
    })
    .catch((error) => {
        console.error('💥 应用启动失败:', error.message);
        process.exit(1);
    });`);
        
        log.subsection('5.2 实际业务场景示例');
        log.code(`
// 用户预订健身课程的完整流程
const bookingWorkflow = async (userId, classId) => {
    const { APIClient, APIError } = require('../config/api-client');
    const apiClient = new APIClient();
    
    try {
        // 1. 验证用户登录状态
        console.log('验证用户登录状态...');
        const userProfile = await apiClient.getUser(userId);
        
        if (!userProfile || userProfile.status !== 'active') {
            throw new APIError('用户状态异常', 'USER_INVALID', 400);
        }
        
        // 2. 检查课程可用性
        console.log('检查课程可用性...');
        const classInfo = await apiClient.get(\`/classes/\${classId}\`);
        
        if (classInfo.status !== 'scheduled') {
            throw new APIError('课程不可预订', 'CLASS_UNAVAILABLE', 400);
        }
        
        if (classInfo.currentParticipants >= classInfo.maxParticipants) {
            throw new APIError('课程已满', 'CLASS_FULL', 400);
        }
        
        // 3. 检查用户是否已预订
        console.log('检查预订状态...');
        const existingBooking = await apiClient.get(\`/bookings/user/\${userId}/class/\${classId}\`)
            .catch(() => null); // 如果没有预订记录，忽略错误
        
        if (existingBooking) {
            throw new APIError('已经预订过此课程', 'ALREADY_BOOKED', 400);
        }
        
        // 4. 创建预订
        console.log('创建预订...');
        const booking = await apiClient.post('/bookings', {
            userId,
            classId,
            bookingTime: new Date().toISOString()
        });
        
        // 5. 发送确认通知
        console.log('发送确认通知...');
        await apiClient.post('/notifications', {
            userId,
            type: 'booking_confirmed',
            data: {
                classId,
                bookingId: booking.id,
                className: classInfo.name,
                classTime: classInfo.startTime
            }
        });
        
        console.log('✅ 预订成功');
        return {
            success: true,
            booking,
            classInfo
        };
        
    } catch (error) {
        console.error('❌ 预订失败:', error.message);
        
        // 根据错误类型返回用户友好的消息
        let userMessage = '预订失败，请稍后重试';
        
        if (error instanceof APIError) {
            switch (error.code) {
                case 'USER_INVALID':
                    userMessage = '用户状态异常，请重新登录';
                    break;
                case 'CLASS_UNAVAILABLE':
                    userMessage = '课程暂时不可预订';
                    break;
                case 'CLASS_FULL':
                    userMessage = '课程已满，请选择其他课程';
                    break;
                case 'ALREADY_BOOKED':
                    userMessage = '您已经预订过此课程';
                    break;
            }
        }
        
        return {
            success: false,
            error: userMessage,
            details: error.message
        };
    }
};

// 使用示例
const testBooking = async () => {
    const result = await bookingWorkflow('user123', 'class456');
    console.log('预订结果:', result);
};`);
        
        log.subsection('5.3 定时任务和监控示例');
        log.code(`
// 系统监控和维护任务
class SystemMonitor {
    constructor() {
        this.apiClient = null;
        this.serverManager = null;
        this.intervals = [];
    }
    
    async initialize() {
        const { APIClient } = require('../config/api-client');
        const ServerManager = require('../scripts/server-manager');
        
        this.apiClient = new APIClient();
        this.serverManager = new ServerManager();
        
        // 启动监控任务
        this.startHealthMonitoring();
        this.startPerformanceMonitoring();
        this.startMaintenanceTasks();
    }
    
    startHealthMonitoring() {
        // 每5分钟检查系统健康状态
        const healthInterval = setInterval(async () => {
            try {
                console.log('🏥 执行健康检查...');
                
                const health = await Promise.all([
                    this.checkApiHealth(),
                    this.checkServerHealth(),
                    this.checkDatabaseHealth()
                ]);
                
                const overallHealth = health.every(h => h.healthy);
                
                if (!overallHealth) {
                    console.warn('⚠️ 系统健康状态异常');
                    await this.handleHealthIssues(health);
                } else {
                    console.log('✅ 系统健康状态正常');
                }
                
            } catch (error) {
                console.error('❌ 健康检查失败:', error.message);
            }
        }, 5 * 60 * 1000); // 5分钟
        
        this.intervals.push(healthInterval);
    }
    
    startPerformanceMonitoring() {
        // 每小时收集性能指标
        const perfInterval = setInterval(async () => {
            try {
                console.log('📊 收集性能指标...');
                
                const metrics = await this.collectMetrics();
                await this.analyzePerformance(metrics);
                
            } catch (error) {
                console.error('❌ 性能监控失败:', error.message);
            }
        }, 60 * 60 * 1000); // 1小时
        
        this.intervals.push(perfInterval);
    }
    
    startMaintenanceTasks() {
        // 每日维护任务
        const maintenanceInterval = setInterval(async () => {
            try {
                console.log('🔧 执行维护任务...');
                
                await this.cleanupOldLogs();
                await this.optimizeDatabase();
                await this.createBackup();
                
                console.log('✅ 维护任务完成');
                
            } catch (error) {
                console.error('❌ 维护任务失败:', error.message);
            }
        }, 24 * 60 * 60 * 1000); // 24小时
        
        this.intervals.push(maintenanceInterval);
    }
    
    async checkApiHealth() {
        try {
            const result = await this.apiClient.health();
            return { service: 'api', healthy: result.status === 'healthy' };
        } catch (error) {
            return { service: 'api', healthy: false, error: error.message };
        }
    }
    
    async checkServerHealth() {
        try {
            const status = await this.serverManager.getStatus();
            return { service: 'server', healthy: status.overall === 'healthy' };
        } catch (error) {
            return { service: 'server', healthy: false, error: error.message };
        }
    }
    
    async checkDatabaseHealth() {
        try {
            // 模拟数据库健康检查
            const result = await this.apiClient.get('/health/database');
            return { service: 'database', healthy: result.status === 'healthy' };
        } catch (error) {
            return { service: 'database', healthy: false, error: error.message };
        }
    }
    
    async handleHealthIssues(healthResults) {
        const unhealthyServices = healthResults.filter(h => !h.healthy);
        
        for (const service of unhealthyServices) {
            console.log(\`🚨 服务异常: \${service.service}\`);
            
            // 根据服务类型采取不同的恢复策略
            switch (service.service) {
                case 'api':
                    await this.restartApiService();
                    break;
                case 'server':
                    await this.restartServerServices();
                    break;
                case 'database':
                    await this.restartDatabase();
                    break;
            }
        }
    }
    
    async collectMetrics() {
        return {
            timestamp: new Date().toISOString(),
            api: {
                responseTime: Math.random() * 1000, // 模拟响应时间
                requestCount: Math.floor(Math.random() * 10000),
                errorRate: Math.random() * 0.05
            },
            server: {
                cpuUsage: Math.random() * 100,
                memoryUsage: Math.random() * 100,
                diskUsage: Math.random() * 100
            }
        };
    }
    
    async analyzePerformance(metrics) {
        // 分析性能指标
        if (metrics.api.responseTime > 2000) {
            console.warn('⚠️ API响应时间过长');
        }
        
        if (metrics.api.errorRate > 0.01) {
            console.warn('⚠️ API错误率过高');
        }
        
        if (metrics.server.cpuUsage > 80) {
            console.warn('⚠️ CPU使用率过高');
        }
        
        if (metrics.server.memoryUsage > 85) {
            console.warn('⚠️ 内存使用率过高');
        }
    }
    
    async cleanupOldLogs() {
        console.log('🧹 清理旧日志文件...');
        // 实际实现会删除旧的日志文件
    }
    
    async optimizeDatabase() {
        console.log('⚡ 优化数据库...');
        // 实际实现会执行数据库优化
    }
    
    async createBackup() {
        console.log('💾 创建系统备份...');
        if (this.serverManager) {
            await this.serverManager.backup();
        }
    }
    
    stop() {
        console.log('🛑 停止监控任务...');
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
    }
}

// 使用示例
const monitor = new SystemMonitor();
monitor.initialize()
    .then(() => {
        console.log('🔍 系统监控已启动');
    })
    .catch((error) => {
        console.error('❌ 监控启动失败:', error.message);
    });

// 优雅关闭时停止监控
process.on('SIGTERM', () => {
    monitor.stop();
    process.exit(0);
});`);
        
        log.success('综合使用示例展示完成');
        
    } catch (error) {
        log.error(`综合使用示例执行失败: ${error.message}`);
    }
}

/**
 * =======================================================
 * 主函数和命令行接口
 * =======================================================
 */
async function main() {
    const args = process.argv.slice(2);
    const exampleType = args[0] || 'all';
    
    console.log(`${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}         MobiLiF 项目功能使用示例${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}`);
    console.log(`\n${colors.blue}本文件展示了如何使用 MobiLiF 项目中创建的各种功能模块${colors.reset}`);
    console.log(`${colors.dim}运行时间: ${new Date().toLocaleString()}${colors.reset}\n`);
    
    try {
        switch (exampleType.toLowerCase()) {
            case 'api-client':
            case 'api':
                await demonstrateApiClient();
                break;
                
            case 'server-manager':
            case 'server':
                await demonstrateServerManager();
                break;
                
            case 'config':
            case 'environment':
            case 'env':
                await demonstrateEnvironmentConfig();
                break;
                
            case 'error-handling':
            case 'error':
            case 'errors':
                await demonstrateErrorHandling();
                break;
                
            case 'integrated':
            case 'integration':
                await demonstrateIntegratedUsage();
                break;
                
            case 'all':
            default:
                await demonstrateApiClient();
                await demonstrateServerManager();
                await demonstrateEnvironmentConfig();
                await demonstrateErrorHandling();
                await demonstrateIntegratedUsage();
                break;
        }
        
        console.log(`\n${colors.green}${colors.bright}🎉 示例展示完成！${colors.reset}`);
        console.log(`\n${colors.blue}💡 提示:${colors.reset}`);
        console.log(`${colors.dim}• 运行特定示例: node examples/usage-examples.js [示例名称]${colors.reset}`);
        console.log(`${colors.dim}• 可用示例: api-client, server-manager, config, error-handling, integrated, all${colors.reset}`);
        console.log(`${colors.dim}• 查看详细文档: docs/validation-guide.md${colors.reset}`);
        
    } catch (error) {
        console.error(`\n${colors.red}${colors.bright}❌ 示例执行失败:${colors.reset} ${error.message}`);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('未捕获的错误:', error);
        process.exit(1);
    });
}

// 导出示例函数供其他模块使用
module.exports = {
    demonstrateApiClient,
    demonstrateServerManager,
    demonstrateEnvironmentConfig,
    demonstrateErrorHandling,
    demonstrateIntegratedUsage
};