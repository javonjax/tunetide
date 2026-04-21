import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/api/utils';
import { RadioAPIFetch } from '@/lib/api/utils';
import { HTTPError, RadioStation, RadioStationsAPIResponse, SchemaError } from '@/lib/api/schemas';
import { withErrorHandler } from '@/lib/api/errorHandler';
import { cacheFetch } from '@/lib/api/redisCache';

/*
  GET stations using query params.
  Possible params listed here: https://fi1.api.radio-browser.info/#Advanced_station_search
*/
export const GET = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
  const baseUrl: string = await getBaseUrl();
  const queryParams: string = request.nextUrl.searchParams.toString();
  const url: string = `${baseUrl}/stations/search?${queryParams}`;
  const data: unknown = await cacheFetch(
    `stations:search:${queryParams}`,
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

  const stations: RadioStation[] = parsedData.data;
  return NextResponse.json(stations);
});
