#!/bin/bash

# =============================================================================
# MobiLiF项目 - SSH连接问题修复脚本
# =============================================================================
# 
# 功能说明：
# 1. 自动诊断SSH连接问题
# 2. 生成并配置SSH密钥
# 3. 测试多种连接方案
# 4. 提供详细的修复建议
#
# 使用方法：
#   chmod +x scripts/fix-ssh-connection.sh
#   ./scripts/fix-ssh-connection.sh
#
# 作者：MobiLiF项目组
# 日期：2025-07-28
# =============================================================================

# 颜色配置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 图标配置
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
WRENCH="🔧"
KEY="🔑"
SHIELD="🛡️"

# 服务器配置
SERVER_IP="8.147.235.48"
SERVER_PORT="22"
SERVER_USER="root"
SSH_KEY_NAME="mobilif_rsa"
SSH_KEY_PATH="$HOME/.ssh/$SSH_KEY_NAME"
SSH_CONFIG_FILE="$HOME/.ssh/config"

# 日志文件
LOG_FILE="$(pwd)/logs/ssh-fix-$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$(dirname "$LOG_FILE")"

# =============================================================================
# 工具函数
# =============================================================================

# 日志记录函数
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# 打印带颜色的消息
print_message() {
    local icon=$1
    local color=$2
    local message=$3
    echo -e "${color}${icon} ${message}${NC}"
    log "INFO" "$message"
}

print_success() {
    print_message "$SUCCESS" "$GREEN" "$1"
}

print_error() {
    print_message "$ERROR" "$RED" "$1"
}

print_warning() {
    print_message "$WARNING" "$YELLOW" "$1"
}

print_info() {
    print_message "$INFO" "$BLUE" "$1"
}

print_header() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}$1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    log "HEADER" "$1"
}

# 执行命令并记录结果
execute_command() {
    local cmd=$1
    local description=$2
    
    print_info "执行: $description"
    log "COMMAND" "$cmd"
    
    if eval "$cmd" >> "$LOG_FILE" 2>&1; then
        print_success "$description - 成功"
        return 0
    else
        print_error "$description - 失败"
        return 1
    fi
}

