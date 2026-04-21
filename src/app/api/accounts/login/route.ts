import { HTTPError, User } from '@/lib/api/schemas';
import { checkIfUserExists } from '@/lib/api/utils';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createSession } from '@/lib/session';
import { withErrorHandler } from '@/lib/api/errorHandler';

export const POST = withErrorHandler(async (request: NextRequest): Promise<NextResponse> => {
  const { email, password } = await request.json();

  console.log('Checking that all params are present...');
  if (!email || !password) {
    throw new HTTPError('Missing login parameters.', 400);
  }

  const user: User | undefined = await checkIfUserExists('email', email);

  if (!user) {
    throw new HTTPError('Invalid email or password.', 404);
  }

  const isPasswordMatch: boolean = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordMatch) {
    throw new HTTPError('Invalid email or password.', 404);
  }

  const sessionCreated: boolean = await createSession(user.id);

  if (!sessionCreated) {
    throw new HTTPError('Failed to create login session.', 500);
  }

  return NextResponse.json({ message: 'Login successful.' });
});
