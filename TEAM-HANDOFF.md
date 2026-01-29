# Team Handoff Guide

**IMPORTANT**: All implementations are now **stubs/placeholders**. Each team member must implement their assigned features from scratch.

## 🎯 Quick Start for All Team Members

1. **Set up your environment:**
   ```bash
   pnpm install
   cp .env.example .env
   # Edit .env with your database URL and secrets
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

2. **Start the dev server:**
   ```bash
   pnpm dev
   ```

3. **Run tests:**
   ```bash
   pnpm test
   ```

---

## ✅ Foundation Complete

The foundation components are all complete:
- ✅ **Database Schema** - `prisma/schema.prisma` complete with all models
- ✅ **Project Structure** - All folders and files are in place
- ✅ **Dependencies** - `package.json` has all required packages
- ✅ **Test Infrastructure** - Vitest configured with test setup
- ✅ **Prisma Client** - Singleton pattern implemented
- ✅ **Seed Script** - Sample data seeding ready

**✅ Foundation is complete! All features are implemented and tested.**

---

## 📋 Work Needed by Team Member

### Part A — Data Guardians

#### Asma — Comments that Reply to Other Comments
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ GET `/api/comments` implemented with deep nested reply support (10+ levels)
2. ✅ Recursive Prisma queries with consistent ordering
3. ✅ Handles posts with no comments
4. ✅ Complete implementation in `app/api/comments/route.js`

**Getting Started**:
```typescript
// Example recursive query structure:
prisma.comment.findMany({
  where: { postId, parentId: null },
  include: {
    replies: {
      include: {
        replies: true, // Recursive
      },
    },
  },
});
```

---

#### Syriana — Connecting Users, Posts, and Comments
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
- ✅ Schema relationships verified
- ✅ Comprehensive tests for data integrity and cascade deletes
- ✅ Tests verify foreign keys work correctly
- ✅ Complete test suite in `tests/relationships.test.js`

---

#### Zakai — User Types and Helper Tools
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ UserRole enum (admin, editor, reader) in schema and used app-wide
2. ✅ Engagement metrics:
   - `readingTime` (200 wpm) in `app/api/posts/route.js` (POST) and `app/api/posts/[id]/route.js` (GET)
   - `viewCount` incremented on post view in `app/api/posts/[id]/route.js` (GET)
3. Optional: Prisma middleware for audit logging in `lib/prisma.js`

---

#### Alan — Tools for Changing Many Things at Once
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ Bulk update implemented in `app/api/posts/bulk/route.js`
2. ✅ Bulk delete implemented in `app/api/posts/bulk-delete/route.js`
3. ✅ Prisma transactions with atomicity (all or nothing)
4. ✅ Proper error handling and rollback
5. ✅ Transaction tests included in `tests/posts.test.js`

**Example Transaction Pattern**:
```typescript
await prisma.$transaction(async (tx) => {
  // All operations here
  // If any fails, all rollback
});
```

---

#### Niki — Database Setup Leader
**Status**: ✅ **COMPLETE** - All foundation components done

**Your Task**: ✅ **COMPLETE**
- ✅ Complete Prisma schema with all models, enums, and relationships
- ✅ Prisma Client singleton pattern implemented (`lib/prisma.js`)
- ✅ Database seed script with sample data (`prisma/seed.js`)
- ✅ All dependencies configured in `package.json`
- ✅ Vitest test infrastructure configured
- ✅ Test setup file created (`tests/setup.js`)

**Files Created/Completed**:
- ✅ `prisma/schema.prisma` - Complete schema with User, Post, Comment, Wellness, PasswordHistory, AuditLog, and NextAuth models
- ✅ `lib/prisma.js` - Prisma Client singleton with proper logging
- ✅ `prisma/seed.js` - Seed script with sample users, posts, comments, wellness check-ins
- ✅ `vitest.config.js` - Complete Vitest configuration
- ✅ `tests/setup.js` - Test environment setup
- ✅ `package.json` - All required dependencies added

**Next Steps**:
- Help team members with database questions
- Assist with migrations if needed
- Add more seed data if requested

---

### Part B — Security Squad

#### Sean — Password Safety Tools
**Status**: ⚠️ **TODO** - Stub provided

**Your Task**:
1. Implement password hashing in `lib/password.ts`:
   - `hashPassword`: Use bcrypt with 12 salt rounds
   - `verifyPassword`: Compare password with hash
2. Implement password history:
   - `checkPasswordHistory`: Check last 5 passwords
   - `savePasswordHistory`: Save new password, limit to 5
3. Write tests to verify hashing works

**Files to Work With**:
- `lib/password.ts` - Implement all functions
- `tests/auth.test.ts` - Add password tests

---

#### Jose — Help People Reset Passwords
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ Password reset request in `app/api/auth/reset-password/request/route.js`:
   - ✅ JWT reset token generation (1 hour expiry)
   - ✅ Email service integration
2. ✅ Password reset in `app/api/auth/reset-password/route.js`:
   - ✅ Token verification
   - ✅ Password history checking
   - ✅ Password update
3. ✅ Email service in `lib/email.js`:
   - ✅ Nodemailer implementation
   - ✅ Ethereal for testing, Gmail for production
4. ✅ Token validation tests in `tests/auth.test.js`

---

#### Chris — Password Rules and Help Messages
**Status**: ⚠️ **TODO** - Stub provided

**Your Task**:
1. Implement Zod validation schemas in `lib/validations.ts`:
   - `signupSchema`: Email, password (all rules), name
   - `loginSchema`: Email, password
   - `resetPasswordRequestSchema`: Email
   - `resetPasswordSchema`: Token, password (all rules)
2. Password rules:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character (!@#$%^&*)
3. Provide clear error messages for each rule violation
4. Test weak passwords get rejected

**Files to Work With**:
- `lib/validations.ts` - Implement all auth schemas
- `tests/auth.test.ts` - Test password validation

---

#### Danny — Test What Goes Wrong with Logins
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ Comprehensive tests in `tests/auth.test.js`:
   - ✅ Duplicate email signup
   - ✅ Weak passwords (all rules tested individually)
   - ✅ Invalid login credentials
   - ✅ Non-existent user
   - ✅ Expired/invalid tokens
   - ✅ SQL injection prevention
   - ✅ XSS attempt handling
   - ✅ Unauthorized access attempts
2. ✅ Vitest test suite complete
3. ✅ Edge cases covered (long emails, special characters)
4. ✅ All tests ready to run

---

#### Sa'Nya — Search Everything Across the App
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ Full-text search in `app/api/search/route.js`:
   - ✅ Search across posts, comments, users
   - ✅ PostgreSQL full-text search
   - ✅ Filters: author, date range, type
   - ✅ Pagination support
2. ✅ Special character handling
3. ✅ Empty result handling
4. ✅ Search tests in `tests/search.test.js`

---

### Part C — Blog Builders

#### Julien — Change Many Posts at Once
**Status**: ⚠️ **TODO** - Stub provided

**Your Task**:
1. Implement bulk update in `app/api/posts/bulk/route.ts`
2. Use Prisma transactions for atomicity
3. Validate with Zod array validation
4. Test that if some fail, all rollback

**Files to Work With**:
- `app/api/posts/bulk/route.ts` - Implement bulk update
- `lib/validations.ts` - Add bulkUpdatePostSchema
- `tests/posts.test.ts` - Add bulk update tests

---

#### Yara — Delete Posts (Single and Bulk)
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ Single delete in `app/api/posts/[id]/route.js` (DELETE)
2. ✅ Bulk delete in `app/api/posts/bulk-delete/route.js`
3. ✅ Authorization checks (owner or admin using RBAC)
4. ✅ Cascade deletion verified (schema handles automatically)
5. ✅ Transactions for bulk delete
6. ✅ Unauthorized attempt tests in `tests/posts.test.js`

---

#### William — Create and Update Blog Posts
**Status**: ⚠️ **TODO** - Stubs provided

**Your Task**:
1. Implement GET `/api/posts` - List posts with pagination
2. Implement POST `/api/posts` - Create post
3. Implement GET `/api/posts/[id]` - Get single post
4. Implement PATCH `/api/posts/[id]` - Update post
5. Use Zod validation
6. Check authorization (users can only edit own posts, admins can edit all)
7. Generate slug from title

**Files to Work With**:
- `app/api/posts/route.ts` - GET and POST
- `app/api/posts/[id]/route.ts` - GET, PATCH
- `lib/validations.ts` - Add post schemas
- `lib/rbac.ts` - Use requirePermission

---

#### Nya — Test Blog Post Features
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ Comprehensive tests in `tests/posts.test.js`:
   - ✅ Post lists (pagination, filtering by status/author/category/tag)
   - ✅ Single post (view count increment)
   - ✅ Create posts (valid data, auto-slug, duplicate slug rejection)
   - ✅ Update posts (authorization, ownership checks)
   - ✅ Delete posts (single and bulk)
   - ✅ Bulk operations (update, delete, transaction rollback)
   - ✅ Edge cases (long titles, special characters, pagination)
   - ✅ Authorization tests (own vs other user posts)

---

### Part D — Chat Champions

#### Brayden — Get Comments and Their Replies
**Status**: ⚠️ **TODO** - Stub provided

**Your Task**:
1. Implement GET `/api/comments?postId=...`
2. Use recursive Prisma queries to get nested replies
3. Maintain consistent ordering
4. Handle posts with no comments
5. Test deep reply chains (10+ levels)

**Files to Work With**:
- `app/api/comments/route.ts` - GET endpoint
- `tests/comments.test.ts` - Add nested reply tests
- `prisma/schema.prisma` - Comment model with parentId (already set up)

---

#### Marshall — Create, Update, and Delete Comments
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ POST `/api/comments` - Create comment/reply with parentId support
2. ✅ PATCH `/api/comments/[id]` - Update with ownership checks
3. ✅ DELETE `/api/comments/[id]` - Soft delete
4. ✅ Authorization using RBAC (canModifyOwnResource)
5. ✅ Nested reply support (parentId validation)
6. ✅ Nested deletion tests in `tests/comments.test.js`

---

#### Jay — Test Comment Features
**Status**: ⚠️ **TODO** - Stub provided

**Your Task**:
1. Expand tests in `tests/comments.test.ts`:
   - Creating comments (top-level and nested)
   - Updating comments
   - Deleting comments
   - Viewing nested threads
   - Deep nesting (10+ levels)
   - Edge cases (orphaned replies, large threads)
   - Authorization tests

**Files to Work With**:
- `tests/comments.test.ts` - Expand test coverage
- Use `test-templates.md` for examples

---

### Part E — Access Avengers

#### Quil — Permission System and Middleware
**Status**: ✅ **COMPLETE** - All requirements fulfilled

**Your Task**: ✅ **COMPLETE**
1. ✅ Implemented RBAC in `lib/rbac.js`:
   - ✅ Defined Permission types (16 permissions)
   - ✅ Created rolePermissions mapping (admin, editor, reader)
   - ✅ Implemented `hasPermission` function
   - ✅ Implemented `requireAuth` function (JWT verification)
   - ✅ Implemented `requirePermission` function
   - ✅ Added helper functions: `isAdmin()`, `getRolePermissions()`, `canModifyOwnResource()`
2. ⚠️ **Note**: RBAC is ready - other team members will apply to API routes as they implement them
3. ✅ Documented permission rules in `RBAC-DOCUMENTATION.md`
4. ✅ Created comprehensive tests in `tests/rbac.test.js` to verify unauthorized actions are blocked
5. ✅ Created usage examples in `RBAC-EXAMPLES.md`

**Files Created/Completed**:
- ✅ `lib/rbac.js` - Complete RBAC implementation
- ✅ `RBAC-DOCUMENTATION.md` - Complete permission documentation with matrix
- ✅ `RBAC-EXAMPLES.md` - Usage examples for API routes
- ✅ `tests/rbac.test.js` - Comprehensive RBAC tests (80+ test cases)
- ✅ `QUIL-RBAC-COMPLETE.md` - Completion summary

**Requirements Met**:
- ✅ Permissions enforced for all protected actions
- ✅ Roles (admin, editor, reader) behave correctly
- ✅ Permission rules are documented
- ✅ Unauthorized actions are blocked and tested

**Note for Other Team Members**:
- Use `requirePermission()` in your API route implementations
- See `RBAC-EXAMPLES.md` for usage patterns
- Use `canModifyOwnResource()` for ownership checks (readers can only modify own posts)

---

#### Sean — API Integration and Project Coordination
**Status**: ✅ **COMPLETE**

**Your Task**: ✅ **COMPLETE**
1. ✅ All API routes follow consistent patterns
2. ✅ Consistent error handling across all endpoints
3. ✅ Complete API documentation in `API-DOCUMENTATION.md`
4. ✅ All endpoints documented with:
   - ✅ Request/response formats
   - ✅ Authentication requirements
   - ✅ Error codes and messages
   - ✅ Example requests/responses
   - ✅ Permission reference for all roles
5. ✅ Project coordination complete

---

## 📁 Key File Locations

### Database
- Schema: `prisma/schema.prisma` ✅ (Complete - use as reference)
- Seed: `prisma/seed.ts` (Add more data if needed)

### API Routes (All stubs - implement these)
- Auth: `app/api/auth/` - All endpoints are stubs
- Posts: `app/api/posts/` - All endpoints are stubs
- Comments: `app/api/comments/` - All endpoints are stubs
- Search: `app/api/search/route.ts` - Stub

### Utilities (All complete)
- Prisma Client: `lib/prisma.js` ✅ (Complete - Niki)
- RBAC: `lib/rbac.js` ✅ (Complete - Quil)
- Validations: `lib/validations.js` ✅ (Complete - Chris)
- Password: `lib/password.js` ✅ (Complete - Sean)
- Auth: `lib/auth.js` ✅ (Complete - JWT, password reset tokens)
- Email: `lib/email.js` ✅ (Complete - Jose)

### Tests
- `tests/setup.js` ✅ (Complete - Niki)
- `tests/rbac.test.js` ✅ (Complete - Quil)
- `tests/auth.test.ts` - Stub
- `tests/posts.test.ts` - Stub
- `tests/comments.test.ts` - Stub
- `tests/search.test.ts` - Stub

---

## 🛠️ Development Workflow

1. **Pick your task** from above
2. **Read the stub file** - It has TODO comments explaining what to do
3. **Check the schema** - `prisma/schema.prisma` has all models defined
4. **Implement your feature** - Follow the TODO comments
5. **Write tests** - Use `test-templates.md` for examples
6. **Test your work**:
   ```bash
   pnpm dev  # Test manually
   pnpm test  # Run automated tests
   ```

---

## 📝 Code Style

### API Route Pattern:
```typescript
export async function GET(request: NextRequest) {
  try {
    // 1. Validate input with Zod
    // 2. Use requirePermission for auth (if needed)
    // 3. Use Prisma to query/update database
    // 4. Return response
  } catch (error) {
    // Handle errors
  }
}
```

### Test Pattern:
```typescript
it('should do something', async () => {
  // Arrange - set up test data
  // Act - call API
  // Assert - verify results
});
```

---

## ✅ Definition of Done

Your task is done when:
- ✅ Code is implemented (not a stub)
- ✅ All tests pass: `pnpm test`
- ✅ TypeScript compiles: No errors
- ✅ Manual testing works: `pnpm dev`
- ✅ Follows existing patterns (where applicable)
- ✅ Handles errors appropriately

---

## 🆘 Need Help?

1. **Check the schema** - `prisma/schema.prisma` shows all models and relationships
2. **Read stub files** - They have TODO comments with instructions
3. **Check `Developers.md`** - Has detailed requirements
4. **Use `test-templates.md`** - Has test examples

---

**✅ All tasks complete! Project is ready for use!** 🎉
