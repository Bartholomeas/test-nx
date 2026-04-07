# Development Guidelines — CMS-15 Backend Monorepo

## Import Ordering (Enforced by Prettier + @trivago/prettier-plugin-sort-imports)

All files follow a strict 4-group import order with blank line separation:

```typescript
// 1. Node built-ins
// 3. Internal monorepo packages (@mono-repo-backend/*)
import { User } from '@mono-repo-backend/database';
import { BaseAuthService } from '@mono-repo-backend/shared-auth';

import { resolve } from 'node:path';

// 2. Third-party / NestJS packages
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 4. Relative imports
import { AuthController } from './auth.controller';
```

**Key pattern**: Use `import type { ... }` for type-only imports (observed in all files):

```typescript
import type { Response } from 'express';

import type { Type } from '@nestjs/common';
import type { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
```

## Prettier Configuration

- Single quotes, semicolons, trailing commas everywhere
- Print width: 100, tab width: 2, LF line endings
- Arrow parens: always
- Import specifiers sorted alphabetically within groups

## Commit Message Convention

Format: `type(scope): description`

- Required scopes: `users2-backend`, `manage2-backend`, `admin2-backend`, `common`, `release`
- Scope is warned (level 1) if empty — encouraged but not blocking
- Extends `@commitlint/config-conventional`

## Controller Pattern

### Decorator Order (consistent across all controllers)

1. `@ApiTags('tag')` — class level
2. `@Controller('path')` — class level
3. HTTP method (`@Post`, `@Get`, `@Put`, `@Patch`, `@Delete`) — method level
4. `@HttpCode(HttpStatus.*)` — only when overriding default
5. `@ApiOperation({ summary: '...' })` — method level
6. `@ApiResponse({ status, type/description })` — success first, then errors

### Controller Structure

```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: UsersAuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  @ApiResponse({ status: 401, type: UnauthorizedException, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(dto, res);
  }
}
```

**Conventions observed**:

- Constructor uses `private readonly` for all injected dependencies
- Explicit return types on all public methods
- `@Res({ passthrough: true })` when accessing Response object (preserves NestJS response handling)
- DTOs imported from shared libraries, not defined in controllers
- Controllers delegate all logic to services — no business logic in controllers

## Service Pattern

### Base Service Inheritance

Shared services in libs provide base implementations; app services extend them:

```typescript
// libs/shared-auth — base service
@Injectable()
export class BaseAuthService {
  protected readonly logger = new Logger(this.constructor.name);
  // shared methods...
}

// apps/users2-backend — app-specific service
@Injectable()
export class UsersAuthService extends BaseAuthService {}
```

### Logger Convention

- Use `protected readonly logger = new Logger(this.constructor.name)` in base services
- Use `private readonly logger = new Logger(ClassName.name)` in standalone services
- Logger context is always the class name

## Module Pattern

### Feature Module

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [FeatureController],
  providers: [FeatureService],
})
export class FeatureModule {}
```

### Root App Module

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),           // Always first, always global
    LoggerModule.forRoot(createLoggerModuleConfig(...)), // Logger second
    TypeOrmModule.forRootAsync(createPortalConnection()), // DB connection
    S3Module.forRootAsync({ ... }),                      // AWS services
    SharedErrorsModule,                                   // Shared modules
    CommonModule,
    AuthModule,                                           // Feature modules last
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## Dynamic Module Pattern (forRoot / forRootAsync)

Used for configurable infrastructure modules:

```typescript
@Module({})
export class S3Module {
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
```

**Injection token pattern**: Define as string constant, inject via `@Inject(TOKEN)`:

```typescript
export const S3_MODULE_OPTIONS = 'S3_MODULE_OPTIONS';

constructor(@Inject(S3_MODULE_OPTIONS) options: S3ModuleOptions) {}
```

## Database Connection Factory Pattern

Database connections are created via factory functions returning `TypeOrmModuleAsyncOptions`:

```typescript
export function createPortalConnection(): TypeOrmModuleAsyncOptions {
  return {
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      type: 'postgres' as const,
      host: config.getOrThrow<string>('DB_HOST'),
      // ...
      synchronize: false, // NEVER true
      namingStrategy: new SnakeNamingStrategy(), // Always snake_case
      entities: PORTAL_ENTITIES, // Centralized entity array
    }),
    inject: [ConfigService],
  };
}
```

**Key conventions**:

- `synchronize: false` always — migrations only
- `SnakeNamingStrategy` for all connections
- `config.getOrThrow<T>()` for required values
- `config.get('KEY', defaultValue)` for optional values with defaults
- Separate factory for readonly connection with `name: DB_CONNECTIONS.READONLY`

## Entity Pattern

```typescript
@Entity({ schema: 'users' })
export class User {
  constructor(props: Partial<User>) {
    Object.assign(this, props);
  }

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  firstName!: string;
}
```

**Conventions**:

- Explicit `schema` in `@Entity()` decorator
- Constructor accepts `Partial<Entity>` with `Object.assign`
- Non-null assertion (`!`) on all column properties
- Files named `{name}.entity.ts` in `libs/database/src/lib/entities/`
- All entities exported via barrel `index.ts` and collected in `PORTAL_ENTITIES` array

## Exception Hierarchy Pattern

```typescript
// Abstract base — all custom exceptions extend this
export abstract class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: number,
    readonly code: string, // Machine-readable error code
    readonly fieldName?: string, // Optional field reference
    readonly context?: Record<string, unknown>,
  ) {
    super({ message, code, fieldName, context }, statusCode);
  }
}

