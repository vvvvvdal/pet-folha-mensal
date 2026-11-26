import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Activity, UserProfile } from "@/types";
import { listAttachments, prepareAttachmentPages } from "./attachments";
import { buildAttachmentPrintPages } from "./attachment-print";
import { formatActivityForSheet, formatDateBR, getMonthYearLabel, sortActivitiesChronologically } from "./pet-calculator";

export const blankSheetUrl = "/templates/PET%20-%20Folha%20de%20Frequ%C3%AAncia%20-%20Modelo%20Vazio.pdf";

const institution = [
  "Ministério da Saúde\nSecretaria de Gestão do Trabalho e da Educação na Saúde\nDepartamento de Gestão da Educação na Saúde",
  "Secretaria Municipal de Saúde de Goiânia\nSecretaria Estadual de Saúde de Goiás\nUniversidade Federal de Goiás",
];

async function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function fetchFile(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível carregar o modelo oficial.");
  return response.blob();
}

export async function createSheetPdf(
  user: UserProfile,
  monthKey: string,
  activities: Activity[],
  blank: boolean,
  onProgress: (done: number, total: number) => void,
  allowWithoutProofs: () => Promise<boolean>,
): Promise<File | null> {
  if (blank) return new File([await fetchFile(blankSheetUrl)], "PET Folha - Modelo em branco.pdf", { type: "application/pdf" });

  const [engine, times, helvetica, logo] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/standard-fonts/Times"),
    import("pdfmake/build/standard-fonts/Helvetica"),
    fetchFile("/images/logo-horizontal.png").then(dataUrl),
  ]);
  const pdfmake = engine.default;
  pdfmake.addFontContainer(times.default);
  pdfmake.addFontContainer(helvetica.default);
  const ordered = sortActivitiesChronologically(activities);
  const text = (value: string, bold = false) => ({ text: value, bold });
  const total = ordered.reduce((sum, item) => sum + item.hours, 0);
  const rows = ordered.map((activity) => [
    { text: formatDateBR(activity.date), alignment: "center" as const },
    { text: activity.start, alignment: "center" as const },
    { text: activity.end, alignment: "center" as const },
    formatActivityForSheet(activity.description, activity.modality),
  ]);
  const content: Content[] = [
    { columns: [
      { text: institution[0], width: "*", alignment: "center", font: "Helvetica", fontSize: 8.5 },
      { image: logo, fit: [180, 44], width: 180, alignment: "center" },
      { text: institution[1], width: "*", alignment: "center", font: "Helvetica", fontSize: 8.5 },
    ], columnGap: 12 },
    { text: "Folha de Frequência Mensal*", bold: true, fontSize: 16, alignment: "center", margin: [0, 9] },
    { text: [text("Nome: ", true), user.name], margin: [0, 0, 0, 6] },
    { columns: [
      { text: [text("Perfil**: ", true), user.role] },
      { text: [text("Nº do GAT: ", true), user.gatNumber] },
      { text: [text("Mês/ano: ", true), getMonthYearLabel(monthKey)] },
    ], margin: [0, 0, 0, 8] },
    { table: {
      headerRows: 1,
      widths: [80, 90, 90, "*"],
      dontBreakRows: true,
      body: [
        ["Data", "Horário de\nChegada", "Horário de\nSaída", "Atividade"].map((label) => ({ text: label, bold: true, alignment: "center" as const })),
        ...rows,
        ...Array.from({ length: Math.max(0, 10 - rows.length) }, () => [" ", " ", " ", " "]),
      ],
    }, layout: { paddingTop: () => 4, paddingBottom: () => 4, paddingLeft: () => 6, paddingRight: () => 6 } },
    { unbreakable: true, stack: [
      { text: `TOTAL: ${total} ${total === 1 ? "hora" : "horas"}`, bold: true, margin: [0, 5, 0, 0] },
      { columns: [
        { text: "Assinatura do Participante", alignment: "center" },
        { text: "Assinatura da Supervisão do GAT", alignment: "center" },
      ], margin: [0, 42, 0, 16] },
      { text: "**Estudante, Orientador de Serviço, Preceptor, Tutor, Coordenador de GAT", fontSize: 7.5 },
    ] },
  ];

  const images: Record<string, string> = {};
  try {
    const items = await listAttachments({ profileId: user.id, monthKey });
    if (items.length) {
      const proofContent: Content[] = [];
      const { pagesByAttachment, release } = await prepareAttachmentPages(items, {
        activityIds: new Set(activities.map(({ id }) => id)),
        onProgress,
      });
      try {
        const pages = await buildAttachmentPrintPages(items, ordered, pagesByAttachment);
        const keys = new Map<string, string>();
        for (const page of Array.from(pages.children)) {
          const proof = page.querySelector("img");
          if (!proof) continue;
          let key = keys.get(proof.src);
          if (!key) {
            key = `comprovante${keys.size}`;
            images[key] = await dataUrl(await (await fetch(proof.src)).blob());
            keys.set(proof.src, key);
          }
          const header = Array.from(page.querySelector("header")?.children ?? []).map((child, index) => ({
            text: child.textContent?.trim().replace(/\s*·\s*/g, " · ") ?? "",
            bold: index === 0,
            fontSize: index === 0 ? 13 : 10,
            margin: [0, 0, 0, 4] as [number, number, number, number],
          }));
          const headerLines = header.reduce((lines, line) => lines + Math.max(1, Math.ceil(line.text.length / 125)), 0);
          proofContent.push({ pageBreak: "before", unbreakable: true, stack: [
            ...header,
            { image: key, fit: [780, Math.max(160, 516 - headerLines * 15)], alignment: "center", margin: [0, 6, 0, 0] },
          ] });
        }
        content.push(...proofContent);
      } finally {
        release();
      }
    }
  } catch {
    if (!(await allowWithoutProofs())) return null;
  }

  const definition: TDocumentDefinitions = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [26, 26, 26, 26],
    defaultStyle: { font: "Times", fontSize: 10 },
    content,
    images,
  };
  const blob = await pdfmake.createPdf(definition).getBlob();
  return new File([blob], `PET Folha - ${monthKey}.pdf`, { type: "application/pdf" });
}
