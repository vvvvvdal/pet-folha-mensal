/**
 * Regra Matemática Oficial do PET-Saúde Clima UFG:
 * Cada hora do relógio iniciada conta como 1 hora cheia.
 * Fórmula: CEILING(Saída) - FLOOR(Chegada)
 * Ex: 14:00 às 15:30 = 2h; 13:30 às 17:30 = 5h; 19:00 às 20:40 = 2h.
 */

export function calcPetHours(startTimeStr: string, endTimeStr: string): number {
  if (!startTimeStr || !endTimeStr) return 0;
  
  const [sh, sm] = startTimeStr.split(':').map(Number);
  const [eh, em] = endTimeStr.split(':').map(Number);

  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;

  const startFrac = sh + sm / 60;
  const endFrac = eh + em / 60;

  if (endFrac <= startFrac) return 0;

  const floorStart = Math.floor(startFrac);
  const ceilEnd = Math.ceil(endFrac);

  return Math.max(0, ceilEnd - floorStart);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export function getMonthYearLabel(monthKey: string): string {
  // monthKey: "2026-09"
  const [year, month] = monthKey.split('-');
  const monthNames: Record<string, string> = {
    '01': 'Janeiro',
    '02': 'Fevereiro',
    '03': 'Março',
    '04': 'Abril',
    '05': 'Maio',
    '06': 'Junho',
    '07': 'Julho',
    '08': 'Agosto',
    '09': 'Setembro',
    '10': 'Outubro',
    '11': 'Novembro',
    '12': 'Dezembro'
  };
  return `${monthNames[month] || month}/${year}`;
}
