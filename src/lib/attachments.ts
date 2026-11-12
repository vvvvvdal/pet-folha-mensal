import { getActivitiesForMonth } from "./storage";

export const ATTACHMENT_LIMIT_MB = 20;
export const MONTH_LIMIT_MB = 40;
export const MONTH_PAGE_LIMIT = 30;
const MIB = 1024 * 1024;
// About 160 dpi within the printable A4 landscape area.
const PRINT_WIDTH = 1745;
const PRINT_HEIGHT = 1222;

type AttachmentType = "application/pdf" | "image/jpeg" | "image/png";

export interface Attachment {
  id: string;
  name: string;
  file: Blob;
  pages: number;
  activityIds?: string[];
}

export interface BackupAttachment {
  id: string;
  name: string;
  base64: string;
  activityIds: string[];
}

export interface AttachmentScope {
  profileId: string;
  monthKey: string;
}

const STORE = "months";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pet-folha-comprovantes", 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Armazenamento local bloqueado."));
    request.onsuccess = () => resolve(request.result);
  });
}

async function withMonth(
  { profileId, monthKey }: AttachmentScope,
  update?: (current: Attachment[]) => Attachment[],
  beforeCommit?: () => void,
): Promise<Attachment[]> {
  const db = await openDatabase();
  try {
    return await new Promise<Attachment[]>((resolve, reject) => {
      const transaction = db.transaction(STORE, update ? "readwrite" : "readonly");
      const store = transaction.objectStore(STORE);
      const key = [profileId, monthKey];
      let attachments: Attachment[];
      let operationError: unknown;
      transaction.oncomplete = () => resolve(attachments);
      transaction.onabort = () => reject(operationError ?? transaction.error);
      const request = store.get(key);
      request.onsuccess = () => {
        attachments = request.result ?? [];
        if (!update) return;
        try {
          const next = update(attachments);
          if (next !== attachments) {
            if (next.length) store.put(next, key);
            else store.delete(key);
          }
          attachments = next;
          beforeCommit?.();
        } catch (error) {
          operationError = error;
          transaction.abort();
        }
      };
    });
  } finally {
    db.close();
  }
}

export function listAttachments(scope: AttachmentScope) {
  return withMonth(scope);
}

export function replaceAttachments(
  scope: AttachmentScope,
  attachments: Attachment[] | ((current: Attachment[]) => Attachment[]),
  beforeCommit: () => void,
) {
  return withMonth(scope, typeof attachments === "function" ? attachments : () => attachments, beforeCommit);
}

export function removeAttachment(scope: AttachmentScope, id: string) {
  return withMonth(scope, (items) => items.filter((item) => item.id !== id));
}

export function linkedActivityIds(item: Attachment, activityIds: ReadonlySet<string>) {
  return (item.activityIds ?? []).filter((id) => activityIds.has(id));
}

export function countAttachmentPages(items: Attachment[], activityIds: ReadonlySet<string>) {
  return items.reduce((count, item) =>
    count + item.pages * Math.max(1, linkedActivityIds(item, activityIds).length), 0);
}

function limitError(items: Attachment[], activityIds = new Set<string>()): string | undefined {
  if (items.reduce((size, { file }) => size + file.size, 0) > MONTH_LIMIT_MB * MIB)
    return "a folha atingiu o limite de 40 MB de comprovantes.";
  if (countAttachmentPages(items, activityIds) > MONTH_PAGE_LIMIT)
    return "a folha atingiu o limite de 30 páginas de comprovantes.";
}

function currentActivityIds({ profileId, monthKey }: AttachmentScope) {
  return new Set(getActivitiesForMonth(profileId, monthKey, false).map(({ id }) => id));
}

export class AttachmentLinkError extends Error {}

function checkActivityIds(ids: string[], available: ReadonlySet<string>) {
  if (new Set(ids).size !== ids.length || ids.some((id) => !available.has(id)))
    throw new AttachmentLinkError("Confira as atividades selecionadas. A lista deste mês mudou.");
}

