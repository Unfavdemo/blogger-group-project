import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

// DELETE /api/posts/bulk-delete - Delete multiple posts
export async function DELETE(request) {
  try {
    const token = await requirePermission(request, "posts:delete");
    if (token instanceof NextResponse) return token;

    const body = await request.json();
    const postIds = body.postIds || [];

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'postIds array is required' },
        { status: 400 }
      );
    }

    // Check ownership of all posts (unless admin)
    if (token.role !== "admin") {
      const posts = await prisma.post.findMany({
        where: {
          id: { in: postIds },
        },
        select: { id: true, authorId: true },
      });

      const unauthorized = posts.filter((p) => p.authorId !== token.id);
      if (unauthorized.length > 0) {
        return NextResponse.json(
          { error: 'You can only delete your own posts' },
          { status: 403 }
        );
      }
    }

    // Use transaction for atomicity
    // Comments will be cascade deleted automatically
    const result = await prisma.$transaction(async (tx) => {
      return await tx.post.deleteMany({
        where: {
          id: { in: postIds },
        },
      });
    });

    return NextResponse.json({
      message: `Successfully deleted ${result.count} post(s)`,
      count: result.count,
    });
  } catch (error) {
    console.error('Bulk delete posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
