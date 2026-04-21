import { redisClient } from './redisClient';

export const cacheFetch = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 3600
): Promise<T> => {
  try {
    const cached = await redisClient.get<T>(key);
    console.log(key);
    if (cached) {
      console.log('returning cached info');
      return cached;
    }
  } catch (error) {
    console.warn('Redis cache unavailable.', error);
  }

  console.log('fetching info');
  const res: Awaited<T> = await fetchFn();

  try {
    await redisClient.set(key, JSON.stringify(res), { ex: ttl });
  } catch (error) {
    console.error(`Failed to update Redis cache [SET: ${key}]`, error);
  }

  return res;
};

export const cacheRefreshToken = async (
  key: string,
  userId: number,
  ttl: number
): Promise<void> => {
  try {
    await redisClient.set(key, userId, { ex: ttl });
    return;
  } catch (error) {
    console.error(`Redis error [SET ${key}]:`, error);
    throw error;
  }
};

export const isTokenCached = async (key: string): Promise<boolean> => {
  try {
    const res: string | null = await redisClient.get(key);
    if (!res) {
      throw new Error('Token was not found under this key.');
    }
    return true;
  } catch (error) {
    console.error(`Redis error [GET refresh token].`, error);
    return false;
  }
};
