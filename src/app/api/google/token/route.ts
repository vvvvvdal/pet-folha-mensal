import { NextRequest } from 'next/server';
import {
  GOOGLE_SESSION_COOKIE,
  isGoogleAuthConfigured,
  openSession,
  refreshAccessToken,
  sealSession
} from '@/lib/google-auth';
import { clearSessionCookie, hasValidOrigin, json, setSessionCookie } from '../http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!hasValidOrigin(request)) {
    return json({ error: 'Origem da requisição não permitida.' }, 403);
  }

  if (!isGoogleAuthConfigured()) {
    return json({ error: 'Login com Google não configurado no servidor.' }, 503);
  }

  const session = openSession(request.cookies.get(GOOGLE_SESSION_COOKIE)?.value);
  if (!session) {
    const response = json({ error: 'Entre com o Google para continuar.', reconnect: true }, 401);
    if (request.cookies.has(GOOGLE_SESSION_COOKIE)) clearSessionCookie(response);
    return response;
  }

  const result = await refreshAccessToken(session.refreshToken);

  if (!result.ok && result.reason === 'invalid_grant') {
    const response = json({ error: 'O acesso ao Google expirou. Entre de novo.', reconnect: true }, 401);
    clearSessionCookie(response);
    return response;
  }

  if (!result.ok) {
    return json({ error: 'Google indisponível no momento. Tente de novo.' }, 502);
  }

  const response = json({ accessToken: result.accessToken, expiresAt: result.expiresAt });

  // Renova o prazo de 180 dias a cada uso, para quem usa o app com frequência.
  const resealed = sealSession(session);
  if (resealed) setSessionCookie(response, resealed);

  return response;
}
