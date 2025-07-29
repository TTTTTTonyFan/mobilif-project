import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GymSearchParamsDto {
  @ApiPropertyOptional({ description: '纬度' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ description: '经度' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ description: '城市名称' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: '搜索半径(km)', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  radius?: number = 10;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ 
    description: '场馆类型过滤',
    enum: ['crossfit_certified', 'comprehensive', 'specialty']
  })
  @IsOptional()
  @IsEnum(['crossfit_certified', 'comprehensive', 'specialty'])
  gymType?: string;

  @ApiPropertyOptional({ description: '课程类型过滤，逗号分隔' })
  @IsOptional()
  @IsString()
  programs?: string;

  @ApiPropertyOptional({ 
    description: '排序方式',
    enum: ['distance', 'rating', 'name'],
    default: 'distance'
  })
  @IsOptional()
  @IsEnum(['distance', 'rating', 'name'])
  sortBy?: string = 'distance';

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export class GymListItemDto {
  @ApiProperty({ description: '场馆ID' })
  id: string;

  @ApiProperty({ description: '场馆UUID' })
  uuid: string;

  @ApiProperty({ description: '场馆名称' })
  name: string;

  @ApiPropertyOptional({ description: '场馆英文名称' })
  nameEn?: string;

  @ApiPropertyOptional({ description: '场馆简介' })
  description?: string;

  @ApiProperty({ description: '详细地址' })
  address: string;

  @ApiProperty({ description: '城市' })
  city: string;

  @ApiProperty({ description: '区域' })
  district: string;

  @ApiPropertyOptional({ description: '距离(km)' })
  distance?: number;

  @ApiProperty({ description: '评分' })
  rating: number;

  @ApiProperty({ description: '评价数量' })
  reviewCount: number;

  @ApiProperty({ description: '营业状态' })
  businessStatus: string;

  @ApiProperty({ description: '今日营业时间' })
  todayHours: string;

  @ApiProperty({ description: '场馆类型' })
  gymType: string;

  @ApiProperty({ description: '是否CrossFit认证' })
  crossfitCertified: boolean;

  @ApiProperty({ description: '支持的课程类型', type: [String] })
  supportedPrograms: string[];

  @ApiProperty({ description: '标签', type: [String] })
  tags: string[];

  @ApiPropertyOptional({ description: '场馆logo' })
  logo?: string;

  @ApiProperty({ description: '场馆图片', type: [String] })
  images: string[];

  @ApiPropertyOptional({ description: '联系电话' })
  phone?: string;

  @ApiProperty({ description: '是否认证' })
  verified: boolean;

  @ApiProperty({ description: '是否推荐' })
  featured: boolean;
}

export class PaginationDto {
  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;

  @ApiProperty({ description: '总数量' })
  total: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;

  @ApiProperty({ description: '是否有下一页' })
  hasNext: boolean;

  @ApiProperty({ description: '是否有上一页' })
  hasPrev: boolean;
}

export class GetGymListDto {
  @ApiProperty({ description: '场馆列表', type: [GymListItemDto] })
  list: GymListItemDto[];

  @ApiProperty({ description: '分页信息' })
  pagination: PaginationDto;

  @ApiProperty({ description: '当前城市' })
  currentCity: string;

  @ApiProperty({ description: '搜索参数' })
  searchParams: GymSearchParamsDto;
}