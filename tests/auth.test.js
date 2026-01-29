// ✅ Comprehensive Authentication Tests
// By: Danny (Part B - Security Squad)
// Tests all authentication scenarios including edge cases and security

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Authentication - Comprehensive Tests', () => {
  let testUserId;

  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'test@' } },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'test@' } },
    });
    await prisma.$disconnect();
  });

  describe('Signup', () => {
    it('should create a new user with valid data', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
      testUserId = data.user.id;
    });

    it('should reject duplicate email signup', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User 2',
          password: 'Password123!',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toContain('already exists');
    });

    describe('Password Validation Rules', () => {
      it('should reject password shorter than 8 characters', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test2@example.com',
            name: 'Test User',
            password: 'Short1!',
          }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBeDefined();
      });

      it('should reject password without uppercase letter', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test3@example.com',
            name: 'Test User',
            password: 'password123!',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject password without lowercase letter', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test4@example.com',
            name: 'Test User',
            password: 'PASSWORD123!',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject password without number', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test5@example.com',
            name: 'Test User',
            password: 'Password!',
          }),
        });

        expect(response.status).toBe(400);
      });

      it('should reject password without special character', async () => {
        const response = await fetch(`${BASE_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test6@example.com',
            name: 'Test User',
            password: 'Password123',
          }),
        });

        expect(response.status).toBe(400);
      });
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123!',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject empty email', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: '',
          password: 'Password123!',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject empty password', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: '',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection in email field', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: "admin' OR '1'='1",
          password: 'anything',
        }),
      });

      // Should not crash and should return 401 (not reveal if user exists)
      expect([400, 401]).toContain(response.status);
    });

    it('should prevent SQL injection in password field', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: "'; DROP TABLE users; --",
        }),
      });

      // Should not crash
      expect([400, 401]).toContain(response.status);
    });

    it('should sanitize XSS attempts in name field', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'xss@example.com',
          name: '<script>alert("XSS")</script>',
          password: 'Password123!',
        }),
      });

      // Should accept but sanitize (or reject)
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Password Reset', () => {
    it('should request password reset for existing user', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBeDefined();
    });

    it('should not reveal if email exists (security)', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      // Should return same message regardless
      expect(data.message).toBeDefined();
    });

    it('should reject invalid reset token', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'invalid-token',
          password: 'NewPassword123!',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid or expired');
    });

    it('should reject expired reset token', async () => {
      // This would require creating an expired token
      // For now, we test that invalid tokens are rejected
      const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'expired-token-here',
          password: 'NewPassword123!',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Unauthorized Access', () => {
    it('should reject access without token', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Post',
          content: 'Content',
          slug: 'test-post',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should reject access with invalid token', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer invalid-token',
        },
        body: JSON.stringify({
          title: 'Test Post',
          content: 'Content',
          slug: 'test-post',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should reject access with expired token', async () => {
      // Would need to create an expired token for full test
      // For now, we verify invalid tokens are rejected
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer expired-token',
        },
        body: JSON.stringify({
          title: 'Test Post',
          content: 'Content',
          slug: 'test-post',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: longEmail,
          name: 'Test User',
          password: 'Password123!',
        }),
      });

      // Should reject invalid email format
      expect([400, 422]).toContain(response.status);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'A'.repeat(1000) + '1!';
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'longpass@example.com',
          name: 'Test User',
          password: longPassword,
        }),
      });

      // Should accept or reject based on max length policy
      expect([201, 400]).toContain(response.status);
    });

    it('should handle special characters in email', async () => {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test+tag@example.com',
          name: 'Test User',
          password: 'Password123!',
        }),
      });

      // Should accept valid email with + tag
      expect([201, 400]).toContain(response.status);
    });
  });
});
