import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import Link from "next/link";
import { CreatePostForm } from "./CreatePostForm";

export default async function CreatePostPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session?.user?.role === "reader") redirect("/posts");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-neutral-900 mb-4">Create Post</h1>
      <CreatePostForm />
      <div className="mt-4">
        <Link
          href="/dashboard"
          className="text-neutral-700 underline hover:text-neutral-900"
        >
          ← Dashboard
        </Link>
      </div>
    </div>
  );
}
