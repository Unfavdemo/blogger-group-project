"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPost } from "./actions";

export function CreatePostForm() {
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setPending(true);
    const formData = new FormData(e.target);
    const result = await createPost(formData);
    setPending(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    router.push("/posts");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 border-2 border-neutral-200 rounded-lg bg-neutral-50"
    >
      <h2 className="text-lg font-semibold text-neutral-900">New post</h2>
      {message && (
        <p
          className={`text-sm ${
            message.type === "error" ? "text-red-600" : "text-green-700"
          }`}
        >
          {message.text}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Title *
        </label>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          className="w-full px-3 py-2 border-2 border-neutral-300 rounded focus:border-neutral-500 focus:outline-none"
          placeholder="Post title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Slug (optional, generated from title if empty)
        </label>
        <input
          name="slug"
          type="text"
          className="w-full px-3 py-2 border-2 border-neutral-300 rounded focus:border-neutral-500 focus:outline-none"
          placeholder="url-friendly-slug"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Content *
        </label>
        <textarea
          name="content"
          required
          rows={8}
          className="w-full px-3 py-2 border-2 border-neutral-300 rounded focus:border-neutral-500 focus:outline-none"
          placeholder="Write your post..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Excerpt (optional)
        </label>
        <textarea
          name="excerpt"
          rows={2}
          className="w-full px-3 py-2 border-2 border-neutral-300 rounded focus:border-neutral-500 focus:outline-none"
          placeholder="Short summary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Status
        </label>
        <select
          name="status"
          className="w-full px-3 py-2 border-2 border-neutral-300 rounded focus:border-neutral-500 focus:outline-none"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Category (optional)
        </label>
        <input
          name="category"
          type="text"
          className="w-full px-3 py-2 border-2 border-neutral-300 rounded focus:border-neutral-500 focus:outline-none"
          placeholder="e.g. Tech, Life"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-neutral-900 text-white font-medium rounded hover:bg-neutral-700 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create post"}
        </button>
        <Link
          href="/posts"
          className="px-4 py-2 border-2 border-neutral-300 rounded hover:bg-neutral-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
