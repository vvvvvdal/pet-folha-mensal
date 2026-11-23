"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { Activity } from "@/types";
import { getActivitiesForMonth } from "@/lib/storage";
import { getCurrentMonth, getMonthYearLabel, PROJECT_MONTHS } from "@/lib/pet-calculator";
import { Modal } from "./Modal";
import { SegmentedControl, SegmentedControlItem } from "./ui/access-controls";
import "./saved-sheets.css";

export type SheetTarget = "dashboard" | "official";
const targetKey = "pet_folha_sheets_target";
function readTarget(): SheetTarget {
  try { return localStorage.getItem(targetKey) === "dashboard" ? "dashboard" : "official"; }
  catch { return "official"; }
}

interface SavedSheetsProps {
  profileId: string;
  profileLabel: string;
  selectedMonth: string;
  onClose: () => void;
  onOpen: (month: string, target: SheetTarget) => void;
}

export function SavedSheets({ profileId, profileLabel, selectedMonth, onClose, onOpen }: SavedSheetsProps) {
  const [target, setTarget] = useState<SheetTarget>(readTarget);
  function selectTarget(next: SheetTarget) {
    setTarget(next);
    try { localStorage.setItem(targetKey, next); } catch { /* storage is optional */ }
  }
  const current = getCurrentMonth();
  const months = Array.from(new Set([...PROJECT_MONTHS, selectedMonth])).sort().map((month) => {
    let activities: Activity[] = [];
    try { activities = getActivitiesForMonth(profileId, month); } catch { /* shown as empty */ }
    const hours = activities.reduce((sum, activity) => sum + (Number.isFinite(activity.hours) ? activity.hours : 0), 0);
    return { month, count: activities.length, hours };
  });
  const years = Array.from(new Set(months.map(({ month }) => month.slice(0, 4)))).map((year) => ({
    year,
    items: months.filter(({ month }) => month.startsWith(year)),
  }));

  const card = ({ month, count, hours }: (typeof months)[number]) => {
    const name = getMonthYearLabel(month).split("/")[0];
    const isSelected = month === selectedMonth;
    const isCurrent = month === current;
    const hasRecords = count > 0;
    const tone = hours >= 32 ? "done" : isCurrent ? "current" : month < current ? "warning" : "neutral";
    return (
      <button
        key={month}
        type="button"
        className="sheet-month"
        data-selected={isSelected}
        data-current={isCurrent}
        data-empty={!hasRecords}
        aria-label={`${getMonthYearLabel(month)}: ${hasRecords ? `${hours} de 32 horas, ${count} ${count === 1 ? "atividade" : "atividades"}` : "folha vazia"}`}
        onClick={() => onOpen(month, target)}
      >
        <span className="sheet-month-top">
          <strong>{name}</strong>
          {isSelected ? (
            <span className="sheet-month-badge" data-variant="selected">Aberta</span>
          ) : isCurrent ? (
            <span className="sheet-month-badge" data-variant="current">Atual</span>
          ) : null}
        </span>
        {hasRecords ? (
          <span className="sheet-month-stats">
            <span className="sheet-month-figure"><strong>{hours} h</strong> de 32 h</span>
            <span className="sheet-month-bar" data-tone={tone} aria-hidden="true">
              <span style={{ width: `${Math.min(100, (hours / 32) * 100)}%` }} />
            </span>
            <span className="sheet-month-detail">{count} {count === 1 ? "atividade" : "atividades"}</span>
          </span>
        ) : (
          <span className="sheet-month-empty">
            <span>Sem registros</span>
            <span className="sheet-month-start">Começar folha</span>
          </span>
        )}
      </button>
    );
  };

  return (
    <Modal isOpen label="Minhas folhas" variant="editor" onClose={onClose}>
      <section className="editor-panel saved-sheets">
        <header className="editor-head">
          <div>
            <h2>Minhas folhas</h2>
            <p>{profileLabel}</p>
          </div>
          <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="editor-body saved-sheets-body">
          <div className="saved-sheets-bar">
            <p className="saved-sheets-intro">Escolha o mês para abrir ou começar uma folha.</p>
            <div className="saved-sheets-target">
              <span id="sheets-target-label">Abrir em</span>
              <SegmentedControl aria-labelledby="sheets-target-label">
                <SegmentedControlItem selected={target === "dashboard"} onClick={() => selectTarget("dashboard")}>Frequência</SegmentedControlItem>
                <SegmentedControlItem selected={target === "official"} onClick={() => selectTarget("official")}>Folha</SegmentedControlItem>
              </SegmentedControl>
            </div>
          </div>
          {years.map(({ year, items }) => {
            const grid = <div className="sheet-month-grid">{items.map(card)}</div>;
            const filled = items.filter(({ count }) => count > 0).length;
            const later = year > current.slice(0, 4) && !items.some(({ count, month }) => count || month === selectedMonth);
            return later ? (
              <details key={year} className="sheet-year sheet-year-collapsible">
                <summary>
                  <span className="sheet-year-title">{year}</span>
                  <span className="sheet-year-meta">
                    {items.length} meses · vazios
                    <ChevronDown size={18} aria-hidden="true" />
                  </span>
                </summary>
                {grid}
              </details>
            ) : (
              <section key={year} className="sheet-year" aria-labelledby={`sheets-year-${year}`}>
                <div className="sheet-year-head">
                  <h3 id={`sheets-year-${year}`}>{year}</h3>
                  <span>
                    {filled
                      ? `${filled} ${filled === 1 ? "mês com registros" : "meses com registros"}`
                      : `${items.length} meses`}
                  </span>
                </div>
                {grid}
              </section>
            );
          })}
        </div>
      </section>
    </Modal>
  );
}
