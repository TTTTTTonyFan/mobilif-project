const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  // 基础配置
  displayName: 'Integration Tests',
  testEnvironment: 'node',
  preset: 'ts-jest',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.{js,ts}',
    '<rootDir>/src/**/*.integration.spec.{js,ts}',
    '<rootDir>/src/**/*.integration.test.{js,ts}'
  ],
  
  // 忽略的测试文件
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/tests/unit/',
    '<rootDir>/tests/e2e/'
  ],
  
  // 模块路径映射（基于tsconfig paths）
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/'
  }),
  
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // 根目录
  rootDir: '.',
  
  // 转换配置
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.integration.spec.ts',
    '!src/**/*.integration.test.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**'
  ],
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // 测试设置
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  
  // 超时设置（集成测试通常需要更长时间）
  testTimeout: 30000,
  
  // 并发设置
  maxWorkers: 1, // 集成测试通常需要串行执行以避免数据库冲突
  
  // 详细输出
  verbose: true,
  
  // 环境变量
  setupFiles: ['<rootDir>/tests/integration/env.setup.js'],
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
      isolatedModules: true
    },
    __INTEGRATION_TEST__: true
  },
  
  // 清理 mock
  clearMocks: true,
  restoreMocks: true,
  
  // 错误处理
  errorOnDeprecated: true,
  
  // 快照设置
  snapshotSerializers: [],
  
  // 监视模式配置
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/logs/'
  ],
  
  // 报告配置
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'integration-tests.xml',
        suiteName: 'Integration Tests'
      }
    ],
    [
      'jest-html-reporters',
      {
        publicPath: 'test-results',
        filename: 'integration-test-report.html',
        pageTitle: 'MobiLiF Integration Test Report'
      }
    ]
  ]
};