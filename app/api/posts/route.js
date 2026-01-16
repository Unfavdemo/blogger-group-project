import { NextRequest, NextResponse } from "next/server";
import { createPostSchema } from "@/lib/validations";
import { requirePermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

// GET /api/posts - List posts with pagination and filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const authorId = searchParams.get("authorId");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");

    const where = {};
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    if (category) where.category = category;
    if (tag) where.tags = { has: tag };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create new post
export async function POST(request) {
  try {
    const token = await requirePermission(request, "posts:create");
    if (token instanceof NextResponse) return token;

    const body = await request.json();
    const validated = createPostSchema.parse(body);

    // Generate slug if not provided
    const slug =
      validated.slug ||
      validated.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Check if slug exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: "Post with this slug already exists" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        ...validated,
        slug,
        authorId: token.id,
        publishedAt: validated.status === "published" ? new Date() : null,
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

    return NextResponse.json({ post }, { status: 201 });
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
