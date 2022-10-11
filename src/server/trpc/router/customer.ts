import { z } from 'zod';
import { t } from '../trpc';

export const customerRouter = t.router({
  getAll: t.procedure
    .input(
      z.object({
        limit: z.number().optional(),
        query: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const clients = await ctx.prisma.customer.findMany({
        take: input.limit,
        where: {
          email: { search: input.query },
        },
      });
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
