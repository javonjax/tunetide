import { NextRequest, NextResponse } from 'next/server';
import { HTTPError } from './schemas';

export type RouteHandler<T> = (
  req: NextRequest,
  context: { params: Promise<T> }
) => Promise<NextResponse>;

export const handleError = (error: unknown) => {
  let message: string = 'Internal server error';
  let status: number = 500;

  if (error instanceof HTTPError) {
    status = error.status;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return NextResponse.json({ error: message }, { status: status });
};

export const withErrorHandler = <T>(routeHandler: RouteHandler<T>) => {
  return async (req: NextRequest, context: { params: Promise<T> }): Promise<NextResponse> => {
    try {
      return await routeHandler(req, context);
    } catch (error) {
      return handleError(error);
    }
  };
};
