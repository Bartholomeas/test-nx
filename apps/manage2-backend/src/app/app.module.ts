import { CommonModule, createLoggerModuleConfig } from '@mono-repo-backend/common';
import { createPortalReadonlyConnection } from '@mono-repo-backend/database';
import { SharedErrorsModule } from '@mono-repo-backend/shared-errors';
import { LoggerModule } from 'nestjs-pino';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot(createLoggerModuleConfig(IS_PRODUCTION)),
    TypeOrmModule.forRootAsync(createPortalReadonlyConnection()),
    SharedErrorsModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
