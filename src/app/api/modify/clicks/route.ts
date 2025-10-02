import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, RadioAPIFetch } from '@/lib/api/utils';
import { HTTPError } from '@/lib/api/schemas';

/*
  Increases station click count by passing in its UUID.
  This API should be called every time a user starts playing a stream
  to mark the stream as more popular.
*/
export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const baseUrl: string = await getBaseUrl();

    if (!request.nextUrl.searchParams.get('uuid')) {
      throw new HTTPError('Station UUID missing.', 400);
    }

    const stationUUID: string = request.nextUrl.searchParams.get('uuid')?.toString() || '';
    const url: string = `${baseUrl}/url/${stationUUID}`;
    const res: globalThis.Response = await RadioAPIFetch(url);

    if (!res.ok) {
      throw new Error(`Failed to update click count for stationUUID: ${stationUUID}`);
    }

    return NextResponse.json({ message: `Click count updated for stationUUID: ${stationUUID}` });
  } catch (error) {
    let message: string = 'Internal server error';
    let status: number = 500;

    if (error instanceof Error) {
      message = error.message;
    }
    if (error instanceof HTTPError) {
      status = error.status;
    }

    return NextResponse.json({ error: message }, { status: status || 500 });
  }
};
