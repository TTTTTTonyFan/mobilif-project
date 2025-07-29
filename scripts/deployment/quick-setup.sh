#!/bin/bash

# MobiLiF快速部署脚本
# 适用于阿里云服务器 8.147.235.48
# 使用说明：一键完成从零到部署的全过程

set -e

# 配置参数
SERVER_IP="8.147.235.48"
PROJECT_NAME="mobilif"
REPO_URL="https://github.com/TTTTTTonyFan/mobilif-project.git"
BRANCH="main"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 显示欢迎信息
show_welcome() {
    echo "=================================================="
    echo "    MobiLiF 一键部署脚本"
    echo "    服务器: $SERVER_IP"
    echo "    时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=================================================="
    echo ""
    log_info "开始部署MobiLiF项目..."
    echo ""
}

# 检查系统环境
check_system() {
    log_step "检查系统环境..."
    
    # 检查操作系统
    if ! grep -q "Alibaba Cloud Linux" /etc/os-release 2>/dev/null; then
        log_warn "非阿里云Linux系统，脚本可能需要调整"
    fi
    
    # 检查网络连接
    if ! ping -c 1 github.com &>/dev/null; then
        log_error "无法连接到GitHub，请检查网络"
        exit 1
    fi
    
    log_info "系统环境检查完成"
}

# 执行服务器初始化
run_server_init() {
    log_step "执行服务器初始化..."
    
    # 下载并执行初始化脚本
    if [ ! -f "/tmp/server-init.sh" ]; then
        log_info "下载服务器初始化脚本..."
        curl -fsSL "https://raw.githubusercontent.com/TTTTTTonyFan/mobilif-project/main/scripts/deployment/server-init.sh" -o /tmp/server-init.sh
        chmod +x /tmp/server-init.sh
    fi
    
    log_info "执行服务器初始化..."
    sudo /tmp/server-init.sh
    
    log_info "服务器初始化完成"
}

# 克隆项目代码
clone_project() {
    log_step "克隆项目代码..."
    
    # 创建项目目录
    sudo mkdir -p /opt/mobilif
    cd /opt/mobilif
    
    # 克隆代码
    if [ ! -d ".git" ]; then
        log_info "克隆项目代码..."
        sudo git clone "$REPO_URL" .
    else
        log_info "更新项目代码..."
        sudo git pull origin "$BRANCH"
    fi
    
    # 设置权限
    sudo chown -R mobilif:mobilif /opt/mobilif
    
    log_info "项目代码克隆完成"
}

# 初始化数据库
init_database() {
    log_step "初始化数据库..."
    
    cd /opt/mobilif
    
    # 启动MySQL服务
    log_info "启动MySQL服务..."
    sudo -u mobilif docker-compose up -d mysql-master
    
    # 等待MySQL启动
    log_info "等待MySQL服务启动..."
    sleep 60
    
    # 检查MySQL状态
    local attempt=1
    local max_attempts=10
    while [ $attempt -le $max_attempts ]; do
        if sudo -u mobilif docker exec mobilif-mysql-master mysql -u root -p'MobiLiF@2025!' -e "SELECT 1" &>/dev/null; then
            log_info "MySQL服务已启动"
            break
        fi
        
        log_warn "MySQL启动检查 $attempt/$max_attempts"
        ((attempt++))
        sleep 10
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "MySQL启动失败"
        exit 1
    fi
    
    # 执行数据库初始化脚本
    log_info "执行数据库初始化..."
    sudo -u mobilif docker exec -i mobilif-mysql-master mysql -u root -p'MobiLiF@2025!' < scripts/deployment/init-database.sql
    
    log_info "数据库初始化完成"
}

