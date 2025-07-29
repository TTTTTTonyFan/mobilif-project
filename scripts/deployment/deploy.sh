#!/bin/bash

# MobiLiF项目部署脚本
# 适用于阿里云服务器 8.147.235.48

set -e

# 配置参数
PROJECT_NAME="mobilif"
PROJECT_DIR="/opt/mobilif"
BACKUP_DIR="/opt/mobilif/backup"
DEPLOY_USER="mobilif"
REPO_URL="https://github.com/TTTTTTonyFan/mobilif-project.git"
BRANCH="main"
DOCKER_REGISTRY="registry.cn-hangzhou.aliyuncs.com/mobilif"

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

# 错误处理函数
handle_error() {
    log_error "部署失败！错误发生在第 $1 行"
    log_error "正在回滚到上一个版本..."
    rollback_previous_version
    exit 1
}

# 设置错误处理
trap 'handle_error $LINENO' ERR

# 检查权限
check_permissions() {
    log_step "检查运行权限..."
    
    if [[ $EUID -eq 0 ]]; then
        log_warn "建议使用非root用户运行部署脚本"
    fi
    
    # 检查Docker权限
    if ! docker ps &>/dev/null; then
        log_error "当前用户无Docker权限，请确保用户在docker组中"
        exit 1
    fi
}

# 备份当前版本
backup_current_version() {
    log_step "备份当前版本..."
    
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="${BACKUP_DIR}/backup_${BACKUP_TIMESTAMP}"
    
    # 创建备份目录
    sudo mkdir -p "$BACKUP_PATH"
    
    # 备份数据库
    if docker ps | grep -q "mobilif-mysql-master"; then
        log_info "备份MySQL数据库..."
        docker exec mobilif-mysql-master mysqldump -u root -pmobilif123456 --all-databases > "${BACKUP_PATH}/database_backup.sql"
    fi
    
    # 备份Redis数据
    if docker ps | grep -q "mobilif-redis"; then
        log_info "备份Redis数据..."
        docker exec mobilif-redis redis-cli BGSAVE
        docker cp mobilif-redis:/data/dump.rdb "${BACKUP_PATH}/redis_backup.rdb"
    fi
    
    # 备份应用配置
    if [ -d "${PROJECT_DIR}/config" ]; then
        log_info "备份配置文件..."
        sudo cp -r "${PROJECT_DIR}/config" "${BACKUP_PATH}/"
    fi
    
    # 备份上传文件
    if [ -d "${PROJECT_DIR}/data/uploads" ]; then
        log_info "备份上传文件..."
        sudo cp -r "${PROJECT_DIR}/data/uploads" "${BACKUP_PATH}/"
    fi
    
    log_info "备份完成: $BACKUP_PATH"
    echo "$BACKUP_PATH" > /tmp/mobilif_last_backup
}

# 获取最新代码
update_source_code() {
    log_step "更新源代码..."
    
    cd "$PROJECT_DIR"
    
    # 如果目录不存在，先克隆
    if [ ! -d ".git" ]; then
        log_info "克隆代码仓库..."
        sudo git clone "$REPO_URL" .
        sudo chown -R "$DEPLOY_USER:$DEPLOY_USER" .
    else
        log_info "拉取最新代码..."
        sudo -u "$DEPLOY_USER" git fetch origin
        sudo -u "$DEPLOY_USER" git reset --hard "origin/$BRANCH"
    fi
    
    # 记录当前版本
    CURRENT_COMMIT=$(git rev-parse HEAD)
    echo "$CURRENT_COMMIT" > /tmp/mobilif_current_commit
    log_info "当前版本: $CURRENT_COMMIT"
}

# 构建Docker镜像
build_docker_images() {
    log_step "构建Docker镜像..."
    
    cd "$PROJECT_DIR"
    
    # 构建应用镜像
    log_info "构建应用镜像..."
    docker build -t "${DOCKER_REGISTRY}/mobilif-backend:latest" .
    docker build -t "${DOCKER_REGISTRY}/mobilif-backend:${CURRENT_COMMIT:0:8}" .
    
    # 如果有前端代码，也构建前端镜像
    if [ -d "frontend" ]; then
        log_info "构建前端镜像..."
        docker build -t "${DOCKER_REGISTRY}/mobilif-frontend:latest" -f frontend/Dockerfile frontend/
        docker build -t "${DOCKER_REGISTRY}/mobilif-frontend:${CURRENT_COMMIT:0:8}" -f frontend/Dockerfile frontend/
    fi
}

# 更新配置文件
update_configurations() {
    log_step "更新配置文件..."
    
    # 复制生产环境配置
    if [ -f "config/production/.env.production" ]; then
        log_info "更新环境变量配置..."
        cp config/production/.env.production .env
    fi
    
    # 更新Docker Compose配置
    if [ -f "config/production/docker-compose.production.yml" ]; then
        log_info "更新Docker Compose配置..."
        cp config/production/docker-compose.production.yml docker-compose.yml
    fi
    
    # 更新Nginx配置
    if [ -f "config/production/nginx.conf" ]; then
        log_info "更新Nginx配置..."
        sudo cp config/production/nginx.conf /opt/mobilif/config/
    fi
}

# 数据库迁移
run_database_migrations() {
    log_step "执行数据库迁移..."
    
    # 等待数据库服务启动
    log_info "等待数据库服务启动..."
    sleep 30
    
    # 检查数据库连接
    if ! docker exec mobilif-mysql-master mysql -u root -pmobilif123456 -e "SELECT 1" &>/dev/null; then
        log_error "数据库连接失败"
        return 1
    fi
    
    # 执行迁移
    log_info "执行数据库迁移..."
    docker exec mobilif-backend npm run migration:run
    
    log_info "数据库迁移完成"
}

