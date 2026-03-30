# NestJS Unit Testing Rules - CMS-15 Backend

## Structure and Organization (ID: STRUCTURE)

- Test files have `.spec.ts` extension and are located next to tested files
- **Features structure**: Test files placed alongside source files in their respective directories:
  - Controllers: `src/features/{feature}/{feature}.controller.spec.ts`
  - Services: `src/features/{feature}/services/{service}.service.spec.ts`
  - Providers: `src/features/{feature}/providers/{provider}.spec.ts`
  - Common services: `src/common/services/{service}.spec.ts`
- Use `describe` for test groups and `it` for individual test cases
- Group tests logically by functionality

## What to Test - Focus on Business Logic (ID: WHAT_TO_TEST)

- **Business logic paths** - all conditional branches and decision points in the code
- **Input validation** - how the method handles different input combinations
- **Service interactions** - verify correct parameters are passed to dependencies
- **Error handling** - exceptions, error responses, fallback behaviors
- **Return value transformations** - when method modifies or formats service results
- **DTOs with logic** - only test Request/Response classes that contain:
  - Custom transformations (`@Transform` with logic)
  - Complex validations (`@IsCustom`, custom validators)
  - Business logic or computed properties
  - Default values with logic

## Test Quality Guidelines (ID: QUALITY)

- **Test actual behavior, not implementation details**
- **Each test should verify one specific behavior or scenario**
- **Avoid redundant tests** - don't test the same logic multiple times with different data
- **Focus on meaningful scenarios** - test cases that could realistically fail
- **Test the public interface** - avoid testing private methods or internal state

## Dependency Mocking (ID: MOCKING)

- Use `@golevelup/ts-jest` with `createMock<T>()` for TypeScript-safe mocks
- Mock all external dependencies (repositories, services, providers)
- Use `DeepMocked<T>` for mock typing - NEVER use `any` type for mocks
- Mock only what you need - don't over-mock
- **CRITICAL**: Always mock return values for methods that are called in tests:
  - `mockConfigService.get.mockReturnValue('test-value')` for ConfigService
  - `mockRepository.findOneBy.mockResolvedValue(entity)` for database calls
  - `mockService.method.mockResolvedValue(result)` for async service calls

## Naming (ID: NAMING)

- Test names describe behavior: "should [expected behavior] when [condition]"
- Use factory functions with `a` prefix for creating test data (e.g., `aCreateUserDto()`)
- Mock variable names correspond to real dependency names

## Import Management (ID: IMPORTS)

- Import only what is actually used in tests
- Remove unused imports to keep code clean
- Prefer inline object creation in factory functions over importing request/response types

## Type Assertions (ID: TYPES)

- Use `as unknown as Type` instead of `as any` for type casting in tests
- Prefer specific type assertions over generic `any` for better type safety
- Use type assertions when creating minimal test objects that don't need all required properties
- **NEVER use `any` for mock variable types** - always use `DeepMocked<T>`:

  ```typescript
  // ❌ Wrong
  let mockService: any;

  // ✅ Correct
  let mockService: DeepMocked<ServiceType>;
  ```

## TypeScript Compilation Fixes (ID: TS_FIXES)

### Common Type Errors and Solutions:

1. **QueryRunner Mock Type Error**:

   ```typescript
   // ❌ Wrong - causes TS2345 error
   mockDataSource.createQueryRunner.mockReturnValue({
     connect: jest.fn(),
     startTransaction: jest.fn(),
   });

   // ✅ Correct - use type assertion
   mockDataSource.createQueryRunner.mockReturnValue({
     connect: jest.fn(),
     startTransaction: jest.fn(),
     commitTransaction: jest.fn(),
     rollbackTransaction: jest.fn(),
     release: jest.fn(),
   } as any);
   ```

2. **Repository Mock with Generic Types**:

   ```typescript
   // ✅ Correct pattern for repository mocks
   let mockRepository: DeepMocked<Repository<EntityType>>;

   beforeEach(() => {
     mockRepository = createMock<Repository<EntityType>>();
     mockDataSource.getRepository.mockReturnValue(mockRepository as any);
   });
   ```

