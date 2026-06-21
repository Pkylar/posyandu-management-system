import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method || 'GET';
  
  // Only log API routes and page navigations (not static files)
  if (pathname && !pathname.startsWith('/_next') && 
      !pathname.startsWith('/favicon') &&
      !pathname.includes('.')) {
    
    const timestamp = new Date().toLocaleTimeString('id-ID');
    console.log(`🌐 [${timestamp}] ${method} ${pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
