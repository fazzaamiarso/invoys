import { t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { InvoiceStatus } from '@prisma/client';
import { sendInvoice } from '@lib/courier';

const orderItemSchema = z.object({
  name: z.string(),
  amount: z.number(),
  quantity: z.number(),
});

export const invoiceRouter = t.router({
  getAll: t.procedure
    .input(
      z
        .object({
          status: z.nativeEnum(InvoiceStatus).optional(),
          query: z.string(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      // Implement the search
      const invoices = await ctx.prisma.invoice.findMany({
        where: {
          status: input?.status,
          OR: [
            { invoiceNumber: { contains: input?.query } },
            { name: { contains: input?.query } },
            { customer: { name: { contains: input?.query } } },
          ],
        },
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
        recipientEmail: z.string(),
        orders: z.array(orderItemSchema),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const currentClient = await ctx.prisma.customer.findUnique({
        where: { email: input.recipientEmail },
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
          customer: { connect: { email: input.recipientEmail } },
          orders: { createMany: { data: input.orders } },
        },
      });
      return createdInvoice;
    }),
  edit: t.procedure
    .input(
      z.object({
        invoiceId: z.string(),
        name: z.string(),
        dueDate: z.string(),
        issuedOn: z.string(),
        notes: z.string().optional(),
        recipientEmail: z.string(),
        orders: z.array(orderItemSchema),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.orderItem.deleteMany({
        where: { invoiceId: input.invoiceId },
      });

      const updatedInvoice = await ctx.prisma.invoice.update({
        where: { id: input.invoiceId },
        data: {
          name: input.name,
          dueDate: new Date(input.dueDate),
          issuedOn: new Date(input.issuedOn),
          notes: input.notes,
          orders: { createMany: { data: input.orders } },
        },
      });

      return updatedInvoice;
    }),
  delete: t.procedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedInvoice = await ctx.prisma.invoice.delete({
        where: { id: input.invoiceId },
      });
      return deletedInvoice;
    }),
  updateStatus: t.procedure
    .input(
      z.object({ invoiceId: z.string(), status: z.nativeEnum(InvoiceStatus) })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedStatus = await ctx.prisma.invoice.update({
        where: { id: input.invoiceId },
        data: { status: input.status },
      });
      return updatedStatus;
    }),
  sendEmail: t.procedure
    .input(
      z.object({
        customerName: z.string(),
        invoiceNumber: z.string(),
        pdfUri: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const requestId = await sendInvoice(input);
      return requestId;
    }),
});
