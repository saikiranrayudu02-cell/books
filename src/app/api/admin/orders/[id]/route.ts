import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const orderId = params.id;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    const result = isUUID
      ? await sql`
        UPDATE orders
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${orderId}::uuid OR order_number = ${orderId}
        RETURNING id, status
      `
      : await sql`
        UPDATE orders
        SET status = ${status}, updated_at = NOW()
        WHERE order_number = ${orderId}
        RETURNING id, status
      `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: result[0] }, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
