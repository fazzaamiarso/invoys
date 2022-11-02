import { AccessOptions } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, t } from '../trpc';

const SETTINGS_ID = 'settings';

export const settingsRouter = t.router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.settings.findUnique({
      where: { id: SETTINGS_ID },
    });
    if (!settings)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Settings should exist, go check the settings table creation',
      });
    return settings;
  }),
  update: protectedProcedure
    .input(
      z.object({
        businessName: z.string(),
        businessPhone: z.string(),
        businessEmail: z.string(),
        businessAddress: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedSettings = await ctx.prisma.settings.update({
        where: { id: SETTINGS_ID },
        data: input,
      });
      return updatedSettings;
    }),
  changeAccess: protectedProcedure
    .input(z.object({ access: z.nativeEnum(AccessOptions) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.settings.update({
        where: { id: SETTINGS_ID },
        data: input,
      });
    }),
  sendInvite: protectedProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const email = await ctx.prisma.email.create({
          data: { settingsId: SETTINGS_ID, isPending: true, name: input.email },
        });
        return email;
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Email already exist!',
        });
      }
    }),
});
