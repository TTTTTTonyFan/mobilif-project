#!/usr/bin/env node

/**
 * Xcode iPhone模拟器集成模块
 * 用于开发工作流中的iPhone模拟器启动和测试
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class XcodeSimulatorIntegration {
  constructor() {
    this.simulatorInfo = {
      deviceUDID: null,
      deviceName: null,
      appURL: 'http://localhost:3000',
      isRunning: false
    };
  }

  /**
   * 检查Xcode是否可用
   */
  async checkXcodeAvailability() {
    console.log('🔍 检查Xcode可用性...');
    
    try {
      const result = await this.runCommand('xcrun simctl list devices | head -1');
      console.log('✅ Xcode CommandLineTools可用');
      return true;
    } catch (error) {
      console.log('❌ Xcode不可用:', error.message);
      console.log('💡 请安装Xcode或CommandLineTools');
      return false;
    }
  }

  /**
   * 启动iPhone模拟器用于开发工作流
   */
  async launchSimulatorForWorkflow(options = {}) {
    console.log('🍎 启动iPhone模拟器用于开发工作流...');
    
    const config = {
      device: options.device || 'iPhone 15',
      url: options.url || 'http://localhost:3000',
      nonInteractive: true,
      waitForLaunch: options.waitForLaunch !== false
    };

    try {
      // 检查Xcode可用性
      const xcodeAvailable = await this.checkXcodeAvailability();
      if (!xcodeAvailable) {
        throw new Error('Xcode不可用，无法启动iPhone模拟器');
      }

      // 构建启动命令
      const scriptPath = path.join(process.cwd(), 'scripts', 'start-xcode-simulator.sh');
      const command = `bash "${scriptPath}" --device "${config.device}" --url "${config.url}" --non-interactive`;

      console.log(`📱 启动命令: ${command}`);
      
      // 执行启动脚本
      const result = await this.runCommand(command);
      
      // 解析结果
      if (result.stdout.includes('STATUS=SUCCESS')) {
        // 提取设备信息
        const deviceMatch = result.stdout.match(/DEVICE_UDID=([^\n]+)/);
        const urlMatch = result.stdout.match(/APP_URL=([^\n]+)/);
        
        if (deviceMatch && urlMatch) {
          this.simulatorInfo.deviceUDID = deviceMatch[1];
          this.simulatorInfo.appURL = urlMatch[1];
          this.simulatorInfo.isRunning = true;
          
          // 获取设备名称
          const deviceNameResult = await this.runCommand(`xcrun simctl list devices | grep "${this.simulatorInfo.deviceUDID}"`);
          const nameMatch = deviceNameResult.stdout.match(/^([^(]+)/);
          if (nameMatch) {
            this.simulatorInfo.deviceName = nameMatch[1].trim();
          }
          
          console.log('✅ iPhone模拟器启动成功');
          console.log(`📱 设备: ${this.simulatorInfo.deviceName}`);
          console.log(`🆔 UDID: ${this.simulatorInfo.deviceUDID}`);
          console.log(`🌐 应用URL: ${this.simulatorInfo.appURL}`);
          
          // 等待模拟器完全加载（如果需要）
          if (config.waitForLaunch) {
            console.log('⏳ 等待模拟器完全加载...');
            await this.sleep(3000);
          }
          
          return {
            success: true,
            deviceInfo: this.simulatorInfo,
            platform: 'iPhone模拟器',
            accessUrl: this.simulatorInfo.appURL
          };
        } else {
          throw new Error('无法解析模拟器启动结果');
        }
      } else {
        throw new Error('模拟器启动脚本未返回成功状态');
      }

    } catch (error) {
      console.error('❌ iPhone模拟器启动失败:', error.message);
      
      return {
        success: false,
        error: error.message,
        fallbackInstructions: this.getFallbackInstructions()
      };
    }
  }

  /**
   * 在模拟器中打开指定URL
   */
  async openUrlInSimulator(url) {
    if (!this.simulatorInfo.isRunning || !this.simulatorInfo.deviceUDID) {
      throw new Error('iPhone模拟器未运行或设备信息不可用');
    }

    console.log(`🌐 在iPhone模拟器中打开: ${url}`);
    
    try {
      await this.runCommand(`xcrun simctl openurl "${this.simulatorInfo.deviceUDID}" "${url}"`);
      console.log('✅ URL已在iPhone模拟器中打开');
      return true;
    } catch (error) {
      console.error('❌ 在模拟器中打开URL失败:', error.message);
      return false;
    }
  }

  /**
   * 截取模拟器屏幕截图
   */
  async takeScreenshot(filename) {
    if (!this.simulatorInfo.isRunning || !this.simulatorInfo.deviceUDID) {
      throw new Error('iPhone模拟器未运行或设备信息不可用');
    }

    const screenshotPath = path.join(process.cwd(), filename || 'simulator-screenshot.png');
    
    try {
      await this.runCommand(`xcrun simctl io "${this.simulatorInfo.deviceUDID}" screenshot "${screenshotPath}"`);
      console.log(`📸 屏幕截图已保存: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.error('❌ 截图失败:', error.message);
      throw error;
    }
  }

  /**
   * 关闭模拟器
   */
  async shutdownSimulator() {
    if (!this.simulatorInfo.isRunning || !this.simulatorInfo.deviceUDID) {
      console.log('ℹ️ 没有运行中的iPhone模拟器需要关闭');
      return;
    }

    console.log('🛑 关闭iPhone模拟器...');
    
    try {
      await this.runCommand(`xcrun simctl shutdown "${this.simulatorInfo.deviceUDID}"`);
      console.log('✅ iPhone模拟器已关闭');
      
      // 重置状态
      this.simulatorInfo.isRunning = false;
      this.simulatorInfo.deviceUDID = null;
      this.simulatorInfo.deviceName = null;
      
    } catch (error) {
      console.warn('⚠️ 关闭模拟器时出现错误:', error.message);
    }
  }

  /**
   * 生成测试用例建议
   */
  generateTestingSuggestions() {
    return [
      '🧪 功能测试建议:',
      '  1. 📱 触摸操作测试: 点击、滑动、长按',
      '  2. 🔄 设备旋转测试: 竖屏/横屏切换',
      '  3. 📶 网络状态测试: 模拟弱网环境',
      '  4. 🔋 性能测试: 内存使用、电池消耗',
      '  5. 📐 适配测试: 不同屏幕尺寸适配',
      '',
      '🔧 调试工具:',
      '  • Safari开发者工具: Safari → 开发 → Simulator → iPhone',
      '  • Xcode调试: Xcode → Window → Devices and Simulators',
      '  • 性能监控: Xcode → Open Developer Tool → Instruments',
      '',
      '⚡ 快捷键:',
      '  • Cmd+Shift+H: 回到主屏幕',
      '  • Cmd+R: 刷新页面',
      '  • Cmd+K: 切换键盘',
      '  • Cmd+1/2/3: 缩放级别'
    ];
  }

  /**
   * 获取回退方案说明
   */
  getFallbackInstructions() {
    return [
      '📋 iPhone模拟器手动启动方法:',
      '1. 打开Xcode',
      '2. 菜单栏: Xcode → Open Developer Tool → Simulator',
      '3. 选择iPhone设备型号',
      '4. 等待模拟器启动',
      '5. 在Safari中访问: http://localhost:3000',
      '',
      '或者运行以下命令:',
      '  npm run ios-simulator',
      '  npm run xcode'
    ];
  }

  /**
   * 生成模拟器测试报告
   */
  generateTestReport() {
    const report = {
      timestamp: new Date().toISOString(),
      simulator: {
        platform: 'iPhone模拟器',
        deviceName: this.simulatorInfo.deviceName,
        deviceUDID: this.simulatorInfo.deviceUDID,
        appURL: this.simulatorInfo.appURL,
        isRunning: this.simulatorInfo.isRunning
      },
      testingSuggestions: this.generateTestingSuggestions(),
      status: this.simulatorInfo.isRunning ? 'active' : 'inactive'
    };

    return report;
  }

  /**
   * 等待函数
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 运行命令
   */
  async runCommand(command) {
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed: ${command}\n${stderr}`));
        }
      });
    });
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const simulator = new XcodeSimulatorIntegration();

  switch (command) {
    case 'launch':
      const options = {
        device: args.find(arg => arg.startsWith('--device='))?.split('=')[1],
        url: args.find(arg => arg.startsWith('--url='))?.split('=')[1]
      };
      
      const result = await simulator.launchSimulatorForWorkflow(options);
      console.log('📊 启动结果:', JSON.stringify(result, null, 2));
      break;

    case 'screenshot':
      const filename = args[1] || 'test-screenshot.png';
      await simulator.takeScreenshot(filename);
      break;

    case 'shutdown':
      await simulator.shutdownSimulator();
      break;

    case 'test-suggestions':
      const suggestions = simulator.generateTestingSuggestions();
      suggestions.forEach(line => console.log(line));
      break;

    case 'report':
      const report = simulator.generateTestReport();
      console.log(JSON.stringify(report, null, 2));
      break;

    default:
      console.log('🍎 Xcode iPhone模拟器集成工具');
      console.log('');
      console.log('使用方法:');
      console.log('  node xcode-simulator-integration.js launch [--device=iPhone15] [--url=http://localhost:3000]');
      console.log('  node xcode-simulator-integration.js screenshot [filename]');
      console.log('  node xcode-simulator-integration.js shutdown');
      console.log('  node xcode-simulator-integration.js test-suggestions');
      console.log('  node xcode-simulator-integration.js report');
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ 执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = { XcodeSimulatorIntegration };