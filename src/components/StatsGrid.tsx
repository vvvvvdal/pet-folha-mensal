"use client";

import { useState } from "react";
import type { Activity } from "@/types";
import { hoursByWeekOfMonth, getMonthYearLabel } from "@/lib/pet-calculator";
import { SegmentedControl, SegmentedControlItem } from "./ui/access-controls";
import "./summary-redesign.css";

const viewKey = "pet_folha_summary_view";
type SummaryView = "monthly" | "weekly";
function readView(): SummaryView {
  if (typeof window === "undefined") return "monthly";
  try { return localStorage.getItem(viewKey) === "weekly" ? "weekly" : "monthly"; }
  catch { return "monthly"; }
}

interface StatsGridProps {
  totalHours: number;
  activitiesCount: number;
  targetHours?: number;
  activities?: Activity[];
  monthKey?: string;
}

export function StatsGrid({ totalHours, activitiesCount, targetHours = 32, activities = [], monthKey }: StatsGridProps) {
  const [view, setView] = useState<SummaryView>(readView);
  function selectView(next: SummaryView) {
    setView(next);
    try { localStorage.setItem(viewKey, next); } catch { /* storage is optional */ }
  }
  const progress = Math.min(100, Math.max(0, (totalHours / targetHours) * 100));
  const weeks = monthKey ? hoursByWeekOfMonth(activities, monthKey) : [];
  return (
    <section className="frequency-summary" aria-label="Resumo da frequência"
      title="Referência: 8 h por semana, aproximadamente 32 h por mês. Confira a distribuição semanal antes do envio.">
      <div className="summary-total">
        <span>Horas no mês</span>
        <p><strong>{totalHours}</strong><span>de {targetHours} horas</span></p>
        <span className="summary-remaining">{totalHours >= targetHours ? "Referência mensal alcançada" : `faltam ${targetHours - totalHours} h`}</span>
      </div>
      <div className="summary-progress">
        <div className="summary-view-header">
          <span>{activitiesCount} {activitiesCount === 1 ? "atividade" : "atividades"}</span>
          {weeks.length > 0 && <SegmentedControl aria-label="Período do resumo">
            <SegmentedControlItem selected={view === "monthly"} onClick={() => selectView("monthly")}>Mensal</SegmentedControlItem>
            <SegmentedControlItem title="Semanas de segunda a domingo, com as atividades deste mês" selected={view === "weekly"} onClick={() => selectView("weekly")}>Semanal</SegmentedControlItem>
          </SegmentedControl>}
        </div>
        {view === "weekly" && weeks.length > 0 ? <>
          <div className="summary-weeks">{weeks.map((week) => (
            <div className="summary-week" key={week.start}>
              <div><span>{week.start === week.end ? `Dia ${week.start}` : `${week.start} a ${week.end}`}</span><span>{week.hours} de 8 h</span></div>
              <div className="progress-track" role="progressbar" aria-label={`Dias ${week.start} a ${week.end}: horas no mês`} aria-valuenow={week.hours} aria-valuemin={0} aria-valuemax={Math.max(8, week.hours)}><span style={{ width: `${Math.min(100, Math.max(0, week.hours / 8 * 100))}%` }} /></div>
            </div>
          ))}</div>
        </> : <div className="summary-week">
          <div><span>{monthKey ? getMonthYearLabel(monthKey) : "No mês"}</span><span>{totalHours} de {targetHours} h</span></div>
          <div className="progress-track" role="progressbar" aria-label="Referência mensal de horas" aria-valuenow={totalHours} aria-valuemin={0} aria-valuemax={Math.max(targetHours, totalHours)}><span style={{ width: `${progress}%` }} /></div>
        </div>}
      </div>
    </section>
  );
}
