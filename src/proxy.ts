import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/candidate/test')) {
    const ready = req.cookies.get('swipe_ready')?.value === '1';
    if (!ready) {
      const back = new URL('/candidate', req.url);
      back.searchParams.set('detail', 'required');
      return NextResponse.redirect(back);
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ['/candidate/test'] };
