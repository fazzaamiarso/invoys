import type { NextApiRequest, NextApiResponse } from 'next';
import { appRouter } from 'server/trpc/router';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // set this in hosting provider
  const { APP_CRON_KEY } = process.env;
  // set this in github action secret
  const ACTION_KEY = req.headers.authorization?.split(' ')[1];

  if (!ACTION_KEY) res.status(401);

  const caller = appRouter.createCaller({} as any);

  try {
    if (ACTION_KEY === APP_CRON_KEY) {
      await caller.invoice.batchUpdateOverdues();
      res.status(200).json({ success: 'true' });
    } else {
      res.status(401);
    }
  } catch (err) {
    res.status(500);
  }
}
