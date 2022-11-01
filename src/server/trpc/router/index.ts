// src/server/router/index.ts
import { t } from '../trpc';
import { customerRouter } from './customer';
import { generalRouter } from './general';
import { invoiceRouter } from './invoice';
import { settingsRouter } from './settings';
import { userRouter } from './user';

export const appRouter = t.router({
  invoice: invoiceRouter,
  customer: customerRouter,
  setting: settingsRouter,
  general: generalRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
