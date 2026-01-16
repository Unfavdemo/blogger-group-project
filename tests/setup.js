// ✅ Test Environment Setup
// Configures test database and cleanup

import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, afterEach } from 'vitest';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL,
    },
  },
});

// Set up test database before all tests
beforeAll(async () => {
  // Ensure database is connected
  await prisma.$connect();
});

// Clean up after each test
afterEach(async () => {
  // Clean up test data if needed
  // Note: In a real scenario, you might want to clean specific tables
  // For now, we'll rely on test isolation
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Export prisma for use in tests
export { prisma };
