import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL not found in .env.local or environment');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function initDatabase() {
  console.log('🔄 Connecting to Neon Database...');
  
  try {
    // Test basic query
    const versionResult = await sql`SELECT version()`;
    console.log('✅ Connected successfully to Neon PostgreSQL!');
    console.log('🐘 PostgreSQL Version:', versionResult[0].version);

    // Create Users Table
    console.log('📦 Creating tables...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'customer',
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create Addresses Table
    await sql`
      CREATE TABLE IF NOT EXISTS addresses (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        house_flat VARCHAR(255) NOT NULL,
        street VARCHAR(255) NOT NULL,
        area VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pin_code VARCHAR(20) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create Products Table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        bundle_title VARCHAR(255),
        books_included INT DEFAULT 2,
        edition VARCHAR(100) DEFAULT 'First Edition',
        short_description TEXT,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        languages JSONB NOT NULL DEFAULT '[]',
        image TEXT NOT NULL,
        images JSONB NOT NULL DEFAULT '[]',
        category VARCHAR(100) NOT NULL,
        exam_coverage TEXT,
        features JSONB DEFAULT '[]',
        brand VARCHAR(100) DEFAULT 'Tenali Exams Publishers',
        badge VARCHAR(100),
        stock INT DEFAULT 100,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create Orders Table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        user_id VARCHAR(255),
        subtotal NUMERIC(10, 2) NOT NULL,
        delivery_charge NUMERIC(10, 2) DEFAULT 0,
        total NUMERIC(10, 2) NOT NULL,
        shipping_address JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'placed',
        payment_status VARCHAR(50) DEFAULT 'pending',
        tracking_number VARCHAR(100),
        carrier VARCHAR(100) DEFAULT 'India Post Speed Post',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create Order Items Table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_slug VARCHAR(255) NOT NULL,
        product_image TEXT,
        price NUMERIC(10, 2) NOT NULL,
        language VARCHAR(50) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        bundle_title VARCHAR(255),
        books_included INT DEFAULT 2
      )
    `;

    // Create Wishlist Table
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, product_id)
      )
    `;

    // Seed Products if table is empty
    const existingProducts = await sql`SELECT count(*) FROM products`;
    if (parseInt(existingProducts[0].count) === 0) {
      console.log('🌱 Seeding initial products...');
      await sql`
        INSERT INTO products (
          id, slug, name, bundle_title, books_included, edition, short_description, description,
          price, languages, image, images, category, exam_coverage, features, badge, stock
        ) VALUES (
          'p1',
          'mts-postman-mg',
          'MTS + POSTMAN / MG',
          '2-Book Preparation Set',
          2,
          'First Edition',
          'Comprehensive 2-book preparation bundle covering MTS, Postman, and Mail Guard syllabi. Updated with latest department rules.',
          'Prepare for MTS, Postman, and Mail Guard (MG) examinations with this complete 2-book preparation set. This bundle combines essential exam-focused study material covering the key subjects, concepts, rules, and postal-related topics required for your preparation.',
          800,
          '[{"code":"en","name":"English"},{"code":"te","name":"Telugu"},{"code":"hi","name":"Hindi"}]'::jsonb,
          '/images/book-mts-postman.jpg',
          '["/images/book-mts-postman.jpg", "/images/common-guide-2027.jpg"]'::jsonb,
          'Combo Pack',
          'MTS, Postman & Mail Guard (MG) Examinations',
          '["Exam-focused coverage for MTS, Postman & Mail Guard (MG)", "Coverage of relevant postal subjects, rules, and concepts", "Previous-year question papers included", "Concept-based notes, tables, and important rules", "Useful study material for revision and exam preparation"]'::jsonb,
          'Best Seller',
          100
        ),
        (
          'p2',
          'pa-sa',
          'PA / SA',
          '3-Book Preparation Set',
          3,
          'First Edition',
          'Complete 3-book preparation bundle for PA / SA examination.',
          'Prepare for the Postal Assistant (PA) and Sorting Assistant (SA) examinations with this complete 3-book preparation set. The bundle brings together essential study material covering the subjects and concepts required for your exam preparation, presented in a simple and easy-to-understand format.',
          1200,
          '[{"code":"en","name":"English"},{"code":"te","name":"Telugu"},{"code":"hi","name":"Hindi"}]'::jsonb,
          '/images/book-pa-sa.jpg',
          '["/images/book-pa-sa.jpg"]'::jsonb,
          'Study Guide',
          'Postal Assistant (PA) & Sorting Assistant (SA) Examinations',
          '["PA / SA exam-focused study material", "Coverage of relevant postal subjects, manuals, and concepts", "Previous-year solved questions/papers", "Topic-wise practice questions and MCQs", "Concept-based explanations for easier preparation", "Useful revision material for exam preparation"]'::jsonb,
          NULL,
          100
        )
      `;
      console.log('✅ Seeded 2 product bundles.');
    }

    console.log('🎉 Neon database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

initDatabase();
