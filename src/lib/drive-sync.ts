// Monthly copies in the user's own Google Drive (scope drive.file: the app only sees what it created).
// The browser keeps working offline; this module pushes dirty months and pulls newer ones.
import type { UserProfile } from "@/types";
import { getMonthYearLabel } from "./pet-calculator";
import { getAccessToken, GoogleAuthError } from "./google-session";
import { applyMonthBackup, createMonthBackup } from "./month-backup";
import type { RestoreResult } from "./storage";

const API = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const FOLDER_MIME = "application/vnd.google-apps.folder";
const MULTIPART_LIMIT = 5 * 1024 * 1024;
const STATE_KEY = "pet_folha_drive_sync_v1";

export interface MonthSyncState {
  fileId?: string;
  remoteModified?: string;
  dirty?: boolean;
  syncedAt?: string;
}
interface AccountState {
  folderId?: string;
  months: Record<string, MonthSyncState>;
}
export interface RemoteMonth {
  fileId: string;
  monthKey: string;
  modifiedTime: string;
  size?: number;
  name: string;
}

export class DriveConflictError extends Error {
  constructor(public monthKey: string, public remote: RemoteMonth) {
    super(`${getMonthYearLabel(monthKey)} mudou em outro aparelho.`);
    this.name = "DriveConflictError";
  }
}

// ---------- Local sync state (per Google account) ----------

function readAll(): Record<string, AccountState> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STATE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function account(sub: string): AccountState {
  const state = readAll()[sub];
  return { folderId: state?.folderId, months: state?.months ?? {} };
}
function writeAccount(sub: string, update: (state: AccountState) => AccountState) {
  const all = readAll();
  all[sub] = update(account(sub));
  try { localStorage.setItem(STATE_KEY, JSON.stringify(all)); } catch { /* retried on the next change */ }
}
function setMonth(sub: string, monthKey: string, patch: MonthSyncState) {
  writeAccount(sub, (state) => ({ ...state, months: { ...state.months, [monthKey]: { ...state.months[monthKey], ...patch } } }));
}

export function markMonthDirty(sub: string, monthKey: string) {
  setMonth(sub, monthKey, { dirty: true });
}
/** Months with local data that were never synced are sent (or reported as conflicts), never overwritten. */
export function trackUnsyncedMonths(sub: string, months: string[]) {
  const known = account(sub).months;
  for (const month of months) if (!known[month]) markMonthDirty(sub, month);
}
export function pendingMonths(sub: string): string[] {
  return Object.entries(account(sub).months).filter(([, month]) => month.dirty).map(([key]) => key).sort();
}
export function lastSyncedAt(sub: string): string | undefined {
  return Object.values(account(sub).months).map((month) => month.syncedAt).filter(Boolean).sort().at(-1);
}
export function forgetAccountState(sub: string) {
  const all = readAll();
  delete all[sub];
  try { localStorage.setItem(STATE_KEY, JSON.stringify(all)); } catch { /* nothing to keep */ }
}

// ---------- Drive REST ----------

