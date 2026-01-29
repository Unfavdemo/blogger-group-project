import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { createCommentSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

// GET /api/comments - Get comments for a post
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    // Get all comments for the post (including nested)
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        deletedAt: null,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                replies: {
                  include: {
                    author: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                    replies: true, // Continue recursion for deep nesting
                  },
                  orderBy: { createdAt: "asc" },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create comment
export async function POST(request) {
  try {
    const token = await requirePermission(request, "comments:create");
    if (token instanceof NextResponse) return token;

    const body = await request.json();
    const validated = createCommentSchema.parse(body);

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: validated.postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // If parentId provided, verify parent comment exists
    if (validated.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: validated.parentId },
      });

      if (!parent) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        ...validated,
        authorId: token.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
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
