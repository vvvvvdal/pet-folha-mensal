import { Activity } from "@/types";

/**
 * Regra Matemática Oficial do PET-Saúde Clima UFG:
 * Cada hora do relógio iniciada conta como 1 hora cheia.
 * Fórmula: CEILING(Saída) - FLOOR(Chegada)
 * Ex: 14:00 às 15:30 = 2h; 13:30 às 17:30 = 5h; 19:00 às 20:40 = 2h.
 */

export function calcPetHours(startTimeStr: string, endTimeStr: string): number {
  if (!startTimeStr || !endTimeStr) return 0;

  const [sh, sm] = startTimeStr.split(":").map(Number);
  const [eh, em] = endTimeStr.split(":").map(Number);

  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;

  const startFrac = sh + sm / 60;
  const endFrac = eh + em / 60;

  if (endFrac <= startFrac) return 0;

  const floorStart = Math.floor(startFrac);
  const ceilEnd = Math.ceil(endFrac);

  return Math.max(0, ceilEnd - floorStart);
}

/** Weeks start on Monday; the first and last are limited to the selected month. */
export function hoursByWeekOfMonth(activities: Activity[], monthKey: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) return [];
  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const weeks: { start: number; end: number; hours: number }[] = [];
  for (let start = 1; start <= daysInMonth;) {
    const day = new Date(Date.UTC(year, month - 1, start)).getUTCDay();
    const end = Math.min(daysInMonth, start + ((7 - day) % 7));
    weeks.push({ start, end, hours: 0 });
    start = end + 1;
  }
  for (const activity of activities) {
    if (!activity.date.startsWith(`${monthKey}-`) || !/^\d{4}-\d{2}-\d{2}$/.test(activity.date)) continue;
    const day = Number(activity.date.slice(8));
    const week = weeks.find((item) => day >= item.start && day <= item.end);
    if (week && Number.isFinite(activity.hours)) week.hours += activity.hours;
  }
  return weeks;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function getMonthYearLabel(monthKey: string): string {
  // monthKey: "2026-09"
  const [year, month] = monthKey.split("-");
  const monthNames: Record<string, string> = {
    "01": "Janeiro",
    "02": "Fevereiro",
    "03": "Março",
    "04": "Abril",
    "05": "Maio",
    "06": "Junho",
    "07": "Julho",
    "08": "Agosto",
    "09": "Setembro",
    "10": "Outubro",
    "11": "Novembro",
    "12": "Dezembro",
  };
  return `${monthNames[month] || month}/${year}`;
}

/** Month name in lower case for running text, e.g. "novembro". */
export function getMonthName(monthKey: string): string {
  return getMonthYearLabel(monthKey).split("/")[0].toLowerCase();
}

const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const pad2 = (value: number) => String(value).padStart(2, "0");

