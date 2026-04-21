import { withErrorHandler } from '@/lib/api/errorHandler';
import { cacheFetch } from '@/lib/api/redisCache';
import { HTTPError, RadioStation, RadioStationsAPIResponse, SchemaError } from '@/lib/api/schemas';
import { getBaseUrl, RadioAPIFetch } from '@/lib/api/utils';
import { NextRequest, NextResponse } from 'next/server';

/*
  GET list of recently clicked radio stations.
*/
export const GET = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
  const baseUrl: string = await getBaseUrl();
  const queryParams: string = request.nextUrl.searchParams.toString();
  const url: string = `${baseUrl}/stations/lastclick?${queryParams}`;
  const data: unknown = await cacheFetch(
    `recent:clicked:${queryParams}`,
    async () => {
      const res: globalThis.Response = await RadioAPIFetch(url);
      if (!res.ok) {
        throw new HTTPError('Unable to get radio stations at this time.', 404);
      }
      return res.json();
    },
    300
  );

  const parsedData = RadioStationsAPIResponse.safeParse(data);
  if (!parsedData.success) {
    throw new SchemaError();
  }

  const recentlyClickedStations: RadioStation[] = parsedData.data;
  return NextResponse.json(recentlyClickedStations);
});
