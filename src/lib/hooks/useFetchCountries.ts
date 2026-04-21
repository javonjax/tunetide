import { Country } from '@/lib/api/schemas';
import { handleAPIFetch } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export const useFetchCountries = () => {
  const fetchCountries = async (): Promise<{ countries: Country[]; longestLabel: string }> => {
    const url: string = `/api/countries`;
    const res: globalThis.Response = await handleAPIFetch(await fetch(url));
    const countries: Country[] = await res.json();
    const longestLabel: string = countries.reduce((a, b) =>
      a.name.length > b.name.length ? a : b
    ).name;
    return { countries, longestLabel };
  };

  return useQuery<{ countries: Country[]; longestLabel: string }>({
    queryKey: ['fetchCountries'],
    queryFn: fetchCountries,
    staleTime: 1000 * 60 * 60,
  });
};
