# Blogger Group Project

A modern blog platform built with Next.js, featuring wellness check-ins, threaded comments, and role-based access control.

## 📊 Current Status

### ✅ Foundation Complete (100%)
- ✅ **Database Schema** - Complete Prisma schema with all models
- ✅ **Project Structure** - All folders and files in place
- ✅ **Dependencies** - All required packages configured
- ✅ **Test Infrastructure** - Vitest configured with test setup
- ✅ **Prisma Client** - Singleton pattern implemented
- ✅ **Seed Script** - Sample data seeding ready

### ✅ Features Complete (19/19 Complete)
- ✅ **API Routes** - All endpoints fully implemented
- ✅ **RBAC** - Complete permission system with tests and documentation (Quil)
- ✅ **Utilities** - Validations, password, auth, email all complete
- ✅ **Tests** - Comprehensive test suites for all features

## 🚀 Quick Start

### Prerequisites
- Node.js 20 LTS
- pnpm 8+
- PostgreSQL (or Neon account)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd blogger-group-project
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets:
   # DATABASE_URL="postgresql://..."
   # NEXTAUTH_SECRET="your-secret"
   # JWT_SECRET="your-jwt-secret"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma Client
   pnpm db:generate

   # Push schema to database
   pnpm db:push

   # Seed with sample data
   pnpm db:seed
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

### Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## 📚 Documentation

- **New to the project?** → [`QUICK-START.md`](./QUICK-START.md)
- **What's my task?** → [`TEAM-HANDOFF.md`](./TEAM-HANDOFF.md)
- **Status overview?** → [`STATUS-OVERVIEW.md`](./STATUS-OVERVIEW.md)
- **Need test examples?** → [`test-templates.md`](./test-templates.md)
- **Requirements?** → [`Developers.md`](./Developers.md)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript** (ES2022+)
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide Icons**
- **React Hook Form** + **Zod**
- **TanStack Query** (React Query)
- **Zustand**

### Backend
- **Next.js API Routes** (Route Handlers)
- **NextAuth.js** (Auth.js) - JWT sessions
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT tokens
- **Nodemailer** - Email service

### Database
- **Neon PostgreSQL** (Serverless)
- **Prisma ORM v7**
- Full-text search
- Self-referencing relations
- Transactions

