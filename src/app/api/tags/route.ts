import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, RadioAPIFetch } from '@/lib/api/utils';
import { TagsAPIResponse, Tag, HTTPError, SchemaError } from '@/lib/api/schemas';
import { withErrorHandler } from '@/lib/api/errorHandler';
import { cacheFetch } from '@/lib/api/redisCache';

/*
  GET a list of tags in the radio-browser database. Tags are used to categorize
  stations. If a search term is provided, only tags containing the term as a substring
  will be returned.
*/
export const GET = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
  const baseUrl: string = await getBaseUrl();
  const searchTerm: string = request.nextUrl.searchParams.get('search') || '';
  const queryParams: URLSearchParams = request.nextUrl.searchParams;
  const filteredParams: URLSearchParams = new URLSearchParams();
  for (const [key, val] of queryParams.entries()) {
    if (key !== 'search') {
      filteredParams.append(key, val);
    }
  }

  const url: string = `${baseUrl}/tags${searchTerm ? `/${searchTerm}` : ''}${filteredParams.size ? `?${filteredParams.toString()}` : ''}`;
  const cacheKey: string = `tags${searchTerm ? `:${searchTerm}` : ''}${filteredParams.size ? `:${filteredParams.toString()}` : ''}`;
  const data: unknown = await cacheFetch(
    cacheKey,
    async () => {
      const res: globalThis.Response = await RadioAPIFetch(url);
      if (!res.ok) {
        throw new HTTPError('Unable to get radio station tags at this time.', 404);
      }
      return res.json();
    },
    300
  );

  const parsedData = TagsAPIResponse.safeParse(data);
  if (!parsedData.success) {
    throw new SchemaError();
  }

  const tags: Tag[] = parsedData.data;
  return NextResponse.json(tags);
});
