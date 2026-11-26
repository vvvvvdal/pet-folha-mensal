import 'server-only';

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  hkdfSync,
  randomBytes,
  timingSafeEqual
} from 'node:crypto';

// Login com Google sem banco de dados: o refresh token fica criptografado
// (AES-256-GCM) num cookie HttpOnly do próprio navegador. O servidor só troca
// esse cookie por access tokens curtos; o envio ao Drive sai do navegador.

export const GOOGLE_SESSION_COOKIE = 'pet_google';
export const GOOGLE_OAUTH_FLOW_COOKIE = 'pet_google_oauth';

export const GOOGLE_SESSION_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
export const GOOGLE_OAUTH_FLOW_MAX_AGE_SECONDS = 10 * 60;

export const GOOGLE_DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const GOOGLE_SCOPES = ['openid', 'email', 'profile', GOOGLE_DRIVE_FILE_SCOPE] as const;

const AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);

const MIN_SESSION_SECRET_BYTES = 32;
const TOKEN_FORMAT_VERSION = 'v1';
const PAYLOAD_VERSION = 1;
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;
const CLOCK_SKEW_SECONDS = 60;
const GOOGLE_REQUEST_TIMEOUT_MS = 10_000;

type SealPurpose = 'session' | 'oauth-flow';

export interface GoogleSession {
  refreshToken: string;
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleOAuthFlow {
  state: string;
  codeVerifier: string;
  nonce: string;
  redirectUri: string;
  forcedConsent: boolean;
}

export interface GoogleIdentity {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleTokenResponse {
  accessToken: string;
  expiresAt: number;
  refreshToken: string | null;
  idToken: string | null;
  scopes: string[];
}

export type GoogleRefreshResult =
  | { ok: true; accessToken: string; expiresAt: number }
  | { ok: false; reason: 'invalid_grant' | 'unavailable' };

interface GoogleConfiguration {
  clientId: string;
  clientSecret: string;
}

// ---------------------------------------------------------------------------
// Configuração (falha fechada: sem env completa, nada funciona)
// ---------------------------------------------------------------------------

function getSessionSecret(): string | null {
  const secret = process.env.GOOGLE_SESSION_SECRET?.trim();
  if (!secret || Buffer.byteLength(secret, 'utf8') < MIN_SESSION_SECRET_BYTES) return null;
  return secret;
}

function getConfiguration(): GoogleConfiguration | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret || !getSessionSecret()) return null;
  return { clientId, clientSecret };
}

export function isGoogleAuthConfigured(): boolean {
  return getConfiguration() !== null;
}

export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

// ---------------------------------------------------------------------------
// Selagem AES-256-GCM: v1.<iv>.<ciphertext>.<tag> (base64url)
// ---------------------------------------------------------------------------

function deriveKey(secret: string, purpose: SealPurpose): Buffer {
  return Buffer.from(
    hkdfSync('sha256', secret, 'pet-folha-google', `pet-folha:${purpose}:${TOKEN_FORMAT_VERSION}`, 32)
  );
}

function additionalData(purpose: SealPurpose): Buffer {
  return Buffer.from(`pet-folha:${purpose}:${TOKEN_FORMAT_VERSION}`, 'utf8');
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function seal(purpose: SealPurpose, data: unknown, maxAgeSeconds: number): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const issuedAt = nowSeconds();
  const plaintext = Buffer.from(
    JSON.stringify({ v: PAYLOAD_VERSION, iat: issuedAt, exp: issuedAt + maxAgeSeconds, data }),
    'utf8'
  );

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret, purpose), iv, {
    authTagLength: AUTH_TAG_BYTES
  });
  cipher.setAAD(additionalData(purpose));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    TOKEN_FORMAT_VERSION,
    iv.toString('base64url'),
    ciphertext.toString('base64url'),
    tag.toString('base64url')
  ].join('.');
}

