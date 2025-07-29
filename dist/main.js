"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
    });
    if (process.env.SWAGGER_ENABLED !== 'false') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('MobiLiF API')
            .setDescription('MobiLiF 移动健身游戏化社交平台 API 文档')
            .setVersion('1.0.0')
            .addBearerAuth()
            .addTag('auth', '用户认证')
            .addTag('users', '用户管理')
            .addTag('gyms', '健身房管理')
            .addTag('classes', '课程管理')
            .addTag('bookings', '预订管理')
            .addTag('achievements', '成就系统')
            .addTag('social', '社交功能')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 MobiLiF API 服务已启动`);
    console.log(`📍 服务地址: http://localhost:${port}`);
    console.log(`📚 API文档: http://localhost:${port}/api/docs`);
    console.log(`❤️ 健康检查: http://localhost:${port}/health`);
}
bootstrap().catch((error) => {
    console.error('❌ 应用启动失败:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map