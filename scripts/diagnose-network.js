#!/usr/bin/env node

/**
 * 网络诊断脚本
 * 检查网络配置和代理设置，帮助解决微信小程序CI连接问题
 */

const { exec } = require('child_process');
const https = require('https');

class NetworkDiagnostic {
  constructor() {
    this.results = {
      proxy: null,
      publicIP: null,
      networkConfig: null,
      connectivity: null
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[34m',     // 蓝色
      success: '\x1b[32m',  // 绿色
      warning: '\x1b[33m',  // 黄色
      error: '\x1b[31m',    // 红色
      reset: '\x1b[0m'      // 重置
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  async getPublicIP() {
    this.log('🌐 获取公网IP地址...', 'info');
    
    const services = [
      'https://httpbin.org/ip',
      'https://api.ipify.org?format=json',
      'https://ifconfig.me/ip'
    ];

    for (const service of services) {
      try {
        const ip = await this.fetchIP(service);
        if (ip) {
          this.log(`✅ 通过 ${service} 获取到IP: ${ip}`, 'success');
          this.results.publicIP = ip;
          return ip;
        }
      } catch (error) {
        this.log(`❌ 无法从 ${service} 获取IP: ${error.message}`, 'warning');
      }
    }

    // 备用方法：使用本地命令
    try {
      const localIP = await this.getLocalIP();
      this.log(`🏠 本地IP地址: ${localIP}`, 'info');
      this.results.publicIP = localIP;
      return localIP;
    } catch (error) {
      this.log('❌ 无法获取IP地址', 'error');
      return null;
    }
  }

  async fetchIP(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            if (url.includes('json')) {
              const result = JSON.parse(data);
              resolve(result.ip || result.origin);
            } else {
              resolve(data.trim());
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.abort();
        reject(new Error('Timeout'));
      });
    });
  }

