// src/utils/trpc.ts
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../server/trpc/router';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import { QueryCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      queryClientConfig: {
        queryCache: new QueryCache({
          onError: (error: any, query) => {
            if (query.state.data !== undefined) {
              toast.error(`Something went wrong: ${error.message}`);
            }
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
          },
        },
      },
      transformer: superjson,
      links: [
        loggerLink({
          enabled: opts =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  ssr: false,
});

export type InferProceduresOutput = inferRouterOutputs<AppRouter>;
export type InferProceduresInput = inferRouterInputs<AppRouter>;
