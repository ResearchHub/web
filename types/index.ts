import { inferRouterOutputs, inferRouterInputs } from '@trpc/server';
import { AppRouter } from '../server/root';

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;

export type PaperOutput = RouterOutputs['paper']['getAll'][number]; 