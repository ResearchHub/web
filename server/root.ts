import { router } from './trpc';
import { paperRouter } from './routers/paper';

export const appRouter = router({
  paper: paperRouter,
});

export type AppRouter = typeof appRouter; 