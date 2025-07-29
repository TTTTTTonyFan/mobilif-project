import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { GymSearchParamsDto, GetGymListDto, GymListItemDto } from './dto/gym.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GymService {
  private readonly logger = new Logger(GymService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findNearbyGyms(params: GymSearchParamsDto): Promise<GetGymListDto> {
    const {
      lat,
      lng,
      city,
      radius = 10,
      keyword,
      gymType,
      programs,
      sortBy = 'distance',
      page = 1,
      pageSize = 20,
    } = params;

    try {
      // 构建基础查询条件
      const whereCondition: Prisma.GymWhereInput = {
        status: 1, // 只显示营业中的场馆
        deletedAt: null,
      };

      // 城市过滤
      if (city) {
        whereCondition.city = {
          contains: city,
          mode: 'insensitive',
        };
      }

      // 关键词搜索
      if (keyword) {
        whereCondition.OR = [
          {
            name: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            nameEn: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            address: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        ];
      }

      // 场馆类型过滤
      if (gymType) {
        whereCondition.gymType = gymType as any;
      }

      // 课程类型过滤
      if (programs) {
        const programArray = programs.split(',').map(p => p.trim());
        whereCondition.supportedPrograms = {
          path: '$',
          array_contains: programArray,
        };
      }

      // 计算分页参数
      const skip = (page - 1) * pageSize;

      // 执行查询
      const [gyms, total] = await Promise.all([
        this.prisma.gym.findMany({
          where: whereCondition,
          select: {
            id: true,
            uuid: true,
            name: true,
            nameEn: true,
            shortDescription: true,
            address: true,
            district: true,
            city: true,
            province: true,
            country: true,
            latitude: true,
            longitude: true,
            phone: true,
            logo: true,
            images: true,
            openingHours: true,
            rating: true,
            reviewCount: true,
            gymType: true,
            crossfitCertified: true,
            supportedPrograms: true,
            tags: true,
            verified: true,
            featured: true,
            status: true,
            createdAt: true,
          },
          skip,
          take: pageSize,
          orderBy: this.getOrderBy(sortBy, lat, lng),
        }),
        this.prisma.gym.count({ where: whereCondition }),
      ]);

      // 处理数据并计算距离
      const processedGyms = await Promise.all(
        gyms.map(async (gym) => {
          const distance = lat && lng 
            ? this.calculateDistance(lat, lng, Number(gym.latitude), Number(gym.longitude))
            : null;

          const businessStatus = this.getBusinessStatus(gym.openingHours as any);

          return {
            id: gym.id.toString(),
            uuid: gym.uuid,
            name: gym.name,
            nameEn: gym.nameEn,
            description: gym.shortDescription,
            address: gym.address,
            city: gym.city,
            district: gym.district,
            distance: distance ? Math.round(distance * 100) / 100 : null, // 保留2位小数
            rating: Number(gym.rating),
            reviewCount: gym.reviewCount,
            businessStatus: businessStatus.status,
            todayHours: businessStatus.todayHours,
            gymType: this.getGymTypeLabel(gym.gymType as any),
            crossfitCertified: gym.crossfitCertified,
            supportedPrograms: gym.supportedPrograms as string[] || [],
            tags: gym.tags as string[] || [],
            logo: gym.logo,
            images: gym.images as string[] || [],
            phone: gym.phone,
            verified: gym.verified,
            featured: gym.featured,
          } as GymListItemDto;
        })
      );

      // 如果按距离排序且有位置信息，重新排序
      if (sortBy === 'distance' && lat && lng) {
        processedGyms.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      }

      // 获取用户当前城市（如果提供了位置信息）
      let currentCity = city;
      if (lat && lng && !city) {
        // 这里可以调用地理编码服务获取城市名称
        // 暂时使用第一个场馆的城市作为当前城市
        currentCity = processedGyms.length > 0 ? processedGyms[0].city : '未知';
      }

      return {
        list: processedGyms,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasNext: page < Math.ceil(total / pageSize),
          hasPrev: page > 1,
        },
        currentCity: currentCity || '北京',
        searchParams: params,
      };
    } catch (error) {
      this.logger.error(`Failed to find nearby gyms: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSupportedCities(): Promise<string[]> {
    try {
      const cities = await this.prisma.gym.groupBy({
        by: ['city'],
        where: {
          status: 1,
          deletedAt: null,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      return cities.map(item => item.city);
    } catch (error) {
      this.logger.error(`Failed to get supported cities: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSupportedCountries(): Promise<{ [key: string]: string[] }> {
    try {
      const result = await this.prisma.gym.groupBy({
        by: ['country', 'city'],
        where: {
          status: 1,
          deletedAt: null,
        },
        _count: {
          id: true,
        },
        orderBy: [
          {
            country: 'asc',
          },
          {
            _count: {
              id: 'desc',
            },
          },
        ],
      });

      const countries: { [key: string]: string[] } = {};
      
      result.forEach(item => {
        if (!countries[item.country]) {
          countries[item.country] = [];
        }
        if (!countries[item.country].includes(item.city)) {
          countries[item.country].push(item.city);
        }
      });

      return countries;
    } catch (error) {
      this.logger.error(`Failed to get supported countries: ${error.message}`, error.stack);
      throw error;
    }
  }

  private getOrderBy(sortBy: string, lat?: number, lng?: number): Prisma.GymOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'rating':
        return [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { featured: 'desc' },
        ];
      case 'name':
        return [
          { name: 'asc' },
        ];
      case 'distance':
      default:
        // 如果有位置信息，后续会在处理数据时重新排序
        // 这里先按照featured和rating排序
        return [
          { featured: 'desc' },
          { rating: 'desc' },
          { reviewCount: 'desc' },
        ];
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 地球半径，单位：公里
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private getBusinessStatus(openingHours: any): { status: string; todayHours: string } {
    if (!openingHours) {
      return { status: '营业时间未知', todayHours: '营业时间未知' };
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // 转换为分钟

    // 获取今天是星期几（0=周日，1=周一，...）
    const dayOfWeek = now.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayNames[dayOfWeek];

    const todayHours = openingHours[todayKey];
    
    if (!todayHours || todayHours === 'closed') {
      return { status: '今日休息', todayHours: '今日休息' };
    }

    // 解析营业时间，格式如 "06:00-22:00" 或 "06:00-12:00,14:00-22:00"
    const timeRanges = todayHours.split(',').map((range: string) => range.trim());
    let isOpen = false;

    for (const range of timeRanges) {
      const [startTime, endTime] = range.split('-');
      if (!startTime || !endTime) continue;

      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (currentTime >= startMinutes && currentTime <= endMinutes) {
        isOpen = true;
        break;
      }
    }

    return {
      status: isOpen ? '营业中' : '未营业',
      todayHours: todayHours,
    };
  }

  private getGymTypeLabel(gymType: string): string {
    const typeMap = {
      'crossfit_certified': 'CrossFit认证场馆',
      'comprehensive': '综合训练馆',
      'specialty': '专项训练馆',
    };
    return typeMap[gymType as keyof typeof typeMap] || '综合训练馆';
  }
}