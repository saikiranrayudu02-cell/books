import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const addresses = await sql`
      SELECT id, full_name as "fullName", mobile, email, house_or_flat as "houseOrFlat",
             street, area, city, state, pin_code as "pinCode", is_default as "isDefault"
      FROM user_addresses
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;

    return NextResponse.json({ addresses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      fullName,
      mobile,
      email,
      houseOrFlat,
      street,
      area,
      city,
      state,
      pinCode,
      isDefault = false
    } = body;

    if (!userId || !fullName || !mobile || !pinCode) {
       return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    if (isDefault) {
      await sql`UPDATE user_addresses SET is_default = false WHERE user_id = ${userId}`;
    }

    const result = await sql`
      INSERT INTO user_addresses (
        user_id, full_name, mobile, email, house_or_flat, street, area, city, state, pin_code, is_default
      ) VALUES (
        ${userId}, ${fullName}, ${mobile}, ${email || null}, ${houseOrFlat}, ${street}, ${area || null},
        ${city}, ${state}, ${pinCode}, ${isDefault}
      )
      RETURNING id, full_name as "fullName", mobile, email, house_or_flat as "houseOrFlat",
                street, area, city, state, pin_code as "pinCode", is_default as "isDefault"
    `;

    return NextResponse.json({ success: true, address: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error saving user address:', error);
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
  }
}