3. **Service Constructor with Multiple Dependencies**:

   ```typescript
   // ✅ Always declare all mock dependencies with proper types
   let mockDependency1: DeepMocked<Dependency1Type>;
   let mockDependency2: DeepMocked<Dependency2Type>;

   beforeEach(() => {
     mockDependency1 = createMock<Dependency1Type>();
     mockDependency2 = createMock<Dependency2Type>();

     // Always mock return values for methods that will be called
     mockDependency1.someMethod.mockResolvedValue(expectedResult);
   });
   ```

4. **Array Type Annotations**:

   ```typescript
   // ❌ Wrong - implicit any[] type
   const trainerApplications = [];

   // ✅ Correct - explicit type annotation
   const trainerApplications: TrainerApplication[] = [];
   // or
   const trainerApplications: any[] = []; // when exact type not needed
   ```

## Test Structure (AAA Pattern) (ID: AAA_PATTERN)

- **Arrange** - prepare data and mocks
- **Act** - execute tested operation
- **Assert** - verify result
- `beforeEach` for mock and tested class instance initialization
- One assert per test (preferred)

## Code Quality and Readability (ID: READABILITY)

- Use `await expect(service.method()).rejects.toThrow()` instead of `await expect(async () => { await service.method(); }).rejects.toThrow()`
- Avoid `Object.assign()` in test expectations - use clear variable assignments instead
- Create variables for test data instead of calling factory functions multiple times
- Use descriptive variable names (`group`, `updateDto`) rather than inline function calls

## FIRST Principles (ID: FIRST)

- **Fast** - tests must be fast
- **Independent** - each test independent from others
- **Repeatable** - deterministic results
- **Self-validating** - clear pass/fail
- **Timely** - write tests before/during implementation

## Service Testing (ID: SERVICE_TESTING)

- Test public methods, not private ones
- Verify dependency calls with `expect().toHaveBeenCalledWith()`
- Test side effects (database writes, API calls)
- Mock return values with `mockResolvedValue()` for Promises

## TypeORM Repository Mocking (ID: TYPEORM_MOCKING)

- Mock `Repository<Entity>` instead of actual repositories
- Use `@InjectRepository` in service constructor
- Mock methods like `save()`, `findOneBy()`, `find()`

## QueryBuilder Mocking Pattern (ID: QUERYBUILDER_MOCKING)

- For complex queries, mock `SelectQueryBuilder<Entity>`:

  ```typescript
  let mockQueryBuilder: DeepMocked<SelectQueryBuilder<Entity>>;

  beforeEach(() => {
    mockQueryBuilder = createMock<SelectQueryBuilder<Entity>>();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    // Chain all query builder methods to return themselves
    mockQueryBuilder.leftJoinAndSelect.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.andWhere.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.limit.mockReturnValue(mockQueryBuilder);
  });
  ```

## Test Data Builders (ID: DATA_BUILDERS)

```typescript
const aValidUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  ...overrides,
});

const anInvalidUser = () => aValidUser({ email: null });
```

## Edge Case Examples (ID: EDGE_CASES)

- Empty collections: `[]`, `{}`
- Null/undefined values
- Very long strings (>255 chars)
- Special characters in strings
- Zero and negative numbers
- Date boundaries (past/future)

## Don't Test (ID: DONT_TEST)

- TypeORM implementation
- External libraries
- Getters/setters without logic
- Framework configuration
- **Simple DTOs/Request/Response classes** - unless they contain business logic, custom transformations, or complex validations
- Plain data transfer objects that only assign properties
- **Redundant parameter variations** - don't test multiple parameters if they follow the same code path
- **Mock implementations** - don't copy method logic into test files
- **Trivial scenarios** - avoid testing obvious behaviors that can't realistically fail

## Pre-Test Code Analysis (ID: CODE_ANALYSIS)

**MANDATORY: Before writing ANY test, analyze the actual service code:**

1. **Read the service file** - understand actual method names, parameters, return types
2. **Check imports** - identify all dependencies and their types
3. **Verify entity structures** - check actual entity properties and enums
4. **Map private method names** - use exact names when testing private methods via `(service as any).methodName`
5. **Identify enum values** - use actual enum constants, not string literals

