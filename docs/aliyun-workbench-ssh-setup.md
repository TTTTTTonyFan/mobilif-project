# 阿里云Workbench SSH配置详细步骤

## 📋 概述
本指南详细说明如何通过阿里云Workbench连接到服务器并配置SSH公钥。

## 🚀 步骤一：连接到Workbench

### 1.1 打开Workbench
1. **在ECS实例列表中**，找到IP为 `8.147.235.48` 的服务器
2. **点击实例右侧**的"远程连接"按钮
3. **在弹出菜单中选择** "Workbench远程连接"
4. **等待连接加载**（首次可能需要1-2分钟）

### 1.2 登录服务器
1. **在Workbench界面中**会看到一个终端窗口
2. **如果需要登录**，输入：
   - 用户名：`root`
   - 密码：服务器的root密码
3. **看到命令提示符** `[root@instance-name ~]#` 表示登录成功

## 🔧 步骤二：配置SSH公钥

### 2.1 创建SSH目录
在Workbench终端中执行：

```bash
# 创建.ssh目录
mkdir -p ~/.ssh

# 设置目录权限
chmod 700 ~/.ssh

# 查看目录是否创建成功
ls -la ~/
```

预期输出应包含：
```
drwx------   2 root root  4096 Jul 28 14:00 .ssh
```

### 2.2 创建authorized_keys文件
```bash
# 创建authorized_keys文件
touch ~/.ssh/authorized_keys

# 设置文件权限
chmod 600 ~/.ssh/authorized_keys

# 查看文件权限
ls -la ~/.ssh/
```

### 2.3 添加SSH公钥

**方法A：使用echo命令（推荐）**

1. **执行以下命令**：
```bash
echo 'YOUR_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys
```

**注意**：将 `YOUR_PUBLIC_KEY_HERE` 替换为你在第一步复制的完整公钥内容。

完整示例：
```bash
echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC7UCjPlxT+wC9oK0b8Jkx+I1MzRjS+BpHPsuExdXov2U9pAqBeT4nCVpPEVVq74x/+R5dcdHMQJmed9cLlno/PtKUnkowifJqcPJktTq1RCLlN5sXr+IHhSoFMwFqRU7ij3uwDcWsg7Tlkh8bCyz8oBSmetV+W7GsaXAmXrw3ayb5rgII6uUB0LimDx+dLoICch0sdK59h6wKxwQ87m8mhBCxmOBDurI+ZT5Snd8OkWjfJU5qkahGQiFoy0twkOILsX4uV0adW2y3ng36wVsGiVPObvfzCpaCTT2q8U4HVVpzeP2O2ioSQVj6ToLkc1M6Tq7gXkh5ekI3DewClIj6qfatLuxdQcbfAuPtHghWoa/0PzgViziV/XxRNg7m7wWpbOZbnPiHGX3g+7S3RbxORp0Gjtq98G2PFXVFXXMZaVsYy95okjvE7vTuIOGjfHI5qDsjVi6UwuqdHEjyvQX0HX0qrduBJH4+w07CWFTRp5DIp0QEKEpRrVPLqguuJJLaxOLKiXGkYXTqzfj+Tz/qScGRVlQ6uBIinhT6/PRGEWbzscu7cl3Vabg+jjXheLaYG87QN9eD6cgPGonVkNbAS1YAg/zni6tvcbtfScGO8Nf8XVRjSruYwbQ44Uu9VDCnFKWnW8aceNkt4K4cTXwit2RoqZe8+0KzLhFFsGnWTeQ== mobilif-project-20250728' >> ~/.ssh/authorized_keys
```

**方法B：使用vim编辑器**

1. **打开vim编辑器**：
```bash
vim ~/.ssh/authorized_keys
```

2. **按 `i` 进入插入模式**
3. **粘贴你的公钥内容**
4. **按 `Esc` 退出插入模式**
5. **输入 `:wq` 并按回车保存退出**

### 2.4 验证公钥配置
```bash
# 查看authorized_keys文件内容
cat ~/.ssh/authorized_keys

# 检查文件权限
ls -la ~/.ssh/authorized_keys

# 应该显示：-rw------- 1 root root [文件大小] [日期] authorized_keys
```

### 2.5 设置文件所有者
```bash
# 确保所有权正确
chown -R root:root ~/.ssh

# 最终权限检查
ls -la ~/.ssh/
```

