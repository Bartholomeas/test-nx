# Product Overview — CMS-15 Backend Monorepo

## Purpose

NestJS-based backend monorepo managed by Nx, providing API services for a multi-tenant portal system (CMS-15). The project delivers separate backend applications for distinct user roles while maximizing code reuse through shared libraries.

## Key Features

- **Multi-app architecture**: Three independent NestJS backend apps (users2, manage2, admin2) sharing common code via Nx libraries
- **Authentication & Authorization**: JWT-based auth with httpOnly cookie management, role-based access (admin, manage, user), and shared base auth service with per-app extensibility
- **Database Layer**: PostgreSQL with TypeORM, read/write connection splitting (primary + readonly), snake_case naming strategy, and migration management
- **AWS Integration**: S3 file operations (upload, signed URLs, delete), Lambda and SQS clients, ECR container registry, ECS deployment
- **Domain-Driven Validation**: Composable `DomainRule` interface with `DomainRuleValidator` supporting fail-fast and collect-all-errors strategies
- **Structured Error Handling**: Centralized `AllExceptionsFilter` with typed `ErrorResponseBody`, request ID tracking, and custom exception hierarchy (`AppException` → `DomainException`)
- **API Documentation**: Swagger/OpenAPI auto-generated in non-production environments
- **Security**: Helmet headers, CORS configuration, ValidationPipe with whitelist/forbidNonWhitelisted, ClassSerializerInterceptor
- **Structured Logging**: Pino logger via nestjs-pino with production/development modes

## Target Users & Ports

| Application     | Audience       | Port |
| --------------- | -------------- | ---- |
| users2-backend  | End users      | 8000 |
| manage2-backend | Managers       | 8001 |
| admin2-backend  | Administrators | 8002 |

## Deployment Model

- Dockerized (node:24-alpine, multi-stage builds) → AWS ECR → AWS ECS
- GitHub Actions CI/CD with Nx affected detection for selective builds
- Environment-based pipelines: development, QA, staging, production
- Independent versioning per app with conventional commits and automated changelogs
