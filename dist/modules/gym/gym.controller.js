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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GymController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const gym_service_1 = require("./gym.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const gym_dto_1 = require("./dto/gym.dto");
let GymController = GymController_1 = class GymController {
    constructor(gymService) {
        this.gymService = gymService;
        this.logger = new common_1.Logger(GymController_1.name);
    }
    async getGymList(params) {
        this.logger.log(`Fetching gym list with params: ${JSON.stringify(params)}`);
        try {
            if (params.lat && !params.lng) {
                throw new common_1.BadRequestException('经度参数不能为空');
            }
            if (params.lng && !params.lat) {
                throw new common_1.BadRequestException('纬度参数不能为空');
            }
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
        }
        catch (error) {
            this.logger.error(`Failed to fetch gym list: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSupportedCities() {
        this.logger.log('Fetching supported cities');
        try {
            const cities = await this.gymService.getSupportedCities();
            return {
                code: 0,
                message: 'success',
                data: cities,
                timestamp: Date.now(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch cities: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSupportedCountries() {
        this.logger.log('Fetching supported countries and cities');
        try {
            const countries = await this.gymService.getSupportedCountries();
            return {
                code: 0,
                message: 'success',
                data: countries,
                timestamp: Date.now(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch countries: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GymController = GymController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取附近场馆列表' }),
    (0, swagger_1.ApiQuery)({ name: 'lat', required: false, description: '纬度' }),
    (0, swagger_1.ApiQuery)({ name: 'lng', required: false, description: '经度' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: '城市名称' }),
    (0, swagger_1.ApiQuery)({ name: 'radius', required: false, description: '搜索半径(km)', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false, description: '关键词搜索' }),
    (0, swagger_1.ApiQuery)({ name: 'gymType', required: false, description: '场馆类型过滤' }),
    (0, swagger_1.ApiQuery)({ name: 'programs', required: false, description: '课程类型过滤，逗号分隔' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: '排序方式: distance|rating|name', enum: ['distance', 'rating', 'name'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, description: '每页数量', type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [gym_dto_1.GymSearchParamsDto]),
    __metadata("design:returntype", Promise)
], GymController.prototype, "getGymList", null);
__decorate([
    (0, common_1.Get)('cities'),
    (0, swagger_1.ApiOperation)({ summary: '获取支持的城市列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GymController.prototype, "getSupportedCities", null);
__decorate([
    (0, common_1.Get)('countries'),
    (0, swagger_1.ApiOperation)({ summary: '获取支持的国家列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GymController.prototype, "getSupportedCountries", null);
exports.GymController = GymController = GymController_1 = __decorate([
    (0, swagger_1.ApiTags)('Gym Management'),
    (0, common_1.Controller)('api/gyms'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [gym_service_1.GymService])
], GymController);
//# sourceMappingURL=gym.controller.js.map