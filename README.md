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

### ⚠️ Features Need Implementation (1/19 Complete)
- ⚠️ **API Routes** - All endpoints are stubs with TODO comments
- ✅ **RBAC** - Complete permission system with tests and documentation (Quil)
- ⚠️ **Utilities** - Validations, password, auth, email are stubs
- ⚠️ **Tests** - Test files exist but need implementation

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
│   ├── api/                # API routes (⚠️ stubs)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── posts/         # Blog post endpoints
│   │   ├── comments/      # Comment endpoints
│   │   ├── search/        # Search endpoint
│   │   └── wellness/      # Wellness check-in endpoints
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
│   └── auth.js            # ✅ Auth utilities (complete - needed by RBAC)
│   ├── validations.ts     # ⚠️ Zod schemas (stub)
│   ├── password.ts        # ⚠️ Password utilities (stub)
│   ├── auth.ts            # ⚠️ Auth utilities (stub)
│   └── email.ts           # ⚠️ Email service (stub)
├── prisma/                # Prisma files
│   ├── schema.prisma      # ⚠️ Database schema (stub)
│   └── seed.js            # ⚠️ Seed script (stub)
├── tests/                 # Test files
│   ├── setup.js           # ✅ Test setup (complete)
│   ├── auth.test.ts       # ⚠️ Auth tests (stub)
│   ├── posts.test.ts      # ⚠️ Post tests (stub)
│   ├── comments.test.ts   # ⚠️ Comment tests (stub)
│   └── search.test.ts     # ⚠️ Search tests (stub)
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
[Add your work here]
- 
- 
- 
```

---

#### **Syriana** — Connecting Users, Posts, and Comments
**Task:** Verify and test data relationships and cascade deletes

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Zakai** — User Types and Helper Tools
**Task:** Implement user types and engagement metrics calculation

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Alan** — Tools for Changing Many Things at Once
**Task:** Implement bulk update and delete operations with transactions

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Niki** — Database Setup Leader
**Task:** Database schema, migrations, seed script, and team support

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

### Part B — Security Squad

#### **Sean** — Password Safety Tools
**Task:** Implement password hashing and history tracking

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Jose** — Help People Reset Passwords
**Task:** Implement password reset flow with email service

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Chris** — Password Rules and Help Messages
**Task:** Implement Zod validation schemas with password rules

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Danny** — Test What Goes Wrong with Logins
**Task:** Write comprehensive authentication tests

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Sa'Nya** — Search Everything Across the App
**Task:** Implement full-text search across posts, comments, and users

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

### Part C — Blog Builders

#### **Julien** — Change Many Posts at Once
**Task:** Implement bulk post update operations with transactions

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Yara** — Delete Posts (Single and Bulk)
**Task:** Implement post deletion with authorization checks

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **William** — Create and Update Blog Posts
**Task:** Implement post CRUD operations with validation

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Nya** — Test Blog Post Features
**Task:** Write comprehensive blog post tests

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

### Part D — Chat Champions

#### **Brayden** — Get Comments and Their Replies
**Task:** Implement nested comment retrieval with recursive queries

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Marshall** — Create, Update, and Delete Comments
**Task:** Implement comment CRUD operations with nested reply support

**My Contribution:**
```
[Add your work here]
- 
- 
- 
```

---

#### **Jay** — Test Comment Features
**Task:** Write comprehensive comment tests

**My Contribution:**
```
[Add your work here]
- 
- 
- 
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
[Add your work here]
- 
- 
- 
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

**Project Status:** Foundation needs setup ⚠️ | All features need implementation ⚠️ | Ready for team to start from scratch 🚀
