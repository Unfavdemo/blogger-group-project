// ✅ Comprehensive Post Tests
// By: Nya (Part C - Blog Builders)
// Tests all post operations including edge cases

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Blog Posts - Comprehensive Tests', () => {
  let authToken;
  let userId;
  let postId;
  let otherUserToken;
  let otherUserId;

  beforeAll(async () => {
    // Create test user and login
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'testpost@example.com',
        name: 'Test Post User',
        passwordHash: hashedPassword,
        role: 'editor',
      },
    });
    userId = user.id;

    // Create another user for authorization tests
    const otherUser = await prisma.user.create({
      data: {
        email: 'otheruser@example.com',
        name: 'Other User',
        passwordHash: hashedPassword,
        role: 'reader',
      },
    });
    otherUserId = otherUser.id;

    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testpost@example.com',
        password: 'Password123!',
      }),
    });

    const loginData = await loginResponse.json();
    authToken = loginData.token;

    const otherLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'otheruser@example.com',
        password: 'Password123!',
      }),
    });

    const otherLoginData = await otherLoginResponse.json();
    otherUserToken = otherLoginData.token;
  });

  afterAll(async () => {
    // Clean up
    await prisma.post.deleteMany({
      where: { authorId: { in: [userId, otherUserId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userId, otherUserId] } },
    });
    await prisma.$disconnect();
  });

  describe('Create Post', () => {
    it('should create a new post with all fields', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Test Post',
          content: 'This is a test post content with enough words to calculate reading time properly',
          slug: 'test-post',
          excerpt: 'Test excerpt',
          status: 'draft',
          category: 'Technology',
          tags: ['tech', 'test'],
          metaTitle: 'SEO Title',
          metaDescription: 'SEO description',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.post.id).toBeDefined();
      expect(data.post.title).toBe('Test Post');
      expect(data.post.readingTime).toBeGreaterThan(0);
      postId = data.post.id;
    });

    it('should auto-generate slug from title', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'My Awesome Post Title!',
          content: 'Content here',
          status: 'draft',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.post.slug).toBe('my-awesome-post-title');
    });

    it('should reject invalid data', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: '', // Invalid: empty title
          content: 'Content',
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject duplicate slug', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Different Title',
          content: 'Content',
          slug: 'test-post', // Duplicate
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Get Posts', () => {
    it('should get list of posts with pagination', async () => {
      const response = await fetch(`${BASE_URL}/api/posts?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.posts).toBeInstanceOf(Array);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });

    it('should filter posts by status', async () => {
      const response = await fetch(`${BASE_URL}/api/posts?status=draft`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.posts.every((p) => p.status === 'draft')).toBe(true);
    });

    it('should filter posts by author', async () => {
      const response = await fetch(`${BASE_URL}/api/posts?authorId=${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.posts.every((p) => p.authorId === userId)).toBe(true);
    });

    it('should filter posts by category', async () => {
      const response = await fetch(`${BASE_URL}/api/posts?category=Technology`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.posts.every((p) => p.category === 'Technology')).toBe(true);
    });

    it('should filter posts by tag', async () => {
      const response = await fetch(`${BASE_URL}/api/posts?tag=tech`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
    });

    it('should handle pagination edge cases', async () => {
      // Test page 0
      const response1 = await fetch(`${BASE_URL}/api/posts?page=0`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      expect(response1.status).toBe(200);

      // Test very large page number
      const response2 = await fetch(`${BASE_URL}/api/posts?page=99999`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      expect(response2.status).toBe(200);
      const data = await response2.json();
      expect(data.posts.length).toBe(0);
    });
  });

  describe('Get Single Post', () => {
    it('should get single post by ID', async () => {
      const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.post.id).toBe(postId);
      expect(data.post.author).toBeDefined();
    });

    it('should increment view count on view', async () => {
      const beforeResponse = await fetch(`${BASE_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const beforeData = await beforeResponse.json();
      const beforeViews = beforeData.post.viewCount;

      // View again
      await fetch(`${BASE_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const afterResponse = await fetch(`${BASE_URL}/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const afterData = await afterResponse.json();
      expect(afterData.post.viewCount).toBeGreaterThan(beforeViews);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await fetch(`${BASE_URL}/api/posts/invalid-id`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Update Post', () => {
    it('should update own post', async () => {
      const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Updated Test Post',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.post.title).toBe('Updated Test Post');
    });

    it('should update post status to published', async () => {
      const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: 'published',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.post.status).toBe('published');
      expect(data.post.publishedAt).toBeDefined();
    });

    it('should reject updating other user post', async () => {
      const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${otherUserToken}`,
        },
        body: JSON.stringify({
          title: 'Hacked Title',
        }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Delete Post', () => {
    let deletePostId;

    beforeAll(async () => {
      // Create a post to delete
      const post = await prisma.post.create({
        data: {
          title: 'Post to Delete',
          content: 'Content',
          slug: 'post-to-delete',
          authorId: userId,
          status: 'draft',
        },
      });
      deletePostId = post.id;
    });

    it('should delete own post', async () => {
      const response = await fetch(`${BASE_URL}/api/posts/${deletePostId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);

      // Verify post is deleted
      const deletedPost = await prisma.post.findUnique({
        where: { id: deletePostId },
      });
      expect(deletedPost).toBeNull();
    });

    it('should reject deleting other user post', async () => {
      const otherPost = await prisma.post.create({
        data: {
          title: 'Other User Post',
          content: 'Content',
          slug: 'other-user-post',
          authorId: otherUserId,
          status: 'draft',
        },
      });

      const response = await fetch(`${BASE_URL}/api/posts/${otherPost.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(403);

      // Clean up
      await prisma.post.delete({ where: { id: otherPost.id } });
    });
  });

  describe('Bulk Operations', () => {
    let bulkPost1, bulkPost2;

    beforeAll(async () => {
      bulkPost1 = await prisma.post.create({
        data: {
          title: 'Bulk Post 1',
          content: 'Content 1',
          slug: 'bulk-post-1',
          authorId: userId,
          status: 'draft',
        },
      });

      bulkPost2 = await prisma.post.create({
        data: {
          title: 'Bulk Post 2',
          content: 'Content 2',
          slug: 'bulk-post-2',
          authorId: userId,
          status: 'draft',
        },
      });
    });

    it('should bulk update posts', async () => {
      const response = await fetch(`${BASE_URL}/api/posts/bulk`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          posts: [
            { id: bulkPost1.id, data: { status: 'published' } },
            { id: bulkPost2.id, data: { category: 'Technology' } },
          ],
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.count).toBe(2);
    });

    it('should bulk delete posts', async () => {
      const deletePost1 = await prisma.post.create({
        data: {
          title: 'Delete Post 1',
          content: 'Content',
          slug: 'delete-post-1',
          authorId: userId,
          status: 'draft',
        },
      });

      const deletePost2 = await prisma.post.create({
        data: {
          title: 'Delete Post 2',
          content: 'Content',
          slug: 'delete-post-2',
          authorId: userId,
          status: 'draft',
        },
      });

      const response = await fetch(`${BASE_URL}/api/posts/bulk-delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          postIds: [deletePost1.id, deletePost2.id],
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.count).toBe(2);
    });

    it('should reject bulk update of other user posts', async () => {
      const otherPost = await prisma.post.create({
        data: {
          title: 'Other User Bulk Post',
          content: 'Content',
          slug: 'other-user-bulk-post',
          authorId: otherUserId,
          status: 'draft',
        },
      });

      const response = await fetch(`${BASE_URL}/api/posts/bulk`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          posts: [
            { id: otherPost.id, data: { status: 'published' } },
          ],
        }),
      });

      expect(response.status).toBe(403);

      // Clean up
      await prisma.post.delete({ where: { id: otherPost.id } });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long title', async () => {
      const longTitle = 'A'.repeat(300);
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: longTitle,
          content: 'Content',
          slug: 'long-title-post',
        }),
      });

      // Should reject if exceeds max length
      expect([201, 400]).toContain(response.status);
    });

    it('should handle empty category', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Post Without Category',
          content: 'Content',
          slug: 'no-category-post',
          category: '',
        }),
      });

      expect(response.status).toBe(201);
    });

    it('should handle special characters in slug', async () => {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: 'Post With Special Chars! @#$',
          content: 'Content',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      // Slug should be sanitized
      expect(data.post.slug).not.toContain('!');
      expect(data.post.slug).not.toContain('@');
    });
  });
});
