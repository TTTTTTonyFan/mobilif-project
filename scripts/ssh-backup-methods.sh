#!/bin/bash

# =============================================================================
# MobiLiF项目 - SSH备用连接方案脚本
# =============================================================================
#
# 功能说明：
# 1. 提供多种SSH连接备用方案
# 2. 密码登录配置（临时方案）
# 3. SSH隧道和端口转发配置
# 4. 阿里云控制台连接指导
#
# 使用方法：
#   chmod +x scripts/ssh-backup-methods.sh
#   ./scripts/ssh-backup-methods.sh [方案选项]
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
NC='\033[0m'

# 图标配置
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
WRENCH="🔧"
KEY="🔑"
SHIELD="🛡️"
BACKUP="💾"

# 服务器配置
SERVER_IP="8.147.235.48"
SERVER_PORT="22"
SERVER_USER="root"

# 工具函数
print_header() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}$1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}${SUCCESS} $1${NC}"
}

print_error() {
    echo -e "${RED}${ERROR} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

print_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

# 方案1: 密码登录配置
setup_password_login() {
    print_header "${KEY} 方案1: 密码登录配置（临时方案）"
    
    print_info "密码登录是最简单的备用连接方案"
    print_warning "注意: 密码登录安全性较低，仅作为临时解决方案"
    
    echo -e "\n${WHITE}1. 尝试密码登录${NC}"
    echo -e "${CYAN}命令:${NC}"
    echo -e "${YELLOW}  ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no $SERVER_USER@$SERVER_IP${NC}"
    
    echo -e "\n${WHITE}2. 如果密码登录被禁用，需要在服务器端修改配置${NC}"
    echo -e "${CYAN}通过阿里云控制台连接服务器，编辑SSH配置文件:${NC}"
    echo -e "${YELLOW}  sudo vi /etc/ssh/sshd_config${NC}"
    
    echo -e "\n${CYAN}确保以下配置项:${NC}"
    echo -e "${YELLOW}  PasswordAuthentication yes${NC}"
    echo -e "${YELLOW}  PermitRootLogin yes${NC}"
    echo -e "${YELLOW}  ChallengeResponseAuthentication no${NC}"
    
    echo -e "\n${CYAN}重启SSH服务:${NC}"
    echo -e "${YELLOW}  sudo systemctl restart sshd${NC}"
    
    echo -e "\n${WHITE}3. 设置root密码（如果还没有）${NC}"
    echo -e "${CYAN}在服务器上执行:${NC}"
    echo -e "${YELLOW}  sudo passwd root${NC}"
    
    print_info "配置完成后，可以使用密码登录到服务器"
    
    # 生成密码登录脚本
    cat > "scripts/connect-with-password.sh" << EOF
#!/bin/bash

# MobiLiF项目 - 密码登录脚本

echo "🔑 使用密码连接到服务器..."
echo "服务器: $SERVER_USER@$SERVER_IP"
echo ""
echo "⚠️  注意: 请输入服务器密码"
echo ""

# 禁用密钥认证，强制使用密码
ssh -o PreferredAuthentications=password \\
    -o PubkeyAuthentication=no \\
    -o KbdInteractiveAuthentication=yes \\
    -o PasswordAuthentication=yes \\
    $SERVER_USER@$SERVER_IP
EOF
    
    chmod +x "scripts/connect-with-password.sh"
    print_success "密码登录脚本已创建: scripts/connect-with-password.sh"
}

# 方案2: 阿里云控制台连接
setup_aliyun_console() {
    print_header "${ROCKET} 方案2: 阿里云控制台连接"
    
    print_info "通过阿里云控制台可以直接访问服务器，无需SSH"
    
    echo -e "\n${WHITE}1. VNC连接方式${NC}"
    echo -e "${CYAN}步骤:${NC}"
    echo -e "${YELLOW}  1. 登录阿里云控制台 (https://ecs.console.aliyun.com)${NC}"
    echo -e "${YELLOW}  2. 进入 ECS → 实例与镜像 → 实例${NC}"
    echo -e "${YELLOW}  3. 找到IP为 $SERVER_IP 的实例${NC}"
    echo -e "${YELLOW}  4. 点击 '远程连接' → 'VNC'${NC}"
    echo -e "${YELLOW}  5. 输入VNC密码（首次使用需要设置）${NC}"
    echo -e "${YELLOW}  6. 进入服务器桌面环境${NC}"
    
    echo -e "\n${WHITE}2. 发送远程命令${NC}"
    echo -e "${CYAN}适用于执行单个命令:${NC}"
    echo -e "${YELLOW}  1. 在实例列表中选择服务器${NC}"
    echo -e "${YELLOW}  2. 点击 '远程连接' → '发送远程命令'${NC}"
    echo -e "${YELLOW}  3. 选择命令类型（Shell）${NC}"
    echo -e "${YELLOW}  4. 输入要执行的命令${NC}"
    echo -e "${YELLOW}  5. 点击执行并查看结果${NC}"
    
    echo -e "\n${WHITE}3. 云助手连接${NC}"
    echo -e "${CYAN}批量操作和自动化:${NC}"
    echo -e "${YELLOW}  1. ECS控制台 → 运维与监控 → 云助手${NC}"
    echo -e "${YELLOW}  2. 创建命令或使用预设命令${NC}"
    echo -e "${YELLOW}  3. 选择目标实例执行${NC}"
    
    print_warning "通过控制台连接可以解决SSH配置问题，但操作相对复杂"
    print_info "建议优先使用VNC连接进行SSH配置修复"
    
    # 生成控制台连接指南
    cat > "docs/aliyun-console-guide.md" << 'EOF'
# 阿里云控制台连接指南

## VNC连接步骤

1. **登录阿里云控制台**
   - 访问: https://ecs.console.aliyun.com
   - 使用阿里云账号登录

2. **找到ECS实例**
   - 导航: ECS → 实例与镜像 → 实例
   - 搜索或找到IP为 8.147.235.48 的实例

3. **启动VNC连接**
   - 点击实例操作列的 "远程连接"
   - 选择 "VNC" 连接方式
   - 首次使用需要设置VNC密码（6位数字）

4. **VNC连接成功后**
   - 可以像操作本地服务器一样使用
   - 打开终端执行命令
   - 配置SSH密钥等

## 常用命令

### 添加SSH公钥
```bash
# 创建SSH目录
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加公钥（替换为实际的公钥内容）
echo "ssh-rsa AAAAB3NzaC1yc2E..." >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chown -R root:root ~/.ssh
```

### 检查SSH服务
```bash
# 查看SSH服务状态
systemctl status sshd

# 重启SSH服务
systemctl restart sshd

# 查看SSH配置
cat /etc/ssh/sshd_config | grep -E "(PubkeyAuthentication|PasswordAuthentication|PermitRootLogin)"
```

### 防火墙配置
```bash
# 检查防火墙状态
systemctl status firewalld

# 开放SSH端口
firewall-cmd --permanent --add-service=ssh
firewall-cmd --reload

# 或者直接开放22端口
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --reload
```

## 安全组配置

确保阿里云安全组规则包含：

| 方向 | 协议 | 端口范围 | 授权对象 | 描述 |
|------|------|----------|----------|------|
| 入方向 | SSH(22) | 22/22 | 0.0.0.0/0 | SSH连接 |

## 故障排除

### 常见问题

1. **VNC连接失败**
   - 检查实例是否在运行状态
   - 重置VNC密码
   - 尝试重启实例

2. **SSH仍然无法连接**
   - 检查authorized_keys文件权限
   - 验证公钥格式是否正确
   - 检查SSH服务配置

3. **防火墙阻止连接**
   - 临时关闭防火墙测试: `systemctl stop firewalld`
   - 检查iptables规则: `iptables -L`
EOF
    
    print_success "阿里云控制台连接指南已创建: docs/aliyun-console-guide.md"
}

# 方案3: SSH隧道和端口转发
setup_ssh_tunneling() {
    print_header "${WRENCH} 方案3: SSH隧道和端口转发"
    
    print_info "当直接SSH连接有问题时，可以使用隧道技术"
    print_warning "此方案需要有一台中介服务器或跳板机"
    
    echo -e "\n${WHITE}1. 通过跳板机连接${NC}"
    echo -e "${CYAN}如果有其他可访问的服务器作为跳板:${NC}"
    echo -e "${YELLOW}  ssh -J jumphost-user@jumphost-ip $SERVER_USER@$SERVER_IP${NC}"
    
    echo -e "\n${WHITE}2. 本地端口转发${NC}"
    echo -e "${CYAN}将本地端口转发到服务器:${NC}"
    echo -e "${YELLOW}  ssh -L 2222:$SERVER_IP:22 user@jumphost${NC}"
    echo -e "${CYAN}然后连接本地端口:${NC}"
    echo -e "${YELLOW}  ssh -p 2222 $SERVER_USER@localhost${NC}"
    
    echo -e "\n${WHITE}3. 反向隧道${NC}"
    echo -e "${CYAN}从服务器端建立到本地的隧道:${NC}"
    echo -e "${YELLOW}  # 在服务器上执行${NC}"
    echo -e "${YELLOW}  ssh -R 2222:localhost:22 user@your-local-ip${NC}"
    
    echo -e "\n${WHITE}4. 动态端口转发（SOCKS代理）${NC}"
    echo -e "${CYAN}创建SOCKS代理:${NC}"
    echo -e "${YELLOW}  ssh -D 1080 user@proxy-server${NC}"
    echo -e "${CYAN}配置SSH使用代理:${NC}"
    echo -e "${YELLOW}  ssh -o ProxyCommand='nc -X 5 -x localhost:1080 %h %p' $SERVER_USER@$SERVER_IP${NC}"
    
    # 生成隧道连接脚本
    cat > "scripts/connect-via-tunnel.sh" << 'EOF'
#!/bin/bash

# MobiLiF项目 - SSH隧道连接脚本

JUMP_HOST=""
JUMP_USER=""
LOCAL_PORT="2222"

show_help() {
    echo "SSH隧道连接脚本"
    echo ""
    echo "用法:"
    echo "  $0 --jump jumphost-ip --user username  # 使用跳板机"
    echo "  $0 --local-forward                     # 本地端口转发"
    echo "  $0 --help                              # 显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 --jump 1.2.3.4 --user admin"
}

case "$1" in
    "--jump")
        if [[ -z "$2" ]] || [[ -z "$4" ]]; then
            echo "❌ 缺少参数"
            show_help
            exit 1
        fi
        JUMP_HOST="$2"
        JUMP_USER="$4"
        echo "🚀 通过跳板机连接..."
        echo "跳板机: $JUMP_USER@$JUMP_HOST"
        echo "目标: root@8.147.235.48"
        ssh -J "$JUMP_USER@$JUMP_HOST" root@8.147.235.48
        ;;
    "--local-forward")
        echo "🚀 设置本地端口转发..."
        echo "本地端口: $LOCAL_PORT"
        echo "目标: 8.147.235.48:22"
        echo ""
        echo "请在另一个终端窗口执行连接命令:"
        echo "  ssh -p $LOCAL_PORT root@localhost"
        echo ""
        read -p "请输入跳板机地址: " JUMP_HOST
        read -p "请输入跳板机用户名: " JUMP_USER
        ssh -L "$LOCAL_PORT:8.147.235.48:22" "$JUMP_USER@$JUMP_HOST"
        ;;
    "--help"|"")
        show_help
        ;;
    *)
        echo "❌ 未知参数: $1"
        show_help
        exit 1
        ;;
