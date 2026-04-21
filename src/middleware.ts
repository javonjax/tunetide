import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { refreshSessionTokens, verifyToken } from './lib/session';
import { TokenPayload } from './lib/schemas';
import { cacheRefreshToken, isTokenCached } from './lib/api/redisCache';

const ACCESS_TOKEN_KEY: string = 'access_token';
const REFRESH_TOKEN_KEY: string = 'refresh_token';
const ACCESS_TOKEN_EXPIRATION: number = 15 * 60;
const REFRESH_TOKEN_EXPIRATION: number = 7 * 24 * 60 * 60;

export const middleware = async (request: NextRequest) => {
  const accessToken: string | undefined = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const isAccessTokenVerified: TokenPayload | undefined = await verifyToken(accessToken);
  if (isAccessTokenVerified) {
    return NextResponse.next();
  }

  const refreshToken: string | undefined = request.cookies.get(REFRESH_TOKEN_KEY)?.value;
  const isRefreshTokenVerified: TokenPayload | undefined = await verifyToken(refreshToken);
  const userId: number | undefined = isRefreshTokenVerified?.userId;
  const jti: string | undefined = isRefreshTokenVerified?.jti;
  const isRefreshTokenWhitelisted: boolean = await isTokenCached(`${userId}:${jti}`);
  if (isRefreshTokenVerified && isRefreshTokenWhitelisted) {
    const newJti: string = crypto.randomUUID();
    const sessionTokens: { newAccessToken: string; newRefreshToken: string } | undefined =
      await refreshSessionTokens(refreshToken, newJti);
    if (sessionTokens) {
      try {
        const response = NextResponse.next({
          request: {
            headers: new Headers(request.headers),
          },
        });

        response.cookies.set(ACCESS_TOKEN_KEY, sessionTokens.newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: ACCESS_TOKEN_EXPIRATION,
          sameSite: 'lax',
          path: '/',
        });

        response.cookies.set(REFRESH_TOKEN_KEY, sessionTokens.newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: REFRESH_TOKEN_EXPIRATION,
          sameSite: 'lax',
          path: '/',
        });

        // Add the refresh token to the whitelist. Refresh tokens are revoked when the session is deleted.
        await cacheRefreshToken(`${userId}:${newJti}`, userId!, REFRESH_TOKEN_EXPIRATION);

        return response;
      } catch (error) {
        console.error('Error refreshing session tokens:', error);
        return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
      }
    }
  }

  return NextResponse.json({ error: 'User auth failed.' }, { status: 401 });
};

export const config = {
  matcher: '/api/favorites/:path*',
};
