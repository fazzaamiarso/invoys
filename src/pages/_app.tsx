// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppType } from 'next/app';
import { trpc } from '@utils/trpc';
import { DefaultSeo } from 'next-seo';
import { SessionProvider } from 'next-auth/react';

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <DefaultSeo titleTemplate="%s | Invoys" defaultTitle="Invoys" />
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
