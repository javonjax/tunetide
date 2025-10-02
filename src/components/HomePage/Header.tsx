import { RadioStation } from '@/lib/api/schemas';
import { useContext } from 'react';
import { StationContext, StationContextType } from '../ContextProviders/StationContext';
import Link from 'next/link';

const Header = () => {
  const stationContext = useContext<StationContextType | undefined>(StationContext);

  // Sorting by order=random does not appear to work properly, so we improvise.
  const fetchRandomStation = async () => {
    stationContext?.pause();
    const reverse: boolean = Math.random() > 0.5;
    const randomOffset: string = String(Math.floor(Math.random() * 100));
    const queryParams: string = `hidebroken=true&limit=100&offset=${randomOffset}&order=clickcount&reverse=${reverse}`;
    const url: string = `/api/stations/search?${queryParams}`;
    const res: globalThis.Response = await fetch(url, { cache: 'no-store' });
    const stations: RadioStation[] = await res.json();
    const randomStation: RadioStation = stations[Math.floor(Math.random() * stations.length)];
    stationContext?.setStation(randomStation);
    stationContext?.playAndUpdateClickCount(randomStation);
  };

  return (
    <>
      <div className="col-span-full flex flex-col items-center justify-center">
        <h1 className="text-center text-3xl">Catch a wave. Find your sound.</h1>
        <h2 className="text-center">
          Browse radio stations from around the world, all in one place.
        </h2>
      </div>
      <div className="col-span-full flex items-center justify-center gap-6">
        <Link
          className="rounded-md bg-linear-(--accent-gradient) p-4"
          href="/stations?order=clickcount&page=1"
        >
          Browse Stations
        </Link>
        <button
          className="cursor-pointer rounded-md bg-linear-(--accent-gradient) p-[2px]"
          onClick={fetchRandomStation}
        >
          <div className="bg-background rounded-md px-6 py-3">
            <div className="bg-linear-(--accent-gradient) bg-clip-text text-transparent">
              I&apos;m Feeling Lucky
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default Header;
