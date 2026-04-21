import { withErrorHandler } from '@/lib/api/errorHandler';
import { deleteSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export const POST = withErrorHandler(async (): Promise<NextResponse> => {
  await deleteSession();
  return NextResponse.json({ message: 'Logout successful.' });
});
