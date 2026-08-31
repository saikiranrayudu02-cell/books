import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /auth/callback
 * Handles the OAuth redirect from Supabase/Google.
 * Exchanges the authorization code for a session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful auth — redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('Auth callback error:', error);
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
