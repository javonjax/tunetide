import { Language } from '@/lib/api/schemas';
import { handleAPIFetch } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export const useFetchLanguages = () => {
  const fetchLanguages = async (): Promise<{ languages: Language[]; longestLabel: string }> => {
    const url: string = `/api/languages`;
    const res: globalThis.Response = await handleAPIFetch(await fetch(url));
    const languages: Language[] = await res.json();
    const longestLabel: string = languages.reduce((a, b) =>
      a.name.length > b.name.length ? a : b
    ).name;
    return { languages, longestLabel };
  };

  return useQuery<{ languages: Language[]; longestLabel: string }>({
    queryKey: ['fetchLanguages'],
    queryFn: fetchLanguages,
    staleTime: 1000 * 60 * 60,
  });
};
