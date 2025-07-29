#!/bin/bash

# MobiLiF iOS模拟器完整启动脚本

echo "🍎 MobiLiF iOS模拟器启动工具"
echo "================================"

# 项目根目录
PROJECT_ROOT="$(dirname "$0")/.."
cd "$PROJECT_ROOT"

# 设备配置
DEVICE_UUID="C59B25AF-F625-44CE-9CEC-0588D7B0D82B"  # iPhone 16 Pro
DEVICE_NAME="iPhone 16 Pro"
MOBILIF_URL="http://localhost:8080"

echo "📱 设备: $DEVICE_NAME"
echo "🌐 访问地址: $MOBILIF_URL"
echo ""

# 步骤1: 启动MobiLiF服务器
echo "🚀 步骤1: 启动MobiLiF本地服务器..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ 服务器已在运行"
else
    echo "   正在启动服务器..."
    # 后台启动服务器
    node mobile-simulator/start-simulator.js > mobilif-server.log 2>&1 &
    SERVER_PID=$!
    echo "   服务器PID: $SERVER_PID"
    
    # 等待服务器启动
    for i in {1..10}; do
        if curl -s "http://localhost:8080" > /dev/null 2>&1; then
            echo "✅ 服务器启动成功"
            break
        fi
        echo "   等待服务器启动... ($i/10)"
        sleep 2
    done
fi

# 步骤2: 启动iOS模拟器
echo ""
echo "📱 步骤2: 启动iOS模拟器..."
xcrun simctl boot "$DEVICE_UUID" 2>/dev/null || echo "   设备可能已在运行"
open -a Simulator

# 等待模拟器完全启动
echo "   等待模拟器完全启动..."
for i in {1..15}; do
    if xcrun simctl list devices | grep "$DEVICE_UUID" | grep -q "Booted"; then
        echo "✅ iOS模拟器启动成功"
        break
    fi
    echo "   启动中... ($i/15)"
    sleep 2
done

# 步骤3: 在模拟器中打开Safari
echo ""
echo "🌐 步骤3: 在iOS模拟器中打开Safari..."
sleep 2

# 先打开Safari
xcrun simctl openurl "$DEVICE_UUID" "http://www.apple.com" 2>/dev/null
sleep 2

# 再打开MobiLiF
xcrun simctl openurl "$DEVICE_UUID" "$MOBILIF_URL"

echo ""
echo "🎉 启动完成！"
echo ""
echo "📱 iOS模拟器: $DEVICE_NAME 已启动"
echo "🌐 MobiLiF已在Safari中打开: $MOBILIF_URL"
echo ""
echo "💡 使用说明:"
echo "• 可以像真实iPhone一样进行触摸操作"
echo "• 支持滑动、点击、多点触控等手势"
echo "• Device菜单可调整屏幕方向、模拟摇晃等"
echo "• Safari开发菜单可进行网页调试"
echo ""
echo "🔧 调试功能:"
echo "• 桌面Safari → 开发 → 模拟器 → 网页调试"
echo "• 模拟器 → Device → Rotate 旋转屏幕"
echo "• 模拟器 → Device → Home 返回主屏幕"
echo ""
echo "📋 快捷命令:"
echo "• npm run ios        - 启动iOS模拟器"
echo "• npm run xcode      - 启动Xcode模拟器"  
echo "• npm run ios-simulator - 完整启动流程"
echo ""

# 显示服务器日志（如果有的话）
if [ -f "mobilif-server.log" ]; then
    echo "📄 服务器日志:"
    tail -5 mobilif-server.log
fi

echo ""
echo "按任意键退出此脚本（服务器将继续运行）..."
read -n 1