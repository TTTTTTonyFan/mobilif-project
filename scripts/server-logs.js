#!/usr/bin/env node

/**
 * 服务器日志查看脚本
 */

const ServerManager = require('./server-manager');

async function main() {
    try {
        const args = process.argv.slice(2);
        const options = {};

        // 解析命令行参数
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--lines' && args[i + 1]) {
                options.lines = parseInt(args[i + 1]);
                i++;
            } else if (args[i] === '--follow') {
                options.follow = true;
            } else if (args[i] === '--service' && args[i + 1]) {
                options.service = args[i + 1];
                i++;
            }
        }

        const serverManager = new ServerManager();
        const result = await serverManager.logs(options);
        process.exit(result ? 0 : 1);
    } catch (error) {
        console.error(`查看日志失败: ${error.message}`);
        process.exit(1);
    }
}

main();