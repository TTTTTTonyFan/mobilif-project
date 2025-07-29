#!/usr/bin/env node

/**
 * 代码生成器
 * 基于用户故事解析结果生成前后端代码
 */

const fs = require('fs');
const path = require('path');

class CodeGenerator {
  constructor() {
    this.templates = {
      backend: {
        controller: this.getControllerTemplate(),
        service: this.getServiceTemplate(),
        module: this.getModuleTemplate(),
        dto: this.getDtoTemplate(),
        entity: this.getEntityTemplate()
      },
      frontend: {
        component: this.getComponentTemplate(),
        service: this.getFrontendServiceTemplate(),
        types: this.getTypesTemplate(),
        test: this.getTestTemplate()
      },
      database: {
        migration: this.getMigrationTemplate(),
        seed: this.getSeedTemplate()
      }
    };
  }

  /**
   * 生成代码
   */
  async generateCode(features, apiChanges, dbChanges) {
    console.log('🔧 开始生成代码...');
    
    const results = {
      backend: [],
      frontend: [],
      database: [],
      tests: []
    };

    // 解析JSON字符串
    if (typeof features === 'string') features = JSON.parse(features);
    if (typeof apiChanges === 'string') apiChanges = JSON.parse(apiChanges);
    if (typeof dbChanges === 'string') dbChanges = JSON.parse(dbChanges);

    // 生成后端代码
    for (const task of features.backend || []) {
      const files = await this.generateBackendFiles(task);
      results.backend.push(...files);
    }

    // 生成前端代码
    for (const task of features.frontend || []) {
      const files = await this.generateFrontendFiles(task);
      results.frontend.push(...files);
    }

    // 生成数据库迁移
    for (const table of dbChanges.tables || []) {
      const files = await this.generateDatabaseFiles(table);
      results.database.push(...files);
    }

    // 生成测试文件
    const testFiles = await this.generateTestFiles(features, apiChanges, dbChanges);
    results.tests.push(...testFiles);

    console.log('✅ 代码生成完成');
    return results;
  }

  /**
   * 生成后端文件
   */
  async generateBackendFiles(task) {
    console.log(`📝 生成后端文件: ${task.component}`);
    
    const files = [];
    const domain = this.extractDomainFromComponent(task.component);
    
    for (const filePath of task.files) {
      let template = '';
      let content = '';
      
      if (filePath.includes('controller')) {
        template = this.templates.backend.controller;
        content = this.populateControllerTemplate(template, domain, task);
      } else if (filePath.includes('service')) {
        template = this.templates.backend.service;
        content = this.populateServiceTemplate(template, domain, task);
      } else if (filePath.includes('module')) {
        template = this.templates.backend.module;
        content = this.populateModuleTemplate(template, domain, task);
      } else if (filePath.includes('dto')) {
        template = this.templates.backend.dto;
        content = this.populateDtoTemplate(template, domain, task);
      }
      
      if (content) {
        await this.ensureDirectoryExists(filePath);
        fs.writeFileSync(filePath, content);
        files.push(filePath);
        console.log(`✅ 创建文件: ${filePath}`);
      }
    }
    
    return files;
  }

  /**
   * 生成前端文件
   */
  async generateFrontendFiles(task) {
    console.log(`📱 生成前端文件: ${task.component}`);
    
    const files = [];
    const domain = this.extractDomainFromComponent(task.component);
    
    for (const filePath of task.files) {
      let template = '';
      let content = '';
      
      if (filePath.includes('.tsx')) {
        template = this.templates.frontend.component;
        content = this.populateComponentTemplate(template, domain, task);
      } else if (filePath.includes('.test.tsx')) {
        template = this.templates.frontend.test;
        content = this.populateTestTemplate(template, domain, task);
      } else if (filePath.includes('service')) {
        template = this.templates.frontend.service;
        content = this.populateFrontendServiceTemplate(template, domain, task);
      }
      
      if (content) {
        await this.ensureDirectoryExists(filePath);
        fs.writeFileSync(filePath, content);
        files.push(filePath);
        console.log(`✅ 创建文件: ${filePath}`);
      }
    }
    
    return files;
  }

