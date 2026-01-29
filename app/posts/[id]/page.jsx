import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PostDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
      _count: { select: { comments: true } },
    },
  });

  if (!post) notFound();

  return (
    <article className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/posts"
          className="text-neutral-700 underline hover:text-neutral-900"
        >
          ← All posts
        </Link>
      </div>
      <header className="border-b border-neutral-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">{post.title}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-600">
          <span>{post.author?.name || post.author?.email}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>{post.readingTime ?? "—"} min read</span>
          <span>{post._count?.comments ?? 0} comments</span>
          <span className="capitalize">{post.status}</span>
        </div>
      </header>
      <div className="prose prose-neutral max-w-none text-neutral-800 whitespace-pre-wrap">
        {post.content}
      </div>
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <Link
          href="/posts"
          className="text-neutral-700 underline hover:text-neutral-900"
        >
          ← Back to posts
        </Link>
      </div>
    </article>
  );
}
