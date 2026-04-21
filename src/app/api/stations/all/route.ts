import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/api/utils';
import { RadioAPIFetch } from '@/lib/api/utils';
import { HTTPError, RadioStation, RadioStationsAPIResponse, SchemaError } from '@/lib/api/schemas';
import { withErrorHandler } from '@/lib/api/errorHandler';
import { cacheFetch } from '@/lib/api/redisCache';

/*
  GET all radio stations.
  WARNING: This API will return up to 100,000 items.
           Use the /stations API with query params to get faster results.
*/
export const GET = withErrorHandler(async (): Promise<NextResponse> => {
  const baseUrl: string = await getBaseUrl();
  const url: string = `${baseUrl}/stations`;
  const data: unknown = await cacheFetch(
    `stations:all`,
    async () => {
      const res: globalThis.Response = await RadioAPIFetch(url);
      if (!res.ok) {
        throw new HTTPError('Unable to get radio stations at this time.', 404);
      }
      return res.json();
    },
    3600
  );

  const parsedData = RadioStationsAPIResponse.safeParse(data);
  if (!parsedData.success) {
    throw new SchemaError();
  }

  const allStations: RadioStation[] = parsedData.data;
  return NextResponse.json(allStations);
});