```typescript
// ❌ Wrong - assuming method name
const result = (service as any).checkIsCompleted(data);

// ✅ Correct - verified actual method name
const result = (service as any).checkAreAllTrainersCompleted(data);
```

## Entity Mock Creation Guidelines (ID: ENTITY_MOCKS)

**Always create complete entity mocks:**

1. **Read entity definition first** - check all required properties
2. **Use proper enum values** - import and use actual enums, not strings
3. **Handle nullable fields** - set appropriate null/undefined values
4. **Use type assertions safely** - prefer `as unknown as EntityType` for test mocks

```typescript
// ❌ Wrong - incomplete mock with string enum
const user = { id: 1, status: 'ACTIVE' } as User;

// ✅ Correct - complete mock with proper enum
const aUser = (overrides = {}) =>
  ({
    uuid: 'test-uuid',
    status: UserStatus.ACTIVE, // Use actual enum
    groups: [],
    schoolLicenseId: null,
    // ... all required properties
    ...overrides,
  }) as unknown as User;
```

## Test Data Factory Standards (ID: TEST_DATA_FACTORIES)

**Consistent factory naming and structure:**

1. **Use `a` prefix** - `aUser()`, `aUserCache()`, `aBranchStatus()`
2. **Support overrides** - always accept overrides parameter
3. **Include all required fields** - based on actual entity structure
4. **Use proper types** - import actual types and enums
5. **Handle complex nested objects** - create factories for nested structures

```typescript
// ✅ Standard factory pattern
const aUserCache = (overrides = {}) =>
  ({
    uuid: 'test-uuid',
    username: 'testuser',
    status: UserStatus.ACTIVE,
    enable: true,
    groups: [],
    schoolLicenseId: null,
    cognitoUserId: null,
    accountType: null,
    roles: [],
    // ... all entity properties
    ...overrides,
  }) as unknown as UserCache;
```

## Iterative Test Fixing (ID: ITERATIVE_FIXING)

**Fix tests step by step, not all at once:**

1. **One error at a time** - fix compilation errors before runtime errors
2. **Check actual vs expected** - when tests fail, verify what the code actually returns
3. **Update mocks incrementally** - add missing properties as needed
4. **Verify enum usage** - check actual enum values in source code
5. **Test each fix immediately** - run test after each change

**Common fix sequence:**

1. Import errors → Add missing imports
2. Type errors → Complete entity mocks
3. Method name errors → Verify actual method names
4. Enum errors → Use actual enum values
5. Mock return errors → Add missing mock return values

## Dependency Resolution Troubleshooting (ID: DEPENDENCY_TROUBLESHOOTING)

### Common NestJS Dependency Injection Errors:

1. **"Can't resolve dependencies at index [X]"**

   - **Cause**: Constructor parameter order doesn't match providers array
   - **Solution**: Use `useFactory` pattern for complex services
   - **Check**: Count constructor parameters and verify exact order

2. **"Argument dependency at index [X] is available"**

   - **Cause**: Missing or incorrectly named provider
   - **Solution**: Add missing dependency or use `useFactory`
   - **Debug**: Log constructor parameters vs providers

3. **ForwardRef Injection Issues**
   - **Cause**: Circular dependencies in test setup
   - **Solution**: Use `useFactory` to bypass NestJS DI resolution
   - **Pattern**: Direct constructor instantiation in factory

### Dependency Resolution Checklist:

```typescript
// 1. Count constructor parameters
constructor(
  private dep1: Dep1,     // index 0
  private dep2: Dep2,     // index 1
  // ... count all parameters
)

// 2. If 10+ dependencies or forwardRef, use useFactory
{
  provide: ComplexService,
  useFactory: () => new ComplexService(
    mockDep1,  // exact order matters
    mockDep2,
    // ... all dependencies
  ),
}
```

## Test Creation Workflow - MANDATORY STEPS (ID: WORKFLOW)

**CRITICAL: Execute these steps IMMEDIATELY after creating EACH test file, not at the end:**

