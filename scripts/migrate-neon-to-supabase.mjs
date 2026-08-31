import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';

const neonUrl = process.env.NEON_DATABASE_URL;
const supabaseUrl = process.env.DATABASE_URL;

if (!neonUrl) { console.error('❌ NEON_DATABASE_URL not found'); process.exit(1); }
if (!supabaseUrl) { console.error('❌ DATABASE_URL not found'); process.exit(1); }

const neonSql = neon(neonUrl);
const supabaseSql = postgres(supabaseUrl, { ssl: 'require' });

async function createTables() {
  console.log('📦 Dropping old tables in Supabase (Clean reset)...');
  await supabaseSql`DROP TABLE IF EXISTS order_items CASCADE`;
  await supabaseSql`DROP TABLE IF EXISTS orders CASCADE`;
  await supabaseSql`DROP TABLE IF EXISTS addresses CASCADE`;
  await supabaseSql`DROP TABLE IF EXISTS wishlist CASCADE`;
  await supabaseSql`DROP TABLE IF EXISTS wishlist_items CASCADE`;
  await supabaseSql`DROP TABLE IF EXISTS users CASCADE`;
  await supabaseSql`DROP TABLE IF EXISTS products CASCADE`;
  await supabaseSql`DROP TABLE IF EXISTS app_settings CASCADE`;
  await supabaseSql`DROP TABLE IF EXISTS settings CASCADE`;

  console.log('📦 Creating tables in Supabase...');

  // Create Users Table
  await supabaseSql`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name character varying NOT NULL,
      email character varying UNIQUE,
      phone character varying,
      role character varying DEFAULT 'customer',
      image TEXT,
      password_hash character varying,
      created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Addresses Table
  await supabaseSql`
    CREATE TABLE IF NOT EXISTS addresses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      full_name character varying NOT NULL,
      mobile character varying NOT NULL,
      email character varying NOT NULL,
      house_flat character varying NOT NULL,
      street character varying NOT NULL,
      area character varying,
      city character varying NOT NULL,
      state character varying NOT NULL,
      pin_code character varying NOT NULL,
      is_default boolean DEFAULT FALSE,
      created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Products Table (exact match of Neon)
  await supabaseSql`
    CREATE TABLE IF NOT EXISTS products (
      id character varying PRIMARY KEY,
      slug character varying UNIQUE NOT NULL,
      name character varying NOT NULL,
      bundle_title character varying,
      books_included integer DEFAULT 1,
      edition character varying,
      short_description text,
      description text NOT NULL,
      price numeric NOT NULL,
      image character varying NOT NULL,
      images jsonb,
      category character varying NOT NULL,
      exam_coverage character varying,
      badges jsonb,
      features jsonb,
      table_of_contents jsonb,
      brand character varying,
      badge character varying,
      stock integer DEFAULT 0,
      languages jsonb,
      created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Orders Table (using delivery_address JSONB matching queries)
  await supabaseSql`
    CREATE TABLE IF NOT EXISTS orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number character varying UNIQUE NOT NULL,
      user_id uuid REFERENCES users(id) ON DELETE SET NULL,
      subtotal numeric NOT NULL,
      delivery_charge numeric NOT NULL,
      total numeric NOT NULL,
      delivery_address jsonb NOT NULL,
      status character varying DEFAULT 'placed',
      payment_status character varying DEFAULT 'pending',
      tracking_number character varying,
      carrier character varying,
      notes text,
      created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create Order Items Table
  await supabaseSql`
    CREATE TABLE IF NOT EXISTS order_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
      product_id character varying,
      product_name character varying NOT NULL,
      product_slug character varying NOT NULL,
      product_image character varying NOT NULL,
      price numeric NOT NULL,
      language character varying NOT NULL,
      quantity integer NOT NULL DEFAULT 1,
      bundle_title character varying,
      books_included integer
    )
  `;

  // Create Wishlist Items Table
  await supabaseSql`
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      product_id character varying REFERENCES products(id) ON DELETE CASCADE,
      created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    )
  `;

  // Create Settings Table
  await supabaseSql`
    CREATE TABLE IF NOT EXISTS settings (
      key character varying PRIMARY KEY,
      value character varying NOT NULL,
      updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log('✅ Tables created successfully.');
}

async function fetchFromNeon(tableName) {
  try {
    switch (tableName) {
      case 'users': return await neonSql`SELECT * FROM users`;
      case 'products': return await neonSql`SELECT * FROM products`;
      case 'addresses': return await neonSql`SELECT * FROM addresses`;
      case 'orders': return await neonSql`SELECT * FROM orders`;
      case 'order_items': return await neonSql`SELECT * FROM order_items`;
      case 'wishlist_items': return await neonSql`SELECT * FROM wishlist_items`;
      case 'settings': return await neonSql`SELECT * FROM settings`;
      case 'app_settings': return null; // fallback / deprecated
      default: return [];
    }
  } catch (err) {
    if (err.message?.includes('does not exist')) {
      // Table doesn't exist in Neon, skip gracefully
      return null;
    }
    throw err;
  }
}

async function migrateTable(tableName) {
  console.log(`\n🔄 Migrating table: ${tableName}...`);

  try {
    const rows = await fetchFromNeon(tableName);
    
    if (rows === null) {
      console.log(`   ⚪ Table "${tableName}" does not exist in Neon, skipping.`);
      return 0;
    }
    
    if (rows.length === 0) {
      console.log(`   ⚪ No data in ${tableName}, skipping.`);
      return 0;
    }

    console.log(`   📊 Found ${rows.length} rows in Neon.`);

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        const columns = Object.keys(row);
        const values = Object.values(row);

        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const columnList = columns.map(c => `"${c}"`).join(', ');

        await supabaseSql.unsafe(
          `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
        inserted++;
      } catch (err) {
        skipped++;
        if (skipped <= 3) {
          console.warn(`   ⚠️ Skipped row:`, err.message?.substring(0, 120));
        }
      }
    }

    console.log(`   ✅ Inserted: ${inserted}, Skipped: ${skipped}`);
    return inserted;
  } catch (err) {
    console.error(`   ❌ Error migrating ${tableName}:`, err.message);
    return 0;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 Neon → Supabase Data Migration');
  console.log('═══════════════════════════════════════════');

  console.log('\n1️⃣  Testing Neon...');
  const nv = await neonSql`SELECT version()`;
  console.log('   ✅ Neon:', nv[0].version.substring(0, 50));

  console.log('\n2️⃣  Testing Supabase...');
  const sv = await supabaseSql`SELECT version()`;
  console.log('   ✅ Supabase:', sv[0].version.substring(0, 50));

  console.log('\n3️⃣  Re-creating tables in Supabase...');
  await createTables();

  console.log('\n4️⃣  Migrating data...');
  const tables = ['users', 'products', 'addresses', 'orders', 'order_items', 'wishlist_items', 'settings'];
  let total = 0;
  for (const t of tables) {
    total += await migrateTable(t);
  }

  await supabaseSql.end();

  console.log('\n═══════════════════════════════════════════');
  console.log(`  🎉 Done! ${total} rows migrated to Supabase.`);
  console.log('═══════════════════════════════════════════');
}

main().catch(async (err) => {
  console.error('❌ Migration failed:', err);
  await supabaseSql.end();
  process.exit(1);
});