  /**
   * 生成数据库文件
   */
  async generateDatabaseFiles(table) {
    console.log(`🗄️ 生成数据库文件: ${table.name}`);
    
    const files = [];
    
    // 生成迁移文件
    if (table.action.includes('create_table')) {
      const migrationPath = `prisma/migrations/${Date.now()}_create_${table.name}.sql`;
      const migrationContent = this.generateMigrationContent(table);
      
      await this.ensureDirectoryExists(migrationPath);
      fs.writeFileSync(migrationPath, migrationContent);
      files.push(migrationPath);
      console.log(`✅ 创建迁移文件: ${migrationPath}`);
    }
    
    // 更新Prisma schema
    await this.updatePrismaSchema(table);
    
    return files;
  }

  /**
   * 生成测试文件
   */
  async generateTestFiles(features, apiChanges, dbChanges) {
    console.log('🧪 生成测试文件...');
    
    const files = [];
    
    // 为每个后端模块生成测试
    for (const task of features.backend || []) {
      const domain = this.extractDomainFromComponent(task.component);
      const testPath = `src/modules/${domain}/${domain}.service.spec.ts`;
      const testContent = this.generateServiceTestContent(domain, task);
      
      await this.ensureDirectoryExists(testPath);
      fs.writeFileSync(testPath, testContent);
      files.push(testPath);
    }
    
    // 生成API测试
    if (apiChanges.endpoints) {
      const apiTestPath = `tests/integration/api.test.js`;
      const apiTestContent = this.generateApiTestContent(apiChanges);
      
      await this.ensureDirectoryExists(apiTestPath);
      fs.writeFileSync(apiTestPath, apiTestContent);
      files.push(apiTestPath);
    }
    
    return files;
  }

  /**
   * 控制器模板
   */
  getControllerTemplate() {
    return `import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { {{ServiceName}} } from './{{domain}}.service';
import { Create{{EntityName}}Dto, Update{{EntityName}}Dto, {{EntityName}}QueryDto } from './dto/{{domain}}.dto';
import { {{EntityName}} } from './entities/{{domain}}.entity';

@ApiTags('{{domain}}s')
@Controller('api/{{domain}}s')
export class {{ControllerName}} {
  constructor(private readonly {{serviceName}}: {{ServiceName}}) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create {{domain}}' })
  @ApiResponse({ status: 201, description: '{{EntityName}} created successfully', type: {{EntityName}} })
  async create(@Body() createDto: Create{{EntityName}}Dto): Promise<{{EntityName}}> {
    return this.{{serviceName}}.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all {{domain}}s' })
  @ApiResponse({ status: 200, description: 'List of {{domain}}s', type: [{{EntityName}}] })
  async findAll(@Query() query: {{EntityName}}QueryDto): Promise<{{EntityName}}[]> {
    return this.{{serviceName}}.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get {{domain}} by id' })
  @ApiResponse({ status: 200, description: '{{EntityName}} found', type: {{EntityName}} })
  @ApiResponse({ status: 404, description: '{{EntityName}} not found' })
  async findOne(@Param('id') id: string): Promise<{{EntityName}}> {
    return this.{{serviceName}}.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update {{domain}}' })
  @ApiResponse({ status: 200, description: '{{EntityName}} updated successfully', type: {{EntityName}} })
  async update(@Param('id') id: string, @Body() updateDto: Update{{EntityName}}Dto): Promise<{{EntityName}}> {
    return this.{{serviceName}}.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete {{domain}}' })
  @ApiResponse({ status: 200, description: '{{EntityName}} deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.{{serviceName}}.remove(id);
  }
}`;
  }

