import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";

const SALT_ROUNDS = 12;
const PASSWORD_HISTORY_LIMIT = 5; // Keep last 5 passwords

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function checkPasswordHistory(userId, newPassword) {
  const recentPasswords = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: PASSWORD_HISTORY_LIMIT,
  });

  for (const passwordRecord of recentPasswords) {
    const isMatch = await verifyPassword(newPassword, passwordRecord.passwordHash);
    if (isMatch) {
      return true; // Password was recently used
    }
  }

  return false; // Password is new (not in history)
}

export async function savePasswordHistory(userId, passwordHash) {
  await prisma.passwordHistory.create({
    data: {
      userId,
      passwordHash,
    },
  });

  // Clean up old passwords (keep only last PASSWORD_HISTORY_LIMIT)
  const allPasswords = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (allPasswords.length > PASSWORD_HISTORY_LIMIT) {
    const toDelete = allPasswords.slice(PASSWORD_HISTORY_LIMIT);
    await prisma.passwordHistory.deleteMany({
      where: {
        id: { in: toDelete.map((p) => p.id) },
      },
    });
  }
}
