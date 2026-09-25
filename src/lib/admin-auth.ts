import 'server-only';

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'pet_admin_session';

const SESSION_DURATION_SECONDS = 8 * 60 * 60;
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/i;

function getConfiguration(): { pinHash: string; sessionSecret: string } | null {
  const pinHash = process.env.ADMIN_PIN_HASH?.trim();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (!pinHash || !SHA256_HEX_PATTERN.test(pinHash)) return null;
  if (!sessionSecret || sessionSecret.length < 32) return null;

  return { pinHash: pinHash.toLowerCase(), sessionSecret };
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signSession(expiresAt: number, pinHash: string, sessionSecret: string): string {
  return createHmac('sha256', sessionSecret)
    .update(`pet-admin:${expiresAt}:${pinHash}`)
    .digest('base64url');
}

export function isAdminAuthConfigured(): boolean {
  return getConfiguration() !== null;
}

export function verifyAdminPin(pin: string): boolean {
  const configuration = getConfiguration();
  const cleanPin = pin.trim();

  if (!configuration || !cleanPin || cleanPin.length > 128) return false;

  const candidateHash = createHash('sha256').update(cleanPin, 'utf8').digest('hex');
  return safeEqual(candidateHash, configuration.pinHash);
}

export function createAdminSession(): { token: string; maxAge: number } | null {
  const configuration = getConfiguration();
  if (!configuration) return null;

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const signature = signSession(expiresAt, configuration.pinHash, configuration.sessionSecret);

  return {
    token: `${expiresAt}.${signature}`,
    maxAge: SESSION_DURATION_SECONDS
  };
}

export function verifyAdminSession(token: string | undefined): boolean {
  const configuration = getConfiguration();
  if (!configuration || !token) return false;

  const [expiresAtValue, receivedSignature, ...extraParts] = token.split('.');
  if (!expiresAtValue || !receivedSignature || extraParts.length > 0) return false;

  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedSignature = signSession(
    expiresAt,
    configuration.pinHash,
    configuration.sessionSecret
  );

  return safeEqual(receivedSignature, expectedSignature);
}