### After creating ANY single test file:

1. **STOP** - do not create more files
2. **Analyze the method logic** - identify all conditional branches and decision points
3. **Create minimal test cases** - one test per logical path, avoid redundant scenarios
4. **Check TypeScript compilation AND run test (grouped command):**
   ```bash
   npx tsc --noEmit --skipLibCheck --experimentalDecorators [new-test-file.spec.ts] && npm test -- --testPathPattern="[new-test-file]\.spec\.ts$"
   ```
5. **Fix ALL TypeScript errors and failing tests**
6. **Remove unused imports**
7. **Review test quality** - ensure tests verify actual behavior, not implementation details
8. **Only then create the next test file**

### Common Test Fixes:

- **Import path errors**: Use `src/` imports and ensure `moduleNameMapper` is configured in Jest
- **Mock return value errors**: Always mock return values for called methods
- **Type errors**: Use `DeepMocked<T>` instead of `any` for all mocks
- **QueryRunner type errors**: Use `as any` type assertion for complex mock objects
- **Array type errors**: Always provide explicit type annotations for arrays
- **QueryBuilder chains**: Mock all chained methods to return the builder itself
- **Service dependency errors**: Verify all constructor dependencies are properly mocked

### Final verification (after all test files created):

```bash
# For feature modules
npm test -- --testPathPattern="features/[feature-name].*\.spec\.ts$"
# For coverage
npm run test:cov -- --testPathPattern="features/[feature-name]"
```

**NEVER create multiple test files without checking each one individually first.**

## Coverage and Quality (ID: COVERAGE)

- Aim for 80%+ code coverage on business logic
- Use `npm run test:cov`
- **Prioritize meaningful test scenarios over coverage percentage**
- Every bug = new test case
- When creating tests, first analyze existing tests in the module/area for completeness
- If existing tests lack coverage or violate unit-test rules, improve them before adding new ones
- **Quality over quantity** - 3 meaningful tests are better than 10 redundant ones
- **Test behavior, not implementation** - focus on what the method should do, not how it does it

## Project-Specific Patterns (ID: PROJECT_PATTERNS)

### Complex Dependency Injection with useFactory (ID: USE_FACTORY_PATTERN)

- **When to use**: Services with many dependencies (10+) or complex forwardRef injections
- **Problem**: NestJS can't resolve dependencies at specific indices
- **Solution**: Use `useFactory` with direct constructor call

  ```typescript
  // ❌ Wrong - causes dependency resolution errors
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ServiceWithManyDependencies,
      { provide: Dep1, useValue: mockDep1 },
      // ... many providers
    ],
  }).compile();

  // ✅ Correct - useFactory pattern
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      {
        provide: ServiceWithManyDependencies,
        useFactory: () => new ServiceWithManyDependencies(
          mockDep1,
          mockDep2,
          mockDep3,
          // ... all dependencies in exact constructor order
        ),
      },
    ],
  }).compile();
  ```

### DataSource Injection Pattern (ID: DATASOURCE_PATTERN)

- Services use `@Inject('data_source')` for DataSource injection
- Get repositories via `dataSource.getRepository(Entity)`
- Mock DataSource and its `getRepository` method:

  ```typescript
  let mockDataSource: DeepMocked<DataSource>;
  let mockRepository: DeepMocked<Repository<Entity>>;

  beforeEach(() => {
    mockDataSource = createMock<DataSource>();
    mockRepository = createMock<Repository<Entity>>();
    mockDataSource.getRepository.mockReturnValue(mockRepository);
  });
  ```

### Provider Injection Pattern (ID: PROVIDER_PATTERN)

- Use dependency injection tokens (e.g., `USER_IDENTITY_PROVIDER_DI`, `GROUP_SERVICE_DI`)
- Mock providers using their interface types
- Test provider method calls with proper parameters

### Dependency Analysis Pattern (ID: DEPENDENCY_ANALYSIS)

**Before mocking dependencies:**

