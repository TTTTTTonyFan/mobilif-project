/**
 * 集成测试环境变量设置
 * 在测试运行前设置所需的环境变量
 */

// 设置测试环境
process.env.NODE_ENV = 'test';

// 数据库配置
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://root:test_password@localhost:3306/mobilif_test';
process.env.DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
process.env.DATABASE_PORT = process.env.DATABASE_PORT || '3306';
process.env.DATABASE_USERNAME = process.env.DATABASE_USERNAME || 'root';
process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || 'test_password';
process.env.DATABASE_NAME = process.env.DATABASE_NAME || 'mobilif_test';

// Redis配置
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379/1';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.REDIS_DB = process.env.REDIS_DB || '1';

// JWT配置
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-integration-tests';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// 应用配置
process.env.APP_PORT = process.env.APP_PORT || '3001'; // 使用不同端口避免冲突
process.env.APP_HOST = process.env.APP_HOST || 'localhost';
process.env.API_PREFIX = process.env.API_PREFIX || 'api';

// 微信小程序配置（测试环境）
process.env.WECHAT_APP_ID = process.env.WECHAT_APP_ID || 'test-wechat-app-id';
process.env.WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET || 'test-wechat-app-secret';

// 支付配置（测试环境）
process.env.PAYMENT_SANDBOX = 'true';
process.env.PAYMENT_API_KEY = process.env.PAYMENT_API_KEY || 'test-payment-api-key';

// 日志配置
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error'; // 测试时减少日志输出
process.env.LOG_FORMAT = process.env.LOG_FORMAT || 'json';

// 外部服务配置
process.env.EXTERNAL_API_TIMEOUT = process.env.EXTERNAL_API_TIMEOUT || '5000';
process.env.EXTERNAL_API_RETRIES = process.env.EXTERNAL_API_RETRIES || '1';

// 缓存配置
process.env.CACHE_TTL = process.env.CACHE_TTL || '300'; // 5分钟
process.env.CACHE_MAX_ITEMS = process.env.CACHE_MAX_ITEMS || '100';

// 测试专用配置
process.env.RESET_DB_BEFORE_EACH = process.env.RESET_DB_BEFORE_EACH || 'false';
process.env.PARALLEL_TESTS = process.env.PARALLEL_TESTS || 'false';
process.env.TEST_TIMEOUT = process.env.TEST_TIMEOUT || '30000';

// 禁用一些生产环境功能
process.env.DISABLE_SWAGGER = 'true';
process.env.DISABLE_METRICS = 'true';
process.env.DISABLE_HEALTH_CHECK = 'false';

// 安全配置（测试环境放松）
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '4'; // 减少加密轮数提高测试速度
process.env.RATE_LIMIT_ENABLED = 'false';
process.env.CORS_ENABLED = 'true';

// Mock配置
process.env.MOCK_EXTERNAL_APIS = process.env.MOCK_EXTERNAL_APIS || 'true';
process.env.MOCK_PAYMENTS = process.env.MOCK_PAYMENTS || 'true';
process.env.MOCK_SMS = process.env.MOCK_SMS || 'true';
process.env.MOCK_EMAIL = process.env.MOCK_EMAIL || 'true';

// 特性开关
process.env.FEATURE_SOCIAL_ENABLED = process.env.FEATURE_SOCIAL_ENABLED || 'true';
process.env.FEATURE_PAYMENTS_ENABLED = process.env.FEATURE_PAYMENTS_ENABLED || 'true';
process.env.FEATURE_NOTIFICATIONS_ENABLED = process.env.FEATURE_NOTIFICATIONS_ENABLED || 'false';

console.log('🔧 集成测试环境变量已设置');
console.log(`📱 应用端口: ${process.env.APP_PORT}`);
console.log(`🗄️ 数据库: ${process.env.DATABASE_NAME}`);
console.log(`🔄 Redis DB: ${process.env.REDIS_DB}`);
console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET.substring(0, 10)}...`);

// 验证必需的环境变量
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ 缺少必需的环境变量:', missingEnvVars.join(', '));
  process.exit(1);
}

// 设置全局测试配置
global.__TEST_CONFIG__ = {
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  },
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    db: parseInt(process.env.REDIS_DB)
  },
  app: {
    port: parseInt(process.env.APP_PORT),
    host: process.env.APP_HOST
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
  },
  timeouts: {
    test: parseInt(process.env.TEST_TIMEOUT),
    api: parseInt(process.env.EXTERNAL_API_TIMEOUT)
  },
  features: {
    resetDbBeforeEach: process.env.RESET_DB_BEFORE_EACH === 'true',
    parallelTests: process.env.PARALLEL_TESTS === 'true',
    mockExternalApis: process.env.MOCK_EXTERNAL_APIS === 'true'
  }
};

console.log('✅ 集成测试环境配置完成');