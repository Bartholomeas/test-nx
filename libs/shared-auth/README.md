# shared-auth

Shared authentication library providing base auth service and DTOs for all portal backend applications.

## Structure

```
src/lib/
├── dto/                          # Shared request/response DTOs
│   ├── login-request.dto.ts
│   ├── login-response.dto.ts
│   ├── register-request.dto.ts
│   ├── register-response.dto.ts
│   └── user-profile-response.dto.ts
└── services/
    └── base-auth.service.ts      # BaseAuthService with default implementations
```

## Usage

Each app creates its own service extending `BaseAuthService` and injects it directly:

```typescript
// auth.service.ts
@Injectable()
export class UsersAuthService extends BaseAuthService {}

// auth.module.ts
@Module({
  controllers: [AuthController],
  providers: [UsersAuthService],
})
export class AuthModule {}

// auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: UsersAuthService) {}
}
```

Apps can override any base method or add new ones (e.g. `disableUser` in manage/admin):

```typescript
@Injectable()
export class ManageAuthService extends BaseAuthService {
  override login(dto: LoginRequestDto, res: Response): LoginResponseDto {
    // custom login logic
  }

  disableUser(userId: string): Promise<void> {
    // manage-only functionality
  }
}
```

## Design Decisions

- **Direct injection over DI token** — each app has its own controller and service, so there's no need for an abstraction layer. The controller injects the app-specific service class directly.
- **Concrete base class (not abstract)** — all methods have default implementations so apps only override what they need.
- **DTOs in shared lib** — keeps request/response shapes consistent across all portals and avoids duplication.
