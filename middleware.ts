import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Disable logging untuk performa lebih cepat
  // Uncomment line bawah kalau mau enable logging
  
  /*
  const { pathname } = request.nextUrl;
  const method = request.method || 'GET';
  
  if (pathname && !pathname.startsWith('/_next') && 
      !pathname.startsWith('/favicon') &&
      !pathname.includes('.') &&
      (pathname.startsWith('/api/') || 
       pathname.includes('/balita') || 
       pathname.includes('/penimbangan') ||
       pathname.includes('/vitamin-vaksin') ||
       pathname.includes('/dashboard'))) {
    
    const timestamp = new Date().toLocaleTimeString('id-ID');
    console.log(`🌐 [${timestamp}] ${method} ${pathname}`);
  }
  */

  return NextResponse.next();
}

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
}