import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const authToken = request.cookies.get('auth-token');
    const { pathname } = request.nextUrl;

    // Protect all routes except /login (and what's excluded in the matcher)
    const isPublicRoute = pathname === '/login';

    if (!isPublicRoute && !authToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Redirect to dashboard if logged in and trying to access login
    if (pathname === '/login' && authToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|img.jpg).*)',
    ],
};
