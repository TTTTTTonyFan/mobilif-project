# 🍎 Xcode iPhone模拟器工作流集成

## 概述

MobiLiF项目现在完全集成了Xcode iPhone模拟器，提供真实的iOS环境进行功能测试。新的开发工作流包括：

1. **开发** → 2. **启动本地服务** → 3. **iPhone模拟器展示** → 4. **手动测试** → 5. **自动化测试** → 6. **GitHub同步**

## 🚀 快速开始

### 基本要求
- macOS系统
- 已安装Xcode或CommandLineTools
- 本地MobiLiF项目环境

### 启动完整工作流
```bash
# 运行开发工作流（交互模式）
npm run workflow:dev "作为用户，我希望查看健身房列表"

# 或者非交互模式
npm run workflow:dev "用户故事内容" -- --skip-interaction
```

### 独立启动iPhone模拟器
```bash
# 使用默认设备（iPhone 15）
npm run ios-simulator

# 指定设备型号
npm run xcode -- --device "iPhone 15 Pro"

# 指定应用URL
npm run ios -- --url "http://localhost:3000"
```

## 📱 工作流步骤详解

### 1. 解析用户故事
- 自动分析用户故事
- 识别业务域和技术任务
- 估算工作量和优先级

### 2. 生成和集成代码
- 基于用户故事生成技术任务
- 自动生成代码模板
- 集成到现有项目结构

### 3. 启动本地服务
- 检查数据库连接状态
- 验证后端服务运行状态
- 确保API接口可用

### 4. 部署到iPhone模拟器
- 自动启动iPhone模拟器
- 在模拟器中打开MobiLiF应用
- 提供测试建议和调试工具

### 5. 手动测试确认
- 在真实iOS环境中测试新功能
- 验证UI显示和交互体验
- 确认功能符合预期

### 6. 生成开发报告
- 记录整个开发流程
- 生成详细的测试报告
- 为后续流程提供状态信息

## 🧪 测试建议

### 功能测试
- **📱 触摸操作测试**: 点击、滑动、长按等手势
- **🔄 设备旋转测试**: 竖屏/横屏切换适配
- **📶 网络状态测试**: 模拟弱网和离线环境
- **🔋 性能测试**: 内存使用和电池消耗
- **📐 适配测试**: 不同屏幕尺寸适配

### UI/UX测试
- 界面元素正确显示
- 字体大小和颜色符合设计
- 动画效果流畅自然
- 加载状态提示清晰

### 交互测试
- 按钮响应及时
- 表单输入验证正确
- 导航流程顺畅
- 错误处理友好

## 🔧 调试工具

### Safari开发者工具
1. 在iPhone模拟器中打开Safari
2. 在Mac Safari中：开发 → Simulator → iPhone
3. 可以检查元素、调试JavaScript、查看网络请求

### Xcode调试
1. 打开Xcode
2. Window → Devices and Simulators
3. 选择模拟器设备进行高级调试

### 性能监控
1. Xcode → Open Developer Tool → Instruments
2. 选择性能分析模板
3. 监控CPU、内存、网络等性能指标

## ⚡ 快捷键

### 模拟器控制
- **Cmd+Shift+H**: 回到主屏幕
- **Cmd+R**: 刷新当前页面
- **Cmd+K**: 切换软键盘显示
- **Cmd+1/2/3**: 切换缩放级别

### 设备模拟
- **Device → Rotate Left/Right**: 旋转设备
- **Device → Shake**: 摇晃设备
- **Device → Background App Refresh**: 模拟后台刷新
- **Device → Lock**: 锁定设备

## 📋 命令参考

### 模拟器管理
```bash
# 查看可用设备
xcrun simctl list devices

# 启动指定设备
xcrun simctl boot <UDID>

# 关闭指定设备
xcrun simctl shutdown <UDID>

# 在模拟器中打开URL
xcrun simctl openurl <UDID> <URL>

# 截取屏幕截图
xcrun simctl io <UDID> screenshot screenshot.png
```

### 工作流命令
```bash
# 完整开发工作流
npm run workflow:dev "用户故事"

# 仅启动iPhone模拟器
npm run ios-simulator

# 运行自动化测试
npm run test:all

# 测试Xcode集成
node scripts/test-xcode-integration.js
```

## 🛠️ 故障排除

### Xcode不可用
```bash
# 安装CommandLineTools
xcode-select --install

# 检查安装状态
xcode-select -p
```

### 模拟器启动失败
1. 确保Xcode已正确安装
2. 重启Simulator应用
3. 清除模拟器缓存：Device → Erase All Content and Settings

### 网络连接问题
1. 检查本地服务器是否运行：`curl http://localhost:3000/health`
2. 确认防火墙设置允许localhost连接
3. 尝试重启本地服务器

### Safari开发者工具不显示
1. 在Mac Safari中启用开发菜单：Safari → 偏好设置 → 高级 → 显示开发菜单
2. 在iPhone模拟器中启用Web检查器：设置 → Safari → 高级 → Web检查器

## 📊 工作流状态

当前工作流状态：
- ✅ Xcode iPhone模拟器集成完成
- ✅ 开发工作流更新完成
- ✅ 手动测试流程建立
- 🔄 待完成：自动化测试整合
- 🔄 待完成：GitHub同步机制
- 🔄 待完成：微信开发工具部署

## 📞 获取帮助

如果遇到问题，可以：
1. 查看错误日志和报告文件
2. 运行诊断命令：`node scripts/test-xcode-integration.js`
3. 检查CLAUDE.md中的配置说明
4. 参考Apple官方Simulator文档