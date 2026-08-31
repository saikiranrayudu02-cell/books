import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const sql = postgres(connectionString, { ssl: 'require' });

async function main() {
  try {
    console.log('Starting PA/SA (LGO)-2027 Guide product insertion...');

    // 1. Copy local image to public/images/products/
    const sourceImagePath = '/Users/maggi/.gemini/antigravity-ide/brain/c740162b-066a-48cf-9b9a-52011fbd77f5/.user_uploaded/media_1788199756561.jpg';
    const publicDestPath = path.join(process.cwd(), 'public', 'images', 'products', 'pasa-lgo-2027-guide-telugu.jpg');

    fs.mkdirSync(path.dirname(publicDestPath), { recursive: true });
    fs.copyFileSync(sourceImagePath, publicDestPath);
    console.log('Copied image to public/images/products/pasa-lgo-2027-guide-telugu.jpg');

    let imageUrl = '/images/products/pasa-lgo-2027-guide-telugu.jpg';

    // 2. Upload to Supabase Storage if available
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const fileBuffer = fs.readFileSync(sourceImagePath);
        const fileName = `pasa-lgo-2027-guide-telugu-${Date.now()}.jpg`;

        const { data, error } = await supabase.storage
          .from('products')
          .upload(fileName, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (error) {
          console.warn('Supabase Storage upload warning:', error.message);
        } else if (data) {
          const { data: publicUrlData } = supabase.storage
            .from('products')
            .getPublicUrl(data.path);
          
          if (publicUrlData?.publicUrl) {
            imageUrl = publicUrlData.publicUrl;
            console.log('Uploaded to Supabase Storage:', imageUrl);
          }
        }
      } catch (stErr) {
        console.warn('Supabase Storage upload skipped:', stErr);
      }
    }

    // 3. Prepare product details
    const productId = 'm25';
    const slug = 'pasa-lgo-2027-guide-telugu-medium';
    const name = 'PA/SA (LGO)-2027 Guide – Telugu Medium';
    const bundleTitle = 'Complete Exam-Oriented Preparation Guide by Tenali Exams Publishers';
    const booksIncluded = 1;
    const edition = 'First Edition';
    const shortDescription = 'Complete Exam-Oriented Preparation Guide for Postal Assistant / Sorting Assistant (LGO) Promotion Examination 2027 in Telugu Medium.';

    const description = `PA/SA (LGO)-2027 Guide is a comprehensive and exam-focused preparation book specially designed for aspirants preparing for the Postal Assistant / Sorting Assistant (LGO) Promotion Examination 2027.

Published by Tenali Exams Publishers, this guide is structured to help candidates understand the syllabus, strengthen their concepts, revise important rules and orders, and prepare confidently for the examination.

⭐ Key Features of the Book:
• 📚 Complete Syllabus Coverage: Covers all important subjects and topics required for PA/SA (LGO)-2027 examination preparation in a systematic manner.
• 📋 Latest Administrative Instructions & Orders: Includes relevant administrative instructions, departmental rules, orders, and updates required for exam preparation.
• 💡 Simple & Easy-to-Understand Language: Complex departmental concepts are explained in simple Telugu medium language.
• 🧠 Concept-Based Notes: Focuses on understanding concepts rather than rote memorization.
• 📊 Tables, Charts & Quick References: Organized information through tables and charts for faster revision.
• 🎯 Exam-Oriented Approach: Prepared with a focused approach highlighting competitive and promotion exam priorities.
• 👥 Useful for All Aspirants: Essential preparation companion for Postman, Mail Guard, and departmental staff aiming for promotion to PA/SA.

📖 Major Study Materials Covered:
- PO Guide – Part 1
- PO Guide – Part 2
- Foreign Postal Manual
- Volume 6 – Part 1
- Volume 6 – Part 3
- Volume 7
- IT Modernization
- POSB Orders
- Latest Administrative Instructions & Orders
- Important departmental concepts, rules, procedures, and exam-oriented topics

🎓 Why Choose This Guide?
Preparing for a departmental promotion examination requires clear concepts, organized notes, important rules, and quick revision points. The PA/SA (LGO)-2027 Guide brings together all essential materials into a single structured book.

🚀 Prepare Smart. Revise Better. Perform with Confidence.
Tenali Exams Publishers – Excellence in Every Page`;

    const price = 799.00;
    const category = 'study-materials';
    const examCoverage = 'PA/SA (LGO) 2027';
    const brand = 'Tenali Exams Publishers';
    const badge = 'Telugu Medium';
    const stock = 100;

    const badges = sql.json(['Telugu Medium', 'First Edition', 'PA/SA (LGO) 2027']);
    const features = sql.json([
      'Complete Syllabus Coverage for PA/SA (LGO)-2027 examination',
      'Latest Administrative Instructions & Orders included',
      'Simple & Easy-to-Understand Language in Telugu Medium',
      'Concept-Based Notes for strong foundational understanding',
      'Tables, Charts & Quick References for faster revision',
      'Exam-Oriented Approach designed specifically for promotion exams',
      'Covers PO Guide 1 & 2, Foreign Postal Manual, Volume 6 (Pt 1 & 3), Volume 7, IT Modernization & POSB Orders'
    ]);

    const tableOfContents = sql.json([
      {
        bookTitle: 'Major Study Materials Covered',
        chapters: [
          'PO Guide – Part 1',
          'PO Guide – Part 2',
          'Foreign Postal Manual',
          'Volume 6 – Part 1',
          'Volume 6 – Part 3',
          'Volume 7',
          'IT Modernization',
          'POSB Orders',
          'Latest Administrative Instructions & Orders',
          'Important Departmental Concepts, Rules & Procedures'
        ]
      }
    ]);

    const languages = sql.json([
      { code: 'te', name: 'Telugu', stock: 100 }
    ]);

    const images = sql.json([imageUrl]);

    // 4. Insert into database
    await sql`
      INSERT INTO products (
        id, slug, name, bundle_title, books_included, edition,
        short_description, description, price, image, images,
        category, exam_coverage, badges, features, table_of_contents,
        brand, badge, stock, languages
      ) VALUES (
        ${productId}, ${slug}, ${name}, ${bundleTitle}, ${booksIncluded}, ${edition},
        ${shortDescription}, ${description}, ${price}, ${imageUrl}, ${images},
        ${category}, ${examCoverage}, ${badges}, ${features}, ${tableOfContents},
        ${brand}, ${badge}, ${stock}, ${languages}
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        bundle_title = EXCLUDED.bundle_title,
        books_included = EXCLUDED.books_included,
        edition = EXCLUDED.edition,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        image = EXCLUDED.image,
        images = EXCLUDED.images,
        category = EXCLUDED.category,
        exam_coverage = EXCLUDED.exam_coverage,
        badges = EXCLUDED.badges,
        features = EXCLUDED.features,
        table_of_contents = EXCLUDED.table_of_contents,
        brand = EXCLUDED.brand,
        badge = EXCLUDED.badge,
        stock = EXCLUDED.stock,
        languages = EXCLUDED.languages,
        updated_at = NOW();
    `;

    console.log(`✅ Successfully added/updated product: ${name} (ID: ${productId}, Slug: ${slug})`);
    process.exit(0);
  } catch (err) {
    console.error('Error inserting product:', err);
    process.exit(1);
  }
}

main();
