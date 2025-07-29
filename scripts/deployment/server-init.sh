#!/bin/bash

# MobiLiF服务器初始化脚本
# 适用于 Alibaba Cloud Linux 3.2104 LTS 64位

set -e

echo "=========================================="
echo "MobiLiF 服务器初始化开始..."
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    yum update -y
    yum install -y wget curl vim git htop
}

# 配置时区
setup_timezone() {
    log_info "配置时区为Asia/Shanghai..."
    timedatectl set-timezone Asia/Shanghai
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙规则..."
    
    # 启用防火墙
    systemctl enable firewalld
    systemctl start firewalld
    
    # 开放必要端口
    firewall-cmd --permanent --add-port=22/tcp    # SSH
    firewall-cmd --permanent --add-port=80/tcp    # HTTP
    firewall-cmd --permanent --add-port=443/tcp   # HTTPS
    firewall-cmd --permanent --add-port=3000/tcp  # 应用端口
    firewall-cmd --permanent --add-port=3306/tcp  # MySQL
    firewall-cmd --permanent --add-port=6379/tcp  # Redis
    firewall-cmd --permanent --add-port=9090/tcp  # Prometheus
    firewall-cmd --permanent --add-port=3001/tcp  # Grafana
    
    # 重载防火墙规则
    firewall-cmd --reload
    
    log_info "防火墙配置完成"
}

# 优化系统参数
optimize_system() {
    log_info "优化系统参数..."
    
    # 创建系统优化配置
    cat > /etc/sysctl.d/99-mobilif.conf << EOF
# 网络优化
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr

# 文件描述符限制
fs.file-max = 1048576

# 内存管理
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# 连接数优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_tw_buckets = 6000
EOF

    # 应用系统参数
    sysctl -p /etc/sysctl.d/99-mobilif.conf
    
    # 配置文件描述符限制
    cat > /etc/security/limits.d/99-mobilif.conf << EOF
* soft nofile 1048576
* hard nofile 1048576
* soft nproc 1048576
* hard nproc 1048576
root soft nofile 1048576
root hard nofile 1048576
root soft nproc 1048576
root hard nproc 1048576
EOF
}

# 验证Docker安装
verify_docker() {
    log_info "验证Docker安装..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    # 启动Docker服务
    systemctl enable docker
    systemctl start docker
    
    # 验证Docker状态
    docker --version
    docker-compose --version
    
    log_info "Docker验证完成"
}

# 创建项目目录
setup_directories() {
    log_info "创建项目目录结构..."
    
    # 创建主要目录
    mkdir -p /opt/mobilif/{data,logs,config,backup,ssl}
    mkdir -p /opt/mobilif/data/{mysql,redis,uploads,static}
    mkdir -p /opt/mobilif/logs/{app,nginx,mysql,redis}
    
    # 设置目录权限
    chown -R 1001:1001 /opt/mobilif/data
    chown -R 1001:1001 /opt/mobilif/logs
    chmod -R 755 /opt/mobilif
    
    log_info "目录结构创建完成"
}

# 配置日志轮转
setup_logrotate() {
    log_info "配置日志轮转..."
    
    cat > /etc/logrotate.d/mobilif << EOF
/opt/mobilif/logs/*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 1001 1001
    postrotate
        docker kill -s USR1 \$(docker ps -q --filter name=mobilif) 2>/dev/null || true
    endscript
}
EOF
}

# 安装监控工具
install_monitoring() {
    log_info "安装系统监控工具..."
    
    # 安装node_exporter
    NODEEXPORTER_VERSION="1.6.1"
    cd /tmp
    wget https://github.com/prometheus/node_exporter/releases/download/v${NODEEXPORTER_VERSION}/node_exporter-${NODEEXPORTER_VERSION}.linux-amd64.tar.gz
    tar xzf node_exporter-${NODEEXPORTER_VERSION}.linux-amd64.tar.gz
    cp node_exporter-${NODEEXPORTER_VERSION}.linux-amd64/node_exporter /usr/local/bin/
    
    # 创建node_exporter用户
    useradd --no-create-home --shell /bin/false node_exporter
    chown node_exporter:node_exporter /usr/local/bin/node_exporter
    
    # 创建systemd服务
    cat > /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

    # 启动node_exporter
    systemctl daemon-reload
    systemctl enable node_exporter
    systemctl start node_exporter
    
    rm -rf /tmp/node_exporter-*
}

# 设置定时任务
setup_crontab() {
    log_info "设置定时任务..."
    
    cat > /etc/cron.d/mobilif << EOF
# MobiLiF定时任务

# 每天2点备份数据库
0 2 * * * root /opt/mobilif/scripts/backup-database.sh

# 每天3点清理旧日志
0 3 * * * root find /opt/mobilif/logs -name "*.log.*" -mtime +7 -delete

# 每小时检查磁盘空间
0 * * * * root /opt/mobilif/scripts/check-disk-space.sh

# 每5分钟检查服务健康状态
*/5 * * * * root /opt/mobilif/scripts/health-check.sh
EOF
}

# 创建部署用户
create_deploy_user() {
    log_info "创建部署用户..."
    
    # 创建mobilif用户
    if ! id "mobilif" &>/dev/null; then
        useradd -m -s /bin/bash mobilif
        usermod -aG docker mobilif
    fi
    
    # 创建SSH目录
    mkdir -p /home/mobilif/.ssh
    chown mobilif:mobilif /home/mobilif/.ssh
    chmod 700 /home/mobilif/.ssh
    
    log_info "部署用户创建完成"
}

# 主函数
main() {
    log_info "开始初始化服务器..."
    
    check_root
    update_system
    setup_timezone
    setup_firewall
    optimize_system
    verify_docker
    setup_directories
    setup_logrotate
    install_monitoring
    setup_crontab
    create_deploy_user
    
    log_info "=========================================="
    log_info "服务器初始化完成！"
    log_info "=========================================="
    log_info "接下来请执行以下步骤："
    log_info "1. 运行数据库初始化脚本"
    log_info "2. 配置环境变量"
    log_info "3. 运行部署脚本"
    log_info "=========================================="
}

# 执行主函数
main "$@"