import type { NextApiRequest, NextApiResponse } from 'next';
import { appRouter } from 'server/trpc/router';

// Called by Courier Automation CRON trigger
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // set this in app hosting provider
  const { APP_CRON_KEY } = process.env;
  // set this webhook caller, in our case it's courier automation api
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
