# Technology Stack — CMS-15 Backend Monorepo

## Core Technologies

| Technology | Version | Purpose                       |
| ---------- | ------- | ----------------------------- |
| Node.js    | ≥24.0.0 | Runtime                       |
| TypeScript | ~5.9.2  | Language (strict mode)        |
| NestJS     | ^11.0.0 | Backend framework             |
| Nx         | 22.6.1  | Monorepo tooling              |
| TypeORM    | ^0.3.28 | ORM / Database                |
| PostgreSQL | latest  | Database (primary + readonly) |

## NestJS Ecosystem

- **@nestjs/config** ^4.0.3 — Environment configuration (global ConfigModule)
- **@nestjs/swagger** ^11.2.6 — OpenAPI documentation
- **@nestjs/typeorm** ^11.0.0 — TypeORM integration
- **@nestjs/schedule** ^6.1.1 — Cron/task scheduling
- **@nestjs/event-emitter** ^3.0.1 — Event-driven architecture
- **@nestjs/platform-express** ^11.0.0 — Express HTTP adapter

## Validation & Transformation

- **class-validator** ^0.14.4 — DTO validation decorators
- **class-transformer** ^0.5.1 — DTO transformation
- **joi** ^18.1.1 — Schema validation

## AWS SDK (^3.1017.0)

- **@aws-sdk/client-s3** — S3 operations
- **@aws-sdk/client-lambda** — Lambda invocations
- **@aws-sdk/client-sqs** — SQS messaging
- **@aws-sdk/s3-request-presigner** — Pre-signed URLs

## Security & HTTP

- **helmet** ^8.1.0 — Security headers
- **aws-jwt-verify** ^5.1.1 — JWT token verification
- **axios** ^1.6.0 — HTTP client

## Logging

- **nestjs-pino** ^4.6.1 — NestJS Pino integration
- **pino** ^10.3.1 / **pino-http** ^11.0.0 / **pino-pretty** ^13.1.3

## Database

- **pg** ^8.20.0 — PostgreSQL driver
- **typeorm-naming-strategies** ^4.1.0 — Snake case column naming

## Utilities

- **dayjs** ^1.11.20 — Date manipulation
- **rxjs** ^7.8.2 — Reactive extensions
- **reflect-metadata** ^0.1.14 — Decorator metadata
- **dotenv** ^17.3.1 — Environment variable loading

## Development Tools

| Tool                                  | Version         | Purpose                     |
| ------------------------------------- | --------------- | --------------------------- |
| Jest                                  | ^30.0.2         | Testing framework           |
| ts-jest                               | ^29.4.0         | TypeScript Jest transformer |
| ESLint                                | ^9.8.0          | Linting (flat config)       |
| Prettier                              | ~3.6.2          | Code formatting             |
| Husky                                 | ^9.1.7          | Git hooks                   |
| lint-staged                           | ^16.4.0         | Pre-commit linting          |
| commitlint                            | ^20.5.0         | Commit message linting      |
| SWC                                   | ~1.15.5         | Fast TS compilation         |
| Webpack                               | via @nx/webpack | Bundling                    |
| @trivago/prettier-plugin-sort-imports | ^6.0.2          | Import sorting              |

## Development Commands

```bash
# Serve
npm run dev:users2              # Serve users2-backend
npm run dev:admin2              # Serve admin2-backend
npm run dev:manage2             # Serve manage2-backend
npm run dev:all                 # Serve all in parallel

# Build
npm run build:all               # Build all apps
npm run build:users2            # Build users2 only
npm run build:affected          # Build Nx-affected apps

# Test
npm run test:all                # Run all tests
npm run test:affected           # Run tests for affected projects

# Lint
npm run lint:all                # Lint all projects
npm run lint:affected           # Lint affected projects
npm run lint:users2             # Lint users2 only

# Database Migrations (users2-backend data-source)
npm run migration:generate      # Generate migration from entity changes
npm run migration:run           # Run pending migrations
npm run migration:revert        # Revert last migration
npm run migration:show          # Show migration status

# Formatting
npm run format:check            # Check formatting
npm run format:write            # Fix formatting
```

## TypeScript Configuration

- Target: ES2021, Module: CommonJS
- Strict mode: `strict`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Decorators: `emitDecoratorMetadata`, `experimentalDecorators`
- Path aliases: `@mono-repo-backend/*` → `libs/*/src/index.ts`
- Module resolution: node

## CI/CD Pipeline

- **GitHub Actions** with reusable workflow pattern (`build.yml` called by `development.yml`)
- **Nx affected** detection via `nrwl/nx-set-shas` for selective builds
- **Docker** multi-stage builds: deps → builder (nx build) → runner (node:24-alpine)
- **AWS ECR** → **AWS ECS** deployment with task definition updates
- **Conventional commits** with commitlint scopes: `users2-backend`, `manage2-backend`, `admin2-backend`, `common`, `release`
- **Independent versioning** per app via Nx release with GitHub releases and changelogs
- Release commits skipped in CI via `chore(release):` prefix detection

## Docker Compose (Local Development)

| Service           | Port | Purpose          |
| ----------------- | ---- | ---------------- |
| users2-backend    | 8000 | User API         |
| manage2-backend   | 8001 | Manager API      |
| admin2-backend    | 8002 | Admin API        |
| postgres          | 5432 | Primary database |
| postgres-readonly | 5433 | Read replica     |
