import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import {
  GithubEmailInfo,
  GithubToken,
  GithubUserInfo,
  OAuthError,
  OAuthUser,
  User,
} from '@/lib/api/schemas';
import { checkIfOAuthUserExists } from '@/lib/api/utils';
import { pgPool } from '@/lib/api/db/db';
import { QueryResult } from 'pg';

const APP_URL: string = process.env.APP_URL as string;
const DB_SCHEMA: string = process.env.DB_SCHEMA as string;
const DB_USERS_TABLE: string = process.env.DB_USERS_TABLE as string;
const DB_OAUTH_USERS_TABLE: string = process.env.DB_OAUTH_USERS_TABLE as string;
const PROVIDER: string = 'Github';
const GITHUB_OAUTH_TOKEN_URI: string = process.env.GITHUB_OAUTH_TOKEN_URI as string;
const GITHUB_OAUTH_CLIENT_ID: string = process.env.GITHUB_OAUTH_CLIENT_ID as string;
const GITHUB_OAUTH_REDIRECT_URI: string = process.env.GITHUB_OAUTH_REDIRECT_URI as string;
const GITHUB_OAUTH_SECRET: string = process.env.GITHUB_OAUTH_SECRET as string;
const GITHUB_OAUTH_USER_INFO_URI: string = process.env.GITHUB_OAUTH_USER_INFO_URI as string;
const GITHUB_OAUTH_EMAILS_URI: string = process.env.GITHUB_OAUTH_EMAILS_URI as string;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const code: string | null = searchParams.get('code');
  const state: string | null = searchParams.get('state');
  const storedState: string | undefined = request.cookies.get('oauth_state')?.value;
  const reqSource: string | undefined = request.cookies.get('oauth_req_source')?.value;
  try {
    // Verify OAuth state and code match.
    if (!code || !state || state !== storedState) {
      throw new OAuthError(PROVIDER, 'state_mismatch');
    }

    // Delete cookies after use.
    const response = NextResponse.next();
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_req_source');

    // Generate tokens.
    const tokenRes: globalThis.Response = await fetch(GITHUB_OAUTH_TOKEN_URI, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GITHUB_OAUTH_CLIENT_ID,
        client_secret: GITHUB_OAUTH_SECRET,
        code: code,
        redirect_uri: GITHUB_OAUTH_REDIRECT_URI,
      }),
    });

    const token: GithubToken = await tokenRes.json();

    if (!token.access_token) {
      throw new OAuthError(PROVIDER, 'token_gen');
    }

    // Fetch user info using the token.
    const userInfoRes: globalThis.Response = await fetch(GITHUB_OAUTH_USER_INFO_URI, {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    if (!userInfoRes.ok) {
      throw new OAuthError(PROVIDER, 'user_info');
    }

    const userInfo: GithubUserInfo = await userInfoRes.json();

    // Fetch user email using the token. This is endpoint is more reliable for emails than the generic user endpoint.
    const userEmailsRes: globalThis.Response = await fetch(GITHUB_OAUTH_EMAILS_URI, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    if (!userEmailsRes.ok) {
      throw new OAuthError(PROVIDER, 'user_info');
    }

    const userEmails: GithubEmailInfo[] = await userEmailsRes.json();
    const primaryEmail: string | undefined = userEmails.find(
      (email: GithubEmailInfo) => email.primary && email.verified
    )?.email;

    if (!primaryEmail) {
      throw new OAuthError(PROVIDER, 'user_info');
    }

    // Check for existing OAuth user account in the DB. Start session if one exists.
    const oauthUser: OAuthUser | undefined = await checkIfOAuthUserExists(
      PROVIDER,
      String(userInfo.id)
    );

    if (oauthUser) {
      const sessionCreated: boolean = await createSession(oauthUser.user_id);
      if (!sessionCreated) {
        throw new OAuthError(PROVIDER, 'session_creation');
      }
      // TODO: success redirect
      return NextResponse.redirect(`${APP_URL}/${reqSource}?status=success`);
    }

    // Get user ID from normal user account if it exists. Register a normal user account otherwise.
    // Favorites are handled under this normal user account.
    let userId: number | undefined = undefined;
    let query = {
      text: `SELECT * FROM ${DB_SCHEMA}.${DB_USERS_TABLE} WHERE email = $1;`,
      values: [primaryEmail],
    };

    const userExistsUnderEmail: QueryResult<User> = await pgPool.query(query);

    if (!userExistsUnderEmail.rowCount || userExistsUnderEmail.rowCount === 0) {
      console.log('Attempting to register account...');
      query = {
        text: `INSERT INTO ${DB_SCHEMA}.${DB_USERS_TABLE} (email) VALUES ($1) RETURNING id;`,
        values: [primaryEmail],
      };
      const registrationQueryRes: QueryResult<{ id: number }> = await pgPool.query(query);
      if (!registrationQueryRes.rowCount) {
        throw new OAuthError(PROVIDER, 'db_registration');
      }
      userId = registrationQueryRes.rows[0].id;
    } else {
      userId = userExistsUnderEmail.rows[0].id;
    }

    // Create new OAuth user account in the DB and start session.
    query = {
      text: `INSERT INTO ${DB_SCHEMA}.${DB_OAUTH_USERS_TABLE} (user_id, provider, provider_user_id) VALUES ($1, $2, $3) RETURNING id;`,
      values: [String(userId), PROVIDER, String(userInfo.id)],
    };

    const oauthRegistrationQueryRes: QueryResult<{ id: number }> = await pgPool.query(query);
    if (!oauthRegistrationQueryRes.rowCount) {
      throw new OAuthError(PROVIDER, 'db_registration');
    }

    const sessionCreated: boolean = await createSession(userId);

    if (!sessionCreated) {
      throw new OAuthError(PROVIDER, 'session_creation');
    }
    return NextResponse.redirect(`${APP_URL}/${reqSource}?status=success`);
  } catch (error) {
    console.log(error);
    if (error instanceof OAuthError) {
      const { errorType } = error;
      return NextResponse.redirect(
        `${APP_URL}/${reqSource}?status=fail&error=${errorType}&provider=${PROVIDER}`
      );
    } else {
      return NextResponse.redirect(
        `${APP_URL}/${reqSource}?status=fail&error=unknown&provider=${PROVIDER}`
      );
    }
  }
}
