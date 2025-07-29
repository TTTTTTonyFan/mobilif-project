#!/usr/bin/env node

/**
 * MobiLiF API 远程连接测试脚本
 * 测试服务器API端点的连通性和响应状态
 */

const axios = require('axios');
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 配置常量
const CONFIG = {
    timeout: 10000, // 10秒超时
    retries: 3,     // 重试次数
    retryDelay: 1000, // 重试间隔(ms)
};

// 控制台颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

/**
 * 美化输出函数
 */
const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
    divider: () => console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`)
};

/**
 * 格式化响应时间
 */
function formatResponseTime(ms) {
    if (ms < 100) return `${colors.green}${ms}ms${colors.reset}`;
    if (ms < 500) return `${colors.yellow}${ms}ms${colors.reset}`;
    return `${colors.red}${ms}ms${colors.reset}`;
}

/**
 * 格式化状态码
 */
function formatStatusCode(code) {
    if (code >= 200 && code < 300) return `${colors.green}${code}${colors.reset}`;
    if (code >= 300 && code < 400) return `${colors.yellow}${code}${colors.reset}`;
    if (code >= 400 && code < 500) return `${colors.magenta}${code}${colors.reset}`;
    return `${colors.red}${code}${colors.reset}`;
}

/**
 * 格式化数据大小
 */
function formatDataSize(data) {
    const size = JSON.stringify(data).length;
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * 延迟函数
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 带重试的HTTP请求
 */
async function makeRequestWithRetry(url, options = {}, retries = CONFIG.retries) {
    for (let i = 0; i <= retries; i++) {
        try {
            const startTime = Date.now();
            const response = await axios({
                method: 'GET',
                url,
                timeout: CONFIG.timeout,
                validateStatus: () => true, // 接受所有状态码
                ...options
            });
            const responseTime = Date.now() - startTime;
            
            return {
                success: true,
                response,
                responseTime,
                attempt: i + 1
            };
        } catch (error) {
            if (i === retries) {
                return {
                    success: false,
                    error,
                    attempt: i + 1
                };
            }
            
            log.warning(`请求失败，${CONFIG.retryDelay / 1000}秒后重试... (${i + 1}/${retries + 1})`);
            await delay(CONFIG.retryDelay);
        }
    }
}

/**
 * 获取错误类型描述
 */
function getErrorDescription(error) {
    if (error.code === 'ECONNREFUSED') {
        return '连接被拒绝 - 服务器可能未启动';
    }
    if (error.code === 'ENOTFOUND') {
        return 'DNS解析失败 - 请检查服务器地址';
    }
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        return '请求超时 - 服务器响应时间过长';
    }
    if (error.code === 'ECONNRESET') {
        return '连接重置 - 网络连接中断';
    }
    if (error.response) {
        return `HTTP错误 ${error.response.status}: ${error.response.statusText}`;
    }
    return error.message || '未知错误';
}

/**
 * 测试单个API端点
 */
async function testEndpoint(baseUrl, endpoint) {
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    log.info(`测试端点: ${url}`);
    
    const result = await makeRequestWithRetry(url);
    
    if (!result.success) {
        const errorDesc = getErrorDescription(result.error);
        log.error(`请求失败: ${errorDesc}`);
        return {
            endpoint,
            url,
            success: false,
            error: errorDesc,
            attempts: result.attempt
        };
    }
    
    const { response, responseTime, attempt } = result;
    const statusText = response.statusText || 'Unknown';
    
    // 显示结果
    console.log(`  状态码: ${formatStatusCode(response.status)} ${statusText}`);
    console.log(`  响应时间: ${formatResponseTime(responseTime)}`);
    
    if (attempt > 1) {
        console.log(`  重试次数: ${colors.yellow}${attempt - 1}${colors.reset}`);
    }
    
    // 显示响应数据摘要
    if (response.data) {
        const dataSize = formatDataSize(response.data);
        console.log(`  数据大小: ${dataSize}`);
        
        // 显示部分响应数据
        if (typeof response.data === 'object') {
            const keys = Object.keys(response.data);
            if (keys.length > 0) {
                console.log(`  响应字段: ${colors.cyan}${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}${colors.reset}`);
            }
            
            // 如果有message字段，显示它
            if (response.data.message) {
                console.log(`  消息: ${colors.magenta}"${response.data.message}"${colors.reset}`);
            }
        } else if (typeof response.data === 'string' && response.data.length < 100) {
            console.log(`  响应: ${colors.magenta}"${response.data}"${colors.reset}`);
        }
    }
    
    const isSuccess = response.status >= 200 && response.status < 400;
    if (isSuccess) {
        log.success('测试通过');
    } else {
        log.error('测试失败');
    }
    
    return {
        endpoint,
        url,
        success: isSuccess,
        statusCode: response.status,
        statusText,
        responseTime,
        dataSize: response.data ? JSON.stringify(response.data).length : 0,
        attempts: attempt
    };
}

/**
 * 主测试函数
 */
async function testRemoteAPI() {
    log.divider();
    log.header('MobiLiF API 远程连接测试');
    log.divider();
    
    // 获取基础URL
    const serverHost = process.env.SERVER_HOST || 'localhost';
    const serverPort = process.env.SERVER_PORT || '3000';
    const baseUrl = process.env.SERVER_API_BASE || `http://${serverHost}:${serverPort}`;
    
    log.info(`目标服务器: ${colors.cyan}${baseUrl}${colors.reset}`);
    log.info(`请求超时: ${CONFIG.timeout / 1000}秒`);
    log.info(`重试次数: ${CONFIG.retries}次`);
    console.log();
    
    // 定义测试端点
    const endpoints = [
        '/',
        '/api/health',
        '/api/gyms',
        '/api/users',
        '/api/stats'
    ];
    
    const results = [];
    const startTime = Date.now();
    
    // 逐个测试端点
    for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        log.header(`[${i + 1}/${endpoints.length}] 测试 ${endpoint}`);
        
        const result = await testEndpoint(baseUrl, endpoint);
        results.push(result);
        
        console.log(); // 添加空行分隔
        
        // 如果不是最后一个端点，添加小延迟
        if (i < endpoints.length - 1) {
            await delay(500);
        }
    }
    
    const totalTime = Date.now() - startTime;
    
    // 显示测试总结
    log.divider();
    log.header('测试总结');
    log.divider();
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`总测试数: ${colors.bright}${results.length}${colors.reset}`);
    console.log(`成功: ${colors.green}${successful}${colors.reset}`);
    console.log(`失败: ${colors.red}${failed}${colors.reset}`);
    console.log(`总耗时: ${formatResponseTime(totalTime)}`);
    
    // 显示失败的端点
    if (failed > 0) {
        console.log();
        log.header('失败的端点:');
        results.filter(r => !r.success).forEach(result => {
            console.log(`  ${colors.red}✗${colors.reset} ${result.endpoint} - ${result.error || `HTTP ${result.statusCode}`}`);
        });
    }
    
    // 显示性能统计
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length > 0) {
        const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
        const maxResponseTime = Math.max(...successfulResults.map(r => r.responseTime));
        const minResponseTime = Math.min(...successfulResults.map(r => r.responseTime));
        
        console.log();
        log.header('性能统计:');
        console.log(`  平均响应时间: ${formatResponseTime(Math.round(avgResponseTime))}`);
        console.log(`  最快响应时间: ${formatResponseTime(minResponseTime)}`);
        console.log(`  最慢响应时间: ${formatResponseTime(maxResponseTime)}`);
    }
    
    log.divider();
    
    // 返回测试结果
    return {
        success: failed === 0,
        total: results.length,
        successful,
        failed,
        totalTime,
        results
    };
}

/**
 * 错误处理和程序退出
 */
async function main() {
    try {
        const result = await testRemoteAPI();
        
        // 根据测试结果设置退出码
        process.exit(result.success ? 0 : 1);
    } catch (error) {
        log.error(`测试过程中发生错误: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

// 模块导出
module.exports = {
    testRemoteAPI,
    testEndpoint,
    makeRequestWithRetry,
    CONFIG
};

// 直接运行检测
if (require.main === module) {
    main();
}