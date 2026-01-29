import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";
import { bulkUpdatePostSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

// PATCH /api/posts/bulk - Bulk update posts
export async function PATCH(request) {
  try {
    const token = await requirePermission(request, "posts:bulk-update");
    if (token instanceof NextResponse) return token;

    const body = await request.json();
    const validated = bulkUpdatePostSchema.parse(body);
    const { posts } = validated;

    // Use transaction for atomic updates
    const results = await prisma.$transaction(
      posts.map(({ id, data }) =>
        prisma.post.update({
          where: { id },
          data,
        })
      ),
      {
        isolationLevel: "Serializable",
      }
    );

    return NextResponse.json({
      message: `${results.length} posts updated successfully`,
      posts: results,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    // Transaction rollback handled automatically by Prisma
    return NextResponse.json(
      { error: "Bulk update failed. All changes rolled back." },
      { status: 500 }
    );
  }
}
