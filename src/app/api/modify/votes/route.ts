import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, RadioAPIFetch } from '@/lib/api/utils';
import { HTTPError } from '@/lib/api/schemas';
import { withErrorHandler } from '@/lib/api/errorHandler';

/*
  Increases station vote count by passing in its UUID.
*/
export const POST = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
  const baseUrl: string = await getBaseUrl();

  if (!request.nextUrl.searchParams.get('uuid')) {
    throw new HTTPError('Station UUID missing.', 400);
  }

  const stationUUID: string = request.nextUrl.searchParams.get('uuid')?.toString() || '';
  const url: string = `${baseUrl}/vote/${stationUUID}`;
  const res: globalThis.Response = await RadioAPIFetch(url);

  if (!res.ok) {
    throw new Error(`Failed to update vote count for stationUUID: ${stationUUID}`);
  }

  return NextResponse.json({ message: `Vote count updated for stationUUID: ${stationUUID}` });
});
