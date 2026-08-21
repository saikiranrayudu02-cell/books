import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateOrderId } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      items,
      subtotal,
      deliveryCharge = 0,
      total,
      deliveryAddress,
      paymentMethod = 'Online / UPI',
    } = body;

    if (!items || !items.length || !deliveryAddress) {
      return NextResponse.json({ success: false, error: 'Items and delivery address are required' }, { status: 400 });
    }

    // Generate unique order ID
    const orderId = generateOrderId();

    // 1. Insert order into Neon DB
    const orderResult = await sql`
      INSERT INTO orders (
        order_number, user_id, subtotal, delivery_charge, total,
        delivery_address, status, payment_status, carrier
      ) VALUES (
        ${orderId},
        ${userId || null},
        ${subtotal},
        ${deliveryCharge},
        ${total},
        ${JSON.stringify(deliveryAddress)}::jsonb,
        'placed',
        'paid',
        'India Post Speed Post'
      ) RETURNING id
    `;
    const dbOrderId = orderResult[0].id;

    // 2. Insert items into order_items table and decrement product stock
    for (const item of items) {
      const productId = item.productId || item.id;
      const quantity = item.quantity || 1;

      await sql`
        INSERT INTO order_items (
           order_id, product_id, product_name, product_slug,
          product_image, price, language, quantity, bundle_title, books_included
        ) VALUES (
          ${dbOrderId},
          ${productId},
          ${item.productName || item.name},
          ${item.productSlug || item.slug || 'mts-postman-mg'},
          ${item.productImage || item.image || '/images/book-mts-postman.jpg'},
          ${item.price},
          ${item.language || 'English'},
          ${quantity},
          ${item.bundleTitle || null},
          ${item.booksIncluded || 2}
        )
      `;

      // Decrement the stock in products table
      await sql`
        UPDATE products
        SET stock = GREATEST(0, stock - ${quantity})
        WHERE id = ${productId}
      `;
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order created successfully in database',
    });
  } catch (error: any) {
    console.error('Error creating order in DB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
