import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const orderItemSchema = z.object({
  name: z.string(),
  amount: z.number(),
  quantity: z.number(),
});

export const invoiceRouter = t.router({
  getAll: t.procedure.query(async ({ ctx }) => {
    const invoices = await ctx.prisma.invoice.findMany({
      include: { orders: true, customer: true },
    });
    return invoices;
  }),
  getSingle: t.procedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.invoiceId },
        include: { orders: true, customer: true },
      });
      return invoice;
    }),
  create: t.procedure
    .input(
      z.object({
        name: z.string(),
        dueDate: z.string(),
        issuedOn: z.string(),
        notes: z.string().optional(),
        recipientId: z.string(),
        orders: z.array(orderItemSchema),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const currentClient = await ctx.prisma.customer.findUnique({
        where: { id: input.recipientId },
        select: { invoicePrefix: true, _count: { select: { invoices: true } } },
      });

      if (!currentClient)
        throw new TRPCError({
          message: 'Client not found!',
          code: 'BAD_REQUEST',
        });
      const invoiceNumber = `${currentClient.invoicePrefix}-${(
        currentClient._count.invoices + 1
      )
        .toString()
        .padStart(4, '0')}`;

      const createdInvoice = await ctx.prisma.invoice.create({
        data: {
          name: input.name,
          dueDate: new Date(input.dueDate),
          issuedOn: new Date(input.issuedOn),
          notes: input.notes,
          invoiceNumber,
          customer: { connect: { id: input.recipientId } },
          orders: { createMany: { data: input.orders } },
        },
      });
      return createdInvoice;
    }),
  delete: t.procedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedInvoice = await ctx.prisma.invoice.delete({
        where: { id: input.invoiceId },
      });
      return deletedInvoice;
    }),
});
