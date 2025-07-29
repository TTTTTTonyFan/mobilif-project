import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { GymService } from './gym.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetGymListDto, GymSearchParamsDto } from './dto/gym.dto';
import { ResponseDto } from '../../common/dto/response.dto';

@ApiTags('Gym Management')
@Controller('api/gyms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GymController {
  private readonly logger = new Logger(GymController.name);

  constructor(private readonly gymService: GymService) {}

  @Get()
  @ApiOperation({ summary: '获取附近场馆列表' })
  @ApiQuery({ name: 'lat', required: false, description: '纬度' })
  @ApiQuery({ name: 'lng', required: false, description: '经度' })
  @ApiQuery({ name: 'city', required: false, description: '城市名称' })
  @ApiQuery({ name: 'radius', required: false, description: '搜索半径(km)', type: Number })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词搜索' })
  @ApiQuery({ name: 'gymType', required: false, description: '场馆类型过滤' })
  @ApiQuery({ name: 'programs', required: false, description: '课程类型过滤，逗号分隔' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序方式: distance|rating|name', enum: ['distance', 'rating', 'name'] })
  @ApiQuery({ name: 'page', required: false, description: '页码', type: Number })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', type: Number })
  async getGymList(@Query() params: GymSearchParamsDto): Promise<ResponseDto<GetGymListDto>> {
    this.logger.log(`Fetching gym list with params: ${JSON.stringify(params)}`);

    try {
      // 参数验证
      if (params.lat && !params.lng) {
        throw new BadRequestException('经度参数不能为空');
      }
      if (params.lng && !params.lat) {
        throw new BadRequestException('纬度参数不能为空');
      }

      // 如果没有提供位置信息和城市信息，使用默认城市
      if (!params.lat && !params.lng && !params.city) {
        params.city = '北京';
      }

      const result = await this.gymService.findNearbyGyms(params);

      return {
        code: 0,
        message: 'success',
        data: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch gym list: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('cities')
  @ApiOperation({ summary: '获取支持的城市列表' })
  async getSupportedCities(): Promise<ResponseDto<string[]>> {
    this.logger.log('Fetching supported cities');

    try {
      const cities = await this.gymService.getSupportedCities();
      
      return {
        code: 0,
        message: 'success',
        data: cities,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch cities: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('countries')
  @ApiOperation({ summary: '获取支持的国家列表' })
  async getSupportedCountries(): Promise<ResponseDto<{ [key: string]: string[] }>> {
    this.logger.log('Fetching supported countries and cities');

    try {
      const countries = await this.gymService.getSupportedCountries();
      
      return {
        code: 0,
        message: 'success',
        data: countries,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch countries: ${error.message}`, error.stack);
      throw error;
    }
  }
}