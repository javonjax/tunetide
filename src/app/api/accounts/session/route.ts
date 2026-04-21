import { withErrorHandler } from '@/lib/api/errorHandler';
import { Session } from '@/lib/api/schemas';
import { getActiveSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export const GET = withErrorHandler(async (): Promise<NextResponse> => {
  const session: Session = await getActiveSession();
  return NextResponse.json(session);
});
