/**
 * API 配置文件
 * 根据环境变量动态配置API相关设置
 */

const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 获取当前环境
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * 开发环境配置
 */
const development = {
    // 基础配置
    NODE_ENV: 'development',
    PORT: parseInt(process.env.PORT) || 3000,
    HOST: process.env.HOST || 'localhost',
    
    // API配置
    API_PREFIX: process.env.API_PREFIX || '/api',
    API_VERSION: process.env.API_VERSION || 'v1',
    API_BASE_URL: process.env.SERVER_API_BASE || `http://localhost:${parseInt(process.env.PORT) || 3000}`,
    
    // 服务器配置
    SERVER_HOST: process.env.SERVER_HOST || 'localhost',
    SERVER_PORT: parseInt(process.env.SERVER_PORT) || 3000,
    
    // 请求配置
    REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 30000, // 30秒
    MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE || '10mb',
    
    // CORS配置
    CORS_ORIGINS: process.env.CORS_ORIGINS ? 
        process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
        ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
    
    // 限流配置
    RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED === 'true',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15分钟
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    
    // 安全配置
    JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    
    // 加密配置
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    
    // 文件上传配置
    UPLOAD_DEST: process.env.UPLOAD_DEST || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES ?
        process.env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim()) :
        ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf'],
    
    // 调试配置
    DEBUG_ENABLED: process.env.DEBUG_ENABLED === 'true',
    SWAGGER_ENABLED: process.env.SWAGGER_ENABLED !== 'false', // 默认开启
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    
    // 健康检查配置
    HEALTH_CHECK_ENABLED: process.env.HEALTH_CHECK_ENABLED !== 'false',
    HEALTH_CHECK_PATH: '/health',
    
    // 微信小程序配置
    WECHAT_APP_ID: process.env.WECHAT_APP_ID || '',
    WECHAT_APP_SECRET: process.env.WECHAT_APP_SECRET || '',
    
    // 第三方服务配置
    SMS_ENABLED: process.env.SMS_ENABLED === 'true',
    EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
    
    // 缓存配置
    CACHE_TTL_DEFAULT: parseInt(process.env.CACHE_TTL_DEFAULT) || 300, // 5分钟
    CACHE_TTL_USER_SESSION: parseInt(process.env.CACHE_TTL_USER_SESSION) || 3600, // 1小时
    
    // 监控配置
    PROMETHEUS_ENABLED: process.env.PROMETHEUS_ENABLED === 'true',
    SENTRY_ENABLED: process.env.SENTRY_ENABLED === 'true',
    SENTRY_DSN: process.env.SENTRY_DSN || '',
};

/**
 * 生产环境配置
 */
