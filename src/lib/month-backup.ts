import type { UserProfile } from "@/types";
import { decodeAttachments, encodeAttachments, listAttachments, replaceAttachments } from "./attachments";
import { restoreWithAttachments } from "./attachment-backup";
import { exportUserData, getActivitiesForMonth, inspectUserData, type RestoreResult } from "./storage";

/** JSON copy of one month (format 1.3), shared by the manual download and the Drive sync. */
export async function createMonthBackup(user: UserProfile, monthKey: string): Promise<string> {
  const items = await listAttachments({ profileId: user.id, monthKey });
  const snapshot = getActivitiesForMonth(user.id, monthKey);
  const activityIds = new Set(snapshot.map(({ id }) => id));
  return exportUserData(user, monthKey, await encodeAttachments(items, activityIds), snapshot);
}

/**
 * Validates and writes a month copy into this browser. `profile` overrides identity fields of the
 * copy (used to keep the Google link when an older copy has none).
 */
export async function applyMonthBackup(
  json: string,
  options: { googleSub?: string; email?: string; onProgress?: (done: number, total: number) => void } = {},
): Promise<RestoreResult> {
  const preview = inspectUserData(json);
  if (!preview.success || !preview.user || !preview.monthKey) return preview;
  if (options.googleSub) preview.user = { ...preview.user, googleSub: options.googleSub };
  if (options.email && !preview.user.email) preview.user = { ...preview.user, email: options.email };
  const attachments = preview.attachmentData
    ? await decodeAttachments(
        preview.attachmentData,
        preview.hasAttachmentLinks ? new Set(preview.activities?.map(({ id }) => id)) : undefined,
        options.onProgress,
      )
    : undefined;
  return restoreWithAttachments(preview, preview.user.id, preview.monthKey, attachments);
}

/** Deletes the stored proofs of the given months (sign-out on a shared device). */
export async function removeMonthAttachments(profileId: string, months: string[]): Promise<void> {
  for (const monthKey of months) await replaceAttachments({ profileId, monthKey }, [], () => {});
}
