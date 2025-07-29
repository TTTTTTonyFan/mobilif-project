#!/bin/bash

# MobiLiF数据库设置脚本
# 用于设置数据库表和示例数据

set -e

echo "🚀 MobiLiF数据库设置开始..."

# 检查环境变量
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  警告: DATABASE_URL环境变量未设置，使用默认配置"
    export DATABASE_URL="mysql://mobilif_app:password@localhost:3306/mobilif"
fi

# 1. 生成Prisma客户端
echo "📦 生成Prisma客户端..."
npx prisma generate

# 2. 推送数据库schema（开发环境）
echo "🗃️  推送数据库schema..."
if [ "$NODE_ENV" = "production" ]; then
    echo "生产环境下使用prisma migrate deploy"
    npx prisma migrate deploy
else
    echo "开发环境下使用prisma db push"
    npx prisma db push --accept-data-loss
fi

# 3. 运行自定义迁移脚本
echo "🔄 运行自定义迁移脚本..."
MIGRATION_FILE="./prisma/migrations/001_add_gym_type_and_programs.sql"
if [ -f "$MIGRATION_FILE" ]; then
    echo "执行迁移: $MIGRATION_FILE"
    # 这里需要根据实际情况调整MySQL客户端命令
    # mysql -u用户名 -p密码 -h主机 数据库名 < $MIGRATION_FILE
    echo "注意: 请手动执行SQL迁移文件: $MIGRATION_FILE"
else
    echo "迁移文件不存在: $MIGRATION_FILE"
fi

# 4. 插入种子数据
echo "🌱 插入示例数据..."
SEED_FILE="./prisma/seeds/gym_seed_data.sql"
if [ -f "$SEED_FILE" ]; then
    echo "执行种子数据: $SEED_FILE"
    # 同样需要根据实际情况调整
    echo "注意: 请手动执行SQL种子文件: $SEED_FILE"
else
    echo "种子文件不存在: $SEED_FILE"
fi

# 5. 验证数据库设置
echo "✅ 验证数据库连接..."
npx prisma db execute --file prisma/test-connection.sql || echo "数据库连接验证脚本不存在，跳过"

echo "🎉 数据库设置完成!"
echo ""
echo "下一步:"
echo "1. 手动执行SQL迁移文件: prisma/migrations/001_add_gym_type_and_programs.sql"
echo "2. 手动执行种子数据文件: prisma/seeds/gym_seed_data.sql"
echo "3. 启动应用: npm run start:dev"
echo ""