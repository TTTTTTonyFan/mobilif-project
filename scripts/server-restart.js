#!/usr/bin/env node

/**
 * 服务器重启脚本
 */

const ServerManager = require('./server-manager');

async function main() {
    try {
        const serverManager = new ServerManager();
        const result = await serverManager.restart();
        process.exit(result ? 0 : 1);
    } catch (error) {
        console.error(`服务重启失败: ${error.message}`);
        process.exit(1);
    }
}

main();