import { z } from 'zod';
import { t } from '../trpc';

export const customerRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    const clients = await ctx.prisma.customer.findMany();
    return clients;
  }),
  getSingle: t.procedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input, ctx }) => {
      const client = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
      });
      return client;
    }),
  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        phoneNumber: z.string(),
        email: z.string(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const createdClient = await ctx.prisma.customer.create({
        data: { ...input, phoneNumber: Number(input.phoneNumber) },
      });
      return createdClient;
    }),
});
