# 微信小程序 CI 上传配置指南

## 概述

要使用 `npm run workflow:miniprogram` 命令上传小程序到微信平台，需要先在微信公众平台配置 CI 功能并下载私钥文件。

## 第一步：获取小程序私钥

### 1. 登录微信公众平台
- 访问：https://mp.weixin.qq.com/
- 使用小程序管理员账号登录

### 2. 进入开发设置
- 左侧菜单：**开发** → **开发管理** → **开发设置**
- 找到 **小程序代码上传** 部分

### 3. 配置 IP 白名单
- 在 **小程序代码上传** 部分
- 点击 **配置** 按钮
- 添加你的服务器 IP 地址到白名单（如果是本地开发，添加你的公网 IP）

### 4. 生成上传密钥
- 点击 **生成** 按钮生成新的上传密钥
- 下载私钥文件（.key 文件）
- **重要**：私钥文件只能下载一次，请妥善保管

### 5. 保存私钥文件
将下载的私钥文件保存到项目中：
```bash
# 创建密钥目录
mkdir -p /Users/tonyfan/mobilif-project/config/keys

# 将私钥文件移动到项目中（假设下载的文件名为 private.wx0a950fd30b3c2146.key）
mv ~/Downloads/private.wx0a950fd30b3c2146.key /Users/tonyfan/mobilif-project/config/keys/
```

## 第二步：更新环境配置

编辑 `.env.miniprogram` 文件，添加私钥路径：

```bash
# 添加私钥文件路径
MINIPROGRAM_PRIVATE_KEY_PATH=/Users/tonyfan/mobilif-project/config/keys/private.wx0a950fd30b3c2146.key
```

## 第三步：运行上传命令

配置完成后，就可以使用以下命令上传小程序：

```bash
# 基本上传
npm run workflow:miniprogram -- --version "1.0.1" --desc "新增场馆列表功能"

# 完整参数上传
npm run workflow:miniprogram -- \
  --appid "wx0a950fd30b3c2146" \
  --private-key "/Users/tonyfan/mobilif-project/config/keys/private.wx0a950fd30b3c2146.key" \
  --project-path "/Users/tonyfan/WeChatProjects/miniprogram-1" \
  --version "1.0.1" \
  --desc "新增场馆列表功能"
```

## 第四步：生成预览二维码（可选）

```bash
# 生成预览二维码
npm run workflow:miniprogram -- \
  --version "1.0.1" \
  --desc "新增场馆列表功能" \
  --output "preview-qr-code.png"
```

## 常见问题

### 1. IP 白名单问题
- 错误信息：`IP not in whitelist`
- 解决方案：在微信公众平台添加当前 IP 到白名单

### 2. 私钥文件问题
- 错误信息：`private key not found`
- 解决方案：检查私钥文件路径是否正确，文件是否存在

### 3. 项目路径问题
- 错误信息：`project not found`
- 解决方案：确认小程序项目路径正确

### 4. AppID 不匹配
- 错误信息：`appid mismatch`
- 解决方案：确认 project.config.json 中的 appid 与配置一致

## 安全注意事项

1. **私钥保护**：
   - 私钥文件包含敏感信息，不要提交到代码库
   - 已添加到 `.gitignore` 中：`config/keys/`

2. **环境变量**：
   - `.env.miniprogram` 文件包含敏感信息，不要提交到代码库
   - 生产环境通过 CI/CD 系统注入环境变量

3. **权限控制**：
   - 只给必要的人员分配小程序管理权限
   - 定期更新上传密钥

## 后续步骤

上传成功后：

1. **在微信公众平台查看**：
   - 版本管理 → 开发版本
   - 查看上传的版本信息

2. **提交审核**：
   - 确认功能正常后，可以提交审核
   - 填写版本说明和功能描述

3. **发布上线**：
   - 审核通过后，发布为正式版本

## 相关命令

```bash
# 查看小程序配置
cat /Users/tonyfan/mobilif-project/config/miniprogram.config.js

# 查看环境变量
cat /Users/tonyfan/mobilif-project/.env.miniprogram

# 测试小程序项目结构
ls -la /Users/tonyfan/WeChatProjects/miniprogram-1/
```