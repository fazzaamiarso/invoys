import { getRandomGradient } from '@utils/prisma';
import { prisma } from './client';

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
