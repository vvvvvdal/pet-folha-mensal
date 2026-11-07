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

const FORM_FIELDS = {
  group: "entry.1919744864",
  name: "entry.1358311658",
  role: "entry.2082013109",
  date: "entry.333612427",
  month: "entry.1810741336",
  activityType: "entry.1982607485",
};

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
  return JSON.stringify([
    user.name, user.email ?? "", user.role, user.gatNumber,
    activity.date, activity.start, activity.end, activity.description,
    activity.modality, activity.hours,
    report.group, report.role, report.activityType,
  ]);
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
  const confirmation = report.confirmation;
  return confirmation === undefined || (
    !!confirmation && typeof confirmation.at === "string" &&
    !Number.isNaN(Date.parse(confirmation.at)) &&
    typeof confirmation.snapshot === "string" && confirmation.snapshot.length > 0
  );
}
