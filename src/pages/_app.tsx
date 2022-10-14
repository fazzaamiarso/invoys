// src/pages/_app.tsx
import '../styles/globals.css';
import type { AppType } from 'next/app';
import { trpc } from '../utils/trpc';
import { DefaultSeo } from 'next-seo';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <DefaultSeo titleTemplate="%s | Invoys" defaultTitle="Invoys" />
      <Component {...pageProps} />
    </>
  );
};

export default trpc.withTRPC(MyApp);
