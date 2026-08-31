import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define paths that should ALWAYS be accessible, even in maintenance mode
  // - /admin: Admin panel
  // - /api/admin: Admin APIs
  // - /login: So admins can log in to turn it off
  // - /api/auth: Auth endpoints
  // - /auth/callback: Supabase OAuth callback
  // - /api/settings/maintenance: The endpoint we're calling below
  // - /maintenance: The actual maintenance page
  // - /_next, /favicon.ico, static assets (images, css)
  
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth/callback') ||
    pathname === '/api/settings/maintenance' ||
    pathname === '/maintenance' ||
    pathname.startsWith('/_next') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    // Still refresh Supabase session on these routes
    return await updateSession(request);
  }

  try {
    // 2. Check the maintenance mode status using our cached API endpoint
    const baseUrl = request.nextUrl.origin;
    
    const res = await fetch(`${baseUrl}/api/settings/maintenance`, {
      cache: 'no-store'
    });
    
    if (res.ok) {
      const data = await res.json();
      
      // 3. If maintenance mode is ON, rewrite to the maintenance page
      if (data.maintenanceMode === true) {
        return NextResponse.rewrite(new URL('/maintenance', request.url));
      }
    }
  } catch (error) {
    // If something goes wrong checking maintenance mode, fail OPEN (allow traffic)
    console.error('Middleware fetch error:', error);
  }

  // 4. Refresh Supabase auth session and continue normally
  return await updateSession(request);
}

// Ensure middleware runs on all paths to properly intercept
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
