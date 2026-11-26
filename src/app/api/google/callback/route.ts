import { NextRequest } from 'next/server';
import {
  GOOGLE_DRIVE_FILE_SCOPE,
  GOOGLE_OAUTH_FLOW_COOKIE,
  GOOGLE_SESSION_COOKIE,
  exchangeAuthorizationCode,
  isGoogleAuthConfigured,
  openOAuthFlow,
  openSession,
  safeEqual,
  sealSession,
  verifyIdToken
} from '@/lib/google-auth';
import { clearOAuthFlowCookie, redirect, setSessionCookie } from '../http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type FailureReason = 'configuracao' | 'negado' | 'estado' | 'troca' | 'permissao';

function fail(request: NextRequest, reason: FailureReason) {
  const response = redirect(request, `/?login=erro&motivo=${reason}`);
  clearOAuthFlowCookie(response);
  return response;
}

export async function GET(request: NextRequest) {
  if (!isGoogleAuthConfigured()) return fail(request, 'configuracao');

  const params = request.nextUrl.searchParams;
  const flow = openOAuthFlow(request.cookies.get(GOOGLE_OAUTH_FLOW_COOKIE)?.value);
  const state = params.get('state') ?? '';

  if (!flow || !state || !safeEqual(state, flow.state)) return fail(request, 'estado');
  if (params.get('error')) return fail(request, 'negado');

  const code = params.get('code');
  if (!code) return fail(request, 'troca');

  const tokens = await exchangeAuthorizationCode(code, flow);
  if (!tokens?.idToken) return fail(request, 'troca');

  const identity = verifyIdToken(tokens.idToken, flow.nonce);
  if (!identity) return fail(request, 'troca');

  // Na tela de consentimento a pessoa pode desmarcar o Drive.
  if (!tokens.scopes.includes(GOOGLE_DRIVE_FILE_SCOPE)) return fail(request, 'permissao');

  let refreshToken = tokens.refreshToken;
  if (!refreshToken) {
    // Novo login sem consentimento: reaproveita o refresh token da mesma conta.
    const previous = openSession(request.cookies.get(GOOGLE_SESSION_COOKIE)?.value);
    if (previous && previous.sub === identity.sub) {
      refreshToken = previous.refreshToken;
    } else if (!flow.forcedConsent) {
      const response = redirect(request, '/api/google/login?prompt=consent');
      clearOAuthFlowCookie(response);
      return response;
    } else {
      return fail(request, 'troca');
    }
  }

  const sealed = sealSession({ refreshToken, ...identity });
  if (!sealed) return fail(request, 'configuracao');

  const response = redirect(request, '/');
  clearOAuthFlowCookie(response);
  setSessionCookie(response, sealed);
  return response;
}
