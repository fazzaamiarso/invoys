import type { NextApiRequest, NextApiResponse } from 'next';
import { appRouter } from 'server/trpc/router';

// Called by Courier Automation CRON trigger
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const caller = appRouter.createCaller({} as any);

  try {
    await caller.invoice.batchUpdateOverdues();
    res.status(200).json({ success: 'true' });
  } catch (err) {
    res.status(500);
  }
}
