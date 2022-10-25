import { calculateOrderAmount } from '@utils/invoice';
import { protectedProcedure, t } from '../trpc';

export const generalRouter = t.router({
  statistics: protectedProcedure.query(async ({ ctx }) => {
    const clientCount = await ctx.prisma.customer.count();
    const invoices = await ctx.prisma.invoice.findMany({
      select: {
        status: true,
        orders: { select: { amount: true, quantity: true } },
      },
    });
    const totalIssued = invoices.reduce(
      (acc, curr) => calculateOrderAmount(curr.orders) + acc,
      0
    );
    const totalPaid = invoices
      .filter(i => i.status === 'PAID')
      .reduce((acc, curr) => calculateOrderAmount(curr.orders) + acc, 0);

    return {
      client: { count: clientCount },
      invoice: { count: invoices.length, paid: totalPaid, issued: totalIssued },
    };
  }),
});
