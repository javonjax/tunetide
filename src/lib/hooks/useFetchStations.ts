import { ReadonlyURLSearchParams } from 'next/navigation';
import { setDropdownOptions } from '@/app/stations/utils';
import { RadioStation } from '@/lib/api/schemas';
import { handleAPIFetch } from '@/lib/utils';
import { Dispatch, SetStateAction } from 'react';
import { StationFilters, StationSearchInputs } from '../schemas';
import { useQuery } from '@tanstack/react-query';

export const useFetchStations = (
  searchParams: ReadonlyURLSearchParams,
  pageNum: number,
  setSearchInputs: Dispatch<SetStateAction<StationSearchInputs>>,
  setFilters: Dispatch<SetStateAction<StationFilters>>
) => {
  const searchParamString: string = searchParams.toString();
  const fetchStations = async (): Promise<{ stations: RadioStation[]; hasMore: boolean }> => {
    setDropdownOptions(searchParams, setSearchInputs, setFilters);
    const itemsPerPage: number = 10;
    const offset: number = (pageNum - 1) * itemsPerPage;
    let url: string = `/api/stations/search?limit=${itemsPerPage + 1}&offset=${offset}&hidebroken=true`;
    if (searchParamString.length) {
      url += `&${searchParamString}`;
    }
    /* 
          Numerical data from the radio-browser API is sorted in ascending order.
          Because of this all sorting, with the exception of name based alphabetical sorting, should be reversed.
          Add the param 'reverse=true' to retrieve numerical data in descending order. 
        */
    if (!searchParams.toString().includes('order=name')) {
      url += '&reverse=true';
    }
    const res: globalThis.Response = await handleAPIFetch(await fetch(url));
    const radioStations: RadioStation[] = await res.json();
    let hasMore: boolean = false;
    if (radioStations.length === itemsPerPage + 1) {
      hasMore = true;
    }

    return {
      stations: radioStations.length > 1 ? radioStations.slice(0, -1) : radioStations,
      hasMore: hasMore,
    };
  };

  return useQuery<{ stations: RadioStation[]; hasMore: boolean }>({
    queryKey: ['fetchStations', searchParamString],
    queryFn: fetchStations,
    staleTime: 1000 * 60 * 5,
  });
};
