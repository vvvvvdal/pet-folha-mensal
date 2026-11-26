import { NextRequest } from 'next/server';
import { GOOGLE_SESSION_COOKIE, openSession, revokeToken } from '@/lib/google-auth';
import { clearSessionCookie, hasValidOrigin, json } from '../http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!hasValidOrigin(request)) {
    return json({ error: 'Origem da requisição não permitida.' }, 403);
  }

  const session = openSession(request.cookies.get(GOOGLE_SESSION_COOKIE)?.value);
  const revoked = session ? await revokeToken(session.refreshToken) : false;

  const response = json({ authenticated: false, revoked });
  clearSessionCookie(response);
  return response;
}
