import { t } from '../trpc';
import { z } from 'zod';

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
        notes: z.string().optional(),
        recipientId: z.string(),
        orders: z.array(orderItemSchema),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const createdInvoice = await ctx.prisma.invoice.create({
        data: {
          name: input.name,
          dueDate: new Date(input.dueDate),
          notes: input.notes,
          customer: { connect: { id: input.recipientId } },
          orders: { createMany: { data: input.orders } },
        },
      });
      return createdInvoice;
    }),
});
