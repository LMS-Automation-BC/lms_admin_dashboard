import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get('auth')?.value === 'true';

  const isLoginPage = req.nextUrl.pathname === '/login';

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/attendance', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/attendance/:path*',
    '/grades/:path*',
    '/programs/:path*',
    '/organization/:path*',
  ],
};
