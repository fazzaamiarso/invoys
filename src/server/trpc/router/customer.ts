import { t } from '../trpc';

export const customerRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    const clients = await ctx.prisma.customer.findMany();
    return clients;
  }),
});
