#!/usr/bin/env node

/**
 * 服务器状态检查脚本
 */

const ServerManager = require('./server-manager');

async function main() {
    try {
        const serverManager = new ServerManager();
        const result = await serverManager.getStatus();
        process.exit(result ? 0 : 1);
    } catch (error) {
        console.error(`状态检查失败: ${error.message}`);
        process.exit(1);
    }
}

main();