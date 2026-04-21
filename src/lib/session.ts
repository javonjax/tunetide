import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { TokenPayload } from './schemas';
import { cookies } from 'next/headers';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { Session } from './api/schemas';
import { cacheRefreshToken } from './api/redisCache';
import { redisClient } from './api/redisClient';

const secretKey: string = process.env.SECRET_KEY as string;
const encodedKey = new TextEncoder().encode(secretKey);
const ACCESS_TOKEN_EXPIRATION: number = 15 * 60;
const REFRESH_TOKEN_EXPIRATION: number = 7 * 24 * 60 * 60;
const ACCESS_TOKEN_KEY: string = 'access_token';
const REFRESH_TOKEN_KEY: string = 'refresh_token';

export const signToken = async (payload: TokenPayload): Promise<string> => {
  const jwt = new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${payload.exp} seconds`);

  if (payload.jti) {
    jwt.setJti(payload.jti);
  } else {
    jwt.setJti(crypto.randomUUID());
  }

  return jwt.sign(encodedKey);
};

export const verifyToken = async (token: string | undefined): Promise<TokenPayload | undefined> => {
  try {
    if (!token) return undefined;
    // jwtVerify throws if the token is invalid, expired, or altered.
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ['HS256'] });
    return payload as TokenPayload;
  } catch (error) {
    console.warn('No active session found.', error);
    return undefined;
  }
};

export const createSession = async (userId: number): Promise<boolean> => {
  try {
    const cookieStore = await cookies();

    const accessToken: string = await signToken({
      userId: userId,
      exp: ACCESS_TOKEN_EXPIRATION,
    });

    const refreshTokenJti: string = crypto.randomUUID();
    const refreshToken: string = await signToken({
      userId: userId,
      exp: REFRESH_TOKEN_EXPIRATION,
      jti: refreshTokenJti,
    });

    cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: ACCESS_TOKEN_EXPIRATION,
      sameSite: 'lax',
      path: '/',
    });

    cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: REFRESH_TOKEN_EXPIRATION,
      sameSite: 'lax',
      path: '/',
    });

    // Add the refresh token to the whitelist. Refresh tokens are revoked when the session is deleted.
    await cacheRefreshToken(`${userId}:${refreshTokenJti}`, userId, REFRESH_TOKEN_EXPIRATION);

    return true;
  } catch (error) {
    if (cookieStore) {
      cookieStore.delete(ACCESS_TOKEN_KEY);
      cookieStore.delete(REFRESH_TOKEN_KEY);
    }

    console.warn('Failed to create login session.', error);
    return false;
  }
};

export const getAccessCookie = async (): Promise<RequestCookie | undefined> => {
  try {
    const cookieStore = await cookies();
    const cookie: RequestCookie | undefined = cookieStore.get(ACCESS_TOKEN_KEY);
    return cookie;
  } catch (error) {
    console.warn('Error getting session cookie.');
    throw error;
  }
};

export const getRefreshCookie = async (): Promise<RequestCookie | undefined> => {
  try {
    const cookieStore = await cookies();
    const cookie: RequestCookie | undefined = cookieStore.get(REFRESH_TOKEN_KEY);
    return cookie;
  } catch (error) {
    console.warn('Error getting refresh cookie.');
    throw error;
  }
};

export const getActiveSession = async (): Promise<Session> => {
  try {
    const cookie: RequestCookie | undefined = await getAccessCookie();
    const accessToken: string | undefined = cookie?.value;
    const payload: TokenPayload | undefined = await verifyToken(accessToken);
    if (!payload?.userId) {
      throw new Error('Active session not found.');
    }
    return { isAuth: true, userId: payload.userId };
  } catch (error) {
    console.warn(error);
    return { isAuth: false, userId: undefined };
  }
};

export const refreshSessionTokens = async (
  refreshToken: string | undefined,
  newJti: string
): Promise<{ newAccessToken: string; newRefreshToken: string } | undefined> => {
  try {
    const payload: TokenPayload | undefined = await verifyToken(refreshToken);
    if (!payload?.userId) {
      throw new Error('Active session not found.');
    }

    const newAccessToken: string = await signToken({
      userId: payload.userId,
      exp: ACCESS_TOKEN_EXPIRATION,
    });

    const newRefreshToken: string = await signToken({
      userId: payload.userId,
      exp: REFRESH_TOKEN_EXPIRATION,
      jti: newJti,
    });

    return { newAccessToken: newAccessToken, newRefreshToken: newRefreshToken };
  } catch (error) {
    console.warn(error);
    return undefined;
  }
};

export const deleteSession = async (): Promise<void> => {
  try {
    const refreshCookie: RequestCookie | undefined = await getRefreshCookie();
    const refreshToken: TokenPayload | undefined = await verifyToken(refreshCookie?.value);
    if (refreshToken) {
      await redisClient.del(`${refreshToken.userId}:${refreshToken.jti}`);
    }
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_KEY);
    cookieStore.delete(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('Error deleting session.', error);
  }
};
