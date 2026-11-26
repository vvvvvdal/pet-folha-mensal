import { getDocument, GlobalWorkerOptions, PasswordResponses } from "pdfjs-dist";
import { canvasToBlob, MONTH_PAGE_LIMIT, paintWhite, printScale } from "./attachments";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

async function withPdf<T>(
  file: Blob,
  processDocument: (pdf: Awaited<ReturnType<typeof getDocument>["promise"]>) => Promise<T>,
) {
  const task = getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    stopAtErrors: true,
  });
  let passwordRequired = false;
  task.onPassword = (update: (password: Error) => void, reason: number) => {
    passwordRequired = reason === PasswordResponses.NEED_PASSWORD;
    update(new Error("PDF protegido por senha."));
  };
  try {
    return await processDocument(await task.promise);
  } catch (error) {
    if (passwordRequired) throw new Error("o PDF está protegido por senha.");
    if (error instanceof AttachmentPageLimitError) throw error;
    throw new Error("o PDF está ilegível ou não pôde ser preparado.");
  } finally {
    await task.destroy();
  }
}

class AttachmentPageLimitError extends Error {
  constructor() {
    super(`o PDF excede o limite de ${MONTH_PAGE_LIMIT} páginas de comprovantes.`);
  }
}

export function countPdfPages(file: Blob) {
  return withPdf(file, async (pdf) => {
    if (pdf.numPages > MONTH_PAGE_LIMIT) throw new AttachmentPageLimitError();
    if (pdf.numPages < 1) throw new Error("PDF sem páginas.");
    for (let index = 1; index <= pdf.numPages; index++) {
      const page = await pdf.getPage(index);
      await page.getOperatorList({ intent: "print" });
      page.cleanup();
    }
    return pdf.numPages;
  });
}

/** Render only the first page at preview size, independently of print rendering. */
export function renderPdfThumbnail(file: Blob): Promise<Blob> {
  return withPdf(file, async (pdf) => {
    const page = await pdf.getPage(1);
    const canvas = document.createElement("canvas");
    try {
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(1, 320 / Math.max(base.width, base.height)) });
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      paintWhite(canvas);
      await page.render({ canvas, viewport }).promise;
      return await canvasToBlob(canvas);
    } finally {
      page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
    }
  });
}

export function renderPdfPages(
  file: Blob,
  addPage: (blob: Blob) => Promise<void>,
  options?: {
    firstPageOnly?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  },
) {
  return withPdf(file, async (pdf) => {
    const canvas = document.createElement("canvas");
    const limit = options?.firstPageOnly ? Math.min(1, pdf.numPages) : pdf.numPages;
    try {
      for (let index = 1; index <= limit; index++) {
        const page = await pdf.getPage(index);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({
          scale: printScale(base.width, base.height, options?.maxWidth, options?.maxHeight),
        });
        canvas.width = Math.max(1, Math.ceil(viewport.width));
        canvas.height = Math.max(1, Math.ceil(viewport.height));
        paintWhite(canvas);
        await page.render({ canvas, viewport, intent: "print" }).promise;
        await addPage(await canvasToBlob(canvas, "image/jpeg", options?.quality));
        page.cleanup();
      }
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  });
}
