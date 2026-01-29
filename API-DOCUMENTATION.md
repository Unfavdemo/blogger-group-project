# API Documentation

**By: Sean (Part E - API Integration and Project Coordination)**

Complete API documentation for all endpoints in the Blogger Group Project.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in one of these ways:

1. **Authorization Header** (recommended):
   ```
   Authorization: Bearer <token>
   ```

2. **Cookie**:
   ```
   Cookie: token=<token>
   ```

## Error Responses

All endpoints follow consistent error response format:

```json
{
  "error": "Error message",
  "details": {} // Optional, for validation errors
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /api/auth/signup

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "Password123!"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

**Response:** `201 Created`
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "reader",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Validation error or email already exists

---

### POST /api/auth/login

Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "reader"
  },
  "token": "jwt-token-here"
}
```

**Errors:**
- `401` - Invalid credentials

---

### POST /api/auth/request-reset

Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "If an account exists, a password reset email has been sent"
}
```

**Note:** Always returns same message regardless of email existence (security best practice).

---

### POST /api/auth/reset-password

Reset password using reset token.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

**Errors:**
- `400` - Invalid/expired token or password reuse detected

---

### GET /api/auth/me

Get current authenticated user.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "reader"
  }
}
```

---

## Post Endpoints

### GET /api/posts

List posts with pagination and filters.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `status` (string, optional) - Filter by status: `draft`, `published`, `archived`
- `authorId` (string, optional) - Filter by author ID
- `category` (string, optional) - Filter by category
- `tag` (string, optional) - Filter by tag

**Response:** `200 OK`
```json
{
  "posts": [
    {
      "id": "post-id",
      "title": "Post Title",
      "slug": "post-slug",
      "content": "Post content...",
      "excerpt": "Post excerpt",
      "status": "published",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "viewCount": 42,
      "readingTime": 5,
      "category": "Technology",
      "tags": ["tech", "blogging"],
      "author": {
        "id": "author-id",
        "name": "Author Name",
        "email": "author@example.com"
      },
      "_count": {
        "comments": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### POST /api/posts

Create a new blog post.

**Authentication:** Required (`posts:create` permission)

**Request:**
```json
{
  "title": "My New Post",
  "content": "Post content here...",
  "slug": "my-new-post",
  "excerpt": "Brief excerpt",
  "status": "draft",
  "category": "Technology",
  "tags": ["tech", "tutorial"],
  "metaTitle": "SEO Title",
  "metaDescription": "SEO description"
}
```

**Response:** `201 Created`
```json
{
  "post": {
    "id": "post-id",
    "title": "My New Post",
    "slug": "my-new-post",
    "content": "Post content here...",
    "status": "draft",
    "readingTime": 3,
    "author": {
      "id": "author-id",
      "name": "Author Name",
      "email": "author@example.com"
    }
  }
}
```

**Note:** Slug is auto-generated from title if not provided.

---

### GET /api/posts/[id]

Get a single post by ID.

**Response:** `200 OK`
```json
{
  "post": {
    "id": "post-id",
    "title": "Post Title",
    "content": "Full post content...",
    "author": {
      "id": "author-id",
      "name": "Author Name",
      "email": "author@example.com"
    },
    "comments": [
      {
        "id": "comment-id",
        "content": "Comment text",
        "author": {
          "id": "author-id",
          "name": "Commenter Name"
        }
      }
    ]
  }
}
```

**Note:** View count is automatically incremented.

---

### PATCH /api/posts/[id]

Update a post.

**Authentication:** Required (`posts:update` permission)

**Authorization:** Must own the post (or be admin)

**Request:**
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "status": "published"
}
```

**Response:** `200 OK`
```json
{
  "post": {
    "id": "post-id",
    "title": "Updated Title",
    "content": "Updated content",
    "status": "published"
  }
}
```

**Errors:**
- `403` - Not authorized to update this post
- `404` - Post not found

---

### DELETE /api/posts/[id]

Delete a post.

**Authentication:** Required (`posts:delete` permission)

**Authorization:** Must own the post (or be admin)

**Response:** `200 OK`
```json
{
  "message": "Post deleted successfully"
}
```

**Note:** Comments are cascade deleted automatically.

---

### PATCH /api/posts/bulk

Bulk update multiple posts.

**Authentication:** Required (`posts:bulk-update` permission)

**Request:**
```json
{
  "posts": [
    {
      "id": "post-id-1",
      "data": {
        "status": "published"
      }
    },
    {
      "id": "post-id-2",
      "data": {
        "category": "Technology"
      }
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "2 posts updated successfully",
  "posts": [
    {
      "id": "post-id-1",
      "status": "published"
    },
    {
      "id": "post-id-2",
      "category": "Technology"
    }
  ]
}
```

**Note:** Uses transaction - if any update fails, all changes are rolled back.

---

### DELETE /api/posts/bulk-delete

Bulk delete multiple posts.

**Authentication:** Required (`posts:delete` permission)

**Authorization:** Must own all posts (or be admin)

**Request:**
```json
{
  "postIds": ["post-id-1", "post-id-2", "post-id-3"]
}
```

