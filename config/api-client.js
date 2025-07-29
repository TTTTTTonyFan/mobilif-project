/**
 * MobiLiF API 客户端
 * 基于 axios 的完整 API 客户端实现
 */

const axios = require('axios');
const path = require('path');

// 加载环境变量和API配置
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const apiConfig = require('./api');

// 控制台颜色
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

/**
 * 日志工具
 */
const logger = {
    info: (msg) => console.log(`${colors.blue}[API-CLIENT]${colors.reset} ${new Date().toISOString()} - ${msg}`),
    success: (msg) => console.log(`${colors.green}[API-CLIENT]${colors.reset} ${new Date().toISOString()} - ${msg}`),
    error: (msg) => console.log(`${colors.red}[API-CLIENT]${colors.reset} ${new Date().toISOString()} - ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[API-CLIENT]${colors.reset} ${new Date().toISOString()} - ${msg}`),
    debug: (msg) => {
        if (apiConfig.DEBUG_ENABLED) {
            console.log(`${colors.magenta}[API-CLIENT-DEBUG]${colors.reset} ${new Date().toISOString()} - ${msg}`);
        }
    }
};

/**
 * 错误类型定义
 */
class APIError extends Error {
    constructor(message, code, status, response) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.status = status;
        this.response = response;
        this.timestamp = new Date().toISOString();
    }
}

class NetworkError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = 'NetworkError';
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }
}

class TimeoutError extends Error {
    constructor(message, timeout) {
        super(message);
        this.name = 'TimeoutError';
        this.timeout = timeout;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * API 客户端类
 */
class APIClient {
    constructor(options = {}) {
        // 合并默认配置
        this.config = {
            baseURL: options.baseURL || apiConfig.api.baseURL,
            timeout: options.timeout || apiConfig.REQUEST_TIMEOUT || 30000,
            retries: options.retries || 3,
            retryDelay: options.retryDelay || 1000,
            enableLogging: options.enableLogging !== false,
            enableRetry: options.enableRetry !== false,
            ...options
        };

        // 创建 axios 实例
        this.client = this.createAxiosInstance();

        // 设置拦截器
        this.setupInterceptors();

        logger.info(`API客户端初始化完成 - BaseURL: ${this.config.baseURL}`);
    }

    /**
     * 创建 axios 实例
     */
    createAxiosInstance() {
        const instance = axios.create({
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': `MobiLiF-Client/${apiConfig.API_VERSION || '1.0.0'}`
            }
        });

        return instance;
    }

    /**
     * 设置请求和响应拦截器
     */
    setupInterceptors() {
        // 请求拦截器
        this.client.interceptors.request.use(
            (config) => {
                // 添加请求ID用于跟踪
                config.metadata = {
                    requestId: this.generateRequestId(),
                    startTime: Date.now()
                };

                if (this.config.enableLogging) {
                    logger.debug(`请求发出: ${config.method?.toUpperCase()} ${config.url} [${config.metadata.requestId}]`);
                    
                    // 记录请求参数（不记录敏感信息）
                    if (config.params) {
                        logger.debug(`请求参数: ${JSON.stringify(config.params)} [${config.metadata.requestId}]`);
                    }
                }

                return config;
            },
            (error) => {
                logger.error(`请求配置错误: ${error.message}`);
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.client.interceptors.response.use(
            (response) => {
                const { config } = response;
                const duration = Date.now() - config.metadata.startTime;
                const requestId = config.metadata.requestId;

                if (this.config.enableLogging) {
                    logger.success(`响应成功: ${config.method?.toUpperCase()} ${config.url} - ${response.status} (${duration}ms) [${requestId}]`);
                    
                    if (response.data && typeof response.data === 'object') {
                        const dataSize = JSON.stringify(response.data).length;
                        logger.debug(`响应数据大小: ${this.formatBytes(dataSize)} [${requestId}]`);
                    }
                }

                return response;
            },
            (error) => {
                const { config } = error;
                const requestId = config?.metadata?.requestId || 'unknown';
                const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;

                if (this.config.enableLogging) {
                    if (error.response) {
                        // 服务器响应错误
                        logger.error(`响应错误: ${config?.method?.toUpperCase()} ${config?.url} - ${error.response.status} ${error.response.statusText} (${duration}ms) [${requestId}]`);
                    } else if (error.request) {
                        // 网络错误
                        logger.error(`网络错误: ${config?.method?.toUpperCase()} ${config?.url} - ${error.message} (${duration}ms) [${requestId}]`);
                    } else {
                        // 其他错误
                        logger.error(`请求错误: ${error.message} [${requestId}]`);
                    }
                }

                return Promise.reject(this.handleError(error));
            }
        );
    }

    /**
     * 生成请求ID
     */
    generateRequestId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * 格式化字节数
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 错误处理
     */
    handleError(error) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return new TimeoutError(
                `请求超时 (${this.config.timeout}ms): ${error.config?.url}`,
                this.config.timeout
            );
        }

        if (error.code === 'ECONNREFUSED') {
            return new NetworkError(
                `连接被拒绝: ${error.config?.url}`,
                error
            );
        }

        if (error.code === 'ENOTFOUND') {
            return new NetworkError(
                `DNS解析失败: ${error.config?.url}`,
                error
            );
        }

        if (error.response) {
            // 服务器响应错误
            const { status, statusText, data } = error.response;
            const message = data?.message || data?.error || statusText || `HTTP ${status} Error`;
            
            return new APIError(
                message,
                data?.code || 'HTTP_ERROR',
                status,
                error.response
            );
        }

        if (error.request) {
            // 网络错误
            return new NetworkError(
                `网络请求失败: ${error.message}`,
                error
            );
        }

        // 其他错误
        return error;
    }

    /**
     * 带重试的请求方法
     */
    async requestWithRetry(config, retries = this.config.retries) {
        for (let attempt = 1; attempt <= retries + 1; attempt++) {
            try {
                const response = await this.client.request(config);
                return response;
            } catch (error) {
                const isLastAttempt = attempt === retries + 1;
                const shouldRetry = this.shouldRetry(error) && this.config.enableRetry && !isLastAttempt;

                if (shouldRetry) {
                    const delay = this.config.retryDelay * attempt;
                    logger.warning(`请求失败，${delay}ms后重试 (${attempt}/${retries}): ${error.message}`);
                    await this.delay(delay);
                    continue;
                }

                throw error;
            }
        }
    }

    /**
     * 判断是否应该重试
     */
    shouldRetry(error) {
        // 网络错误或服务器错误才重试
        if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
            return true;
        }

        if (error.name === 'APIError') {
            // 5xx 服务器错误才重试
            return error.status >= 500;
        }

        return false;
    }

    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 通用 GET 请求
     */
    async get(url, params = {}, options = {}) {
        const config = {
            method: 'GET',
            url,
            params,
            ...options
        };

        const response = await this.requestWithRetry(config);
        return response.data;
    }

