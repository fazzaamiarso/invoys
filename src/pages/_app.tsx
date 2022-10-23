import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { trpc } from '@utils/trpc';
import { DefaultSeo } from 'next-seo';
import { SessionProvider, signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { NextPage } from 'next';
import { Toaster } from 'react-hot-toast';

export type NextPageWithAuth = AppProps & {
  Component: NextPage & { isAuth?: boolean };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pageProps: any;
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: NextPageWithAuth) => {
  const isAuth = Component.isAuth ?? true; //all page default to need auth

  return (
    <SessionProvider session={session}>
      <DefaultSeo titleTemplate="%s | Invoys" defaultTitle="Invoys" />
      {isAuth ? (
        <Auth>
          <Component {...pageProps} />
        </Auth>
      ) : (
        <Component {...pageProps} />
      )}
      <Toaster />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);

function Auth({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isUser = !!session?.user;
  useEffect(() => {
    if (status === 'loading') return;
    if (!isUser) signIn();
  }, [isUser, status]);

  if (isUser) {
    return <>{children}</>;
  }
  return null;
}
