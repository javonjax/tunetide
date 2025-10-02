import Favicon from '@/components/StationBrowser/Favicon';
import Image from 'next/image';
import { RadioStation } from '@/lib/api/schemas';
import { capitalize } from '@/lib/utils';
import { Heart, Play } from 'iconoir-react';
import {
  SquareArrowOutUpRight,
  Flame,
  MapPinned,
  Languages,
  MousePointerClick,
  TagIcon,
  Info,
} from 'lucide-react';
import { StationContextType } from '@/components/ContextProviders/StationContext';
import Link from 'next/link';
import { useContext } from 'react';
import { FavoritesContext, FavoritesContextType } from '../ContextProviders/FavoritesContext';

export interface HomePageCarouselCardProps {
  station: RadioStation;
  stationContext?: StationContextType | undefined;
  variant?: 'horizontal' | 'vertical';
}

const CarouselCard = ({
  station,
  stationContext,
  variant = 'horizontal',
}: HomePageCarouselCardProps) => {
  const favoritesContext = useContext<FavoritesContextType | undefined>(FavoritesContext);
  return (
    <div className={`m-2 h-[450px] rounded-md border-2 ${variant === 'vertical' ? 'w-full' : ''}`}>
      <div className="flex h-full w-full flex-col justify-between gap-y-4 p-6">
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div id="station-name" className="flex w-full items-center">
            {/*
                Render the favicon as link if both a homepage link and a favicon are available.
                If there is a homepage link but no favicon, render the SquareArrowOutUpRight icon.
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
                station.homepage !== null && station.homepage.length > 0 ? (
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent"
                    href={`${station.homepage !== null && station.homepage.length ? station.homepage : ''}`}
                  >
                    {station.name}
                  </Link>
                ) : (
                  <p>{station.name}</p>
                )
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
          <div className="flex flex-col gap-4">
            {station.country && (
              <div className="flex gap-x-2">
                <MapPinned size={20} className="min-h-[20px] min-w-[20px]" />
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
                <Languages height={20} width={20} className="min-h-[20px] w-[20px] min-w-[20px]" />
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
                <MousePointerClick className="h-[20px] min-h-[20px] w-[20px] min-w-[20px]" />
                <p>Clicks: {station.clickcount}</p>
              </div>
            )}{' '}
            {station.votes !== null && station.votes > 0 && (
              <div className="flex items-center gap-x-2">
                <Heart className="h-[20px] min-h-[20px] w-[20px] min-w-[20px]" />
                <p>Favorites: {station.votes}</p>
              </div>
            )}
            {station.tags && station.tags.length > 0 && (
              <div className="flex gap-x-2">
                <TagIcon size={20} />
                <div>Tags:</div>
                <ul
                  id="station-tags"
                  className="flex w-full flex-wrap gap-x-2 text-wrap break-words"
                >
                  {station.tags?.split(',').map((tag) => (
                    <li key={tag} className="hover:text-accent text-wrap break-words">
                      <Link
                        className="underline"
                        href={`/stations?tag=${encodeURIComponent(tag)}&order=clickcount&page=1`}
                      >
                        {capitalize(tag)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center gap-4">
          <button
            className="cursor-pointer rounded-xl bg-linear-(--accent-gradient) p-4"
            onClick={() => {
              stationContext?.setStation(station);
              stationContext?.playAndUpdateClickCount(station);
            }}
          >
            <Play className="h-[24px] min-h-[24px] w-[24px] min-w-[24px]" />
          </button>
          <button
            className="cursor-pointer rounded-xl bg-linear-(--accent-gradient) p-4"
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
              className="h-[24px] min-h-[24px] w-[24px] min-w-[24px]"
            />
          </button>
          <Link
            className="cursor-pointer rounded-xl bg-linear-(--accent-gradient) p-4"
            href={`/stations/${station.stationuuid}`}
          >
            <Info className="h-[24px] min-h-[24px] w-[24px] min-w-[24px]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;