  /**
   * 服务模板
   */
  getServiceTemplate() {
    return `import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { {{EntityName}} } from './entities/{{domain}}.entity';
import { Create{{EntityName}}Dto, Update{{EntityName}}Dto, {{EntityName}}QueryDto } from './dto/{{domain}}.dto';

@Injectable()
export class {{ServiceName}} {
  constructor(
    @InjectRepository({{EntityName}})
    private readonly {{entityName}}Repository: Repository<{{EntityName}}>,
  ) {}

  async create(createDto: Create{{EntityName}}Dto): Promise<{{EntityName}}> {
    try {
      const {{entityName}} = this.{{entityName}}Repository.create(createDto);
      return await this.{{entityName}}Repository.save({{entityName}});
    } catch (error) {
      throw new BadRequestException('Failed to create {{domain}}');
    }
  }

  async findAll(query: {{EntityName}}QueryDto): Promise<{{EntityName}}[]> {
    const queryBuilder = this.{{entityName}}Repository.createQueryBuilder('{{entityName}}');
    
    // Add query filters based on the query parameters
    if (query.search) {
      queryBuilder.andWhere('{{entityName}}.name LIKE :search', { search: \`%\${query.search}%\` });
    }
    
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    
    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<{{EntityName}}> {
    const {{entityName}} = await this.{{entityName}}Repository.findOne({ where: { id } });
    
    if (!{{entityName}}) {
      throw new NotFoundException(\`{{EntityName}} with ID \${id} not found\`);
    }
    
    return {{entityName}};
  }

  async update(id: string, updateDto: Update{{EntityName}}Dto): Promise<{{EntityName}}> {
    const {{entityName}} = await this.findOne(id);
    
    Object.assign({{entityName}}, updateDto);
    
    try {
      return await this.{{entityName}}Repository.save({{entityName}});
    } catch (error) {
      throw new BadRequestException('Failed to update {{domain}}');
    }
  }

  async remove(id: string): Promise<void> {
    const {{entityName}} = await this.findOne(id);
    await this.{{entityName}}Repository.remove({{entityName}});
  }

  async count(query: {{EntityName}}QueryDto): Promise<number> {
    const queryBuilder = this.{{entityName}}Repository.createQueryBuilder('{{entityName}}');
    
    if (query.search) {
      queryBuilder.andWhere('{{entityName}}.name LIKE :search', { search: \`%\${query.search}%\` });
    }
    
    return await queryBuilder.getCount();
  }
}`;
  }

  /**
   * 模块模板
   */
  getModuleTemplate() {
    return `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {{ControllerName}} } from './{{domain}}.controller';
import { {{ServiceName}} } from './{{domain}}.service';
import { {{EntityName}} } from './entities/{{domain}}.entity';

@Module({
  imports: [TypeOrmModule.forFeature([{{EntityName}}])],
  controllers: [{{ControllerName}}],
  providers: [{{ServiceName}}],
  exports: [{{ServiceName}}],
})
export class {{ModuleName}} {}`;
  }

  /**
   * DTO模板
   */
  getDtoTemplate() {
    return `import { IsString, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class Create{{EntityName}}Dto {
  @ApiProperty({ description: '{{EntityName}} name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '{{EntityName}} description' })
  @IsOptional()
  @IsString()
  description?: string;

  // Add more properties based on the domain
}

export class Update{{EntityName}}Dto extends PartialType(Create{{EntityName}}Dto) {}

export class {{EntityName}}QueryDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Number of items to return' })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Number of items to skip' })
  @IsOptional()
  @IsNumber()
  offset?: number;
}

export class {{EntityName}}ResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}`;
  }

  /**
   * 实体模板
   */
  getEntityTemplate() {
    return `import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('{{tableName}}')
export class {{EntityName}} {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}`;
  }

  /**
   * React组件模板
   */
  getComponentTemplate() {
    return `import React, { useState, useEffect } from 'react';
import { {{EntityName}}Service } from '../../services/api/{{domain}}API';
import { {{EntityName}} } from '../../types/{{domain}}';
import LoadingSpinner from '../common/LoadingSpinner';

interface {{ComponentName}}Props {
  // Add props based on requirements
}

const {{ComponentName}}: React.FC<{{ComponentName}}Props> = () => {
  const [{{entityName}}s, set{{EntityName}}s] = useState<{{EntityName}}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await {{EntityName}}Service.getAll();
      set{{EntityName}}s(data);
    } catch (err) {
      setError('Failed to fetch {{domain}}s');
      console.error('Error fetching {{domain}}s:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="{{domain}}-list">
      <h2>{{EntityName}}s</h2>
      <div className="{{domain}}-grid">
        {{{entityName}}s.map(({{entityName}}) => (
          <div key={{{entityName}}.id} className="{{domain}}-card">
            <h3>{{{entityName}}.name}</h3>
            {{{entityName}}.description && <p>{{{entityName}}.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default {{ComponentName}};`;
  }

  /**
   * 前端服务模板
   */
  getFrontendServiceTemplate() {
    return `import { apiClient } from './client';
import { {{EntityName}} } from '../../types/{{domain}}';

export class {{EntityName}}Service {
  private static baseUrl = '/api/{{domain}}s';

  static async getAll(params?: any): Promise<{{EntityName}}[]> {
    const response = await apiClient.get(this.baseUrl, { params });
    return response.data;
  }

  static async getById(id: string): Promise<{{EntityName}}> {
    const response = await apiClient.get(\`\${this.baseUrl}/\${id}\`);
    return response.data;
  }

  static async create(data: Partial<{{EntityName}}>): Promise<{{EntityName}}> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  static async update(id: string, data: Partial<{{EntityName}}>): Promise<{{EntityName}}> {
    const response = await apiClient.put(\`\${this.baseUrl}/\${id}\`, data);
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.delete(\`\${this.baseUrl}/\${id}\`);
  }
}`;
  }

