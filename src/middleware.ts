import { NextRequest, NextResponse } from 'next/server';

// This array contains paths that are publicly accessible
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// This function checks if the request is for a public path
function isPublicPath(path: string): boolean {
  return publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // If path is not public, check for authentication
  if (!isPublicPath(pathname)) {
    // Check for access token in cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    
    // If no access token, redirect to login
    if (!accessToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Continue to the requested page
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}; 