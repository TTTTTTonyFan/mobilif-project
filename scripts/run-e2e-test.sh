#!/bin/bash

# MobiLiF 端到端测试启动脚本
# 自动化测试环境设置和服务启动

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js >= 16.x"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js 版本过低，需要 >= 16.x，当前版本: $(node --version)"
        exit 1
    fi
    log_success "Node.js 版本检查通过: $(node --version)"
    
    # 检查MySQL
    if ! command -v mysql &> /dev/null; then
        log_error "MySQL 未安装，请先安装 MySQL >= 8.0"
        exit 1
    fi
    log_success "MySQL 检查通过: $(mysql --version)"
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    log_success "npm 版本: $(npm --version)"
}

# 环境变量检查
check_env() {
    log_info "检查环境变量..."
    
    if [ ! -f ".env" ]; then
        log_warning ".env 文件不存在，创建默认配置..."
        cat > .env << EOF
NODE_ENV=development
PORT=3000

# 数据库配置
DATABASE_URL="mysql://root:password@localhost:3306/mobilif_test"
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=mobilif_test

# JWT配置
JWT_SECRET=test_secret_key_for_development_only
JWT_EXPIRES_IN=7d

# 日志级别
LOG_LEVEL=debug
EOF
        log_success "已创建默认 .env 文件"
    else
        log_success ".env 文件已存在"
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装后端依赖..."
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "后端依赖安装完成"
    else
        log_info "后端依赖已存在，跳过安装"
    fi
    
    log_info "安装前端依赖..."
    if [ ! -d "frontend/node_modules" ]; then
        cd frontend
        npm install
        cd ..
        log_success "前端依赖安装完成"
    else
        log_info "前端依赖已存在，跳过安装"
    fi
}

# 数据库设置
setup_database() {
    log_info "设置数据库..."
    
    # 从.env文件读取数据库配置
    source .env
    
    # 提取数据库信息
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    log_info "数据库配置: $DB_USER@$DB_HOST/$DB_NAME"
    
    # 测试数据库连接
    if ! mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -e "SELECT 1;" &> /dev/null; then
        log_error "数据库连接失败，请检查MySQL服务和配置"
        log_info "尝试启动MySQL服务..."
        if command -v brew &> /dev/null; then
            brew services start mysql
        elif command -v systemctl &> /dev/null; then
            sudo systemctl start mysql
        else
            log_warning "请手动启动MySQL服务"
        fi
        exit 1
    fi
    
    log_success "数据库连接成功"
    
    # 创建测试数据库
    log_info "创建测试数据库..."
    mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || log_warning "数据库可能已存在"
    
    # 生成Prisma客户端
    log_info "生成Prisma客户端..."
    npx prisma generate
    
    # 推送schema
    log_info "推送数据库schema..."
    npx prisma db push --force-reset --accept-data-loss
    
    # 执行迁移脚本
    if [ -f "prisma/migrations/001_add_gym_type_and_programs.sql" ]; then
        log_info "执行迁移脚本..."
        mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" < prisma/migrations/001_add_gym_type_and_programs.sql
        log_success "迁移脚本执行完成"
    fi
    
    # 插入种子数据
    if [ -f "prisma/seeds/gym_seed_data.sql" ]; then
        log_info "插入测试数据..."
        mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" < prisma/seeds/gym_seed_data.sql
        log_success "测试数据插入完成"
    fi
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务..."
    
    # 检查端口是否被占用
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        log_warning "端口3000已被占用，尝试结束占用进程..."
        PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
        kill -9 $PID 2>/dev/null || true
        sleep 2
    fi
    
    # 启动后端（后台运行）
    log_info "后端服务启动中..."
    npm run start:dev > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # 等待服务启动
    log_info "等待后端服务启动..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/health >/dev/null 2>&1; then
            log_success "后端服务启动成功 (PID: $BACKEND_PID)"
            echo $BACKEND_PID > backend.pid
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "后端服务启动超时"
            kill $BACKEND_PID 2>/dev/null || true
            exit 1
        fi
        sleep 2
    done
}

