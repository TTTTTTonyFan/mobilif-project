#!/usr/bin/env node

/**
 * MobiLiF 快速测试脚本 - 综合测试API和系统状态
 */

const path = require('path');
const { testRemoteAPI } = require('./test-remote-api');

// 加载环境变量
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 控制台颜色和表情符号
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const emojis = {
    rocket: '🚀',
    check: '✅',
    cross: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    gear: '⚙️',
    globe: '🌐',
    server: '🖥️',
    link: '🔗',
    time: '⏱️',
    tada: '🎉',
    thumbsUp: '👍',
    thumbsDown: '👎',
    computer: '💻',
    chart: '📊',
    bell: '🔔'
};

/**
 * 美化输出工具
 */
const display = {
    title: (text) => {
        console.log(`\n${colors.cyan}${colors.bright}╔${'═'.repeat(text.length + 4)}╗${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}║  ${text}  ║${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}╚${'═'.repeat(text.length + 4)}╝${colors.reset}\n`);
    },
    
    section: (emoji, title) => {
        console.log(`\n${colors.blue}${colors.bright}${emoji} ${title}${colors.reset}`);
        console.log(`${colors.blue}${'─'.repeat(title.length + 3)}${colors.reset}`);
    },
    
    info: (label, value, emoji = emojis.info) => {
        console.log(`${emoji} ${colors.cyan}${label}:${colors.reset} ${colors.bright}${value}${colors.reset}`);
    },
    
    success: (message) => {
        console.log(`${emojis.check} ${colors.green}${message}${colors.reset}`);
    },
    
    error: (message) => {
        console.log(`${emojis.cross} ${colors.red}${message}${colors.reset}`);
    },
    
    warning: (message) => {
        console.log(`${emojis.warning} ${colors.yellow}${message}${colors.reset}`);
    },
    
    divider: () => {
        console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
    },
    
    box: (title, items) => {
        console.log(`\n${colors.cyan}┌─ ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}┐${colors.reset}`);
        items.forEach(item => {
            console.log(`${colors.cyan}│${colors.reset} ${item}${' '.repeat(Math.max(0, 55 - item.replace(/\x1b\[[0-9;]*m/g, '').length))}${colors.cyan}│${colors.reset}`);
        });
        console.log(`${colors.cyan}└${'─'.repeat(57)}┘${colors.reset}\n`);
    }
};

/**
 * 显示当前配置信息
 */
function showConfiguration() {
    display.section(emojis.gear, '当前配置信息');
    
    const serverHost = process.env.SERVER_HOST || process.env.SSH_HOST || 'localhost';
    const serverPort = process.env.SERVER_PORT || '3000';
    const apiBase = process.env.SERVER_API_BASE || `http://${serverHost}:${serverPort}`;
    const sshUser = process.env.SSH_USER || 'root';
    const projectPath = process.env.REMOTE_PROJECT_PATH || '/opt/mobilif';
    
    display.info('服务器地址', serverHost, emojis.server);
    display.info('服务器端口', serverPort, emojis.link);
    display.info('API 基础地址', apiBase, emojis.globe);
    display.info('SSH 用户', sshUser, emojis.computer);
    display.info('项目路径', projectPath, '📁');
    
    // 检查配置完整性
    const configIssues = [];
    if (!process.env.SERVER_HOST && !process.env.SSH_HOST) {
        configIssues.push('未设置服务器地址 (SERVER_HOST 或 SSH_HOST)');
    }
    if (serverHost === 'your-server-ip-or-domain') {
        configIssues.push('服务器地址仍为占位符，请设置真实IP地址');
    }
    if (apiBase.includes('your-server-ip-or-domain')) {
        configIssues.push('API地址仍为占位符，请设置真实地址');
    }
    
    if (configIssues.length > 0) {
        console.log();
        display.warning('配置问题检测到:');
        configIssues.forEach(issue => {
            console.log(`  ${emojis.warning} ${issue}`);
        });
    }
}

/**
 * 显示系统信息
 */
function showSystemInfo() {
    display.section(emojis.computer, '系统信息');
    
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;
    const memory = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
    const uptime = `${(process.uptime() / 60).toFixed(1)} 分钟`;
    
    display.info('Node.js 版本', nodeVersion);
    display.info('操作系统', `${platform} (${arch})`);
    display.info('内存使用', memory);
    display.info('运行时间', uptime, emojis.time);
}

/**
 * 格式化测试结果
 */
