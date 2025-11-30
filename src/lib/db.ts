import { Pool } from 'pg';
import { convertSQLPlaceholders } from './sql-utils';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: { rejectUnauthorized: false }, // Required for Supabase
      max: 20,
      min: 2,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    }
  : {
      host: process.env.DB_HOST || process.env.POSTGRES_HOST || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || process.env.POSTGRES_USER || 'piata_ro_user',
      password: process.env.DB_PASS || process.env.POSTGRES_PASSWORD,
      database: process.env.DB_NAME || process.env.POSTGRES_DATABASE || 'piata_ro',
      ssl: (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') ? { rejectUnauthorized: false } : undefined,
      max: 20,
      min: 2,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    };

// Validate config in production
if (process.env.NODE_ENV === 'production' && !connectionString && !poolConfig.host) {
  console.error('❌ Database configuration missing in production! Set DATABASE_URL or DB_HOST.');
}

const pool = new Pool(poolConfig as any);

// Health check function
export async function healthCheck() {
  try {
    const result = await pool.query('SELECT version() as version, current_database() as database, current_user as user');
    return {
      success: true,
      version: result.rows[0].version,
      database: result.rows[0].database,
      user: result.rows[0].user,
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Enhanced query function with error handling and PostgreSQL placeholder conversion
export async function query(sql: string, params?: (string | number | null | boolean)[]) {
  try {
    const start = Date.now();
    // Convert MySQL-style ? placeholders to PostgreSQL-style $1, $2, etc
    const convertedSQL = convertSQLPlaceholders(sql);
    const result = await pool.query(convertedSQL, params || []);
    const duration = Date.now() - start;
    
    // Log slow queries (>100ms)
    if (duration > 100) {
      console.warn(`Slow query (${duration}ms):`, sql.substring(0, 100));
    }
    
    return result.rows;
  } catch (error) {
    console.error('Database query failed:', { sql, params, error });
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
export async function closePool() {
  try {
    await pool.end();
    console.log('PostgreSQL connection pool closed');
  } catch (error) {
    console.error('Error closing PostgreSQL pool:', error);
  }
}

export default pool;