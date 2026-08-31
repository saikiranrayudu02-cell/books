import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * POST /api/auth/sync
 * High-performance sync of Supabase Auth user (e.g. Google OAuth) to `users` table.
 */
export async function POST(request: Request) {
  try {
    const { id, name, email, image } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanName = (name || 'User').trim();

    // 1. Fast check by primary key ID
    const existing = await sql`
      SELECT id, name, email, phone, role FROM users WHERE id = ${id} LIMIT 1
    `;

    if (existing.length > 0) {
      if (image) {
        // Asynchronously update avatar without delaying response
        sql`UPDATE users SET image = ${image}, updated_at = NOW() WHERE id = ${id}`.catch(console.error);
      }
      return NextResponse.json({ user: existing[0] }, { status: 200 });
    }

    // 2. Fast check by Email (migrated users)
    if (cleanEmail) {
      const byEmail = await sql`
        SELECT id, name, email, phone, role FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1
      `;
      if (byEmail.length > 0) {
        await sql`
          UPDATE users 
          SET id = ${id}, image = COALESCE(${image || null}, image), updated_at = NOW()
          WHERE LOWER(email) = ${cleanEmail}
        `;
        return NextResponse.json({ user: { ...byEmail[0], id } }, { status: 200 });
      }
    }

    // 3. Create new user row
    const inserted = await sql`
      INSERT INTO users (id, name, email, image, role)
      VALUES (${id}, ${cleanName}, ${cleanEmail}, ${image || null}, 'customer')
      ON CONFLICT (id) DO UPDATE SET image = COALESCE(EXCLUDED.image, users.image)
      RETURNING id, name, email, phone, role
    `;

    return NextResponse.json({ user: inserted[0] }, { status: 201 });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
