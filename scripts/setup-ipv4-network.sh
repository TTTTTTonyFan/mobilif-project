#!/bin/bash

# 强制IPv4网络配置脚本
echo "🔧 配置强制IPv4网络环境..."

# 清除所有代理设置
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
npm config delete proxy 2>/dev/null || true
npm config delete https-proxy 2>/dev/null || true

# 设置Node.js使用IPv4优先
export NODE_OPTIONS="--dns-result-order=ipv4first"

# 禁用IPv6（临时）
# sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
# sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1

echo "✅ IPv4网络配置完成"
echo "💡 运行 'npm run mp:ipv4' 使用IPv4-only预览"
