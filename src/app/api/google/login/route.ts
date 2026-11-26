import { NextRequest, NextResponse } from 'next/server';
import {
  GOOGLE_OAUTH_FLOW_MAX_AGE_SECONDS,
  GOOGLE_SESSION_COOKIE,
  buildAuthorizationUrl,
  createOAuthFlow,
  openSession,
  sealOAuthFlow
} from '@/lib/google-auth';
import { NO_STORE_HEADERS, redirect, setOAuthFlowCookie } from '../http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Sem sessão válida, pede consentimento para o Google devolver o refresh token.
  // Com sessão, só escolhe a conta; o callback reaproveita o refresh token se for a mesma.
  const forcedConsent =
    request.nextUrl.searchParams.get('prompt') === 'consent' ||
    !openSession(request.cookies.get(GOOGLE_SESSION_COOKIE)?.value);

  const redirectUri = new URL('/api/google/callback', request.nextUrl.origin).toString();
  const flow = createOAuthFlow(redirectUri, forcedConsent);
  const authorizationUrl = buildAuthorizationUrl(flow, forcedConsent ? 'consent' : 'select_account');
  const sealedFlow = sealOAuthFlow(flow);

  if (!authorizationUrl || !sealedFlow) {
    return redirect(request, '/?login=erro&motivo=configuracao');
  }

  const response = NextResponse.redirect(authorizationUrl, { status: 303, headers: NO_STORE_HEADERS });
  setOAuthFlowCookie(response, sealedFlow, GOOGLE_OAUTH_FLOW_MAX_AGE_SECONDS);
  return response;
}
