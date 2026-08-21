import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const items = await sql`
      SELECT w.id, w.product_id as "productId", p.name as "productName", p.slug as "productSlug",
             p.image as "productImage", p.price, p.badge, w.added_at as "addedAt"
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ${userId}
    `;

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, productId } = await request.json();
    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO wishlist_items (
        user_id, product_id
      ) VALUES (
        ${userId}, ${productId}
      )
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING id, product_id as "productId", added_at as "addedAt"
    `;

    return NextResponse.json({ success: true, item: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
    }

    await sql`
      DELETE FROM wishlist_items
      WHERE user_id = ${userId} AND product_id = ${productId}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
