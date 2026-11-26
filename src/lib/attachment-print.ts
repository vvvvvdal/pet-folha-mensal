import { linkedActivityIds, type Attachment } from "./attachments";
import { cleanActivityDescription, formatDateBR, sortActivitiesChronologically } from "./pet-calculator";
import type { Activity } from "@/types";

export async function buildAttachmentPrintPages(
  items: Attachment[],
  activities: Activity[],
  images: Map<string, HTMLImageElement[]>,
) {
  const ordered = sortActivitiesChronologically(activities);
  const available = new Set(ordered.map(({ id }) => id));
  const links = new Map(items.map((item) => [item.id, linkedActivityIds(item, available)]));
  const pages = document.createDocumentFragment();

  function append(item: Attachment, activity?: Activity, position?: number) {
    const prepared = images.get(item.id) ?? [];
    prepared.forEach((image, index) => {
      const page = document.createElement("div");
      page.className = "print-attachment-page";
      const header = document.createElement("header");
      const title = document.createElement("h2");
      title.textContent = activity
        ? `Comprovantes · Atividade ${position}`
        : "Comprovantes · Sem atividade vinculada";
      header.append(title);
      if (activity) {
        const description = document.createElement("p");
        description.className = "print-attachment-description";
        description.textContent = cleanActivityDescription(activity.description);
        const schedule = document.createElement("p");
        schedule.textContent = `${formatDateBR(activity.date)} · Chegada ${activity.start} · Saída ${activity.end} · ${activity.modality}`;
        header.append(description, schedule);
      }
      const file = document.createElement("p");
      file.className = "print-attachment-file";
      const filename = document.createElement("span");
      filename.className = "print-attachment-filename";
      filename.textContent = item.name;
      file.append(filename);
      if (prepared.length > 1) {
        const pageNumber = document.createElement("span");
        pageNumber.textContent = `· Página ${index + 1} de ${prepared.length}`;
        file.append(pageNumber);
      } else if (item.file.type === "application/pdf" && item.firstPageOnly && item.pages > 1) {
        const pageNumber = document.createElement("span");
        pageNumber.textContent = `· Página 1 de ${item.pages} (1ª página)`;
        file.append(pageNumber);
      }
      header.append(file);
      const copy = image.cloneNode() as HTMLImageElement;
      copy.alt = "";
      page.append(header, copy);
      pages.append(page);
    });
  }

  ordered.forEach((activity, index) => {
    for (const item of items) {
      if (links.get(item.id)?.includes(activity.id)) append(item, activity, index + 1);
    }
  });
  for (const item of items) {
    if (!links.get(item.id)?.length) append(item);
  }
  await Promise.all(Array.from(pages.querySelectorAll("img"), (image) => image.decode()));
  return pages;
}
