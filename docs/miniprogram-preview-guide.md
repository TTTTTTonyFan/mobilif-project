# 微信小程序预览指南

## 🎯 概述

本指南帮助你在开发完功能后正常在微信开发工具上预览小程序。

## ✅ 配置状态

- **AppID**: `wx0a950fd30b3c2146`
- **私钥文件**: ✅ 已配置 (`config/keys/private.wx0a950fd30b3c2146.key`)
- **IP白名单**: ✅ 已匹配 (`115.171.9.126`)
- **miniprogram-ci**: ✅ 已安装

## 🚀 快速使用

### 方法1: npm命令（推荐）

```bash
# 检查配置状态
npm run mp:check

# 生成预览二维码
npm run mp:preview

# 自定义描述的预览
npm run mp:preview "新增用户登录功能"
```

### 方法2: 直接使用脚本

```bash
# 检查IP白名单
node scripts/miniprogram-ci.js check-ip

# 生成预览
node scripts/miniprogram-ci.js preview

# 上传版本
node scripts/miniprogram-ci.js upload "1.0.1" "修复登录bug"
```

## 📱 预览流程

### 1. 生成预览二维码
```bash
npm run mp:preview "功能描述"
```

执行后会：
- ✅ 检查配置和权限
- ✅ 生成预览二维码
- ✅ 保存到 `preview-qr-code.png`

### 2. 手机扫码预览
1. 用微信扫描生成的二维码
2. 在手机上预览小程序效果
3. 测试功能和界面是否正常

### 3. 确认并上传
如果预览效果满意，可以上传正式版本：
```bash
npm run mp:upload "版本号" "版本描述"
```

## 🔧 配置详情

### 项目配置文件
位置: `config/miniprogram-config.json`

```json
{
  "appid": "wx0a950fd30b3c2146",
  "projectPath": "/Users/tonyfan/WeChatProjects/miniprogram-1",
  "privateKeyPath": "/Users/tonyfan/Desktop/mobilif-project/config/keys/private.wx0a950fd30b3c2146.key",
  "ipWhitelist": "115.171.9.126",
  "robot": 1,
  "setting": {
    "es6": true,
    "es7": true,
    "minify": false,
    "uploadWithSourceMap": true
  }
}
```

### 私钥文件
- **位置**: `config/keys/private.wx0a950fd30b3c2146.key`
- **状态**: ✅ 已存在
- **权限**: 仅开发团队可访问

### IP白名单配置
- **当前IP**: `115.171.9.126`
- **白名单IP**: `115.171.9.126`
- **状态**: ✅ 匹配

## 📋 完整工作流程

### 开发阶段
1. 开发功能代码
2. 本地测试确认
3. 运行 `npm run mp:check` 检查配置

### 预览阶段
1. 运行 `npm run mp:preview "功能描述"`
2. 微信扫码在手机上预览
3. 确认功能和界面正常

### 发布阶段
1. 运行 `npm run mp:upload "版本号" "版本描述"`
2. 登录微信公众平台查看版本
3. 提交审核并发布

## 🛠️ 故障排除

### 常见问题

#### 1. 私钥文件错误
```
❌ 私钥文件不存在
```
**解决方案**:
- 确认文件路径: `config/keys/private.wx0a950fd30b3c2146.key`
- 从微信公众平台重新下载私钥

#### 2. IP白名单不匹配
```
⚠️ IP地址不匹配白名单
```
**解决方案**:
1. 登录微信公众平台 (mp.weixin.qq.com)
2. 进入 开发 → 开发管理 → 开发设置
3. 在"小程序代码上传"部分添加当前IP

#### 3. 项目路径不存在
```
⚠️ 小程序项目路径不存在
```
**解决方案**:
- 运行配置向导: `node scripts/setup-miniprogram.js`
- 或手动修改 `config/miniprogram-config.json` 中的路径

### 获取帮助
```bash
# 显示帮助信息
node scripts/miniprogram-ci.js help

# 运行配置向导
node scripts/setup-miniprogram.js
```

## 📊 技术详情

### 支持的功能
- ✅ 预览二维码生成
- ✅ 版本上传
- ✅ IP白名单检查
- ✅ 配置验证
- ✅ 错误诊断

### 机器人配置
- **开发环境**: 机器人1
- **测试环境**: 机器人2
- **预发布**: 机器人3
- **生产环境**: 机器人30

### 输出文件
- **预览二维码**: `preview-qr-code.png`
- **配置文件**: `config/miniprogram-config.json`
- **私钥文件**: `config/keys/private.wx0a950fd30b3c2146.key`

---

🎉 **现在你可以正常预览和发布微信小程序了！**

有任何问题请查看故障排除部分或运行 `npm run mp:check` 进行诊断。