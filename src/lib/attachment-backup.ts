import { replaceAttachments, type Attachment } from "./attachments";
import { applyUserData, restoreFailure, type RestoreResult } from "./storage";

export async function restoreWithAttachments(
  preview: RestoreResult,
  profileId: string,
  monthKey: string,
  attachments: Attachment[],
): Promise<RestoreResult> {
  let result = restoreFailure("STORAGE_FAILED");
  let rollback: (() => boolean) | undefined;
  try {
    // A localStorage failure aborts IndexedDB. An IndexedDB abort rolls back localStorage.
    await replaceAttachments({ profileId, monthKey }, attachments, () => {
      result = applyUserData(preview, (undo) => { rollback = undo; });
      if (!result.success) throw new Error("Restauração interrompida.");
    });
    return result;
  } catch {
    if (rollback && !rollback()) return restoreFailure("ROLLBACK_FAILED");
    return result.success ? restoreFailure("STORAGE_FAILED") : result;
  }
}
