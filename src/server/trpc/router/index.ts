// src/server/router/index.ts
import { t } from '../trpc';

import { invoiceRouter } from './invoice';

export const appRouter = t.router({
  invoice: invoiceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
