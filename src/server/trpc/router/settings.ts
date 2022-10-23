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
});