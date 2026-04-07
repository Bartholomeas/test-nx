export interface S3ModuleOptions {
  region: string;
  bucket: string;
}

export const S3_MODULE_OPTIONS = Symbol.for('S3_MODULE_OPTIONS');
