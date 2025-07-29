#!/bin/bash

# =======================================================
# MobiLiF 数据库设置脚本
# =======================================================
# 这个脚本用于初始化和配置 MobiLiF 项目的数据库
# 包括创建数据库、用户、表结构和初始数据

set -e  # 遇到错误立即退出

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

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_info "以 root 用户运行"
    else
        log_warning "建议以 root 用户运行此脚本"
    fi
}

# 检查 MySQL 是否已安装
check_mysql() {
    if command -v mysql &> /dev/null; then
        log_success "MySQL 已安装"
        mysql --version
    else
        log_error "MySQL 未安装，请先安装 MySQL"
        exit 1
    fi
}

# 创建数据库和用户
setup_database() {
    log_info "开始设置数据库..."
    
    # 从环境变量获取配置，如果没有则使用默认值
    DB_NAME=${DB_NAME:-"mobilif"}
    DB_USER=${DB_USER:-"mobilif_app"}
    DB_PASSWORD=${DB_PASSWORD:-"mobilif_secure_pass_2024"}
    DB_HOST=${DB_HOST:-"localhost"}
    DB_PORT=${DB_PORT:-"3306"}
    
    log_info "数据库配置:"
    log_info "  数据库名: $DB_NAME"
    log_info "  用户名: $DB_USER"
    log_info "  主机: $DB_HOST"
    log_info "  端口: $DB_PORT"
    
    # 提示输入 root 密码
    read -s -p "请输入 MySQL root 密码: " ROOT_PASSWORD
    echo
    
    # 创建数据库和用户的 SQL
    cat > /tmp/setup_mobilif_db.sql << EOF
-- 创建数据库
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER IF NOT EXISTS '${DB_USER}'@'${DB_HOST}' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';

-- 授权
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'${DB_HOST}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 显示结果
SHOW DATABASES LIKE '${DB_NAME}';
SELECT User, Host FROM mysql.user WHERE User = '${DB_USER}';
EOF

    # 执行 SQL
    if mysql -u root -p"${ROOT_PASSWORD}" < /tmp/setup_mobilif_db.sql; then
        log_success "数据库和用户创建成功"
    else
        log_error "数据库设置失败"
        rm -f /tmp/setup_mobilif_db.sql
        exit 1
    fi
    
    # 清理临时文件
    rm -f /tmp/setup_mobilif_db.sql
}

# 创建表结构
create_tables() {
    log_info "创建数据库表结构..."
    
    # 检查是否存在数据库初始化文件
    INIT_SQL_FILE="$(dirname "$0")/init-database.sql"
    
    if [ -f "$INIT_SQL_FILE" ]; then
        log_info "使用现有的初始化文件: $INIT_SQL_FILE"
        
        if mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" "$DB_NAME" < "$INIT_SQL_FILE"; then
            log_success "数据库表结构创建成功"
        else
            log_error "表结构创建失败"
            exit 1
        fi
    else
        log_warning "未找到 init-database.sql 文件，创建基础表结构"
        
        # 创建基础表结构
        cat > /tmp/create_tables.sql << EOF
-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wechat_openid VARCHAR(100) UNIQUE,
    nickname VARCHAR(50),
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    gender ENUM('male', 'female', 'other'),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    fitness_level ENUM('beginner', 'intermediate', 'advanced'),
    points INT DEFAULT 0,
    level INT DEFAULT 1,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 健身房表
CREATE TABLE IF NOT EXISTS gyms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL,
    province VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    opening_hours JSON,
    facilities JSON,
    images JSON,
    rating DECIMAL(3,2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 课程表
CREATE TABLE IF NOT EXISTS classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    gym_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    instructor_name VARCHAR(50),
    max_participants INT DEFAULT 20,
    duration_minutes INT NOT NULL,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced'),
    price DECIMAL(10,2),
    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE
);

-- 预订表
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    class_id INT NOT NULL,
    booking_status ENUM('confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'confirmed',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_class (user_id, class_id)
);

-- 成就表
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    points_required INT DEFAULT 0,
    criteria JSON,
    badge_color VARCHAR(20) DEFAULT 'blue',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户成就表
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- 系统设置表
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认系统设置
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES
('app_name', 'MobiLiF', '应用名称'),
('app_version', '1.0.0', '应用版本'),
('maintenance_mode', 'false', '维护模式'),
('user_registration_enabled', 'true', '用户注册开关'),
('default_user_points', '100', '新用户默认积分'),
('max_daily_bookings', '3', '每日最大预订数量');

-- 插入示例成就
INSERT IGNORE INTO achievements (name, description, points_required, badge_color) VALUES
('新手上路', '完成第一次课程预订', 10, 'green'),
('健身达人', '连续签到7天', 50, 'blue'),
('社交之星', '邀请5位好友加入', 100, 'purple'),
('挑战者', '完成10次高强度训练', 200, 'red'),
('坚持不懈', '连续训练30天', 500, 'gold');

EOF

        if mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" "$DB_NAME" < /tmp/create_tables.sql; then
            log_success "基础表结构创建成功"
        else
            log_error "表结构创建失败"
            rm -f /tmp/create_tables.sql
            exit 1
        fi
        
        rm -f /tmp/create_tables.sql
    fi
}

