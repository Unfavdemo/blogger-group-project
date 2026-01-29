import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Global Search', () => {
  let authToken;
  let userId;
  let postId;
  let commentId;

  beforeAll(async () => {
    // Create test user and login
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'testsearch@example.com',
        name: 'Test Search User',
        passwordHash: hashedPassword,
        role: 'reader',
      },
    });
    userId = user.id;

    // Create test post
    const post = await prisma.post.create({
      data: {
        title: 'Searchable Post Title',
        content: 'This post contains searchable content',
        slug: 'searchable-post',
        authorId: userId,
        status: 'published',
        publishedAt: new Date(),
      },
    });
    postId = post.id;

    // Create test comment
    const comment = await prisma.comment.create({
      data: {
        content: 'This is a searchable comment',
        postId,
        authorId: userId,
      },
    });
    commentId = comment.id;

    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testsearch@example.com',
        password: 'Password123!',
      }),
    });

    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  afterAll(async () => {
    // Clean up
    await prisma.comment.deleteMany({
      where: { postId },
    });
    await prisma.post.delete({
      where: { id: postId },
    });
    await prisma.user.delete({
      where: { id: userId },
    });
    await prisma.$disconnect();
  });

  describe('Search All', () => {
    it('should search across all types', async () => {
      const response = await fetch(`${BASE_URL}/api/search?query=searchable&type=all`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.results.posts).toBeInstanceOf(Array);
      expect(data.results.comments).toBeInstanceOf(Array);
      expect(data.results.users).toBeInstanceOf(Array);
    });
  });

  describe('Search Posts', () => {
    it('should search posts only', async () => {
      const response = await fetch(`${BASE_URL}/api/search?query=searchable&type=posts`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.results.posts.length).toBeGreaterThan(0);
      expect(data.results.posts[0].title).toContain('Searchable');
    });
  });

  describe('Search Comments', () => {
    it('should search comments only', async () => {
      const response = await fetch(`${BASE_URL}/api/search?query=searchable&type=comments`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.results.comments.length).toBeGreaterThan(0);
    });
  });

  describe('Search with Filters', () => {
    it('should filter by author', async () => {
      const response = await fetch(
        `${BASE_URL}/api/search?query=searchable&type=posts&author=Test`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.results.posts).toBeInstanceOf(Array);
    });
  });
});
