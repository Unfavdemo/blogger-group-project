import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bulkUpdatePostSchema } from '@/lib/validations';
import { requirePermission } from '@/lib/rbac';

// PATCH /api/posts/bulk-update - Update multiple posts
export async function PATCH(request) {
  try {
    const token = await requirePermission(request, "posts:bulk-update");
    if (token instanceof NextResponse) return token;

    const body = await request.json();
    const validated = bulkUpdatePostSchema.parse(body);

    // Check ownership of all posts (unless admin)
    if (token.role !== "admin") {
      const posts = await prisma.post.findMany({
        where: {
          id: { in: validated.posts.map((p) => p.id) },
        },
        select: { id: true, authorId: true },
      });

      const unauthorized = posts.filter((p) => p.authorId !== token.id);
      if (unauthorized.length > 0) {
        return NextResponse.json(
          { error: 'You can only update your own posts' },
          { status: 403 }
        );
      }
    }

    // Use transaction for atomicity
    const results = await prisma.$transaction(
      validated.posts.map((postUpdate) =>
        prisma.post.update({
          where: { id: postUpdate.id },
          data: postUpdate.data,
        })
      )
    );

    return NextResponse.json({
      message: `Successfully updated ${results.length} post(s)`,
      count: results.length,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Bulk update posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