### Testing
- **Vitest**
- **Supertest**

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/                # API routes (✅ complete)
│   │   ├── auth/          # ✅ Authentication endpoints (signup, login, reset)
│   │   ├── posts/         # ✅ Blog post endpoints (CRUD, bulk operations)
│   │   ├── comments/      # ✅ Comment endpoints (CRUD with nested replies)
│   │   ├── search/        # ✅ Search endpoint (full-text search)
│   │   └── wellness/      # ✅ Wellness check-in endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── blog/              # Blog post components
│   ├── comments/          # Comment components
│   ├── wellness/          # Wellness check-in components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
│   ├── prisma.js          # ✅ Prisma client (complete - Niki)
│   ├── rbac.js            # ✅ RBAC middleware (complete - Quil)
│   ├── auth.js            # ✅ Auth utilities (JWT, tokens)
│   ├── validations.js     # ✅ Zod schemas (complete - Chris)
│   ├── password.js        # ✅ Password utilities (complete - Sean)
│   └── email.js           # ✅ Email service (complete - Jose)
├── prisma/                # Prisma files
│   ├── schema.prisma      # ✅ Database schema (complete - Niki)
│   └── seed.js            # ✅ Seed script (complete - Niki)
├── tests/                 # Test files
│   ├── setup.js           # ✅ Test setup (complete - Niki)
│   ├── auth.test.js       # ✅ Auth tests (complete - Danny)
│   ├── posts.test.js      # ✅ Post tests (complete - Nya)
│   ├── comments.test.js   # ✅ Comment tests (complete - Jay)
│   ├── relationships.test.js # ✅ Relationship tests (complete - Syriana)
│   ├── rbac.test.js       # ✅ RBAC tests (complete - Quil)
│   └── search.test.js     # ✅ Search tests (complete - Sa'Nya)
└── middleware.ts          # Next.js middleware
```

## ✨ Features

### Authentication & Authorization
- Email/password authentication
- JWT-based sessions
- Password reset via email
- Password history tracking
- Role-based access control (admin, editor, reader)

### Blog Posts
- Create, read, update, delete posts
- Bulk update operations
- Full-text search
- Draft/Published/Archived status
- Categories and tags
- SEO metadata

### Comments
- Threaded comments (self-referencing)
- Create, update, delete comments (readers can manage own comments)
- Soft delete
- Recursive query support

### Wellness Check-ins
- Private wellness tracking
- Mood and stress level tracking
- Personal history
- Admin-only aggregated analytics

### Search
- Full-text search across posts, comments, users
- Filter by author, date, keywords
- Pagination support

## 👥 Team Contributions

### Part A — Data Guardians

#### **Asma** — Comments that Reply to Other Comments
**Task:** Implement nested comment replies with recursive queries

**My Contribution:**
```
✅ Implemented GET /api/comments with deep nested reply support
- Recursive Prisma queries for nested comment trees (supports 10+ levels)
- Consistent ordering by createdAt
- Includes author information at each level
- Handles posts with no comments gracefully
- Complete implementation in app/api/comments/route.js
```

---

#### **Syriana** — Connecting Users, Posts, and Comments
**Task:** Verify and test data relationships and cascade deletes

**My Contribution:**
```
✅ Comprehensive relationship and cascade delete tests
- Tests verify all foreign key relationships work correctly
- Tests verify cascade deletes (user→posts→comments, comment→replies)
- Tests prevent orphaned records
- Tests password history and wellness cascade deletes
- Complete test suite in tests/relationships.test.js
```

---

#### **Zakai** — User Types and Helper Tools
**Task:** Implement user types and engagement metrics calculation

**My Contribution:**
```
✅ Engagement metrics implementation
- Reading time calculation (200 words per minute) in post creation and viewing
- View count tracking (auto-increments on post view)
- UserRole enum working correctly (admin, editor, reader)
- Optional audit logging middleware in lib/prisma.js (enable with ENABLE_AUDIT_LOGGING=true)
- Metrics calculated automatically in app/api/posts/route.js and [id]/route.js
```

---

#### **Alan** — Tools for Changing Many Things at Once
**Task:** Implement bulk update and delete operations with transactions

**My Contribution:**
```
✅ Bulk operations with transaction support
- Bulk update endpoint (PATCH /api/posts/bulk) with Prisma transactions
- Bulk delete endpoint (DELETE /api/posts/bulk-delete) with atomicity
- Automatic rollback if any operation fails
- Ownership checks for non-admin users
- Complete implementation in app/api/posts/bulk/route.js and bulk-delete/route.js
```

---

#### **Niki** — Database Setup Leader
**Task:** Database schema, migrations, seed script, and team support

**My Contribution:**
```
✅ Complete database foundation
- Full Prisma schema with all models (User, Post, Comment, Wellness, PasswordHistory, AuditLog, NextAuth models)
- Prisma Client singleton pattern (lib/prisma.js) with optional audit logging
- Comprehensive seed script with sample data (prisma/seed.js)
- All dependencies configured in package.json
- Vitest test infrastructure setup (vitest.config.js, tests/setup.js)
- Foundation ready for team development
```

---

### Part B — Security Squad

#### **Sean** — Password Safety Tools
**Task:** Implement password hashing and history tracking

**My Contribution:**
```
✅ Password security implementation
- Password hashing with bcrypt (12 salt rounds) in lib/password.js
- Password verification function
- Password history tracking (last 5 passwords)
- Password reuse prevention with checkPasswordHistory()
- Automatic cleanup of old password history entries
- Complete implementation in lib/password.js
```

---

#### **Jose** — Help People Reset Passwords
**Task:** Implement password reset flow with email service

**My Contribution:**
```
✅ Password reset flow with email
- Password reset request endpoint (POST /api/auth/request-reset)
- Password reset endpoint (POST /api/auth/reset-password) with token verification
- Email service using Nodemailer (lib/email.js)
- Ethereal email for testing, Gmail/SendGrid for production
- JWT reset tokens with 1-hour expiry
- Security: doesn't reveal if email exists
- Complete implementation in app/api/auth/reset-password/ and lib/email.js
```

---

#### **Chris** — Password Rules and Help Messages
**Task:** Implement Zod validation schemas with password rules

**My Contribution:**
```
✅ Comprehensive Zod validation schemas
- Signup schema with all password rules (8+ chars, uppercase, lowercase, number, special char)
- Login schema with email validation
- Password reset request and reset schemas
- Post schemas (create, update, bulk update)
- Comment schemas (create, update)
- Search schema with filters
- Wellness check-in schema
- Clear error messages for each validation rule
- Complete implementation in lib/validations.js
```

---

#### **Danny** — Test What Goes Wrong with Logins
**Task:** Write comprehensive authentication tests

**My Contribution:**
```
✅ Comprehensive authentication test suite
- Signup tests (duplicate email, weak passwords - all rules tested)
- Login tests (invalid credentials, non-existent user)
- Password reset tests (token validation, security)
- SQL injection prevention tests
- XSS attempt tests
- Unauthorized access tests
- Edge cases (long emails, special characters)
- Complete test suite in tests/auth.test.js
```

---

#### **Sa'Nya** — Search Everything Across the App
**Task:** Implement full-text search across posts, comments, and users

**My Contribution:**
```
✅ Full-text search implementation
- PostgreSQL full-text search across posts, comments, and users
- Filter by type (posts, comments, users, all)
- Filter by author email
- Date range filtering (dateFrom, dateTo)
- Pagination support
- Handles special characters in queries
- Complete implementation in app/api/search/route.js
```

---

### Part C — Blog Builders

#### **Julien** — Change Many Posts at Once
**Task:** Implement bulk post update operations with transactions

**My Contribution:**
```
✅ Bulk post update with transactions
- PATCH /api/posts/bulk endpoint with Prisma transactions
- Atomic updates (all succeed or all rollback)
- Ownership validation for non-admin users
- Zod array validation for bulk updates
- Complete implementation in app/api/posts/bulk/route.js
```

---

#### **Yara** — Delete Posts (Single and Bulk)
**Task:** Implement post deletion with authorization checks

**My Contribution:**
```
✅ Post deletion (single and bulk)
- Single delete endpoint (DELETE /api/posts/[id]) with ownership checks
- Bulk delete endpoint (DELETE /api/posts/bulk-delete) with transactions
- Authorization checks (owner or admin)
- Cascade deletion handled by schema
- Transaction support for bulk operations
- Complete implementation in app/api/posts/[id]/route.js and bulk-delete/route.js
```

---

#### **William** — Create and Update Blog Posts
**Task:** Implement post CRUD operations with validation

**My Contribution:**
```
✅ Complete post CRUD operations
- GET /api/posts - List posts with pagination, filtering (status, author, category, tag)
- POST /api/posts - Create post with auto-slug generation and reading time calculation
- GET /api/posts/[id] - Get single post with view count increment
- PATCH /api/posts/[id] - Update post with ownership checks
- Zod validation for all operations
- RBAC authorization using requirePermission()
- Complete implementation in app/api/posts/route.js and [id]/route.js
```

---

#### **Nya** — Test Blog Post Features
**Task:** Write comprehensive blog post tests

**My Contribution:**
```
✅ Comprehensive post test suite
- Create post tests (valid data, auto-slug, duplicate slug rejection)
- Get posts tests (pagination, filtering by status/author/category/tag)
- Update post tests (own post, authorization checks)
- Delete post tests (single and bulk, ownership checks)
- Bulk operations tests (update, delete, transaction rollback)
- Edge cases (long titles, special characters, pagination edge cases)
- Complete test suite in tests/posts.test.js
```

---

### Part D — Chat Champions

#### **Brayden** — Get Comments and Their Replies
**Task:** Implement nested comment retrieval with recursive queries

**My Contribution:**
```
✅ Nested comment retrieval
- GET /api/comments?postId=... with deep nested reply support
- Recursive Prisma queries supporting 10+ levels of nesting
- Consistent ordering by createdAt
- Handles posts with no comments
- Includes author information at each nesting level
- Complete implementation in app/api/comments/route.js (GET)
```

---

#### **Marshall** — Create, Update, and Delete Comments
**Task:** Implement comment CRUD operations with nested reply support

**My Contribution:**
```
✅ Complete comment CRUD operations
- POST /api/comments - Create comment/reply with parentId support
- PATCH /api/comments/[id] - Update comment with ownership checks
- DELETE /api/comments/[id] - Soft delete comment
- Nested reply support (parentId validation)
- Authorization checks (users can only edit/delete own comments)
- RBAC integration using requirePermission() and canModifyOwnResource()
- Complete implementation in app/api/comments/route.js and [id]/route.js
```

---

#### **Jay** — Test Comment Features
**Task:** Write comprehensive comment tests

**My Contribution:**
```
✅ Comprehensive comment test suite
- Create comment tests (top-level, nested replies, deep nesting 10+ levels)
- Get comments tests (nested tree structure, consistent ordering, empty posts)
- Update comment tests (own comment, authorization checks)
- Delete comment tests (soft delete, cascade delete of nested replies)
- Edge cases (very long content, orphaned replies, large threads)
- Authorization tests (reader permissions, ownership checks)
- Complete test suite in tests/comments.test.js
```

---

### Part E — Access Avengers

#### **Quil** — Permission System and Middleware
**Task:** Implement RBAC middleware and permission system

**My Contribution:**
```
✅ Complete RBAC (Role-Based Access Control) Implementation
- Implemented comprehensive permission system with 16 distinct permissions
- Created role-permission mapping for admin, editor, and reader roles (readers can create/update/delete own posts)
- Built requireAuth() middleware for JWT token verification
- Built requirePermission() middleware for permission-based authorization
- Added ownership-based authorization helpers (canModifyOwnResource)
- Supports both Authorization header (Bearer token) and cookie-based auth
- Implemented hasPermission() function for permission checking
- Added helper functions: isAdmin(), getRolePermissions()
- Comprehensive error handling (401 Unauthorized, 403 Forbidden)
- Full documentation in RBAC-DOCUMENTATION.md with permission matrix
- Usage examples in RBAC-EXAMPLES.md for API route integration
- Comprehensive test suite in tests/rbac.test.js (80+ test cases)
- Tests verify unauthorized actions are blocked for all roles
- Ready for use in all API routes for protecting endpoints
```

---

#### **Sean (API)** — API Integration and Project Coordination
**Task:** API documentation, consistent patterns, and team coordination

**My Contribution:**
```
✅ Complete API documentation and integration
- Comprehensive API documentation (API-DOCUMENTATION.md) with all endpoints
- Consistent error handling patterns across all routes
- Request/response formats documented
- Authentication requirements and permission reference
- Example requests and responses for all endpoints
- Error codes and messages documented
- Project coordination complete
```

---

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-jwt-secret-here

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/blog_db?schema=public"

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Environment
NODE_ENV=development
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy

### Neon PostgreSQL
1. Create a Neon project
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `pnpm db:migrate`

## 📝 Sample Test Users

After running `pnpm db:seed`:

- **Admin**: `admin@example.com` / `Admin123!@#`
- **Editor**: `editor@example.com` / `Editor123!@#`
- **Reader**: `reader@example.com` / `Reader123!@#`

## 📊 Progress Summary

```
✅ Foundation:     4/4  (100%)
✅ Implementations: 1/19 (5%)
────────────────────────────
Total Ready:       5/23 (22%)
```

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vitest Documentation](https://vitest.dev)
- [NextAuth.js Documentation](https://next-auth.js.org)

## 📄 License

MIT

---

**Project Status:** ✅ **PROJECT COMPLETE** - All foundation and features implemented! 🎉
