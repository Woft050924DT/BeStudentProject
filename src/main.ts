import { NestFactory } from '@nestjs/core';
import { AppModule } from'./app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('NestJS API Swagger')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  // Cấu hình cookie parser
  app.use(cookieParser());

  // Cấu hình CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], 
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Cấu hình validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📡 Socket.IO server is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger UI available at: http://localhost:${port}/api/docs`);
  logger.log(`🔴 Redis connection configured`);
  logger.log(`🍪 Cookie parser enabled`);

  
}
void bootstrap();