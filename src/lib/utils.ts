import { clsx, type ClassValue } from 'clsx';
import { ReactNode } from 'react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
  Captilize string data.
*/
export const capitalize = (str: string): string => {
  if (!str.length) return '';
  const res: string[] = [str[0].toUpperCase()];
  for (let i = 1; i < str.length; i++) {
    if (/\s/.test(str[i - 1])) {
      res.push(str[i].toUpperCase());
    } else {
      res.push(str[i]);
    }
  }
  return res.join('');
};

/*
  Custom frontend error class.
*/
export class APIError extends Error {
  public status: number;
  constructor(message: string = 'Backend API error.', status: number = 500) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

/*
  Handle API fetches and create error object if necessary.
*/
export const handleAPIFetch = async (res: globalThis.Response): Promise<globalThis.Response> => {
  if (!res.ok) {
    const body = await res.json();
    const message: string = body?.error || 'API fetch error.';
    const status: number = body?.status ?? res.status;
    throw new APIError(message, status);
  }
  return res;
};

/*
  Handle errors thrown by frontend API fetches.
*/
export const handleAPIError = (error: unknown): void => {
  let toastDescription: string = '';
  if (error instanceof APIError) {
    toastDescription = error.message;
  } else {
    console.warn(`API fetch error.`);
    toastDescription = 'There was an issue connecting to the servers.';
  }
  warningToast('Uh-oh.', toastDescription);
};

export const successToast = (
  message: string = 'Success.',
  description: string | ReactNode
): void => {
  toast.success(message, {
    position: 'top-center',
    duration: 7000,
    description: description,
  });
};

export const warningToast = (message: string = 'Uh-oh.', description: string | ReactNode): void => {
  toast.warning(message, {
    position: 'top-center',
    duration: 7000,
    description: description,
  });
};

export const errorToast = (message: string = 'Error.', description: string | ReactNode): void => {
  toast.error(message, {
    position: 'top-center',
    duration: 7000,
    description: description,
  });
};