**Response:** `200 OK`
```json
{
  "message": "Successfully deleted 3 post(s)",
  "count": 3
}
```

**Note:** Uses transaction for atomicity.

---

## Comment Endpoints

### GET /api/comments

Get comments for a post with nested replies.

**Query Parameters:**
- `postId` (string, required) - Post ID to get comments for

**Response:** `200 OK`
```json
{
  "comments": [
    {
      "id": "comment-id",
      "content": "Comment text",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "author-id",
        "name": "Commenter Name",
        "email": "commenter@example.com"
      },
      "replies": [
        {
          "id": "reply-id",
          "content": "Reply text",
          "parentId": "comment-id",
          "author": {
            "id": "author-id",
            "name": "Replier Name"
          },
          "replies": [
            // Nested replies continue...
          ]
        }
      ]
    }
  ]
}
```

**Note:** Supports deep nesting (10+ levels). Only returns non-deleted comments.

---

### POST /api/comments

Create a comment or reply.

**Authentication:** Required (`comments:create` permission)

**Request:**
```json
{
  "content": "This is a comment",
  "postId": "post-id",
  "parentId": "comment-id" // Optional, for replies
}
```

**Response:** `201 Created`
```json
{
  "comment": {
    "id": "comment-id",
    "content": "This is a comment",
    "postId": "post-id",
    "parentId": null,
    "author": {
      "id": "author-id",
      "name": "Commenter Name",
      "email": "commenter@example.com"
    }
  }
}
```

---

### PATCH /api/comments/[id]

Update a comment.

**Authentication:** Required (`comments:update` permission)

**Authorization:** Must own the comment (or be admin)

**Request:**
```json
{
  "content": "Updated comment text"
}
```

**Response:** `200 OK`
```json
{
  "comment": {
    "id": "comment-id",
    "content": "Updated comment text"
  }
}
```

---

### DELETE /api/comments/[id]

Soft delete a comment.

**Authentication:** Required (`comments:delete` permission)

**Authorization:** Must own the comment (or be admin)

**Response:** `200 OK`
```json
{
  "message": "Comment deleted successfully"
}
```

**Note:** Soft delete - sets `deletedAt` timestamp. Replies are cascade deleted.

---

## Search Endpoint

### GET /api/search

Full-text search across posts, comments, and users.

**Query Parameters:**
- `query` (string, required) - Search query
- `type` (string, default: "all") - Filter by type: `posts`, `comments`, `users`, `all`
- `author` (string, optional) - Filter by author email
- `dateFrom` (string, optional) - Start date (ISO format)
- `dateTo` (string, optional) - End date (ISO format)
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page

**Response:** `200 OK`
```json
{
  "results": {
    "posts": [
      {
        "id": "post-id",
        "title": "Post Title",
        "content": "Post content...",
        "author": {
          "id": "author-id",
          "name": "Author Name"
        }
      }
    ],
    "comments": [
      {
        "id": "comment-id",
        "content": "Comment text",
        "author": {
          "id": "author-id",
          "name": "Commenter Name"
        },
        "post": {
          "id": "post-id",
          "title": "Post Title"
        }
      }
    ],
    "users": [
      {
        "id": "user-id",
        "name": "User Name",
        "email": "user@example.com",
        "role": "reader"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

## Wellness Endpoints

### GET /api/wellness

Get user's wellness check-ins (private).

**Authentication:** Required (`wellness:read` permission)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Response:** `200 OK`
```json
{
  "wellness": [
    {
      "id": "wellness-id",
      "mood": "good",
      "stress": 5,
      "notes": "Feeling good today",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

**Note:** Users can only see their own wellness data.

---

### POST /api/wellness

Create a wellness check-in.

**Authentication:** Required (`wellness:create` permission)

**Request:**
```json
{
  "mood": "good",
  "stress": 5,
  "notes": "Feeling good today"
}
```

**Response:** `201 Created`
```json
{
  "checkin": {
    "id": "wellness-id",
    "mood": "good",
    "stress": 5,
    "notes": "Feeling good today",
    "userId": "user-id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### GET /api/wellness/aggregate

Get anonymized aggregated wellness data (admin only).

**Authentication:** Required (`admin:access` permission)

**Response:** `200 OK`
```json
{
  "totalCheckins": 100,
  "avgStress": 5.5,
  "moodDistribution": [
    {
      "mood": "good",
      "_count": 50
    },
    {
      "mood": "okay",
      "_count": 30
    }
  ],
  "participationRate": 75,
  "totalUsers": 100,
  "usersWithCheckins": 75
}
```

---

## Permissions Reference

### Admin
- Full access to all endpoints
- Can modify any resource
- Access to admin-only endpoints

### Editor
- Can create/update/delete posts and comments
- Can perform bulk operations
- Cannot access admin endpoints
- Cannot manage users

### Reader
- Can create/update/delete own posts
- Can create/update/delete own comments
- Can read all published posts
- Cannot perform bulk operations
- Cannot access admin endpoints

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding for production.

---

## Versioning

API versioning not implemented. All endpoints are under `/api/`.

---

**Last Updated:** January 2024
**Maintained By:** Sean (Part E - API Integration)
