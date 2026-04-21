import { useQuery } from '@tanstack/react-query';
import { RadioStation } from '../api/schemas';
import { handleAPIFetch } from '../utils';

export const useFetchTrendingStations = () => {
  const fetchTrendingStations = async (): Promise<RadioStation[]> => {
    const url: string = '/api/stations/search?order=clicktrend&limit=12&reverse=true';
    const res: globalThis.Response = await handleAPIFetch(await fetch(url));
    const trendingStations: RadioStation[] = await res.json();
    return trendingStations;
  };

  return useQuery<RadioStation[]>({
    queryKey: ['fetchTrendingStations'],
    queryFn: fetchTrendingStations,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
