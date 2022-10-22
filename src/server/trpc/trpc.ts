import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';
import superjson from 'superjson';

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAdmin = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: "Sorry, but you shouldn't see this content!",
    });
  }

  return next({ ctx });
});

export const protectedProcedure = t.procedure.use(isAdmin);