  async getLocalIP() {
    return new Promise((resolve, reject) => {
      exec('ifconfig | grep "inet " | grep -v 127.0.0.1 | awk \'{print $2}\'', (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          const ips = stdout.trim().split('\n').filter(ip => ip);
          resolve(ips[0] || '无法获取');
        }
      });
    });
  }

  async checkProxySettings() {
    this.log('🔍 检查代理设置...', 'info');

    // 检查环境变量
    const proxyVars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'];
    const foundProxies = {};

    proxyVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        foundProxies[varName] = value;
        this.log(`🔧 环境变量 ${varName}: ${value}`, 'warning');
      }
    });

    // 检查npm代理设置
    try {
      const npmProxy = await this.execCommand('npm config get proxy');
      const npmHttpsProxy = await this.execCommand('npm config get https-proxy');
      
      if (npmProxy && npmProxy !== 'null') {
        foundProxies.npm_proxy = npmProxy;
        this.log(`🔧 npm proxy: ${npmProxy}`, 'warning');
      }
      
      if (npmHttpsProxy && npmHttpsProxy !== 'null') {
        foundProxies.npm_https_proxy = npmHttpsProxy;
        this.log(`🔧 npm https-proxy: ${npmHttpsProxy}`, 'warning');
      }
    } catch (error) {
      this.log('⚠️ 无法检查npm代理设置', 'warning');
    }

    this.results.proxy = foundProxies;

    if (Object.keys(foundProxies).length === 0) {
      this.log('✅ 未检测到代理设置', 'success');
    } else {
      this.log('⚠️ 检测到代理设置，这可能影响微信小程序CI', 'warning');
    }

    return foundProxies;
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  async testWeChatConnectivity() {
    this.log('🧪 测试微信服务器连接...', 'info');

    const wechatEndpoints = [
      'https://servicewechat.com',
      'https://api.weixin.qq.com',
      'https://mp.weixin.qq.com'
    ];

    const results = {};

    for (const endpoint of wechatEndpoints) {
      try {
        const startTime = Date.now();
        await this.testConnection(endpoint);
        const duration = Date.now() - startTime;
        results[endpoint] = { status: 'success', duration };
        this.log(`✅ ${endpoint} 连接成功 (${duration}ms)`, 'success');
      } catch (error) {
        results[endpoint] = { status: 'failed', error: error.message };
        this.log(`❌ ${endpoint} 连接失败: ${error.message}`, 'error');
      }
    }

    this.results.connectivity = results;
    return results;
  }

  async testConnection(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, { timeout: 10000 }, (res) => {
        resolve(res.statusCode);
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.abort();
        reject(new Error('Connection timeout'));
      });
    });
  }

  async generateSolutions() {
    this.log('💡 生成解决方案...', 'info');

    const solutions = [];

    // IP白名单问题
    if (this.results.publicIP) {
      solutions.push({
        type: 'ip-whitelist',
        title: '更新IP白名单',
        description: `将当前IP地址 ${this.results.publicIP} 添加到微信公众平台的IP白名单中`,
        steps: [
          '1. 登录微信公众平台 (mp.weixin.qq.com)',
          '2. 进入 开发 → 开发管理 → 开发设置',
          '3. 在"小程序代码上传"部分，添加IP白名单',
          `4. 添加IP: ${this.results.publicIP}`
        ]
      });
    }

    // 代理问题
    if (Object.keys(this.results.proxy || {}).length > 0) {
      solutions.push({
        type: 'proxy-config',
        title: '代理配置问题',
        description: '检测到代理设置，可能导致IP地址不匹配',
        steps: [
          '1. 临时禁用代理测试:',
          '   unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy',
          '2. 清除npm代理设置:',
          '   npm config delete proxy',
          '   npm config delete https-proxy',
          '3. 重新运行预览命令'
        ]
      });
    }

    // 网络连接问题
    const failedConnections = Object.entries(this.results.connectivity || {})
      .filter(([url, result]) => result.status === 'failed');

    if (failedConnections.length > 0) {
      solutions.push({
        type: 'network-connectivity',
        title: '网络连接问题',
        description: '部分微信服务器无法连接',
        steps: [
          '1. 检查网络连接是否正常',
          '2. 确认防火墙是否阻止连接',
          '3. 尝试使用不同的网络环境',
          '4. 如果在企业网络，联系网络管理员'
        ]
      });
    }

    return solutions;
  }

  async run() {
    console.log('🔧 MobiLiF 微信小程序网络诊断工具');
    console.log('=====================================');

    try {
      // 检查代理设置
      await this.checkProxySettings();
      console.log('');

      // 获取公网IP
      await this.getPublicIP();
      console.log('');

      // 测试微信服务器连接
      await this.testWeChatConnectivity();
      console.log('');

      // 生成解决方案
      const solutions = await this.generateSolutions();

      if (solutions.length > 0) {
        console.log('💡 建议的解决方案:');
        console.log('=====================================');

        solutions.forEach((solution, index) => {
          console.log(`\n${index + 1}. ${solution.title}`);
          console.log(`   ${solution.description}`);
          console.log('   步骤:');
          solution.steps.forEach(step => {
            console.log(`   ${step}`);
          });
        });
      } else {
        this.log('✅ 网络配置看起来正常', 'success');
      }

      // 显示完整诊断结果
      console.log('\n📊 诊断结果摘要:');
      console.log('=====================================');
      console.log(`🌐 公网IP: ${this.results.publicIP || '未获取到'}`);
      console.log(`🔧 代理设置: ${Object.keys(this.results.proxy || {}).length > 0 ? '已检测到' : '无'}`);
      
      const connectivitySummary = Object.entries(this.results.connectivity || {})
        .map(([url, result]) => `${result.status === 'success' ? '✅' : '❌'} ${url.replace('https://', '')}`)
        .join('\n');
      console.log(`🌐 连接测试:\n${connectivitySummary}`);

    } catch (error) {
      this.log(`❌ 诊断过程中发生错误: ${error.message}`, 'error');
    }
  }
}

// 运行诊断
const diagnostic = new NetworkDiagnostic();
diagnostic.run();