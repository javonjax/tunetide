import { RadioStation } from '@/lib/api/schemas';
import { handleAPIFetch } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export const useFetchStationInfo = (stationuuid: string) => {
  const fetchStation = async (): Promise<RadioStation> => {
    /*
        This API endpoint accepts a list of UUIDs as params and returns a list of stations.
        This page only displays information for a single station so only the first list item is relevant.
      */
    const url: string = `/api/stations/search/byuuid?uuids=${stationuuid}`;
    const res: globalThis.Response = await handleAPIFetch(await fetch(url));
    const stations: RadioStation[] = await res.json();
    return stations[0];
  };

  return useQuery<RadioStation>({
    queryKey: ['fetchStation', stationuuid],
    queryFn: fetchStation,
    retry: false,
    staleTime: 1000 * 60 * 60,
  });
};
