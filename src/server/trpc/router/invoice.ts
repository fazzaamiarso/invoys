import { protectedProcedure, t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { InvoiceStatus } from '@prisma/client';
import { sendInvoice } from '@lib/courier';
import { parseSort } from '@utils/prisma';

const orderItemSchema = z.object({
  name: z.string(),
  amount: z.number(),
  quantity: z.number(),
});

const sortSchema = z.enum(['asc', 'desc']).optional();

export const invoiceRouter = t.router({
  infiniteInvoices: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(10).optional(),
        status: z.nativeEnum(InvoiceStatus).optional(),
        query: z.string(),
        sort: z
          .object({
            customer_name: sortSchema,
            dueDate: sortSchema,
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const query = { contains: input?.query };
      const sort = parseSort(input?.sort ?? {});

      const invoices = await ctx.prisma.invoice.findMany({
        skip: input?.cursor ? 1 : 0,
        take: input?.limit ?? 10,
        include: { orders: true, customer: true },
        where: {
          status: input?.status,
          OR: [
            { invoiceNumber: query },
            { name: query },
            { customer: { name: query } },
          ],
        },
        cursor: input?.cursor ? { id: input.cursor } : undefined,
        orderBy: { ...sort },
      });

      const nextCursor = invoices?.at(-1)?.id;

      return { invoices, nextCursor };
    }),
  getAll: protectedProcedure
    .input(
      z
        .object({
          status: z.nativeEnum(InvoiceStatus).optional(),
          query: z.string(),
          sort: z
            .object({
              customer_name: sortSchema,
              dueDate: sortSchema,
            })
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const query = { contains: input?.query };
      const sort = parseSort(input?.sort ?? {});

      const invoices = await ctx.prisma.invoice.findMany({
        include: { orders: true, customer: true },
        where: {
          status: input?.status,
          OR: [
            { invoiceNumber: query },
            { name: query },
            { customer: { name: query } },
          ],
        },
        orderBy: sort,
      });

      return invoices;
    }),
  getSingle: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { id: input.invoiceId },
        include: { orders: true, customer: true },
      });
      return invoice;
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        dueDate: z.string(),
        issuedOn: z.string(),
        notes: z.string().optional(),
        recipientEmail: z.string(),
        orders: z.array(orderItemSchema),
        isDraft: z.boolean(),
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
          isDraft: input.isDraft,
        },
      });
      return createdInvoice;
    }),
  edit: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        name: z.string(),
        dueDate: z.string(),
        issuedOn: z.string(),
        notes: z.string().optional(),
        recipientEmail: z.string(),
        orders: z.array(orderItemSchema),
        isDraft: z.boolean(),
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
          isDraft: input.isDraft,
        },
      });

      return updatedInvoice;
    }),
  delete: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deletedInvoice = await ctx.prisma.invoice.delete({
        where: { id: input.invoiceId },
      });
      return deletedInvoice;
    }),
  updateStatus: protectedProcedure
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
  sendEmail: protectedProcedure
    .input(
      z.object({
        customerName: z.string(),
        invoiceNumber: z.string(),
        invoiceViewUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const requestId = await sendInvoice(input);
      return requestId;
    }),
});
