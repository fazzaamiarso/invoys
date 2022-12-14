/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { protectedProcedure, t } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { InvoiceStatus } from '@prisma/client';
import {
  cancelAutomationWorkflow,
  scheduleOverdueNotice,
  scheduleReminder,
  sendInvoice,
} from '@lib/courier';
import { parseSort } from '@utils/prisma';
import { dayjs } from '@lib/dayjs';
import { calculateOrderAmount } from '@utils/invoice';
import { DAY_TO_MS } from '@data/global';
import { TRPCClientError } from '@trpc/client';

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
  getSales: protectedProcedure
    .input(
      z
        .object({
          status: z.nativeEnum(InvoiceStatus).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const invoices = await ctx.prisma.invoice.findMany({
        include: { orders: true },
        where: {
          status: input?.status,
        },
        orderBy: { issuedOn: 'asc' },
      });
      const arr: { issued: number; paid: number }[] = [];
      invoices.forEach(i => {
        const totalAmount = calculateOrderAmount(i.orders);
        const monthIdx = Number(dayjs(i.dueDate).format('M')) - 1;
        if (!arr[monthIdx]) arr[monthIdx] = { paid: 0, issued: 0 };
        if (!arr[monthIdx]) return;
        if (i.status === 'PAID') {
          arr[monthIdx]! = {
            ...arr[monthIdx]!,
            paid: (arr[monthIdx]?.paid ?? 0) + totalAmount,
          };
        } else {
          arr[monthIdx]! = {
            ...arr[monthIdx]!,
            issued: (arr[monthIdx]?.issued ?? 0) + totalAmount,
          };
        }
      });

      return arr;
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
      const { invoiceId, status } = input;

      const updatedStatus = await ctx.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status },
      });

      // cancel payment reminder automation workflow
      if (status === 'PAID') {
        await cancelAutomationWorkflow({
          cancelation_token: `${invoiceId}-reminder`,
        });
      }

      return updatedStatus;
    }),
  deleteBatch: protectedProcedure
    .input(
      z.object({
        invoiceIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.invoice.deleteMany({
        where: { id: { in: input.invoiceIds } },
      });
    }),
  sendEmail: protectedProcedure
    .input(
      z.object({
        customerName: z.string(),
        invoiceNumber: z.string(),
        invoiceViewUrl: z.string(),
        emailTo: z.string(),
        invoiceId: z.string(),
        productName: z.string(),
        dueDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const scheduledDate = new Date(input.dueDate.getTime() - DAY_TO_MS * 1);
      const invoiceData = {
        ...input,
        dueDate: dayjs(input.dueDate).format('D MMMM YYYY'),
      };

      const { error: sendError } = await sendInvoice(invoiceData);
      if (sendError) throw new TRPCClientError(sendError);

      const { error: scheduleError } = await scheduleReminder({
        ...invoiceData,
        scheduledDate,
      });
      if (scheduleError) throw new TRPCClientError(scheduleError);
    }),
  batchUpdateOverdues: t.procedure.mutation(async ({ ctx }) => {
    const now = new Date();
    const overdueInvoices = await ctx.prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: now,
        },
      },
      include: { customer: { select: { name: true, email: true } } },
    });

    for (const invoice of overdueInvoices) {
      await ctx.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' },
      });

      // schedule an overdue reminder
      const { error } = await scheduleOverdueNotice({
        invoiceId: invoice.id,
        invoiceNumber: `#${invoice.invoiceNumber}`,
        customerName: invoice.customer.name,
        emailTo: invoice.customer.email,
        invoiceViewUrl: `${process.env.VERCEL_URL}/invoices/${invoice.id}/preview`,
        dueDate: dayjs(invoice.dueDate).format('D MMMM'),
      });
      if (error) throw new TRPCClientError(error);
    }
  }),
});
