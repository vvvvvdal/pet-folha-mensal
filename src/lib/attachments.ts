import { getActivitiesForMonth } from "./storage";

export const ATTACHMENT_LIMIT_MB = 20;
export const MONTH_LIMIT_MB = 80;
export const MONTH_PAGE_LIMIT = 60;
const MIB = 1024 * 1024;
const STORAGE_OPTIMIZE_BYTES = 300 * 1024;
const STORAGE_JPEG_QUALITY = 0.82;
// About 160 dpi within the printable A4 landscape area.
const PRINT_WIDTH = 1745;
const PRINT_HEIGHT = 1222;

type AttachmentType = "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
type RawAttachmentType = AttachmentType | "image/heic";

export interface Attachment {
  id: string;
  name: string;
  file: Blob;
  pages: number;
  firstPageOnly?: boolean;
  activityIds?: string[];
}

export interface BackupAttachment {
  id: string;
  name: string;
  base64: string;
  activityIds: string[];
  firstPageOnly?: boolean;
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

export function effectiveAttachmentPages(item: Attachment) {
  return item.file.type === "application/pdf" && item.firstPageOnly ? 1 : item.pages;
}

export function countAttachmentPages(items: Attachment[], activityIds: ReadonlySet<string>) {
  return items.reduce((count, item) =>
    count + effectiveAttachmentPages(item) * Math.max(1, linkedActivityIds(item, activityIds).length), 0);
}

function limitError(items: Attachment[], activityIds = new Set<string>()): string | undefined {
  if (items.reduce((size, { file }) => size + file.size, 0) > MONTH_LIMIT_MB * MIB)
    return `a folha atingiu o limite de ${MONTH_LIMIT_MB} MB de comprovantes.`;
  if (countAttachmentPages(items, activityIds) > MONTH_PAGE_LIMIT)
    return `a folha atingiu o limite de ${MONTH_PAGE_LIMIT} páginas de comprovantes.`;
}

function currentActivityIds({ profileId, monthKey }: AttachmentScope) {
  return new Set(getActivitiesForMonth(profileId, monthKey, false).map(({ id }) => id));
}

export class AttachmentLinkError extends Error {}

function checkActivityIds(ids: string[], available: ReadonlySet<string>) {
  if (new Set(ids).size !== ids.length || ids.some((id) => !available.has(id)))
    throw new AttachmentLinkError("Confira as atividades selecionadas. A lista deste mês mudou.");
}

export function updateAttachmentLinks(
  scope: AttachmentScope,
  attachmentId: string,
  activityIds: string[],
  firstPageOnly?: boolean,
) {
  return withMonth(scope, (current) => {
    if (!current.some(({ id }) => id === attachmentId))
      throw new AttachmentLinkError("Este comprovante já foi removido.");
    const available = currentActivityIds(scope);
    checkActivityIds(activityIds, available);
    const next = current.map((item) => {
      if (item.id !== attachmentId) return item;
      const updated: Attachment = { ...item, activityIds };
      if (firstPageOnly !== undefined && item.file.type === "application/pdf" && item.pages > 1) {
        if (firstPageOnly) updated.firstPageOnly = true;
        else delete updated.firstPageOnly;
      }
      return updated;
    });
    if (countAttachmentPages(next, available) > MONTH_PAGE_LIMIT)
      throw new AttachmentLinkError(`Com estes vínculos, o PDF ultrapassa o limite de ${MONTH_PAGE_LIMIT} páginas de comprovantes.`);
    return next;
  });
}

function isHeicHeader(header: Uint8Array): boolean {
  if (header.length < 12) return false;
  if (header[4] !== 102 || header[5] !== 116 || header[6] !== 121 || header[7] !== 112) return false;
  const brands = new TextDecoder("latin1").decode(header.subarray(8, 32)).toLowerCase();
  return ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].some((brand) => brands.includes(brand));
}

async function detectRawFormat(file: Blob): Promise<RawAttachmentType> {
  const header = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, i) => header[i] === byte))
    return "image/png";
  if (header[0] === 255 && header[1] === 216 && header[2] === 255)
    return "image/jpeg";
  if (
    header.length >= 12 &&
    header[0] === 82 && header[1] === 73 && header[2] === 70 && header[3] === 70 &&
    header[8] === 87 && header[9] === 69 && header[10] === 66 && header[11] === 80
  )
    return "image/webp";
  if (isHeicHeader(header))
    return "image/heic";
  if (new TextDecoder().decode(header).includes("%PDF-")) return "application/pdf";
  throw new Error("formato inválido. Selecione um PDF, JPEG, PNG ou WebP.");
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

