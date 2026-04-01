import { CommonModule, createLoggerModuleConfig } from '@mono-repo-backend/common';
import { LoggerModule } from 'nestjs-pino';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({}),
    LoggerModule.forRoot(createLoggerModuleConfig(IS_PRODUCTION)),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
