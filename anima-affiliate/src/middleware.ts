import { NextResponse, type NextRequest } from 'next/server';
// Exposes the current path to server layouts (for the active menu item). No access decisions are made here.
export function middleware(req: NextRequest) {
  const h = new Headers(req.headers);
  h.set('x-pathname', req.nextUrl.pathname);
  return NextResponse.next({ request: { headers: h } });
}
export const config = { matcher: ['/dashboard/:path*', '/admin/:path*'] };