esac
EOF
    
    chmod +x "scripts/connect-via-tunnel.sh"
    print_success "隧道连接脚本已创建: scripts/connect-via-tunnel.sh"
}

# 方案4: 替代连接工具
setup_alternative_tools() {
    print_header "${SHIELD} 方案4: 替代连接工具"
    
    print_info "当标准SSH客户端有问题时，可以使用其他工具"
    
    echo -e "\n${WHITE}1. Mosh (Mobile Shell)${NC}"
    echo -e "${CYAN}优势: 网络中断时保持连接${NC}"
    echo -e "${YELLOW}安装: brew install mosh${NC}"
    echo -e "${YELLOW}使用: mosh $SERVER_USER@$SERVER_IP${NC}"
    echo -e "${CYAN}注意: 服务器端也需要安装mosh${NC}"
    
    echo -e "\n${WHITE}2. Termius (跨平台SSH客户端)${NC}"
    echo -e "${CYAN}特点: 图形界面，支持密钥管理${NC}"
    echo -e "${YELLOW}下载: https://termius.com/${NC}"
    echo -e "${CYAN}支持: macOS, Windows, iOS, Android${NC}"
    
    echo -e "\n${WHITE}3. SecureCRT${NC}"
    echo -e "${CYAN}企业级SSH客户端${NC}"
    echo -e "${YELLOW}功能: 脚本自动化、会话管理${NC}"
    
    echo -e "\n${WHITE}4. PuTTY (Windows)${NC}"
    echo -e "${CYAN}经典SSH客户端${NC}"
    echo -e "${YELLOW}下载: https://www.putty.org/${NC}"
    
    echo -e "\n${WHITE}5. VS Code Remote-SSH${NC}"
    echo -e "${CYAN}直接在VS Code中远程开发${NC}"
    echo -e "${YELLOW}扩展: Remote - SSH${NC}"
    echo -e "${YELLOW}配置: Ctrl+Shift+P → Remote-SSH: Connect to Host${NC}"
    
    # 检查可用工具
    echo -e "\n${WHITE}本机可用工具检查:${NC}"
    
    tools=("mosh" "telnet" "nc" "nmap" "curl")
    for tool in "${tools[@]}"; do
        if command -v "$tool" &> /dev/null; then
            print_success "$tool - 已安装"
        else
            print_warning "$tool - 未安装"
            case "$tool" in
                "mosh")
                    echo -e "${CYAN}    安装: brew install mosh${NC}"
                    ;;
                "telnet")
                    echo -e "${CYAN}    安装: brew install telnet${NC}"
                    ;;
                "nmap")
                    echo -e "${CYAN}    安装: brew install nmap${NC}"
                    ;;
            esac
        fi
    done
    
    # 生成工具安装脚本
    cat > "scripts/install-ssh-tools.sh" << 'EOF'
