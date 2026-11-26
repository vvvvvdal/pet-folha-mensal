// Browser side of the Google login routes (`src/app/api/google/*`).
// The refresh token never reaches the page: the server keeps it sealed in an HttpOnly cookie
// and hands out short-lived access tokens for the Drive API.

export interface GoogleSession {
  /** False when the server has no Google credentials: the app keeps the local-only mode. */
  configured: boolean;
  authenticated: boolean;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  /** True when the session could not be checked (offline or server error). */
  unreachable?: boolean;
}

export type GoogleLoginError = "permission" | "denied" | "unavailable" | "failed";

export class GoogleAuthError extends Error {
  constructor(message = "Reconecte sua conta Google para continuar a cópia no Drive.") {
    super(message);
    this.name = "GoogleAuthError";
  }
}

export const GOOGLE_LOGIN_URL = "/api/google/login";

export async function fetchGoogleSession(): Promise<GoogleSession> {
  try {
    const response = await fetch("/api/google/session", { cache: "no-store", credentials: "same-origin" });
    if (response.status === 404) return { configured: false, authenticated: false };
    if (!response.ok) return { configured: true, authenticated: false, unreachable: true };
    const data = (await response.json()) as Partial<GoogleSession>;
    return {
      configured: data.configured === true,
      authenticated: data.authenticated === true,
      sub: typeof data.sub === "string" ? data.sub : undefined,
      email: typeof data.email === "string" ? data.email : undefined,
      name: typeof data.name === "string" ? data.name : undefined,
      picture: typeof data.picture === "string" ? data.picture : undefined,
    };
  } catch {
    return { configured: true, authenticated: false, unreachable: true };
  }
}

let cached: { token: string; expiresAt: number } | null = null;
let pending: Promise<string> | null = null;

/** Access token for the Drive API, renewed by the server shortly before it expires. */
export function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt - Date.now() > 60_000) return Promise.resolve(cached.token);
  pending ??= (async () => {
    try {
      const response = await fetch("/api/google/token", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "X-Requested-With": "pet-folha" },
      });
      if (response.status === 401 || response.status === 403) {
        cached = null;
        throw new GoogleAuthError();
      }
      if (!response.ok) throw new Error("Não foi possível falar com o servidor agora.");
      const data = (await response.json()) as { accessToken?: string; expiresAt?: number | string };
      const expiresAt = typeof data.expiresAt === "string" ? Date.parse(data.expiresAt) : Number(data.expiresAt);
      if (!data.accessToken || !Number.isFinite(expiresAt)) throw new Error("Resposta inválida do servidor.");
      // Accept seconds or milliseconds since the epoch.
      cached = { token: data.accessToken, expiresAt: expiresAt < 1e12 ? expiresAt * 1000 : expiresAt };
      return cached.token;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

export function forgetAccessToken() {
  cached = null;
}

export async function logoutGoogle(): Promise<void> {
  forgetAccessToken();
  await fetch("/api/google/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: { "X-Requested-With": "pet-folha" },
  }).catch(() => undefined);
}
