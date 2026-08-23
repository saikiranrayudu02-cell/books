import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, phone } = body;

    if (!userId || !name) {
      return NextResponse.json({ success: false, error: 'User ID and Name are required' }, { status: 400 });
    }

    // Update the user profile in DB
    const updateResult = await sql`
      UPDATE users 
      SET 
        name = ${name}, 
        phone = ${phone || null},
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, name, email, role, phone, created_at, updated_at
    `;

    if (updateResult.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const updatedUser = updateResult[0];

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
