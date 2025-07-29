#!/usr/bin/env node

/**
 * 部署工作流脚本
 * 自动化生产环境部署流程
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class DeployWorkflow {
  constructor() {
    this.deploymentSteps = [
      { name: '环境检查', handler: 'checkEnvironment' },
      { name: '构建应用', handler: 'buildApplication' },
      { name: '运行部署前测试', handler: 'runPreDeploymentTests' },
      { name: '备份当前版本', handler: 'backupCurrentVersion' },
      { name: '部署到服务器', handler: 'deployToServer' },
      { name: '运行数据库迁移', handler: 'runDatabaseMigrations' },
      { name: '健康检查', handler: 'performHealthCheck' },
      { name: '生成部署报告', handler: 'generateDeploymentReport' }
    ];
    
    this.config = {
      serverHost: process.env.DEPLOYMENT_SERVER || '8.147.235.48',
      serverUser: process.env.DEPLOYMENT_USER || 'root',
      deployPath: process.env.DEPLOY_PATH || '/var/www/mobilif',
      backupPath: process.env.BACKUP_PATH || '/var/backups/mobilif',
      healthCheckUrl: process.env.HEALTH_CHECK_URL || 'http://localhost:3000/health',
      databaseUrl: process.env.DATABASE_URL,
      dockerRegistry: process.env.DOCKER_REGISTRY || 'registry.cn-hangzhou.aliyuncs.com',
      dockerNamespace: process.env.DOCKER_NAMESPACE || 'mobilif'
    };
    
    this.results = {
      environment: null,
      build: null,
      tests: null,
      backup: null,
      deployment: null,
      migration: null,
      healthCheck: null,
      report: null
    };
    
    this.startTime = Date.now();
  }

  /**
   * 执行完整的部署工作流
   */
  async executeDeployment(options = {}) {
    console.log('🚀 开始执行生产环境部署...');
    console.log(`🎯 目标服务器: ${this.config.serverHost}`);
    console.log(`📂 部署路径: ${this.config.deployPath}`);
    console.log(`⏰ 开始时间: ${new Date().toLocaleString()}`);
    
    try {
      for (const step of this.deploymentSteps) {
        console.log(`\n🔄 执行: ${step.name}...`);
        
        const stepStartTime = Date.now();
        await this[step.handler](options);
        const stepDuration = Date.now() - stepStartTime;
        
        console.log(`✅ ${step.name}完成 (耗时: ${Math.round(stepDuration / 1000)}秒)`);
      }
      
      const totalDuration = Date.now() - this.startTime;
      console.log(`\n🎉 生产环境部署完成！总耗时: ${Math.round(totalDuration / 1000)}秒`);
      
      return this.results;
      
    } catch (error) {
      console.error(`❌ 部署失败: ${error.message}`);
      
      // 尝试回滚
      if (!options.skipRollback) {
        await this.performRollback();
      }
      
      // 保存错误报告
      await this.saveErrorReport(error);
      
      throw error;
    }
  }

  /**
   * 环境检查
   */
  async checkEnvironment(options) {
    console.log('🔍 检查部署环境...');
    
    const environmentCheck = {
      local: { docker: false, node: false, git: false },
      remote: { server: false, services: false, disk: false },
      config: { variables: false, secrets: false }
    };
    
    try {
      // 检查本地环境
      console.log('📍 检查本地环境...');
      
      // Docker检查
      try {
        await this.runCommand('docker --version');
        environmentCheck.local.docker = true;
        console.log('✅ Docker可用');
      } catch (error) {
        throw new Error('Docker未安装或不可用');
      }
      
      // Node.js检查
      try {
        const nodeVersion = await this.runCommand('node --version');
        environmentCheck.local.node = true;
        console.log(`✅ Node.js可用 (${nodeVersion.stdout.trim()})`);
      } catch (error) {
        throw new Error('Node.js未安装或不可用');
      }
      
      // Git检查
      try {
        await this.runCommand('git --version');
        environmentCheck.local.git = true;
        console.log('✅ Git可用');
      } catch (error) {
        throw new Error('Git未安装或不可用');
      }
      
      // 检查远程服务器
      console.log('🌐 检查远程服务器...');
      
      try {
        await this.runSSHCommand('echo "Server connection test"');
        environmentCheck.remote.server = true;
        console.log('✅ 服务器连接正常');
      } catch (error) {
        throw new Error(`无法连接到服务器 ${this.config.serverHost}`);
      }
      
      // 检查服务器服务
      try {
        await this.runSSHCommand('docker --version && systemctl is-active docker');
        environmentCheck.remote.services = true;
        console.log('✅ 服务器Docker服务正常');
      } catch (error) {
        console.warn('⚠️ 服务器Docker服务可能有问题');
      }
      
      // 检查磁盘空间
      try {
        const diskUsage = await this.runSSHCommand('df -h / | tail -1');
        const usagePercent = diskUsage.stdout.match(/(\d+)%/);
        if (usagePercent && parseInt(usagePercent[1]) > 85) {
          console.warn('⚠️ 服务器磁盘空间不足');
        } else {
          environmentCheck.remote.disk = true;
          console.log('✅ 服务器磁盘空间充足');
        }
      } catch (error) {
        console.warn('⚠️ 无法检查磁盘空间');
      }
      
      // 检查配置变量
      console.log('⚙️ 检查配置变量...');
      
      const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET', 
        'DEPLOYMENT_SSH_KEY'
      ];
      
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        throw new Error(`缺少环境变量: ${missingVars.join(', ')}`);
      }
      
      environmentCheck.config.variables = true;
      environmentCheck.config.secrets = true;
      console.log('✅ 配置变量检查通过');
      
      this.results.environment = environmentCheck;
      
    } catch (error) {
      console.error('❌ 环境检查失败:', error.message);
      throw error;
    }
  }

  /**
   * 构建应用
   */
  async buildApplication(options) {
    console.log('🔨 构建应用...');
    
    const buildResults = {
      success: false,
      dockerImage: null,
      imageSize: null,
      buildTime: 0
    };
    
    try {
      const buildStartTime = Date.now();
      
      // 清理之前的构建
      console.log('🧹 清理之前的构建...');
      await this.runCommand('npm run build:clean || true');
      
      // 安装依赖
      console.log('📦 安装生产依赖...');
      await this.runCommand('npm ci --only=production');
      
      // 构建应用
      console.log('⚙️ 构建应用...');
      await this.runCommand('npm run build');
      
      // 生成Docker镜像标签
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const gitHash = await this.runCommand('git rev-parse --short HEAD');
      const imageTag = `${timestamp}-${gitHash.stdout.trim()}`;
      
      buildResults.dockerImage = `${this.config.dockerRegistry}/${this.config.dockerNamespace}/mobilif-backend:${imageTag}`;
      
      // 构建Docker镜像
      console.log(`🐳 构建Docker镜像: ${buildResults.dockerImage}`);
      await this.runCommand(`docker build -t ${buildResults.dockerImage} .`);
      
      // 推送到镜像仓库
      console.log('📤 推送Docker镜像...');
      await this.runCommand(`docker push ${buildResults.dockerImage}`);
      
      // 获取镜像大小
      try {
        const imageInfo = await this.runCommand(`docker inspect ${buildResults.dockerImage} --format='{{.Size}}'`);
        const sizeBytes = parseInt(imageInfo.stdout.trim());
        buildResults.imageSize = this.formatBytes(sizeBytes);
      } catch (error) {
        console.warn('⚠️ 无法获取镜像大小');
      }
      
      buildResults.buildTime = Date.now() - buildStartTime;
      buildResults.success = true;
      
      console.log(`✅ 应用构建完成:`);
      console.log(`  🐳 镜像: ${buildResults.dockerImage}`);
      console.log(`  📏 大小: ${buildResults.imageSize || '未知'}`);
      console.log(`  ⏱️ 耗时: ${Math.round(buildResults.buildTime / 1000)}秒`);
      
      this.results.build = buildResults;
      
    } catch (error) {
      buildResults.error = error.message;
      this.results.build = buildResults;
      console.error('❌ 应用构建失败:', error.message);
      throw error;
    }
  }

  /**
   * 运行部署前测试
   */
  async runPreDeploymentTests(options) {
    console.log('🧪 运行部署前测试...');
    
    if (options.skipTests) {
      console.log('⏭️ 跳过测试');
      this.results.tests = { skipped: true };
      return;
    }
    
    const testResults = {
      success: false,
      unit: false,
      integration: false,
      e2e: false,
      security: false
    };
    
    try {
      // 运行单元测试
      console.log('🔬 运行单元测试...');
      await this.runCommand('npm run test -- --passWithNoTests');
      testResults.unit = true;
      console.log('✅ 单元测试通过');
      
      // 运行集成测试
      console.log('🔗 运行集成测试...');
      try {
        await this.runCommand('npm run test:integration -- --passWithNoTests');
        testResults.integration = true;
        console.log('✅ 集成测试通过');
      } catch (error) {
        console.warn('⚠️ 集成测试失败，但继续部署');
      }
      
      // 运行安全扫描
      console.log('🔒 运行安全扫描...');
      try {
        await this.runCommand('npm audit --audit-level high');
        testResults.security = true;
        console.log('✅ 安全扫描通过');
      } catch (error) {
        console.warn('⚠️ 发现安全漏洞，请检查 npm audit 输出');
      }
      
      testResults.success = testResults.unit; // 至少单元测试要通过
      this.results.tests = testResults;
      
    } catch (error) {
      testResults.error = error.message;
      this.results.tests = testResults;
      console.error('❌ 部署前测试失败:', error.message);
      throw error;
    }
  }

  /**
   * 备份当前版本
   */
  async backupCurrentVersion(options) {
    console.log('💾 备份当前版本...');
    
    const backupResults = {
      success: false,
      backupPath: null,
      backupSize: null
    };
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupFileName = `mobilif-backup-${timestamp}.tar.gz`;
      const remoteBackupPath = `${this.config.backupPath}/${backupFileName}`;
      
      // 确保备份目录存在
      await this.runSSHCommand(`mkdir -p ${this.config.backupPath}`);
      
      // 创建备份
      console.log('📦 创建应用备份...');
      await this.runSSHCommand(`
        cd ${this.config.deployPath} && 
        tar --exclude='node_modules' --exclude='logs' --exclude='*.log' 
            -czf ${remoteBackupPath} . || echo "Backup created with warnings"
      `);
      
      // 获取备份大小
      try {
        const sizeOutput = await this.runSSHCommand(`ls -lh ${remoteBackupPath} | awk '{print $5}'`);
        backupResults.backupSize = sizeOutput.stdout.trim();
      } catch (error) {
        console.warn('⚠️ 无法获取备份文件大小');
      }
      
      // 清理旧备份（保留最近10个）
      await this.runSSHCommand(`
        cd ${this.config.backupPath} &&
        ls -t mobilif-backup-*.tar.gz | tail -n +11 | xargs -r rm -f
      `);
      
      backupResults.success = true;
      backupResults.backupPath = remoteBackupPath;
      
      console.log(`✅ 备份完成:`);
      console.log(`  📂 路径: ${remoteBackupPath}`);
      console.log(`  📏 大小: ${backupResults.backupSize || '未知'}`);
      
      this.results.backup = backupResults;
      
    } catch (error) {
      backupResults.error = error.message;
      this.results.backup = backupResults;
      console.error('❌ 备份失败:', error.message);
      throw error;
    }
  }

  /**
   * 部署到服务器
   */
  async deployToServer(options) {
    console.log('🚀 部署到服务器...');
    
    const deploymentResults = {
      success: false,
      containerId: null,
      deployTime: 0
    };
    
    try {
      const deployStartTime = Date.now();
      const { dockerImage } = this.results.build;
      
      if (!dockerImage) {
        throw new Error('缺少Docker镜像信息');
      }
      
      console.log('🐋 拉取Docker镜像...');
      await this.runSSHCommand(`docker pull ${dockerImage}`);
      
      console.log('🛑 停止现有容器...');
      await this.runSSHCommand(`
        cd ${this.config.deployPath} &&
        docker-compose down || true
      `);
      
      console.log('📝 更新docker-compose配置...');
      await this.runSSHCommand(`
        cd ${this.config.deployPath} &&
        sed -i 's|image: .*mobilif-backend:.*|image: ${dockerImage}|' docker-compose.yml
      `);
      
      console.log('🚀 启动新容器...');
      await this.runSSHCommand(`
        cd ${this.config.deployPath} &&
        docker-compose up -d
      `);
      
      // 等待容器启动
      console.log('⏳ 等待服务启动...');
      await this.sleep(30000); // 等待30秒
      
      // 获取容器ID
      try {
        const containerInfo = await this.runSSHCommand(`
          cd ${this.config.deployPath} &&
          docker-compose ps -q backend
        `);
        deploymentResults.containerId = containerInfo.stdout.trim();
      } catch (error) {
        console.warn('⚠️ 无法获取容器信息');
      }
      
      deploymentResults.deployTime = Date.now() - deployStartTime;
      deploymentResults.success = true;
      
      console.log(`✅ 部署完成:`);
      console.log(`  🐳 镜像: ${dockerImage}`);
      console.log(`  📦 容器: ${deploymentResults.containerId || '未知'}`);
      console.log(`  ⏱️ 耗时: ${Math.round(deploymentResults.deployTime / 1000)}秒`);
      
      this.results.deployment = deploymentResults;
      
    } catch (error) {
      deploymentResults.error = error.message;
      this.results.deployment = deploymentResults;
      console.error('❌ 部署失败:', error.message);
      throw error;
    }
  }

  /**
   * 运行数据库迁移
   */
  async runDatabaseMigrations(options) {
    console.log('🗄️ 运行数据库迁移...');
    
    const migrationResults = {
      success: false,
      migrationsRun: 0
    };
    
    try {
      if (options.skipMigrations) {
        console.log('⏭️ 跳过数据库迁移');
        migrationResults.success = true;
        migrationResults.skipped = true;
        this.results.migration = migrationResults;
        return;
      }
      
      console.log('🔄 执行数据库迁移...');
      const migrationOutput = await this.runSSHCommand(`
        cd ${this.config.deployPath} &&
        docker-compose exec -T backend npm run migration:run
      `);
      
      // 解析迁移输出
      const migrationLines = migrationOutput.stdout.split('\n').filter(line => 
        line.includes('Migration') && line.includes('has been executed successfully')
      );
      
      migrationResults.migrationsRun = migrationLines.length;
      migrationResults.success = true;
      
      console.log(`✅ 数据库迁移完成:`);
      console.log(`  📊 执行迁移: ${migrationResults.migrationsRun}个`);
      
      this.results.migration = migrationResults;
      
    } catch (error) {
      migrationResults.error = error.message;
      this.results.migration = migrationResults;
      console.error('❌ 数据库迁移失败:', error.message);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  async performHealthCheck(options) {
    console.log('🔍 执行健康检查...');
    
    const healthResults = {
      success: false,
      checks: {
        httpStatus: false,
        database: false,
        redis: false,
        api: false
      }
    };
    
    try {
      // HTTP状态检查
      console.log('🌐 检查HTTP状态...');
      const httpCheck = await this.runSSHCommand(`
        curl -f -s -o /dev/null -w "%{http_code}" ${this.config.healthCheckUrl}
      `);
      
      if (httpCheck.stdout.trim() === '200') {
        healthResults.checks.httpStatus = true;
        console.log('✅ HTTP健康检查通过');
      } else {
        console.error(`❌ HTTP健康检查失败: ${httpCheck.stdout.trim()}`);
      }
      
      // 数据库连接检查
      console.log('🗄️ 检查数据库连接...');
      try {
        await this.runSSHCommand(`
          cd ${this.config.deployPath} &&
          docker-compose exec -T backend npm run test:db-connection
        `);
        healthResults.checks.database = true;
        console.log('✅ 数据库连接正常');
      } catch (error) {
        console.error('❌ 数据库连接检查失败');
      }
      
      // API端点检查
      console.log('🔌 检查API端点...');
      try {
        const apiCheck = await this.runSSHCommand(`
          curl -f -s ${this.config.serverHost}:3000/api/health
        `);
        if (apiCheck.stdout.includes('ok')) {
          healthResults.checks.api = true;
          console.log('✅ API端点正常');
        }
      } catch (error) {
        console.error('❌ API端点检查失败');
      }
      
      // 整体健康状态
      const passedChecks = Object.values(healthResults.checks).filter(Boolean).length;
      const totalChecks = Object.keys(healthResults.checks).length;
      
      healthResults.success = passedChecks >= Math.ceil(totalChecks * 0.7); // 70%通过率
      
      console.log(`📊 健康检查结果: ${passedChecks}/${totalChecks} 通过`);
      
      this.results.healthCheck = healthResults;
      
      if (!healthResults.success) {
        throw new Error('健康检查未通过');
      }
      
    } catch (error) {
      healthResults.error = error.message;
      this.results.healthCheck = healthResults;
      console.error('❌ 健康检查失败:', error.message);
      throw error;
    }
  }

  /**
   * 生成部署报告
   */
  async generateDeploymentReport(options) {
    console.log('📊 生成部署报告...');
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      success: this.isDeploymentSuccessful(),
      server: this.config.serverHost,
      image: this.results.build?.dockerImage,
      summary: this.generateDeploymentSummary(),
      details: {
        environment: this.results.environment,
        build: this.results.build,
        tests: this.results.tests,
        backup: this.results.backup,
        deployment: this.results.deployment,
        migration: this.results.migration,
        healthCheck: this.results.healthCheck
      }
    };
    
    this.results.report = report;
    
    // 保存详细报告
    const reportPath = 'deployment-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 生成Markdown报告
    const markdownReport = await this.generateMarkdownReport(report);
    const mdPath = 'deployment-report.md';
    fs.writeFileSync(mdPath, markdownReport);
    
    console.log(`📄 部署报告已生成:`);
    console.log(`  - JSON: ${reportPath}`);
    console.log(`  - Markdown: ${mdPath}`);
    
    // 显示摘要
    this.displayDeploymentSummary(report);
  }

  /**
   * 执行回滚
   */
  async performRollback() {
    console.log('🔄 开始回滚到上一版本...');
    
    try {
      const { backupPath } = this.results.backup || {};
      
      if (!backupPath) {
        console.error('❌ 无备份文件，无法回滚');
        return;
      }
      
      console.log('🛑 停止当前服务...');
      await this.runSSHCommand(`
        cd ${this.config.deployPath} &&
        docker-compose down || true
      `);
      
      console.log('📦 恢复上一版本...');
      await this.runSSHCommand(`
        cd ${this.config.deployPath} &&
        tar -xzf ${backupPath} &&
        docker-compose up -d
      `);
      
      console.log('✅ 回滚完成');
      
    } catch (error) {
      console.error('❌ 回滚失败:', error.message);
    }
  }

  /**
   * 判断部署是否成功
   */
  isDeploymentSuccessful() {
    return this.results.healthCheck?.success === true;
  }

  /**
   * 生成部署摘要
   */
  generateDeploymentSummary() {
    return {
      buildTime: Math.round((this.results.build?.buildTime || 0) / 1000),
      deployTime: Math.round((this.results.deployment?.deployTime || 0) / 1000),
      migrationsRun: this.results.migration?.migrationsRun || 0,
      healthChecks: this.results.healthCheck ? 
        Object.values(this.results.healthCheck.checks).filter(Boolean).length : 0,
      backupCreated: this.results.backup?.success || false
    };
  }

  /**
   * 生成Markdown报告
   */
  async generateMarkdownReport(report) {
    const duration = Math.round(report.duration / 1000);
    const status = report.success ? '✅ 成功' : '❌ 失败';
    
    return `# 🚀 生产环境部署报告

## 📊 概览

- **状态**: ${status}
- **服务器**: ${report.server}
- **镜像**: ${report.image || '未知'}
- **部署时间**: ${report.timestamp}
- **总耗时**: ${duration}秒

## 📈 执行结果

### 🔨 构建结果
- **状态**: ${report.details.build?.success ? '✅ 成功' : '❌ 失败'}
- **镜像大小**: ${report.details.build?.imageSize || '未知'}
- **构建耗时**: ${report.summary.buildTime}秒

### 🧪 测试结果
- **单元测试**: ${report.details.tests?.unit ? '✅ 通过' : '❌ 失败'}
- **集成测试**: ${report.details.tests?.integration ? '✅ 通过' : '❌ 失败'}
- **安全扫描**: ${report.details.tests?.security ? '✅ 通过' : '❌ 失败'}

### 💾 备份状态
- **备份创建**: ${report.summary.backupCreated ? '✅ 成功' : '❌ 失败'}
- **备份路径**: ${report.details.backup?.backupPath || '未知'}
- **备份大小**: ${report.details.backup?.backupSize || '未知'}

### 🚀 部署状态
- **部署状态**: ${report.details.deployment?.success ? '✅ 成功' : '❌ 失败'}
- **容器ID**: ${report.details.deployment?.containerId || '未知'}
- **部署耗时**: ${report.summary.deployTime}秒

### 🗄️ 数据库迁移
- **迁移状态**: ${report.details.migration?.success ? '✅ 成功' : '❌ 失败'}
- **执行迁移**: ${report.summary.migrationsRun}个

### 🔍 健康检查
- **通过检查**: ${report.summary.healthChecks}/4
- **HTTP状态**: ${report.details.healthCheck?.checks.httpStatus ? '✅' : '❌'}
- **数据库连接**: ${report.details.healthCheck?.checks.database ? '✅' : '❌'}
- **API端点**: ${report.details.healthCheck?.checks.api ? '✅' : '❌'}

## 🔗 访问信息

- **应用地址**: http://${report.server}:3000
- **API文档**: http://${report.server}:3000/api
- **健康检查**: http://${report.server}:3000/health

---
*报告生成时间: ${new Date().toLocaleString()}*`;
  }

  /**
   * 显示部署摘要
   */
  displayDeploymentSummary(report) {
    const duration = Math.round(report.duration / 1000);
    const status = report.success ? '✅ 成功' : '❌ 失败';
    
    console.log('\n📊 部署执行摘要:');
    console.log(`  状态: ${status}`);
    console.log(`  服务器: ${report.server}`);
    console.log(`  总耗时: ${duration}秒`);
    console.log(`  构建时间: ${report.summary.buildTime}秒`);
    console.log(`  部署时间: ${report.summary.deployTime}秒`);
    console.log(`  健康检查: ${report.summary.healthChecks}/4`);
  }

  /**
   * 运行本地命令
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

  /**
   * 运行SSH命令
   */
  async runSSHCommand(command) {
    const sshCommand = `ssh -o StrictHostKeyChecking=no ${this.config.serverUser}@${this.config.serverHost} "${command}"`;
    return this.runCommand(sshCommand);
  }

  /**
   * 睡眠函数
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 格式化字节数
   */
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  /**
   * 保存错误报告
   */
  async saveErrorReport(error) {
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      server: this.config.serverHost,
      completedSteps: Object.keys(this.results).filter(key => this.results[key] !== null)
    };
    
    const errorPath = 'deployment-error.json';
    fs.writeFileSync(errorPath, JSON.stringify(errorReport, null, 2));
    
    console.log(`📄 错误报告已保存: ${errorPath}`);
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  
  // 解析选项
  const options = {
    skipTests: args.includes('--skip-tests'),
    skipMigrations: args.includes('--skip-migrations'),
    skipRollback: args.includes('--skip-rollback'),
    force: args.includes('--force')
  };
  
  console.log('🚀 MobiLiF 生产环境部署');
  console.log('========================');
  
  if (!options.force) {
    console.log('⚠️ 这将部署到生产环境，请确认操作！');
    console.log('添加 --force 参数以确认部署');
    process.exit(1);
  }
  
  try {
    const workflow = new DeployWorkflow();
    const results = await workflow.executeDeployment(options);
    
    if (results.report.success) {
      console.log('\n🎉 生产环境部署成功！');
      process.exit(0);
    } else {
      console.log('\n⚠️ 生产环境部署完成，但可能存在问题');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ 生产环境部署失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DeployWorkflow };