// Domain-specific — HTTP 400
export class DomainException extends AppException {
  constructor(
    message: string,
    code: string,
    fieldName?: string,
    context?: Record<string, unknown>,
  ) {
    super(message, HttpStatus.BAD_REQUEST, code, fieldName, context);
  }
}
```

## Domain Rule Validation Pattern

```typescript
// Define a rule
export interface DomainRule {
  validate: () => Promise<void>;
}

// Validate — fail-fast
await domainRuleValidator.validate([rule1, rule2]);

// Validate — collect all errors
const errors = await domainRuleValidator.collect([rule1, rule2]);
```

Errors thrown as `DomainRuleBrokenError` with `code`, `message`, optional `fieldName` and `context`.

## Guard Pattern (JWT)

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(JWT_VERIFIER_DI) private readonly jwtVerifier: JwtVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token: string | undefined = request.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();
    try {
      request.user = await this.jwtVerifier.verify(token);
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
```

## Environment Variable Access Patterns

- **In NestJS services**: Always use `ConfigService.getOrThrow<T>()` or `ConfigService.get('KEY', default)`
- **In CLI data-source files**: Use `process.env['KEY']!` with bracket notation and non-null assertion
- **dotenv loading**: `config({ path: resolve('apps/{app}/.env') })` in data-source files

## Testing Configuration

- Jest 30 with Nx preset (`@nx/jest/preset`)
- Root `jest.config.ts` uses `getJestProjectsAsync()` for multi-project setup
- Each app/lib has its own `jest.config.cts` (CommonJS TypeScript)
- Test files co-located with source: `*.spec.ts` next to `*.ts`
- SWC used for fast test compilation

## Barrel Export Pattern

Every library uses `index.ts` barrel files at each level:

```
libs/{lib}/src/
├── index.ts              # Re-exports from lib/
└── lib/
    ├── index.ts          # Re-exports from subdirectories
    ├── feature/
    │   └── index.ts      # Exports feature's public API
    └── another/
        └── index.ts
```

## Naming Conventions

| Item           | Convention                        | Example                                          |
| -------------- | --------------------------------- | ------------------------------------------------ |
| Files          | kebab-case                        | `auth.controller.ts`, `domain-rule-validator.ts` |
| Classes        | PascalCase                        | `AuthController`, `DomainRuleValidator`          |
| Interfaces     | PascalCase (no I prefix)          | `DomainRule`, `BootstrapOptions`                 |
| Enums          | PascalCase with UPPER_CASE values | `Role.ADMIN`                                     |
| DI tokens      | UPPER_SNAKE_CASE string constants | `S3_MODULE_OPTIONS`, `JWT_VERIFIER_DI`           |
| DB connections | `as const` object                 | `DB_CONNECTIONS.DEFAULT`                         |
| DTOs           | PascalCase with suffix            | `LoginRequestDto`, `LoginResponseDto`            |
| Entities       | PascalCase, `.entity.ts` suffix   | `User` in `user.entity.ts`                       |
| Modules        | PascalCase with Module suffix     | `AuthModule`, `S3Module`                         |
| Services       | PascalCase with Service suffix    | `UsersAuthService`, `S3Service`                  |
| Filters        | PascalCase with Filter suffix     | `AllExceptionsFilter`                            |
| Guards         | PascalCase with Guard suffix      | `JwtAuthGuard`                                   |

## Code Style Idioms

- `readonly` on all injected dependencies and class properties
- `private readonly` for constructor injection (services, guards)
- `protected readonly` for base class properties meant for subclass access
- Explicit return types on all public methods
- `as const` for constant objects (`DB_CONNECTIONS`, type literals)
- Nullish coalescing (`??`) for defaults: `options.imports ?? []`
- Optional chaining for safe access: `request.headers.authorization?.replace(...)`
- Bracket notation for `process.env`: `process.env['DB_HOST']`