    /**
     * 通用 POST 请求
     */
    async post(url, data = {}, options = {}) {
        const config = {
            method: 'POST',
            url,
            data,
            ...options
        };

        const response = await this.requestWithRetry(config);
        return response.data;
    }

    /**
     * 通用 PUT 请求
     */
    async put(url, data = {}, options = {}) {
        const config = {
            method: 'PUT',
            url,
            data,
            ...options
        };

        const response = await this.requestWithRetry(config);
        return response.data;
    }

    /**
     * 通用 DELETE 请求
     */
    async delete(url, options = {}) {
        const config = {
            method: 'DELETE',
            url,
            ...options
        };

        const response = await this.requestWithRetry(config);
        return response.data;
    }

    // ==================== 预定义 API 方法 ====================

    /**
     * 健康检查
     */
    async health() {
        try {
            const data = await this.get('/health');
            return {
                success: true,
                status: 'healthy',
                data,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 获取健身房列表
     */
    async getGyms(params = {}) {
        const defaultParams = {
            page: 1,
            limit: 20,
            ...params
        };

        return await this.get(`${apiConfig.api.prefix}/gyms`, defaultParams);
    }

    /**
     * 获取特定健身房信息
     */
    async getGym(gymId) {
        if (!gymId) {
            throw new Error('健身房ID不能为空');
        }

        return await this.get(`${apiConfig.api.prefix}/gyms/${gymId}`);
    }

    /**
     * 搜索健身房
     */
    async searchGyms(query, params = {}) {
        if (!query) {
            throw new Error('搜索关键词不能为空');
        }

        const searchParams = {
            q: query,
            page: 1,
            limit: 20,
            ...params
        };

        return await this.get(`${apiConfig.api.prefix}/gyms/search`, searchParams);
    }

    /**
     * 获取用户列表
     */
    async getUsers(params = {}) {
        const defaultParams = {
            page: 1,
            limit: 20,
            ...params
        };

        return await this.get(`${apiConfig.api.prefix}/users`, defaultParams);
    }

    /**
     * 获取特定用户信息
     */
    async getUser(userId) {
        if (!userId) {
            throw new Error('用户ID不能为空');
        }

        return await this.get(`${apiConfig.api.prefix}/users/${userId}`);
    }

    /**
     * 获取用户资料
     */
    async getUserProfile(userId) {
        if (!userId) {
            throw new Error('用户ID不能为空');
        }

        return await this.get(`${apiConfig.api.prefix}/users/${userId}/profile`);
    }

    /**
     * 获取统计数据
     */
    async getStats(type = 'overview') {
        const validTypes = ['overview', 'users', 'gyms', 'bookings', 'revenue'];
        
        if (!validTypes.includes(type)) {
            throw new Error(`无效的统计类型: ${type}. 支持的类型: ${validTypes.join(', ')}`);
        }

        return await this.get(`${apiConfig.api.prefix}/stats/${type}`);
    }

    /**
     * 获取系统概览统计
     */
    async getOverviewStats() {
        return await this.getStats('overview');
    }

    /**
     * 获取用户统计
     */
    async getUserStats() {
        return await this.getStats('users');
    }

    /**
     * 获取健身房统计
     */
    async getGymStats() {
        return await this.getStats('gyms');
    }

    /**
     * 获取预订统计
     */
    async getBookingStats() {
        return await this.getStats('bookings');
    }

    /**
     * 用户认证
     */
    async login(credentials) {
        if (!credentials.username || !credentials.password) {
            throw new Error('用户名和密码不能为空');
        }

        return await this.post(`${apiConfig.api.prefix}/auth/login`, credentials);
    }

    /**
     * 用户注册
     */
    async register(userData) {
        if (!userData.username || !userData.password || !userData.email) {
            throw new Error('用户名、密码和邮箱不能为空');
        }

        return await this.post(`${apiConfig.api.prefix}/auth/register`, userData);
    }

    /**
     * 刷新令牌
     */
    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('刷新令牌不能为空');
        }

        return await this.post(`${apiConfig.api.prefix}/auth/refresh`, { refreshToken });
    }

    /**
     * 设置认证令牌
     */
    setAuthToken(token) {
        if (token) {
            this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            logger.debug('认证令牌已设置');
        } else {
            delete this.client.defaults.headers.common['Authorization'];
            logger.debug('认证令牌已清除');
        }
    }

    /**
     * 获取客户端信息
     */
    getClientInfo() {
        return {
            baseURL: this.config.baseURL,
            timeout: this.config.timeout,
            retries: this.config.retries,
            retryDelay: this.config.retryDelay,
            enableLogging: this.config.enableLogging,
            enableRetry: this.config.enableRetry,
            userAgent: this.client.defaults.headers['User-Agent']
        };
    }
}

// 创建默认客户端实例
const defaultClient = new APIClient();

// 导出
module.exports = {
    APIClient,
    APIError,
    NetworkError,
    TimeoutError,
    
    // 默认客户端实例
    default: defaultClient,
    
    // 便捷方法
    health: () => defaultClient.health(),
    getGyms: (params) => defaultClient.getGyms(params),
    getGym: (gymId) => defaultClient.getGym(gymId),
    searchGyms: (query, params) => defaultClient.searchGyms(query, params),
    getUsers: (params) => defaultClient.getUsers(params),
    getUser: (userId) => defaultClient.getUser(userId),
    getUserProfile: (userId) => defaultClient.getUserProfile(userId),
    getStats: (type) => defaultClient.getStats(type),
    getOverviewStats: () => defaultClient.getOverviewStats(),
    getUserStats: () => defaultClient.getUserStats(),
    getGymStats: () => defaultClient.getGymStats(),
    getBookingStats: () => defaultClient.getBookingStats(),
    login: (credentials) => defaultClient.login(credentials),
    register: (userData) => defaultClient.register(userData),
    refreshToken: (refreshToken) => defaultClient.refreshToken(refreshToken),
    setAuthToken: (token) => defaultClient.setAuthToken(token),
    
    // 创建新客户端实例
    create: (options) => new APIClient(options)
};