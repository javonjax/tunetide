import { NextResponse } from 'next/server';
import { getRadioBrowserBaseUrls } from '@/lib/api/utils';
import { withErrorHandler } from '@/lib/api/errorHandler';

/*
  GET all available radio-browser server urls.
*/
export const GET = withErrorHandler(async (): Promise<NextResponse> => {
  const res: Set<string> = await getRadioBrowserBaseUrls();
  return NextResponse.json({ servers: res });
});
