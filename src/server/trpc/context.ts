// src/server/router/context.ts
import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { prisma } from '@lib/prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
// type CreateContextOptions = Record<string, never>;

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 */
export const createContextInner = async () => {
  return {
    prisma,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (
  opts: trpcNext.CreateNextContextOptions
) => {
  const req = opts.req;
  const res = opts.res;
  const session = await getServerSession(req, res, authOptions);

  const innerCtx = await createContextInner();
  return { ...innerCtx, session };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
