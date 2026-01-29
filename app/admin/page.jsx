import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session?.user?.role !== "admin") redirect("/dashboard");

  const [users, postCount, commentCount] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count(),
    prisma.comment.count({ where: { deletedAt: null } }),
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-4">Admin Panel</h1>
      <p className="text-neutral-600 mb-6">
        Overview and user management (admin only).
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="p-4 border-2 border-neutral-200 rounded-lg bg-neutral-50">
          <p className="text-2xl font-bold text-neutral-900">{users.length}</p>
          <p className="text-sm text-neutral-600">Users</p>
        </div>
        <div className="p-4 border-2 border-neutral-200 rounded-lg bg-neutral-50">
          <p className="text-2xl font-bold text-neutral-900">{postCount}</p>
          <p className="text-sm text-neutral-600">Posts</p>
        </div>
        <div className="p-4 border-2 border-neutral-200 rounded-lg bg-neutral-50">
          <p className="text-2xl font-bold text-neutral-900">{commentCount}</p>
          <p className="text-sm text-neutral-600">Comments</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Users</h2>
        <ul className="border-2 border-neutral-200 rounded-lg overflow-hidden">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 last:border-b-0 bg-white even:bg-neutral-50"
            >
              <div>
                <span className="font-medium text-neutral-900">
                  {u.name || u.email}
                </span>
                <span className="text-neutral-600 text-sm ml-2">{u.email}</span>
              </div>
              <span className="capitalize text-sm text-neutral-600">{u.role}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/dashboard"
        className="text-neutral-700 underline hover:text-neutral-900"
      >
        ← Dashboard
      </Link>
    </div>
  );
}
