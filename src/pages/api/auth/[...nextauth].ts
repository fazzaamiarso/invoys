import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '../../../server/db/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify',
  },
};
export default NextAuth(authOptions);

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      gradient?: string;
    };
  }
}
