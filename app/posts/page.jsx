import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function PostsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const page = Math.max(1, parseInt(searchParams?.page || "1"));
  const status = searchParams?.status;
  const where = status ? { status } : {};

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Blog Posts</h1>
        {(session?.user?.role === "admin" || session?.user?.role === "editor") && (
          <Link
            href="/posts/create"
            className="px-4 py-2 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-700"
          >
            New Post
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-neutral-600 mb-6">No posts yet.</p>
      ) : (
        <ul className="space-y-4 mb-8">
          {posts.map((post) => (
            <li
              key={post.id}
              className="p-4 border-2 border-neutral-200 rounded-lg hover:border-neutral-300"
            >
              <Link href={`/posts/${post.id}`} className="block">
                <h2 className="font-semibold text-neutral-900">{post.title}</h2>
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                  {post.excerpt || post.content?.slice(0, 120)}
                  {(post.excerpt || post.content)?.length > 120 ? "…" : ""}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                  <span>{post.author?.name || post.author?.email}</span>
                  <span>{post.status}</span>
                  <span>{post.readingTime ?? "—"} min read</span>
                  <span>{post._count?.comments ?? 0} comments</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-neutral-700 underline hover:text-neutral-900"
        >
          ← Dashboard
        </Link>
        {totalPages > 1 && (
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/posts?page=${page - 1}${status ? `&status=${status}` : ""}`}
                className="px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-100"
              >
                Prev
              </Link>
            )}
            <span className="px-3 py-1 text-neutral-600">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/posts?page=${page + 1}${status ? `&status=${status}` : ""}`}
                className="px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-100"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
