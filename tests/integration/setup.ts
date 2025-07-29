/**
 * 集成测试设置文件
 * 在所有集成测试运行前执行初始化
 */

import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

// 全局变量声明
declare global {
  var testApp: INestApplication;
  var testDataSource: DataSource;
  var testModule: TestingModule;
}

// 测试配置
const TEST_CONFIG = {
  timeout: 30000,
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/mobilif_test',
    synchronize: true,
    dropSchema: true,
    logging: false
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379/1'
  }
};

/**
 * 全局测试设置
 */
beforeAll(async () => {
  console.log('🔧 开始集成测试环境初始化...');
  
  try {
    // 设置测试超时
    jest.setTimeout(TEST_CONFIG.timeout);
    
    // 创建测试应用
    await createTestApp();
    
    // 初始化数据库
    await initializeDatabase();
    
    // 初始化Redis
    await initializeRedis();
    
    // 加载测试数据
    await loadTestData();
    
    console.log('✅ 集成测试环境初始化完成');
    
  } catch (error) {
    console.error('❌ 集成测试环境初始化失败:', error);
    throw error;
  }
});

/**
 * 全局测试清理
 */
afterAll(async () => {
  console.log('🧹 开始清理集成测试环境...');
  
  try {
    // 清理测试数据
    await cleanupTestData();
    
    // 关闭数据库连接
    if (global.testDataSource?.isInitialized) {
      await global.testDataSource.destroy();
    }
    
    // 关闭应用
    if (global.testApp) {
      await global.testApp.close();
    }
    
    // 关闭测试模块
    if (global.testModule) {
      await global.testModule.close();
    }
    
    console.log('✅ 集成测试环境清理完成');
    
  } catch (error) {
    console.error('❌ 清理集成测试环境失败:', error);
  }
});

/**
 * 每个测试前的设置
 */
beforeEach(async () => {
  // 如果需要，可以在每个测试前重置状态
  if (process.env.RESET_DB_BEFORE_EACH === 'true') {
    await resetDatabase();
  }
});

/**
 * 每个测试后的清理
 */
afterEach(async () => {
  // 清理缓存
  if (global.testApp) {
    const cacheManager = global.testApp.get('CACHE_MANAGER', { strict: false });
    if (cacheManager) {
      await cacheManager.reset();
    }
  }
});

/**
 * 创建测试应用
 */
async function createTestApp(): Promise<void> {
  console.log('📱 创建测试应用...');
  
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
  .overrideProvider('DATABASE_CONFIG')
  .useValue(TEST_CONFIG.database)
  .overrideProvider('REDIS_CONFIG')
  .useValue(TEST_CONFIG.redis)
  .compile();

  const app = moduleFixture.createNestApplication();
  
  // 配置应用
  app.setGlobalPrefix('api');
  
  // 启动应用
  await app.init();
  
  // 保存到全局变量
  global.testApp = app;
  global.testModule = moduleFixture;
  
  console.log('✅ 测试应用创建完成');
}

/**
 * 初始化测试数据库
 */
async function initializeDatabase(): Promise<void> {
  console.log('🗄️ 初始化测试数据库...');
  
  try {
    const dataSource = global.testApp.get(DataSource);
    
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    
    // 同步数据库结构
    await dataSource.synchronize(true);
    
    global.testDataSource = dataSource;
    
    console.log('✅ 测试数据库初始化完成');
    
  } catch (error) {
    console.error('❌ 测试数据库初始化失败:', error);
    throw error;
  }
}

/**
 * 初始化Redis
 */
async function initializeRedis(): Promise<void> {
  console.log('🔄 初始化Redis连接...');
  
  try {
    const cacheManager = global.testApp.get('CACHE_MANAGER', { strict: false });
    
    if (cacheManager) {
      // 清空Redis缓存
      await cacheManager.reset();
      console.log('✅ Redis连接初始化完成');
    } else {
      console.log('⚠️ 未找到Cache Manager，跳过Redis初始化');
    }
    
  } catch (error) {
    console.error('❌ Redis初始化失败:', error);
    // Redis失败不应该阻止测试运行
  }
}

