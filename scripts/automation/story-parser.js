#!/usr/bin/env node

/**
 * 用户故事解析器
 * 解析用户故事并生成技术任务
 */

const fs = require('fs');
const path = require('path');

class StoryParser {
  constructor() {
    this.businessDomains = {
      'user': ['用户', '登录', '注册', '个人资料', '账户'],
      'gym': ['健身房', '场馆', '健身', '设施', '器材'],
      'booking': ['预约', '预订', '时间', '课程', '教练'],
      'game': ['积分', '成就', '等级', '排行榜', '挑战'],
      'social': ['社交', '朋友', '分享', '评论', '互动'],
      'payment': ['支付', '费用', '会员', '订单', '账单']
    };
    
    this.techComponents = {
      'user': {
        backend: ['AuthModule', 'UserModule', 'UserController', 'UserService'],
        frontend: ['AuthComponent', 'ProfileComponent', 'LoginForm'],
        database: ['users', 'user_profiles', 'auth_tokens']
      },
      'gym': {
        backend: ['GymModule', 'GymController', 'GymService'],
        frontend: ['GymListComponent', 'GymCardComponent', 'GymSearchComponent'],
        database: ['gyms', 'gym_facilities', 'gym_programs']
      },
      'booking': {
        backend: ['BookingModule', 'BookingController', 'BookingService'],
        frontend: ['BookingComponent', 'CalendarComponent', 'TimeSlotComponent'],
        database: ['bookings', 'time_slots', 'booking_status']
      },
      'game': {
        backend: ['GameModule', 'GameController', 'GameService', 'AchievementService'],
        frontend: ['GameComponent', 'AchievementComponent', 'LeaderboardComponent'],
        database: ['user_points', 'achievements', 'game_records']
      },
      'social': {
        backend: ['SocialModule', 'SocialController', 'SocialService'],
        frontend: ['SocialComponent', 'FeedComponent', 'CommentComponent'],
        database: ['social_posts', 'comments', 'user_friends']
      },
      'payment': {
        backend: ['PaymentModule', 'PaymentController', 'PaymentService'],
        frontend: ['PaymentComponent', 'OrderComponent', 'InvoiceComponent'],
        database: ['orders', 'payments', 'invoices']
      }
    };
  }

  /**
   * 解析用户故事
   * @param {string} userStory - 用户故事文本
   * @returns {Object} 解析结果
   */
  parseUserStory(userStory) {
    console.log(`📝 解析用户故事: ${userStory}`);
    
    // 提取用户故事组件
    const storyComponents = this.extractStoryComponents(userStory);
    
    // 识别业务域
    const businessDomain = this.identifyBusinessDomain(userStory);
    
    // 生成技术任务
    const technicalTasks = this.generateTechnicalTasks(storyComponents, businessDomain);
    
    // 生成API变更
    const apiChanges = this.generateApiChanges(storyComponents, businessDomain);
    
    // 生成数据库变更
    const dbChanges = this.generateDbChanges(storyComponents, businessDomain);
    
    const result = {
      userStory,
      storyComponents,
      businessDomain,
      technicalTasks,
      apiChanges,
      dbChanges,
      estimatedHours: this.estimateEffort(technicalTasks),
      priority: this.determinePriority(userStory),
      testCases: this.generateTestCases(storyComponents, businessDomain)
    };
    
    console.log(`✅ 解析完成，识别业务域: ${businessDomain}`);
    return result;
  }

  /**
   * 提取用户故事组件
   */
  extractStoryComponents(userStory) {
    const patterns = {
      role: /作为\s*([^，,]*)/,
      goal: /我希望\s*([^，,]*)/,
      benefit: /以便\s*([^，,]*)/
    };
    
    const components = {};
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = userStory.match(pattern);
      components[key] = match ? match[1].trim() : '';
    }
    
