import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const orders = await sql`
      SELECT o.id, o.order_number as "orderNumber", o.total, o.status, o.payment_status as "paymentStatus", o.created_at as "createdAt", o.delivery_address as "deliveryAddress", u.name as "userName", u.email as "userEmail"
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
