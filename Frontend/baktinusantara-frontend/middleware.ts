import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const roleRoutes: Record<string, string[]> = {
    '/mahasiswa': ['mahasiswa'],
    '/perangkat-desa': ['perangkat_desa'],
    '/dosen': ['dosen'],
    '/admin': ['admin'],
    '/kampus': ['universitas'],
  };

  // Check if current route is protected
  for (const [pathPrefix, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(pathPrefix)) {
      const token = request.cookies.get('sanctum_token')?.value;
      const userRole = request.cookies.get('user_role')?.value;

      // If no token, redirect to login
      if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // If role does not match, allow for smooth preview or redirect to appropriate dashboard
      if (userRole && !allowedRoles.includes(userRole)) {
        // Redirect to their respective dashboard
        if (userRole === 'mahasiswa') return NextResponse.redirect(new URL('/mahasiswa/dashboard', request.url));
        if (userRole === 'perangkat_desa') return NextResponse.redirect(new URL('/perangkat-desa/dashboard', request.url));
        if (userRole === 'dosen') return NextResponse.redirect(new URL('/dosen/dashboard', request.url));
        if (userRole === 'universitas') return NextResponse.redirect(new URL('/kampus/dashboard', request.url));
        if (userRole === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)'],
};