1. **Check constructor parameters** - verify exact dependency types
2. **Read service imports** - understand what needs to be mocked
3. **Identify injection tokens** - use correct DI tokens (e.g., `USER_IDENTITY_PROVIDER_DI`)
4. **Map method calls** - identify which dependency methods are called
5. **Check return types** - ensure mocks return compatible types

```typescript
// ❌ Wrong - guessing dependency structure
mockService.someMethod.mockReturnValue('test');

// ✅ Correct - verified actual method and return type
mockUserIdentityProvider.getUserByUuid.mockResolvedValue(identityUser);
mockConfigService.get.mockReturnValue('test-api-key');
```

### ConfigService Pattern (ID: CONFIG_PATTERN)

- Always mock ConfigService return values:

  ```typescript
  let mockConfigService: DeepMocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = createMock<ConfigService>();
    mockConfigService.get.mockReturnValue('test-value'); // Always provide return values
  });
  ```

### Common Error Patterns (ID: ERROR_PATTERNS)

- Test `BadRequestException` throws for invalid inputs
- Test external service error handling and re-throwing
- Test user/entity not found scenarios

### Import Path Configuration (ID: IMPORT_CONFIG)

- Ensure `moduleNameMapper` is configured in Jest (`package.json`):
  ```json
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/$1"
  }
  ```
- Ensure `paths` mapping in `tsconfig.json`:
  ```json
  "paths": {
    "src/*": ["src/*"]
  }
  ```

### TypeScript Compilation Checklist (ID: TS_CHECKLIST)

**Before running tests, ensure:**

1. **All mock variables have proper types**:

   ```typescript
   let mockService: DeepMocked<ServiceType>; // ✅ Not: any
   ```

2. **All array variables have explicit types**:

   ```typescript
   const items: ItemType[] = []; // ✅ Not: const items = [];
   ```

3. **Complex mock objects use type assertions**:

   ```typescript
   mockObject.method.mockReturnValue({ ...props } as any); // ✅
   ```

4. **All service dependencies are mocked**:

   ```typescript
   // Check service constructor and mock ALL dependencies
   constructor(
     private dep1: Dep1Type, // ← Mock this
     private dep2: Dep2Type, // ← Mock this
   ) {}
   ```

5. **All called methods have return values mocked**:
   ```typescript
   mockService.methodThatReturnsPromise.mockResolvedValue(result);
   mockService.methodThatReturnsValue.mockReturnValue(result);
   ```

### Quick TypeScript Fix Commands (ID: TS_COMMANDS)

```bash
# Check TypeScript compilation only (faster)
npx tsc --noEmit --skipLibCheck --experimentalDecorators [test-file.spec.ts]

# Check compilation AND run specific test
npx tsc --noEmit --skipLibCheck --experimentalDecorators [test-file.spec.ts] && npm test -- --testPathPattern="[test-file]\.spec\.ts$"

# Run test with verbose output for debugging
npm test -- --testPathPattern="[test-file]\.spec\.ts$" --verbose
```

## Test Structure Examples - Focus on Business Logic (ID: EXAMPLES)

### Service with DataSource Injection

