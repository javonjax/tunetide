import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, isValidName, RadioAPIFetch } from '@/lib/api/utils';
import { HTTPError, Language, LanguagesAPIResponse, SchemaError } from '@/lib/api/schemas';
import { withErrorHandler } from '@/lib/api/errorHandler';
import { cacheFetch } from '@/lib/api/redisCache';

/*
  GET a list of languages for stations listed in the radio-browser data base.
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

  const url: string = `${baseUrl}/languages${searchTerm ? `/${searchTerm}` : ''}${filteredParams.size ? `?${filteredParams.toString()}` : ''}`;

  const data: unknown = await cacheFetch(
    `languages:${searchTerm}:${filteredParams.toString()}`,
    async () => {
      const res: globalThis.Response = await RadioAPIFetch(url);
      if (!res.ok) {
        throw new HTTPError('Unable to get languages at this time.', 404);
      }
      return res.json();
    },
    3600
  );

  const parsedData = LanguagesAPIResponse.safeParse(data);
  if (!parsedData.success) {
    throw new SchemaError();
  }

  const languages: Language[] = parsedData.data;
  const filteredLanguages: Language[] = [];
  const languageNames = new Set<string>();
  /*
        Exclude duplicate languages and the unnecessary data entries
        ie. languages named '#japan' or '10 additional languages' and
            languages names that are urls.
    */
  for (const l of languages) {
    if (!languageNames.has(l.name) && isValidName(l.name)) {
      filteredLanguages.push(l);
    }
    languageNames.add(l.name);
  }

  filteredLanguages.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(filteredLanguages);
});
