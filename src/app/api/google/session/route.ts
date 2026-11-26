import { NextRequest } from 'next/server';
import { GOOGLE_SESSION_COOKIE, isGoogleAuthConfigured, openSession } from '@/lib/google-auth';
import { json } from '../http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const configured = isGoogleAuthConfigured();
  const session = configured ? openSession(request.cookies.get(GOOGLE_SESSION_COOKIE)?.value) : null;

  return json({
    configured,
    authenticated: session !== null,
    email: session?.email ?? null,
    name: session?.name ?? null,
    sub: session?.sub ?? null
  });
}
