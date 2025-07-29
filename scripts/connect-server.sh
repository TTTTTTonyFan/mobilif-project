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