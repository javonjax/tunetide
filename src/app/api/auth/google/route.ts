import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const GOOGLE_OAUTH_URI: string = process.env.GOOGLE_OAUTH_URI as string;
const GOOGLE_OAUTH_CLIENT_ID: string = process.env.GOOGLE_OAUTH_CLIENT_ID as string;
const GOOGLE_OAUTH_REDIRECT_URI: string = process.env.GOOGLE_OAUTH_REDIRECT_URI as string;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const reqSource: string = searchParams.get('source')!;
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  });
  console.log(params);
  const response = NextResponse.redirect(`${GOOGLE_OAUTH_URI}?${params.toString()}`);

  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });

  response.cookies.set('oauth_req_source', reqSource, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });

  return response;
}
