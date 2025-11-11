import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) { //"request: NextRequest" is saying that request is of type "NextRequest" and is typescript
  const path = request.nextUrl.pathname; // nextUrl and pathName are properties of NextRequest. This line gets the current path from the request URL such as /login or /profile
  const isPublicPath = path === '/login' || path === '/signup' || path === '/verifyemail'; // If the url path ends in login, signup, or verifyemail then it is available to the public

  const token = request.cookies.get('token')?.value || '' // Get the token from cookies. If no token, set to empty string
  
  // If user is trying to access a public path (login or signup) and they have a token, redirect to home page
  if(isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl)); //We create a new url because NextResponse.redirect requires a URL object. URL takes two arguments: the first is the path to redirect to, and the second is the base URL (request.nextUrl provides the full URL of the incoming request)
  }

  // If user is trying to access a protected path (not login or signup) and they don't have a token, redirect to login page
  if(!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }
}

// Specify the paths that the middleware should run on. Next.js expect a config object with a matcher property
export const config = {
  matcher: [
    '/',
    '/profile',
    '/profile/:path*',
    '/login',
    '/signup',
    '/verifyemail',
    '/userDetails',
    '/mealPlan'
  ]
}