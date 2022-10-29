import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { UserRole } from '@prisma/client';
import { twGradients } from 'data/gradients';
import NextAuth, {
  DefaultSession,
  NextAuthOptions,
  DefaultUser,
} from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '../../../server/db/client';

export const authOptions: NextAuthOptions = {
  secret: 'verysecretthing',
  session: { strategy: process.env.APP_ENV === 'test' ? 'jwt' : 'database' },
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
    signIn: process.env.APP_ENV === 'test' ? undefined : '/auth/login',
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
      if (process.env.APP_ENV === 'test') {
        return {
          ...session,
          user: {
            ...session.user,
            email: token.email,
            gradient: 'flamingo',
            role: 'admin',
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
      const isSettingsExist = (await prisma.settings.count()) > 0;
      if (!isSettingsExist) await prisma.settings.create({ data: {} });
    },
    createUser: async message => {
      const isFirstUser = (await prisma.user.count()) < 1;
      const gradientKeys = Object.keys(twGradients);
      const randomGradient = gradientKeys.at(
        Math.floor(Math.random() * gradientKeys.length)
      );
      await prisma.user.update({
        where: { id: message.user.id },
        data: {
          gradient: randomGradient,
          role: isFirstUser ? 'SUPER_ADMIN' : 'ADMIN',
        },
      });
    },
  },
};

if (process.env.APP_ENV === 'test') {
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
          gradient: 'flamingo',
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
