import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * POST /api/auth/sync
 * Syncs a Supabase Auth user to the app's `users` table.
 * Called from AuthContext after Supabase sign-in (especially Google OAuth).
 */
export async function POST(request: Request) {
  try {
    const { id, name, email, image } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id, name, email, phone, role FROM users WHERE id = ${id} LIMIT 1
    `;

    if (existingUsers.length > 0) {
      // User exists — update image if provided, return existing user
      if (image) {
        await sql`UPDATE users SET image = ${image}, updated_at = NOW() WHERE id = ${id}`;
      }
      return NextResponse.json({ user: existingUsers[0] }, { status: 200 });
    }

    // Check if a user with this email already exists (migrated from old auth)
    if (email) {
      const emailUsers = await sql`
        SELECT id, name, email, phone, role FROM users WHERE LOWER(email) = ${email.toLowerCase()} LIMIT 1
      `;

      if (emailUsers.length > 0) {
        // Update the existing user's ID to the Supabase Auth ID
        await sql`
          UPDATE users SET id = ${id}, image = ${image || null}, updated_at = NOW() 
          WHERE LOWER(email) = ${email.toLowerCase()}
        `;
        const updatedUser = { ...emailUsers[0], id };
        return NextResponse.json({ user: updatedUser }, { status: 200 });
      }
    }

    // Create new user
    const result = await sql`
      INSERT INTO users (id, name, email, image, role)
      VALUES (${id}, ${name || 'User'}, ${email || ''}, ${image || null}, 'customer')
      RETURNING id, name, email, phone, role
    `;

    return NextResponse.json({ user: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
