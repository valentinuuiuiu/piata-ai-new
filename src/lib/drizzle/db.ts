import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { healthCheck } from '../db';

// Create PostgreSQL pool
// Create PostgreSQL pool
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      min: 2,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    }
  : {
      host: process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER!,
      password: process.env.DB_PASS!,
      database: process.env.DB_NAME!,
      max: 20,
      min: 2,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    };

const pool = new Pool(poolConfig as any);

export const db = drizzle(pool, { schema });
export type DB = typeof db;
export * from './schema';

// Health check for Drizzle connection
export async function drizzleHealthCheck() {
  try {
    const result = await pool.query('SELECT version() as version, current_database() as database, current_user as user');
    return {
      success: true,
      version: result.rows[0].version,
      database: result.rows[0].database,
      user: result.rows[0].user,
    };
  } catch (error) {
    console.error('Drizzle health check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}