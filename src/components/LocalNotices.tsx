"use client";
import type { Activity } from "@/types";
import { hoursByWeekOfMonth, getCurrentMonth } from "@/lib/pet-calculator";

export function LocalNotices({ activities, monthKey, hasChanges, onSaveCopy }: { activities: Activity[]; monthKey: string; hasChanges: boolean; onSaveCopy: () => void }) {
  const now = new Date();
  const day = now.getDate();
  const week = monthKey === getCurrentMonth(now) ? hoursByWeekOfMonth(activities, monthKey).find((item) => day >= item.start && day <= item.end) : null;
  return <details className="local-notices"><summary>Lembretes da folha{hasChanges ? " · cópia pendente" : ""}</summary>
    <p>Envie a folha assinada até o 1º dia útil do mês seguinte. O site não confirma o envio.</p>
    {week && week.hours < 8 && <p>De {week.start} a {week.end}: {week.hours} de 8 h de referência. Confira também as atividades fora deste mês quando a semana atravessar a virada.</p>}
    {hasChanges && <div><p>Há alterações nesta sessão desde a última cópia.</p><button type="button" className="secondary-button" onClick={onSaveCopy}>Salvar cópia agora</button></div>}
  </details>;
}
