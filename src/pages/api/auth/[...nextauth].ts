import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { UserRole } from '@prisma/client';
import { twGradients } from 'data/gradients';
import NextAuth, {
  DefaultSession,
  NextAuthOptions,
  DefaultUser,
} from 'next-auth';
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
  callbacks: {
    session: async ({ user, session }) => {
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