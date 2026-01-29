import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Dashboard</h1>
      <p className="text-neutral-600 mb-6">
        Welcome back, {user?.name || user?.email}.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/posts"
          className="block p-4 border-2 border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
        >
          <h2 className="font-semibold text-neutral-900">Blog Posts</h2>
          <p className="text-sm text-neutral-600 mt-1">
            View and manage blog posts
          </p>
        </Link>
        <Link
          href="/posts/create"
          className="block p-4 border-2 border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
        >
          <h2 className="font-semibold text-neutral-900">Create Post</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Write a new blog post
          </p>
        </Link>
        <Link
          href="/wellness"
          className="block p-4 border-2 border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
        >
          <h2 className="font-semibold text-neutral-900">Wellness</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Wellness check-ins
          </p>
        </Link>
        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="block p-4 border-2 border-neutral-200 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
          >
            <h2 className="font-semibold text-neutral-900">Admin Panel</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Manage users and settings
            </p>
          </Link>
        )}
      </div>

      <div className="mt-8 p-4 bg-neutral-100 border border-neutral-200 rounded-lg">
        <p className="text-sm text-neutral-700">
          <strong>Role:</strong> {user?.role}
        </p>
        <p className="text-sm text-neutral-700 mt-1">
          <strong>Email:</strong> {user?.email}
        </p>
      </div>
    </div>
  );
}
