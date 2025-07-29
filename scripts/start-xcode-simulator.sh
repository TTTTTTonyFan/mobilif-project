#!/bin/bash

# MobiLiF Xcode iPhone模拟器启动脚本
# 自动启动iPhone模拟器并打开MobiLiF应用

echo "🍎 启动Xcode iPhone模拟器..."
echo "==============================="

# 检查Xcode是否已安装
if ! command -v xcrun &> /dev/null; then
    echo "❌ 未检测到Xcode，请先安装Xcode"
    echo "💡 下载地址: https://developer.apple.com/xcode/"
    exit 1
fi

# 默认配置
DEFAULT_DEVICE="iPhone 15"
APP_URL="http://localhost:3000"
INTERACTIVE=true

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --device)
      DEFAULT_DEVICE="$2"
      shift 2
      ;;
    --url)
      APP_URL="$2"
      shift 2
      ;;
    --non-interactive)
      INTERACTIVE=false
      shift
      ;;
    --help|-h)
      echo "使用方法: $0 [选项]"
      echo ""
      echo "选项:"
      echo "  --device DEVICE        指定模拟器设备 (默认: iPhone 15)"
      echo "  --url URL             指定应用URL (默认: http://localhost:3000)"
      echo "  --non-interactive     非交互模式，适用于工作流集成"
      echo "  --help, -h            显示帮助信息"
      echo ""
      echo "常用设备名称:"
      echo "  iPhone 15, iPhone 15 Pro, iPhone 14, iPhone SE (3rd generation)"
      exit 0
      ;;
    *)
      echo "未知参数: $1"
      exit 1
      ;;
  esac
done

echo "🎯 使用设备: $DEFAULT_DEVICE"
echo "🌐 应用地址: $APP_URL"
echo ""

# 显示可用设备（仅在交互模式下）
if [ "$INTERACTIVE" = true ]; then
    echo "📱 可用的iOS模拟器设备:"
    xcrun simctl list devices iOS | grep -E "iPhone.*\(" | head -5
    echo ""
fi

# 查找可用设备UDID - 优先查找指定设备，否则使用第一个可用的iPhone
DEVICE_UDID=$(xcrun simctl list devices | grep "$DEFAULT_DEVICE" | grep -v "unavailable" | head -1 | awk -F'[()]' '{print $(NF-1)}')

if [ -z "$DEVICE_UDID" ]; then
    echo "⚠️ 未找到设备: $DEFAULT_DEVICE，尝试使用第一个可用的iPhone..."
    DEVICE_UDID=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -1 | awk -F'[()]' '{print $(NF-1)}')
    
    if [ -z "$DEVICE_UDID" ]; then
        echo "❌ 未找到任何可用的iPhone模拟器"
        echo "💡 请在Xcode中创建iOS模拟器设备"
        exit 1
    fi
    
    # 获取实际设备名称
    ACTUAL_DEVICE=$(xcrun simctl list devices | grep "$DEVICE_UDID" | awk -F'[()]' '{print $1}' | xargs)
    echo "✅ 使用设备: $ACTUAL_DEVICE"
fi

echo "📱 设备UDID: $DEVICE_UDID"

# 检查设备状态并启动
DEVICE_STATE=$(xcrun simctl list devices | grep "$DEVICE_UDID" | awk -F'[()]' '{print $(NF-2)}' | xargs)
echo "📊 设备状态: $DEVICE_STATE"

if [ "$DEVICE_STATE" != "Booted" ]; then
    echo "🚀 启动模拟器设备..."
    xcrun simctl boot "$DEVICE_UDID"
    
    echo "⏳ 等待设备启动..."
    sleep 5
    
    echo "📱 打开模拟器应用..."
    open -a Simulator
    
    sleep 3
else
    echo "✅ 设备已在运行中"
fi

# 检查本地服务器状态
echo "🔍 检查本地服务器状态..."
if curl -f "$APP_URL/health" &> /dev/null; then
    echo "✅ 本地服务器运行正常"
elif curl -f "$APP_URL" &> /dev/null; then
    echo "✅ 本地服务器运行正常 (无健康检查端点)"
else
    echo "⚠️ 本地服务器未运行"
    
    if [ "$INTERACTIVE" = true ]; then
        echo "💡 请先启动后端服务: npm run start:dev"
        echo ""
        read -p "是否继续打开模拟器? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "⚠️ 继续打开模拟器，但应用可能无法正常加载"
    fi
fi

# 在模拟器中打开应用
echo "🌐 在模拟器中打开MobiLiF应用..."
xcrun simctl openurl "$DEVICE_UDID" "$APP_URL"

# 等待页面加载
sleep 2

echo ""
echo "✅ iPhone模拟器启动完成！"
echo "==============================="
echo "📱 设备: $DEFAULT_DEVICE"
echo "🌐 应用URL: $APP_URL"
echo "🎯 模拟器UDID: $DEVICE_UDID"
echo ""
echo "🔧 模拟器控制:"
echo "  • 按 Cmd+Shift+H 回到主屏幕"
echo "  • 按 Cmd+R 刷新页面"
echo "  • 按 Cmd+K 切换键盘"
echo "  • 按 Cmd+1/2/3 切换缩放级别"
echo ""
echo "📊 开发者工具:"
echo "  • Safari开发菜单: 开发 > Simulator > iPhone"
echo "  • 或在Safari中访问: $APP_URL"
echo ""

# 在非交互模式下不询问Safari
if [ "$INTERACTIVE" = true ]; then
    read -p "是否在Safari中同时打开开发者工具? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔧 打开Safari开发者工具..."
        if ! pgrep -f "Safari" > /dev/null; then
            echo "🌍 启动Safari..."
            open -a Safari "$APP_URL"
            sleep 2
        else
            echo "🌍 Safari已在运行，打开新标签..."
            osascript -e "tell application \"Safari\" to make new document with properties {URL:\"$APP_URL\"}"
        fi
        
        echo "💡 请在Safari中通过以下步骤打开开发者工具:"
        echo "   1. 菜单栏 > 开发 > Simulator > iPhone"
        echo "   2. 或者使用快捷键 Option+Cmd+I"
    fi
fi

echo ""
echo "🎉 准备就绪！您现在可以在iPhone模拟器中测试MobiLiF应用了"

# 非交互模式下返回设备信息
if [ "$INTERACTIVE" = false ]; then
    echo ""
    echo "DEVICE_UDID=$DEVICE_UDID"
    echo "APP_URL=$APP_URL"
    echo "STATUS=SUCCESS"
fi