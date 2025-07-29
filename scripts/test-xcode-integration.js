#!/usr/bin/env node

/**
 * Xcode模拟器集成测试脚本
 * 验证iPhone模拟器是否能正确启动和集成到工作流
 */

const { XcodeSimulatorIntegration } = require('./workflow/xcode-simulator-integration');

async function testXcodeIntegration() {
  console.log('🧪 测试Xcode iPhone模拟器集成...');
  console.log('======================================');

  const simulator = new XcodeSimulatorIntegration();

  try {
    // 1. 检查Xcode可用性
    console.log('\n1️⃣ 检查Xcode可用性...');
    const xcodeAvailable = await simulator.checkXcodeAvailability();
    
    if (!xcodeAvailable) {
      console.log('❌ Xcode不可用，跳过模拟器测试');
      console.log('💡 请确保已安装Xcode和CommandLineTools');
      return;
    }

    // 2. 生成测试建议
    console.log('\n2️⃣ 生成测试建议...');
    const testingSuggestions = simulator.generateTestingSuggestions();
    console.log('📋 测试建议:');
    testingSuggestions.forEach(suggestion => console.log(suggestion));

    // 3. 生成回退说明
    console.log('\n3️⃣ 生成回退说明...');
    const fallbackInstructions = simulator.getFallbackInstructions();
    console.log('📋 回退说明:');
    fallbackInstructions.forEach(instruction => console.log(instruction));

    // 4. 生成测试报告
    console.log('\n4️⃣ 生成测试报告...');
    const report = simulator.generateTestReport();
    console.log('📊 测试报告:');
    console.log(JSON.stringify(report, null, 2));

    console.log('\n✅ Xcode模拟器集成测试完成！');
    console.log('💡 可以运行以下命令启动完整工作流:');
    console.log('   npm run workflow:dev "作为用户，我希望查看健身房列表"');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.log('📋 如果遇到问题，请检查:');
    console.log('  1. Xcode是否已正确安装');
    console.log('  2. CommandLineTools是否已安装');
    console.log('  3. 运行: xcode-select --install');
  }
}

// 命令行入口
if (require.main === module) {
  testXcodeIntegration();
}

module.exports = { testXcodeIntegration };