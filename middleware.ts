import { NextRequest, NextResponse } from 'next/server';

export function middleware(request:NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/') && !['GET','HEAD','OPTIONS'].includes(request.method)) {
    const origin=request.headers.get('origin');
    const allowed=new URL(process.env.APP_URL ?? request.nextUrl.origin).origin;
    if(origin && origin!==allowed) return NextResponse.json({error:'Cross-origin mutation rejected',code:'INVALID_ORIGIN'},{status:403});
  }
  const response=NextResponse.next();
  response.headers.set('X-Content-Type-Options','nosniff');
  response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy',"default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  return response;
}

export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