function open(purpose: SealPurpose, token: string | undefined | null): unknown {
  const secret = getSessionSecret();
  if (!secret || !token || token.length > 4096) return null;

  const [version, ivValue, ciphertextValue, tagValue, ...extra] = token.split('.');
  if (version !== TOKEN_FORMAT_VERSION || !ivValue || !ciphertextValue || !tagValue) return null;
  if (extra.length > 0) return null;

  const iv = Buffer.from(ivValue, 'base64url');
  const ciphertext = Buffer.from(ciphertextValue, 'base64url');
  const tag = Buffer.from(tagValue, 'base64url');
  if (iv.length !== IV_BYTES || tag.length !== AUTH_TAG_BYTES || ciphertext.length === 0) {
    return null;
  }

  let parsed: unknown;
  try {
    const decipher = createDecipheriv('aes-256-gcm', deriveKey(secret, purpose), iv, {
      authTagLength: AUTH_TAG_BYTES
    });
    decipher.setAAD(additionalData(purpose));
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    parsed = JSON.parse(plaintext.toString('utf8'));
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const payload = parsed as { v?: unknown; exp?: unknown; data?: unknown };
  if (payload.v !== PAYLOAD_VERSION) return null;
  if (typeof payload.exp !== 'number' || !Number.isSafeInteger(payload.exp)) return null;
  if (payload.exp <= nowSeconds()) return null;

  return payload.data;
}

function isNonEmptyString(value: unknown, maxLength = 2048): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function googlePicture(value: unknown): string | undefined {
  if (!isNonEmptyString(value, 1024)) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      /^lh\d+\.googleusercontent\.com$/.test(url.hostname)) return url.href;
  } catch {
    return undefined;
  }
}

function isGoogleSession(value: unknown): value is GoogleSession {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Record<string, unknown>;
  return (
    isNonEmptyString(session.refreshToken) &&
    isNonEmptyString(session.sub, 255) &&
    typeof session.email === 'string' &&
    typeof session.name === 'string' &&
    (session.picture === undefined || googlePicture(session.picture) !== undefined)
  );
}

function isGoogleOAuthFlow(value: unknown): value is GoogleOAuthFlow {
  if (typeof value !== 'object' || value === null) return false;
  const flow = value as Record<string, unknown>;
  return (
    isNonEmptyString(flow.state, 128) &&
    isNonEmptyString(flow.codeVerifier, 128) &&
    isNonEmptyString(flow.nonce, 128) &&
    isNonEmptyString(flow.redirectUri) &&
    typeof flow.forcedConsent === 'boolean'
  );
}

export function sealSession(session: GoogleSession): string | null {
  return seal('session', session, GOOGLE_SESSION_MAX_AGE_SECONDS);
}

export function openSession(token: string | undefined | null): GoogleSession | null {
  const data = open('session', token);
  return isGoogleSession(data) ? data : null;
}

export function sealOAuthFlow(flow: GoogleOAuthFlow): string | null {
  return seal('oauth-flow', flow, GOOGLE_OAUTH_FLOW_MAX_AGE_SECONDS);
}

export function openOAuthFlow(token: string | undefined | null): GoogleOAuthFlow | null {
  const data = open('oauth-flow', token);
  return isGoogleOAuthFlow(data) ? data : null;
}

// ---------------------------------------------------------------------------
// PKCE, state e nonce
// ---------------------------------------------------------------------------

function randomToken(): string {
  return randomBytes(32).toString('base64url');
}

export function createCodeChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier, 'ascii').digest('base64url');
}

export function createOAuthFlow(redirectUri: string, forcedConsent: boolean): GoogleOAuthFlow {
  return {
    state: randomToken(),
    codeVerifier: randomToken(),
    nonce: randomToken(),
    redirectUri,
    forcedConsent
  };
}

export function buildAuthorizationUrl(
  flow: GoogleOAuthFlow,
  prompt: 'consent' | 'select_account'
): string | null {
  const configuration = getConfiguration();
  if (!configuration) return null;

  const url = new URL(AUTHORIZATION_ENDPOINT);
  url.search = new URLSearchParams({
    client_id: configuration.clientId,
    redirect_uri: flow.redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    access_type: 'offline',
    prompt,
    state: flow.state,
    nonce: flow.nonce,
    code_challenge: createCodeChallenge(flow.codeVerifier),
    code_challenge_method: 'S256'
  }).toString();

  return url.toString();
}

