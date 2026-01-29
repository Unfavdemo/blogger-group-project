// Part E - Quil (RBAC Tests)
// Foundation is complete. Tests use mock users; optional: use real DB via Prisma for integration tests.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/auth.js';
import {
  hasPermission,
  requireAuth,
  requirePermission,
  getRolePermissions,
  isAdmin,
  canModifyOwnResource,
} from '../lib/rbac.js';
import { NextRequest } from 'next/server';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('RBAC (Role-Based Access Control)', () => {
  let adminUser, editorUser, readerUser;
  let adminToken, editorToken, readerToken;

  beforeAll(async () => {
    // Mock users for unit tests (schema uses lowercase: admin, editor, reader)
    adminUser = { id: 'admin-id', email: 'rbac-admin@test.com', name: 'RBAC Admin', role: 'admin' };
    editorUser = { id: 'editor-id', email: 'rbac-editor@test.com', name: 'RBAC Editor', role: 'editor' };
    readerUser = { id: 'reader-id', email: 'rbac-reader@test.com', name: 'RBAC Reader', role: 'reader' };

    adminToken = generateToken(adminUser);
    editorToken = generateToken(editorUser);
    readerToken = generateToken(readerUser);
  });

  afterAll(async () => {
    // No DB cleanup when using mocks
  });

  describe('hasPermission', () => {
    it('should return true if admin has permission', () => {
      expect(hasPermission('admin', 'posts:create')).toBe(true);
      expect(hasPermission('admin', 'admin:access')).toBe(true);
      expect(hasPermission('admin', 'users:delete')).toBe(true);
    });

    it('should return true if editor has permission', () => {
      expect(hasPermission('editor', 'posts:create')).toBe(true);
      expect(hasPermission('editor', 'comments:update')).toBe(true);
    });

    it('should return false if editor does not have permission', () => {
      expect(hasPermission('editor', 'admin:access')).toBe(false);
      expect(hasPermission('editor', 'users:delete')).toBe(false);
    });

    it('should return true if reader has permission', () => {
      expect(hasPermission('reader', 'posts:create')).toBe(true);
      expect(hasPermission('reader', 'posts:read')).toBe(true);
      expect(hasPermission('reader', 'comments:create')).toBe(true);
    });

    it('should return false if reader does not have permission', () => {
      expect(hasPermission('reader', 'posts:bulk-update')).toBe(false);
      expect(hasPermission('reader', 'admin:access')).toBe(false);
      expect(hasPermission('reader', 'users:read')).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(hasPermission('invalid-role', 'posts:read')).toBe(false);
    });

    it('should return false for invalid permission', () => {
      expect(hasPermission('admin', 'invalid:permission')).toBe(false);
    });
  });

  describe('requireAuth', () => {
    it('should authenticate user with valid Bearer token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      const result = await requireAuth(request);
      expect(result).not.toBeInstanceOf(Response);
      expect(result.id).toBe(adminUser.id);
      expect(result.role).toBe('admin');
    });

    it('should authenticate user with cookie token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          cookie: `token=${editorToken}`,
        },
      });

      const result = await requireAuth(request);
      expect(result).not.toBeInstanceOf(Response);
      expect(result.id).toBe(editorUser.id);
      expect(result.role).toBe('editor');
    });

    it('should return 401 if no token provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const result = await requireAuth(request);
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(401);
      const data = await result.json();
      expect(data.error).toContain('No token provided');
    });

    it('should return 401 if token is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          authorization: 'Bearer invalid-token-12345',
        },
      });

      const result = await requireAuth(request);
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(401);
      const data = await result.json();
      expect(data.error).toContain('Invalid or expired token');
    });
  });

  describe('requirePermission', () => {
    it('should allow admin to access admin-only permission', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin', {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      const result = await requirePermission(request, 'admin:access');
      expect(result).not.toBeInstanceOf(Response);
      expect(result.role).toBe('admin');
    });

    it('should allow editor to access posts:create', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts', {
        headers: {
          authorization: `Bearer ${editorToken}`,
        },
      });

      const result = await requirePermission(request, 'posts:create');
      expect(result).not.toBeInstanceOf(Response);
      expect(result.role).toBe('editor');
    });

    it('should allow reader to access posts:create', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts', {
        headers: {
          authorization: `Bearer ${readerToken}`,
        },
      });

      const result = await requirePermission(request, 'posts:create');
      expect(result).not.toBeInstanceOf(Response);
      expect(result.role).toBe('reader');
    });

    it('should block editor from accessing admin-only permission', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin', {
        headers: {
          authorization: `Bearer ${editorToken}`,
        },
      });

      const result = await requirePermission(request, 'admin:access');
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(403);
      const data = await result.json();
      expect(data.error).toBe('Forbidden');
    });

    it('should block reader from accessing bulk operations', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts/bulk', {
        headers: {
          authorization: `Bearer ${readerToken}`,
        },
      });

      const result = await requirePermission(request, 'posts:bulk-update');
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(403);
      const data = await result.json();
      expect(data.error).toBe('Forbidden');
    });

    it('should block reader from accessing user management', async () => {
      const request = new NextRequest('http://localhost:3000/api/users', {
        headers: {
          authorization: `Bearer ${readerToken}`,
        },
      });

      const result = await requirePermission(request, 'users:read');
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(403);
    });

    it('should return 401 if not authenticated', async () => {
      const request = new NextRequest('http://localhost:3000/api/posts');

      const result = await requirePermission(request, 'posts:create');
      expect(result).toBeInstanceOf(Response);
      expect(result.status).toBe(401);
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for admin', () => {
      const permissions = getRolePermissions('admin');
      expect(permissions.length).toBeGreaterThan(10);
      expect(permissions).toContain('admin:access');
      expect(permissions).toContain('posts:create');
      expect(permissions).toContain('users:delete');
    });

    it('should return permissions for editor', () => {
      const permissions = getRolePermissions('editor');
      expect(permissions.length).toBeGreaterThan(5);
      expect(permissions).toContain('posts:create');
      expect(permissions).not.toContain('admin:access');
    });

    it('should return permissions for reader', () => {
      const permissions = getRolePermissions('reader');
      expect(permissions.length).toBeGreaterThan(5);
      expect(permissions).toContain('posts:create');
      expect(permissions).toContain('posts:read');
      expect(permissions).not.toContain('admin:access');
      expect(permissions).not.toContain('posts:bulk-update');
    });

    it('should return empty array for invalid role', () => {
      const permissions = getRolePermissions('invalid-role');
      expect(permissions).toEqual([]);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin role', () => {
      expect(isAdmin('admin')).toBe(true);
    });

    it('should return false for editor role', () => {
      expect(isAdmin('editor')).toBe(false);
    });

    it('should return false for reader role', () => {
      expect(isAdmin('reader')).toBe(false);
    });
  });

  describe('canModifyOwnResource', () => {
    it('should allow admin to modify any resource', () => {
      expect(canModifyOwnResource('admin', 'user-123', 'admin-456')).toBe(true);
      expect(canModifyOwnResource('admin', 'user-123', 'user-123')).toBe(true);
    });

    it('should allow user to modify own resource', () => {
      expect(canModifyOwnResource('editor', 'user-123', 'user-123')).toBe(true);
      expect(canModifyOwnResource('reader', 'user-123', 'user-123')).toBe(true);
    });

    it('should block user from modifying others resources', () => {
      expect(canModifyOwnResource('editor', 'user-123', 'user-456')).toBe(false);
      expect(canModifyOwnResource('reader', 'user-123', 'user-456')).toBe(false);
    });
  });

  describe('Permission Matrix Verification', () => {
    it('should verify all admin permissions', () => {
      const adminPerms = getRolePermissions('admin');
      const expectedPerms = [
        'posts:create',
        'posts:read',
        'posts:update',
        'posts:delete',
        'posts:bulk-update',
        'posts:bulk-delete',
        'comments:create',
        'comments:read',
        'comments:update',
        'comments:delete',
        'users:read',
        'users:update',
        'users:delete',
        'wellness:read',
        'wellness:create',
        'admin:access',
      ];

      expectedPerms.forEach((perm) => {
        expect(adminPerms).toContain(perm);
        expect(hasPermission('admin', perm)).toBe(true);
      });
    });

    it('should verify editor permissions (no admin access)', () => {
      expect(hasPermission('editor', 'admin:access')).toBe(false);
      expect(hasPermission('editor', 'users:read')).toBe(false);
      expect(hasPermission('editor', 'posts:create')).toBe(true);
      expect(hasPermission('editor', 'posts:bulk-update')).toBe(true);
    });

    it('should verify reader permissions (can create/update/delete own posts)', () => {
      expect(hasPermission('reader', 'posts:create')).toBe(true);
      expect(hasPermission('reader', 'posts:update')).toBe(true);
      expect(hasPermission('reader', 'posts:delete')).toBe(true);
      expect(hasPermission('reader', 'posts:read')).toBe(true);
      expect(hasPermission('reader', 'posts:bulk-update')).toBe(false);
      expect(hasPermission('reader', 'admin:access')).toBe(false);
    });
  });
});
