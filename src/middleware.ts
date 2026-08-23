import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define paths that should ALWAYS be accessible, even in maintenance mode
  // - /admin: Admin panel
  // - /api/admin: Admin APIs
  // - /login: So admins can log in to turn it off
  // - /api/auth: Auth endpoints
  // - /api/settings/maintenance: The endpoint we're calling below
  // - /maintenance: The actual maintenance page
  // - /_next, /favicon.ico, static assets (images, css)
  
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/settings/maintenance' ||
    pathname === '/maintenance' ||
    pathname.startsWith('/_next') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  try {
    // 2. Check the maintenance mode status using our cached API endpoint
    // Using absolute URL for fetch in middleware
    const baseUrl = request.nextUrl.origin;
    
    // We add cache: 'no-store' if we want to rely on the endpoint's own Next.js caching or Edge caching.
    // However, in Next.js middleware, fetch is not always fully cached like in server components.
    // It's safer to just fetch it. The route itself has revalidate = 10.
    const res = await fetch(`${baseUrl}/api/settings/maintenance`, {
      cache: 'no-store' // The route segment config `revalidate = 10` handles the caching.
    });
    
    if (res.ok) {
      const data = await res.json();
      
      // 3. If maintenance mode is ON, rewrite to the maintenance page
      if (data.maintenanceMode === true) {
        // Rewrite keeps the URL the same for the user, but shows the maintenance page
        return NextResponse.rewrite(new URL('/maintenance', request.url));
      }
    }
  } catch (error) {
    // If something goes wrong checking maintenance mode, fail OPEN (allow traffic)
    console.error('Middleware fetch error:', error);
  }

  // 4. Otherwise, continue normally
  return NextResponse.next();
}

// Ensure middleware runs on all paths to properly intercept
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) -> We handle API logic inside middleware if needed, but mostly we let them pass
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
