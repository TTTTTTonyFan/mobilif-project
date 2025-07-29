#!/bin/bash

# MobiLiF 快速iOS测试脚本
# 一键启动iOS模拟器并打开MobiLiF

echo "🍎 快速启动iOS模拟器测试MobiLiF..."

# 使用iPhone 16 Pro (最常用的开发设备)
DEVICE_UUID="C59B25AF-F625-44CE-9CEC-0588D7B0D82B"
MOBILIF_URL="http://localhost:8080"

# 1. 启动iOS模拟器 (后台)
echo "📱 启动iPhone 16 Pro模拟器..."
xcrun simctl boot "$DEVICE_UUID" 2>/dev/null || true
open -a Simulator

# 2. 启动MobiLiF服务器 (如果未运行)
if ! lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "🚀 启动MobiLiF服务器..."
    cd "$(dirname "$0")/.."
    npm run mobile-simulator > /dev/null 2>&1 &
    sleep 3
fi

# 3. 在模拟器中打开Safari访问MobiLiF
echo "🌐 在iOS模拟器中打开MobiLiF..."
sleep 2
xcrun simctl openurl "$DEVICE_UUID" "$MOBILIF_URL"

echo "✅ 完成！MobiLiF已在iPhone 16 Pro模拟器中打开"
echo "💡 可以像真实iPhone一样进行操作测试"