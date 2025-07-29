-- MobiLiF数据库密码更新脚本
-- 在阿里云服务器上执行，将所有数据库用户密码更新为新密码
-- 执行方式: mysql -u root -p < update-database-password.sql

-- 设置字符集
SET NAMES utf8mb4;

-- 更新数据库用户密码
-- 注意：需要使用当前root密码登录

-- 更新主应用用户密码
ALTER USER 'mobilif_user'@'%' IDENTIFIED BY 'MobiLiF@2025!';

-- 更新只读用户密码  
ALTER USER 'mobilif_readonly'@'%' IDENTIFIED BY 'MobiLiF@2025!';

-- 如果存在其他用户，也需要更新
ALTER USER IF EXISTS 'mobilif_app'@'%' IDENTIFIED BY 'MobiLiF@2025!';
ALTER USER IF EXISTS 'mobilif_read'@'%' IDENTIFIED BY 'MobiLiF@2025!';
ALTER USER IF EXISTS 'mobilif_backup'@'%' IDENTIFIED BY 'MobiLiF@2025!';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证用户是否存在和权限
SELECT User, Host, plugin, authentication_string FROM mysql.user WHERE User LIKE 'mobilif%';

-- 显示完成信息
SELECT 'MobiLiF数据库用户密码更新完成！' as message;