import { pgPool } from './db';
import path from 'path';
import fs from 'fs';
import { QueryResult } from 'pg';

// const NODE_ENV: string = process.env.NODE_ENV as string;
const DB_SCHEMA: string = process.env.DB_SCHEMA as string;
const DB_USERS_TABLE: string = process.env.DB_USERS_TABLE as string;
const DB_FAVORITES_TABLE: string = process.env.DB_FAVORITES_TABLE as string;
const DB_OAUTH_USERS_TABLE: string = process.env.DB_OAUTH_USERS_TABLE as string;

export const initUsersDB = async (): Promise<void> => {
  try {
    const res: QueryResult<{ exists: boolean }> = await pgPool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = '${DB_SCHEMA}' AND table_name = '${DB_USERS_TABLE}'
      )
    `);

    const tableExists: boolean = res.rows[0].exists;

    if (!tableExists) {
      const tableSchemaFile: string = path.resolve(__dirname, './users.schema.sql');
      const schemaSQL: string = fs.readFileSync(tableSchemaFile, 'utf-8');
      await pgPool.query(schemaSQL);
      console.log('Users table created.');
    } else {
      console.log('Users table already exists.');
    }
  } catch (error) {
    console.error('Error creating users table:', error);
  }
};

export const initOauthUsersDB = async (): Promise<void> => {
  try {
    const res: QueryResult<{ exists: boolean }> = await pgPool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = '${DB_SCHEMA}' AND table_name = '${DB_OAUTH_USERS_TABLE}'
      )
    `);

    const tableExists: boolean = res.rows[0].exists;

    if (!tableExists) {
      const tableSchemaFile: string = path.resolve(__dirname, './oauth_users.schema.sql');
      const schemaSQL: string = fs.readFileSync(tableSchemaFile, 'utf-8');
      await pgPool.query(schemaSQL);
      console.log('OAuth users table created.');
    } else {
      console.log('OAuth users table already exists.');
    }
  } catch (error) {
    console.error('Error creating oauth users table:', error);
  }
};

export const initFavoritesDB = async (): Promise<void> => {
  try {
    const res: QueryResult<{ exists: boolean }> = await pgPool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = '${DB_SCHEMA}' AND table_name = '${DB_FAVORITES_TABLE}'
      )
    `);

    const tableExists: boolean = res.rows[0].exists;

    if (!tableExists) {
      const tableSchemaFile: string = path.resolve(__dirname, './favorites.schema.sql');
      const schemaSQL: string = fs.readFileSync(tableSchemaFile, 'utf-8');
      await pgPool.query(schemaSQL);
      console.log('Favorites table created.');
    } else {
      console.log('Favorites table already exists.');
    }
  } catch (error) {
    console.error('Error creating favorites table:', error);
  }
};
