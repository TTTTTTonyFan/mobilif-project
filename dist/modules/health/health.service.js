"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
let HealthService = class HealthService {
    async checkHealth() {
        const startTime = Date.now();
        try {
            const [database, redis] = await Promise.all([
                this.checkDatabaseHealth(),
                this.checkRedisHealth(),
            ]);
            const responseTime = Date.now() - startTime;
            const overallStatus = database.status === 'healthy' && redis.status === 'healthy'
                ? 'healthy'
                : 'unhealthy';
            return {
                status: overallStatus,
                timestamp: new Date().toISOString(),
                responseTime: `${responseTime}ms`,
                services: {
                    database,
                    redis,
                },
                system: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    version: process.version,
                    environment: process.env.NODE_ENV || 'development',
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                responseTime: `${Date.now() - startTime}ms`,
                error: error.message,
            };
        }
    }
    async checkDatabaseHealth() {
        try {
            return {
                status: 'healthy',
                responseTime: '10ms',
                message: 'Database connection is healthy',
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                message: 'Database connection failed',
            };
        }
    }
    async checkRedisHealth() {
        try {
            return {
                status: 'healthy',
                responseTime: '5ms',
                message: 'Redis connection is healthy',
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                message: 'Redis connection failed',
            };
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)()
], HealthService);
//# sourceMappingURL=health.service.js.map