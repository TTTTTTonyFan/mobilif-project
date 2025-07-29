#!/usr/bin/env node

/**
 * MobiLiF 移动端模拟器启动脚本
 * 提供本地Web服务器来运行移动端界面模拟器
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;
const HOST = 'localhost';

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // 安全检查，防止目录遍历攻击
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, {'Content-Type': 'text/plain'});
    res.end('Forbidden');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 404 页面
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>404 - 页面未找到</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; font-size: 48px; margin-bottom: 20px; }
              .message { color: #7f8c8d; font-size: 18px; }
              .back-link { color: #3498db; text-decoration: none; margin-top: 20px; display: inline-block; }
            </style>
          </head>
          <body>
            <div class="error">404</div>
            <div class="message">页面未找到</div>
            <a href="/" class="back-link">返回首页</a>
          </body>
          </html>
        `);
      } else {
        // 500 错误
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('服务器内部错误');
      }
    } else {
      // 成功响应
      res.writeHead(200, {
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content, 'utf-8');
    }
  });
});

// 启动服务器
server.listen(PORT, HOST, () => {
  console.log('🚀 MobiLiF 移动端模拟器已启动！');
  console.log('');
  console.log(`📱 访问地址: http://${HOST}:${PORT}`);
  console.log(`🌐 局域网访问: http://你的IP地址:${PORT}`);
  console.log('');
  console.log('📋 功能说明:');
  console.log('  • 🖥️  桌面端: 完整的移动设备模拟器界面');
  console.log('  • 📱 移动端: 响应式设计，直接在手机浏览器中查看');
  console.log('  • 🔧 控制面板: 切换设备型号、网络状态、位置等');
  console.log('  • 🎯 实时预览: 查看MobiLiF应用的移动端效果');
  console.log('');
  console.log('🔧 开发者选项:');
  console.log('  • 按 R 键刷新页面');
  console.log('  • 右侧控制面板可切换设备和环境');
  console.log('  • 支持触摸操作模拟');
  console.log('');
  console.log('⭐ 提示: 建议使用Chrome浏览器并开启开发者工具的设备模拟功能');
  console.log('');
  console.log('按 Ctrl+C 停止服务器');

  // 尝试自动打开浏览器
  const url = `http://${HOST}:${PORT}`;
  
  // 检测操作系统并使用相应的命令打开浏览器
  let openCommand;
  switch (process.platform) {
    case 'darwin': // macOS
      openCommand = 'open';
      break;
    case 'win32': // Windows
      openCommand = 'start';
      break;
    default: // Linux等
      openCommand = 'xdg-open';
  }

  // 延迟1秒后打开浏览器
  setTimeout(() => {
    exec(`${openCommand} ${url}`, (error) => {
      if (error) {
        console.log('💡 请手动在浏览器中打开:', url);
      } else {
        console.log('🌐 浏览器已自动打开');
      }
    });
  }, 1000);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\\n\\n👋 正在关闭移动端模拟器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});

// 错误处理
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ 端口 ${PORT} 已被占用，请尝试其他端口`);
    console.error('💡 你可以修改 start-simulator.js 中的 PORT 变量');
  } else {
    console.error('❌ 服务器启动失败:', err.message);
  }
  process.exit(1);
});

// 显示帮助信息
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('MobiLiF 移动端模拟器');
  console.log('');
  console.log('使用方法:');
  console.log('  node start-simulator.js     启动模拟器服务器');
  console.log('  node start-simulator.js -h  显示帮助信息');
  console.log('');
  console.log('配置选项:');
  console.log('  PORT: 修改代码中的 PORT 变量来改变端口号');
  console.log('  HOST: 修改代码中的 HOST 变量来改变监听地址');
  process.exit(0);
}