# API功能测试
test_api() {
    log_info "开始API功能测试..."
    
    # 测试健康检查
    log_info "测试健康检查接口..."
    if curl -s http://localhost:3000/health | grep -q "ok"; then
        log_success "✓ 健康检查接口正常"
    else
        log_error "✗ 健康检查接口异常"
    fi
    
    # 测试场馆列表接口
    log_info "测试场馆列表接口..."
    RESPONSE=$(curl -s "http://localhost:3000/api/gyms?city=北京&page=1&pageSize=5" \
        -H "Authorization: Bearer test-token")
    
    if echo "$RESPONSE" | grep -q '"code":0'; then
        log_success "✓ 场馆列表接口正常"
        GYMS_COUNT=$(echo "$RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
        log_info "  找到 $GYMS_COUNT 个场馆"
    else
        log_error "✗ 场馆列表接口异常"
        echo "$RESPONSE"
    fi
    
    # 测试搜索功能
    log_info "测试搜索功能..."
    SEARCH_RESPONSE=$(curl -s "http://localhost:3000/api/gyms?keyword=CrossFit" \
        -H "Authorization: Bearer test-token")
    
    if echo "$SEARCH_RESPONSE" | grep -q '"code":0'; then
        log_success "✓ 搜索功能正常"
    else
        log_error "✗ 搜索功能异常"
    fi
    
    # 测试筛选功能
    log_info "测试筛选功能..."
    FILTER_RESPONSE=$(curl -s "http://localhost:3000/api/gyms?gymType=crossfit_certified" \
        -H "Authorization: Bearer test-token")
    
    if echo "$FILTER_RESPONSE" | grep -q '"code":0'; then
        log_success "✓ 筛选功能正常"
    else
        log_error "✗ 筛选功能异常"
    fi
    
    # 测试地理位置查询
    log_info "测试地理位置查询..."
    LOCATION_RESPONSE=$(curl -s "http://localhost:3000/api/gyms?lat=39.9042&lng=116.4074&radius=10" \
        -H "Authorization: Bearer test-token")
    
    if echo "$LOCATION_RESPONSE" | grep -q '"code":0'; then
        log_success "✓ 地理位置查询正常"
    else
        log_error "✗ 地理位置查询异常"
    fi
}

# 启动前端
start_frontend() {
    log_info "启动前端应用..."
    
    cd frontend
    
    # 检查是否为React Native项目
    if [ -f "package.json" ] && grep -q "react-native" package.json; then
        log_info "检测到React Native项目"
        
        # 询问用户要启动哪个平台
        echo ""
        echo "请选择要测试的平台："
        echo "1) Web (Metro + 浏览器)"
        echo "2) iOS 模拟器"
        echo "3) Android 模拟器"
        echo "4) 仅启动Metro服务器"
        echo ""
        read -p "请输入选项 (1-4): " choice
        
        case $choice in
            1)
                log_info "启动Web版本..."
                npm run web &
                sleep 5
                if command -v open &> /dev/null; then
                    open http://localhost:8081
                elif command -v xdg-open &> /dev/null; then
                    xdg-open http://localhost:8081
                fi
                ;;
            2)
                log_info "启动iOS模拟器..."
                npx react-native run-ios &
                ;;
            3)
                log_info "启动Android模拟器..."
                npx react-native run-android &
                ;;
            4)
                log_info "启动Metro服务器..."
                npm start &
                ;;
            *)
                log_warning "无效选项，启动Metro服务器..."
                npm start &
                ;;
        esac
    else
        log_info "启动Web应用..."
        npm start &
        sleep 5
        if command -v open &> /dev/null; then
            open http://localhost:3000
        elif command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:3000
        fi
    fi
    
    cd ..
}

# 清理函数
cleanup() {
    log_info "清理测试环境..."
    
    # 停止后端服务
    if [ -f "backend.pid" ]; then
        BACKEND_PID=$(cat backend.pid)
        if ps -p $BACKEND_PID > /dev/null; then
            log_info "停止后端服务 (PID: $BACKEND_PID)..."
            kill $BACKEND_PID 2>/dev/null || true
        fi
        rm -f backend.pid
    fi
    
    # 清理日志文件
    rm -f backend.log
    
    log_success "清理完成"
}

# 显示测试信息
show_test_info() {
    echo ""
    echo "========================================"
    echo "🚀 MobiLiF 端到端测试环境已就绪"
    echo "========================================"
    echo ""
    echo "🔗 后端服务: http://localhost:3000"
    echo "📋 API文档: http://localhost:3000/api-docs (如果配置了Swagger)"
    echo "🏃‍♂️ 健康检查: http://localhost:3000/health"
    echo ""
    echo "📱 前端应用已启动，请在相应平台上测试"
    echo ""
    echo "🧪 手动测试步骤:"
    echo "1. 打开前端应用"
    echo "2. 进入 'Drop-in预约' 板块"
    echo "3. 测试场馆列表功能"
    echo "4. 测试搜索和筛选功能"
    echo "5. 测试城市切换功能"
    echo ""
    echo "📊 查看后端日志: tail -f backend.log"
    echo "🛑 停止所有服务: ./scripts/stop-test-services.sh"
    echo ""
    echo "详细测试指南请查看: docs/e2e-testing-guide.md"
    echo "========================================"
}

# 主函数
main() {
    echo "🧪 MobiLiF 场馆列表功能端到端测试"
    echo "======================================="
    
    # 注册清理函数
    trap cleanup EXIT
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] || [ ! -f "prisma/schema.prisma" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行测试步骤
    check_dependencies
    check_env
    install_dependencies
    setup_database
    start_backend
    test_api
    
    # 询问是否启动前端
    echo ""
    read -p "是否启动前端进行手动测试? (y/n): " start_fe
    if [[ $start_fe =~ ^[Yy]$ ]]; then
        start_frontend
        show_test_info
        
        # 等待用户输入以保持服务运行
        echo ""
        read -p "按回车键停止所有服务..."
    else
        log_info "跳过前端启动"
        show_test_info
        
        echo ""
        read -p "按回车键停止后端服务..."
    fi
}

# 运行主函数
main "$@"