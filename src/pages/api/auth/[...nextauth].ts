import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { UserRole } from '@prisma/client';
import NextAuth, {
  DefaultSession,
  NextAuthOptions,
  DefaultUser,
} from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@lib/prisma/client';
import {
  createSettings,
  insertAdditionalUserData,
} from '@lib/prisma/next-auth';

const __TEST__ = process.env.APP_ENV === 'test';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: __TEST__ ? 'jwt' : 'database' },
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
    signIn: __TEST__ ? undefined : '/auth/login',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.email = profile?.email;
      }
      return token;
    },
    session: async ({ user, session, token }) => {
      if (__TEST__) {
        return {
          ...session,
          user: {
            ...session.user,
            email: token.email,
            gradient: 'flamingo',
            role: 'ADMIN',
          },
        };
      }
      return {
        ...session,
        user: { ...session.user, gradient: user.gradient, role: user.role },
      };
    },
  },
  events: {
    signIn: async () => {
      await createSettings();
    },
    createUser: async message => {
      await insertAdditionalUserData({ userId: message.user.id });
    },
  },
};

if (__TEST__) {
  authOptions.providers.push(
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          name: 'email',
          value: 'mock@e2e.com',
        },
      },
      async authorize(credentials) {
        return {
          email: credentials?.email,
          role: 'ADMIN',
          id: 'anything',
        };
      },
    })
  );
}

export default NextAuth(authOptions);

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      gradient?: string;
    };
  }
  interface User extends DefaultUser {
    gradient?: string;
    role: UserRole;
  }
}
