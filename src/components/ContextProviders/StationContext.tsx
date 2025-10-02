'use client';
import { RadioStation } from '@/lib/api/schemas';
import { APIError, handleAPIError, handleAPIFetch } from '@/lib/utils';
import React, { useState, createContext } from 'react';

export interface StationContextType {
  station: RadioStation | undefined;
  setStation: React.Dispatch<React.SetStateAction<RadioStation | undefined>>;
  isPlaying: boolean;
  playAndUpdateClickCount: (station: RadioStation) => void;
  play: () => void;
  pause: () => void;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
}

export const StationContext = createContext<StationContextType | undefined>(undefined);

export const StationContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [station, setStation] = useState<RadioStation | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(25);

  const playAndUpdateClickCount = async (station: RadioStation): Promise<void> => {
    try {
      setIsPlaying(true);
      const res: globalThis.Response = await handleAPIFetch(
        await fetch(`/api/modify/clicks?uuid=${station.stationuuid}`, {
          method: 'POST',
          credentials: 'include',
        })
      );
      const test = await res.json();
      console.log(test);
    } catch (error) {
      if (error instanceof APIError) {
        handleAPIError(error);
      } else {
        console.warn(`Unknown error in favorites context.`);
      }
    }
  };

  const play = (): void => {
    setIsPlaying(true);
  };

  const pause = (): void => {
    setIsPlaying(false);
  };

  return (
    <StationContext.Provider
      value={{
        station,
        setStation,
        isPlaying,
        playAndUpdateClickCount,
        play,
        pause,
        volume,
        setVolume,
      }}
    >
      {children}
    </StationContext.Provider>
  );
};
