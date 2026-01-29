import { NextRequest, NextResponse } from "next/server";
import { searchSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

// GET /api/search - Full-text search across posts, comments, users
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const type = searchParams.get("type") || "all";
    const author = searchParams.get("author");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const validated = searchSchema.parse({
      query,
      type,
      author,
      dateFrom,
      dateTo,
      page,
      limit,
    });

    const results = {
      posts: [],
      comments: [],
      users: [],
      pagination: {
        page: validated.page,
        limit: validated.limit,
        total: 0,
        totalPages: 0,
      },
    };

    // Build date filter
    const dateFilter = {};
    if (validated.dateFrom) {
      dateFilter.gte = new Date(validated.dateFrom);
    }
    if (validated.dateTo) {
      dateFilter.lte = new Date(validated.dateTo);
    }

    // Search posts
    if (validated.type === "all" || validated.type === "posts") {
      const where = {
        status: "published",
        OR: [
          { title: { search: validated.query } },
          { content: { search: validated.query } },
        ],
      };

      if (validated.author) {
        where.author = { email: { contains: validated.author, mode: "insensitive" } };
      }

      if (Object.keys(dateFilter).length > 0) {
        where.publishedAt = dateFilter;
      }

      const [posts, totalPosts] = await Promise.all([
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
          },
          orderBy: { publishedAt: "desc" },
          skip: (validated.page - 1) * validated.limit,
          take: validated.limit,
        }),
        prisma.post.count({ where }),
      ]);

      results.posts = posts;
      results.pagination.total += totalPosts;
    }

    // Search comments
    if (validated.type === "all" || validated.type === "comments") {
      const where = {
        deletedAt: null,
        content: { search: validated.query },
      };

      if (validated.author) {
        where.author = { email: { contains: validated.author, mode: "insensitive" } };
      }

      if (Object.keys(dateFilter).length > 0) {
        where.createdAt = dateFilter;
      }

      const [comments, totalComments] = await Promise.all([
        prisma.comment.findMany({
          where,
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
                slug: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (validated.page - 1) * validated.limit,
          take: validated.limit,
        }),
        prisma.comment.count({ where }),
      ]);

      results.comments = comments;
      results.pagination.total += totalComments;
    }

    // Search users
    if (validated.type === "all" || validated.type === "users") {
      const where = {
        OR: [
          { name: { contains: validated.query, mode: "insensitive" } },
          { email: { contains: validated.query, mode: "insensitive" } },
        ],
      };

      const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          skip: (validated.page - 1) * validated.limit,
          take: validated.limit,
        }),
        prisma.user.count({ where }),
      ]);

      results.users = users;
      results.pagination.total += totalUsers;
    }

    results.pagination.totalPages = Math.ceil(
      results.pagination.total / validated.limit
    );

    return NextResponse.json({ results });
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