# 配置环境
setup_environment() {
    log_step "配置环境..."
    
    cd /opt/mobilif
    
    # 复制生产环境配置
    log_info "复制环境配置文件..."
    sudo -u mobilif cp config/production/.env.production .env
    sudo -u mobilif cp config/production/docker-compose.production.yml docker-compose.yml
    
    # 创建必要的配置目录
    sudo mkdir -p /opt/mobilif/config/{mysql,redis,nginx,prometheus,grafana,rocketmq}
    
    # 生成MySQL配置
    sudo tee /opt/mobilif/config/mysql/master.cnf > /dev/null << 'EOF'
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW
binlog-do-db = mobilif
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
max_connections = 1000
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
slow_query_log = 1
long_query_time = 2
EOF

    sudo tee /opt/mobilif/config/mysql/slave.cnf > /dev/null << 'EOF'
[mysqld]
server-id = 2
relay-log = mysql-relay-bin
log-bin = mysql-bin
binlog-format = ROW
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
read-only = 1
innodb_buffer_pool_size = 512M
EOF

    # 生成Redis配置
    sudo tee /opt/mobilif/config/redis/redis.conf > /dev/null << 'EOF'
bind 0.0.0.0
port 6379
timeout 300
keepalive 60
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
EOF

    # 复制Nginx配置
    sudo cp config/production/nginx.conf /opt/mobilif/config/nginx/
    
    # 设置权限
    sudo chown -R mobilif:mobilif /opt/mobilif/config
    
    log_info "环境配置完成"
}

# 构建和启动服务
deploy_services() {
    log_step "构建和启动服务..."
    
    cd /opt/mobilif
    
    # 构建应用镜像
    log_info "构建应用镜像..."
    sudo -u mobilif docker build -t mobilif-backend:latest .
    
    # 启动所有服务
    log_info "启动所有服务..."
    sudo -u mobilif docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动完成..."
    sleep 120
    
    log_info "服务部署完成"
}

# 执行健康检查
health_check() {
    log_step "执行健康检查..."
    
    local services=("mysql-master" "redis" "mobilif-backend" "nginx")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$service.*Up"; then
            log_info "✅ $service 服务正常"
        else
            log_error "❌ $service 服务异常"
            all_healthy=false
        fi
    done
    
    # 检查HTTP服务
    if curl -sf "http://localhost/health" >/dev/null; then
        log_info "✅ HTTP服务正常"
    else
        log_error "❌ HTTP服务异常"
        all_healthy=false
    fi
    
    if [ "$all_healthy" = true ]; then
        log_info "所有服务健康检查通过"
        return 0
    else
        log_error "健康检查失败"
        return 1
    fi
}

# 显示部署结果
show_result() {
    local success=$1
    
    echo ""
    echo "=================================================="
    if [ "$success" = true ]; then
        echo -e "${GREEN}🎉 MobiLiF部署成功！${NC}"
        echo ""
        echo "访问地址："
        echo "  主站: http://$SERVER_IP"
        echo "  API文档: http://$SERVER_IP/api/docs"
        echo "  管理后台: http://$SERVER_IP:3001"
        echo "  监控面板: http://$SERVER_IP:9090"
        echo ""
        echo "默认账号："
        echo "  Grafana: admin / MobiLiF@2025!"
        echo ""
        echo "下一步："
        echo "  1. 配置域名解析（可选）"
        echo "  2. 申请SSL证书（推荐）"
        echo "  3. 配置微信小程序参数"
        echo "  4. 配置支付参数"
    else
        echo -e "${RED}❌ MobiLiF部署失败！${NC}"
        echo ""
        echo "请检查日志信息并重试"
        echo "日志位置: /opt/mobilif/logs/"
    fi
    echo "=================================================="
}

# 主函数
main() {
    local start_time=$(date +%s)
    
    show_welcome
    check_system
    run_server_init
    clone_project
    init_database
    setup_environment
    deploy_services
    
    if health_check; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        show_result true
        log_info "总耗时: ${duration}秒"
        
        # 创建部署标记文件
        echo "$(date '+%Y-%m-%d %H:%M:%S')" | sudo tee /opt/mobilif/DEPLOYED > /dev/null
    else
        show_result false
        exit 1
    fi
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 检查root权限
if [[ $EUID -ne 0 ]]; then
    log_error "此脚本需要root权限运行"
    log_info "请使用: sudo $0"
    exit 1
fi

# 执行主函数
main "$@"