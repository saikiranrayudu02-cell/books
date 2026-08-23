import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const revalidate = 10; // Cache this endpoint for 10 seconds to avoid hitting DB constantly

export async function GET() {
  try {
    const result = await sql`SELECT value FROM settings WHERE key = 'maintenance_mode'`;
    const isMaintenance = result.length > 0 && result[0].value === 'true';
    
    return NextResponse.json({ maintenanceMode: isMaintenance }, { status: 200 });
  } catch (error) {
    // Fail open - if DB is down, assume no maintenance mode so site works if possible
    console.error('Error checking maintenance mode:', error);
    return NextResponse.json({ maintenanceMode: false }, { status: 200 });
  }
}
