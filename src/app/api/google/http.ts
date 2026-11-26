import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import {
  GOOGLE_OAUTH_FLOW_COOKIE,
  GOOGLE_SESSION_COOKIE,
  GOOGLE_SESSION_MAX_AGE_SECONDS
} from '@/lib/google-auth';

// Utilidades compartilhadas pelas rotas /api/google/*. Não é rota (não se chama route.ts).

export const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0'
};

export function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

export function redirect(request: NextRequest, pathWithQuery: string) {
  return NextResponse.redirect(new URL(pathWithQuery, request.nextUrl.origin), {
    status: 303,
    headers: NO_STORE_HEADERS
  });
}

export function hasValidOrigin(request: NextRequest): boolean {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;

  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

const secure = process.env.NODE_ENV === 'production';

export function setSessionCookie(response: NextResponse, value: string) {
  response.cookies.set(GOOGLE_SESSION_COOKIE, value, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: GOOGLE_SESSION_MAX_AGE_SECONDS
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(GOOGLE_SESSION_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

// O cookie do fluxo OAuth só precisa chegar ao callback.
const OAUTH_FLOW_COOKIE_PATH = '/api/google';

export function setOAuthFlowCookie(response: NextResponse, value: string, maxAge: number) {
  response.cookies.set(GOOGLE_OAUTH_FLOW_COOKIE, value, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: OAUTH_FLOW_COOKIE_PATH,
    maxAge
  });
}

export function clearOAuthFlowCookie(response: NextResponse) {
  response.cookies.set(GOOGLE_OAUTH_FLOW_COOKIE, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: OAUTH_FLOW_COOKIE_PATH,
    maxAge: 0
  });
}