预期输出：
```
total 12
drwx------  2 root root 4096 Jul 28 14:00 .
drwx------  8 root root 4096 Jul 28 14:00 ..
-rw-------  1 root root  738 Jul 28 14:00 authorized_keys
```

## ⚙️ 步骤三：验证SSH服务配置

### 3.1 检查SSH配置
```bash
# 查看SSH配置中的关键设置
grep -E "(PubkeyAuthentication|PasswordAuthentication|PermitRootLogin)" /etc/ssh/sshd_config
```

### 3.2 如需修改SSH配置（通常不需要）
```bash
# 备份原配置文件
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# 编辑配置文件
vim /etc/ssh/sshd_config
```

确保包含以下配置：
```
PubkeyAuthentication yes
PermitRootLogin yes
AuthorizedKeysFile .ssh/authorized_keys
```

### 3.3 重启SSH服务
```bash
# 测试配置文件语法
sshd -t

# 如果没有错误，重启SSH服务
systemctl restart sshd

# 查看SSH服务状态
systemctl status sshd
```

## 🧪 步骤四：测试SSH连接

### 4.1 在本地测试连接
回到本地终端，执行：

```bash
# 测试SSH连接
ssh -i ~/.ssh/mobilif_rsa root@8.147.235.48

# 如果成功，你会看到服务器的欢迎信息和命令提示符
```

### 4.2 使用项目脚本测试
```bash
# 使用项目的测试脚本
./scripts/fix-ssh-connection.sh --test

# 成功时会显示：✅ SSH连接测试成功!
```

## 🎯 Workbench使用技巧

### 复制粘贴操作
- **复制**：在Workbench中选中文本后自动复制
- **粘贴**：右键点击或 Ctrl+V（在某些浏览器中）
- **多行粘贴**：可以直接粘贴多行命令

### 终端快捷键
- **Ctrl+C**：中断当前命令
- **Ctrl+L**：清屏
- **Tab**：自动完成命令/文件名
- **上下箭头**：浏览命令历史

### 文件编辑
- **vim编辑器**：
  - `i` - 进入插入模式
  - `Esc` - 退出插入模式
  - `:w` - 保存
  - `:q` - 退出
  - `:wq` - 保存并退出
  - `:q!` - 强制退出不保存

- **nano编辑器**（更简单）：
```bash
nano ~/.ssh/authorized_keys
# Ctrl+X 退出，Y 确认保存，Enter 确认文件名
```

## ❌ 常见问题解决

### 问题1：Workbench连接失败
**解决方案**：
1. 刷新浏览器页面重试
2. 检查实例状态是否为"运行中"
3. 尝试使用不同浏览器
4. 清除浏览器缓存

### 问题2：无法粘贴公钥
**解决方案**：
1. 确保公钥内容完整（从ssh-rsa开始）
2. 检查浏览器是否阻止了粘贴操作
3. 尝试分段粘贴长公钥
4. 使用vim编辑器手动输入

### 问题3：权限设置错误
**解决方案**：
```bash
# 重新设置所有权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chown -R root:root ~/.ssh
```

### 问题4：SSH服务重启失败
**解决方案**：
```bash
# 检查配置文件语法
sshd -t

# 查看详细错误信息
journalctl -u sshd -n 20

# 恢复备份配置
cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
systemctl restart sshd
```

## ✅ 成功验证清单

配置完成后，确认以下几点：

- [ ] `.ssh` 目录权限为 700
- [ ] `authorized_keys` 文件权限为 600  
- [ ] 公钥内容完整且格式正确
- [ ] SSH服务运行正常
- [ ] 本地可以成功连接服务器

## 📝 配置完成后的操作

1. **测试连接**：
```bash
ssh mobilif-server
```

2. **运行项目部署**：
```bash
npm run server:status
npm run server:deploy
```

3. **设置定期备份**：
```bash
# 备份SSH配置
cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup
```

## 📞 获取帮助

如果遇到问题，可以：

1. **查看项目文档**：
   - `docs/ssh-troubleshooting-guide.md`
   - `docs/development-workflow.md`

2. **使用项目脚本**：
```bash
./scripts/fix-ssh-connection.sh --diagnose
./scripts/ssh-backup-methods.sh --help
```

3. **联系技术支持**：
   - 阿里云技术支持：95187
   - 查看阿里云官方文档

---

**提示**：完成配置后，建议立即测试SSH连接，确保配置正确无误。