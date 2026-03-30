# Code Documentation Rules - CMS-15 Backend

## When to Apply These Rules

Apply these documentation rules when user requests documentation for code they've introduced or modified.

## 1. JSDoc for Public APIs (ID: JSDOC_PUBLIC)

- Document all public methods, classes, and interfaces
- Include parameter descriptions, return types, and possible exceptions
- Use proper JSDoc tags: `@param`, `@returns`, `@throws`

```typescript
/**
 * Retrieves user profile with associated groups and permissions
 * @param userId - Unique identifier for the user
 * @param includeGroups - Whether to include user's group memberships
 * @returns Promise resolving to user profile data
 * @throws {UserNotFoundException} When user with given ID doesn't exist
 */
async getUserProfile(userId: string, includeGroups = false): Promise<UserProfile> {
  // implementation
}
```

## 2. Self-Documenting Code Review (ID: SELF_DOCUMENTING)

- **MANDATORY STEP**: Before adding documentation, analyze variable and method names
- If names are unclear or non-descriptive, propose better names
- Check impact of renaming using search tools to assess scope of changes
- Ask user to decide: improve naming vs. add documentation
- **NEVER rename variables/methods yourself** - only propose and let user decide

**Process:**
1. Check recent changes: `git diff HEAD~1` or `git status` to see modified files
2. Identify unclear names in changed code (single letters, abbreviations, generic terms)
3. Propose specific, descriptive alternatives
4. Use `grep -r "variableName" src/` to check how many files would be affected by the rename
5. Present options to user: "I found variable `d` in your recent changes - would you prefer to rename it to `currentDate` (affects 3 files) or add documentation?"
6. **Wait for user decision** - never make naming changes without explicit user approval

```typescript
// ❌ Needs improvement
const d = new Date();
const ms = 86400000;

// ✅ Self-documenting
const currentDate = new Date();
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
```

## 3. Explain "Why" Not "What" (ID: WHY_NOT_WHAT)

- Comments should explain business logic, decisions, and constraints
- Avoid describing what the code obviously does
- Focus on context, reasoning, and non-obvious implications

```typescript
// ❌ Wrong - describes what code does
// Increment counter by 1
counter++;

// ✅ Correct - explains why
// Retry mechanism requires exponential backoff to prevent API rate limiting
const delay = Math.pow(2, retryCount) * 1000;
```

## 4. Complex Logic Documentation (ID: COMPLEX_LOGIC)

- Add inline comments for complex business rules
- Explain conditional logic that isn't immediately clear
- Document algorithm choices and trade-offs

```typescript
// Complex business rule: Users can only edit profiles during business hours
// unless they have admin privileges or emergency access token
if (!isBusinessHours() && !user.isAdmin && !hasEmergencyToken(request)) {
  throw new ForbiddenException('Profile editing restricted outside business hours');
}
```

## 5. API Endpoint Documentation (ID: API_DOCS)

- Use Swagger/OpenAPI decorators for all endpoints
- Include operation summary, description, and response codes
- Document request/response schemas

```typescript
@ApiOperation({ 
  summary: 'Update user profile',
  description: 'Updates user profile information. Requires authentication.' 
})
@ApiResponse({ status: 200, description: 'Profile updated successfully' })
@ApiResponse({ status: 404, description: 'User not found' })
@Put('profile')
async updateProfile(@Body() updateDto: UpdateProfileDto) {
  // implementation
}
```

## 6. General Documentation Principles (ID: PRINCIPLES)

- **Minimalism**: Document only what isn't obvious from the code
- **Currency**: Update documentation when code changes
- **Consistency**: Use uniform style across the project
- **Context**: Explain business decisions and constraints
- **Errors**: Document possible exceptions and error handling
- **English Only**: All documentation must be in English

## Documentation Workflow (ID: WORKFLOW)

1. **Ask about scope** - Before checking changes, ask user to choose:
   - **Last commit** - document last commit only (`git diff HEAD~1`)
   - **Uncommitted changes** - document uncommitted changes (`git diff`)
   - **Several recent commits** - specify how many commits back to check
2. **Check recent changes** - Based on user preference:
   - Last commit: `git diff HEAD~1`
   - Uncommitted changes: `git diff` or `git status`
   - Several recent commits: `git diff HEAD~N` (where N is specified by user)
2. **Analyze naming** - Check if variables/methods in changed code are self-explanatory
3. **Propose improvements** - Suggest better names if needed
4. **Check impact** - Use `grep -r "oldName" src/` to assess scope of potential renaming changes
5. **User decision** - Let user choose between renaming or documentation
6. **Apply documentation** - Add appropriate comments/JSDoc based on user choice
7. **Focus on value** - Document only what adds real understanding

## What NOT to Document (ID: DONT_DOCUMENT)

- Obvious code behavior
- Framework conventions
- Standard getters/setters
- Simple variable assignments
- Self-explanatory method calls

## Quality Check (ID: QUALITY_CHECK)

Before finalizing documentation:
- Does it explain WHY, not WHAT?
- Would a new developer understand the business context?
- Is the language clear and concise?
- Are all JSDoc tags properly formatted?
- Does it add real value beyond the code itself?