  /**
   * TypeScript类型模板
   */
  getTypesTemplate() {
    return `export interface {{EntityName}} {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Create{{EntityName}}Request {
  name: string;
  description?: string;
}

export interface Update{{EntityName}}Request extends Partial<Create{{EntityName}}Request> {}

export interface {{EntityName}}QueryParams {
  search?: string;
  limit?: number;
  offset?: number;
}`;
  }

  /**
   * 测试模板
   */
  getTestTemplate() {
    return `import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {{ComponentName}} from './{{ComponentName}}';
import { {{EntityName}}Service } from '../../services/api/{{domain}}API';

// Mock the service
jest.mock('../../services/api/{{domain}}API');
const mock{{EntityName}}Service = {{EntityName}}Service as jest.Mocked<typeof {{EntityName}}Service>;

describe('{{ComponentName}}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mock{{EntityName}}Service.getAll.mockReturnValue(Promise.resolve([]));
    render(<{{ComponentName}} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders {{domain}}s after loading', async () => {
    const mock{{EntityName}}s = [
      { id: '1', name: 'Test {{EntityName}}', createdAt: '2023-01-01', updatedAt: '2023-01-01' }
    ];
    mock{{EntityName}}Service.getAll.mockResolvedValue(mock{{EntityName}}s);

    render(<{{ComponentName}} />);

    await waitFor(() => {
      expect(screen.getByText('Test {{EntityName}}')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    mock{{EntityName}}Service.getAll.mockRejectedValue(new Error('API Error'));

    render(<{{ComponentName}} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch {{domain}}s')).toBeInTheDocument();
    });
  });
});`;
  }

  /**
   * 数据库迁移模板
   */
  getMigrationTemplate() {
    return `-- Create {{tableName}} table
CREATE TABLE IF NOT EXISTS {{tableName}} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_{{tableName}}_name ON {{tableName}}(name);
CREATE INDEX idx_{{tableName}}_created_at ON {{tableName}}(created_at);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_{{tableName}}_updated_at 
  BEFORE UPDATE ON {{tableName}} 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`;
  }

  /**
   * 种子数据模板
   */
  getSeedTemplate() {
    return `-- Seed data for {{tableName}}
INSERT INTO {{tableName}} (name, description) VALUES
  ('Sample {{EntityName}} 1', 'This is a sample {{domain}}'),
  ('Sample {{EntityName}} 2', 'Another sample {{domain}}'),
  ('Sample {{EntityName}} 3', 'Yet another sample {{domain}}');`;
  }

  // Helper methods