async function drive(path: string, init: RequestInit = {}, base = API): Promise<Response> {
  const token = await getAccessToken();
  const response = await fetch(base + path, {
    ...init,
    headers: { ...(init.headers as Record<string, string>), Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) throw new GoogleAuthError();
  if (!response.ok) throw new Error(`O Google Drive recusou a operação (${response.status}).`);
  return response;
}

const quote = (value: string) => `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

async function ensureFolder(sub: string): Promise<string> {
  const known = account(sub).folderId;
  if (known) {
    const meta = await drive(`/files/${known}?fields=id,trashed`).then((r) => r.json()).catch(() => null);
    if (meta && !meta.trashed) return known;
  }
  const q = `mimeType=${quote(FOLDER_MIME)} and appProperties has { key='petFolha' and value='root' } and trashed=false`;
  const found = await drive(`/files?q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`).then((r) => r.json());
  let folderId: string | undefined = found.files?.[0]?.id;
  if (!folderId) {
    const created = await drive("/files?fields=id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "PET Folha", mimeType: FOLDER_MIME, appProperties: { petFolha: "root" } }),
    }).then((r) => r.json());
    folderId = created.id as string;
  }
  writeAccount(sub, (state) => ({ ...state, folderId }));
  return folderId;
}

export function driveFolderUrl(sub: string): string {
  const folderId = account(sub).folderId;
  return folderId ? `https://drive.google.com/drive/folders/${folderId}` : "https://drive.google.com/drive/my-drive";
}

export async function listRemoteMonths(): Promise<RemoteMonth[]> {
  const q = `appProperties has { key='petFolha' and value='month' } and trashed=false`;
  const data = await drive(
    `/files?q=${encodeURIComponent(q)}&fields=files(id,name,modifiedTime,size,appProperties)&pageSize=100&orderBy=name`,
  ).then((r) => r.json());
  return (data.files ?? [])
    .map((file: { id: string; name: string; modifiedTime: string; size?: string; appProperties?: Record<string, string> }) => ({
      fileId: file.id,
      name: file.name,
      modifiedTime: file.modifiedTime,
      size: file.size ? Number(file.size) : undefined,
      monthKey: file.appProperties?.monthKey ?? "",
    }))
    .filter((file: RemoteMonth) => /^\d{4}-\d{2}$/.test(file.monthKey))
    .sort((a: RemoteMonth, b: RemoteMonth) => a.monthKey.localeCompare(b.monthKey));
}

async function upload(
  method: "POST" | "PATCH",
  fileId: string | undefined,
  metadata: Record<string, unknown>,
  body: string,
): Promise<{ id: string; modifiedTime: string }> {
  const target = `/files${fileId ? `/${fileId}` : ""}`;
  const fields = "fields=id,modifiedTime";
  const bytes = new Blob([body], { type: "application/json" });
  if (bytes.size <= MULTIPART_LIMIT) {
    const boundary = `petfolha${crypto.randomUUID().replace(/-/g, "")}`;
    const multipart = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n`,
      bytes,
      `\r\n--${boundary}--`,
    ]);
    return drive(`${target}?uploadType=multipart&${fields}`, {
      method,
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: multipart,
    }, UPLOAD).then((r) => r.json());
  }
  const session = await drive(`${target}?uploadType=resumable&${fields}`, {
    method,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": "application/json",
      "X-Upload-Content-Length": String(bytes.size),
    },
    body: JSON.stringify(metadata),
  }, UPLOAD);
  const location = session.headers.get("Location");
  if (!location) throw new Error("O Google Drive não abriu o envio do arquivo.");
  const response = await fetch(location, { method: "PUT", body: bytes });
  if (!response.ok) throw new Error(`O envio para o Google Drive falhou (${response.status}).`);
  return response.json();
}

function fileName(user: UserProfile, monthKey: string, suffix = "") {
  return `PET Folha - ${user.name} - ${monthKey}${suffix}.json`;
}

async function remoteMeta(fileId: string): Promise<RemoteMonth | null> {
  const response = await drive(`/files/${fileId}?fields=id,name,modifiedTime,size,trashed,appProperties`).catch((error) => {
    if (error instanceof GoogleAuthError) throw error;
    return null;
  });
  if (!response) return null;
  const meta = await response.json();
  if (meta.trashed) return null;
  return { fileId: meta.id, name: meta.name, modifiedTime: meta.modifiedTime, size: meta.size ? Number(meta.size) : undefined, monthKey: meta.appProperties?.monthKey ?? "" };
}

/**
 * Sends one month to Drive. Throws DriveConflictError when the Drive copy changed since the last
 * sync of this browser, unless `force` is set (the user already chose to keep this device).
 */
export async function pushMonth(sub: string, user: UserProfile, monthKey: string, force = false): Promise<void> {
  const folderId = await ensureFolder(sub);
  const state = account(sub).months[monthKey] ?? {};
  let fileId = state.fileId;
  let current = fileId ? await remoteMeta(fileId) : null;
  if (!current) {
    // Another device may have created the month file after our last sync.
    current = (await listRemoteMonths()).find((file) => file.monthKey === monthKey) ?? null;
    fileId = current?.fileId;
  }
  if (current && !force && current.modifiedTime !== state.remoteModified) throw new DriveConflictError(monthKey, current);
  const json = await createMonthBackup(user, monthKey);
  const metadata: Record<string, unknown> = {
    name: fileName(user, monthKey),
    mimeType: "application/json",
    appProperties: { petFolha: "month", monthKey, profileId: user.id },
  };
  if (!fileId) metadata.parents = [folderId];
  const saved = await upload(fileId ? "PATCH" : "POST", fileId, metadata, json);
  setMonth(sub, monthKey, { fileId: saved.id, remoteModified: saved.modifiedTime, dirty: false, syncedAt: new Date().toISOString() });
}

/** Downloads one month from Drive and writes it into this browser. */
export async function pullMonth(
  sub: string,
  remote: RemoteMonth,
  options: { email?: string; onProgress?: (done: number, total: number) => void } = {},
): Promise<RestoreResult> {
  const json = await drive(`/files/${remote.fileId}?alt=media`).then((r) => r.text());
  const result = await applyMonthBackup(json, { googleSub: sub, email: options.email, onProgress: options.onProgress });
  if (result.success)
    setMonth(sub, remote.monthKey, { fileId: remote.fileId, remoteModified: remote.modifiedTime, dirty: false, syncedAt: new Date().toISOString() });
  return result;
}

/**
 * Brings months that changed on another device. Months edited here too are returned as conflicts
 * instead of being overwritten.
 */
export async function pullNewerMonths(sub: string, email?: string): Promise<{ updated: string[]; conflicts: RemoteMonth[] }> {
  const months = account(sub).months;
  const updated: string[] = [];
  const conflicts: RemoteMonth[] = [];
  for (const remote of await listRemoteMonths()) {
    const local = months[remote.monthKey];
    if (local?.remoteModified === remote.modifiedTime) continue;
    if (local?.dirty) {
      conflicts.push(remote);
      continue;
    }
    const result = await pullMonth(sub, remote, { email });
    if (result.success) updated.push(remote.monthKey);
  }
  return { updated, conflicts };
}

/** Saves the version the user did not keep, so a conflict never deletes data. */
export async function keepConflictCopy(sub: string, user: UserProfile, monthKey: string, source: "device" | RemoteMonth): Promise<void> {
  const folderId = await ensureFolder(sub);
  const json = source === "device"
    ? await createMonthBackup(user, monthKey)
    : await drive(`/files/${source.fileId}?alt=media`).then((r) => r.text());
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ").replace(":", "h");
  await upload("POST", undefined, {
    name: fileName(user, monthKey, ` - conflito ${stamp}`),
    mimeType: "application/json",
    parents: [folderId],
    appProperties: { petFolha: "conflict", monthKey, profileId: user.id },
  }, json);
}
