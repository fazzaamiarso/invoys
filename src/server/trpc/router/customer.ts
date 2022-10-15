import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { t } from '../trpc';

export const customerRouter = t.router({
  getAll: t.procedure
    .input(
      z
        .object({
          limit: z.number().optional(),
          query: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      if (!input?.limit || !input.query) {
        return await ctx.prisma.customer.findMany();
      } else {
        return await ctx.prisma.customer.findMany({
          take: input?.limit ?? 10,
          where: {
            email: { search: `+${input?.query}` },
          },
        });
      }
    }),
  getSingle: t.procedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ input, ctx }) => {
      const client = await ctx.prisma.customer.findUnique({
        where: { id: input.customerId },
        include: {
          invoices: {
            select: {
              createdAt: true,
              id: true,
              invoiceNumber: true,
              status: true,
              name: true,
            },
          },
        },
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
        invoicePrefix: z.string().length(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const isPrefixTaken = await ctx.prisma.customer.findUnique({
        where: { invoicePrefix: input.invoicePrefix },
      });
      if (isPrefixTaken)
        throw new TRPCError({
          message: 'Prefix is taken',
          code: 'BAD_REQUEST',
        });
      const createdClient = await ctx.prisma.customer.create({
        data: { ...input },
      });
      return createdClient;
    }),
});
