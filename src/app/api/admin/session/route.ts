import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  isAdminAuthConfigured,
  verifyAdminPin,
  verifyAdminSession
} from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0'
};

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

function hasValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const configured = isAdminAuthConfigured();
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  return json({
    configured,
    authenticated: configured && verifyAdminSession(token)
  });
}

export async function POST(request: NextRequest) {
  if (!hasValidOrigin(request)) {
    return json({ error: 'Origem da requisição não permitida.' }, 403);
  }

  if (!isAdminAuthConfigured()) {
    return json({ error: 'Bloqueio do painel não configurado no servidor.' }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Requisição inválida.' }, 400);
  }

  const pin =
    typeof body === 'object' && body !== null && 'pin' in body && typeof body.pin === 'string'
      ? body.pin
      : '';

  if (!verifyAdminPin(pin)) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return json({ error: 'Credencial inválida.' }, 401);
  }

  const session = createAdminSession();
  if (!session) {
    return json({ error: 'Bloqueio do painel não configurado no servidor.' }, 503);
  }

  const response = json({ authenticated: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: session.maxAge
  });

  return response;
}

export async function DELETE(request: NextRequest) {
  if (!hasValidOrigin(request)) {
    return json({ error: 'Origem da requisição não permitida.' }, 403);
  }

  const response = json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });

  return response;
}
