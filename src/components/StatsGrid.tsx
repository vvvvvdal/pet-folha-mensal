"use client";

import { useState } from "react";
import type { Activity } from "@/types";
import {
  describeWeek,
  formatShortDate,
  getMonthName,
  getSubmissionDeadline,
  hoursByWeekOfMonth,
  todayKey,
  weekRangeLabel,
} from "@/lib/pet-calculator";
import { SegmentedControl, SegmentedControlItem } from "./ui/access-controls";
import "./summary-redesign.css";
import "./frequency-redesign.css";

const viewKey = "pet_folha_summary_view";
export type SummaryView = "monthly" | "weekly";
function readView(): SummaryView {
  if (typeof window === "undefined") return "monthly";
  try { return localStorage.getItem(viewKey) === "weekly" ? "weekly" : "monthly"; }
  catch { return "monthly"; }
}

/** Monthly/weekly choice shared by the summary and the activity list, kept in the browser. */
export function useSummaryView() {
  const [view, setView] = useState<SummaryView>(readView);
  function select(next: SummaryView) {
    setView(next);
    try { localStorage.setItem(viewKey, next); } catch { /* storage is optional */ }
  }
  return [view, select] as const;
}

interface StatsGridProps {
  totalHours: number;
  activitiesCount: number;
  targetHours?: number;
  activities?: Activity[];
  monthKey?: string;
  formsPending?: number;
  view?: SummaryView;
  onViewChange?: (view: SummaryView) => void;
}

function Progress({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return (
    <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={Math.max(max, value)} data-tone={tone}>
      <span style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }} />
    </div>
  );
}

export function StatsGrid({ totalHours, activitiesCount, targetHours = 32, activities = [], monthKey, formsPending, view: controlledView, onViewChange }: StatsGridProps) {
  const [ownView, setOwnView] = useSummaryView();
  const view = controlledView ?? ownView;
  const selectView = onViewChange ?? setOwnView;
  const weeks = monthKey ? hoursByWeekOfMonth(activities, monthKey) : [];
  const today = todayKey();
  const currentWeek = monthKey && today.startsWith(monthKey)
    ? weeks.find((week) => Number(today.slice(8)) >= week.start && Number(today.slice(8)) <= week.end)
    : undefined;
  const fullWeeks = monthKey ? weeks.filter((week) => week.end - week.start === 6) : [];
  const deadline = monthKey ? getSubmissionDeadline(monthKey) : "";
  const remaining = Math.max(0, targetHours - totalHours);
  return (
    <section className="frequency-summary summary-v2" aria-label="Resumo da frequência">
      <div className="summary-v2-head">
        <h2>{monthKey ? `Resumo de ${getMonthName(monthKey)}` : "Resumo do mês"}</h2>
        {weeks.length > 0 && (
          <SegmentedControl aria-label="Período do resumo e da lista">
            <SegmentedControlItem selected={view === "monthly"} onClick={() => selectView("monthly")}>Mensal</SegmentedControlItem>
            <SegmentedControlItem title="Semanas de segunda a domingo, com as atividades deste mês" selected={view === "weekly"} onClick={() => selectView("weekly")}>Semanal</SegmentedControlItem>
          </SegmentedControl>
        )}
      </div>
      {view === "weekly" && weeks.length > 0 ? (
        <div className="summary-v2-tiles" data-view="weekly">
          {weeks.map((week) => {
            const status = monthKey ? describeWeek(week, monthKey, today) : { tone: "neutral", text: "" };
            return (
              <div className="summary-tile" key={week.start}>
                <span className="summary-tile-label">{weekRangeLabel(week)}</span>
                <p className="summary-figure"><strong>{week.hours}</strong> <span>de 8 h</span></p>
                <Progress label={`Dias ${week.start} a ${week.end}: horas no mês`} value={week.hours} max={8} tone={status.tone} />
                <span className="summary-status" data-tone={status.tone}>{status.text}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="summary-v2-tiles" data-view="monthly">
          <div className="summary-tile">
            <span className="summary-tile-label">Horas no mês</span>
            <p className="summary-figure"><strong>{totalHours}</strong> <span>de {targetHours} h</span></p>
            <Progress label="Referência mensal de horas" value={totalHours} max={targetHours} tone="done" />
            <span className="summary-status">
              {remaining > 0 && `Faltam ${remaining} h · `}{activitiesCount} {activitiesCount === 1 ? "atividade" : "atividades"}
            </span>
          </div>
          {currentWeek ? (
            <div className="summary-tile">
              <span className="summary-tile-label">Esta semana · {weekRangeLabel(currentWeek)}</span>
              <p className="summary-figure"><strong>{currentWeek.hours}</strong> <span>de 8 h</span></p>
              <Progress label="Horas desta semana" value={currentWeek.hours} max={8} tone={currentWeek.hours >= 8 ? "done" : "current"} />
              <span className="summary-status">{currentWeek.hours >= 8 ? "Meta da semana alcançada" : `faltam ${8 - currentWeek.hours} h até domingo`}</span>
            </div>
          ) : fullWeeks.length > 0 && (
            <div className="summary-tile">
              <span className="summary-tile-label">Semanas com 8 h</span>
              <p className="summary-figure"><strong>{fullWeeks.filter((week) => week.hours >= 8).length}</strong> <span>de {fullWeeks.length} semanas completas</span></p>
              <span className="summary-status">Use Semanal para ver cada semana.</span>
            </div>
          )}
          {deadline && (
            <div className="summary-tile">
              <span className="summary-tile-label">Entrega da folha assinada</span>
              <p className="summary-figure summary-deadline"><strong>{formatShortDate(deadline)}</strong></p>
              {formsPending !== undefined && (
                <span className="summary-status" data-tone={formsPending ? "warning" : "done"}>
                  {formsPending ? `${formsPending} ${formsPending === 1 ? "atividade pendente" : "atividades pendentes"} no Forms` : "Forms em dia"}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
