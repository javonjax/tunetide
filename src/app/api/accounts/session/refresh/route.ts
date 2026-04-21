import { withErrorHandler } from '@/lib/api/errorHandler';

import { NextResponse } from 'next/server';

export const GET = withErrorHandler(async (): Promise<NextResponse> => {});