```typescript
describe('SessionCompletionsService', () => {
  let service: SessionCompletionsService;
  let mockDataSource: DeepMocked<DataSource>;
  let mockRepository: DeepMocked<Repository<SessionCompletion>>;
  let mockQueryBuilder: DeepMocked<SelectQueryBuilder<SessionCompletion>>;
  let mockDecryptionService: DeepMocked<DecryptionService>;
  let mockConfigService: DeepMocked<ConfigService>;

  beforeEach(() => {
    mockQueryBuilder = createMock<SelectQueryBuilder<SessionCompletion>>();
    mockRepository = createMock<Repository<SessionCompletion>>();
    mockDataSource = createMock<DataSource>();
    mockDecryptionService = createMock<DecryptionService>();
    mockConfigService = createMock<ConfigService>();

    mockDataSource.getRepository.mockReturnValue(mockRepository);
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.leftJoinAndSelect.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.andWhere.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.limit.mockReturnValue(mockQueryBuilder);

    service = new SessionCompletionsService(
      mockDataSource,
      mockDecryptionService,
      mockConfigService,
    );
  });

  describe('searchCompletions', () => {
    it('should return tooManyResults when course search returns more than 200 results', async () => {
      // Arrange
      const request = aSearchRequest({
        name: 'John',
        courseStartDate: new Date(),
        courseEndDate: new Date(),
      });
      const manyResults = Array(201)
        .fill({})
        .map((_, i) => ({ id: i }) as SessionCompletion);

      mockQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: manyResults,
        raw: [],
      });

      // Act
      const result = await service.searchCompletions(request);

      // Assert
      expect(result).toEqual({ tooManyResults: true });
    });

    it('should return empty results when no completions found', async () => {
      // Arrange
      const request = aSearchRequest({ ssn: '1234' });
      mockConfigService.get.mockReturnValue('test-salt');

      mockQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: [],
        raw: [],
      });

      // Act
      const result = await service.searchCompletions(request);

      // Assert
      expect(result).toEqual({ results: [] });
    });
  });
});

// Test data builders
const aSearchRequest = (overrides = {}): SearchSessionCompletionsRequest => ({
  name: undefined,
  courseStartDate: undefined,
  courseEndDate: undefined,
  dateOfBirth: undefined,
  ssn: undefined,
  ...overrides,
});
```

### Service with Repository Injection

```typescript
describe('UserProfileService', () => {
  let service: UserProfileService;
  let mockUserIdentityProvider: DeepMocked<UserIdentityProvider>;
  let mockGroupService: DeepMocked<GroupService>;
  let mockDataSource: DeepMocked<DataSource>;
  let mockUserRepository: DeepMocked<Repository<User>>;
  let mockUserAuditRepository: DeepMocked<Repository<UserAudit>>;

  beforeEach(() => {
    mockUserIdentityProvider = createMock<UserIdentityProvider>();
    mockGroupService = createMock<GroupService>();
    mockDataSource = createMock<DataSource>();
    mockUserRepository = createMock<Repository<User>>();
    mockUserAuditRepository = createMock<Repository<UserAudit>>();

    mockDataSource.getRepository.mockImplementation((entity) => {
      if (entity === User) return mockUserRepository as any;
      if (entity === UserAudit) return mockUserAuditRepository as any;
      return createMock<Repository<any>>();
    });

    service = new UserProfileService(
      mockUserIdentityProvider,
      mockGroupService,
      mockDataSource,
    );
  });

  describe('updateFirstName', () => {
    it('should update first name when valid data provided', async () => {
      // Arrange
      const updateDto = aUpdateFirstNameDto();
      const identityUser = aIdentityUser();
      const user = aUser();

      mockUserIdentityProvider.getUserByUuid.mockResolvedValue(identityUser);
      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockUserAuditRepository.save.mockResolvedValue({} as any);

      // Act
      await service.updateFirstName(updateDto);

      // Assert
      expect(
        mockUserIdentityProvider.updateUserAttributes,
      ).toHaveBeenCalledWith({
        username: identityUser.username,
        use2FA: true,
        firstName: updateDto.firstName,
      });
    });
  });
});
```

### TypeScript Error Prevention Checklist (ID: ERROR_PREVENTION)

**Before writing any test:**

1. ✅ **Read the service constructor** - identify ALL dependencies
2. ✅ **Declare mock variables with `DeepMocked<T>` types**
3. ✅ **Initialize all mocks in `beforeEach`**
4. ✅ **Mock return values for all methods that will be called**
5. ✅ **Use explicit type annotations for arrays and complex objects**
6. ✅ **Use `as any` for complex mock objects that cause type errors**
7. ✅ **Test compilation before running tests**

**Common TypeScript Errors and Quick Fixes:**

- `TS2304: Cannot find name 'service'` → Check if variable is declared in describe block
- `TS2345: Argument of type '...' is not assignable` → Add `as any` type assertion
- `TS7034: Variable '...' implicitly has type 'any[]'` → Add explicit type: `const items: Type[] = []`
- `TS2552: Cannot find name 'mockService'` → Check if mock is declared and initialized
- `TS2339: Property '...' does not exist` → Verify mock interface matches actual service

```

```