# 检查命令是否存在
check_command() {
    local cmd=$1
    if command -v "$cmd" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# 诊断函数
# =============================================================================

# 网络连通性测试
test_network_connectivity() {
    print_header "${WRENCH} 网络连通性诊断"
    
    # 1. Ping测试
    print_info "测试服务器网络连通性..."
    if ping -c 3 "$SERVER_IP" &> /dev/null; then
        print_success "Ping测试成功 - 服务器网络可达"
    else
        print_error "Ping测试失败 - 服务器网络不可达"
        return 1
    fi
    
    # 2. 端口连通性测试
    print_info "测试SSH端口连通性..."
    if nc -z -w5 "$SERVER_IP" "$SERVER_PORT" &> /dev/null; then
        print_success "SSH端口($SERVER_PORT)连通性正常"
    else
        print_error "SSH端口($SERVER_PORT)无法连接"
        return 1
    fi
    
    # 3. SSH服务检测
    print_info "检测SSH服务响应..."
    local ssh_banner=$(timeout 5 nc "$SERVER_IP" "$SERVER_PORT" <<< "")
    if [[ $ssh_banner == SSH-* ]]; then
        print_success "SSH服务正常运行: $ssh_banner"
    else
        print_warning "SSH服务可能存在问题或使用非标准配置"
    fi
    
    return 0
}

# SSH密钥检查
check_ssh_keys() {
    print_header "${KEY} SSH密钥配置检查"
    
    # 1. 检查SSH目录
    if [[ ! -d "$HOME/.ssh" ]]; then
        print_warning "SSH目录不存在，创建中..."
        mkdir -p "$HOME/.ssh"
        chmod 700 "$HOME/.ssh"
        print_success "SSH目录创建完成"
    else
        print_success "SSH目录存在"
    fi
    
    # 2. 检查现有密钥
    print_info "检查现有SSH密钥..."
    if [[ -f "$SSH_KEY_PATH" ]]; then
        print_success "找到SSH私钥: $SSH_KEY_PATH"
        
        # 验证密钥完整性
        if ssh-keygen -l -f "$SSH_KEY_PATH" &> /dev/null; then
            print_success "SSH私钥验证通过"
        else
            print_error "SSH私钥损坏或格式错误"
            return 1
        fi
    else
        print_warning "SSH私钥不存在: $SSH_KEY_PATH"
    fi
    
    if [[ -f "$SSH_KEY_PATH.pub" ]]; then
        print_success "找到SSH公钥: $SSH_KEY_PATH.pub"
        print_info "公钥指纹: $(ssh-keygen -l -f "$SSH_KEY_PATH.pub" 2>/dev/null | awk '{print $2}')"
    else
        print_warning "SSH公钥不存在: $SSH_KEY_PATH.pub"
    fi
    
    return 0
}

# 服务器配置检查
check_server_config() {
    print_header "${SHIELD} 服务器配置检查"
    
    # 1. SSH配置文件检查
    print_info "检查本地SSH配置..."
    if [[ -f "$SSH_CONFIG_FILE" ]]; then
        print_success "SSH config文件存在"
        
        # 检查是否有服务器配置
        if grep -q "$SERVER_IP" "$SSH_CONFIG_FILE" 2>/dev/null; then
            print_success "找到服务器配置项"
            print_info "当前配置:"
            grep -A 10 -B 2 "$SERVER_IP" "$SSH_CONFIG_FILE" | sed 's/^/  /'
        else
            print_warning "SSH config中没有找到服务器配置"
        fi
    else
        print_warning "SSH config文件不存在"
    fi
    
    # 2. known_hosts检查
    if [[ -f "$HOME/.ssh/known_hosts" ]]; then
        if grep -q "$SERVER_IP" "$HOME/.ssh/known_hosts" 2>/dev/null; then
            print_success "服务器已在known_hosts中"
        else
            print_warning "服务器不在known_hosts中，首次连接时需要确认"
        fi
    else
        print_warning "known_hosts文件不存在"
    fi
    
    return 0
}

# SSH连接测试
test_ssh_connection() {
    print_header "${ROCKET} SSH连接测试"
    
    local test_methods=(
        "密钥认证"
        "交互式认证"
        "调试模式连接"
    )
    
    # 1. 密钥认证测试
    if [[ -f "$SSH_KEY_PATH" ]]; then
        print_info "测试SSH密钥认证..."
        if timeout 10 ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=5 -o StrictHostKeyChecking=no \
           -o PasswordAuthentication=no "$SERVER_USER@$SERVER_IP" "echo 'SSH密钥连接成功'" 2>/dev/null; then
            print_success "SSH密钥认证成功!"
            return 0
        else
            print_error "SSH密钥认证失败"
        fi
    fi
    
    # 2. 获取详细错误信息
    print_info "获取详细连接错误信息..."
    local ssh_debug_output=$(timeout 10 ssh -v -i "$SSH_KEY_PATH" -o ConnectTimeout=5 \
        -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo test" 2>&1)
    
    echo "$ssh_debug_output" >> "$LOG_FILE"
    
    # 分析错误类型
    if echo "$ssh_debug_output" | grep -q "Permission denied (publickey"; then
        print_error "认证失败: 公钥未被服务器接受"
        print_warning "可能原因: 1) 公钥未添加到服务器 2) 服务器禁用了公钥认证"
    elif echo "$ssh_debug_output" | grep -q "Connection refused"; then
        print_error "连接被拒绝: SSH服务可能未运行"
    elif echo "$ssh_debug_output" | grep -q "Connection timed out"; then
        print_error "连接超时: 网络问题或防火墙阻止"
    elif echo "$ssh_debug_output" | grep -q "Host key verification failed"; then
        print_error "主机密钥验证失败: known_hosts问题"
    else
        print_warning "未知连接错误，请检查详细日志"
    fi
    
    return 1
}

# =============================================================================
# 修复函数
# =============================================================================

# 生成SSH密钥
generate_ssh_key() {
    print_header "${KEY} SSH密钥生成"
    
    # 1. 备份现有密钥
    if [[ -f "$SSH_KEY_PATH" ]]; then
        print_info "备份现有SSH密钥..."
        cp "$SSH_KEY_PATH" "$SSH_KEY_PATH.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$SSH_KEY_PATH.pub" "$SSH_KEY_PATH.pub.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
        print_success "密钥备份完成"
    fi
    
    # 2. 生成新密钥
    print_info "生成新的SSH密钥对..."
    local key_comment="mobilif-project-$(date +%Y%m%d-%H%M%S)"
    
    if ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "$key_comment" &>/dev/null; then
        print_success "SSH密钥对生成成功"
        
        # 设置正确权限
        chmod 600 "$SSH_KEY_PATH"
        chmod 644 "$SSH_KEY_PATH.pub"
        
        print_info "密钥指纹: $(ssh-keygen -l -f "$SSH_KEY_PATH" | awk '{print $2}')"
        print_info "密钥位置: $SSH_KEY_PATH"
    else
        print_error "SSH密钥生成失败"
        return 1
    fi
    
    return 0
}

# 配置SSH客户端
configure_ssh_client() {
    print_header "${WRENCH} SSH客户端配置"
    
    # 1. 创建SSH配置
    print_info "配置SSH客户端..."
    
    local ssh_config_entry="
# MobiLiF项目服务器配置
Host mobilif-server
    HostName $SERVER_IP
    Port $SERVER_PORT
    User $SERVER_USER
    IdentityFile $SSH_KEY_PATH
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 10

# MobiLiF项目服务器 (IP别名)
Host $SERVER_IP
    Port $SERVER_PORT
    User $SERVER_USER
    IdentityFile $SSH_KEY_PATH
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 10
"
    
    # 2. 更新SSH配置文件
    if [[ -f "$SSH_CONFIG_FILE" ]]; then
        # 删除现有配置
        grep -v -A 15 "# MobiLiF项目服务器" "$SSH_CONFIG_FILE" > "$SSH_CONFIG_FILE.tmp" 2>/dev/null || true
        mv "$SSH_CONFIG_FILE.tmp" "$SSH_CONFIG_FILE" 2>/dev/null || true
    fi
    
    echo "$ssh_config_entry" >> "$SSH_CONFIG_FILE"
    chmod 600 "$SSH_CONFIG_FILE"
    
    print_success "SSH配置文件更新完成"
    print_info "现在可以使用以下命令连接:"
    echo -e "${CYAN}  ssh mobilif-server${NC}"
    echo -e "${CYAN}  ssh $SERVER_USER@$SERVER_IP${NC}"
    
    return 0
}

# 显示公钥信息
display_public_key() {
    print_header "${KEY} 公钥信息"
    
    if [[ -f "$SSH_KEY_PATH.pub" ]]; then
        print_success "SSH公钥已生成，请将以下公钥添加到服务器:"
        echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${WHITE}公钥内容 (复制以下全部内容):${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        cat "$SSH_KEY_PATH.pub"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        
        # 保存公钥到文件
        local pubkey_file="$(pwd)/mobilif_public_key.txt"
        cp "$SSH_KEY_PATH.pub" "$pubkey_file"
        print_success "公钥已保存到: $pubkey_file"
        
        # 复制到剪贴板 (如果可能)
        if check_command "pbcopy"; then
            cat "$SSH_KEY_PATH.pub" | pbcopy
            print_success "公钥已复制到剪贴板"
        elif check_command "xclip"; then
            cat "$SSH_KEY_PATH.pub" | xclip -selection clipboard
            print_success "公钥已复制到剪贴板"
        fi
    else
        print_error "找不到公钥文件"
        return 1
    fi
    
    return 0
}

# 提供修复建议
provide_fix_suggestions() {
    print_header "${INFO} 修复建议和后续步骤"
    
    print_info "请按照以下步骤配置服务器端SSH访问:"
    
    echo -e "\n${WHITE}方案1: 通过阿里云控制台配置 (推荐)${NC}"
    echo -e "${CYAN}1. 登录阿里云控制台 → ECS实例管理${NC}"
    echo -e "${CYAN}2. 找到服务器实例 (IP: $SERVER_IP)${NC}"
    echo -e "${CYAN}3. 点击 '远程连接' → '发送远程命令'${NC}"
    echo -e "${CYAN}4. 执行以下命令添加公钥:${NC}"
    echo -e "${YELLOW}   mkdir -p ~/.ssh${NC}"
    echo -e "${YELLOW}   chmod 700 ~/.ssh${NC}"
    echo -e "${YELLOW}   echo '$(cat "$SSH_KEY_PATH.pub" 2>/dev/null)' >> ~/.ssh/authorized_keys${NC}"
    echo -e "${YELLOW}   chmod 600 ~/.ssh/authorized_keys${NC}"
    echo -e "${YELLOW}   chown -R root:root ~/.ssh${NC}"
    
    echo -e "\n${WHITE}方案2: 通过VNC或控制台连接${NC}"
    echo -e "${CYAN}1. 在阿里云控制台使用VNC连接到服务器${NC}"
    echo -e "${CYAN}2. 登录root用户${NC}"
    echo -e "${CYAN}3. 执行上述命令添加公钥${NC}"
    
    echo -e "\n${WHITE}方案3: 如果已有密码访问${NC}"
    echo -e "${CYAN}1. 使用密码登录服务器:${NC}"
    echo -e "${YELLOW}   ssh-copy-id -i $SSH_KEY_PATH.pub $SERVER_USER@$SERVER_IP${NC}"
    echo -e "${CYAN}2. 或手动执行:${NC}"
    echo -e "${YELLOW}   scp $SSH_KEY_PATH.pub $SERVER_USER@$SERVER_IP:~/${NC}"
    echo -e "${YELLOW}   ssh $SERVER_USER@$SERVER_IP 'cat ~/$(basename "$SSH_KEY_PATH.pub") >> ~/.ssh/authorized_keys'${NC}"
    
    echo -e "\n${WHITE}安全组配置检查:${NC}"
    echo -e "${CYAN}1. 确保阿里云安全组开放SSH端口(22)${NC}"
    echo -e "${CYAN}2. 入方向规则: 协议SSH(22), 端口范围22/22, 授权对象0.0.0.0/0${NC}"
    echo -e "${CYAN}3. 如果有防火墙，确保开放22端口${NC}"
    
    echo -e "\n${WHITE}服务器端SSH配置检查:${NC}"
    echo -e "${CYAN}在服务器上检查 /etc/ssh/sshd_config 文件:${NC}"
    echo -e "${YELLOW}   PubkeyAuthentication yes${NC}"
    echo -e "${YELLOW}   AuthorizedKeysFile .ssh/authorized_keys${NC}"
    echo -e "${YELLOW}   PermitRootLogin yes${NC}"
    echo -e "${CYAN}修改后重启SSH服务:${NC}"
    echo -e "${YELLOW}   systemctl restart sshd${NC}"
    
    print_success "配置完成后，请运行以下命令测试连接:"
    echo -e "${GREEN}  ./scripts/fix-ssh-connection.sh --test${NC}"
    echo -e "${GREEN}  ssh mobilif-server${NC}"
    
    return 0
}

# 测试连接
test_connection_only() {
    print_header "${ROCKET} SSH连接测试"
    
    if [[ ! -f "$SSH_KEY_PATH" ]]; then
        print_error "SSH密钥不存在，请先运行完整的修复脚本"
        return 1
    fi
    
    print_info "测试SSH连接..."
    
    # 测试使用别名连接
    if timeout 10 ssh -o ConnectTimeout=5 -o BatchMode=yes mobilif-server "echo 'SSH连接测试成功!'; date; whoami; uname -a" 2>/dev/null; then
        print_success "SSH连接测试成功!"
        print_success "可以正常访问服务器"
        
        # 测试服务器基本信息
        print_info "获取服务器信息..."
        ssh mobilif-server "echo '系统信息:'; lsb_release -a 2>/dev/null || cat /etc/os-release | head -5; echo; echo '磁盘使用:'; df -h | head -5; echo; echo '内存使用:'; free -h"
        
        return 0
    else
        print_error "SSH连接仍然失败"
        print_warning "请检查:"
        echo -e "${YELLOW}  1. 公钥是否正确添加到服务器${NC}"
        echo -e "${YELLOW}  2. 服务器SSH服务是否正常运行${NC}"
        echo -e "${YELLOW}  3. 阿里云安全组是否开放SSH端口${NC}"
        echo -e "${YELLOW}  4. 服务器防火墙配置${NC}"
        
        # 获取详细错误信息
        print_info "获取详细错误信息..."
        ssh -v mobilif-server "echo test" 2>&1 | tail -10
        
        return 1
    fi
}

# 生成连接脚本
generate_connection_scripts() {
    print_header "${WRENCH} 生成连接脚本"
    
    # 1. 生成快速连接脚本
    local connect_script="scripts/connect-server.sh"
    cat > "$connect_script" << 'EOF'
#!/bin/bash

# MobiLiF项目服务器快速连接脚本

SERVER_ALIAS="mobilif-server"
SERVER_IP="8.147.235.48"

echo "🚀 连接到MobiLiF服务器..."

# 检查SSH密钥
if [[ ! -f ~/.ssh/mobilif_rsa ]]; then
    echo "❌ SSH密钥不存在，请先运行修复脚本"
    echo "   ./scripts/fix-ssh-connection.sh"
    exit 1
fi

# 尝试连接
if ssh -o ConnectTimeout=10 "$SERVER_ALIAS" "$@"; then
    echo "✅ 连接成功"
else
    echo "❌ 连接失败"
    echo "💡 尝试其他连接方式:"
    echo "   ssh root@$SERVER_IP"
    echo "   或运行诊断: ./scripts/fix-ssh-connection.sh --test"
    exit 1
fi
EOF
    
    chmod +x "$connect_script"
    print_success "连接脚本创建完成: $connect_script"
    
    # 2. 生成服务器管理脚本
    local manage_script="scripts/manage-server.sh"
    cat > "$manage_script" << 'EOF'
#!/bin/bash

# MobiLiF项目服务器管理脚本

SERVER_ALIAS="mobilif-server"

show_help() {
    echo "MobiLiF服务器管理工具"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  status    - 查看服务器状态"
    echo "  logs      - 查看应用日志"
    echo "  restart   - 重启服务"
    echo "  deploy    - 部署应用"
    echo "  shell     - 打开SSH会话"
    echo "  help      - 显示帮助"
}

case "$1" in
    "status")
        echo "🔍 检查服务器状态..."
        ssh "$SERVER_ALIAS" "echo '=== 系统信息 ==='; uptime; echo; echo '=== 磁盘使用 ==='; df -h; echo; echo '=== 内存使用 ==='; free -h; echo; echo '=== PM2状态 ==='; pm2 status 2>/dev/null || echo 'PM2未安装或无运行进程'"
        ;;
    "logs")
        echo "📋 查看应用日志..."
        ssh "$SERVER_ALIAS" "tail -50 /var/log/mobilif/*.log 2>/dev/null || echo '日志文件不存在'"
        ;;
    "restart")
        echo "🔄 重启服务..."
        ssh "$SERVER_ALIAS" "pm2 restart all 2>/dev/null || systemctl restart mobilif 2>/dev/null || echo '无法重启服务，请检查配置'"
        ;;
    "deploy")
        echo "🚀 部署应用..."
        ./scripts/deployment/deploy.sh
        ;;
    "shell")
        echo "💻 打开SSH会话..."
        ssh "$SERVER_ALIAS"
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ 未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
EOF
    
    chmod +x "$manage_script"
    print_success "管理脚本创建完成: $manage_script"
    
    print_info "脚本使用方法:"
    echo -e "${CYAN}  快速连接: ./scripts/connect-server.sh${NC}"
    echo -e "${CYAN}  服务器管理: ./scripts/manage-server.sh status${NC}"
    
    return 0
}

