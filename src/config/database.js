/**
 * MobiLiF 数据库连接配置
 * 支持主从分离、连接池、事务管理
 * 兼容阿里云MySQL 8.0
 */

const mysql = require('mysql2/promise');
const { ConfigService } = require('@nestjs/config');

/**
 * 数据库连接配置类
 */
class DatabaseConfig {
  constructor(configService) {
    this.configService = configService;
    this.masterPool = null;
    this.slavePool = null;
    this.isConnected = false;
    
    // 连接配置
    this.masterConfig = {
      host: this.configService.get('DB_HOST', 'localhost'),
      port: parseInt(this.configService.get('DB_PORT', '3306')),
      user: this.configService.get('DB_USERNAME', 'mobilif_app'),
      password: this.configService.get('DB_PASSWORD', 'MobiLiF@2025!'),
      database: this.configService.get('DB_DATABASE', 'mobilif'),
      charset: this.configService.get('DB_CHARSET', 'utf8mb4'),
      timezone: this.configService.get('DB_TIMEZONE', '+08:00'),
      
      // 连接池配置
      acquireTimeout: parseInt(this.configService.get('DB_POOL_ACQUIRE_TIMEOUT', '60000')),
      timeout: parseInt(this.configService.get('DB_POOL_IDLE_TIMEOUT', '30000')),
      reconnect: true,
      
      // 连接池大小
      connectionLimit: parseInt(this.configService.get('DB_POOL_MAX', '50')),
      queueLimit: parseInt(this.configService.get('DB_POOL_QUEUE_LIMIT', '0')),
      
      // MySQL 8.0 兼容性
      authPlugins: {
        mysql_native_password: () => require('mysql2/lib/auth_plugins').mysql_native_password,
        caching_sha2_password: () => require('mysql2/lib/auth_plugins').caching_sha2_password,
      },
      
      // SSL配置（阿里云RDS推荐）
      ssl: this.configService.get('DB_SSL_ENABLED', 'false') === 'true' ? {
        ca: this.configService.get('DB_SSL_CA'),
        rejectUnauthorized: this.configService.get('DB_SSL_REJECT_UNAUTHORIZED', 'true') === 'true'
      } : false,
      
      // 其他配置
      multipleStatements: false,
      namedPlaceholders: true,
      dateStrings: false,
      debug: this.configService.get('NODE_ENV') === 'development',
      trace: this.configService.get('NODE_ENV') === 'development',
      
      // 错误处理
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
      reconnectDelay: 2000,
      maxReconnects: 3,
    };

    // 从库配置（如果启用）
    this.slaveConfig = {
      ...this.masterConfig,
      host: this.configService.get('DB_SLAVE_HOST', this.masterConfig.host),
      port: parseInt(this.configService.get('DB_SLAVE_PORT', this.masterConfig.port)),
      user: this.configService.get('DB_SLAVE_USERNAME', 'mobilif_read'),
      password: this.configService.get('DB_SLAVE_PASSWORD', 'MobiLiF@2025!'),
      connectionLimit: Math.ceil(this.masterConfig.connectionLimit * 0.7), // 从库连接数稍少
    };

    this.readWriteSeparation = this.configService.get('DB_READ_WRITE_SEPARATION', 'true') === 'true';
  }

  /**
   * 初始化数据库连接
   */
  async initialize() {
    try {
      console.log('正在初始化数据库连接...');
      
      // 创建主库连接池
      this.masterPool = mysql.createPool(this.masterConfig);
      console.log('✅ 主数据库连接池创建成功');

      // 创建从库连接池（如果启用读写分离）
      if (this.readWriteSeparation && this.slaveConfig.host !== this.masterConfig.host) {
        this.slavePool = mysql.createPool(this.slaveConfig);
        console.log('✅ 从数据库连接池创建成功');
      } else {
        this.slavePool = this.masterPool; // 使用主库作为读库
        console.log('📝 使用主库进行读操作');
      }

      // 测试连接
      await this.testConnection();
      
      this.isConnected = true;
      console.log('🎉 数据库连接初始化完成');
      
      // 设置连接事件监听
      this.setupEventListeners();
      
      return true;
    } catch (error) {
      console.error('❌ 数据库连接初始化失败:', error);
      throw error;
    }
  }

