import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_URL: string = process.env.APP_URL as string;
const PROVIDER: string = 'Github';
const GITHUB_OAUTH_URI: string = process.env.GITHUB_OAUTH_URI as string;
const GITHUB_OAUTH_CLIENT_ID: string = process.env.GITHUB_OAUTH_CLIENT_ID as string;
const GITHUB_OAUTH_REDIRECT_URI: string = process.env.GITHUB_OAUTH_REDIRECT_URI as string;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const reqSource: string = searchParams.get('source')!;
  try {
    const state = crypto.randomUUID();

    const params = new URLSearchParams({
      client_id: GITHUB_OAUTH_CLIENT_ID,
      redirect_uri: GITHUB_OAUTH_REDIRECT_URI,
      response_type: 'code',
      scope: 'read:user user:email',
      state,
    });

    const response = NextResponse.redirect(`${GITHUB_OAUTH_URI}?${params.toString()}`);

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
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      `${APP_URL}/${reqSource}?status=fail&error=unknown&provider=${PROVIDER}`
    );
  }
}