const production = {
    // 基础配置
    NODE_ENV: 'production',
    PORT: parseInt(process.env.PORT) || 3000,
    HOST: process.env.HOST || '0.0.0.0',
    
    // API配置
    API_PREFIX: process.env.API_PREFIX || '/api',
    API_VERSION: process.env.API_VERSION || 'v1',
    API_BASE_URL: process.env.SERVER_API_BASE || `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT || 3000}`,
    
    // 服务器配置
    SERVER_HOST: process.env.SERVER_HOST || 'localhost',
    SERVER_PORT: parseInt(process.env.SERVER_PORT) || 3000,
    
    // 请求配置
    REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
    MAX_REQUEST_SIZE: process.env.MAX_REQUEST_SIZE || '10mb',
    
    // CORS配置
    CORS_ORIGINS: process.env.CORS_ORIGINS ? 
        process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
        [`http://${process.env.SERVER_HOST}`, `https://${process.env.SERVER_HOST}`],
    CORS_CREDENTIALS: process.env.CORS_CREDENTIALS !== 'false',
    
    // 限流配置
    RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== 'false', // 默认开启
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    
    // 安全配置
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    
    // 加密配置
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    
    // 文件上传配置
    UPLOAD_DEST: process.env.UPLOAD_DEST || '/var/www/mobilif/uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES ?
        process.env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim()) :
        ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf'],
    
    // 调试配置
    DEBUG_ENABLED: process.env.DEBUG_ENABLED === 'true',
    SWAGGER_ENABLED: process.env.SWAGGER_ENABLED === 'true',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // 健康检查配置
    HEALTH_CHECK_ENABLED: process.env.HEALTH_CHECK_ENABLED !== 'false',
    HEALTH_CHECK_PATH: '/health',
    
    // 微信小程序配置
    WECHAT_APP_ID: process.env.WECHAT_APP_ID,
    WECHAT_APP_SECRET: process.env.WECHAT_APP_SECRET,
    
    // 第三方服务配置
    SMS_ENABLED: process.env.SMS_ENABLED === 'true',
    EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
    
    // 缓存配置
    CACHE_TTL_DEFAULT: parseInt(process.env.CACHE_TTL_DEFAULT) || 300,
    CACHE_TTL_USER_SESSION: parseInt(process.env.CACHE_TTL_USER_SESSION) || 3600,
    
    // 监控配置
    PROMETHEUS_ENABLED: process.env.PROMETHEUS_ENABLED === 'true',
    SENTRY_ENABLED: process.env.SENTRY_ENABLED === 'true',
    SENTRY_DSN: process.env.SENTRY_DSN || '',
};

/**
 * 环境配置映射
 */
const configs = {
    development,
    production,
    // 测试环境可以继承开发环境配置
    test: {
        ...development,
        NODE_ENV: 'test',
        PORT: 3001,
        LOG_LEVEL: 'error',
        SWAGGER_ENABLED: false,
        RATE_LIMIT_ENABLED: false,
    }
};

/**
 * 获取当前环境配置
 */
const currentConfig = configs[NODE_ENV] || configs.development;

/**
 * 配置验证函数
 */
function validateConfig(config) {
    const errors = [];
    
    // 必需的配置项检查
    if (config.NODE_ENV === 'production') {
        if (!config.JWT_SECRET || config.JWT_SECRET === 'dev-jwt-secret-key') {
            errors.push('生产环境必须设置 JWT_SECRET');
        }
        
        if (!config.JWT_REFRESH_SECRET || config.JWT_REFRESH_SECRET === 'dev-refresh-secret-key') {
            errors.push('生产环境必须设置 JWT_REFRESH_SECRET');
        }
        
        if (!config.WECHAT_APP_ID) {
            errors.push('生产环境必须设置 WECHAT_APP_ID');
        }
        
        if (!config.WECHAT_APP_SECRET) {
            errors.push('生产环境必须设置 WECHAT_APP_SECRET');
        }
    }
    
    // 端口号检查
    if (isNaN(config.PORT) || config.PORT < 1 || config.PORT > 65535) {
        errors.push('PORT 必须是 1-65535 之间的有效端口号');
    }
    
    // 文件大小检查
    if (isNaN(config.MAX_FILE_SIZE) || config.MAX_FILE_SIZE < 0) {
        errors.push('MAX_FILE_SIZE 必须是有效的数字');
    }
    
    return errors;
}

/**
 * 显示配置信息
 */
