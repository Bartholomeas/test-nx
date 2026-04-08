import { CommonModule, createLoggerModuleConfig } from '@mono-repo-backend/common';
import { createPortalConnection } from '@mono-repo-backend/database';
import { S3Module } from '@mono-repo-backend/shared-aws';
import { SharedErrorsModule } from '@mono-repo-backend/shared-errors';
import { LoggerModule } from 'nestjs-pino';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../features/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot(createLoggerModuleConfig(IS_PRODUCTION)),
    TypeOrmModule.forRootAsync(createPortalConnection()),
    S3Module.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        region: config.get('AWS_REGION', 'us-east-1'),
        bucket: config.get('S3_BUCKET', 'users2-backend-test'),
      }),
      inject: [ConfigService],
    }),
    SharedErrorsModule,
    CommonModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
