import { useQuery } from '@tanstack/react-query';
import { RadioStation } from '../api/schemas';
import { handleAPIFetch } from '../utils';

export const useFetchDiscoverStations = () => {
  const fetchDiscoverStations = async (): Promise<RadioStation[]> => {
    const randomOffset: string = String(Math.floor(Math.random() * 1000));
    const queryParams: string = `limit=12&hidebroken=true&order=clickcount&offset=${randomOffset}`;
    const url: string = `/api/stations/search?${queryParams}`;
    const res: globalThis.Response = await handleAPIFetch(await fetch(url));
    const discoverStations: RadioStation[] = await res.json();
    return discoverStations;
  };

  return useQuery<RadioStation[]>({
    queryKey: ['fetchDiscoverStations'],
    queryFn: fetchDiscoverStations,
    retry: false,
  });
};
