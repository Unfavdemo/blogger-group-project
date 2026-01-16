// ✅ Database Seed Script
// By: Niki (Part A - Database Setup Leader)
// Creates sample data for development and testing

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin123!@#', 12);
  const editorPassword = await bcrypt.hash('Editor123!@#', 12);
  const readerPassword = await bcrypt.hash('Reader123!@#', 12);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'admin',
      emailVerified: new Date(),
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      name: 'Editor User',
      passwordHash: editorPassword,
      role: 'editor',
      emailVerified: new Date(),
    },
  });

  const reader = await prisma.user.upsert({
    where: { email: 'reader@example.com' },
    update: {},
    create: {
      email: 'reader@example.com',
      name: 'Reader User',
      passwordHash: readerPassword,
      role: 'reader',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created users:', { admin: admin.email, editor: editor.email, reader: reader.email });

  // Create sample posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Welcome to Our Blog',
      slug: 'welcome-to-our-blog',
      content: 'This is the first blog post. Welcome to our platform!',
      excerpt: 'A warm welcome to all our readers.',
      status: 'published',
      publishedAt: new Date(),
      viewCount: 42,
      readingTime: 2,
      category: 'Announcements',
      tags: ['welcome', 'getting-started'],
      metaTitle: 'Welcome to Our Blog',
      metaDescription: 'A warm welcome to all our readers.',
      authorId: admin.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Getting Started with Blogging',
      slug: 'getting-started-with-blogging',
      content: 'Learn how to create your first blog post and share your thoughts with the world.',
      excerpt: 'A guide for new bloggers.',
      status: 'published',
      publishedAt: new Date(),
      viewCount: 28,
      readingTime: 5,
      category: 'Tutorials',
      tags: ['tutorial', 'blogging'],
      authorId: editor.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Draft Post Example',
      slug: 'draft-post-example',
      content: 'This is a draft post that has not been published yet.',
      excerpt: 'An example of a draft post.',
      status: 'draft',
      category: 'Examples',
      tags: ['draft'],
      authorId: reader.id,
    },
  });

  console.log('✅ Created posts:', post1.slug, post2.slug, post3.slug);

  // Create sample comments with nested replies
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Great post! Thanks for sharing.',
      postId: post1.id,
      authorId: reader.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: 'I found this very helpful.',
      postId: post1.id,
      authorId: editor.id,
    },
  });

  // Nested reply
  const reply1 = await prisma.comment.create({
    data: {
      content: 'Glad you found it helpful!',
      postId: post1.id,
      authorId: admin.id,
      parentId: comment2.id,
    },
  });

  // Deeply nested reply
  const reply2 = await prisma.comment.create({
    data: {
      content: 'Thanks for the feedback!',
      postId: post1.id,
      authorId: editor.id,
      parentId: reply1.id,
    },
  });

  console.log('✅ Created comments with nested replies');

  // Create wellness check-ins
  await prisma.wellness.create({
    data: {
      userId: reader.id,
      mood: 'happy',
      stress: 3,
      notes: 'Feeling good today!',
    },
  });

  await prisma.wellness.create({
    data: {
      userId: editor.id,
      mood: 'calm',
      stress: 5,
      notes: 'Busy but manageable day.',
    },
  });

  console.log('✅ Created wellness check-ins');

  // Create password history entries
  await prisma.passwordHistory.create({
    data: {
      userId: admin.id,
      passwordHash: await bcrypt.hash('OldPassword123!@#', 12),
    },
  });

  console.log('✅ Created password history entries');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
