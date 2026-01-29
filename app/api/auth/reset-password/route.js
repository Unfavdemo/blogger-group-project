import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPasswordResetToken } from '@/lib/auth';
import { hashPassword, checkPasswordHistory, savePasswordHistory } from '@/lib/password';
import { resetPasswordSchema } from '@/lib/validations';

export async function POST(req) {
  try {
    const body = await req.json();
    const validated = resetPasswordSchema.parse(body);

    // Verify reset token
    const tokenData = verifyPasswordResetToken(validated.token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check password history (returns true if password was used)
    const wasUsed = await checkPasswordHistory(user.id, validated.password);
    if (wasUsed) {
      return NextResponse.json(
        { error: 'You cannot reuse a recent password. Please choose a different password.' },
        { status: 400 }
      );
    }

    // Update password
    const hashedPassword = await hashPassword(validated.password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // Save to password history (pass the hash, not plain password)
    await savePasswordHistory(user.id, hashedPassword);

    return NextResponse.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
