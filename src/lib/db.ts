import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('⚠️ DATABASE_URL is not set in environment variables.');
}

export const sql = postgres(databaseUrl || '', {
  ssl: 'require',
  // Connection pool settings
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});
