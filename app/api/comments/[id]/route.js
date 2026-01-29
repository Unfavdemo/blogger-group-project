import { NextRequest, NextResponse } from "next/server";
import { requirePermission, canModifyOwnResource } from "@/lib/rbac";
import { updateCommentSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

// PATCH /api/comments/[id] - Update comment
export async function PATCH(request, { params }) {
  try {
    const token = await requirePermission(request, "comments:update");
    if (token instanceof NextResponse) return token;

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check ownership using RBAC helper
    if (!canModifyOwnResource(token.role, comment.authorId, token.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateCommentSchema.parse(body);

    const updatedComment = await prisma.comment.update({
      where: { id: params.id },
      data: validated,
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

    return NextResponse.json({ comment: updatedComment });
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

// DELETE /api/comments/[id] - Delete comment (soft delete)
export async function DELETE(request, { params }) {
  try {
    const token = await requirePermission(request, "comments:delete");
    if (token instanceof NextResponse) return token;

    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment || comment.deletedAt) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check ownership using RBAC helper
    if (!canModifyOwnResource(token.role, comment.authorId, token.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.comment.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
