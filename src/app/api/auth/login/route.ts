import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and password are required' },
        { status: 400 }
      );
    }

    let searchEmail = identifier.trim().toLowerCase();
    // Fix common gamil.com typo
    if (searchEmail.endsWith('@gamil.com')) {
      searchEmail = searchEmail.replace('@gamil.com', '@gmail.com');
    }

    const searchUsername = identifier.trim();

    // Fetch user by email, name, or username suffix
    const users = await sql`
      SELECT id, name, email, phone, role, password_hash
      FROM users
      WHERE LOWER(email) = ${searchEmail} 
         OR LOWER(name) = ${searchUsername.toLowerCase()} 
         OR LOWER(email) = ${searchUsername + '@gmail.com'}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'the username or password is incorrect please enter the correct username and password to access your profile' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    if (!user.password_hash) {
       return NextResponse.json(
        { error: 'the username or password is incorrect please enter the correct username and password to access your profile' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { error: 'the username or password is incorrect please enter the correct username and password to access your profile' },
        { status: 401 }
      );
    }

    // Remove password hash from response
    delete user.password_hash;

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
