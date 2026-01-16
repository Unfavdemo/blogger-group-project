import { z } from "zod";

// Auth Schemas
export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)"),
  name: z.string().min(1, "Name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)"),
});

// Post Schemas
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featuredImage: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metaDescription: z.string().max(160).optional(),
  focusKeyword: z.string().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const bulkUpdatePostSchema = z.object({
  posts: z.array(
    z.object({
      id: z.string(),
      data: updatePostSchema,
    })
  ),
});

// Comment Schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(5000, "Comment too long"),
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(5000, "Comment too long"),
});

// Search Schema
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  type: z.enum(["posts", "comments", "users", "all"]).default("all"),
  author: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Wellness Schema
export const wellnessCheckinSchema = z.object({
  mood: z.enum(["excellent", "good", "okay", "low", "difficult"]),
  stress: z.number().int().min(1).max(10),
  notes: z.string().max(2000).optional(),
});