#!/bin/bash

# SSH相关工具安装脚本

echo "🔧 安装SSH相关工具..."

# 检查包管理器
if command -v brew &> /dev/null; then
    echo "✅ 检测到Homebrew"
    
    tools=("mosh" "telnet" "nmap" "htop")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            echo "📦 安装 $tool..."
            brew install "$tool"
        else
            echo "✅ $tool 已安装"
        fi
    done
    
elif command -v apt-get &> /dev/null; then
    echo "✅ 检测到APT包管理器"
    sudo apt-get update
    sudo apt-get install -y mosh telnet nmap htop openssh-client
    
elif command -v yum &> /dev/null; then
    echo "✅ 检测到YUM包管理器"
    sudo yum install -y mosh telnet nmap htop openssh-clients
    
else
    echo "❌ 未检测到支持的包管理器"
    echo "请手动安装所需工具"
fi

echo "🎉 工具安装完成"
EOF
    
    chmod +x "scripts/install-ssh-tools.sh"
    print_success "工具安装脚本已创建: scripts/install-ssh-tools.sh"
}

# 方案5: 应急连接配置
setup_emergency_config() {
    print_header "${BACKUP} 方案5: 应急连接配置"
    
    print_info "创建应急连接配置，确保在主要方案失败时仍能连接"
    
    # 创建应急SSH配置
    local emergency_config="$HOME/.ssh/config_emergency"
    
    cat > "$emergency_config" << EOF
# MobiLiF项目 - 应急SSH配置
# 使用方法: ssh -F ~/.ssh/config_emergency mobilif-emergency

Host mobilif-emergency
    HostName $SERVER_IP
    Port $SERVER_PORT
    User $SERVER_USER
    # 尝试多种认证方式
    PreferredAuthentications publickey,password,keyboard-interactive
    # 密钥文件
    IdentityFile ~/.ssh/mobilif_rsa
    IdentityFile ~/.ssh/id_rsa
    IdentityFile ~/.ssh/id_ed25519
    # 连接选项
    ConnectTimeout 30
    ServerAliveInterval 60
    ServerAliveCountMax 3
    # 安全选项（应急时放宽）
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    # 重试选项
    ConnectionAttempts 3
    # 日志详细程度
    LogLevel VERBOSE

# 使用不同端口的备用配置
Host mobilif-alt-port
    HostName $SERVER_IP
    Port 2222
    User $SERVER_USER
    PreferredAuthentications publickey,password
    IdentityFile ~/.ssh/mobilif_rsa
    ConnectTimeout 15
    StrictHostKeyChecking no

# 通过IPv4强制连接
Host mobilif-ipv4
    HostName $SERVER_IP
    Port $SERVER_PORT
    User $SERVER_USER
    AddressFamily inet
    PreferredAuthentications publickey,password
    IdentityFile ~/.ssh/mobilif_rsa
    ConnectTimeout 10
    StrictHostKeyChecking no
EOF
    
    print_success "应急SSH配置已创建: $emergency_config"
    
    echo -e "\n${WHITE}应急连接命令:${NC}"
    echo -e "${YELLOW}  ssh -F ~/.ssh/config_emergency mobilif-emergency${NC}"
    echo -e "${YELLOW}  ssh -F ~/.ssh/config_emergency mobilif-alt-port${NC}"
    echo -e "${YELLOW}  ssh -F ~/.ssh/config_emergency mobilif-ipv4${NC}"
    
    # 创建应急连接脚本
    cat > "scripts/emergency-connect.sh" << EOF
#!/bin/bash

# MobiLiF项目 - 应急连接脚本

CONFIG_FILE="\$HOME/.ssh/config_emergency"
SERVER_IP="$SERVER_IP"

echo "🚨 MobiLiF项目应急连接工具"
echo "================================"

if [[ ! -f "\$CONFIG_FILE" ]]; then
    echo "❌ 应急配置文件不存在: \$CONFIG_FILE"
    echo "请先运行: ./scripts/ssh-backup-methods.sh --emergency"
    exit 1
fi

echo "📋 可用连接方式:"
echo "  1. 标准应急连接"
echo "  2. 替代端口连接"
echo "  3. IPv4强制连接"
echo "  4. 详细调试连接"
echo "  5. 密码强制连接"
echo ""

read -p "请选择连接方式 (1-5): " choice

case \$choice in
    1)
        echo "🚀 尝试标准应急连接..."
        ssh -F "\$CONFIG_FILE" mobilif-emergency
        ;;
    2)
        echo "🚀 尝试替代端口连接..."
        ssh -F "\$CONFIG_FILE" mobilif-alt-port
        ;;
    3)
        echo "🚀 尝试IPv4强制连接..."
        ssh -F "\$CONFIG_FILE" mobilif-ipv4
        ;;
    4)
        echo "🚀 详细调试连接..."
        ssh -vvv -F "\$CONFIG_FILE" mobilif-emergency
        ;;
    5)
        echo "🚀 密码强制连接..."
        ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@\$SERVER_IP
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac
EOF
    
    chmod +x "scripts/emergency-connect.sh"
    print_success "应急连接脚本已创建: scripts/emergency-connect.sh"
    
    print_info "应急配置完成！"
    print_warning "应急配置安全性较低，仅在正常连接失败时使用"
}

