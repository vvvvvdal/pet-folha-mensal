import type { Activity, FormReport, UserProfile } from "@/types";
import { formatDateBR, getMonthYearLabel } from "./pet-calculator";

// First-stage fields checked against the responder form on 07/11/2026.
export const ACTIVITY_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeX_QoKztpaSkO70-FUnZ9nOvkXhOueRjC-RH08Ktveliowxw/viewform";

export const FORM_GROUPS = ["GT 1", "GT 2", "GT 3", "GT 4", "GT 5", "Orientador de Serviço"];
export const FORM_ROLES = [
  "Coordenador (a) grupo tutorial", "Tutor (a)", "Preceptor (a)",
  "Estudante", "Orientadora do Serviço", "Coordenadora Geral",
];
export const FORM_ACTIVITY_TYPES = [
  "Atividades de estudo (leitura, pesquisa)",
  "Curso EAD (só colocar no forms após conclusão do curso)",
  "Organização e administração das atividades (organização do material do PET)",
  "Visita Técnica e/ou Territorialização",
  "Estudante - práticas e vivências na realidade do trabalho (serviço ou universidade)",
  "Preceptor - atividades de supervisão e orientação dos alunos no serviço",
  "Tutores -  práticas e vivências na realidade da universidade e do trabalho",
  "Orientadores de Serviço - práticas e vivências na realidade da universidade e do trabalho",
  "Participação em eventos",
  "Reunião Interna do seu GAT",
  "Reunião entre GATs (dois ou mais juntos)",
  "Encontro Geral de todos os participantes do projeto",
  "Reuniões externas",
  "Reunião de coordenação do projeto",
  "Outros",
];

export const FORM_PARTICIPATION = [
  "Participante/ouvinte", "Monitor", "Organização/coordenador(a) do evento",
  "Apresentação de trabalhos (poster, comunicação oral)",
  "Participação como convidado em conferências, mesas redondas, minicursos e avaliação de trabalhos",
];
export const FORM_AUTHORIZERS = [
  "Ana Lucia Alves Carneiro da Silva", "Jalusa Andréia Storch Díaz", "Luciana Bronzi de Souza",
  "Naraiana de Oliveira Tavares", "Nayara Figueiredo Vieira", "Tânya Marques Cardoso",
];
const FORM_MODALITIES: Record<string, string> = {
  "Síncrona presencial": "Síncrono Presencial (Todos juntos de forma presencial no mesmo local e horário)",
  "Síncrona virtual": "Síncrono Virtual (Todos juntos de forma virtual no mesmo link e mesmo horário)",
  "Assíncrona virtual": "Assíncrono (você sozinho realizando atividades programadas)",
};

// Pergunta extra que o Forms faz conforme o tipo de atividade (etapa 2).
export interface ExtraField { key: string; label: string; options?: string[]; numeric?: boolean; optional?: boolean }
const EAD = FORM_ACTIVITY_TYPES[1];
export function extraFieldsFor(activityType: string): ExtraField[] {
  if (activityType === FORM_ACTIVITY_TYPES[3]) return [{ key: "detail", label: "Onde foi a visita técnica ou territorialização?" }];
  if (activityType === FORM_ACTIVITY_TYPES[12]) return [{ key: "detail", label: "Com quem foi a reunião externa?" }];
  if (activityType === FORM_ACTIVITY_TYPES[8]) return [
    { key: "detail", label: "Nome do evento" },
    { key: "eventKind", label: "Tipo de participação", options: FORM_PARTICIPATION, optional: true },
  ];
  if (activityType === FORM_ACTIVITY_TYPES[14]) return [{ key: "detail", label: "Qual foi a atividade?" }];
  if (activityType === EAD) return [
    { key: "detail", label: "Nome do curso EAD" },
    { key: "platform", label: "Plataforma" },
    { key: "courseHours", label: "Carga horária do curso (só número)", numeric: true },
    { key: "authorizer", label: "Quem autorizou o curso?", options: FORM_AUTHORIZERS },
  ];
  return [];
}

const FORM_FIELDS = {
  group: "entry.1919744864",
  name: "entry.1358311658",
  role: "entry.2082013109",
  date: "entry.333612427",
  month: "entry.1810741336",
  activityType: "entry.1982607485",
};
const EXTRA_ENTRIES: Record<string, string> = {
  detail: "", eventKind: "entry.1720416074", platform: "entry.2049475088",
  courseHours: "entry.1091091114", authorizer: "entry.1166941920",
  servedCount: "entry.2115801122", servedKind: "entry.1412130923",
};
// O campo "detail" muda de entry conforme o tipo.
const DETAIL_ENTRY: Record<string, string> = {
  [FORM_ACTIVITY_TYPES[3]]: "entry.636865296", [FORM_ACTIVITY_TYPES[12]]: "entry.2068027245",
  [FORM_ACTIVITY_TYPES[8]]: "entry.2090033171", [FORM_ACTIVITY_TYPES[14]]: "entry.2101167383",
  [EAD]: "entry.326083041",
};
export const FORM_EXTRA_KEYS = [...Object.keys(EXTRA_ENTRIES), "served", "declaration", "receipt"];
const SIM_NAO = ["sim", "não"];
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
function setTime(url: URL, entry: string, value: string) {
  const match = TIME.exec(value);
  if (!match) return;
  url.searchParams.set(entry + "_hour", match[1]);
  url.searchParams.set(entry + "_minute", match[2]);
}

