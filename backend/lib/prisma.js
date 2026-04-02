import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * Ensures only one connection to the database
 * Prevents multiple instances and connection pool issues
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global to preserve prisma instance
  // across module reloads from tools like nodemon
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['warn', 'error'],
    });
  }
  prisma = global.prisma;
}

export { prisma };