# 综合测试所有连接方案
test_all_methods() {
    print_header "${ROCKET} 测试所有连接方案"
    
    local methods=(
        "标准SSH连接"
        "应急配置连接"
        "网络连通性测试"
        "端口连通性测试"
    )
    
    echo -e "${WHITE}开始测试所有可用的连接方案...${NC}\n"
    
    # 1. 标准SSH连接测试
    print_info "测试1: 标准SSH连接"
    if timeout 10 ssh -o ConnectTimeout=5 -o BatchMode=yes "$SERVER_USER@$SERVER_IP" "echo 'Standard SSH OK'" 2>/dev/null; then
        print_success "标准SSH连接正常"
    else
        print_error "标准SSH连接失败"
    fi
    
    # 2. 应急配置连接测试
    print_info "测试2: 应急配置连接"
    if [[ -f "$HOME/.ssh/config_emergency" ]]; then
        if timeout 10 ssh -F "$HOME/.ssh/config_emergency" -o BatchMode=yes mobilif-emergency "echo 'Emergency SSH OK'" 2>/dev/null; then
            print_success "应急SSH连接正常"
        else
            print_error "应急SSH连接失败"
        fi
    else
        print_warning "应急配置文件不存在"
    fi
    
    # 3. 网络连通性测试
    print_info "测试3: 网络连通性"
    if ping -c 3 "$SERVER_IP" &>/dev/null; then
        print_success "网络连通性正常"
    else
        print_error "网络连通性失败"
    fi
    
    # 4. 端口连通性测试
    print_info "测试4: SSH端口连通性"
    if nc -z -w5 "$SERVER_IP" "$SERVER_PORT" &>/dev/null; then
        print_success "SSH端口连通性正常"
    else
        print_error "SSH端口连通性失败"
    fi
    
    # 5. DNS解析测试
    print_info "测试5: DNS解析"
    if nslookup "$SERVER_IP" &>/dev/null; then
        print_success "DNS解析正常"
    else
        print_warning "DNS解析可能有问题（IP地址通常不需要解析）"
    fi
    
    echo -e "\n${WHITE}测试完成！${NC}"
    print_info "如果所有测试都失败，建议使用阿里云控制台连接"
}

