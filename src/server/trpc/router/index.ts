// src/server/router/index.ts
import { t } from '../trpc';
import { customerRouter } from './customer';
import { invoiceRouter } from './invoice';

export const appRouter = t.router({
  invoice: invoiceRouter,
  customer: customerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
