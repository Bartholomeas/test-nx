import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ConfigModule, ConfigService } from '@nestjs/config';
import type { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { PORTAL_ENTITIES } from '../entities';

export const DB_CONNECTIONS = {
  DEFAULT: 'default',
  READONLY: 'readonly',
} as const;

export function createPortalConnection(): TypeOrmModuleAsyncOptions {
  return {
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      type: 'postgres' as const,
      host: config.getOrThrow<string>('DB_HOST'),
      port: +config.getOrThrow<string>('DB_PORT'),
      username: config.getOrThrow<string>('DB_USERNAME'),
      password: config.getOrThrow<string>('DB_PASSWORD'),
      database: config.getOrThrow<string>('DB_NAME'),
      logging: false,
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
      entities: PORTAL_ENTITIES,
    }),
    inject: [ConfigService],
  };
}

export function createPortalReadonlyConnection(): TypeOrmModuleAsyncOptions {
  return {
    name: DB_CONNECTIONS.READONLY,
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      type: 'postgres' as const,
      host: config.getOrThrow<string>('DB_READONLY_HOST'),
      port: +config.getOrThrow<string>('DB_READONLY_PORT'),
      username: config.getOrThrow<string>('DB_READONLY_USERNAME'),
      password: config.getOrThrow<string>('DB_READONLY_PASSWORD'),
      database: config.getOrThrow<string>('DB_READONLY_NAME'),
      logging: false,
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
      entities: PORTAL_ENTITIES,
    }),
    inject: [ConfigService],
  };
}
