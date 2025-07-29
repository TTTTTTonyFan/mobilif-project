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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetGymListDto = exports.PaginationDto = exports.GymListItemDto = exports.GymSearchParamsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GymSearchParamsDto {
    constructor() {
        this.radius = 10;
        this.sortBy = 'distance';
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.GymSearchParamsDto = GymSearchParamsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '纬度' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GymSearchParamsDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '经度' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GymSearchParamsDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '城市名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GymSearchParamsDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '搜索半径(km)', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], GymSearchParamsDto.prototype, "radius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关键词搜索' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GymSearchParamsDto.prototype, "keyword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '场馆类型过滤',
        enum: ['crossfit_certified', 'comprehensive', 'specialty']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['crossfit_certified', 'comprehensive', 'specialty']),
    __metadata("design:type", String)
], GymSearchParamsDto.prototype, "gymType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '课程类型过滤，逗号分隔' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GymSearchParamsDto.prototype, "programs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '排序方式',
        enum: ['distance', 'rating', 'name'],
        default: 'distance'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['distance', 'rating', 'name']),
    __metadata("design:type", String)
], GymSearchParamsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '页码', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GymSearchParamsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页数量', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GymSearchParamsDto.prototype, "pageSize", void 0);
class GymListItemDto {
}
exports.GymListItemDto = GymListItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场馆ID' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场馆UUID' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "uuid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场馆名称' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '场馆英文名称' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "nameEn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '场馆简介' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '详细地址' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '城市' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '区域' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "district", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '距离(km)' }),
    __metadata("design:type", Number)
], GymListItemDto.prototype, "distance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评分' }),
    __metadata("design:type", Number)
], GymListItemDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '评价数量' }),
    __metadata("design:type", Number)
], GymListItemDto.prototype, "reviewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '营业状态' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "businessStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '今日营业时间' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "todayHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场馆类型' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "gymType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否CrossFit认证' }),
    __metadata("design:type", Boolean)
], GymListItemDto.prototype, "crossfitCertified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '支持的课程类型', type: [String] }),
    __metadata("design:type", Array)
], GymListItemDto.prototype, "supportedPrograms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '标签', type: [String] }),
    __metadata("design:type", Array)
], GymListItemDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '场馆logo' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场馆图片', type: [String] }),
    __metadata("design:type", Array)
], GymListItemDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '联系电话' }),
    __metadata("design:type", String)
], GymListItemDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否认证' }),
    __metadata("design:type", Boolean)
], GymListItemDto.prototype, "verified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否推荐' }),
    __metadata("design:type", Boolean)
], GymListItemDto.prototype, "featured", void 0);
class PaginationDto {
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '当前页码' }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '每页数量' }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '总数量' }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '总页数' }),
    __metadata("design:type", Number)
], PaginationDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否有下一页' }),
    __metadata("design:type", Boolean)
], PaginationDto.prototype, "hasNext", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否有上一页' }),
    __metadata("design:type", Boolean)
], PaginationDto.prototype, "hasPrev", void 0);
class GetGymListDto {
}
exports.GetGymListDto = GetGymListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '场馆列表', type: [GymListItemDto] }),
    __metadata("design:type", Array)
], GetGymListDto.prototype, "list", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分页信息' }),
    __metadata("design:type", PaginationDto)
], GetGymListDto.prototype, "pagination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '当前城市' }),
    __metadata("design:type", String)
], GetGymListDto.prototype, "currentCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索参数' }),
    __metadata("design:type", GymSearchParamsDto)
], GetGymListDto.prototype, "searchParams", void 0);
//# sourceMappingURL=gym.dto.js.map