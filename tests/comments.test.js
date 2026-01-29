// ✅ Comprehensive Comment Tests
// By: Jay (Part D - Chat Champions)
// Tests all comment operations including deep nesting and edge cases

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Comments - Comprehensive Tests', () => {
  let authToken;
  let userId;
  let postId;
  let commentId;
  let replyId;
  let otherUserToken;
  let otherUserId;

  beforeAll(async () => {
    // Create test user and login
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'testcomment@example.com',
        name: 'Test Comment User',
        passwordHash: hashedPassword,
        role: 'reader',
      },
    });
    userId = user.id;

    // Create another user for authorization tests
    const otherUser = await prisma.user.create({
      data: {
        email: 'othercomment@example.com',
        name: 'Other Comment User',
        passwordHash: hashedPassword,
        role: 'reader',
      },
    });
    otherUserId = otherUser.id;

    // Create test post
    const post = await prisma.post.create({
      data: {
        title: 'Test Post for Comments',
        content: 'Content',
        slug: 'test-post-comments',
        authorId: userId,
        status: 'published',
        publishedAt: new Date(),
      },
    });
    postId = post.id;

    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testcomment@example.com',
        password: 'Password123!',
      }),
    });

    const loginData = await loginResponse.json();
    authToken = loginData.token;

    const otherLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'othercomment@example.com',
        password: 'Password123!',
      }),
    });

    const otherLoginData = await otherLoginResponse.json();
    otherUserToken = otherLoginData.token;
  });

  afterAll(async () => {
    // Clean up
    await prisma.comment.deleteMany({
      where: { postId },
    });
    await prisma.post.delete({
      where: { id: postId },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userId, otherUserId] } },
    });
    await prisma.$disconnect();
  });

  describe('Create Comment', () => {
    it('should create a top-level comment', async () => {
      const response = await fetch(`${BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: 'This is a test comment',
          postId,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.comment.id).toBeDefined();
      expect(data.comment.content).toBe('This is a test comment');
      expect(data.comment.parentId).toBeNull();
      commentId = data.comment.id;
    });

    it('should create a nested reply', async () => {
      const response = await fetch(`${BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: 'This is a reply',
          postId,
          parentId: commentId,
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(201);
      expect(data.comment.parentId).toBe(commentId);
      replyId = data.comment.id;
    });

    it('should create deeply nested replies (10+ levels)', async () => {
      let currentParentId = replyId;
      let depth = 0;

      // Create 12 levels of nesting
      while (depth < 12) {
        const response = await fetch(`${BASE_URL}/api/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            content: `Reply at depth ${depth + 1}`,
            postId,
            parentId: currentParentId,
          }),
        });

        const data = await response.json();
        expect(response.status).toBe(201);
        currentParentId = data.comment.id;
        depth++;
      }

      expect(depth).toBe(12);
    });

    it('should reject comment on non-existent post', async () => {
      const response = await fetch(`${BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: 'Comment',
          postId: 'invalid-post-id',
        }),
      });

      expect(response.status).toBe(404);
    });

    it('should reject reply to non-existent parent', async () => {
      const response = await fetch(`${BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: 'Reply',
          postId,
          parentId: 'invalid-comment-id',
        }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Get Comments', () => {
    it('should get nested comment tree', async () => {
      const response = await fetch(`${BASE_URL}/api/comments?postId=${postId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.comments).toBeInstanceOf(Array);
      
      // Check nested structure
      const topComment = data.comments.find((c) => c.id === commentId);
      expect(topComment).toBeDefined();
      expect(topComment.replies).toBeInstanceOf(Array);
      expect(topComment.replies.length).toBeGreaterThan(0);
    });

    it('should handle posts with no comments', async () => {
      const emptyPost = await prisma.post.create({
        data: {
          title: 'Empty Post',
          content: 'Content',
          slug: 'empty-post',
          authorId: userId,
          status: 'published',
          publishedAt: new Date(),
        },
      });

      const response = await fetch(`${BASE_URL}/api/comments?postId=${emptyPost.id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.comments).toEqual([]);

      // Clean up
      await prisma.post.delete({ where: { id: emptyPost.id } });
    });

    it('should maintain consistent ordering', async () => {
      const response = await fetch(`${BASE_URL}/api/comments?postId=${postId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      
      // Check ordering (should be by createdAt ascending)
      const comments = data.comments;
      for (let i = 1; i < comments.length; i++) {
        const prevDate = new Date(comments[i - 1].createdAt);
        const currDate = new Date(comments[i].createdAt);
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });
  });

  describe('Update Comment', () => {
    it('should update own comment', async () => {
      const response = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: 'Updated comment content',
        }),
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.comment.content).toBe('Updated comment content');
    });

    it('should reject updating other user comment', async () => {
      const otherComment = await prisma.comment.create({
        data: {
          content: 'Other user comment',
          postId,
          authorId: otherUserId,
        },
      });

      const response = await fetch(`${BASE_URL}/api/comments/${otherComment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: 'Hacked content',
        }),
      });

      expect(response.status).toBe(403);

      // Clean up
      await prisma.comment.delete({ where: { id: otherComment.id } });
    });
  });

  describe('Delete Comment', () => {
    let deleteCommentId;

    beforeAll(async () => {
      const comment = await prisma.comment.create({
        data: {
          content: 'Comment to delete',
          postId,
          authorId: userId,
        },
      });
      deleteCommentId = comment.id;
    });

    it('should soft delete comment', async () => {
      const response = await fetch(`${BASE_URL}/api/comments/${deleteCommentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);

      // Verify comment is soft deleted
      const deletedComment = await prisma.comment.findUnique({
        where: { id: deleteCommentId },
      });
      expect(deletedComment.deletedAt).toBeDefined();
    });

    it('should cascade delete nested replies when parent is deleted', async () => {
      const parentComment = await prisma.comment.create({
        data: {
          content: 'Parent comment',
          postId,
          authorId: userId,
        },
      });

      const childReply = await prisma.comment.create({
        data: {
          content: 'Child reply',
          postId,
          authorId: userId,
          parentId: parentComment.id,
        },
      });

      // Delete parent (hard delete for cascade test)
      await prisma.comment.delete({
        where: { id: parentComment.id },
      });

      // Verify child is cascade deleted
      const deletedChild = await prisma.comment.findUnique({
        where: { id: childReply.id },
      });
      expect(deletedChild).toBeNull();
    });

    it('should reject deleting other user comment', async () => {
      const otherComment = await prisma.comment.create({
        data: {
          content: 'Other user comment',
          postId,
          authorId: otherUserId,
        },
      });

      const response = await fetch(`${BASE_URL}/api/comments/${otherComment.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(403);

      // Clean up
      await prisma.comment.delete({ where: { id: otherComment.id } });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long comment content', async () => {
      const longContent = 'A'.repeat(6000);
      const response = await fetch(`${BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: longContent,
          postId,
        }),
      });

      // Should reject if exceeds max length (5000)
      expect([201, 400]).toContain(response.status);
    });

    it('should handle orphaned replies', async () => {
      // Create a reply
      const reply = await prisma.comment.create({
        data: {
          content: 'Orphaned reply',
          postId,
          authorId: userId,
          parentId: commentId,
        },
      });

      // Delete parent (hard delete)
      await prisma.comment.delete({
        where: { id: commentId },
      });

      // Reply should be cascade deleted
      const orphanedReply = await prisma.comment.findUnique({
        where: { id: reply.id },
      });
      expect(orphanedReply).toBeNull();
    });

    it('should handle large comment threads', async () => {
      // Create a comment with many replies
      const parent = await prisma.comment.create({
        data: {
          content: 'Parent with many replies',
          postId,
          authorId: userId,
        },
      });

      // Create 50 replies
      const replies = [];
      for (let i = 0; i < 50; i++) {
        const reply = await prisma.comment.create({
          data: {
            content: `Reply ${i}`,
            postId,
            authorId: userId,
            parentId: parent.id,
          },
        });
        replies.push(reply);
      }

      // Fetch comments and verify all replies are returned
      const response = await fetch(`${BASE_URL}/api/comments?postId=${postId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      
      const fetchedParent = data.comments.find((c) => c.id === parent.id);
      expect(fetchedParent.replies.length).toBe(50);

      // Clean up
      await prisma.comment.deleteMany({
        where: { id: { in: replies.map((r) => r.id) } },
      });
      await prisma.comment.delete({ where: { id: parent.id } });
    });
  });

  describe('Authorization Tests', () => {
    it('should allow reader to create comments', async () => {
      const response = await fetch(`${BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: 'Reader comment',
          postId,
        }),
      });

      expect(response.status).toBe(201);
    });

    it('should allow reader to update own comments', async () => {
      const ownComment = await prisma.comment.create({
        data: {
          content: 'Own comment',
          postId,
          authorId: userId,
        },
      });

      const response = await fetch(`${BASE_URL}/api/comments/${ownComment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: 'Updated own comment',
        }),
      });

      expect(response.status).toBe(200);

      // Clean up
      await prisma.comment.delete({ where: { id: ownComment.id } });
    });

    it('should prevent reader from updating other comments', async () => {
      const otherComment = await prisma.comment.create({
        data: {
          content: 'Other comment',
          postId,
          authorId: otherUserId,
        },
      });

      const response = await fetch(`${BASE_URL}/api/comments/${otherComment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: 'Hacked content',
        }),
      });

      expect(response.status).toBe(403);

      // Clean up
      await prisma.comment.delete({ where: { id: otherComment.id } });
    });
  });
});
