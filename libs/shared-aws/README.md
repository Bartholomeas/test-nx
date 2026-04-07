# shared-aws

Shared NestJS dynamic modules wrapping AWS SDK v3 clients. Each AWS service is exposed as an independent module with `forRoot()` / `forRootAsync()` registration and a singleton service.

## Modules

| Module         | Service         | AWS SDK Package          | Status  |
| -------------- | --------------- | ------------------------ | ------- |
| `S3Module`     | `S3Service`     | `@aws-sdk/client-s3`     | ✅ Stub |
| `SqsModule`    | `SqsService`    | `@aws-sdk/client-sqs`    | 🔜      |
| `LambdaModule` | `LambdaService` | `@aws-sdk/client-lambda` | 🔜      |

## Usage

Import the module in your app's root module using `forRootAsync` with `ConfigService`:

```typescript
import { S3Module } from '@mono-repo-backend/shared-aws';

@Module({
  imports: [
    S3Module.forRootAsync({
      useFactory: (config: ConfigService) => ({
        region: config.getOrThrow('AWS_REGION'),
        bucket: config.getOrThrow('S3_BUCKET'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

Then inject the service in any provider:

```typescript
@Injectable()
export class DocumentsService {
  constructor(private readonly s3: S3Service) {}

  async upload(file: Readable, filename: string): Promise<string> {
    const key = `documents/${Date.now()}-${filename}`;
    await this.s3.upload(key, file, 'application/pdf');
    return this.s3.getSignedDownloadUrl(key);
  }
}
```

## S3Service API

| Method                                         | Description                                     |
| ---------------------------------------------- | ----------------------------------------------- |
| `upload(key, body, contentType)`               | Upload a file to the configured bucket          |
| `getSignedDownloadUrl(key, expiresInSeconds?)` | Generate a presigned download URL (default: 1h) |
| `delete(key)`                                  | Delete an object from the bucket                |

> All methods are currently stubs that log operations. Real AWS SDK calls will be added when needed.

## Project Tags

`type:util`, `scope:shared`, `platform:server`
