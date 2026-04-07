'use client';
import Header from '../components/HomePage/Header';
import { capitalize, handleAPIError, warningToast } from '@/lib/utils';
import { useContext, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import { StationContext, StationContextType } from '@/components/ContextProviders/StationContext';

import LoadingSpinner from '@/components/ui/Custom/LoadingSpinner';
import CarouselCard from '@/components/HomePage/CarouselCard';
import Link from 'next/link';
import { useFetchTrendingStations } from '@/lib/hooks/useFetchTrendingStations';
import { useFetchMostPopularTags } from '@/lib/hooks/useFetchMostPopularTags';
import { useFetchRecentlyClicked } from '@/lib/hooks/useFetchRecentlyClicked';
import { useFetchDiscoverStations } from '@/lib/hooks/useFetchDiscoverStations';
import {
  LocationContextType,
  LocationContext,
} from '@/components/ContextProviders/LocationContext';
import { Navigation } from 'lucide-react';
import { useFetchLocalStations } from '@/lib/hooks/useFetchLocalStations';

const HomePage = (): React.JSX.Element => {
  const thisComponent: string = HomePage.name;
  const locationContext = useContext<LocationContextType | undefined>(LocationContext);
  const stationContext = useContext<StationContextType | undefined>(StationContext);

  const {
    isLoading: trendingStationsLoading,
    error: trendingStationsFetchError,
    isError: isTrendingStationsFetchError,
    data: trendingStations,
  } = useFetchTrendingStations();

  const {
    isLoading: tagsLoading,
    error: tagsFetchError,
    isError: isTagsFetchError,
    data: tags,
  } = useFetchMostPopularTags();

  const {
    isLoading: recentlyClickedStationsLoading,
    error: recentlyClickedStationsFetchError,
    isError: isRecentlyClickedStationsFetchError,
    data: recentlyClickedStations,
  } = useFetchRecentlyClicked();

  const {
    isLoading: discoverStationsLoading,
    error: discoverStationsFetchError,
    isError: isDiscoverStationsFetchError,
    data: discoverStations,
  } = useFetchDiscoverStations();

  const {
    isLoading: localStationsLoading,
    error: localStationsFetchError,
    isError: isLocalStationsFetchError,
    data: localStations,
  } = useFetchLocalStations(locationContext?.location);

  useEffect(() => {
    if (isTrendingStationsFetchError) {
      if (trendingStationsFetchError instanceof Error) {
        handleAPIError(trendingStationsFetchError);
      } else {
        console.warn(`Unknown error in ${thisComponent}.`);
      }
    }
  }, [isTrendingStationsFetchError]);

  useEffect(() => {
    if (isTagsFetchError) {
      if (tagsFetchError instanceof Error) {
        handleAPIError(tagsFetchError);
      } else {
        console.warn(`Unknown error in ${thisComponent}.`);
      }
    }
  }, [isTagsFetchError]);

  useEffect(() => {
    if (isTagsFetchError) {
      if (tagsFetchError instanceof Error) {
        handleAPIError(tagsFetchError);
      } else {
        console.warn(`Unknown error in ${thisComponent}.`);
      }
    }
  }, [isTagsFetchError]);

  useEffect(() => {
    if (isRecentlyClickedStationsFetchError) {
      if (recentlyClickedStationsFetchError instanceof Error) {
        handleAPIError(recentlyClickedStationsFetchError);
      } else {
        console.warn(`Unknown error in ${thisComponent}.`);
      }
    }
  }, [isRecentlyClickedStationsFetchError]);

  useEffect(() => {
    if (isLocalStationsFetchError) {
      if (localStationsFetchError instanceof Error) {
        handleAPIError(localStationsFetchError);
      } else {
        console.warn(`Unknown error in ${thisComponent}.`);
      }
    }
  }, [isLocalStationsFetchError]);

  return (
    <div className="grid h-full w-full grid-cols-12 gap-4">
      <Header />

      <div className="col-span-full flex min-h-[500px] flex-col items-center">
        <h2 className="text-heading mr-auto text-xl">Trending Stations</h2>
        {trendingStationsLoading && <LoadingSpinner />}
        {isTrendingStationsFetchError && trendingStationsFetchError && (
          <div className="flex h-full w-full items-center justify-center">
            {trendingStationsFetchError.message}
          </div>
        )}
        {!isTrendingStationsFetchError && trendingStations && (
          <div className="flex w-[82%] items-center justify-center md:w-[90%] xl:w-[95%]">
            <Carousel
              opts={{
                align: 'start',
              }}
              className="w-full p-4"
            >
              <CarouselContent>
                {trendingStations.length > 0 &&
                  trendingStations?.map((station) => (
                    <CarouselItem
                      key={station.stationuuid}
                      className="-mt-2 pb-2 md:basis-1/2 lg:basis-1/3"
                    >
                      <CarouselCard station={station} stationContext={stationContext} />
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </div>

      <div className="col-span-full flex min-h-[500px] flex-col items-center gap-y-4 lg:col-span-6">
        <h2 className="text-heading mr-auto text-xl">Popular Categories</h2>
        {tagsLoading && <LoadingSpinner />}
        {isTagsFetchError && tagsFetchError && (
          <div className="flex h-full w-full items-center justify-center">
            {tagsFetchError.message}
          </div>
        )}
        {tags && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-y-4">
            <div className="grid h-full w-full grid-cols-2 gap-4 md:grid-cols-3">
              {tags.length > 0 &&
                tags?.map((tag) => (
                  <Link
                    rel="noopener noreferrer"
                    key={tag.name}
                    className="hover:text-accent cursor-pointer rounded-md border-2 p-4"
                    href={`/stations?tag=${tag.name}&order=clickcount&page=1`}
                  >
                    <h3>{capitalize(tag?.name || '')}</h3>
                    <h4>{tag.stationcount} Live Stations</h4>
                  </Link>
                ))}
            </div>
            <Link
              rel="noopener noreferrer"
              className="rounded-md bg-linear-(--accent-gradient) p-4"
              href="/stations?order=clickcount"
            >
              Browse All
            </Link>
          </div>
        )}
      </div>

      <div className="col-span-full flex min-h-[500px] flex-col items-center lg:col-span-6">
        <h2 className="text-heading mr-auto text-xl">Recently Clicked Stations</h2>
        {recentlyClickedStationsLoading && <LoadingSpinner />}
        {isRecentlyClickedStationsFetchError && recentlyClickedStationsFetchError && (
          <div className="flex h-full w-full items-center justify-center">
            {recentlyClickedStationsFetchError.message}
          </div>
        )}
        {!isRecentlyClickedStationsFetchError && recentlyClickedStations && (
          <div className="flex w-[82%] items-center justify-center md:w-[90%] lg:w-[82%]">
            <Carousel
              opts={{
                align: 'start',
              }}
              className="w-full p-4"
            >
              <CarouselContent>
                {recentlyClickedStations.length > 0 &&
                  recentlyClickedStations?.map((station) => (
                    <CarouselItem
                      key={station.stationuuid}
                      className="-mt-2 md:basis-1/2 lg:basis-1/1"
                    >
                      <CarouselCard station={station} stationContext={stationContext} />
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </div>

      <div className="col-span-full flex min-h-[500px] flex-col items-center">
        <h2 className="text-heading mr-auto text-xl">Discover Something New</h2>
        {discoverStationsLoading && <LoadingSpinner />}
        {isDiscoverStationsFetchError && discoverStationsFetchError && (
          <div className="flex h-full w-full items-center justify-center">
            {discoverStationsFetchError.message}
          </div>
        )}
        {!isDiscoverStationsFetchError && discoverStations && (
          <div className="flex w-[82%] items-center justify-center md:w-[90%] xl:w-[95%]">
            <Carousel
              opts={{
                align: 'start',
              }}
              className="w-full p-4"
            >
              <CarouselContent>
                {discoverStations.length > 0 &&
                  discoverStations?.map((station) => (
                    <CarouselItem
                      key={station.stationuuid}
                      className="-mt-2 pb-2 md:basis-1/2 lg:basis-1/3"
                    >
                      <CarouselCard station={station} stationContext={stationContext} />
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
      </div>

      <div className="col-span-full flex min-h-[500px] flex-col items-center">
        <h2 className="text-heading mr-auto text-xl">Stations Hosted Near You</h2>
        {locationContext?.location && localStationsLoading && <LoadingSpinner />}
        {locationContext?.location &&
          !localStationsLoading &&
          (localStations === undefined || (localStations && !localStations.length)) && (
            <div>No stations found</div>
          )}
        {locationContext?.location &&
          localStations &&
          localStations.length > 0 &&
          !localStationsLoading && (
            <div className="flex w-[82%] items-center justify-center md:w-[90%] xl:w-[95%]">
              <Carousel
                opts={{
                  align: 'start',
                }}
                className="w-full p-4"
              >
                <CarouselContent>
                  {localStations.length > 0 &&
                    localStations?.map((station) => (
                      <CarouselItem
                        key={station.stationuuid}
                        className="-mt-2 pb-2 md:basis-1/2 lg:basis-1/3"
                      >
                        <CarouselCard station={station} stationContext={stationContext} />
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}
        {!locationContext?.location && (
          <div className="flex h-full w-full items-center justify-center">
            <button
              className="flex cursor-pointer items-center rounded-md bg-linear-(--accent-gradient) p-4"
              onClick={async () => {
                try {
                  if (!locationContext?.location) {
                    await locationContext?.requestLocation();
                  }
                } catch (error) {
                  console.warn(error);
                  warningToast(
                    'Location services required.',
                    'Please enable location services in your browser to use this feature.'
                  );
                }
              }}
            >
              {' '}
              Search near me
              <Navigation className="mt-1 ml-2" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
