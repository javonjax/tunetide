import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/api/utils';
import { RadioAPIFetch } from '@/lib/api/utils';
import { HTTPError, RadioStation, RadioStationsAPIResponse, SchemaError } from '@/lib/api/schemas';
import { withErrorHandler } from '@/lib/api/errorHandler';
import { cacheFetch } from '@/lib/api/redisCache';

/*
  GET stations by uuid.
  Params:
    uuids: comma-separated list of UUIDs (required)
*/
export const GET = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
  const baseUrl: string = await getBaseUrl();
  const queryParams: string = request.nextUrl.searchParams.toString();
  const url: string = `${baseUrl}/stations/byuuid?${queryParams}`;
  const data: unknown = await cacheFetch(
    `stations:search:byuuid:${queryParams}`,
    async () => {
      const res: globalThis.Response = await RadioAPIFetch(url);
      if (!res.ok) {
        throw new HTTPError('Unable to get radio station at this time.', 404);
      }
      return res.json();
    },
    3600
  );

  const parsedData = RadioStationsAPIResponse.safeParse(data);
  if (!parsedData.success) {
    throw new SchemaError();
  }

  const stations: RadioStation[] = parsedData.data;

  return NextResponse.json(stations);
});
