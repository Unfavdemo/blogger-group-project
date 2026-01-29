// ✅ Data Relationships Tests
// By: Syriana (Part A - Data Guardians)
// Tests verify data integrity and cascade deletes

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Data Relationships and Cascade Deletes', () => {
  let userId;
  let postId;
  let commentId;
  let replyId;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'testrelationships@example.com',
        name: 'Test Relationships User',
        passwordHash: hashedPassword,
        role: 'reader',
      },
    });
    userId = user.id;

    // Create test post
    const post = await prisma.post.create({
      data: {
        title: 'Test Post for Relationships',
        content: 'Content',
        slug: 'test-post-relationships',
        authorId: userId,
        status: 'published',
        publishedAt: new Date(),
      },
    });
    postId = post.id;

    // Create test comment
    const comment = await prisma.comment.create({
      data: {
        content: 'Test comment',
        postId,
        authorId: userId,
      },
    });
    commentId = comment.id;

    // Create nested reply
    const reply = await prisma.comment.create({
      data: {
        content: 'Test reply',
        postId,
        authorId: userId,
        parentId: commentId,
      },
    });
    replyId = reply.id;
  });

  afterAll(async () => {
    // Clean up (cascade should handle most)
    await prisma.comment.deleteMany({
      where: { postId },
    });
    await prisma.post.deleteMany({
      where: { authorId: userId },
    });
    await prisma.user.delete({
      where: { id: userId },
    });
    await prisma.$disconnect();
  });

  describe('Foreign Key Relationships', () => {
    it('should have user-post relationship', async () => {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { author: true },
      });

      expect(post).toBeDefined();
      expect(post.authorId).toBe(userId);
      expect(post.author.id).toBe(userId);
    });

    it('should have post-comment relationship', async () => {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { post: true },
      });

      expect(comment).toBeDefined();
      expect(comment.postId).toBe(postId);
      expect(comment.post.id).toBe(postId);
    });

    it('should have comment-reply relationship', async () => {
      const reply = await prisma.comment.findUnique({
        where: { id: replyId },
        include: { parent: true },
      });

      expect(reply).toBeDefined();
      expect(reply.parentId).toBe(commentId);
      expect(reply.parent.id).toBe(commentId);
    });
  });

  describe('Cascade Deletes', () => {
    it('should cascade delete posts when user is deleted', async () => {
      // Create a new user and post for this test
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const testUser = await prisma.user.create({
        data: {
          email: 'cascadetest@example.com',
          name: 'Cascade Test User',
          passwordHash: hashedPassword,
          role: 'reader',
        },
      });

      const testPost = await prisma.post.create({
        data: {
          title: 'Cascade Test Post',
          content: 'Content',
          slug: 'cascade-test-post',
          authorId: testUser.id,
          status: 'published',
          publishedAt: new Date(),
        },
      });

      // Delete user - should cascade delete post
      await prisma.user.delete({
        where: { id: testUser.id },
      });

      // Verify post is deleted
      const deletedPost = await prisma.post.findUnique({
        where: { id: testPost.id },
      });

      expect(deletedPost).toBeNull();
    });

    it('should cascade delete comments when post is deleted', async () => {
      // Create test post with comments
      const testPost = await prisma.post.create({
        data: {
          title: 'Comment Cascade Test',
          content: 'Content',
          slug: 'comment-cascade-test',
          authorId: userId,
          status: 'published',
          publishedAt: new Date(),
        },
      });

      const testComment = await prisma.comment.create({
        data: {
          content: 'Test comment for cascade',
          postId: testPost.id,
          authorId: userId,
        },
      });

      // Delete post - should cascade delete comments
      await prisma.post.delete({
        where: { id: testPost.id },
      });

      // Verify comment is deleted
      const deletedComment = await prisma.comment.findUnique({
        where: { id: testComment.id },
      });

      expect(deletedComment).toBeNull();
    });

    it('should cascade delete nested replies when parent comment is deleted', async () => {
      // Create test comment with nested replies
      const testComment = await prisma.comment.create({
        data: {
          content: 'Parent comment',
          postId,
          authorId: userId,
        },
      });

      const testReply = await prisma.comment.create({
        data: {
          content: 'Nested reply',
          postId,
          authorId: userId,
          parentId: testComment.id,
        },
      });

      // Delete parent comment - should cascade delete replies
      await prisma.comment.delete({
        where: { id: testComment.id },
      });

      // Verify reply is deleted
      const deletedReply = await prisma.comment.findUnique({
        where: { id: testReply.id },
      });

      expect(deletedReply).toBeNull();
    });

    it('should cascade delete password history when user is deleted', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const testUser = await prisma.user.create({
        data: {
          email: 'passwordhistory@example.com',
          name: 'Password History User',
          passwordHash: hashedPassword,
          role: 'reader',
        },
      });

      await prisma.passwordHistory.create({
        data: {
          userId: testUser.id,
          passwordHash: hashedPassword,
        },
      });

      // Delete user - should cascade delete password history
      await prisma.user.delete({
        where: { id: testUser.id },
      });

      // Verify password history is deleted
      const history = await prisma.passwordHistory.findMany({
        where: { userId: testUser.id },
      });

      expect(history.length).toBe(0);
    });

    it('should cascade delete wellness check-ins when user is deleted', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const testUser = await prisma.user.create({
        data: {
          email: 'wellnesscascade@example.com',
          name: 'Wellness Cascade User',
          passwordHash: hashedPassword,
          role: 'reader',
        },
      });

      await prisma.wellness.create({
        data: {
          userId: testUser.id,
          mood: 'good',
          stress: 5,
        },
      });

      // Delete user - should cascade delete wellness
      await prisma.user.delete({
        where: { id: testUser.id },
      });

      // Verify wellness is deleted
      const wellness = await prisma.wellness.findMany({
        where: { userId: testUser.id },
      });

      expect(wellness.length).toBe(0);
    });
  });

  describe('Data Integrity', () => {
    it('should prevent orphaned comments', async () => {
      // Try to create comment with invalid postId
      await expect(
        prisma.comment.create({
          data: {
            content: 'Orphaned comment',
            postId: 'invalid-post-id',
            authorId: userId,
          },
        })
      ).rejects.toThrow();
    });

    it('should prevent orphaned posts', async () => {
      // Try to create post with invalid authorId
      await expect(
        prisma.post.create({
          data: {
            title: 'Orphaned post',
            content: 'Content',
            slug: 'orphaned-post',
            authorId: 'invalid-user-id',
            status: 'published',
            publishedAt: new Date(),
          },
        })
      ).rejects.toThrow();
    });

    it('should prevent orphaned replies', async () => {
      // Try to create reply with invalid parentId
      await expect(
        prisma.comment.create({
          data: {
            content: 'Orphaned reply',
            postId,
            authorId: userId,
            parentId: 'invalid-comment-id',
          },
        })
      ).rejects.toThrow();
    });
  });
});
