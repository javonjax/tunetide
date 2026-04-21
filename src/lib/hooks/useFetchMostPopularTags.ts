import { useQuery } from '@tanstack/react-query';
import { Tag } from '../api/schemas';
import { handleAPIFetch } from '../utils';

export const useFetchMostPopularTags = () => {
  const fetchMostPopularTags = async (): Promise<Tag[]> => {
    const url: string = '/api/tags?order=stationcount&reverse=true&hidebroken=true&limit=12';
    const res: globalThis.Response = await handleAPIFetch(await fetch(url));
    const tags: Tag[] = await res.json();
    return tags;
  };

  return useQuery<Tag[]>({
    queryKey: ['fetchMostPopularTags'],
    queryFn: fetchMostPopularTags,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
