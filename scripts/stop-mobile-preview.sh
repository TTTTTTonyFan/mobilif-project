#!/bin/bash

# 停止手机预览服务脚本

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

echo "🛑 停止 MobiLiF 手机预览服务"
echo "============================="

# 停止预览服务器
if [ -f "preview-server.pid" ]; then
    PREVIEW_PID=$(cat preview-server.pid)
    if ps -p $PREVIEW_PID > /dev/null; then
        log_info "停止预览服务器 (PID: $PREVIEW_PID)..."
        kill $PREVIEW_PID 2>/dev/null || true
        log_success "预览服务器已停止"
    else
        log_warning "预览服务器进程不存在"
    fi
    rm -f preview-server.pid
else
    log_info "未找到预览服务器PID文件"
fi

# 停止后端服务
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null; then
        log_info "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        log_success "后端服务已停止"
    else
        log_warning "后端服务进程不存在"
    fi
    rm -f backend.pid backend.log
else
    log_info "未找到后端服务PID文件"
fi

# 停止占用8080端口的进程
log_info "检查端口8080占用情况..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -Pi :8080 -sTCP:LISTEN -t)
    log_warning "端口8080被进程 $PID 占用，尝试结束..."
    kill -9 $PID 2>/dev/null || true
    log_success "已结束占用端口8080的进程"
else
    log_info "端口8080未被占用"
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

# 清理临时文件
log_info "清理临时文件..."
rm -f temp_server.js
rm -f nohup.out

echo ""
log_success "✅ 所有手机预览服务已停止"
echo "============================="