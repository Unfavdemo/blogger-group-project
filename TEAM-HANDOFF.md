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

**Foundation is ready! Team members can now implement their features.**

---

## 📋 Work Needed by Team Member

### Part A — Data Guardians

#### Asma — Comments that Reply to Other Comments
**Status**: ⚠️ **TODO** - Schema ready, implementation needed

**Your Task**:
1. The schema already has `parentId` and self-referencing relation in `prisma/schema.prisma`
2. Implement GET `/api/comments` to fetch comments with nested replies using recursive Prisma queries
3. Test deep nesting (10+ levels)
4. Ensure consistent ordering

**Files to Work With**:
- `app/api/comments/route.ts` - GET endpoint (stub provided)
- `tests/comments.test.ts` - Add tests for nested replies
- `prisma/schema.prisma` lines 137-158 - Comment model (already done)

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
**Status**: ✅ **DONE** - Schema has all relationships

**Your Task**: 
- ✅ Verify schema relationships are correct (they are!)
- ⚠️ Write tests to verify data integrity and cascade deletes
- Add tests that verify foreign keys work correctly

**Files to Work With**:
- `prisma/schema.prisma` - Verify relationships (lines 27-158)
- Create tests to verify cascade deletes work

---

#### Zakai — User Types and Helper Tools
**Status**: ⚠️ **PARTIAL** - Schema has enums, metrics fields exist, but calculation needed

**Your Task**:
1. Verify UserRole enum works (admin, editor, reader) - ✅ Already in schema
2. Implement engagement metrics calculation:
   - Calculate `readingTime` based on content length
   - Track `viewCount` (increment on view)
   - Track `likeCount` (if likes feature added)
3. Set up Prisma middleware for audit logging (optional enhancement)

**Files to Work With**:
- `prisma/schema.prisma` - UserRole enum and metrics fields (lines 15-19, 116-118)
- `app/api/posts/[id]/route.ts` - Add readingTime calculation
- `lib/prisma.ts` - Add middleware for audit logs (optional)

---

#### Alan — Tools for Changing Many Things at Once
**Status**: ⚠️ **TODO** - Stub provided

**Your Task**:
1. Implement bulk update in `app/api/posts/bulk/route.ts`
2. Use Prisma transactions: `prisma.$transaction()`
3. Ensure atomicity: if one fails, all rollback
4. Add proper error handling
5. Test transaction rollback scenarios

**Files to Work With**:
- `app/api/posts/bulk/route.ts` - Implement bulk update
- `app/api/posts/bulk-delete/route.ts` - Implement bulk delete
- `tests/posts.test.ts` - Add transaction rollback tests

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
**Status**: ⚠️ **TODO** - Stubs provided

**Your Task**:
1. Implement password reset request in `app/api/auth/request-reset/route.ts`:
   - Generate JWT reset token (1 hour expiry)
   - Store token (consider PasswordResetToken model)
   - Send email with reset link
2. Implement password reset in `app/api/auth/reset-password/route.ts`:
   - Verify token
   - Check password history
   - Update password
3. Implement email service in `lib/email.ts`:
   - Use Nodemailer
   - Ethereal for testing, Gmail/SendGrid for production
4. Test bad/old/expired tokens

**Files to Work With**:
- `app/api/auth/request-reset/route.ts`
- `app/api/auth/reset-password/route.ts`
- `lib/email.ts`
- `lib/auth.ts` - Implement password reset token functions

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
**Status**: ⚠️ **TODO** - Stub provided

**Your Task**:
1. Write comprehensive tests in `tests/auth.test.ts`:
   - Duplicate email signup
   - Weak passwords (test each rule)
   - Invalid login credentials
   - Non-existent user
   - Expired tokens
   - SQL injection attempts
   - XSS attempts
   - Unauthorized access attempts
2. Use Vitest for testing
3. Create mock data for edge cases
4. Ensure all tests pass

**Files to Work With**:
- `tests/auth.test.ts` - Expand test coverage
- Use `test-templates.md` for examples

---

#### Sa'Nya — Search Everything Across the App
**Status**: ⚠️ **TODO** - Stub provided

**Your Task**:
1. Implement search in `app/api/search/route.ts`:
   - Full-text search across posts, comments, users
   - Use PostgreSQL full-text search
   - Support filters: author, date range
   - Pagination
2. Handle special characters in queries
3. Handle empty results
4. Write comprehensive tests

**Files to Work With**:
- `app/api/search/route.ts` - Implement search logic
- `tests/search.test.ts` - Write search tests
- `prisma/schema.prisma` line 129 - Full-text index (already set up)

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
**Status**: ⚠️ **TODO** - Stubs provided

**Your Task**:
1. Implement single delete in `app/api/posts/[id]/route.ts` DELETE
2. Implement bulk delete in `app/api/posts/bulk-delete/route.ts`
3. Check authorization (owner or admin)
4. Handle cascade deletion (schema handles this, verify it works)
5. Use transactions for bulk delete
6. Test unauthorized attempts

**Files to Work With**:
- `app/api/posts/[id]/route.ts` - DELETE endpoint
- `app/api/posts/bulk-delete/route.ts` - Bulk delete
- `tests/posts.test.ts` - Delete tests

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
**Status**: ⚠️ **TODO** - Stub provided

**Your Task**:
1. Expand tests in `tests/posts.test.ts`:
   - View post lists (pagination, filtering)
   - Single post
   - Create posts
   - Update posts (authorization)
   - Delete posts
   - Bulk operations
   - Edge cases (bad data, missing info)
   - Pagination edge cases
   - Filtering edge cases

**Files to Work With**:
- `tests/posts.test.ts` - Expand test coverage
- Use `test-templates.md` for examples

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
**Status**: ⚠️ **TODO** - Stubs provided

**Your Task**:
1. Implement POST `/api/comments` - Create comment/reply
2. Implement PATCH `/api/comments/[id]` - Update comment
3. Implement DELETE `/api/comments/[id]` - Soft delete
4. Check authorization (users can only edit/delete own comments)
5. Handle nested replies (parentId support)
6. Test nested comment deletion

**Files to Work With**:
- `app/api/comments/route.ts` - POST endpoint
- `app/api/comments/[id]/route.ts` - PATCH and DELETE
- `lib/validations.ts` - Add comment schemas

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
**Status**: ⚠️ **TODO**

**Your Task**:
1. Ensure all API routes follow consistent patterns
2. Implement consistent error handling
3. Create API documentation: `API-DOCUMENTATION.md`
4. Document all endpoints with:
   - Request/response formats
   - Authentication requirements
   - Error codes
   - Example requests/responses
5. Help coordinate between teams

**Files to Work With**:
- All files in `app/api/`
- Create `API-DOCUMENTATION.md`

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

### Utilities (All stubs - implement these)
- Prisma Client: `lib/prisma.js` ✅ (Complete - Niki)
- RBAC: `lib/rbac.js` ✅ (Complete - Quil)
- Validations: `lib/validations.ts` - Stub
- Password: `lib/password.ts` - Stub
- Auth: `lib/auth.ts` - Stub (has `verifyToken` needed by RBAC)
- Email: `lib/email.ts` - Stub

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

**Ready to code? Pick your task and start implementing!** 🚀
