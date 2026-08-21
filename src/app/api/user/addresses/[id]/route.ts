import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const addressId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!addressId || !userId) {
      return NextResponse.json({ error: 'Address ID and User ID are required' }, { status: 400 });
    }

    await sql`
      DELETE FROM user_addresses
      WHERE id = ${addressId} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
