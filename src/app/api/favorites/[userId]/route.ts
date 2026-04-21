import { pgPool } from '@/lib/api/db/db';
import { withErrorHandler } from '@/lib/api/errorHandler';
import { Favorite, HTTPError } from '@/lib/api/schemas';
import { NextRequest, NextResponse } from 'next/server';
import { QueryResult } from 'pg';

const DB_SCHEMA: string = process.env.DB_SCHEMA as string;
const DB_FAVORITES_TABLE: string = process.env.DB_FAVORITES_TABLE as string;

export const GET = withErrorHandler(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
  ): Promise<NextResponse> => {
    const { userId }: { userId: string } = await params;
    const searchParams: URLSearchParams = request.nextUrl.searchParams;
    const {
      page = null,
      name = null,
      tag = null,
      country = null,
      language = null,
      order = null,
    } = Object.fromEntries(searchParams);

    const itemsPerPage: number = 10;
    if (!userId) {
      throw new HTTPError('Must be logged in to get favorites.', 400);
    }

    let queryText = `SELECT * FROM ${DB_SCHEMA}.${DB_FAVORITES_TABLE} WHERE 
        user_id = $1
        AND (COALESCE($2, '') = '' OR station->>'name' ILIKE '%' || $2 || '%')
        AND (COALESCE($3, '') = '' OR station->>'tags' ILIKE '%' || $3 || '%')
        AND (COALESCE($4, '') = '' OR station->>'country' ILIKE '%' || $4 || '%')
        AND (COALESCE($5, '') = '' OR station->>'language' ILIKE '%' || $5 || '%')`;

    if (!order || order === 'name') {
      queryText += ` ORDER BY station->>'name' ASC NULLS LAST`;
    } else if (order === 'clickcount' || order === 'votes' || order === 'clicktrend') {
      queryText += ` ORDER BY (station->>'${order}')::bigint DESC NULLS LAST`;
    } else {
      queryText += ` ORDER BY station->>'${order}' DESC NULLS LAST`;
    }

    if (!page) {
      queryText += `;`;
    } else if (page === '1') {
      queryText += ` LIMIT ${itemsPerPage + 1};`;
    } else {
      queryText += ` OFFSET ${(Number(page) - 1) * itemsPerPage} LIMIT ${itemsPerPage + 1};`;
    }

    const query = {
      text: queryText,
      values: [userId, name, tag, country, language],
    };

    const queryRes: QueryResult<Favorite> = await pgPool.query(query);

    let hasMore: boolean = false;
    if (queryRes.rowCount === itemsPerPage + 1) {
      hasMore = true;
    }

    return NextResponse.json({
      favorites: page && Number(page) > 0 ? queryRes.rows.slice(0, itemsPerPage) : queryRes.rows,
      hasMore: hasMore,
    });
  }
);