  /**
   * 测试数据库连接
   */
  async testConnection() {
    try {
      // 测试主库连接
      const masterConnection = await this.masterPool.getConnection();
      await masterConnection.ping();
      masterConnection.release();
      console.log('✅ 主数据库连接测试成功');

      // 测试从库连接
      if (this.slavePool !== this.masterPool) {
        const slaveConnection = await this.slavePool.getConnection();
        await slaveConnection.ping();
        slaveConnection.release();
        console.log('✅ 从数据库连接测试成功');
      }
      
      return true;
    } catch (error) {
      console.error('❌ 数据库连接测试失败:', error);
      throw error;
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 主库事件监听
    this.masterPool.on('connection', (connection) => {
      console.log(`🔗 主库新连接建立: ${connection.threadId}`);
    });

    this.masterPool.on('error', (error) => {
      console.error('❌ 主库连接错误:', error);
      if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        this.handleConnectionLost('master');
      }
    });

    // 从库事件监听
    if (this.slavePool !== this.masterPool) {
      this.slavePool.on('connection', (connection) => {
        console.log(`🔗 从库新连接建立: ${connection.threadId}`);
      });

      this.slavePool.on('error', (error) => {
        console.error('❌ 从库连接错误:', error);
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
          this.handleConnectionLost('slave');
        }
      });
    }
  }

  /**
   * 处理连接丢失
   */
  async handleConnectionLost(type) {
    console.log(`⚠️ ${type}库连接丢失，尝试重新连接...`);
    
    try {
      if (type === 'master') {
        await this.masterPool.end();
        this.masterPool = mysql.createPool(this.masterConfig);
      } else {
        await this.slavePool.end();
        this.slavePool = mysql.createPool(this.slaveConfig);
      }
      
      console.log(`✅ ${type}库重新连接成功`);
    } catch (error) {
      console.error(`❌ ${type}库重新连接失败:`, error);
    }
  }

  /**
   * 获取读连接（从库）
   */
  async getReadConnection() {
    if (!this.isConnected) {
      throw new Error('数据库未初始化');
    }
    
    try {
      return await this.slavePool.getConnection();
    } catch (error) {
      console.warn('从库连接失败，切换到主库:', error.message);
      return await this.masterPool.getConnection();
    }
  }

  /**
   * 获取写连接（主库）
   */
  async getWriteConnection() {
    if (!this.isConnected) {
      throw new Error('数据库未初始化');
    }
    
    return await this.masterPool.getConnection();
  }

  /**
   * 执行查询（自动选择读/写连接）
   */
  async query(sql, params = [], options = {}) {
    const { forceWrite = false, transaction = null } = options;
    
    // 如果在事务中或强制写入，使用主库
    if (transaction || forceWrite || this.isWriteQuery(sql)) {
      const connection = transaction || await this.getWriteConnection();
      try {
        const [rows, fields] = await connection.execute(sql, params);
        return { rows, fields };
      } finally {
        if (!transaction) {
          connection.release();
        }
      }
    } else {
      // 读操作使用从库
      const connection = await this.getReadConnection();
      try {
        const [rows, fields] = await connection.execute(sql, params);
        return { rows, fields };
      } finally {
        connection.release();
      }
    }
  }

  /**
   * 判断是否为写操作
   */
  isWriteQuery(sql) {
    const writePatterns = [
      /^\s*(INSERT|UPDATE|DELETE|REPLACE|ALTER|CREATE|DROP|TRUNCATE)\s+/i,
      /^\s*CALL\s+/i, // 存储过程可能包含写操作
    ];
    
    return writePatterns.some(pattern => pattern.test(sql));
  }

  /**
   * 开始事务
   */
  async beginTransaction() {
    const connection = await this.getWriteConnection();
    await connection.beginTransaction();
    
    // 添加事务管理方法
    connection.commit = connection.commit.bind(connection);
    connection.rollback = connection.rollback.bind(connection);
    connection.release = (() => {
      const originalRelease = connection.release.bind(connection);
      return () => {
        originalRelease();
      };
    })();
    
    return connection;
  }

  /**
   * 执行事务
   */
  async transaction(callback) {
    const connection = await this.beginTransaction();
    
    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * 批量执行SQL
   */
  async batchExecute(sqls, options = {}) {
    const { useTransaction = true } = options;
    
    if (useTransaction) {
      return await this.transaction(async (connection) => {
        const results = [];
        for (const { sql, params } of sqls) {
          const [rows] = await connection.execute(sql, params || []);
          results.push(rows);
        }
        return results;
      });
    } else {
      const results = [];
      for (const { sql, params } of sqls) {
        const { rows } = await this.query(sql, params, { forceWrite: true });
        results.push(rows);
      }
      return results;
    }
  }

  /**
   * 获取数据库状态信息
   */
  async getStatus() {
    try {
      const masterStatus = await this.getMasterStatus();
      const slaveStatus = this.slavePool !== this.masterPool ? await this.getSlaveStatus() : null;
      
      return {
        isConnected: this.isConnected,
        readWriteSeparation: this.readWriteSeparation,
        master: masterStatus,
        slave: slaveStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        isConnected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 获取主库状态
   */
  async getMasterStatus() {
    const connection = await this.masterPool.getConnection();
    try {
      const [status] = await connection.execute('SHOW STATUS LIKE "Threads_connected"');
      const [variables] = await connection.execute('SHOW VARIABLES LIKE "max_connections"');
      
      return {
        threadsConnected: parseInt(status[0]?.Value || 0),
        maxConnections: parseInt(variables[0]?.Value || 0),
        poolSize: this.masterPool._allConnections?.length || 0,
        freeConnections: this.masterPool._freeConnections?.length || 0,
      };
    } finally {
      connection.release();
    }
  }

  /**
   * 获取从库状态
   */
  async getSlaveStatus() {
    const connection = await this.slavePool.getConnection();
    try {
      const [status] = await connection.execute('SHOW STATUS LIKE "Threads_connected"');
      const [slaveStatus] = await connection.execute('SHOW SLAVE STATUS');
      
      return {
        threadsConnected: parseInt(status[0]?.Value || 0),
        poolSize: this.slavePool._allConnections?.length || 0,
        freeConnections: this.slavePool._freeConnections?.length || 0,
        slaveIORunning: slaveStatus[0]?.Slave_IO_Running === 'Yes',
        slaveSQLRunning: slaveStatus[0]?.Slave_SQL_Running === 'Yes',
        secondsBehindMaster: slaveStatus[0]?.Seconds_Behind_Master,
      };
    } catch (error) {
      return { error: error.message };
    } finally {
      connection.release();
    }
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      // 检查主库
      const masterConnection = await this.masterPool.getConnection();
      await masterConnection.ping();
      masterConnection.release();
      
      // 检查从库
      if (this.slavePool !== this.masterPool) {
        const slaveConnection = await this.slavePool.getConnection();
        await slaveConnection.ping();
        slaveConnection.release();
      }
      
      return { healthy: true, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 关闭所有连接
   */
  async close() {
    try {
      console.log('正在关闭数据库连接...');
      
      if (this.masterPool) {
        await this.masterPool.end();
        console.log('✅ 主数据库连接池已关闭');
      }
      
      if (this.slavePool && this.slavePool !== this.masterPool) {
        await this.slavePool.end();
        console.log('✅ 从数据库连接池已关闭');
      }
      
      this.isConnected = false;
      console.log('🔌 数据库连接已关闭');
    } catch (error) {
      console.error('❌ 关闭数据库连接时出错:', error);
      throw error;
    }
  }
}

/**
 * TypeORM 配置
 */
const getTypeOrmConfig = (configService) => ({
  type: 'mysql',
  host: configService.get('DB_HOST', 'localhost'),
  port: parseInt(configService.get('DB_PORT', '3306')),
  username: configService.get('DB_USERNAME', 'mobilif_app'),
  password: configService.get('DB_PASSWORD', 'MobiLiF@2025!'),
  database: configService.get('DB_DATABASE', 'mobilif'),
  charset: 'utf8mb4',
  timezone: '+08:00',
  
  // 实体文件
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  
  // 自动同步（生产环境应设为false）
  synchronize: configService.get('NODE_ENV') !== 'production',
  
  // 日志配置
  logging: configService.get('QUERY_LOGGING', 'false') === 'true',
  logger: 'file',
  
  // 连接池配置
  extra: {
    connectionLimit: parseInt(configService.get('DB_POOL_MAX', '50')),
    acquireTimeout: parseInt(configService.get('DB_POOL_ACQUIRE_TIMEOUT', '60000')),
    timeout: parseInt(configService.get('DB_POOL_IDLE_TIMEOUT', '30000')),
    reconnect: true,
    charset: 'utf8mb4_unicode_ci',
  },
  
  // 迁移配置
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  
  // CLI配置
  cli: {
    migrationsDir: 'src/database/migrations',
    entitiesDir: 'src/entities',
  },
  
  // 缓存配置
  cache: {
    type: 'redis',
    options: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: parseInt(configService.get('REDIS_PORT', '6379')),
      password: configService.get('REDIS_PASSWORD'),
      db: parseInt(configService.get('REDIS_DB', '1')),
    },
    duration: 30000, // 30秒缓存
  },
});

/**
 * Sequelize 配置
 */
const getSequelizeConfig = (configService) => ({
  dialect: 'mysql',
  host: configService.get('DB_HOST', 'localhost'),
  port: parseInt(configService.get('DB_PORT', '3306')),
  username: configService.get('DB_USERNAME', 'mobilif_app'),
  password: configService.get('DB_PASSWORD', 'MobiLiF@2025!'),
  database: configService.get('DB_DATABASE', 'mobilif'),
  
  // 字符集配置
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  timezone: '+08:00',
  
  // 连接池配置
  pool: {
    max: parseInt(configService.get('DB_POOL_MAX', '50')),
    min: parseInt(configService.get('DB_POOL_MIN', '5')),
    acquire: parseInt(configService.get('DB_POOL_ACQUIRE_TIMEOUT', '60000')),
    idle: parseInt(configService.get('DB_POOL_IDLE_TIMEOUT', '30000')),
  },
  
  // 日志配置
  logging: configService.get('QUERY_LOGGING', 'false') === 'true' ? console.log : false,
  
  // 其他配置
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  
  // 读写分离配置
  replication: configService.get('DB_READ_WRITE_SEPARATION', 'true') === 'true' ? {
    read: [{
      host: configService.get('DB_SLAVE_HOST', configService.get('DB_HOST', 'localhost')),
      port: parseInt(configService.get('DB_SLAVE_PORT', configService.get('DB_PORT', '3306'))),
      username: configService.get('DB_SLAVE_USERNAME', 'mobilif_read'),
      password: configService.get('DB_SLAVE_PASSWORD', 'MobiLiF@2025!'),
    }],
    write: {
      host: configService.get('DB_HOST', 'localhost'),
      port: parseInt(configService.get('DB_PORT', '3306')),
      username: configService.get('DB_USERNAME', 'mobilif_app'),
      password: configService.get('DB_PASSWORD', 'MobiLiF@2025!'),
    }
  } : undefined,
});

module.exports = {
  DatabaseConfig,
  getTypeOrmConfig,
  getSequelizeConfig,
};