import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow public routes and API routes
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/api/auth', '/learn', '/leaderboard', '/games'];
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Allow public routes to pass through
  if (isPublicRoute) {
    const res = NextResponse.next();
    // Debug header to help verify cookie visibility on public routes too
    res.headers.set('x-auth-session', request.cookies.get('session') ? 'present' : 'absent');
    return res;
  }

  // For protected routes, check if user has session cookie
  const sessionCookie = request.cookies.get('session');
  
  if (!sessionCookie) {
    // Redirect to login if no session
    const loginUrl = new URL('/login', request.url);
    // Preserve where the user was going for better UX and debugging
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const res = NextResponse.next();
  // Lightweight debug header to confirm middleware sees the cookie
  res.headers.set('x-auth-session', 'present');
  return res;
}

export const config = {
  matcher: [
    // Exclude common static assets including json/mp3/wav so training/tournament assets aren't gated by auth
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json|mp3|wav)).*)',
    '/(api|trpc)(.*)'
  ],
};