/**
 * 加载测试数据
 */
async function loadTestData(): Promise<void> {
  console.log('📊 加载测试数据...');
  
  try {
    const queryRunner = global.testDataSource.createQueryRunner();
    
    // 插入测试用户
    await queryRunner.query(`
      INSERT INTO users (id, username, email, password_hash, created_at, updated_at) VALUES
      ('test-user-1', 'testuser1', 'test1@example.com', '$2b$10$hash1', NOW(), NOW()),
      ('test-user-2', 'testuser2', 'test2@example.com', '$2b$10$hash2', NOW(), NOW())
    `);
    
    // 插入测试健身房
    await queryRunner.query(`
      INSERT INTO gyms (id, name, address, latitude, longitude, created_at, updated_at) VALUES
      ('test-gym-1', 'Test CrossFit Box 1', '123 Test Street', 40.7128, -74.0060, NOW(), NOW()),
      ('test-gym-2', 'Test CrossFit Box 2', '456 Test Avenue', 40.7589, -73.9851, NOW(), NOW())
    `);
    
    await queryRunner.release();
    
    console.log('✅ 测试数据加载完成');
    
  } catch (error) {
    console.error('❌ 测试数据加载失败:', error);
    throw error;
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData(): Promise<void> {
  console.log('🧹 清理测试数据...');
  
  try {
    if (global.testDataSource?.isInitialized) {
      const queryRunner = global.testDataSource.createQueryRunner();
      
      // 按依赖关系顺序删除数据
      await queryRunner.query('DELETE FROM bookings');
      await queryRunner.query('DELETE FROM users');
      await queryRunner.query('DELETE FROM gyms');
      
      await queryRunner.release();
    }
    
    console.log('✅ 测试数据清理完成');
    
  } catch (error) {
    console.error('❌ 测试数据清理失败:', error);
  }
}

/**
 * 重置数据库
 */
async function resetDatabase(): Promise<void> {
  if (global.testDataSource?.isInitialized) {
    await global.testDataSource.synchronize(true);
    await loadTestData();
  }
}

// 导出测试工具函数
export const testUtils = {
  /**
   * 获取测试应用实例
   */
  getApp: (): INestApplication => {
    if (!global.testApp) {
      throw new Error('测试应用未初始化');
    }
    return global.testApp;
  },
  
  /**
   * 获取数据源
   */
  getDataSource: (): DataSource => {
    if (!global.testDataSource) {
      throw new Error('测试数据源未初始化');
    }
    return global.testDataSource;
  },
  
  /**
   * 清理特定表数据
   */
  async cleanTable(tableName: string): Promise<void> {
    const queryRunner = global.testDataSource.createQueryRunner();
    await queryRunner.query(`DELETE FROM ${tableName}`);
    await queryRunner.release();
  },
  
  /**
   * 创建测试用户
   */
  async createTestUser(userData: any = {}): Promise<any> {
    const defaultUser = {
      id: `test-user-${Date.now()}`,
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password_hash: '$2b$10$testhash',
      ...userData
    };
    
    const queryRunner = global.testDataSource.createQueryRunner();
    await queryRunner.query(
      'INSERT INTO users (id, username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [defaultUser.id, defaultUser.username, defaultUser.email, defaultUser.password_hash]
    );
    await queryRunner.release();
    
    return defaultUser;
  },
  
  /**
   * 创建测试健身房
   */
  async createTestGym(gymData: any = {}): Promise<any> {
    const defaultGym = {
      id: `test-gym-${Date.now()}`,
      name: `Test Gym ${Date.now()}`,
      address: '123 Test Street',
      latitude: 40.7128,
      longitude: -74.0060,
      ...gymData
    };
    
    const queryRunner = global.testDataSource.createQueryRunner();
    await queryRunner.query(
      'INSERT INTO gyms (id, name, address, latitude, longitude, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [defaultGym.id, defaultGym.name, defaultGym.address, defaultGym.latitude, defaultGym.longitude]
    );
    await queryRunner.release();
    
    return defaultGym;
  }
};