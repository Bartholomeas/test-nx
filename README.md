# Portal — Multi-Portal Backend Monorepo

A multi-tenant backend platform providing three independent NestJS API applications within a single [Nx](https://nx.dev) monorepo. Each backend serves a different frontend portal while sharing common modules for authentication, domain validation, logging, and interceptors.

---

## Table of Contents

- [Applications](#applications)
- [Shared Libraries](#shared-libraries)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Scripts Reference](#scripts-reference)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Application Bootstrap](#application-bootstrap)
  - [Common Library](#common-library)
  - [Domain Rule Validation](#domain-rule-validation)
  - [JWT Authentication](#jwt-authentication)
  - [Logging](#logging)
  - [Swagger / OpenAPI](#swagger--openapi)
  - [Feature Module Pattern](#feature-module-pattern)
  - [Environment Variables](#environment-variables)
  - [Module Boundaries](#module-boundaries)
- [Testing](#testing)
- [Code Conventions](#code-conventions)
- [Linting and Formatting](#linting-and-formatting)
- [Commit Conventions](#commit-conventions)
- [Versioning & Release](#versioning--release)
- [Docker](#docker)
- [CI/CD](#cicd)
- [Adding a New Shared Library](#adding-a-new-shared-library)

---

## Applications

| App                 | Description                 | Default Port | Swagger Docs                 |
| ------------------- | --------------------------- | ------------ | ---------------------------- |
| **users2-backend**  | End-user API                | 8000         | `http://localhost:8000/docs` |
| **manage2-backend** | Operational management API  | 8001         | `http://localhost:8001/docs` |
| **admin2-backend**  | Internal administration API | 8002         | `http://localhost:8002/docs` |

Each application is a standalone NestJS app with its own module tree, environment config, Webpack build, and Swagger documentation. All apps share the `@mono-repo-backend/common` library.

---

## Shared Libraries

| Library    | Import Alias                | Purpose                                                                                            |
| ---------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| **common** | `@mono-repo-backend/common` | Shared NestJS module — JWT guard, domain rule validators, logging config, interceptors, decorators |

The common library is registered as a `@Global()` NestJS module, making its providers (like `DomainRuleValidator`) available across the entire app without explicit imports.

### What common provides

| Export                            | Description                                                |
| --------------------------------- | ---------------------------------------------------------- |
| `CommonModule`                    | Global NestJS module with domain validators                |
| `JwtAuthGuard`                    | Route guard that verifies Bearer JWT tokens                |
| `JwtVerifier` / `JWT_VERIFIER_DI` | Interface + DI token for pluggable JWT verification        |
| `DomainRule`                      | Interface for business rule validation                     |
| `DomainRuleValidator`             | Sequential rule validator with error collection            |
| `DomainRuleMultiValidator`        | Multi-rule validator that collects all broken rules        |
| `DomainRuleBrokenError`           | Typed `BadRequestException` with code, field, and context  |
| `LoggingInterceptor`              | HTTP request/response logging with request ID tracking     |
| `createLoggerModuleConfig`        | Pino logger configuration factory (pretty dev / JSON prod) |

---

## Tech Stack

### Core

| Technology | Version   | Purpose                                                 |
| ---------- | --------- | ------------------------------------------------------- |
| NestJS     | ^11.0.0   | Node.js framework (modules, DI, decorators)             |
| TypeScript | ~5.9.2    | Type safety                                             |
| Nx         | 22.6.1    | Monorepo orchestration, task caching, module boundaries |
| Node.js    | >= 24.0.0 | Runtime                                                 |

### Database & ORM

| Package                     | Purpose                    |
| --------------------------- | -------------------------- |
| `typeorm`                   | ORM for PostgreSQL         |
| `@nestjs/typeorm`           | NestJS TypeORM integration |
| `pg`                        | PostgreSQL driver          |
| `typeorm-naming-strategies` | Snake-case naming strategy |

### AWS SDK

| Package                         | Purpose               |
| ------------------------------- | --------------------- |
| `@aws-sdk/client-lambda`        | AWS Lambda invocation |
| `@aws-sdk/client-s3`            | S3 file storage       |
| `@aws-sdk/s3-request-presigner` | S3 presigned URLs     |
| `@aws-sdk/client-sqs`           | SQS message queuing   |

### API & Validation

| Package             | Purpose                              |
| ------------------- | ------------------------------------ |
| `@nestjs/swagger`   | OpenAPI/Swagger documentation        |
| `class-validator`   | DTO validation decorators            |
| `class-transformer` | DTO transformation and serialization |
| `joi`               | Schema validation (config)           |

### Security & HTTP

| Package          | Purpose                      |
| ---------------- | ---------------------------- |
| `helmet`         | HTTP security headers        |
| `aws-jwt-verify` | AWS Cognito JWT verification |
| `axios`          | HTTP client                  |

### Logging

| Package              | Purpose                        |
| -------------------- | ------------------------------ |
| `nestjs-pino`        | NestJS Pino logger integration |
| `pino` / `pino-http` | Structured JSON logging        |
| `pino-pretty`        | Pretty-printed dev logs        |

### Scheduling & Events

| Package                 | Purpose                       |
| ----------------------- | ----------------------------- |
| `@nestjs/schedule`      | Cron jobs and task scheduling |
| `@nestjs/event-emitter` | In-process event bus          |

### Build & Testing

| Tool    | Purpose                                  |
| ------- | ---------------------------------------- |
| Webpack | Application bundling (via `@nx/webpack`) |
| Jest    | Unit testing framework                   |
| ts-jest | TypeScript Jest transformer              |
| SWC     | Fast TypeScript compilation              |

### Developer Experience

| Tool                   | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| ESLint 9 (flat config) | Linting with Nx and TypeScript rules         |
| Prettier               | Code formatting with import sorting          |
| Husky                  | Git hooks (pre-commit, pre-push, commit-msg) |
| lint-staged            | Run linters on staged files only             |
| commitlint             | Enforce conventional commit messages         |

---

## Prerequisites

- **Node.js** >= 24.0.0
- **npm** >= 10.0.0
- **PostgreSQL** (local or via Docker)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Each app has a `.env.example` file. Copy it to `.env`:

```bash
cp apps/users2-backend/.env.example apps/users2-backend/.env
cp apps/manage2-backend/.env.example apps/manage2-backend/.env
cp apps/admin2-backend/.env.example apps/admin2-backend/.env
```

### 3. Start the database

```bash
docker compose up postgres -d
```

This starts a PostgreSQL instance on port `5432` with default credentials (`postgres`/`postgres`).

### 4. Start development

```bash
# All apps in parallel
npm run dev:all

# Individual apps
npm run dev:users2     # → http://localhost:8000
npm run dev:manage2    # → http://localhost:8001
npm run dev:admin2     # → http://localhost:8002
```

### 5. Access Swagger docs

Once running, visit:

- users2: `http://localhost:8000/docs`
- manage2: `http://localhost:8001/docs`
- admin2: `http://localhost:8002/docs`

Swagger is available in all environments except production.

---

## Scripts Reference

### Development

| Script                | Description              |
| --------------------- | ------------------------ |
| `npm run dev:all`     | Run all apps in parallel |
| `npm run dev:users2`  | Run users2-backend       |
| `npm run dev:manage2` | Run manage2-backend      |
| `npm run dev:admin2`  | Run admin2-backend       |

### Build

| Script                   | Description                  |
| ------------------------ | ---------------------------- |
| `npm run build:all`      | Build all apps in parallel   |
| `npm run build:users2`   | Build users2-backend         |
| `npm run build:manage2`  | Build manage2-backend        |
| `npm run build:admin2`   | Build admin2-backend         |
| `npm run build:affected` | Build only affected projects |

### Testing

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run test:all`      | Run all tests in parallel            |
| `npm run test:affected` | Run tests only for affected projects |

### Linting & Formatting

| Script                  | Description                      |
| ----------------------- | -------------------------------- |
| `npm run lint:all`      | Lint all projects                |
| `npm run lint:affected` | Lint only affected projects      |
| `npm run lint:users2`   | Lint users2-backend only         |
| `npm run lint:manage2`  | Lint manage2-backend only        |
| `npm run lint:admin2`   | Lint admin2-backend only         |
| `npm run format:write`  | Format all files with Prettier   |
| `npm run format:check`  | Check formatting without writing |

---

## Project Structure

```
mono-repo-backend/
├── apps/
│   ├── users2-backend/                # User-facing API
│   │   ├── src/
│   │   │   ├── app/                   # Root module, controller, service
│   │   │   │   ├── app.module.ts      # Root NestJS module
│   │   │   │   ├── app.controller.ts  # Health/root endpoints
│   │   │   │   └── app.service.ts     # Root service
│   │   │   ├── features/              # Domain feature modules
│   │   │   │   └── auth/              # Authentication feature
│   │   │   │       ├── dto/           # Request/response DTOs
│   │   │   │       ├── auth.module.ts
│   │   │   │       ├── auth.controller.ts
│   │   │   │       └── auth.service.ts
│   │   │   └── main.ts               # Application bootstrap
│   │   ├── .env.example               # Environment template
│   │   ├── jest.config.cts            # Jest configuration
│   │   ├── project.json               # Nx project metadata
│   │   ├── tsconfig.app.json          # App TypeScript config
│   │   ├── tsconfig.spec.json         # Test TypeScript config
│   │   └── webpack.config.js          # Webpack build config
│   ├── manage2-backend/               # Management API (same structure)
│   └── admin2-backend/                # Admin API (same structure)
├── libs/
│   └── common/                        # Shared NestJS library
│       └── src/
│           ├── lib/
│           │   ├── decorators/        # Custom decorators
│           │   ├── domain/            # Domain rule validation
│           │   │   ├── domain-rule.ts              # Rule interface
│           │   │   ├── domain-rule-validator.ts     # Sequential validator
│           │   │   ├── domain-rule-multi-validator.ts # Multi-rule validator
│           │   │   └── domain-rule-broken.error.ts  # Typed error
│           │   ├── guards/            # Authentication guards
│           │   │   ├── jwt.guard.ts                # JWT Bearer guard
│           │   │   └── jwt-verifier.ts             # Verifier interface + DI token
│           │   ├── interceptors/      # HTTP interceptors
│           │   │   └── logging.interceptor.ts      # Request logging
│           │   ├── logger/            # Logger configuration
│           │   │   └── logger.module-config.ts     # Pino config factory
│           │   └── common.module.ts   # Global NestJS module
│           └── index.ts               # Barrel export
├── .github/workflows/                 # CI/CD pipelines
│   ├── ci.yml                         # Continuous integration
│   ├── build.yml                      # Build pipeline
│   ├── development.yml                # Development deployment
│   └── release.yml                    # Release pipeline
├── .husky/                            # Git hooks
├── Dockerfile                         # Multi-stage Docker build (per-app)
├── docker-compose.yml                 # Local dev services (apps + PostgreSQL)
├── commitlint.config.ts               # Conventional commit rules
├── eslint.config.mjs                  # Root ESLint flat config
├── jest.config.ts                     # Root Jest config (Nx multi-project)
├── jest.preset.js                     # Shared Jest preset
├── nx.json                            # Nx workspace configuration
├── tsconfig.base.json                 # Base TypeScript config with path aliases
├── .prettierrc                        # Prettier config with import sorting
└── .editorconfig                      # Editor config (2-space indent, UTF-8)
```

---

## Architecture

### Application Bootstrap

Each app follows the same bootstrap pattern in `main.ts`:

1. Create NestJS app with `bufferLogs: true` for Pino
2. Configure structured logging via `nestjs-pino`
3. Enable CORS (environment-aware origins)
4. Set up Swagger/OpenAPI docs (non-production only)
5. Apply `helmet` for HTTP security headers
6. Register global `ClassSerializerInterceptor` for DTO serialization
7. Register global `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and `transform`
8. Listen on the configured port

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

### Common Library

The `@mono-repo-backend/common` library is a `@Global()` NestJS module. Import it once in the root `AppModule` and its providers are available everywhere:

```typescript
import { CommonModule, createLoggerModuleConfig } from '@mono-repo-backend/common';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({}),
    LoggerModule.forRoot(createLoggerModuleConfig(IS_PRODUCTION)),
  ],
})
export class AppModule {}
```

### Domain Rule Validation

Business rules are encapsulated as classes implementing the `DomainRule` interface:

```typescript
import { DomainRule } from '@mono-repo-backend/common';

export class UserMustBeActive implements DomainRule {
  constructor(private readonly user: User) {}

  async validate(): Promise<void> {
    if (!this.user.isActive) {
      throw new DomainRuleBrokenError('User must be active', 'USER_NOT_ACTIVE', 'status');
    }
  }
}
```

Two validators are available:

- `DomainRuleValidator` — validates rules sequentially, can collect all errors via `collect()`
- `DomainRuleMultiValidator` — validates all rules and returns all `DomainRuleBrokenError` instances

### JWT Authentication

The `JwtAuthGuard` extracts the Bearer token from the `Authorization` header and verifies it using a pluggable `JwtVerifier` (injected via `JWT_VERIFIER_DI` token). Each app provides its own verifier implementation (e.g., AWS Cognito):

```typescript
// In a feature module
{
  provide: JWT_VERIFIER_DI,
  useClass: CognitoJwtVerifier,
}
```

Apply the guard to routes:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Req() req) {
  return req.user; // { sub, username }
}
```

### Logging

Structured logging is powered by Pino via `nestjs-pino`:

- **Development**: Pretty-printed, colorized, single-line output with request ID tracking
- **Production**: JSON format for log aggregation services

The `LoggingInterceptor` logs every HTTP request with method, URL, duration, and request ID (from `x-request-id` header or auto-generated UUID).

### Swagger / OpenAPI

Each app auto-generates Swagger documentation from decorators. Available at `/docs` in non-production environments:

```typescript
const config = new DocumentBuilder()
  .setTitle('Users2 API')
  .setDescription('Users backend API')
  .setVersion('1.0')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

The frontend uses these OpenAPI specs (at `/docs-json`) to auto-generate typed API clients.

### Feature Module Pattern

Domain features live in `src/features/<domain>/` within each app:

```
features/
  <domain>/
    dto/                # Request/response DTOs with class-validator decorators
    <domain>.module.ts  # NestJS feature module
    <domain>.controller.ts
    <domain>.service.ts
    <domain>.controller.spec.ts
    <domain>.service.spec.ts
```

Conventions:

- Each feature is a self-contained NestJS module
- DTOs use `class-validator` decorators for validation and `class-transformer` for serialization
- Test files (`.spec.ts`) live next to the files they test
- Feature modules are imported in the root `AppModule`

### Environment Variables

Each app uses `@nestjs/config` with a `.env` file:

| Variable   | Description      | Example                              |
| ---------- | ---------------- | ------------------------------------ |
| `NODE_ENV` | Environment name | `local`, `development`, `production` |
| `PORT`     | Application port | `8000`, `8001`, `8002`               |

Additional variables (database, AWS, etc.) are added per-app as needed.

### Module Boundaries

Nx enforces dependency rules via `@nx/enforce-module-boundaries`:

- Apps can import from shared libraries
- Apps cannot import from other apps
- Libraries cannot import from apps

---

## Testing

Tests use Jest with `ts-jest` for TypeScript support. Each project has its own `jest.config.cts`.

```bash
# Run all tests
npm run test:all

# Run tests for affected projects only
npm run test:affected

# Run a specific project's tests
npx nx test users2-backend

# Run with coverage
npx nx test users2-backend --coverage
```

Test files use the `.spec.ts` extension and are co-located with the source files they test.

---

## Code Conventions

- All code, comments, and documentation in **English**
- **File naming**: kebab-case — `auth.controller.ts`, `login-request.dto.ts`
- **Test files**: `.spec.ts` extension, next to source files
- **DTOs**: Suffix with `.dto.ts` — `login-request.dto.ts`, `user-profile-response.dto.ts`
- **Modules**: One module per feature domain
- **Imports from common**: Always use `@mono-repo-backend/common` barrel export
- **Validation**: Use `class-validator` decorators on DTOs, never validate manually in controllers
- **Serialization**: Use `class-transformer` with `ClassSerializerInterceptor` (globally registered)

---

## Linting and Formatting

### ESLint (flat config)

Key rules enforced:

| Rule                            | Level | Description               |
| ------------------------------- | ----- | ------------------------- |
| `@nx/enforce-module-boundaries` | error | Architectural constraints |

All apps and libraries extend the root `eslint.config.mjs`.

### Prettier

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Import sorting is handled automatically by `@trivago/prettier-plugin-sort-imports`:

```
1. Node built-ins (node:)
2. NestJS packages (@nestjs/)
3. Workspace packages (@ce/)
4. Relative imports (./)
```

2-space indentation, UTF-8, trailing newlines (via `.editorconfig`).

### Running

```bash
npm run lint:all         # Lint everything
npm run lint:affected    # Lint only changed projects
npm run format:write     # Format all files
npm run format:check     # Check formatting
```

---

## Commit Conventions

Commits are enforced via [Conventional Commits](https://www.conventionalcommits.org/) using Husky + commitlint.

**Format**: `type(scope): description`

**Allowed scopes**: `users2-backend`, `manage2-backend`, `common`, `release`

**Examples**:

```
feat(users2-backend): add user profile endpoint
fix(common): handle missing request ID in logging interceptor
chore(common): update NestJS to v11
chore(release): users2-backend@1.2.0
```

### Git Hooks (Husky)

| Hook         | Action                                               |
| ------------ | ---------------------------------------------------- |
| `pre-commit` | Runs lint-staged (ESLint + Prettier on staged files) |
| `commit-msg` | Validates commit message format via commitlint       |
| `pre-push`   | Additional checks before push                        |

---

## Versioning & Release

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to drive **automatic versioning**, **changelog generation**, and **GitHub releases** via [Nx Release](https://nx.dev/features/manage-releases).

### How It Works

Each app (`users2-backend`, `manage2-backend`, `admin2-backend`) is versioned **independently**. Nx analyzes commit messages since the last release tag and determines the version bump per project based on the commit type and scope.

```
Commit message  →  Nx reads type + scope  →  Bumps version  →  Generates changelog  →  Creates git tag + GitHub release
```

### Commit Message Format

```
type(scope): description
```

- **type** — determines the version bump
- **scope** — determines which project is affected (required)
- **description** — short summary of the change

### Commit Types and Version Impact

| Type       | Version Bump      | When to Use                                |
| ---------- | ----------------- | ------------------------------------------ |
| `feat`     | **minor** (0.X.0) | New feature or capability                  |
| `fix`      | **patch** (0.0.X) | Bug fix                                    |
| `perf`     | **patch** (0.0.X) | Performance improvement                    |
| `refactor` | **patch** (0.0.X) | Code restructuring without behavior change |
| `docs`     | no release        | Documentation only                         |
| `style`    | no release        | Formatting, whitespace, semicolons         |
| `test`     | no release        | Adding or updating tests                   |
| `build`    | no release        | Build system or dependency changes         |
| `ci`       | no release        | CI/CD pipeline changes                     |
| `chore`    | no release        | Maintenance tasks                          |

**Breaking changes** → **major** bump (X.0.0). Add `BREAKING CHANGE:` in the commit footer or use `!` after the type:

```
feat(users2-backend)!: redesign authentication response

BREAKING CHANGE: The login endpoint response shape has changed.
The `token` field is now nested under `auth.accessToken`.
```

### Allowed Scopes

| Scope             | Affects Project     | Use For                                              |
| ----------------- | ------------------- | ---------------------------------------------------- |
| `users2-backend`  | users2-backend app  | Changes to the users2 API                            |
| `manage2-backend` | manage2-backend app | Changes to the manage2 API                           |
| `common`          | common library      | Changes to the shared common library                 |
| `release`         | —                   | Auto-generated release commits (do not use manually) |

> Scope is enforced as a warning (`scope-empty: [1, 'never']`). Always include a scope so Nx can correctly attribute the change to a project.

### Examples

```bash
# Feature → minor bump for users2-backend
git commit -m "feat(users2-backend): add password reset endpoint"

# Bug fix → patch bump for manage2-backend
git commit -m "fix(manage2-backend): handle null date in schedule response"

# Shared library change → no direct version bump (but affects dependents)
git commit -m "feat(common): add rate limiting interceptor"

# Breaking change → major bump for users2-backend
git commit -m "feat(users2-backend)!: replace REST auth endpoints with OAuth2 flow"

# Documentation only → no version bump
git commit -m "docs(users2-backend): update Swagger descriptions for auth endpoints"

# Multiple lines with body and footer
git commit -m "fix(users2-backend): handle expired refresh token gracefully" \
  -m "Previously the API would return a 500 when the refresh token expired." \
  -m "Now it returns a 401 with a clear error code."
```

### How Nx Determines What to Release

1. Nx finds the latest git tag for each project (e.g., `users2-backend@1.3.0`)
2. It collects all commits since that tag
3. It filters commits by scope to determine which projects are affected
4. It reads the commit type to calculate the version bump
5. It generates a changelog entry from the commit description
6. It creates a new git tag (`users2-backend@1.4.0`) and a GitHub release

### Release Configuration

Defined in `nx.json` under the `release` key:

```json
{
  "release": {
    "projectsRelationship": "independent",
    "projects": ["users2-backend", "manage2-backend", "admin2-backend"],
    "version": {
      "conventionalCommits": true
    },
    "changelog": {
      "projectChangelogs": {
        "createRelease": "github"
      }
    },
    "git": {
      "commitMessage": "chore(release): {projectName}@{version}",
      "tagPattern": "{projectName}@{version}"
    }
  }
}
```

- **Independent versioning** — each app has its own version, bumped only when it has relevant commits
- **Tag pattern** — `{projectName}@{version}` (e.g., `users2-backend@1.2.0`, `admin2-backend@2.0.0`)
- **Release commit** — auto-generated as `chore(release): users2-backend@1.2.0`
- **GitHub releases** — created automatically with the generated changelog as the body

### Running a Release

```bash
# Dry run — preview what would happen without making changes
npx nx release --dry-run

# Perform the release (version bump + changelog + git tag + GitHub release)
npx nx release

# Release a specific project only
npx nx release --projects=users2-backend
```

### Git Hooks Enforcement

| Hook         | What It Does                                                                         |
| ------------ | ------------------------------------------------------------------------------------ |
| `pre-commit` | Runs lint-staged (ESLint + Prettier on staged files)                                 |
| `commit-msg` | Validates the commit message format via commitlint — rejects non-conforming messages |
| `pre-push`   | Runs `nx affected:build` to verify affected projects build successfully              |

If your commit message doesn't match the format, the `commit-msg` hook will reject it:

```bash
# ❌ Rejected — missing scope
git commit -m "feat: add auth endpoint"

# ❌ Rejected — invalid scope
git commit -m "feat(backend): add auth endpoint"

# ✅ Accepted
git commit -m "feat(users2-backend): add auth endpoint"
```

### Quick Reference

```bash
# Feature (minor bump)
feat(scope): description

# Bug fix (patch bump)
fix(scope): description

# Breaking change (major bump)
feat(scope)!: description

# No release
docs(scope): description
chore(scope): description
test(scope): description
ci(scope): description
style(scope): description
build(scope): description
```

---

## Docker

### Individual builds

A shared multi-stage Dockerfile builds any app by passing the `APP_NAME` build argument:

```bash
# Build
docker build --build-arg APP_NAME=users2-backend -t portal-users-api .
docker build --build-arg APP_NAME=manage2-backend -t portal-manage-api .
docker build --build-arg APP_NAME=admin2-backend -t portal-admin-api .

# Run
docker run -p 8000:8000 portal-users-api
```

The Dockerfile uses three stages:

1. **deps** — Installs dependencies (`npm ci`)
2. **builder** — Copies source and runs `nx build` for the target app
3. **runner** — Minimal production image with only the bundled `main.js` and production dependencies

### Docker Compose

Run the full stack locally (all backends + PostgreSQL):

```bash
docker compose up
```

Services:

| Service           | Port | Description                                         |
| ----------------- | ---- | --------------------------------------------------- |
| `users2-backend`  | 8000 | User API                                            |
| `manage2-backend` | 8001 | Management API                                      |
| `admin2-backend`  | 8002 | Admin API                                           |
| `postgres`        | 5432 | PostgreSQL (user: `postgres`, password: `postgres`) |

Run only the database:

```bash
docker compose up postgres -d
```

---

## CI/CD

GitHub Actions workflows are located in `.github/workflows/`:

| Workflow          | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `ci.yml`          | Continuous integration (lint, test, build) |
| `build.yml`       | Build pipeline                             |
| `development.yml` | Development environment deployment         |
| `release.yml`     | Release pipeline with Nx release           |

### Nx Release

Releases are managed via Nx with independent versioning per app:

- **Versioning**: Conventional commits (automatic version bumps)
- **Changelogs**: Auto-generated per project
- **Git tags**: `{projectName}@{version}` (e.g., `users2-backend@1.2.0`)
- **GitHub releases**: Created automatically from project changelogs

---

## Adding a New Shared Library

### 1. Generate the library

```bash
npx nx g @nx/js:library my-lib --directory=libs/my-lib --bundler=none --unitTestRunner=jest
```

This scaffolds:

```
libs/my-lib/
├── src/
│   ├── lib/
│   │   └── my-lib.ts
│   └── index.ts           # Barrel export
├── eslint.config.mjs
├── jest.config.cts
├── project.json
├── tsconfig.json
├── tsconfig.lib.json
└── tsconfig.spec.json
```

### 2. Configure project tags

Open `libs/my-lib/project.json` and add tags for module boundary enforcement:

```json
{
  "name": "my-lib",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/my-lib/src",
  "projectType": "library",
  "tags": [],
  "targets": {}
}
```

### 3. Register the path alias

Add a path alias in `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@mono-repo-backend/my-lib": ["libs/my-lib/src/index.ts"]
    }
  }
}
```

### 4. Set up the barrel export

Re-export the public API through `libs/my-lib/src/index.ts`:

```ts
export { MyService } from './lib/my-service';
export { MyModule } from './lib/my.module';
export type { MyInterface } from './lib/types';
```

### 5. Set up ESLint config

The generated `eslint.config.mjs` should extend the root config:

```js
import baseConfig from '../../eslint.config.mjs';

export default [...baseConfig];
```

### 6. Use the library in an app

Import via the path alias:

```typescript
import { MyModule, MyService } from '@mono-repo-backend/my-lib';
```

If the library provides a NestJS module, import it in the app's root or feature module:

```typescript
@Module({
  imports: [MyModule],
})
export class AppModule {}
```

### 7. Verify

```bash
npm run lint:all
npm run test:all
npx nx graph
```

### Quick Reference — Existing Library Pattern

| Library | Alias                       | Global Module     | Barrel     |
| ------- | --------------------------- | ----------------- | ---------- |
| common  | `@mono-repo-backend/common` | Yes (`@Global()`) | `index.ts` |

### Example — Creating a `database` Library

```bash
# 1. Generate
npx nx g @nx/js:library database --directory=libs/database --bundler=none --unitTestRunner=jest

# 2. Add path alias to tsconfig.base.json
#    "@mono-repo-backend/database": ["libs/database/src/index.ts"]

# 3. Create a NestJS module
#    libs/database/src/lib/database.module.ts
#    libs/database/src/index.ts → export { DatabaseModule } from './lib/database.module';

# 4. Use in an app
#    import { DatabaseModule } from '@mono-repo-backend/database';

# 5. Verify
npm run lint:all
npx nx graph
```
