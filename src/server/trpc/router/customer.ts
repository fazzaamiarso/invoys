import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, t } from '../trpc';

const sortSchema = z.enum(['asc', 'desc']).optional();

const parseSort = (sortObject: Record<string, any>) => {
  for (const key in sortObject) {
    if (!key) continue;
    const splitted = key.split('_');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const init = { [splitted.pop()!]: sortObject[key] };
    return splitted.length > 1
      ? splitted.reduceRight((acc, k) => ({ [k]: acc }), init)
      : init;
  }
};

export const customerRouter = t.router({
  infiniteClients: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(10).optional(),
        query: z.string(),
        sort: z
          .object({
            name: sortSchema,
            email: sortSchema,
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const query = { contains: input?.query };
      const sort = parseSort(input?.sort ?? {});

      const customer = await ctx.prisma.customer.findMany({
        skip: input?.cursor ? 1 : 0,
        take: input?.limit ?? 10,
        where: {
          OR: [{ name: query }, { email: query }],
        },
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: sort,
      });

      const nextCursor = customer?.at(-1)?.id;

      return { customer, nextCursor };
    }),
  getAll: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.customer.findMany({ take: input.limit });
    }),
  search: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        query: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.customer.findMany({
        take: input?.limit ?? 10,
        where: {
          email: { search: `+${input?.query}` },
        },
      });
    }),
  getSingle: protectedProcedure
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
  create: protectedProcedure
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
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        phoneNumber: z.string(),
        email: z.string(),
        address: z.string().optional(),
        invoicePrefix: z.string().length(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updatedClient = await ctx.prisma.customer.update({
        data: input,
        where: { id: input.id },
      });
      return updatedClient;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const deletedClient = await ctx.prisma.customer.delete({
        where: { id: input.clientId },
      });
      return deletedClient;
    }),
});
