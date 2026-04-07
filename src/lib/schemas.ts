import { JWTPayload } from 'jose';

export type StationFilters = {
  order: StationSortingOption;
  country: string;
  language: string;
};

export type StationSearchInputs = {
  name: string;
  tag: string;
};

export type StationSortingOption =
  | 'name'
  | 'clickcount'
  | 'votes'
  | 'clicktimestamp'
  | 'changetimestamp'
  | 'clicktrend';

export type DropdownMenuOption = {
  label: string;
  value: StationSortingOption;
};

// Accounts

export const EMAIL_REGEX = /^[\w\-.]+@[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}$/;

export const USERNAME_REGEX = /^[A-Za-z][A-z0-9-_]{3,23}$/;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

export const emailValidation = {
  required: 'Email address is required.',
  pattern: {
    value: EMAIL_REGEX,
    message: 'Email address is invalid.',
  },
};

export type EmailValidation = typeof emailValidation;

export const usernameValidation = {
  required: 'Username is required.',
  minLength: {
    value: 4,
    message: 'Must be at least 4 characters long.',
  },
  maxLength: {
    value: 24,
    message: 'Must be less than 24 characters long.',
  },
  pattern: {
    value: USERNAME_REGEX,
    message: 'May only contain letters, numbers, hyphens, and underscores.',
  },
};

export type UsernameValidation = typeof usernameValidation;

export const registrationPasswordValidation = {
  required: 'Password is required.',
  minLength: {
    value: 8,
    message: 'Must be at least 8 characters long.',
  },
  maxLength: {
    value: 24,
    message: 'Must be less than 24 characters long.',
  },
  pattern: {
    value: PASSWORD_REGEX,
    message: 'Must contain an uppercase letter, a number, and a special character [!@#$%].',
  },
};

export type RegistrationPasswordValidation = typeof registrationPasswordValidation;

export const confirmPasswordValidation = (password: string) => ({
  required: 'Please confirm your password.',
  validate: {
    passwordMatch: (value: string) => value === password || 'Passwords must match.',
  },
});

export type ConfirmPasswordValidation = typeof confirmPasswordValidation;

export const loginPasswordValidation = {
  required: 'Password is required.',
};

export type LoginPasswordValidation = typeof loginPasswordValidation;

export interface TokenPayload extends JWTPayload {
  userId: number;
}
