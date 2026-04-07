import { useQuery } from '@tanstack/react-query';
import { RadioStation } from '../api/schemas';
import { handleAPIFetch } from '../utils';

export const useFetchRecentlyClicked = () => {
  const fetchRecentlyClickedStations = async (): Promise<RadioStation[]> => {
    const url: string = '/api/stations/recent/clicked?limit=12';
    const res: globalThis.Response = await handleAPIFetch(await fetch(url));
    const recentlyClickedStations: RadioStation[] = await res.json();
    return recentlyClickedStations;
  };

  return useQuery<RadioStation[]>({
    queryKey: ['fetchRecentlyClickedStations'],
    queryFn: fetchRecentlyClickedStations,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
