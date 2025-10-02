'use client';
import { Favorite, NewFavorite, RadioStation } from '@/lib/api/schemas';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { APIError, handleAPIError, handleAPIFetch, successToast } from '@/lib/utils';
import { StationSortingOption } from '@/lib/schemas';

export interface FavoritesContextType {
  getFavorites: (
    page: number | undefined,
    name: string | undefined,
    tag: string | undefined,
    country: string | undefined,
    language: string | undefined,
    order: StationSortingOption | undefined
  ) => Promise<{ favorites: RadioStation[]; hasMore: boolean }>;
  addFavorite: (station: RadioStation) => Promise<void>;
  deleteFavorite: (station: RadioStation) => Promise<void>;
  favoritedIds: string[] | undefined;
  favoritedStations: RadioStation[] | undefined;
  updateFavoritesContext: () => Promise<void>;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const authContext = useContext<AuthContextType | undefined>(AuthContext);
  const [favoritedIds, setFavoritedIds] = useState<string[]>();
  const [favoritedStations, setFavoritedStations] = useState<RadioStation[]>();

  useEffect(() => {
    updateFavoritesContext();
  }, [authContext?.isAuth]);

  const updateFavoritesContext = async () => {
    try {
      const userId: number | undefined = authContext?.userId;
      if (!userId) {
        setFavoritedIds(undefined);
        setFavoritedStations(undefined);
        return;
      }
      const res: globalThis.Response = await handleAPIFetch(
        await fetch(`/api/favorites/${userId}`)
      );

      const { favorites }: { favorites: Favorite[] } = await res.json();

      if (!favorites.length) {
        setFavoritedIds(undefined);
        setFavoritedStations(undefined);
        return;
      }

      const favIds: string[] = favorites.map((fav) => fav.station_id);
      const favStations: RadioStation[] = favorites.map((fav) => fav.station);
      setFavoritedIds(favIds);
      setFavoritedStations(favStations);

      return;
    } catch (error) {
      if (error instanceof APIError) {
        handleAPIError(error);
      } else {
        console.warn(`Unknown error in favorites context.`);
      }
      return;
    }
  };

  const getFavorites = async (
    page: number | undefined,
    name: string | undefined,
    tag: string | undefined,
    country: string | undefined,
    language: string | undefined,
    order: StationSortingOption | undefined
  ): Promise<{ favorites: RadioStation[]; hasMore: boolean }> => {
    try {
      const userId: number | undefined = authContext?.userId;
      if (!userId) {
        return { favorites: [], hasMore: false };
      }

      let url: string = `/api/favorites/${userId}?`;
      const searchParams: URLSearchParams = new URLSearchParams();
      if (page && page > 0) {
        searchParams.set('page', String(page));
      }

      if (name && name.length > 0) {
        searchParams.set('name', name.toLowerCase());
      }

      if (tag && tag.length > 0) {
        searchParams.set('tag', tag.toLowerCase());
      }

      if (country && country.length > 0) {
        searchParams.set('country', country.toLowerCase());
      }

      if (language && language.length > 0) {
        searchParams.set('language', language.toLowerCase());
      }

      if (order && order.length > 0) {
        searchParams.set('order', order.toLowerCase());
      }

      url += searchParams.toString();

      const res: globalThis.Response = await handleAPIFetch(await fetch(url));

      const { favorites, hasMore }: { favorites: Favorite[]; hasMore: boolean } = await res.json();
      const favStations: RadioStation[] = favorites.map((fav) => fav.station);

      return { favorites: favStations, hasMore: hasMore };
    } catch (error) {
      if (error instanceof APIError) {
        handleAPIError(error);
      } else {
        console.warn(`Unknown error in favorites context.`);
      }
      return { favorites: [], hasMore: false };
    }
  };

  const addFavorite = async (station: RadioStation): Promise<void> => {
    try {
      const newFavorite: NewFavorite = {
        userId: authContext?.userId,
        stationId: station.stationuuid,
        station: station,
      };

      let res: globalThis.Response = await handleAPIFetch(
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(newFavorite),
        })
      );

      setFavoritedIds((prev) =>
        prev ? [...prev, String(station.stationuuid)] : [String(station.stationuuid)]
      );
      setFavoritedStations((prev) => (prev ? [...prev, station] : [station]));
      const data: { message: string } = await res.json();

      /*
        Note that the radio browser votes API may not reflect updates to the vote count instantly.
      */
      res = await handleAPIFetch(
        await fetch(`/api/modify/votes?uuid=${station.stationuuid}`, {
          method: 'POST',
          credentials: 'include',
        })
      );

      successToast(
        data.message,
        <span>
          You can view your favorites{' '}
          <a href="/favorites" className="underline">
            here
          </a>
          .
        </span>
      );
      return;
    } catch (error) {
      if (error instanceof APIError) {
        handleAPIError(error);
      } else {
        console.warn(`Unknown error in favorites context.`);
      }
      return;
    }
  };

  const deleteFavorite = async (station: RadioStation): Promise<void> => {
    try {
      const payload = {
        userId: authContext?.userId,
        station: station,
      };

      const res: globalThis.Response = await handleAPIFetch(
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
      );

      setFavoritedIds((prev) => prev?.filter((id) => id !== station.stationuuid));
      setFavoritedStations((prev) =>
        prev?.filter((item) => item.stationuuid !== station.stationuuid)
      );
      const data: { message: string } = await res.json();
      successToast(
        data.message,
        <span>
          Check out your updated{' '}
          <a href="/favorites" className="underline">
            favorites list
          </a>
          .
        </span>
      );
      return;
    } catch (error) {
      if (error instanceof APIError) {
        handleAPIError(error);
      } else {
        console.warn(`Unknown error in favorites context.`);
      }
      return;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        getFavorites,
        addFavorite,
        deleteFavorite,
        favoritedIds,
        favoritedStations,
        updateFavoritesContext,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
