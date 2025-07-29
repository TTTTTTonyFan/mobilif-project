#!/bin/bash

# 停止所有测试服务的脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo "🛑 停止 MobiLiF 测试服务"
echo "========================="

# 停止后端服务
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        log_info "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        sleep 2
        
        # 强制结束（如果还在运行）
        if ps -p $BACKEND_PID > /dev/null; then
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi
        
        log_success "后端服务已停止"
    else
        log_warning "后端服务进程不存在"
    fi
    rm -f backend.pid
else
    log_info "未找到后端服务PID文件"
fi

# 停止占用3000端口的进程
log_info "检查端口3000占用情况..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    log_warning "端口3000被进程 $PID 占用，尝试结束..."
    kill -9 $PID 2>/dev/null || true
    log_success "已结束占用端口3000的进程"
else
    log_info "端口3000未被占用"
fi

# 停止Node.js相关进程
log_info "查找并停止相关Node.js进程..."
PIDS=$(ps aux | grep -E "(npm run|node.*mobilif|next|react-scripts)" | grep -v grep | awk '{print $2}' | head -10)

if [ -n "$PIDS" ]; then
    log_info "发现相关进程: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    log_success "已停止相关Node.js进程"
else
    log_info "未发现相关Node.js进程"
fi

# 停止React Native Metro进程
log_info "查找并停止React Native Metro进程..."
METRO_PIDS=$(ps aux | grep -E "(metro|react-native)" | grep -v grep | awk '{print $2}' | head -5)

if [ -n "$METRO_PIDS" ]; then
    log_info "发现Metro进程: $METRO_PIDS"
    echo "$METRO_PIDS" | xargs kill -9 2>/dev/null || true
    log_success "已停止Metro进程"
else
    log_info "未发现Metro进程"
fi

# 清理临时文件
log_info "清理临时文件..."
rm -f backend.pid backend.log
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true

# 检查端口状态
log_info "最终端口检查..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_error "端口3000仍被占用"
    lsof -Pi :3000 -sTCP:LISTEN
else
    log_success "端口3000已释放"
fi

if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_warning "端口8081(Metro)仍被占用"
    lsof -Pi :8081 -sTCP:LISTEN
else
    log_info "端口8081已释放"
fi

echo ""
log_success "✅ 所有测试服务已停止"
echo "========================="