import { getRandomGradient } from '@utils/prisma';
import { prisma } from './client';

const SETTINGS_ID = 'settings';

export const createSettings = async () => {
  const isSettingsExist = (await prisma.settings.count()) > 0;
  if (!isSettingsExist) await prisma.settings.create({ data: {} });
};

const checkIsFirstUser = async () => {
  return (await prisma.user.count()) <= 1;
};

export const insertAdditionalUserData = async ({
  userId,
}: {
  userId: string;
}) => {
  const isFirstUser = await checkIsFirstUser();
  const gradient = getRandomGradient();
  await prisma.user.update({
    where: { id: userId },
    data: {
      gradient,
      role: isFirstUser ? 'SUPER_ADMIN' : 'ADMIN',
    },
  });
};

export const checkEmailExist = async (email: string) => {
  const findEmail = await prisma.email.findUnique({ where: { name: email } });
  return Boolean(findEmail);
};

export const checkInviteOnly = async () => {
  const data = await prisma.settings.findUnique({
    where: { id: SETTINGS_ID },
    select: { access: true },
  });
  return data?.access === 'INVITE';
};

export const unPendingUserEmail = async (email: string) => {
  try {
    await prisma.email.update({
      where: { name: email },
      data: { isPending: false },
    });
  } catch {
    console.log('OOps');
  }
};
