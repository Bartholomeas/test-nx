import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);
  const configService = app.get(ConfigService);

  const NODE_ENV = configService.getOrThrow('NODE_ENV');
  const APP_PORT = configService.get('PORT');
  
  // TODO: Add proper origins when they will be available
  const CORS_ORIGINS = {
    local: '*',
    development: '*',
    qa: '*',
    staging: '*',
    production: '*',
  };

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Users2 API')
      .setDescription('Users backend API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableCors({
    origin: CORS_ORIGINS[NODE_ENV as keyof typeof CORS_ORIGINS],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: '*',
  });

  app.use(helmet());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(APP_PORT);
  Logger.log(
    `🚀 Application is running on: http://localhost:${APP_PORT}`,
  );
}

bootstrap();
