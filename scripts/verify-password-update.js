#!/usr/bin/env node

/**
 * 数据库密码更新验证脚本
 * 检查所有配置文件中的密码是否已正确更新为新密码
 */

const fs = require('fs');
const path = require('path');

// 新密码
const NEW_PASSWORD = 'MobiLiF@2025!';

// 需要检查的文件和对应的密码字段
const configFiles = [
  {
    file: '.env.production',
    patterns: [
      { field: 'DB_PASSWORD', pattern: /DB_PASSWORD=(.+)/ },
      { field: 'DB_SLAVE_PASSWORD', pattern: /DB_SLAVE_PASSWORD=(.+)/ }
    ]
  },
  {
    file: 'src/config/database.js',
    patterns: [
      { field: 'Master DB Default Password', pattern: /configService\.get\('DB_PASSWORD',\s*'([^']+)'\)/ },
      { field: 'Slave DB Default Password', pattern: /configService\.get\('DB_SLAVE_PASSWORD',\s*'([^']+)'\)/ }
    ]
  },
  {
    file: 'src/database/init.sql',
    patterns: [
      { field: 'mobilif_app user', pattern: /'mobilif_app'@'%' IDENTIFIED BY '([^']+)'/ },
      { field: 'mobilif_read user', pattern: /'mobilif_read'@'%' IDENTIFIED BY '([^']+)'/ },
      { field: 'mobilif_backup user', pattern: /'mobilif_backup'@'%' IDENTIFIED BY '([^']+)'/ }
    ]
  },
  {
    file: 'scripts/deployment/init-database.sql',
    patterns: [
      { field: 'mobilif_user', pattern: /'mobilif_user'@'%' IDENTIFIED BY '([^']+)'/ },
      { field: 'mobilif_readonly', pattern: /'mobilif_readonly'@'%' IDENTIFIED BY '([^']+)'/ }
    ]
  },
  {
    file: 'config/production/docker-compose.production.yml',
    patterns: [
      { field: 'MySQL Root Password (Master)', pattern: /MYSQL_ROOT_PASSWORD:\s*(.+)/ },
      { field: 'MySQL App Password', pattern: /MYSQL_PASSWORD:\s*MobiLiF@2025!/ },
      { field: 'MySQL Readonly Password', pattern: /MYSQL_PASSWORD:\s*MobiLiF@2025!/ },
      { field: 'Grafana Admin Password', pattern: /GF_SECURITY_ADMIN_PASSWORD:\s*(.+)/ },
      { field: 'MySQL Exporter DSN', pattern: /DATA_SOURCE_NAME:\s*"mobilif_user:([^@]+)@/ }
    ]
  },
  {
    file: 'scripts/deployment/quick-setup.sh',
    patterns: [
      { field: 'MySQL Connection Test', pattern: /mysql -u root -p'([^']+)'/ },
      { field: 'Grafana Display Password', pattern: /Grafana: admin \/ (.+)"/ }
    ]
  }
];

/**
 * 检查单个文件
 */
function checkFile(filePath, fileConfig) {
  console.log(`\n📄 检查文件: ${filePath}`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠️  文件不存在`);
      return { checked: 0, correct: 0, errors: [`文件不存在: ${filePath}`] };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let checked = 0;
    let correct = 0;
    const errors = [];
    
    for (const { field, pattern } of fileConfig.patterns) {
      checked++;
      const match = content.match(pattern);
      
      if (match) {
        const password = match[1]?.trim();
        if (password === NEW_PASSWORD) {
          console.log(`   ✅ ${field}: 密码正确`);
          correct++;
        } else {
          console.log(`   ❌ ${field}: 密码不匹配 (当前: ${password})`);
          errors.push(`${field}: 期望 ${NEW_PASSWORD}, 实际 ${password}`);
        }
      } else {
        console.log(`   ⚠️  ${field}: 未找到匹配模式`);
        errors.push(`${field}: 未找到匹配的密码配置`);
      }
    }
    
    return { checked, correct, errors };
    
  } catch (error) {
    console.log(`   ❌ 读取文件失败: ${error.message}`);
    return { checked: 0, correct: 0, errors: [`读取失败: ${error.message}`] };
  }
}

/**
 * 主函数
 */
function main() {
  console.log('='.repeat(70));
  console.log('🔍 MobiLiF 数据库密码更新验证');
  console.log(`🎯 目标密码: ${NEW_PASSWORD}`);
  console.log('='.repeat(70));
  
  let totalChecked = 0;
  let totalCorrect = 0;
  const allErrors = [];
  
  // 检查每个配置文件
  for (const config of configFiles) {
    const filePath = path.join(process.cwd(), config.file);
    const result = checkFile(filePath, config);
    
    totalChecked += result.checked;
    totalCorrect += result.correct;
    allErrors.push(...result.errors);
  }
  
  // 显示汇总结果
  console.log('\n' + '='.repeat(70));
  console.log('📊 验证结果汇总');
  console.log('='.repeat(70));
  console.log(`✅ 正确配置: ${totalCorrect}/${totalChecked}`);
  console.log(`❌ 错误配置: ${totalChecked - totalCorrect}`);
  
  if (allErrors.length > 0) {
    console.log('\n🚨 发现的问题:');
    allErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  if (totalCorrect === totalChecked && allErrors.length === 0) {
    console.log('\n🎉 所有密码配置已正确更新！');
    console.log('\n📝 后续步骤:');
    console.log('   1. 在阿里云服务器上更新数据库用户密码');
    console.log('   2. 重启相关服务以应用新配置');
    console.log('   3. 测试应用连接是否正常');
    return true;
  } else {
    console.log('\n⚠️  仍有配置需要修正');
    return false;
  }
}

// 运行验证
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { checkFile, configFiles, NEW_PASSWORD };