# 启动服务
start_services() {
    log_step "启动服务..."
    
    cd "$PROJECT_DIR"
    
    # 停止旧服务
    log_info "停止旧服务..."
    docker-compose down --remove-orphans
    
    # 清理旧镜像
    log_info "清理未使用的镜像..."
    docker image prune -f
    
    # 启动新服务
    log_info "启动新服务..."
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 60
}

# 健康检查
health_check() {
    log_step "执行健康检查..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "健康检查尝试 $attempt/$max_attempts"
        
        # 检查容器状态
        if ! docker ps | grep -q "mobilif-backend.*Up"; then
            log_warn "后端服务未启动"
            ((attempt++))
            sleep 10
            continue
        fi
        
        # 检查HTTP服务
        if curl -sf "http://localhost:3000/health" >/dev/null; then
            log_info "应用健康检查通过"
            return 0
        fi
        
        ((attempt++))
        sleep 10
    done
    
    log_error "健康检查失败"
    return 1
}

# 回滚到上一版本
rollback_previous_version() {
    log_step "回滚到上一个版本..."
    
    # 获取上一个备份
    if [ -f "/tmp/mobilif_last_backup" ]; then
        LAST_BACKUP=$(cat /tmp/mobilif_last_backup)
        log_info "从备份恢复: $LAST_BACKUP"
        
        # 停止当前服务
        docker-compose down
        
        # 恢复数据库
        if [ -f "${LAST_BACKUP}/database_backup.sql" ]; then
            log_info "恢复数据库..."
            docker-compose up -d mysql-master
            sleep 30
            docker exec -i mobilif-mysql-master mysql -u root -pmobilif123456 < "${LAST_BACKUP}/database_backup.sql"
        fi
        
        # 恢复Redis
        if [ -f "${LAST_BACKUP}/redis_backup.rdb" ]; then
            log_info "恢复Redis数据..."
            docker cp "${LAST_BACKUP}/redis_backup.rdb" mobilif-redis:/data/dump.rdb
        fi
        
        # 恢复配置
        if [ -d "${LAST_BACKUP}/config" ]; then
            log_info "恢复配置文件..."
            sudo cp -r "${LAST_BACKUP}/config"/* "${PROJECT_DIR}/config/"
        fi
        
        # 启动服务
        docker-compose up -d
        
        log_info "回滚完成"
    else
        log_warn "未找到备份文件，无法回滚"
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log_step "清理旧备份..."
    
    # 保留最近7天的备份
    find "$BACKUP_DIR" -name "backup_*" -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
    
    log_info "旧备份清理完成"
}

# 发送通知
send_notification() {
    local status=$1
    local message=$2
    
    log_info "发送部署通知: $status - $message"
    
    # 这里可以集成钉钉、企业微信等通知系统
    # curl -X POST "https://your-webhook-url" \
    #      -H "Content-Type: application/json" \
    #      -d "{\"text\":\"MobiLiF部署通知: $status - $message\"}"
}

# 显示帮助信息
show_help() {
    echo "MobiLiF部署脚本使用说明："
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示帮助信息"
    echo "  -b, --backup-only       仅执行备份"
    echo "  -r, --rollback          回滚到上一版本"
    echo "  -c, --check-health      仅执行健康检查"
    echo "  --skip-backup           跳过备份步骤"
    echo "  --skip-migration        跳过数据库迁移"
    echo ""
    echo "示例:"
    echo "  $0                      执行完整部署"
    echo "  $0 --backup-only        仅执行备份"
    echo "  $0 --rollback           回滚到上一版本"
    echo ""
}

# 主函数
main() {
    local skip_backup=false
    local skip_migration=false
    local backup_only=false
    local rollback_only=false
    local health_check_only=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -b|--backup-only)
                backup_only=true
                shift
                ;;
            -r|--rollback)
                rollback_only=true
                shift
                ;;
            -c|--check-health)
                health_check_only=true
                shift
                ;;
            --skip-backup)
                skip_backup=true
                shift
                ;;
            --skip-migration)
                skip_migration=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 显示部署开始信息
    echo "=========================================="
    echo "MobiLiF 项目部署脚本"
    echo "服务器: 8.147.235.48"
    echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=========================================="
    
    # 执行特定操作
    if [ "$backup_only" = true ]; then
        backup_current_version
        exit 0
    fi
    
    if [ "$rollback_only" = true ]; then
        rollback_previous_version
        exit 0
    fi
    
    if [ "$health_check_only" = true ]; then
        health_check
        exit 0
    fi
    
    # 执行完整部署流程
    log_info "开始部署流程..."
    
    check_permissions
    
    if [ "$skip_backup" = false ]; then
        backup_current_version
    fi
    
    update_source_code
    build_docker_images
    update_configurations
    start_services
    
    if [ "$skip_migration" = false ]; then
        run_database_migrations
    fi
    
    if health_check; then
        cleanup_old_backups
        send_notification "SUCCESS" "部署成功完成"
        log_info "=========================================="
        log_info "部署成功完成！"
        log_info "应用访问地址: http://8.147.235.48"
        log_info "管理后台: http://8.147.235.48:3001"
        log_info "监控面板: http://8.147.235.48:9090"
        log_info "=========================================="
    else
        send_notification "FAILED" "部署失败，已回滚"
        log_error "部署失败！"
        exit 1
    fi
}

# 执行主函数
main "$@"