    return components;
  }

  /**
   * 识别业务域
   */
  identifyBusinessDomain(userStory) {
    const scores = {};
    
    for (const [domain, keywords] of Object.entries(this.businessDomains)) {
      scores[domain] = 0;
      keywords.forEach(keyword => {
        if (userStory.includes(keyword)) {
          scores[domain]++;
        }
      });
    }
    
    // 返回得分最高的业务域
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  }

  /**
   * 生成技术任务
   */
  generateTechnicalTasks(components, domain) {
    const techComponents = this.techComponents[domain] || this.techComponents['user'];
    
    return {
      backend: techComponents.backend.map(component => ({
        component,
        action: this.determineAction(components.goal),
        files: this.generateBackendFiles(component, domain)
      })),
      frontend: techComponents.frontend.map(component => ({
        component,
        action: this.determineAction(components.goal),
        files: this.generateFrontendFiles(component, domain)
      })),
      database: techComponents.database.map(table => ({
        table,
        action: this.determineDatabaseAction(components.goal),
        migrations: this.generateMigrationFiles(table, domain)
      }))
    };
  }

  /**
   * 确定操作类型
   */
  determineAction(goal) {
    if (goal.includes('创建') || goal.includes('添加') || goal.includes('新增')) {
      return 'create';
    } else if (goal.includes('修改') || goal.includes('更新') || goal.includes('编辑')) {
      return 'update';
    } else if (goal.includes('删除') || goal.includes('移除')) {
      return 'delete';
    } else if (goal.includes('查看') || goal.includes('显示') || goal.includes('列表')) {
      return 'read';
    }
    return 'create'; // 默认为创建
  }

  /**
   * 确定数据库操作类型
   */
  determineDatabaseAction(goal) {
    const action = this.determineAction(goal);
    const migrations = [];
    
    switch (action) {
      case 'create':
        migrations.push('create_table', 'add_indexes');
        break;
      case 'update':
        migrations.push('alter_table', 'add_column');
        break;
      case 'delete':
        migrations.push('drop_column');
        break;
      default:
        migrations.push('create_table');
    }
    
    return migrations;
  }

  /**
   * 生成后端文件列表
   */
  generateBackendFiles(component, domain) {
    const basePath = `src/modules/${domain}`;
    
    if (component.includes('Controller')) {
      return [`${basePath}/${domain}.controller.ts`];
    } else if (component.includes('Service')) {
      return [`${basePath}/${domain}.service.ts`];
    } else if (component.includes('Module')) {
      return [`${basePath}/${domain}.module.ts`];
    }
    
    return [`${basePath}/${component.toLowerCase()}.ts`];
  }

  /**
   * 生成前端文件列表
   */
  generateFrontendFiles(component, domain) {
    const basePath = `frontend/src/components/${domain}`;
    
    return [
      `${basePath}/${component}.tsx`,
      `${basePath}/${component}.test.tsx`,
      `${basePath}/${component}.styles.ts`
    ];
  }

  /**
   * 生成迁移文件
   */
  generateMigrationFiles(table, domain) {
    const timestamp = Date.now();
    return [
      `prisma/migrations/${timestamp}_${table}_${domain}.sql`
    ];
  }

  /**
   * 生成API变更
   */
  generateApiChanges(components, domain) {
    const action = this.determineAction(components.goal);
    const endpoints = [];
    
    switch (action) {
      case 'create':
        endpoints.push(`POST /api/${domain}s`);
        break;
      case 'read':
        endpoints.push(`GET /api/${domain}s`);
        endpoints.push(`GET /api/${domain}s/:id`);
        break;
      case 'update':
        endpoints.push(`PUT /api/${domain}s/:id`);
        endpoints.push(`PATCH /api/${domain}s/:id`);
        break;
      case 'delete':
        endpoints.push(`DELETE /api/${domain}s/:id`);
        break;
    }
    
    return {
      endpoints,
      authentication: this.requiresAuth(domain),
      rateLimit: this.requiresRateLimit(domain),
      validation: this.generateValidationRules(components, domain)
    };
  }

  /**
   * 生成数据库变更
   */
  generateDbChanges(components, domain) {
    const tables = this.techComponents[domain]?.database || [];
    
    return {
      tables: tables.map(table => ({
        name: table,
        action: this.determineDatabaseAction(components.goal),
        columns: this.generateColumns(domain, table),
        indexes: this.generateIndexes(domain, table),
        relations: this.generateRelations(domain, table)
      })),
      seeds: this.generateSeeds(domain)
    };
  }

  /**
   * 生成列定义
   */
  generateColumns(domain, table) {
    const commonColumns = [
      { name: 'id', type: 'UUID', nullable: false, primary: true },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ];

    const domainColumns = {
      'gym': [
        { name: 'name', type: 'VARCHAR(255)', nullable: false },
        { name: 'address', type: 'TEXT', nullable: true },
        { name: 'latitude', type: 'DECIMAL(10,8)', nullable: true },
        { name: 'longitude', type: 'DECIMAL(11,8)', nullable: true }
      ],
      'user': [
        { name: 'username', type: 'VARCHAR(100)', nullable: false, unique: true },
        { name: 'email', type: 'VARCHAR(255)', nullable: false, unique: true },
        { name: 'password_hash', type: 'VARCHAR(255)', nullable: false }
      ],
      'booking': [
        { name: 'user_id', type: 'UUID', nullable: false },
        { name: 'gym_id', type: 'UUID', nullable: false },
        { name: 'booking_time', type: 'TIMESTAMP', nullable: false },
        { name: 'status', type: 'ENUM', nullable: false }
      ]
    };

    return [...commonColumns, ...(domainColumns[domain] || [])];
  }

  /**
   * 生成索引
   */
  generateIndexes(domain, table) {
    const indexes = ['idx_created_at'];
    
    const domainIndexes = {
      'gym': ['idx_location', 'idx_name'],
      'user': ['idx_email', 'idx_username'],
      'booking': ['idx_user_id', 'idx_gym_id', 'idx_booking_time']
    };
    
    return [...indexes, ...(domainIndexes[domain] || [])];
  }

  /**
   * 生成关联关系
   */
  generateRelations(domain, table) {
    const relations = {
      'booking': [
        { type: 'belongsTo', model: 'User', foreignKey: 'user_id' },
        { type: 'belongsTo', model: 'Gym', foreignKey: 'gym_id' }
      ],
      'gym': [
        { type: 'hasMany', model: 'Booking', foreignKey: 'gym_id' }
      ],
      'user': [
        { type: 'hasMany', model: 'Booking', foreignKey: 'user_id' }
      ]
    };
    
    return relations[domain] || [];
  }

  /**
   * 生成种子数据
   */
  generateSeeds(domain) {
    return [`seeds/${domain}_seed_data.sql`];
  }

  /**
   * 检查是否需要认证
   */
  requiresAuth(domain) {
    const publicDomains = ['gym']; // 公开访问的域
    return !publicDomains.includes(domain);
  }

  /**
   * 检查是否需要速率限制
   */
  requiresRateLimit(domain) {
    const highTrafficDomains = ['gym', 'booking'];
    return highTrafficDomains.includes(domain);
  }

  /**
   * 生成验证规则
   */
  generateValidationRules(components, domain) {
    const rules = {
      'gym': {
        name: 'required|string|max:255',
        address: 'string',
        latitude: 'numeric|between:-90,90',
        longitude: 'numeric|between:-180,180'
      },
      'user': {
        username: 'required|string|min:3|max:50|unique',
        email: 'required|email|unique',
        password: 'required|string|min:8'
      },
      'booking': {
        gym_id: 'required|uuid|exists:gyms,id',
        booking_time: 'required|date|after:now',
        status: 'required|in:pending,confirmed,cancelled'
      }
    };
    
    return rules[domain] || {};
  }

  /**
   * 估算工作量
   */
  estimateEffort(technicalTasks) {
    let hours = 0;
    
    // 后端任务
    hours += technicalTasks.backend.length * 2;
    
    // 前端任务
    hours += technicalTasks.frontend.length * 3;
    
    // 数据库任务
    hours += technicalTasks.database.length * 1;
    
    return Math.max(hours, 1); // 最少1小时
  }

  /**
   * 确定优先级
   */
  determinePriority(userStory) {
    if (userStory.includes('紧急') || userStory.includes('立即')) {
      return 'high';
    } else if (userStory.includes('重要') || userStory.includes('关键')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * 生成测试用例
   */
  generateTestCases(components, domain) {
    const action = this.determineAction(components.goal);
    
    const testCases = {
      unit: [
        `${domain}Service should ${action} ${domain} successfully`,
        `${domain}Controller should handle ${action} request`,
        `${domain}Validation should validate input data`
      ],
      integration: [
        `${domain} API should ${action} ${domain} with valid data`,
        `${domain} API should reject invalid data`,
        `${domain} API should handle authentication`
      ],
      e2e: [
        `User should be able to ${action} ${domain} from UI`,
        `${components.role} should see ${components.goal} result`,
        `System should provide ${components.benefit}`
      ]
    };
    
    return testCases;
  }
}

// 主执行函数
async function main() {
  const userStory = process.argv[2];
  
  if (!userStory) {
    console.error('❌ 请提供用户故事');
    console.error('使用方法: node story-parser.js "用户故事"');
    process.exit(1);
  }
  
  try {
    const parser = new StoryParser();
    const result = parser.parseUserStory(userStory);
    
    // 输出结果到GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      const output = process.env.GITHUB_OUTPUT;
      fs.appendFileSync(output, `features=${JSON.stringify(result.technicalTasks)}\n`);
      fs.appendFileSync(output, `api_changes=${JSON.stringify(result.apiChanges)}\n`);
      fs.appendFileSync(output, `db_changes=${JSON.stringify(result.dbChanges)}\n`);
    }
    
    // 保存解析结果
    const outputFile = path.join(process.cwd(), 'story-analysis.json');
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    
    console.log('📊 解析结果已保存到 story-analysis.json');
    console.log('🎯 预估工作量:', result.estimatedHours, '小时');
    console.log('📈 优先级:', result.priority);
    
  } catch (error) {
    console.error('❌ 解析失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { StoryParser };