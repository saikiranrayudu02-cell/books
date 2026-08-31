import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

config({ path: resolve(process.cwd(), '.env.local') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: 'require' });

async function setup() {
  console.log('Creating settings table in Supabase...');
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR PRIMARY KEY,
      value VARCHAR NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  console.log('Inserting default maintenance_mode...');
  await sql`
    INSERT INTO settings (key, value) VALUES ('maintenance_mode', 'false') ON CONFLICT (key) DO NOTHING;
  `;
  
  console.log('Done!');
  await sql.end();
}

setup().catch(async (err) => {
  console.error(err);
  await sql.end();
});
