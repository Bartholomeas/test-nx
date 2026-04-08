import { Inject, Injectable, Logger } from '@nestjs/common';

import type { S3ModuleOptions } from './s3.types';
import { S3_MODULE_OPTIONS } from './s3.types';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly bucket: string;
  private readonly region: string;

  constructor(@Inject(S3_MODULE_OPTIONS) options: S3ModuleOptions) {
    this.bucket = options.bucket;
    this.region = options.region;
    this.logger.log(`S3Service initialized — bucket: ${this.bucket}, region: ${this.region}`);
  }

  async upload(key: string, _body: Buffer, contentType: string): Promise<void> {
    this.logger.log(
      `[STUB] upload → bucket: ${this.bucket}, key: ${key}, contentType: ${contentType}`,
    );
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    this.logger.log(`[STUB] getSignedDownloadUrl → key: ${key}, expires: ${expiresInSeconds}s`);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}?stub=true`;
  }

  async delete(key: string): Promise<void> {
    this.logger.log(`[STUB] delete → bucket: ${this.bucket}, key: ${key}`);
  }
}