# =============================================================================
# 主函数
# =============================================================================

# 显示帮助信息
show_help() {
    echo -e "${BLUE}MobiLiF项目 SSH连接修复工具${NC}\n"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --test          仅测试SSH连接"
    echo "  --diagnose      仅运行诊断"
    echo "  --fix           运行完整修复流程"
    echo "  --show-key      显示公钥信息"
    echo "  --help          显示帮助信息"
    echo ""
    echo "服务器信息:"
    echo "  IP地址: $SERVER_IP"
    echo "  端口: $SERVER_PORT"
    echo "  用户: $SERVER_USER"
    echo "  密钥: $SSH_KEY_PATH"
    echo ""
    echo "示例:"
    echo "  $0                 # 运行完整修复流程"
    echo "  $0 --test          # 仅测试连接"
    echo "  $0 --diagnose      # 仅运行诊断"
}

# 主修复流程
main_fix_process() {
    print_header "${ROCKET} MobiLiF项目 SSH连接修复工具"
    
    print_info "开始SSH连接问题诊断和修复..."
    print_info "服务器: $SERVER_USER@$SERVER_IP:$SERVER_PORT"
    print_info "日志文件: $LOG_FILE"
    
    echo -e "\n${YELLOW}注意: 此脚本将生成新的SSH密钥并配置连接${NC}"
    echo -e "${YELLOW}如果您已有可用的SSH密钥，请考虑备份现有配置${NC}\n"
    
    # 步骤1: 网络连通性诊断
    if ! test_network_connectivity; then
        print_error "网络连通性测试失败，请检查网络连接和服务器状态"
        return 1
    fi
    
    # 步骤2: SSH密钥检查和生成
    check_ssh_keys
    
    if [[ ! -f "$SSH_KEY_PATH" ]] || [[ ! -f "$SSH_KEY_PATH.pub" ]]; then
        print_warning "SSH密钥不存在或不完整，生成新密钥..."
        if ! generate_ssh_key; then
            print_error "SSH密钥生成失败"
            return 1
        fi
    fi
    
    # 步骤3: 配置SSH客户端
    if ! configure_ssh_client; then
        print_error "SSH客户端配置失败"
        return 1
    fi
    
    # 步骤4: 服务器配置检查
    check_server_config
    
    # 步骤5: 显示公钥信息
    display_public_key
    
    # 步骤6: 生成辅助脚本
    generate_connection_scripts
    
    # 步骤7: 提供修复建议
    provide_fix_suggestions
    
    print_header "${SUCCESS} 修复流程完成"
    print_success "SSH连接修复脚本执行完成"
    print_info "下一步: 请按照上述建议配置服务器端，然后运行连接测试"
    print_info "测试命令: $0 --test"
    
    return 0
}

# 主函数
main() {
    # 检查参数
    case "$1" in
        "--test")
            test_connection_only
            ;;
        "--diagnose")
            test_network_connectivity
            check_ssh_keys
            check_server_config
            test_ssh_connection
            ;;
        "--fix")
            main_fix_process
            ;;
        "--show-key")
            display_public_key
            ;;
        "--help"|"-h")
            show_help
            ;;
        "")
            main_fix_process
            ;;
        *)
            print_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi