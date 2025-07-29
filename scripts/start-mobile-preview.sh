#!/bin/bash

# MobiLiF 手机预览启动脚本
# 启动后端服务并打开手机预览页面

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "📱 MobiLiF 场馆列表手机预览"
echo "============================="
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    log_error "请在项目根目录运行此脚本"
    exit 1
fi

# 检查端口占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    log_warning "端口3000已被占用"
    PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    log_info "尝试结束占用进程 (PID: $PID)..."
    kill -9 $PID 2>/dev/null || true
    sleep 2
fi

# 启动后端服务（可选）
read -p "是否启动后端API服务? (y/n): " start_backend
if [[ $start_backend =~ ^[Yy]$ ]]; then
    log_info "启动后端服务..."
    npm run start:dev > backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    
    log_info "等待后端服务启动..."
    for i in {1..15}; do
        if curl -s http://localhost:3000/health >/dev/null 2>&1; then
            log_success "后端服务启动成功 (PID: $BACKEND_PID)"
            break
        fi
        if [ $i -eq 15 ]; then
            log_error "后端服务启动超时"
            kill $BACKEND_PID 2>/dev/null || true
            exit 1
        fi
        sleep 2
    done
fi

# 启动简单的HTTP服务器来服务HTML文件
log_info "启动预览服务器..."

# 检查Python版本并启动HTTP服务器
if command -v python3 &> /dev/null; then
    cd docs
    python3 -m http.server 8080 > /dev/null 2>&1 &
    SERVER_PID=$!
    cd ..
elif command -v python &> /dev/null; then
    cd docs
    python -m SimpleHTTPServer 8080 > /dev/null 2>&1 &
    SERVER_PID=$!
    cd ..
elif command -v node &> /dev/null; then
    # 使用Node.js创建简单服务器
    cat > temp_server.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'docs', req.url === '/' ? 'mobile-simulator-setup.md' : req.url);
    
    if (req.url === '/' || req.url === '/mobile' || req.url === '/preview') {
        filePath = path.join(__dirname, 'docs', 'mobile-simulator-setup.md');
    }
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('页面未找到');
            } else {
                res.writeHead(500);
                res.end('服务器错误: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(8080, () => {
    console.log('预览服务器运行在 http://localhost:8080');
});
EOF
    
    node temp_server.js > /dev/null 2>&1 &
    SERVER_PID=$!
else
    log_error "未找到Python或Node.js，无法启动预览服务器"
    exit 1
fi

log_success "预览服务器启动成功 (PID: $SERVER_PID)"

# 等待服务器启动
sleep 2

# 在浏览器中打开预览页面
log_info "打开手机预览页面..."

PREVIEW_URL="http://localhost:8080/mobile-simulator-setup.md"

if command -v open &> /dev/null; then
    # macOS
    open "$PREVIEW_URL"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "$PREVIEW_URL"
elif command -v start &> /dev/null; then
    # Windows
    start "$PREVIEW_URL"
else
    log_warning "无法自动打开浏览器，请手动访问: $PREVIEW_URL"
fi

echo ""
echo "🎉 手机预览环境已启动"
echo "========================="
echo ""
echo "📱 手机预览页面: $PREVIEW_URL"
if [ -f "backend.pid" ]; then
    echo "🔗 后端API服务: http://localhost:3000"
    echo "📋 API健康检查: http://localhost:3000/health"
fi
echo ""
echo "📖 使用说明:"
echo "1. 在浏览器中打开预览页面"
echo "2. 使用浏览器开发者工具切换到手机视图模式"
echo "3. 测试各种交互功能（搜索、筛选、城市切换）"
echo "4. 当前显示的是模拟数据，真实数据需要后端API支持"
echo ""
echo "🔧 开发者工具快捷键:"
echo "- Chrome/Edge: F12 或 Ctrl+Shift+I (Windows) / Cmd+Option+I (Mac)"
echo "- Firefox: F12 或 Ctrl+Shift+I (Windows) / Cmd+Option+I (Mac)"
echo "- Safari: Cmd+Option+I (需要先在偏好设置中启用开发菜单)"
echo ""
echo "📱 建议的手机设备模拟:"
echo "- iPhone 12 Pro (390x844)"
echo "- iPhone SE (375x667)"
echo "- Samsung Galaxy S20 (360x800)"
echo ""
echo "🛑 停止服务: 按 Ctrl+C 或运行 ./scripts/stop-mobile-preview.sh"
echo ""

# 保存进程ID以便后续停止
echo $SERVER_PID > preview-server.pid

# 等待用户中断
trap cleanup EXIT

cleanup() {
    log_info "正在停止服务..."
    
    # 停止预览服务器
    if [ -f "preview-server.pid" ]; then
        PREVIEW_PID=$(cat preview-server.pid)
        if ps -p $PREVIEW_PID > /dev/null; then
            kill $PREVIEW_PID 2>/dev/null || true
        fi
        rm -f preview-server.pid
    fi
    
    # 停止后端服务
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        if ps -p $BACKEND_PID > /dev/null; then
            kill $BACKEND_PID 2>/dev/null || true
        fi
        rm -f backend.pid backend.log
    fi
    
    # 清理临时文件
    rm -f temp_server.js
    
    log_success "所有服务已停止"
}

# 保持脚本运行，等待用户中断
read -p "按回车键停止所有服务..."