function formatTestResults(results) {
    const { total, successful, failed, totalTime } = results;
    const successRate = ((successful / total) * 100).toFixed(1);
    
    display.section(emojis.chart, 'API 测试结果');
    
    display.info('总测试数', total.toString());
    display.info('成功数量', `${successful} ${emojis.check}`, emojis.thumbsUp);
    display.info('失败数量', `${failed} ${emojis.cross}`, failed > 0 ? emojis.thumbsDown : emojis.check);
    display.info('成功率', `${successRate}%`);
    display.info('总耗时', `${(totalTime / 1000).toFixed(2)} 秒`, emojis.time);
    
    // 显示失败的端点
    if (failed > 0) {
        console.log();
        display.warning('失败的端点:');
        results.results.filter(r => !r.success).forEach(result => {
            console.log(`  ${emojis.cross} ${result.endpoint} - ${result.error || `HTTP ${result.statusCode}`}`);
        });
    }
    
    return successful === total;
}

/**
 * 显示使用提示
 */
function showUsageTips(testSuccess) {
    display.section(emojis.bell, '使用提示');
    
    if (testSuccess) {
        display.success('所有测试通过！系统运行正常');
        
        const tips = [
            `${emojis.rocket} 系统已就绪，可以开始使用`,
            `${emojis.globe} API 地址: ${process.env.SERVER_API_BASE || 'http://localhost:3000'}`,
            `${emojis.gear} 管理命令: npm run server:status | restart | backup | logs`,
            `${emojis.chart} 监控面板: http://${process.env.SERVER_HOST || 'localhost'}:9090 (如已配置)`
        ];
        
        display.box('✨ 系统就绪', tips);
        
    } else {
        display.error('部分测试失败，请检查系统配置');
        
        const troubleshootTips = [
            `${emojis.gear} 检查服务器状态: npm run server:status`,
            `${emojis.server} 重启服务: npm run server:restart`,
            `${emojis.link} 检查网络连接到服务器`,
            `${emojis.computer} 验证 .env 配置文件`,
            `📋 查看服务日志: npm run server:logs`
        ];
        
        display.box('🔧 故障排除建议', troubleshootTips);
    }
    
    // 通用命令提示
    const commands = [
        `${colors.cyan}npm run test:api${colors.reset}     - 重新测试 API 连接`,
        `${colors.cyan}npm run quick-test${colors.reset}   - 运行此快速测试`,
        `${colors.cyan}npm run server:deploy${colors.reset} - 重新部署服务`,
        `${colors.cyan}npm run start:dev${colors.reset}    - 本地开发模式启动`
    ];
    
    display.box('📚 常用命令', commands);
}

/**
 * 主测试函数
 */
async function runQuickTest() {
    const startTime = Date.now();
    
    // 显示标题
    display.title(`${emojis.rocket} MobiLiF 快速测试工具`);
    
    console.log(`${emojis.time} 开始时间: ${colors.bright}${new Date().toLocaleString()}${colors.reset}`);
    
    // 1. 显示配置信息
    showConfiguration();
    
    // 2. 显示系统信息
    showSystemInfo();
    
    // 3. 运行API测试
    display.section(emojis.globe, 'API 连接测试');
    
    console.log(`${emojis.info} 正在测试 API 端点...`);
    
    let testSuccess = false;
    try {
        const apiResults = await testRemoteAPI();
        testSuccess = formatTestResults(apiResults);
    } catch (error) {
        display.error(`API 测试失败: ${error.message}`);
    }
    
    // 4. 显示总结
    const totalTime = Date.now() - startTime;
    
    display.divider();
    display.section(emojis.tada, '测试完成');
    
    display.info('总耗时', `${(totalTime / 1000).toFixed(2)} 秒`, emojis.time);
    
    if (testSuccess) {
        display.success('快速测试全部通过！');
    } else {
        display.warning('快速测试发现问题，请查看上方详情');
    }
    
    // 5. 显示使用提示
    showUsageTips(testSuccess);
    
    return {
        success: testSuccess,
        totalTime,
        timestamp: new Date().toISOString()
    };
}

/**
 * 主函数
 */
async function main() {
    try {
        const result = await runQuickTest();
        
        // 最终状态
        console.log(`\n${colors.cyan}${colors.bright}${'═'.repeat(60)}${colors.reset}`);
        
        if (result.success) {
            console.log(`${emojis.tada} ${colors.green}${colors.bright}测试完成！系统运行正常${colors.reset} ${emojis.thumbsUp}`);
            process.exit(0);
        } else {
            console.log(`${emojis.warning} ${colors.yellow}${colors.bright}测试完成，发现问题需要处理${colors.reset} ${emojis.gear}`);
            process.exit(1);
        }
        
    } catch (error) {
        display.error(`快速测试过程中发生错误: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

// 模块导出
module.exports = {
    runQuickTest,
    showConfiguration,
    showUsageTips
};

// 直接运行检测
if (require.main === module) {
    main();
}