# 显示帮助信息
show_help() {
    echo -e "${BLUE}MobiLiF项目 SSH备用连接方案工具${NC}\n"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --password      配置密码登录方案"
    echo "  --console       阿里云控制台连接指导"
    echo "  --tunnel        SSH隧道和端口转发配置"
    echo "  --tools         替代连接工具配置"
    echo "  --emergency     应急连接配置"
    echo "  --test          测试所有连接方案"
    echo "  --all           执行所有配置"
    echo "  --help          显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 --password   # 配置密码登录"
    echo "  $0 --all        # 执行所有配置"
    echo "  $0 --test       # 测试连接"
}

# 主函数
main() {
    case "$1" in
        "--password")
            setup_password_login
            ;;
        "--console")
            setup_aliyun_console
            ;;
        "--tunnel")
            setup_ssh_tunneling
            ;;
        "--tools")
            setup_alternative_tools
            ;;
        "--emergency")
            setup_emergency_config
            ;;
        "--test")
            test_all_methods
            ;;
        "--all")
            print_header "${BACKUP} 配置所有SSH备用方案"
            setup_password_login
            setup_aliyun_console
            setup_ssh_tunneling
            setup_alternative_tools
            setup_emergency_config
            print_success "所有备用方案配置完成！"
            ;;
        "--help"|"-h"|"")
            show_help
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