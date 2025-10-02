import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, RadioAPIFetch } from '@/lib/api/utils';
import { HTTPError } from '@/lib/api/schemas';

/*
  Increases station vote count by passing in its UUID.
*/
export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const baseUrl: string = await getBaseUrl();

    if (!request.nextUrl.searchParams.get('uuid')) {
      throw new HTTPError('Station UUID missing.', 400);
    }

    const stationUUID: string = request.nextUrl.searchParams.get('uuid')?.toString() || '';
    const url: string = `${baseUrl}/vote/${stationUUID}`;
    const res: globalThis.Response = await RadioAPIFetch(url);

    const test = await res.json();
    console.log(test);

    if (!res.ok) {
      throw new Error(`Failed to update vote count for stationUUID: ${stationUUID}`);
    }

    return NextResponse.json({ message: `Vote count updated for stationUUID: ${stationUUID}` });
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