export function updateAttachmentLinks(scope: AttachmentScope, attachmentId: string, activityIds: string[]) {
  return withMonth(scope, (current) => {
    if (!current.some(({ id }) => id === attachmentId))
      throw new AttachmentLinkError("Este comprovante já foi removido.");
    const available = currentActivityIds(scope);
    checkActivityIds(activityIds, available);
    const next = current.map((item) => item.id === attachmentId ? { ...item, activityIds } : item);
    if (countAttachmentPages(next, available) > MONTH_PAGE_LIMIT)
      throw new AttachmentLinkError("Com estes vínculos, o PDF ultrapassa o limite de 30 páginas de comprovantes.");
    return next;
  });
}

async function detectType(file: Blob): Promise<AttachmentType> {
  const header = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => header[i] === byte))
    return "image/png";
  if (header[0] === 255 && header[1] === 216 && header[2] === 255)
    return "image/jpeg";
  if (new TextDecoder().decode(header).includes("%PDF-")) return "application/pdf";
  throw new Error("formato inválido. Selecione um PDF, JPEG ou PNG.");
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

export function printScale(width: number, height: number) {
  return Math.min(PRINT_WIDTH / width, PRINT_HEIGHT / height);
}

// JPEG a 80% mantém a leitura de documentos a ~150 dpi e pesa uma fração do PNG
// (o gov.br aceita até 5 MB para assinar).
export const PRINT_JPEG_QUALITY = 0.8;

// JPEG não tem transparência: pinta o fundo de branco antes de desenhar.
export function paintWhite(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg"): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("não foi possível preparar a imagem para impressão."));
    }, type, PRINT_JPEG_QUALITY);
  });
}

