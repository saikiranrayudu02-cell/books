import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const productId = params.id;
    const body = await request.json();
    const { name, price, stockEn, stockTe, stockHi, description, image, category, bundleTitle, booksIncluded, badge } = body;

    const en = parseInt(stockEn) !== undefined && !isNaN(parseInt(stockEn)) ? parseInt(stockEn) : null;
    const te = parseInt(stockTe) !== undefined && !isNaN(parseInt(stockTe)) ? parseInt(stockTe) : null;
    const hi = parseInt(stockHi) !== undefined && !isNaN(parseInt(stockHi)) ? parseInt(stockHi) : null;

    let languagesArr = null;
    let totalStock = null;
    if (en !== null && te !== null && hi !== null) {
      totalStock = en + te + hi;
      languagesArr = [
        { code: 'en', name: 'English', stock: en },
        { code: 'te', name: 'Telugu', stock: te },
        { code: 'hi', name: 'Hindi', stock: hi }
      ];
    }

    const result = await sql`
      UPDATE products
      SET 
        name = COALESCE(${name}, name),
        price = COALESCE(${price}, price),
        stock = COALESCE(${totalStock}, stock),
        description = COALESCE(${description}, description),
        image = COALESCE(${image}, image),
        category = COALESCE(${category}, category),
        bundle_title = COALESCE(${bundleTitle}, bundle_title),
        books_included = COALESCE(${booksIncluded}, books_included),
        badge = COALESCE(${badge}, badge),
        languages = COALESCE(${languagesArr ? sql.json(languagesArr) : null}, languages),
        updated_at = NOW()
      WHERE id = ${productId}
      RETURNING id, name, stock
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: result[0] }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const productId = params.id;

    const result = await sql`
      DELETE FROM products WHERE id = ${productId} RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
