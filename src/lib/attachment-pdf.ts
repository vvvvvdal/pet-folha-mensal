import { getDocument, GlobalWorkerOptions, PasswordResponses } from "pdfjs-dist";
import { canvasToBlob, MONTH_PAGE_LIMIT, printScale } from "./attachments";

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
    super("o PDF excede o limite de 30 páginas de comprovantes.");
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

export function renderPdfPages(file: Blob, addPage: (blob: Blob) => Promise<void>) {
  return withPdf(file, async (pdf) => {
    const canvas = document.createElement("canvas");
    try {
      for (let index = 1; index <= pdf.numPages; index++) {
        const page = await pdf.getPage(index);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({
          scale: printScale(base.width, base.height),
        });
        canvas.width = Math.max(1, Math.ceil(viewport.width));
        canvas.height = Math.max(1, Math.ceil(viewport.height));
        await page.render({ canvas, viewport, intent: "print" }).promise;
        await addPage(await canvasToBlob(canvas));
        page.cleanup();
      }
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  });
}
