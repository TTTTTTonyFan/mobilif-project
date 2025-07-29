#!/usr/bin/env node

/**
 * 数据库连接测试脚本
 * 验证更新后的密码配置是否正确
 */

const mysql = require('mysql2/promise');

// 测试配置
const testConfigs = {
  localhost: {
    host: 'localhost',
    port: 3306,
    user: 'mobilif_app',
    password: 'MobiLiF@2025!',
    database: 'mobilif',
    charset: 'utf8mb4'
  },
  production: {
    host: '8.147.235.48',
    port: 3306,
    user: 'mobilif_user',
    password: 'MobiLiF@2025!',
    database: 'mobilif',
    charset: 'utf8mb4'
  },
  readonly: {
    host: '8.147.235.48',
    port: 3306,
    user: 'mobilif_readonly',
    password: 'MobiLiF@2025!',
    database: 'mobilif',
    charset: 'utf8mb4'
  }
};

/**
 * 测试数据库连接
 */
async function testConnection(name, config) {
  console.log(`\n🔍 测试 ${name} 连接...`);
  console.log(`   主机: ${config.host}:${config.port}`);
  console.log(`   用户: ${config.user}`);
  console.log(`   数据库: ${config.database}`);
  
  try {
    const connection = await mysql.createConnection(config);
    
    // 测试基本连接
    await connection.ping();
    console.log(`   ✅ 连接成功`);
    
    // 测试基本查询
    const [rows] = await connection.execute('SELECT NOW() as current_time, VERSION() as version');
    console.log(`   ✅ 查询成功`);
    console.log(`   📅 服务器时间: ${rows[0].current_time}`);
    console.log(`   🔢 MySQL版本: ${rows[0].version}`);
    
    // 测试数据库权限
    try {
      const [databases] = await connection.execute('SHOW DATABASES');
      console.log(`   ✅ 权限检查通过，可访问 ${databases.length} 个数据库`);
    } catch (error) {
      console.log(`   ⚠️  权限受限: ${error.message}`);
    }
    
    await connection.end();
    return true;
    
  } catch (error) {
    console.log(`   ❌ 连接失败: ${error.message}`);
    
    // 提供详细错误信息
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(`   💡 建议: 检查用户名和密码是否正确`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   💡 建议: 检查数据库服务是否运行，端口是否正确`);
    } else if (error.code === 'ENOTFOUND') {
      console.log(`   💡 建议: 检查主机地址是否正确，网络是否可达`);
    }
    
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🔧 MobiLiF 数据库连接测试');
  console.log('='.repeat(60));
  
  const results = {};
  
  // 测试所有配置
  for (const [name, config] of Object.entries(testConfigs)) {
    results[name] = await testConnection(name, config);
  }
  
  // 显示汇总结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));
  
  let successCount = 0;
  let totalCount = 0;
  
  for (const [name, success] of Object.entries(results)) {
    const status = success ? '✅ 通过' : '❌ 失败';
    console.log(`   ${name.padEnd(15)} : ${status}`);
    if (success) successCount++;
    totalCount++;
  }
  
  console.log(`\n🎯 总计: ${successCount}/${totalCount} 个连接测试通过`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 所有数据库连接配置正确！');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分数据库连接配置需要检查');
    process.exit(1);
  }
}

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('未处理的Promise拒绝:', error);
  process.exit(1);
});

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection, testConfigs };