// ---------------------------------------------------------------------------
// Chamadas ao Google (troca de código, renovação, revogação)
// ---------------------------------------------------------------------------

async function postForm(url: string, body: Record<string, string>): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
    cache: 'no-store',
    signal: AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS)
  });
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await response.json();
    return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function expiresAtFrom(expiresIn: unknown): number {
  const seconds = typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : 3600;
  return Date.now() + seconds * 1000;
}

export async function exchangeAuthorizationCode(
  code: string,
  flow: GoogleOAuthFlow
): Promise<GoogleTokenResponse | null> {
  const configuration = getConfiguration();
  if (!configuration) return null;

  let response: Response;
  try {
    response = await postForm(TOKEN_ENDPOINT, {
      code,
      client_id: configuration.clientId,
      client_secret: configuration.clientSecret,
      redirect_uri: flow.redirectUri,
      grant_type: 'authorization_code',
      code_verifier: flow.codeVerifier
    });
  } catch {
    return null;
  }

  const body = await readJson(response);
  if (!response.ok || !isNonEmptyString(body.access_token, 4096)) return null;

  return {
    accessToken: body.access_token,
    expiresAt: expiresAtFrom(body.expires_in),
    refreshToken: isNonEmptyString(body.refresh_token) ? body.refresh_token : null,
    idToken: isNonEmptyString(body.id_token, 8192) ? body.id_token : null,
    scopes: typeof body.scope === 'string' ? body.scope.split(' ').filter(Boolean) : []
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleRefreshResult> {
  const configuration = getConfiguration();
  if (!configuration) return { ok: false, reason: 'unavailable' };

  let response: Response;
  try {
    response = await postForm(TOKEN_ENDPOINT, {
      client_id: configuration.clientId,
      client_secret: configuration.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
  } catch {
    return { ok: false, reason: 'unavailable' };
  }

  const body = await readJson(response);
  if (response.ok && isNonEmptyString(body.access_token, 4096)) {
    return { ok: true, accessToken: body.access_token, expiresAt: expiresAtFrom(body.expires_in) };
  }

  // invalid_grant: token revogado, expirado ou senha trocada. Exige novo login.
  return { ok: false, reason: body.error === 'invalid_grant' ? 'invalid_grant' : 'unavailable' };
}

export async function revokeToken(token: string): Promise<boolean> {
  try {
    const response = await postForm(REVOKE_ENDPOINT, { token });
    return response.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// id_token: recebido direto do endpoint de token via TLS, então a origem já
// está garantida (OIDC Core §3.1.3.7). Conferimos aud, iss, exp e nonce.
// ---------------------------------------------------------------------------

export function verifyIdToken(idToken: string, expectedNonce: string): GoogleIdentity | null {
  const configuration = getConfiguration();
  if (!configuration) return null;

  const parts = idToken.split('.');
  if (parts.length !== 3 || !parts[1]) return null;

  let claims: Record<string, unknown>;
  try {
    const decoded: unknown = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (typeof decoded !== 'object' || decoded === null) return null;
    claims = decoded as Record<string, unknown>;
  } catch {
    return null;
  }

  const audience = claims.aud;
  const audienceMatches = Array.isArray(audience)
    ? audience.includes(configuration.clientId)
    : audience === configuration.clientId;
  if (!audienceMatches) return null;

  if (typeof claims.iss !== 'string' || !GOOGLE_ISSUERS.has(claims.iss)) return null;

  const now = nowSeconds();
  if (typeof claims.exp !== 'number' || claims.exp + CLOCK_SKEW_SECONDS <= now) return null;
  if (typeof claims.iat === 'number' && claims.iat - CLOCK_SKEW_SECONDS > now) return null;

  if (typeof claims.nonce !== 'string' || !safeEqual(claims.nonce, expectedNonce)) return null;
  if (!isNonEmptyString(claims.sub, 255)) return null;

  const picture = googlePicture(claims.picture);
  return {
    sub: claims.sub,
    email: typeof claims.email === 'string' ? claims.email : '',
    name: typeof claims.name === 'string' ? claims.name : '',
    ...(picture && { picture })
  };
}