function displayConfig(config = currentConfig) {
    console.log(`
╔════════════════════════════════════════╗
║           API 配置信息                  ║
╚════════════════════════════════════════╝

环境: ${config.NODE_ENV}
端口: ${config.PORT}
主机: ${config.HOST}
API基础URL: ${config.API_BASE_URL}
API前缀: ${config.API_PREFIX}/${config.API_VERSION}

安全配置:
- JWT密钥: ${config.JWT_SECRET ? '已设置' : '未设置'}
- JWT过期时间: ${config.JWT_EXPIRES_IN}
- 加密轮数: ${config.BCRYPT_ROUNDS}

功能开关:
- 调试模式: ${config.DEBUG_ENABLED ? '开启' : '关闭'}
- Swagger文档: ${config.SWAGGER_ENABLED ? '开启' : '关闭'}
- 限流保护: ${config.RATE_LIMIT_ENABLED ? '开启' : '关闭'}
- 健康检查: ${config.HEALTH_CHECK_ENABLED ? '开启' : '关闭'}

文件上传:
- 上传目录: ${config.UPLOAD_DEST}
- 最大文件大小: ${(config.MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB
- 允许类型: ${config.ALLOWED_FILE_TYPES.join(', ')}

微信配置:
- AppID: ${config.WECHAT_APP_ID ? '已设置' : '未设置'}
- AppSecret: ${config.WECHAT_APP_SECRET ? '已设置' : '未设置'}
`);
}

/**
 * 初始化配置
 */
function initConfig() {
    // 验证配置
    const errors = validateConfig(currentConfig);
    
    if (errors.length > 0) {
        console.error('⚠️ 配置验证失败:');
        errors.forEach(error => console.error(`  ❌ ${error}`));
        
        if (currentConfig.NODE_ENV === 'production') {
            throw new Error('生产环境配置验证失败，请检查环境变量');
        } else {
            console.warn('⚠️ 开发环境配置有问题，但继续运行');
        }
    }
    
    // 开发环境显示配置信息
    if (currentConfig.NODE_ENV === 'development' && currentConfig.DEBUG_ENABLED) {
        displayConfig();
    }
    
    return currentConfig;
}

// 导出配置
module.exports = {
    // 当前环境配置
    ...currentConfig,
    
    // 所有环境配置
    configs,
    
    // 工具函数
    validateConfig,
    displayConfig,
    initConfig,
    
    // 环境判断
    isDevelopment: NODE_ENV === 'development',
    isProduction: NODE_ENV === 'production',
    isTest: NODE_ENV === 'test',
    
    // 常用配置组合
    server: {
        host: currentConfig.HOST,
        port: currentConfig.PORT,
        timeout: currentConfig.REQUEST_TIMEOUT,
    },
    
    api: {
        baseURL: currentConfig.API_BASE_URL,
        prefix: currentConfig.API_PREFIX,
        version: currentConfig.API_VERSION,
        fullPrefix: `${currentConfig.API_PREFIX}/${currentConfig.API_VERSION}`,
    },
    
    cors: {
        origins: currentConfig.CORS_ORIGINS,
        credentials: currentConfig.CORS_CREDENTIALS,
    },
    
    rateLimit: {
        enabled: currentConfig.RATE_LIMIT_ENABLED,
        windowMs: currentConfig.RATE_LIMIT_WINDOW_MS,
        max: currentConfig.RATE_LIMIT_MAX,
    },
    
    jwt: {
        secret: currentConfig.JWT_SECRET,
        expiresIn: currentConfig.JWT_EXPIRES_IN,
        refreshSecret: currentConfig.JWT_REFRESH_SECRET,
        refreshExpiresIn: currentConfig.JWT_REFRESH_EXPIRES_IN,
    },
    
    upload: {
        dest: currentConfig.UPLOAD_DEST,
        maxSize: currentConfig.MAX_FILE_SIZE,
        allowedTypes: currentConfig.ALLOWED_FILE_TYPES,
    },
    
    wechat: {
        appId: currentConfig.WECHAT_APP_ID,
        appSecret: currentConfig.WECHAT_APP_SECRET,
    },
    
    cache: {
        defaultTTL: currentConfig.CACHE_TTL_DEFAULT,
        sessionTTL: currentConfig.CACHE_TTL_USER_SESSION,
    },
    
    monitoring: {
        prometheus: currentConfig.PROMETHEUS_ENABLED,
        sentry: currentConfig.SENTRY_ENABLED,
        sentryDSN: currentConfig.SENTRY_DSN,
    }
};