import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { WellnessCheckinForm } from "./WellnessCheckinForm";

const PAGE_SIZE = 10;

export default async function WellnessPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user?.id;
  if (!userId) redirect("/login");

  const page = Math.max(1, parseInt(searchParams?.page || "1"));
  const [wellness, total] = await Promise.all([
    prisma.wellness.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.wellness.count({ where: { userId } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Wellness Check-In
        </h1>
        <p className="text-neutral-600 mt-1">
          Track your well-being. Entries are private.
        </p>
      </div>

      <WellnessCheckinForm />

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Recent check-ins
        </h2>
        {wellness.length === 0 ? (
          <p className="text-neutral-600">No check-ins yet.</p>
        ) : (
          <ul className="space-y-3">
            {wellness.map((w) => (
              <li
                key={w.id}
                className="p-4 border-2 border-neutral-200 rounded-lg flex justify-between items-center"
              >
                <div>
                  <span className="font-medium capitalize">{w.mood}</span>
                  <span className="mx-2 text-neutral-400">·</span>
                  <span>Stress: {w.stress}/10</span>
                  {w.notes && (
                    <p className="text-sm text-neutral-600 mt-1">{w.notes}</p>
                  )}
                </div>
                <time className="text-sm text-neutral-500">
                  {new Date(w.createdAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex gap-2">
            {page > 1 && (
              <Link
                href={`/wellness?page=${page - 1}`}
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
                href={`/wellness?page=${page + 1}`}
                className="px-3 py-1 border border-neutral-300 rounded hover:bg-neutral-100"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
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