export function weekdayShort(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return "";
  return WEEKDAYS_SHORT[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

// Fixed national holidays (MM-DD). Movable and local holidays are not considered.
const FIXED_HOLIDAYS = new Set(["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25"]);

/** First business day of the following month: deadline for the signed sheet. */
export function getSubmissionDeadline(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 1));
  const isOff = () => {
    const day = date.getUTCDay();
    return day === 0 || day === 6 || FIXED_HOLIDAYS.has(`${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`);
  };
  while (isOff()) date.setUTCDate(date.getUTCDate() + 1);
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

/** Monthly handoff uses the program's date even when the participant travels. */
export function getSubmissionPeriod(now = new Date()) {
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(now);
  const current = today.slice(0, 7);
  const [year, month] = current.split("-").map(Number);
  const previous = new Date(Date.UTC(year, month - 2, 1)).toISOString().slice(0, 7);
  return { current, previous, today, due: today >= getSubmissionDeadline(previous) };
}

/** "ter, 01/12" */
export function formatShortDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${weekdayShort(dateStr)}, ${day}/${month}`;
}

export function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

export type WeekTone = "done" | "warning" | "current" | "neutral";

/** Status of a week against the 8 h weekly reference, for summaries and list headers. */
export function describeWeek(
  week: { start: number; end: number; hours: number },
  monthKey: string,
  today = todayKey(),
): { tone: WeekTone; text: string } {
  const startKey = `${monthKey}-${pad2(week.start)}`;
  const endKey = `${monthKey}-${pad2(week.end)}`;
  const partial = week.end - week.start + 1 < 7;
  if (week.hours >= 8) return { tone: "done", text: "Meta da semana" };
  if (today > endKey)
    return partial
      ? { tone: "neutral", text: "Semana parcial" }
      : { tone: "warning", text: `faltou ${8 - week.hours} h` };
  if (today >= startKey) return { tone: "current", text: "em andamento" };
  return { tone: "neutral", text: "a seguir" };
}

export function weekRangeLabel(week: { start: number; end: number }): string {
  return week.start === week.end ? `Dia ${week.start}` : `${week.start} a ${week.end}`;
}

/**
 * Normaliza e limpa a descrição da atividade removendo sufixo redundante de modalidade
 * Ex: "Reunião de Alinhamento (Síncrona virtual)" -> "Reunião de Alinhamento"
 * "Reunião do GAT 04 (Mangaba)" -> "Reunião do GAT 04 (Mangaba)" (preserva parênteses legítimos)
 */
export function cleanActivityDescription(desc: string): string {
  if (!desc) return "";
  return desc
    .replace(
      /\s*\(\s*(s[íi]ncrona\s+virtual|s[íi]ncrona\s+presencial|ass[íi]ncrona\s+virtual)\s*\)\s*$/i,
      "",
    )
    .trim();
}

/**
 * Formata a descrição da atividade para a Folha de Frequência oficial (PDF/Impressão),
 * garantindo que a modalidade oficial selecionada esteja sempre anexada ao final entre parênteses.
 * Ex: "Reunião do GAT 04 (Mangaba)" + "Síncrona virtual" -> "Reunião do GAT 04 (Mangaba) (Síncrona virtual)"
 */
export function formatActivityForSheet(
  desc: string,
  modality?: string,
): string {
  const baseDesc = cleanActivityDescription(desc);
  if (!baseDesc) return "";
  if (!modality) return baseDesc;
  return `${baseDesc} (${modality.trim()})`;
}

/**
 * Compara duas atividades por critério estritamente cronológico:
 * 1. Data (YYYY-MM-DD)
 * 2. Horário de início / entrada (HH:MM)
 * 3. Horário de término / saída (HH:MM)
 */
export function compareActivities(a: Activity, b: Activity): number {
  if (a.date !== b.date) {
    return a.date.localeCompare(b.date);
  }
  if (a.start !== b.start) {
    return a.start.localeCompare(b.start);
  }
  return a.end.localeCompare(b.end);
}

/**
 * Ordenação cronológica estável utilizando o algoritmo Merge Sort (Divisão e Conquista).
 * Complexidade temporal: O(n log n) garantida.
 */
export function sortActivitiesChronologically(
  activities: Activity[],
): Activity[] {
  if (activities.length <= 1) return [...activities];

  const mid = Math.floor(activities.length / 2);
  const left = sortActivitiesChronologically(activities.slice(0, mid));
  const right = sortActivitiesChronologically(activities.slice(mid));

  return mergeActivities(left, right);
}

function mergeActivities(left: Activity[], right: Activity[]): Activity[] {
  const result: Activity[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compareActivities(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  while (i < left.length) {
    result.push(left[i]);
    i++;
  }

  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}

export const PROJECT_MONTHS = Array.from({ length: 25 }, (_, index) => {
  const date = new Date(2026, 7 + index, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
});

export function getCurrentMonth(now = new Date()): string {
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return current < PROJECT_MONTHS[0]
    ? PROJECT_MONTHS[0]
    : current > PROJECT_MONTHS[24]
      ? PROJECT_MONTHS[24]
      : current;
}

export function getDefaultActivityDate(
  monthKey: string,
  now = new Date(),
): string {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return today.startsWith(monthKey) ? today : `${monthKey}-01`;
}
