#!/usr/bin/env node

/**
 * 服务器备份脚本
 */

const ServerManager = require('./server-manager');

async function main() {
    try {
        const serverManager = new ServerManager();
        const result = await serverManager.backup();
        process.exit(result ? 0 : 1);
    } catch (error) {
        console.error(`创建备份失败: ${error.message}`);
        process.exit(1);
    }
}

main();