import { linkedActivityIds, replaceAttachments, type Attachment } from "./attachments";
import { applyUserData, getActivitiesForMonth, restoreFailure, type RestoreResult } from "./storage";

export async function restoreWithAttachments(
  preview: RestoreResult,
  profileId: string,
  monthKey: string,
  attachments?: Attachment[],
): Promise<RestoreResult> {
  let result = restoreFailure("STORAGE_FAILED");
  let rollback: (() => boolean) | undefined;
  try {
    // A localStorage failure aborts IndexedDB. An IndexedDB abort rolls back localStorage.
    await replaceAttachments({ profileId, monthKey }, attachments ?? ((current) => {
      const incoming = new Set(preview.activities?.map(({ id }) => id));
      const retained = new Set(
        getActivitiesForMonth(profileId, monthKey, false).map(({ id }) => id).filter((id) => incoming.has(id)),
      );
      const next = current.map((item) => {
        const activityIds = linkedActivityIds(item, retained);
        return activityIds.length === (item.activityIds?.length ?? 0) ? item : { ...item, activityIds };
      });
      return next.some((item, index) => item !== current[index]) ? next : current;
    }), () => {
      result = applyUserData(preview, (undo) => { rollback = undo; });
      if (!result.success) throw new Error("Restauração interrompida.");
    });
    return result;
  } catch {
    if (rollback && !rollback()) return restoreFailure("ROLLBACK_FAILED");
    return result.success ? restoreFailure("STORAGE_FAILED") : result;
  }
}
