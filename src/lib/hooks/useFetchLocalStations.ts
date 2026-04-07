import { Coordinates } from '@/components/ContextProviders/LocationContext';
import { useQuery } from '@tanstack/react-query';
import { RadioStation } from '../api/schemas';
import { handleAPIFetch } from '../utils';

export const useFetchLocalStations = (location: Coordinates | undefined) => {
  const fetchLocalStations = async () => {
    if (!location?.latitude || !location?.longitude) {
      return [];
    }
    const latitude: string = location?.latitude.toString();
    const longitude: string = location?.longitude.toString();
    const searchParams: URLSearchParams = new URLSearchParams();
    searchParams.set('geo_lat', latitude);
    searchParams.set('geo_long', longitude);
    searchParams.set('limit', '10');
    searchParams.set('geo_distance', '75000');
    const url: string = `/api/stations/search?${searchParams.toString()}`;
    const res: globalThis.Response = await handleAPIFetch(await fetch(url));
    const localStations: RadioStation[] = await res.json();
    return localStations;
  };

  return useQuery<RadioStation[]>({
    queryKey: ['fetchLocalStations', location?.latitude, location?.longitude],
    queryFn: fetchLocalStations,
    enabled: !!location?.latitude && !!location?.longitude,
    staleTime: 1000 * 60 * 5,
  });
};
