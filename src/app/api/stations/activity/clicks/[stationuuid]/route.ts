import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/api/utils';
import { RadioAPIFetch } from '@/lib/api/utils';
import {
  ClickData,
  HTTPError,
  SchemaError,
  StationClick,
  StationClicksAPIResponse,
} from '@/lib/api/schemas';
import { withErrorHandler } from '@/lib/api/errorHandler';
import { cacheFetch } from '@/lib/api/redisCache';

export const GET = withErrorHandler(
  async (
    request: NextRequest,
    {
      params,
    }: {
      params: Promise<{ stationuuid: string }>;
    }
  ): Promise<NextResponse> => {
    const { stationuuid }: { stationuuid: string } = await params;

    const baseUrl: string = await getBaseUrl();
    const queryParams: string = request.nextUrl.searchParams.toString();
    const url: string = `${baseUrl}/clicks/${stationuuid}?${queryParams}`;
    const res: globalThis.Response = await RadioAPIFetch(url);
    if (!res.ok) {
      throw new HTTPError('Unable to get click data at this time.', 404);
    }

    const data: unknown = await res.json();
    const parsedData = StationClicksAPIResponse.safeParse(data);
    if (!parsedData.success) {
      throw new SchemaError();
    }

    const stationClicks: StationClick[] = parsedData.data;
    const clicksPerHour: Record<string, number> = {}; // Object with key = time as a string, val = number of clicks
    const currentHour: number = new Date().getHours();

    // Insert keys into clicksPerHour object in order so that the current hour is last.
    for (let i: number = 1; i <= 24; i++) {
      clicksPerHour[String((currentHour + i) % 24) + ':00'] = 0;
    }

    for (const click of stationClicks) {
      const hour: number = new Date(click.clicktimestamp_iso8601).getHours();
      clicksPerHour[String(hour) + ':00']++;
    }

    // Convert data to format that is accepted by Rechart/Shadcn chart.
    const clicksChartData: ClickData[] = Object.entries(clicksPerHour).map(([hour, clicks]) => ({
      hour: hour,
      clicks: clicks,
    }));

    return NextResponse.json(clicksChartData);
  }
);
