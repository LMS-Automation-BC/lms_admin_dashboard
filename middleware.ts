import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const authCookie = req.cookies.get('auth')?.value === 'true';
  const nextAuthToken = process.env.NEXTAUTH_SECRET
    ? await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    : null;
  const isLoggedIn = authCookie || !!nextAuthToken;

  const isLoginPage = req.nextUrl.pathname === '/login';

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dborganization', req.url));
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
