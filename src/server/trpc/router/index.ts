// src/server/router/index.ts
import { t } from '../trpc';
import { customerRouter } from './customer';
import { invoiceRouter } from './invoice';
import { settingsRouter } from './settings';

export const appRouter = t.router({
  invoice: invoiceRouter,
  customer: customerRouter,
  setting: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
