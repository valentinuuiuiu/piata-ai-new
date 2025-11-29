import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/drizzle/schema.ts',
  out: './src/lib/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 
         `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  }
});
