import { protectedProcedure, t } from '../trpc';

export const userRouter = t.router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany();
    const pendingUsers = await ctx.prisma.email.findMany({
      where: { isPending: true },
    });
    return { users, pendingUsers };
  }),
});