# 验证数据库设置
verify_setup() {
    log_info "验证数据库设置..."
    
    # 检查数据库连接
    if mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" -e "USE $DB_NAME; SHOW TABLES;" > /dev/null 2>&1; then
        log_success "数据库连接正常"
        
        # 显示表列表
        log_info "数据库表列表:"
        mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in_$DB_NAME"
        
        # 显示表数量
        TABLE_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" -P "$DB_PORT" -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null | grep -v "Tables_in_$DB_NAME" | wc -l)
        log_success "共创建了 $TABLE_COUNT 个表"
        
    else
        log_error "数据库连接失败"
        exit 1
    fi
}

# 生成配置文件
generate_config() {
    log_info "生成数据库配置文件..."
    
    cat > ./.env.database << EOF
# MobiLiF 数据库配置
# 由 database-setup.sh 自动生成于 $(date)

DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_DATABASE=$DB_NAME
DATABASE_URL=mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
EOF

    log_success "配置文件已生成: .env.database"
    log_warning "请将配置信息添加到主 .env 文件中"
}

# 主函数
main() {
    echo "======================================================="
    echo "           MobiLiF 数据库设置脚本"
    echo "======================================================="
    echo
    
    log_info "开始数据库设置流程..."
    
    # 执行设置步骤
    check_root
    check_mysql
    setup_database
    create_tables
    verify_setup
    generate_config
    
    echo
    log_success "数据库设置完成！"
    echo
    log_info "后续步骤:"
    log_info "1. 将 .env.database 中的配置复制到主 .env 文件"
    log_info "2. 启动应用程序: npm run start:dev"
    log_info "3. 访问 API 文档: http://localhost:3000/api/docs"
    echo
}

# 脚本参数处理
case "${1:-}" in
    --help|-h)
        echo "用法: $0 [选项]"
        echo
        echo "选项:"
        echo "  --help, -h     显示此帮助信息"
        echo "  --verify       仅验证数据库连接"
        echo "  --create-only  仅创建数据库和用户"
        echo
        echo "环境变量:"
        echo "  DB_NAME        数据库名 (默认: mobilif)"
        echo "  DB_USER        数据库用户 (默认: mobilif_app)"
        echo "  DB_PASSWORD    数据库密码 (默认: mobilif_secure_pass_2024)"
        echo "  DB_HOST        数据库主机 (默认: localhost)"
        echo "  DB_PORT        数据库端口 (默认: 3306)"
        echo
        exit 0
        ;;
    --verify)
        log_info "仅执行数据库验证..."
        check_mysql
        verify_setup
        exit 0
        ;;
    --create-only)
        log_info "仅创建数据库和用户..."
        check_root
        check_mysql
        setup_database
        exit 0
        ;;
    "")
        # 默认执行完整设置
        main
        ;;
    *)
        log_error "未知参数: $1"
        echo "使用 $0 --help 查看帮助信息"
        exit 1
        ;;
esac