import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const PASSWORD_RESET_EXPIRES_IN = '1h';

// Note: hashPassword is in lib/password.js with 12 salt rounds
// This function is kept for backward compatibility but should use lib/password.js
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function generatePasswordResetToken(userId) {
  return jwt.sign({ userId, type: 'password-reset' }, JWT_SECRET, {
    expiresIn: PASSWORD_RESET_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type === 'password-reset') {
      return null; // This is a password reset token, not an auth token
    }
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export function verifyPasswordResetToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type === 'password-reset' && decoded.userId) {
      return { userId: decoded.userId };
    }
    return null;
  } catch {
    return null;
  }
}

// Note: Password history functions are in lib/password.js
// These are kept for backward compatibility but should use lib/password.js
export async function checkPasswordHistory(userId, newPassword) {
  const { checkPasswordHistory: checkHistory } = await import('./password.js');
  return checkHistory(userId, newPassword);
}

export async function savePasswordToHistory(userId, passwordHash) {
  const { savePasswordHistory: saveHistory } = await import('./password.js');
  return saveHistory(userId, passwordHash);
}
