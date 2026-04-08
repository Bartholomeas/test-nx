# Project Structure — CMS-15 Backend Monorepo

## Root Layout

```
TEST_NX_BACKEND/
├── apps/                          # Application projects
│   ├── users2-backend/            # End-user API (port 8000) — most developed app
│   ├── manage2-backend/           # Manager API (port 8001)
│   └── admin2-backend/            # Admin API (port 8002)
├── libs/                          # Shared libraries (Nx)
│   ├── common/                    # Bootstrap, guards, interceptors, domain rules, logger
│   ├── database/                  # TypeORM entities, connections, migrations
│   ├── shared-auth/               # Auth DTOs and base auth service
│   ├── shared-aws/                # AWS service wrappers (S3 module)
│   ├── shared-errors/             # Exception hierarchy and global exception filter
│   └── shared-types/              # Shared enums (Role)
├── .github/workflows/             # CI/CD (development.yml, build.yml)
├── .amazonq/rules/                # Amazon Q coding rules and memory bank
├── .husky/                        # Git hooks (commitlint, lint-staged)
├── nx.json                        # Nx workspace config (plugins, release, boundaries)
├── docker-compose.yml             # Local dev: 3 apps + postgres + postgres-readonly
├── Dockerfile                     # Multi-stage production build (node:24-alpine)
├── tsconfig.base.json             # Shared TS config with path aliases
├── eslint.config.mjs              # Flat ESLint config with module boundary rules
├── .prettierrc                    # Prettier + import sorting
└── commitlint.config.ts           # Conventional commits with app scopes
```

## Application Internal Structure

```
apps/{app-name}/
├── src/
│   ├── app/                       # Root module, controller, service
│   │   ├── app.module.ts          # Imports: ConfigModule, TypeORM, Logger, shared modules, features
│   │   ├── app.controller.ts
│   │   └── app.service.ts
│   ├── features/                  # Feature modules (domain-specific)
│   │   └── {feature}/
│   │       ├── {feature}.controller.ts
│   │       ├── {feature}.service.ts
│   │       ├── {feature}.module.ts
│   │       └── {feature}.*.spec.ts
│   └── main.ts                    # Entry point — calls bootstrapApp() from common lib
├── data-source.ts                 # TypeORM CLI data source (for migrations)
├── project.json                   # Nx project config with tags
├── jest.config.cts                # Per-app Jest config
├── webpack.config.js              # Webpack build config
├── .env / .env.example            # Environment variables
└── tsconfig.*.json                # App-specific TS configs
```

## Shared Libraries (via `@mono-repo-backend/*` path aliases)

| Library       | Alias                              | Key Exports                                                                                                                     |
| ------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| common        | `@mono-repo-backend/common`        | `bootstrapApp()`, `JwtAuthGuard`, `DomainRuleValidator`, `DomainRule`, `CommonModule`, `createLoggerModuleConfig`               |
| database      | `@mono-repo-backend/database`      | `User` entity, `createPortalConnection()`, `createPortalReadonlyConnection()`, `DB_CONNECTIONS`, migrations                     |
| shared-auth   | `@mono-repo-backend/shared-auth`   | `BaseAuthService`, `LoginRequestDto`, `LoginResponseDto`, `RegisterRequestDto`, `RegisterResponseDto`, `UserProfileResponseDto` |
| shared-aws    | `@mono-repo-backend/shared-aws`    | `S3Module` (forRoot/forRootAsync), `S3Service`                                                                                  |
| shared-errors | `@mono-repo-backend/shared-errors` | `AppException`, `DomainException`, `AllExceptionsFilter`, `SharedErrorsModule`                                                  |
| shared-types  | `@mono-repo-backend/shared-types`  | `Role` enum (ADMIN, MANAGE, USER)                                                                                               |

## Nx Module Boundary Rules (eslint.config.mjs)

- `type:app` → depends on `type:util`, `type:feature`, `type:data-access`
- `type:util` → depends only on `type:util`
- `scope:user` → depends on `scope:shared`, `scope:user`
- `scope:manage` → depends on `scope:shared`, `scope:manage`
- `scope:admin` → depends on `scope:shared`, `scope:admin`
- `platform:server` → depends on `platform:server`, `platform:shared`

## Core Architectural Patterns

1. **Shared Bootstrap**: All apps call `bootstrapApp()` from common lib — ensures consistent Swagger, CORS, Helmet, ValidationPipe, ClassSerializerInterceptor, Pino logger setup
2. **Service Inheritance**: App services extend shared base services (e.g., `UsersAuthService extends BaseAuthService`)
3. **Dynamic Modules**: AWS/infrastructure modules use `forRoot()`/`forRootAsync()` pattern with ConfigService injection
4. **Factory Functions for DB**: `createPortalConnection()` / `createPortalReadonlyConnection()` return `TypeOrmModuleAsyncOptions`
5. **Domain Rule Composition**: `DomainRule` interface → `DomainRuleValidator.validate()` (fail-fast) or `.collect()` (gather all errors)
6. **Exception Hierarchy**: `AppException` (abstract) → `DomainException` (HTTP 400); `DomainRuleBrokenError` for rule validation failures
7. **Centralized Error Filter**: `AllExceptionsFilter` handles AppException, HttpException, and unknown errors with structured `ErrorResponseBody`
8. **Barrel Exports**: Each lib uses `index.ts` barrel files for clean public API
