import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '系统健康状态' })
  async getHealth() {
    return this.healthService.checkHealth();
  }

  @Get('database')
  @ApiOperation({ summary: '数据库健康检查' })
  @ApiResponse({ status: 200, description: '数据库连接状态' })
  async getDatabaseHealth() {
    return this.healthService.checkDatabaseHealth();
  }

  @Get('redis')
  @ApiOperation({ summary: 'Redis健康检查' })
  @ApiResponse({ status: 200, description: 'Redis连接状态' })
  async getRedisHealth() {
    return this.healthService.checkRedisHealth();
  }
}