export function defaultFormReport(user: UserProfile): FormReport {
  const roles: Record<string, string> = {
    "Estudante": "Estudante",
    "Tutor": "Tutor (a)",
    "Preceptor": "Preceptor (a)",
    "Coordenador de GAT": "Coordenador (a) grupo tutorial",
    "Orientador de Serviço": "Orientadora do Serviço",
  };
  const group = user.role === "Orientador de Serviço"
    ? "Orientador de Serviço"
    : "GT " + Number(user.gatNumber);
  return {
    group: FORM_GROUPS.includes(group) ? group : "",
    role: roles[user.role] ?? (FORM_ROLES.includes(user.role) ? user.role : ""),
    activityType: "",
  };
}

export function formSnapshot(user: UserProfile, activity: Activity, report: FormReport): string {
  // Ordered values keep the confirmation comparable after a backup round trip.
  const base = [
    user.name, user.email ?? "", user.role, user.gatNumber,
    activity.date, activity.start, activity.end, activity.description,
    activity.modality, activity.hours,
    report.group, report.role, report.activityType,
  ];
  // Sem respostas extras, mantém o formato anterior para não invalidar confirmações antigas.
  const extras = FORM_EXTRA_KEYS.map((key) => report.extra?.[key] ?? "");
  return JSON.stringify(extras.some(Boolean) ? [...base, extras] : base);
}

export function formReportStatus(user: UserProfile, activity: Activity) {
  const report = activity.formReport;
  if (!report?.confirmation) return "Pendente";
  return report.confirmation.snapshot === formSnapshot(user, activity, report)
    ? "Enviado" : "Revisar envio";
}

export function buildFormUrl(user: UserProfile, activity: Activity, report: FormReport) {
  if (!user.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email ?? "") ||
      !FORM_GROUPS.includes(report.group) || !FORM_ROLES.includes(report.role) ||
      !FORM_ACTIVITY_TYPES.includes(report.activityType) ||
      !/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(activity.date))
    throw new Error("Confira a identificação e selecione as opções do formulário.");
  const monthKey = activity.date.slice(0, 7);
  if (monthKey < "2026-08" || monthKey > "2028-08")
    throw new Error("O mês desta atividade não consta no formulário. Abra o formulário original e confira com a coordenação.");
  const url = new URL(ACTIVITY_FORM_URL);
  url.searchParams.set("usp", "pp_url");
  url.searchParams.set("emailAddress", user.email!);
  const answers = {
    group: report.group, name: user.name, role: report.role,
    date: activity.date, month: getMonthYearLabel(monthKey).toLocaleUpperCase("pt-BR"),
    activityType: report.activityType,
  };
  for (const key of Object.keys(FORM_FIELDS) as (keyof typeof FORM_FIELDS)[])
    url.searchParams.set(FORM_FIELDS[key], answers[key]);
  // Etapas seguintes: modalidade, carga, horários, atendimento e declaração.
  const modality = FORM_MODALITIES[activity.modality];
  if (modality) url.searchParams.set("entry.1054891050", modality);
  if (Number.isInteger(activity.hours) && activity.hours >= 1 && activity.hours <= 8)
    url.searchParams.set("entry.62230450", String(activity.hours));
  setTime(url, "entry.1807232520", activity.start);
  setTime(url, "entry.748998103", activity.end);
  const extra = report.extra ?? {};
  const served = SIM_NAO.includes(extra.served) ? extra.served : "não";
  url.searchParams.set("entry.1781993657", served);
  url.searchParams.set("entry.1074022684", SIM_NAO.includes(extra.declaration) ? extra.declaration : "não");
  // "Enviar uma cópia das respostas para o meu e-mail": marcada por padrão.
  if (extra.receipt !== "não") url.searchParams.set("emailReceipt", "true");
  for (const field of extraFieldsFor(report.activityType)) {
    const entry = field.key === "detail" ? DETAIL_ENTRY[report.activityType] : EXTRA_ENTRIES[field.key];
    if (entry && extra[field.key]?.trim()) url.searchParams.set(entry, extra[field.key].trim());
  }
  if (served === "sim") {
    if (extra.servedCount?.trim()) url.searchParams.set(EXTRA_ENTRIES.servedCount, extra.servedCount.trim());
    if (extra.servedKind?.trim()) url.searchParams.set(EXTRA_ENTRIES.servedKind, extra.servedKind.trim());
  }
  return url.toString();
}

export function activitySummary(activity: Activity) {
  return [
    activity.description,
    "Data: " + formatDateBR(activity.date),
    "Horário: " + activity.start + " às " + activity.end,
    "Modalidade: " + activity.modality,
    "Carga horária: " + activity.hours + "h",
  ].join("\n");
}

export function isFormReport(value: unknown): value is FormReport {
  if (!value || typeof value !== "object") return false;
  const report = value as FormReport;
  if (!FORM_GROUPS.includes(report.group) || !FORM_ROLES.includes(report.role) ||
      !FORM_ACTIVITY_TYPES.includes(report.activityType)) return false;
  if (report.extra !== undefined && (!report.extra || typeof report.extra !== "object" ||
      Object.entries(report.extra).some(([key, text]) => !FORM_EXTRA_KEYS.includes(key) || typeof text !== "string" || text.length > 300)))
    return false;
  const confirmation = report.confirmation;
  return confirmation === undefined || (
    !!confirmation && typeof confirmation.at === "string" &&
    !Number.isNaN(Date.parse(confirmation.at)) &&
    typeof confirmation.snapshot === "string" && confirmation.snapshot.length > 0
  );
}
