'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { StationContext, StationContextType } from '../../ContextProviders/StationContext';
import { RadioStation } from '@/lib/api/schemas';
import PlayerControls from './PlayerControls';
import Hls from 'hls.js';
import {
  FavoritesContext,
  FavoritesContextType,
} from '@/components/ContextProviders/FavoritesContext';
import { AuthContext, AuthContextType } from '@/components/ContextProviders/AuthContext';

const Player = () => {
  const authContext = useContext<AuthContextType | undefined>(AuthContext);
  const stationContext = useContext<StationContextType | undefined>(StationContext);
  const favoritesContext = useContext<FavoritesContextType | undefined>(FavoritesContext);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [playerType, setPlayerType] = useState<'default' | 'hls'>('default');
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const station: RadioStation | undefined = stationContext?.station;

  // Adjust the volume to match previously set level when the radio station changes.
  useEffect(() => {
    if (stationContext) {
      if (audioRef.current) {
        audioRef.current.volume = stationContext.volume / 100;
      }
      if (videoRef.current) {
        videoRef.current.volume = stationContext.volume / 100;
      }
      setIsError(false);
    }
  }, [stationContext]);

  useEffect(() => {
    let hls: Hls | null = null;
    if (
      playerType === 'hls' &&
      stationContext &&
      stationContext.station?.url_resolved &&
      videoRef.current
    ) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(stationContext?.station?.url_resolved);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.warn(data.type);
          setIsLoading(false);
          setIsError(true);
          hls?.destroy();
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = stationContext?.station?.url_resolved;
      } else {
        setIsLoading(false);
        setIsError(true);
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [playerType]);

  useEffect(() => {
    setPlayerType('default');
  }, [stationContext?.station]);

  const handlePlay = (): void => {
    if (playerType === 'default') {
      if (audioRef.current) {
        audioRef.current.play();
      }
    } else {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }

    if (stationContext) {
      /*  
        Do not update the click count from the player.
       */
      stationContext.play();
    }
  };

  const handlePause = (): void => {
    if (playerType === 'default') {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }

    if (stationContext) {
      stationContext.pause();
    }
  };

  if (!stationContext?.station) {
    return null;
  }

  return (
    <>
      <PlayerControls
        isOpen={isOpen}
        isLoading={isLoading}
        isError={isError}
        isMobileDevice={authContext?.isMobileDevice ?? false}
        setIsOpen={setIsOpen}
        stationContext={stationContext}
        favoritesContext={favoritesContext}
        handlePlay={handlePlay}
        handlePause={handlePause}
      />

      {station?.url_resolved ? (
        <>
          <audio
            className="hidden"
            autoPlay
            ref={audioRef}
            controls={false}
            src={station.url_resolved}
            onLoadStart={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onError={() => {
              setPlayerType('hls');
              setIsLoading(false);
              console.warn(
                'Stream cannot be played in HTML audio element. Attempting to use fallback player.'
              );
            }}
          ></audio>
        </>
      ) : null}

      {playerType === 'hls' && station?.url_resolved ? (
        <video
          className="hidden"
          autoPlay
          ref={videoRef}
          controls={false}
          onLoadStart={() => {
            setIsLoading(true);
          }}
          onCanPlay={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
            setIsError(true);
          }}
        />
      ) : null}
    </>
  );
};

export default Player;
