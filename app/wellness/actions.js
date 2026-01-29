"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { prisma } from "@/lib/prisma";
import { wellnessCheckinSchema } from "@/lib/validations";

export async function createWellnessCheckin(formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const raw = {
    mood: formData.get("mood"),
    stress: parseInt(formData.get("stress"), 10),
    notes: formData.get("notes") || undefined,
  };

  const parsed = wellnessCheckinSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten() };
  }

  await prisma.wellness.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  });

  return { success: true };
}
