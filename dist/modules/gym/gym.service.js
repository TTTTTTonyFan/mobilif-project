"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GymService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let GymService = GymService_1 = class GymService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GymService_1.name);
    }
    async findNearbyGyms(params) {
        const { lat, lng, city, radius = 10, keyword, gymType, programs, sortBy = 'distance', page = 1, pageSize = 20, } = params;
        try {
            const whereCondition = {
                status: 1,
                deletedAt: null,
            };
            if (city) {
                whereCondition.city = {
                    contains: city,
                    mode: 'insensitive',
                };
            }
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
            if (gymType) {
                whereCondition.gymType = gymType;
            }
            if (programs) {
                const programArray = programs.split(',').map(p => p.trim());
                whereCondition.supportedPrograms = {
                    path: '$',
                    array_contains: programArray,
                };
            }
            const skip = (page - 1) * pageSize;
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
            const processedGyms = await Promise.all(gyms.map(async (gym) => {
                const distance = lat && lng
                    ? this.calculateDistance(lat, lng, Number(gym.latitude), Number(gym.longitude))
                    : null;
                const businessStatus = this.getBusinessStatus(gym.openingHours);
                return {
                    id: gym.id.toString(),
                    uuid: gym.uuid,
                    name: gym.name,
                    nameEn: gym.nameEn,
                    description: gym.shortDescription,
                    address: gym.address,
                    city: gym.city,
                    district: gym.district,
                    distance: distance ? Math.round(distance * 100) / 100 : null,
                    rating: Number(gym.rating),
                    reviewCount: gym.reviewCount,
                    businessStatus: businessStatus.status,
                    todayHours: businessStatus.todayHours,
                    gymType: this.getGymTypeLabel(gym.gymType),
                    crossfitCertified: gym.crossfitCertified,
                    supportedPrograms: gym.supportedPrograms || [],
                    tags: gym.tags || [],
                    logo: gym.logo,
                    images: gym.images || [],
                    phone: gym.phone,
                    verified: gym.verified,
                    featured: gym.featured,
                };
            }));
            if (sortBy === 'distance' && lat && lng) {
                processedGyms.sort((a, b) => {
                    if (a.distance === null)
                        return 1;
                    if (b.distance === null)
                        return -1;
                    return a.distance - b.distance;
                });
            }
            let currentCity = city;
            if (lat && lng && !city) {
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
        }
        catch (error) {
            this.logger.error(`Failed to find nearby gyms: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSupportedCities() {
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
        }
        catch (error) {
            this.logger.error(`Failed to get supported cities: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSupportedCountries() {
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
            const countries = {};
            result.forEach(item => {
                if (!countries[item.country]) {
                    countries[item.country] = [];
                }
                if (!countries[item.country].includes(item.city)) {
                    countries[item.country].push(item.city);
                }
            });
            return countries;
        }
        catch (error) {
            this.logger.error(`Failed to get supported countries: ${error.message}`, error.stack);
            throw error;
        }
    }
    getOrderBy(sortBy, lat, lng) {
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
                return [
                    { featured: 'desc' },
                    { rating: 'desc' },
                    { reviewCount: 'desc' },
                ];
        }
    }
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLng = this.deg2rad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    getBusinessStatus(openingHours) {
        if (!openingHours) {
            return { status: '营业时间未知', todayHours: '营业时间未知' };
        }
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        const dayOfWeek = now.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayKey = dayNames[dayOfWeek];
        const todayHours = openingHours[todayKey];
        if (!todayHours || todayHours === 'closed') {
            return { status: '今日休息', todayHours: '今日休息' };
        }
        const timeRanges = todayHours.split(',').map((range) => range.trim());
        let isOpen = false;
        for (const range of timeRanges) {
            const [startTime, endTime] = range.split('-');
            if (!startTime || !endTime)
                continue;
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
    getGymTypeLabel(gymType) {
        const typeMap = {
            'crossfit_certified': 'CrossFit认证场馆',
            'comprehensive': '综合训练馆',
            'specialty': '专项训练馆',
        };
        return typeMap[gymType] || '综合训练馆';
    }
};
exports.GymService = GymService;
exports.GymService = GymService = GymService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GymService);
//# sourceMappingURL=gym.service.js.map