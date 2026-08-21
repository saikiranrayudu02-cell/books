import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const params = await context.params;
    const slug = params.slug;
    
    // Special handling based on old data.ts logic
    const querySlug = slug === 'pa-sa-lgo' ? 'pa-sa' : slug;

    const products = await sql`
      SELECT id, slug, name, bundle_title as "bundleTitle", books_included as "booksIncluded", 
             edition, short_description as "shortDescription", description, price, 
             image, images, category, exam_coverage as "examCoverage", features, 
             brand, badge, stock, languages
      FROM products
      WHERE slug = ${querySlug} OR id = ${querySlug}
      LIMIT 1
    `;

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: products[0] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
