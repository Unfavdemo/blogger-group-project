import { NextRequest, NextResponse } from "next/server";
import { requirePermission, canModifyOwnResource } from "@/lib/rbac";
import { updatePostSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

// GET /api/posts/[id] - Get single post
export async function GET(request, { params }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          where: { deletedAt: null },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Calculate reading time (average reading speed: 200 words per minute)
    const wordCount = post.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Increment view count and update reading time
    await prisma.post.update({
      where: { id: params.id },
      data: { 
        viewCount: { increment: 1 },
        readingTime: readingTime || 1, // Minimum 1 minute
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/posts/[id] - Update post
export async function PATCH(request, { params }) {
  try {
    const token = await requirePermission(request, "posts:update");
    if (token instanceof NextResponse) return token;

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check ownership using RBAC helper
    if (!canModifyOwnResource(token.role, post.authorId, token.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = updatePostSchema.parse(body);

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...validated,
        publishedAt:
          validated.status === "published" && !post.publishedAt
            ? new Date()
            : post.publishedAt,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(request, { params }) {
  try {
    const token = await requirePermission(request, "posts:delete");
    if (token instanceof NextResponse) return token;

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check ownership using RBAC helper
    if (!canModifyOwnResource(token.role, post.authorId, token.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cascade delete will handle comments
    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
