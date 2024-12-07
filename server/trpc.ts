import { initTRPC } from '@trpc/server';
import { prisma } from '../prisma/client';

// Create context type
export type Context = {
  prisma: typeof prisma;
};

// Create context for each request
export const createContext = async () => {
  return {
    prisma,
  };
};

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure; 