import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

// Input schemas
const getPaperByIdSchema = z.string();
const searchPapersSchema = z.string();

export const paperRouter = router({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.paper.findMany({
        orderBy: { publishedAt: 'desc' },
      });
    }),

  getById: publicProcedure
    .input(getPaperByIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.prisma.paper.findUnique({
        where: { id: input },
      });
    }),

  search: publicProcedure
    .input(searchPapersSchema)
    .query(async ({ ctx, input }) => {
      return ctx.prisma.paper.findMany({
        where: {
          title: {
            contains: input,
            mode: 'insensitive',
          },
        },
        orderBy: { publishedAt: 'desc' },
      });
    }),
}); 