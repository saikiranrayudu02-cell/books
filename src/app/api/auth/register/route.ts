import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required' },
        { status: 400 }
      );
    }

    // Basic email validation, otherwise treat as username/name or fail if required
    const isEmail = identifier.includes('@');
    const email = isEmail ? identifier : `${identifier}@example.com`; // Fallback for pure username
    const finalName = name || identifier.split('@')[0];

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${finalName}, ${email}, ${passwordHash}, 'customer')
      RETURNING id, name, email, phone, role
    `;

    const user = result[0];

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
