import type { DynamicModule, InjectionToken, Type } from '@nestjs/common';
import { Module } from '@nestjs/common';

import { S3Service } from './s3.service';
import type { S3ModuleOptions } from './s3.types';
import { S3_MODULE_OPTIONS } from './s3.types';

export interface S3ModuleAsyncOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => S3ModuleOptions | Promise<S3ModuleOptions>;
  inject?: InjectionToken[];
  imports?: Type[];
}

@Module({})
export class S3Module {
  static forRoot(options: S3ModuleOptions): DynamicModule {
    return {
      module: S3Module,
      providers: [{ provide: S3_MODULE_OPTIONS, useValue: options }, S3Service],
      exports: [S3Service],
    };
  }

  static forRootAsync(options: S3ModuleAsyncOptions): DynamicModule {
    return {
      module: S3Module,
      imports: options.imports ?? [],
      providers: [
        {
          provide: S3_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        S3Service,
      ],
      exports: [S3Service],
    };
  }
}
