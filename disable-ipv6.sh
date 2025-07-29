#!/bin/bash

# MobiLiF - 系统级禁用IPv6脚本
# 注意：此操作需要管理员权限，会影响系统网络设置

echo "🚫 正在禁用系统IPv6..."

# 临时禁用IPv6
sudo sysctl -w net.inet6.ip6.accept_rtadv=0
sudo sysctl -w net.inet6.ip6.forwarding=0

# 永久禁用IPv6（重启后生效）
if ! grep -q "net.inet6.ip6.accept_rtadv=0" /etc/sysctl.conf 2>/dev/null; then
    echo "net.inet6.ip6.accept_rtadv=0" | sudo tee -a /etc/sysctl.conf
fi

if ! grep -q "net.inet6.ip6.forwarding=0" /etc/sysctl.conf 2>/dev/null; then
    echo "net.inet6.ip6.forwarding=0" | sudo tee -a /etc/sysctl.conf
fi

echo "✅ IPv6已禁用，请重启系统后测试"
echo "💡 如需恢复IPv6，请删除 /etc/sysctl.conf 中添加的配置行"
