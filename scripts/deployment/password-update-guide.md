# MobiLiF 数据库密码更新指南

## 概述

本指南用于将MobiLiF项目的数据库密码从旧密码更新为新密码 `MobiLiF@2025!`

## 已更新的配置文件

以下配置文件中的数据库密码已更新：

### 1. 环境配置文件
- ✅ `.env.production` - 生产环境配置
- ✅ `src/config/database.js` - 数据库连接配置

### 2. 数据库初始化脚本
- ✅ `src/database/init.sql` - 主数据库初始化脚本
- ✅ `scripts/deployment/init-database.sql` - 部署用初始化脚本

### 3. Docker配置
- ✅ `config/production/docker-compose.production.yml` - Docker Compose生产配置

### 4. 部署脚本
- ✅ `scripts/deployment/quick-setup.sh` - 快速部署脚本

## 服务器端操作步骤

### 步骤1: 连接到阿里云服务器

```bash
ssh root@8.147.235.48
```

### 步骤2: 备份当前数据库（重要！）

```bash
# 创建备份目录
mkdir -p /opt/mobilif/backups/$(date +%Y%m%d_%H%M%S)

# 备份数据库
mysqldump -u root -p mobilif > /opt/mobilif/backups/$(date +%Y%m%d_%H%M%S)/mobilif_backup.sql
```

### 步骤3: 更新数据库用户密码

```bash
# 下载密码更新脚本
cd /opt/mobilif
wget https://raw.githubusercontent.com/TTTTTTonyFan/mobilif-project/main/scripts/deployment/update-database-password.sql

# 执行密码更新（需要输入当前root密码）
mysql -u root -p < scripts/deployment/update-database-password.sql
```

或者手动执行：

```sql
-- 连接到MySQL
mysql -u root -p

-- 执行密码更新
ALTER USER 'mobilif_user'@'%' IDENTIFIED BY 'MobiLiF@2025!';
ALTER USER 'mobilif_readonly'@'%' IDENTIFIED BY 'MobiLiF@2025!';
FLUSH PRIVILEGES;

-- 验证更新
SELECT User, Host FROM mysql.user WHERE User LIKE 'mobilif%';
```

### 步骤4: 更新应用配置

```bash
# 进入项目目录
cd /opt/mobilif

# 拉取最新配置
git pull origin main

# 重新部署服务
docker-compose down
docker-compose up -d
```

### 步骤5: 验证连接

```bash
# 测试数据库连接
mysql -u mobilif_user -p'MobiLiF@2025!' -h localhost mobilif -e "SELECT 'Connection successful' as status;"

# 检查应用日志
docker-compose logs mobilif-backend
```

## 验证脚本

项目中包含以下验证脚本：

### 本地验证（检查配置文件）
```bash
node scripts/verify-password-update.js
```

### 数据库连接测试
```bash
node scripts/test-db-connection.js
```

## 新密码信息

- **新密码**: `MobiLiF@2025!`
- **适用用户**: 
  - `mobilif_user` (主应用用户)
  - `mobilif_readonly` (只读用户)
  - `mobilif_app` (应用用户)
  - `mobilif_read` (读取用户)
  - `mobilif_backup` (备份用户)

## 重要注意事项

1. **备份优先**: 在执行任何密码更改之前，请务必备份数据库
2. **服务停机**: 更新密码时建议暂停应用服务，避免连接错误
3. **配置同步**: 确保所有配置文件中的密码保持一致
4. **权限验证**: 更新后验证所有数据库操作是否正常
5. **日志监控**: 更新后监控应用日志，确保没有连接错误

## 回滚方案

如果更新过程中遇到问题，可以执行以下回滚操作：

```sql
-- 恢复到原密码（如果需要）
ALTER USER 'mobilif_user'@'%' IDENTIFIED BY '原密码';
ALTER USER 'mobilif_readonly'@'%' IDENTIFIED BY '原密码';
FLUSH PRIVILEGES;
```

## 联系信息

如果在密码更新过程中遇到问题，请联系技术支持。

---

**更新日期**: 2025-07-28  
**版本**: 1.0  
**适用于**: MobiLiF v1.0+