async function validateAttachment(id: string, name: string, blob: Blob): Promise<Attachment> {
  if (blob.size > ATTACHMENT_LIMIT_MB * MIB)
    throw new Error("o arquivo excede o limite de 20 MB.");
  const type = await detectType(blob);
  const file = blob.slice(0, blob.size, type);

  let pages = 1;
  if (type === "application/pdf") {
    const { countPdfPages } = await import("./attachment-pdf");
    pages = await countPdfPages(file);
  } else {
    const url = URL.createObjectURL(file);
    try {
      await loadImage(url);
    } catch {
      throw new Error("a imagem está ilegível.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return { id, name, file, pages };
}

/** Validate each file without writing anything, so links can be reviewed first. */
export async function prepareAttachmentFiles(files: File[]): Promise<{ accepted: Attachment[]; rejected: string[] }> {
  const accepted: Attachment[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    try {
      accepted.push(await validateAttachment(crypto.randomUUID(), file.name, file));
    } catch (error) {
      rejected.push(describeAttachmentError(file.name, error));
    }
  }
  return { accepted, rejected };
}

/** Commit the entire reviewed batch, or leave the month unchanged on any error. */
export function savePreparedAttachments(scope: AttachmentScope, candidates: Attachment[]): Promise<Attachment[]> {
  return withMonth(scope, (current) => {
    if (!candidates.length) return current;
    const available = currentActivityIds(scope);
    const ids = new Set(current.map(({ id }) => id));
    for (const candidate of candidates) {
      if (!candidate.id || ids.has(candidate.id))
        throw new Error("Um comprovante selecionado já existe. Selecione os arquivos novamente.");
      ids.add(candidate.id);
      if (!(candidate.file instanceof Blob) || candidate.file.size > ATTACHMENT_LIMIT_MB * MIB ||
          !Number.isInteger(candidate.pages) || candidate.pages < 1 || candidate.pages > MONTH_PAGE_LIMIT)
        throw new Error("Um comprovante selecionado é inválido. Selecione os arquivos novamente.");
      checkActivityIds(candidate.activityIds ?? [], available);
    }
    const next = [...current, ...candidates];
    const error = limitError(next, available);
    if (error) throw new Error(error);
    return next;
  });
}

export async function addAttachments(scope: AttachmentScope, files: File[], activityId: string) {
  const rejected: string[] = [];
  const candidates: Attachment[] = [];
  for (const file of files) {
    try {
      const candidate = await validateAttachment(crypto.randomUUID(), file.name, file);
      const error = limitError([...candidates, candidate]);
      if (error) throw new Error(error);
      candidates.push(activityId ? { ...candidate, activityIds: [activityId] } : candidate);
    } catch (error) {
      rejected.push(describeAttachmentError(file.name, error));
    }
  }

  let added = 0;
  const attachments = await withMonth(scope, (current) => {
    const available = currentActivityIds(scope);
    if (activityId) checkActivityIds([activityId], available);
    const next = [...current];
    for (const candidate of candidates) {
      const error = limitError([...next, candidate], available);
      if (error) {
        rejected.push(describeAttachmentError(candidate.name, new Error(error)));
      } else {
        next.push(candidate);
        added++;
      }
    }
    return added ? next : current;
  });
  return { attachments, added, rejected };
}

function describeAttachmentError(name: string, error: unknown) {
  return name + ": " + (error instanceof Error ? error.message : "não foi possível ler o arquivo.");
}

function encodeFile(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const dataUrl = String(reader.result);
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.readAsDataURL(file);
  });
}

export async function encodeAttachments(items: Attachment[], activityIds: ReadonlySet<string>): Promise<BackupAttachment[]> {
  return Promise.all(items.map(async (item) => ({
    id: item.id,
    name: item.name,
    activityIds: linkedActivityIds(item, activityIds),
    base64: await encodeFile(item.file),
  })));
}

export async function decodeAttachments(values: unknown[], activityIds?: Set<string>): Promise<Attachment[]> {
  if (values.length > MONTH_PAGE_LIMIT) throw new Error("A cópia excede o limite de comprovantes.");
  const items: Attachment[] = [];
  const ids = new Set<string>();
  for (const value of values) {
    const { id, name, base64, activityIds: links } = (value ?? {}) as Partial<BackupAttachment>;
    if (typeof id !== "string" || !id.trim() || ids.has(id) ||
        typeof name !== "string" || !name.trim() ||
        typeof base64 !== "string" || !base64.length ||
        base64.length > Math.ceil(ATTACHMENT_LIMIT_MB * MIB / 3) * 4)
      throw new Error("A cópia contém um comprovante inválido ou acima do limite.");
    if (activityIds && (!Array.isArray(links) ||
        new Set(links).size !== links.length || links.some((link) => !activityIds.has(link))))
      throw new Error("A cópia contém vínculos de comprovantes inválidos.");
    try {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const item = await validateAttachment(id, name, new Blob([bytes]));
      if (activityIds) item.activityIds = links;
      const error = limitError([...items, item], activityIds);
      if (error) throw new Error(error);
      items.push(item);
      ids.add(id);
    } catch (error) {
      throw new Error(describeAttachmentError(name, error));
    }
  }
  return items;
}

export async function prepareAttachmentPages(items: Attachment[]) {
  const urls: string[] = [];
  const pagesByAttachment = new Map<string, HTMLImageElement[]>();
  const release = () => urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  const openPage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urls.push(url);
    return loadImage(url);
  };
  const preparePhoto = async (blob: Blob) => {
    const photo = await openPage(blob);
    const scale = printScale(photo.naturalWidth, photo.naturalHeight);
    if (scale >= 1) return photo;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(photo.naturalWidth * scale));
    canvas.height = Math.max(1, Math.floor(photo.naturalHeight * scale));
    let resized: Blob;
    try {
      const context = canvas.getContext("2d");
      if (!context) throw new Error("não foi possível preparar a imagem para impressão.");
      paintWhite(canvas);
      context.drawImage(photo, 0, 0, canvas.width, canvas.height);
      resized = await canvasToBlob(canvas);
    } finally {
      URL.revokeObjectURL(photo.src);
      photo.removeAttribute("src");
      canvas.width = 0;
      canvas.height = 0;
    }
    return openPage(resized);
  };

  for (const item of items) {
    try {
      const images: HTMLImageElement[] = [];
      if (item.file.type === "application/pdf") {
        const { renderPdfPages } = await import("./attachment-pdf");
        await renderPdfPages(item.file, async (blob) => { images.push(await openPage(blob)); });
      } else {
        images.push(await preparePhoto(item.file));
      }
      pagesByAttachment.set(item.id, images);
    } catch (error) {
      release();
      throw new Error(describeAttachmentError(item.name, error));
    }
  }
  return { pagesByAttachment, release };
}
