// ✅ Prisma Client Singleton
// By: Niki (Part A - Database Setup Leader)
// Prevents multiple Prisma instances in development

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Audit logging middleware (optional enhancement for Zakai)
if (process.env.ENABLE_AUDIT_LOGGING === 'true') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();

    // Log to audit table for write operations
    if (['create', 'update', 'delete'].includes(params.action)) {
      try {
        await prisma.auditLog.create({
          data: {
            action: `${params.action.toUpperCase()}_${params.model?.toUpperCase() || 'UNKNOWN'}`,
            resource: params.model || 'Unknown',
            resourceId: params.args?.where?.id || null,
            details: {
              model: params.model,
              action: params.action,
              duration: after - before,
            },
          },
        });
      } catch (error) {
        // Don't fail the operation if audit logging fails
        console.error('Audit logging error:', error);
      }
    }

    return result;
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
