import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../features/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from "@ce-backend/common";

@Module({
  imports: [CommonModule, ConfigModule.forRoot({}), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
