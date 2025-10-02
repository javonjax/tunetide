import { RadioStation } from '@/lib/api/schemas';
import { capitalize } from '@/lib/utils';
import {
  Flame,
  Heart,
  Info,
  Languages,
  MapPinned,
  MousePointerClick,
  Play,
  SquareArrowOutUpRight,
  Tag,
} from 'lucide-react';
import Image from 'next/image';
import Favicon from './Favicon';
import { StationContextType } from '../ContextProviders/StationContext';
import Link from 'next/link';
import { FavoritesContextType } from '../ContextProviders/FavoritesContext';

export interface StationListItemProps {
  station: RadioStation;
  stationContext?: StationContextType | undefined;
  favoritesContext?: FavoritesContextType | undefined;
}

const StationListItem = ({ station, stationContext, favoritesContext }: StationListItemProps) => {
  return (
    <li
      key={station.stationuuid}
      className="xl:odd:bg-list-alt flex w-full flex-col items-center rounded-xl border-2 md:w-[45%] xl:w-full xl:border-0"
    >
      <div className="flex h-[450px] w-full flex-col items-center justify-between gap-4 p-6 xl:h-full xl:max-h-[350px] xl:min-h-[150px] xl:flex-row xl:justify-start xl:gap-0 xl:p-4">
        <div className="mb-2 flex h-full w-full flex-col items-center overflow-y-auto xl:w-[80%] xl:flex-row">
          <div className="mb-2 flex w-full flex-col xl:mb-0 xl:w-[37.5%]">
            <div id="station-name" className="flex w-full items-center xl:p-2">
              {/*
                Render a the favicon as link if both a homepage link and a favicon are available.
                If there is a homepage link but no favicon, render an svg icon.
                If there is a favicon but no homepage, render the favicon.
              */}
              {station.homepage !== null && station.homepage.length > 0 ? (
                station.favicon !== null &&
                station.favicon !== 'null' &&
                station.favicon.length > 0 ? (
                  <Favicon
                    alt={`${station.name} icon`}
                    src={station.favicon.trim()}
                    height={40}
                    width={40}
                    key={`${station.name} icon`}
                    href={`${station.homepage !== null && station.homepage.length > 0 ? station.homepage : ''}`}
                  />
                ) : (
                  <Link
                    href={`${station.homepage !== null && station.homepage.length > 0 ? station.homepage : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SquareArrowOutUpRight className="mr-4" width={40} height={40} />
                  </Link>
                )
              ) : station.favicon !== null &&
                station.favicon !== 'null' &&
                station.favicon.length > 0 ? (
                <Image
                  src={station.favicon.trim()}
                  className="mr-4 min-w-[40px]"
                  width={40}
                  height={40}
                  alt={`${station.name} icon`}
                />
              ) : null}

              <div className="flex flex-col items-start">
                {station.name && station?.name?.length > 0 ? (
                  <Link className="hover:text-accent" href={`/stations/${station.stationuuid}`}>
                    {station.name}
                  </Link>
                ) : (
                  <p>Unknown Station</p>
                )}

                {station.clicktrend !== null && station.clicktrend > 10 && (
                  <div className="flex items-center">
                    <Flame
                      height={20}
                      width={20}
                      className="text-accent mb-[2px] -ml-[2px] h-[16px] min-h-[18px] w-[16px] min-w-[16px]"
                    />
                    <span className="text-accent">Trending</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            id="station-info"
            className="mb-4 flex w-full flex-col text-wrap xl:mb-0 xl:h-[300px] xl:min-h-0 xl:w-[37.5%] xl:gap-y-2 xl:overflow-y-auto xl:p-2"
          >
            <div className="my-auto flex flex-col gap-y-4">
              {station.country && (
                <div className="flex gap-x-2">
                  <MapPinned size={20} className="min-h-[20px] w-[20px] min-w-[20px]" />
                  <div>Country:</div>
                  <Link
                    className="hover:text-accent"
                    href={`/stations?country=${station.country}&order=clickcount&page=1`}
                  >
                    {station.country}
                  </Link>
                </div>
              )}
              {station.language && (
                <div className="flex w-full gap-x-2">
                  <Languages
                    height={20}
                    width={20}
                    className="min-h-[20px] w-[20px] min-w-[20px]"
                  />
                  <div>Language: </div>
                  <ul className="flex flex-wrap gap-x-2">
                    {station.language.split(',').map((lang) => (
                      <li key={`${station.name}-${lang}`}>
                        <Link
                          className="hover:text-accent"
                          href={`/stations?language=${lang}&order=clickcount&page=1`}
                        >
                          {capitalize(lang)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {station.clickcount !== null && station.clickcount > 0 && (
                <div className="flex items-center gap-x-2">
                  <MousePointerClick size={20} className="min-h-[20px] w-[20px] min-w-[20px]" />
                  <p>Clicks: {station.clickcount}</p>
                </div>
              )}
              {station.votes !== null && station.votes > 0 && (
                <div className="flex items-center gap-x-2">
                  <Heart size={20} className="min-h-[20px] w-[20px] min-w-[20px]" />
                  <p>Favorites: {station.votes}</p>
                </div>
              )}
            </div>
          </div>

          <div
            id="station-tags"
            className="flex w-full items-center gap-x-2 xl:h-full xl:w-[25%] xl:p-2"
          >
            {station.tags && station.tags.length > 0 && (
              <>
                <div className="flex w-full gap-x-2">
                  <Tag size={20} className="min-h-[20px] w-[20px] min-w-[20px] xl:hidden" />
                  <div className="xl:hidden">Tags:</div>
                  <ul className="flex h-full w-full flex-wrap gap-x-2 text-wrap break-words xl:max-h-[300px] xl:flex-col xl:flex-nowrap xl:gap-0 xl:overflow-y-auto">
                    {station.tags?.split(',').map((tag) => (
                      <li
                        key={tag}
                        className="hover:text-accent w-fit max-w-full cursor-pointer text-wrap break-words"
                      >
                        <Link
                          className="h-full w-full underline"
                          href={`/stations?tag=${encodeURIComponent(tag)}&order=clickcount`}
                        >
                          {capitalize(tag)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        <div
          id="station-interaction-buttons"
          className="flex w-full flex-wrap items-center justify-center gap-4 xl:w-[20%] xl:p-2"
        >
          <button
            className="cursor-pointer rounded-xl bg-linear-(--accent-gradient) p-4"
            onClick={() => {
              stationContext?.setStation(station);
              stationContext?.playAndUpdateClickCount(station);
            }}
          >
            <Play />
          </button>
          <button
            className={`cursor-pointer rounded-xl bg-linear-(--accent-gradient) p-4`}
            onClick={() => {
              if (
                station.stationuuid &&
                favoritesContext?.favoritedIds?.includes(station.stationuuid)
              ) {
                favoritesContext?.deleteFavorite(station);
                return;
              }
              favoritesContext?.addFavorite(station);
              return;
            }}
          >
            <Heart
              fill={`${station.stationuuid && favoritesContext?.favoritedIds?.includes(station.stationuuid) ? '#ed4956' : 'transparent'}`}
              color={`${station.stationuuid && favoritesContext?.favoritedIds?.includes(station.stationuuid) ? '#ed4956' : 'var(--foreground)'}`}
            />
          </button>
          <Link
            className="cursor-pointer rounded-xl bg-linear-(--accent-gradient) p-4"
            href={`/stations/${station.stationuuid}`}
          >
            <Info />
          </Link>
        </div>
      </div>
    </li>
  );
};

export default StationListItem;