export function printScale(width: number, height: number, maxWidth = PRINT_WIDTH, maxHeight = PRINT_HEIGHT) {
  return Math.min(maxWidth / width, maxHeight / height);
}

// JPEG a 80% mantém a leitura de documentos a ~150 dpi e pesa uma fração do PNG.
export const PRINT_JPEG_QUALITY = 0.8;

// JPEG não tem transparência: pinta o fundo de branco antes de desenhar.
export function paintWhite(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = PRINT_JPEG_QUALITY,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("não foi possível preparar a imagem para impressão."));
    }, type, quality);
  });
}

async function optimizeImageToJpeg(image: HTMLImageElement, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  try {
    const scale = Math.min(1, printScale(image.naturalWidth, image.naturalHeight, maxWidth, maxHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("não foi possível preparar a imagem para impressão.");
    paintWhite(canvas);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await canvasToBlob(canvas, "image/jpeg", quality);
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

async function convertHeicToJpeg(blob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(blob.slice(0, blob.size, "image/heic"));
  try {
    let image: HTMLImageElement;
    try {
      image = await loadImage(url);
    } catch {
      throw new Error("formato HEIC não suportado neste navegador. Compartilhe ou salve a foto como JPEG ou PNG.");
    }
    return await optimizeImageToJpeg(image, PRINT_WIDTH, PRINT_HEIGHT, STORAGE_JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function validateAttachment(
  id: string,
  name: string,
  blob: Blob,
  options?: { compressImage?: boolean },
): Promise<Attachment> {
  if (blob.size > ATTACHMENT_LIMIT_MB * MIB)
    throw new Error("o arquivo excede o limite de 20 MB.");
  const rawType = await detectRawFormat(blob);
  if (rawType === "image/heic") {
    const converted = await convertHeicToJpeg(blob);
    if (converted.size > ATTACHMENT_LIMIT_MB * MIB)
      throw new Error("o arquivo excede o limite de 20 MB.");
    const normalizedName = /\.(heic|heif)$/i.test(name) ? name.replace(/\.(heic|heif)$/i, ".jpg") : `${name}.jpg`;
    return { id, name: normalizedName, file: converted, pages: 1 };
  }
  let file = blob.slice(0, blob.size, rawType);

  let pages = 1;
  if (rawType === "application/pdf") {
    const { countPdfPages } = await import("./attachment-pdf");
    pages = await countPdfPages(file);
  } else {
    const url = URL.createObjectURL(file);
    try {
      const image = await loadImage(url);
      if (
        options?.compressImage !== false &&
        (file.size > STORAGE_OPTIMIZE_BYTES || image.naturalWidth > PRINT_WIDTH || image.naturalHeight > PRINT_HEIGHT)
      ) {
        const optimized = await optimizeImageToJpeg(image, PRINT_WIDTH, PRINT_HEIGHT, STORAGE_JPEG_QUALITY);
        if (optimized.size < file.size * 0.9) {
          file = optimized;
        }
      }
    } catch {
      throw new Error("a imagem está ilegível.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return { id, name, file, pages };
}

/** Validate each file without writing anything, so links can be reviewed first. */
export async function prepareAttachmentFiles(
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ accepted: Attachment[]; rejected: string[] }> {
  const accepted: Attachment[] = [];
  const rejected: string[] = [];
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    try {
      accepted.push(await validateAttachment(crypto.randomUUID(), file.name, file));
    } catch (error) {
      rejected.push(describeAttachmentError(file.name, error));
    }
    onProgress?.(index + 1, files.length);
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
    ...(item.firstPageOnly && item.file.type === "application/pdf" && item.pages > 1 ? { firstPageOnly: true } : {}),
    base64: await encodeFile(item.file),
  })));
}

export async function decodeAttachments(
  values: unknown[],
  activityIds?: Set<string>,
  onProgress?: (done: number, total: number) => void,
): Promise<Attachment[]> {
  if (values.length > MONTH_PAGE_LIMIT) throw new Error("A cópia excede o limite de comprovantes.");
  const items: Attachment[] = [];
  const ids = new Set<string>();
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    const { id, name, base64, activityIds: links, firstPageOnly } = (value ?? {}) as Partial<BackupAttachment>;
    if (typeof id !== "string" || !id.trim() || ids.has(id) ||
        typeof name !== "string" || !name.trim() ||
        typeof base64 !== "string" || !base64.length ||
        base64.length > Math.ceil(ATTACHMENT_LIMIT_MB * MIB / 3) * 4 ||
        (firstPageOnly !== undefined && typeof firstPageOnly !== "boolean"))
      throw new Error("A cópia contém um comprovante inválido ou acima do limite.");
    if (activityIds && (!Array.isArray(links) ||
        new Set(links).size !== links.length || links.some((link) => !activityIds.has(link))))
      throw new Error("A cópia contém vínculos de comprovantes inválidos.");
    try {
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const item = await validateAttachment(id, name, new Blob([bytes]), { compressImage: false });
      if (activityIds) item.activityIds = links;
      if (firstPageOnly && item.file.type === "application/pdf" && item.pages > 1) {
        item.firstPageOnly = true;
      }
      const error = limitError([...items, item], activityIds);
      if (error) throw new Error(error);
      items.push(item);
      ids.add(id);
      onProgress?.(index + 1, values.length);
    } catch (error) {
      throw new Error(describeAttachmentError(name, error));
    }
  }
  return items;
}

function getPrintProfile(totalPrintPages: number) {
  if (totalPrintPages <= 25) return { maxWidth: PRINT_WIDTH, maxHeight: PRINT_HEIGHT, quality: PRINT_JPEG_QUALITY };
  if (totalPrintPages <= 45) return { maxWidth: 1500, maxHeight: 1050, quality: 0.72 };
  return { maxWidth: 1320, maxHeight: 924, quality: 0.66 };
}

export async function prepareAttachmentPages(
  items: Attachment[],
  options?: {
    activityIds?: ReadonlySet<string>;
    onProgress?: (done: number, total: number) => void;
  },
) {
  const urls: string[] = [];
  const pagesByAttachment = new Map<string, HTMLImageElement[]>();
  const release = () => urls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  const totalPrintPages = options?.activityIds
    ? countAttachmentPages(items, options.activityIds)
    : items.reduce((sum, item) => sum + effectiveAttachmentPages(item), 0);
  const totalUniquePages = items.reduce((sum, item) => sum + effectiveAttachmentPages(item), 0);
  const profile = getPrintProfile(totalPrintPages);
  let donePages = 0;

  const openPage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urls.push(url);
    return loadImage(url);
  };
  const preparePhoto = async (blob: Blob) => {
    const photo = await openPage(blob);
    const scale = printScale(photo.naturalWidth, photo.naturalHeight, profile.maxWidth, profile.maxHeight);
    if (blob.type === "image/jpeg" && scale >= 1 && blob.size <= 220 * 1024) {
      return photo;
    }
    let resized: Blob;
    try {
      resized = await optimizeImageToJpeg(photo, profile.maxWidth, profile.maxHeight, profile.quality);
    } finally {
      URL.revokeObjectURL(photo.src);
      photo.removeAttribute("src");
    }
    return openPage(resized);
  };

  for (const item of items) {
    try {
      const images: HTMLImageElement[] = [];
      if (item.file.type === "application/pdf") {
        const { renderPdfPages } = await import("./attachment-pdf");
        await renderPdfPages(
          item.file,
          async (blob) => {
            images.push(await openPage(blob));
            donePages++;
            options?.onProgress?.(donePages, totalUniquePages);
          },
          {
            firstPageOnly: item.firstPageOnly,
            maxWidth: profile.maxWidth,
            maxHeight: profile.maxHeight,
            quality: profile.quality,
          },
        );
      } else {
        images.push(await preparePhoto(item.file));
        donePages++;
        options?.onProgress?.(donePages, totalUniquePages);
      }
      pagesByAttachment.set(item.id, images);
    } catch (error) {
      release();
      throw new Error(describeAttachmentError(item.name, error));
    }
  }
  return { pagesByAttachment, release };
}
