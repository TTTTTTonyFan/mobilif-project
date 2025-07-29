import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建 Nest.js 应用
  const app = await NestFactory.create(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 启用 CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // 配置 Swagger 文档
  if (process.env.SWAGGER_ENABLED !== 'false') {
    const config = new DocumentBuilder()
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // 启动应用
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