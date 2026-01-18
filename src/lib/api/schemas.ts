import { z } from 'zod';

export const RadioStationSchema = z.object({
  changeuuid: z.string().nullable(),
  stationuuid: z.string().nullable(),
  name: z.string().nullable(),
  url: z.string().nullable(),
  url_resolved: z.string().nullable(),
  homepage: z.string().nullable(),
  favicon: z.string().nullable(),
  tags: z.string().nullable(),
  country: z.string().nullable(), // Depreciated: use country code.
  countrycode: z.string().nullable(),
  state: z.string().nullable(),
  iso_3166_2: z.string().nullable(),
  language: z.string().nullable(),
  languagecodes: z.string().nullable(),
  votes: z.number().nullable(),
  lastchangetime_iso8601: z.string().datetime().nullable(),
  lastcheckok: z.number(),
  lastchecktime_iso8601: z.string().datetime().nullable(),
  lastcheckoktime_iso8601: z.string().datetime().nullable(),
  clicktimestamp_iso8601: z.string().datetime().nullable(),
  clickcount: z.number().nullable(),
  clicktrend: z.number().nullable(),
  geo_lat: z.number().nullable(),
  geo_long: z.number().nullable(),
});

export type RadioStation = z.infer<typeof RadioStationSchema>;

export const RadioStationsAPIResponse = z.array(RadioStationSchema);

export const TagSchema = z.object({
  name: z.string().nullable(),
  stationcount: z.number().nullable(),
});

export type Tag = z.infer<typeof TagSchema>;

export const TagsAPIResponse = z.array(TagSchema);

export const CountrySchema = z.object({
  name: z.string(),
  iso_3166_1: z.string().nullable(),
  stationcount: z.number().nullable(),
});

export type Country = z.infer<typeof CountrySchema>;

export const CountriesAPIResponse = z.array(CountrySchema);

export const LanguageSchema = z.object({
  name: z.string(),
  iso_639: z.string().nullable(),
  stationcount: z.number().nullable(),
});

export type Language = z.infer<typeof LanguageSchema>;

export const LanguagesAPIResponse = z.array(LanguageSchema);

export const StationClickSchema = z.object({
  stationuuid: z.string(),
  clickuuid: z.string(),
  clicktimestamp_iso8601: z.string(),
  clicktimestamp: z.string(),
});

export type StationClick = z.infer<typeof StationClickSchema>;

export const StationClicksAPIResponse = z.array(StationClickSchema);

export type ClickData = {
  hour: string;
  clicks: number;
};

export interface User {
  id: number;
  email: string;
  password_hash: string;
}

export interface OAuthUser {
  id: number;
  user_id: number;
  provider: string;
  provider_user_id: string;
}

export interface Favorite {
  id: number;
  user_id: string;
  station_id: string;
  station: RadioStation;
  created_at: Date;
}

export interface Session {
  isAuth: boolean;
  userId: number | undefined;
}

export interface NewFavorite {
  userId: number | undefined;
  stationId: string | null;
  station: RadioStation;
}

export interface GoogleToken {
  access_token: string;
  expires_in: number;
  id_token: string;
  scope: string;
  token_type: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export interface GithubToken {
  access_token: string;
  scope: string;
  token_type: string;
}

export interface GithubUserInfo {
  login: string;
  id: number;
}

export interface GithubEmailInfo {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

/*
  Custom error class for failure to retrieve active radio-browser servers.
*/
export class RadioBrowserServerError extends Error {
  public status: number;
  constructor(
    message: string = 'An active radio-browser server could not be found.',
    status: number = 500
  ) {
    super(message);
    this.status = status;
  }
}

/*
  Custom error class that allows adding a status code.
*/
export class HTTPError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HTTPError';
    this.status = status;
  }
}

/*
  Custom error class for generic schema errors.
*/
export class SchemaError extends Error {
  public status: number;
  constructor(
    message: string = 'API response does not match the desired schema.',
    status: number = 500
  ) {
    super(message);
    this.name = 'SchemaError';
    this.status = status;
  }
}

export type OAuthErrorType =
  | 'state_mismatch'
  | 'token_gen'
  | 'user_info'
  | 'session_creation'
  | 'db_registration'
  | 'unknown';

/*
  Custom error clas for OAuth errors.
*/

export class OAuthError extends Error {
  public provider: string;
  public errorType: string;

  constructor(provider: string, errorType: OAuthErrorType, message: string = 'OAuth Error') {
    super(message);
    this.name = 'OAuthError';
    this.provider = provider;
    this.errorType = errorType;
  }
}

// OAuth error types
/**
 * state mismatch
 * token generation
 * no user info
 * failed to create login session
 * failed registration on db
 */
