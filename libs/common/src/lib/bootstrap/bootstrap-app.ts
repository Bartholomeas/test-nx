import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import type { Type } from '@nestjs/common';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface BootstrapOptions {
  appModule: Type;
  swagger: {
    title: string;
    description: string;
  };
}

// TODO: Add proper origins when they will be available
const CORS_ORIGINS: Record<string, string> = {
  local: '*',
  development: '*',
  qa: '*',
  staging: '*',
  production: '*',
};

export async function bootstrapApp({ appModule, swagger }: BootstrapOptions): Promise<void> {
  const app = await NestFactory.create(appModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  const NODE_ENV = configService.getOrThrow<string>('NODE_ENV');
  const APP_PORT = configService.getOrThrow<number>('PORT');

  app.useLogger(app.get(Logger));

  if (NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(swagger.title)
      .setDescription(swagger.description)
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableCors({
    origin: CORS_ORIGINS[NODE_ENV],
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
  app.get(Logger).log(`🚀 Application is running on: http://localhost:${APP_PORT}`);
}
