import { NextResponse } from 'next/server';
import { getRandomRadioBrowserBaseUrl } from '@/lib/api/utils';
import { withErrorHandler } from '@/lib/api/errorHandler';

/*
  GET a random available radio-browser server url.
 */
export const GET = withErrorHandler(async () => {
  const res: string = await getRandomRadioBrowserBaseUrl();
  return NextResponse.json({ server: res });
});