  extractDomainFromComponent(component) {
    return component.toLowerCase().replace(/controller|service|module/g, '').trim();
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  camelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  populateControllerTemplate(template, domain, task) {
    const entityName = this.capitalize(domain);
    const serviceName = this.camelCase(domain) + 'Service';
    const controllerName = this.capitalize(domain) + 'Controller';

    return template
      .replace(/{{domain}}/g, domain)
      .replace(/{{EntityName}}/g, entityName)
      .replace(/{{ServiceName}}/g, this.capitalize(serviceName))
      .replace(/{{serviceName}}/g, serviceName)
      .replace(/{{ControllerName}}/g, controllerName);
  }

  populateServiceTemplate(template, domain, task) {
    const entityName = this.capitalize(domain);
    const serviceName = this.capitalize(domain) + 'Service';

    return template
      .replace(/{{domain}}/g, domain)
      .replace(/{{EntityName}}/g, entityName)
      .replace(/{{ServiceName}}/g, serviceName)
      .replace(/{{entityName}}/g, this.camelCase(domain));
  }

  populateModuleTemplate(template, domain, task) {
    const entityName = this.capitalize(domain);
    const serviceName = this.capitalize(domain) + 'Service';
    const controllerName = this.capitalize(domain) + 'Controller';
    const moduleName = this.capitalize(domain) + 'Module';

    return template
      .replace(/{{domain}}/g, domain)
      .replace(/{{EntityName}}/g, entityName)
      .replace(/{{ServiceName}}/g, serviceName)
      .replace(/{{ControllerName}}/g, controllerName)
      .replace(/{{ModuleName}}/g, moduleName);
  }

  populateDtoTemplate(template, domain, task) {
    const entityName = this.capitalize(domain);

    return template
      .replace(/{{EntityName}}/g, entityName);
  }

  populateComponentTemplate(template, domain, task) {
    const entityName = this.capitalize(domain);
    const componentName = this.capitalize(task.component);

    return template
      .replace(/{{domain}}/g, domain)
      .replace(/{{EntityName}}/g, entityName)
      .replace(/{{entityName}}/g, this.camelCase(domain))
      .replace(/{{ComponentName}}/g, componentName);
  }

  populateTestTemplate(template, domain, task) {
    const entityName = this.capitalize(domain);
    const componentName = this.capitalize(task.component);

    return template
      .replace(/{{domain}}/g, domain)
      .replace(/{{EntityName}}/g, entityName)
      .replace(/{{ComponentName}}/g, componentName);
  }

  populateFrontendServiceTemplate(template, domain, task) {
    const entityName = this.capitalize(domain);

    return template
      .replace(/{{domain}}/g, domain)
      .replace(/{{EntityName}}/g, entityName);
  }

  generateMigrationContent(table) {
    const template = this.templates.database.migration;
    return template
      .replace(/{{tableName}}/g, table.name);
  }

  generateServiceTestContent(domain, task) {
    return `import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${this.capitalize(domain)}Service } from './${domain}.service';
import { ${this.capitalize(domain)} } from './entities/${domain}.entity';

describe('${this.capitalize(domain)}Service', () => {
  let service: ${this.capitalize(domain)}Service;
  let repository: Repository<${this.capitalize(domain)}>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${this.capitalize(domain)}Service,
        {
          provide: getRepositoryToken(${this.capitalize(domain)}),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<${this.capitalize(domain)}Service>(${this.capitalize(domain)}Service);
    repository = module.get<Repository<${this.capitalize(domain)}>>(getRepositoryToken(${this.capitalize(domain)}));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests based on the task
});`;
  }

  generateApiTestContent(apiChanges) {
    let testContent = `const request = require('supertest');
const app = require('../../src/app');

describe('API Tests', () => {
`;

    for (const endpoint of apiChanges.endpoints) {
      const [method, path] = endpoint.split(' ');
      testContent += `
  it('should ${method} ${path}', async () => {
    const response = await request(app)
      .${method.toLowerCase()}('${path}')
      .expect(200);
      
    // Add assertions based on expected response
  });
`;
    }

    testContent += '});';
    return testContent;
  }

  async updatePrismaSchema(table) {
    const schemaPath = 'prisma/schema.prisma';
    
    if (!fs.existsSync(schemaPath)) {
      console.log('⚠️ Prisma schema not found, skipping schema update');
      return;
    }
    
    // This is a simplified version - in real implementation,
    // you would parse and properly update the Prisma schema
    console.log(`📝 需要更新Prisma schema以添加 ${table.name} 表`);
  }

  async ensureDirectoryExists(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// 主执行函数
async function main() {
  const args = process.argv.slice(2);
  let features = '';
  let apiChanges = '';
  let dbChanges = '';

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--features' && i + 1 < args.length) {
      features = args[i + 1];
    } else if (args[i] === '--api-changes' && i + 1 < args.length) {
      apiChanges = args[i + 1];
    } else if (args[i] === '--db-changes' && i + 1 < args.length) {
      dbChanges = args[i + 1];
    }
  }

  if (!features && !apiChanges && !dbChanges) {
    console.error('❌ 请提供必要的参数');
    console.error('使用方法: node code-generator.js --features "{}" --api-changes "{}" --db-changes "{}"');
    process.exit(1);
  }

  try {
    const generator = new CodeGenerator();
    const results = await generator.generateCode(features, apiChanges, dbChanges);
    
    console.log('🎉 代码生成完成！');
    console.log(`📝 后端文件: ${results.backend.length}`);
    console.log(`📱 前端文件: ${results.frontend.length}`);
    console.log(`🗄️ 数据库文件: ${results.database.length}`);
    console.log(`🧪 测试文件: ${results.tests.length}`);
    
    // 保存生成结果
    const outputFile = path.join(process.cwd(), 'code-generation-result.json');
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log('📊 生成结果已保存到 code-generation-result.json');
    
  } catch (error) {
    console.error('❌ 代码生成失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { CodeGenerator };