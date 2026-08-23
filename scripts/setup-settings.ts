import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL!);

async function setup() {
  console.log('Creating settings table...');
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
}

setup().catch(console.error);
