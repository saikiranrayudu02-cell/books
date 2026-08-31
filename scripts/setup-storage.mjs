import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function setupBucket() {
  try {
    const existing = await sql`SELECT * FROM storage.buckets WHERE id = 'products'`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('products', 'products', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[])
      `;
      console.log('✅ Bucket "products" created successfully in Supabase Storage!');
    } else {
      console.log('ℹ️ Bucket "products" already exists.');
    }

    // Add RLS policies for storage.objects
    await sql.unsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for products'
        ) THEN
          CREATE POLICY "Public Access for products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Uploads for products'
        ) THEN
          CREATE POLICY "Allow Uploads for products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Updates for products'
        ) THEN
          CREATE POLICY "Allow Updates for products" ON storage.objects FOR UPDATE USING (bucket_id = 'products');
        END IF;
      END $$;
    `);
    console.log('✅ Storage policies configured successfully!');
  } catch (e) {
    console.error('❌ Error setting up storage bucket:', e);
  } finally {
    await sql.end();
  }
}

setupBucket();
