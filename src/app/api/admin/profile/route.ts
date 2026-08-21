import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
  try {
    const { userId, name, email, phone, currentPassword, newPassword } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Verify user is admin
    const adminCheck = await sql`SELECT * FROM users WHERE id = ${userId} AND role = 'admin'`;
    if (adminCheck.length === 0) {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const admin = adminCheck[0];

    // 2. If password change requested, verify old password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      if (!admin.password_hash) {
        return NextResponse.json({ error: 'Admin account has no password set. Contact support.' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);

      await sql`
        UPDATE users SET 
          name = COALESCE(${name}, name),
          email = COALESCE(${email}, email),
          phone = COALESCE(${phone}, phone),
          password_hash = ${hash},
          updated_at = NOW()
        WHERE id = ${userId}
      `;
    } else {
      // 3. Just update profile details
      await sql`
        UPDATE users SET 
          name = COALESCE(${name}, name),
          email = COALESCE(${email}, email),
          phone = COALESCE(${phone}, phone),
          updated_at = NOW()
        WHERE id = ${userId}
      `;
    }

    // Return updated user data (excluding password)
    const updatedUser = await sql`
      SELECT id, name, email, phone, role FROM users WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true, user: updatedUser[0] }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    if (error.code === '23505') { // Postgres unique violation
      return NextResponse.json({ error: 'Email or phone number already in use' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
