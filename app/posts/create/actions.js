"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validations";

function slugFromTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createPost(formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session?.user?.role === "reader") return { error: "Forbidden" };

  const title = formData.get("title")?.toString() ?? "";
  const content = formData.get("content")?.toString() ?? "";
  const slug = formData.get("slug")?.toString() || slugFromTitle(title);
  const status = (formData.get("status")?.toString() || "draft");
  const excerpt = formData.get("excerpt")?.toString() || undefined;
  const category = formData.get("category")?.toString() || undefined;

  const finalSlugInput = slug || slugFromTitle(title);
  const validStatus = ["draft", "published", "archived"].includes(status) ? status : "draft";

  const parsed = createPostSchema.safeParse({
    title,
    content,
    slug: finalSlugInput,
    status: validStatus,
    excerpt,
    category,
  });

  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten() };
  }

  const data = parsed.data;
  const finalSlug = data.slug || slugFromTitle(data.title);

  const existing = await prisma.post.findUnique({ where: { slug: finalSlug } });
  if (existing) return { error: "A post with this slug already exists." };

  const wordCount = data.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      slug: finalSlug,
      status: data.status,
      excerpt: data.excerpt ?? null,
      category: data.category ?? null,
      authorId: session.user.id,
      readingTime,
      publishedAt: data.status === "published" ? new Date() : null,
    },
  });

  return { success: true };
}
