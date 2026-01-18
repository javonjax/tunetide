CREATE SCHEMA IF NOT EXISTS radio;

CREATE TABLE IF NOT EXISTS radio.oauth_users (
    id SERIAL PRIMARY KEY,
    user_id integer NOT NULL REFERENCES radio.users(id),
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    UNIQUE(provider, provider_user_id)
);
