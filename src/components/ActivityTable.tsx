"use client";

import { useState } from "react";
import { Activity, UserProfile } from "@/types";
import {
  cleanActivityDescription,
  describeWeek,
  formatDateBR,
  getMonthName,
  hoursByWeekOfMonth,
  todayKey,
  weekdayShort,
} from "@/lib/pet-calculator";
import { Pencil, Trash2, ExternalLink, Paperclip } from "lucide-react";
import { formReportStatus } from "@/lib/form-report";
import { normalizeName } from "@/lib/storage";
import { ConfirmModal } from "./ConfirmModal";
import { AttachmentSourceMenu, type AttachmentSource } from "./AttachmentSourceMenu";
import type { SummaryView } from "./StatsGrid";
import "./frequency-redesign.css";

type Filter = "all" | "pending" | "noproof";

interface ActivityTableProps {
  activities: Activity[];
  totalHours: number;
  editingId: string | null;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  user: UserProfile;
  monthLabel: string;
  monthKey?: string;
  view?: SummaryView;
  onLoadSamples: () => void;
  onClearMonth: () => void;
  onPrepareForm?: (activity: Activity) => void;
  /** Number of proofs linked to each activity; undefined while it is unknown. */
  proofCounts?: Record<string, number>;
  onOpenProofs?: (activity: Activity) => void;
  onQuickAttach?: (activity: Activity, source: AttachmentSource) => void;
  attachDisabled?: boolean;
}

function ProofChip({
  activity,
  count,
  onOpen,
  onQuickAttach,
  disabled,
}: {
  activity: Activity;
  count: number;
  onOpen?: (activity: Activity) => void;
  onQuickAttach?: (activity: Activity, source: AttachmentSource) => void;
  disabled?: boolean;
}) {
  const title = cleanActivityDescription(activity.description);
  if (count > 0) {
    return (
      <button
        type="button"
        className="proof-chip"
        data-has="true"
        onClick={() => onOpen?.(activity)}
        aria-label={`${count} ${count === 1 ? "comprovante" : "comprovantes"} de ${title}. Ver em Comprovantes`}
      >
        <Paperclip size={16} aria-hidden="true" />
        {count}
      </button>
    );
  }
  if (onQuickAttach) {
    return (
      <AttachmentSourceMenu
        label="Anexar"
        ariaLabel={`Anexar comprovante a ${title}`}
        triggerClassName="proof-chip"
        dataHas="false"
        leadingIcon={<Paperclip size={16} aria-hidden="true" />}
        disabled={Boolean(disabled)}
        onChoose={(source) => onQuickAttach(activity, source)}
      />
    );
  }
  return (
    <button
      type="button"
      className="proof-chip"
      data-has="false"
      onClick={() => onOpen?.(activity)}
      aria-label={`Anexar comprovante a ${title}`}
    >
      <Paperclip size={16} aria-hidden="true" />
      Anexar
    </button>
  );
}

export function ActivityTable({
  activities,
  totalHours,
  editingId,
  onEdit,
  onDelete,
  user,
  monthLabel,
  monthKey,
  view = "monthly",
  onLoadSamples,
  onClearMonth,
  onPrepareForm,
  proofCounts,
  onOpenProofs,
  onQuickAttach,
  attachDisabled,
}: ActivityTableProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState("");
  const modalities = [...new Set<string>(activities.map((activity) => activity.modality))];
  const selectedModality = modalities.length > 1 && modalities.includes(modality) ? modality : "";
  const term = normalizeName(query);
  const matches = activities.filter((activity) =>
    (!selectedModality || activity.modality === selectedModality) &&
    (!term || normalizeName(cleanActivityDescription(activity.description)).includes(term)),
  );
  const pending = matches.filter((activity) => formReportStatus(user, activity) !== "Enviado");
  const withoutProof = proofCounts ? matches.filter((activity) => !(proofCounts[activity.id] > 0)) : [];
  const activeFilter = filter === "noproof" && !proofCounts ? "all" : filter;
  const visible = activeFilter === "pending" ? pending : activeFilter === "noproof" ? withoutProof : matches;
  const refined = Boolean(term || selectedModality);
  const filtered = refined || activeFilter !== "all";
  const key = monthKey ?? activities[0]?.date.slice(0, 7);
  const monthName = key ? getMonthName(key) : monthLabel.split("/")[0].toLowerCase();
  const today = todayKey();
  const groups = view === "weekly" && key
    ? hoursByWeekOfMonth(activities, key)
        .map((week) => ({
          week,
          status: describeWeek(week, key, today),
          items: visible.filter((activity) => {
            const day = Number(activity.date.slice(8));
            return day >= week.start && day <= week.end;
          }),
        }))
        .filter((group) => group.items.length > 0)
    : [{ week: null, status: null, items: visible }];
  const showProofs = proofCounts !== undefined;
  const columns = showProofs ? 6 : 5;
  const weekTitle = (week: { start: number; end: number }) =>
    week.start === week.end ? `Dia ${week.start} de ${monthName}` : `Semana de ${week.start} a ${week.end} de ${monthName}`;
  const weekHead = (group: (typeof groups)[number]) => group.week && group.status && (
    <div className="week-head">
      <span className="week-title">{weekTitle(group.week)}</span>
      <span className="week-status" data-tone={group.status.tone}>{group.status.text}</span>
      <span className="week-hours">{group.week.hours} de 8 h</span>
      <span className="week-bar" aria-hidden="true" data-tone={group.status.tone}>
        <span style={{ width: `${Math.min(100, (group.week.hours / 8) * 100)}%` }} />
      </span>
    </div>
  );
  const formsCell = (activity: Activity) => {
    const state = formReportStatus(user, activity);
    return (
      <div className="record-forms">
        <span className="report-state" data-state={state}>{state}</span>
        <button className="report-launch" type="button"
          onClick={() => onPrepareForm?.(activity)}
          aria-label={"Enviar ao Forms: " + cleanActivityDescription(activity.description)}>
          Forms <ExternalLink size={14} aria-hidden="true" />
        </button>
      </div>
    );
  };
  const editButtons = (activity: Activity) => (
    <div className="record-edit">
      <button className="icon-button" onClick={() => onEdit(activity)}
        aria-label={`Editar atividade: ${cleanActivityDescription(activity.description)}`}>
        <Pencil size={18} aria-hidden="true" />
      </button>
      <button className="icon-button" onClick={() => onDelete(activity.id)}
        aria-label={`Excluir atividade: ${cleanActivityDescription(activity.description)}`}>
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </div>
  );
  const filters: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "Todas", count: matches.length },
    { value: "pending", label: "Pendentes no Forms", count: pending.length },
    ...(proofCounts ? [{ value: "noproof" as const, label: "Sem comprovante", count: withoutProof.length }] : []),
  ];
  const emptyFilterText = refined ? "Nenhuma atividade corresponde aos filtros."
    : activeFilter === "pending" ? "Nenhuma pendência do Forms neste mês."
      : "Todas as atividades deste mês têm comprovante.";

  return (
    <section className="activity-list records-v2" aria-labelledby="records-title">
      <div className="records-heading">
        <div className="records-title">
          <h2 id="records-title">Registros de {monthName}</h2>
          <p>
            {activities.length} {activities.length === 1 ? "atividade" : "atividades"} · {totalHours} h
          </p>
        </div>
        {activities.length > 0 && (
          <div className="list-filters" role="group" aria-label="Filtrar registros">
            {filters.map((item) => (
              <button key={item.value} type="button" aria-pressed={activeFilter === item.value}
                onClick={() => setFilter(item.value)}
                title={item.value === "pending" ? "O envio é confirmado por você depois de concluir no Google." : undefined}>
                {item.label} <span>{item.count}</span>
              </button>
            ))}
          </div>
        )}
        {activities.length > 0 && (
          <div className="records-refine">
            <div className="field records-search">
              <label htmlFor="records-search">Buscar atividade</label>
              <input id="records-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            {modalities.length > 1 && (
              <div className="field records-modality">
                <label htmlFor="records-modality">Modalidade</label>
                <select id="records-modality" value={selectedModality} onChange={(event) => setModality(event.target.value)}>
                  <option value="">Todas as modalidades</option>
                  {modalities.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
            )}
            {filtered && (
              <button type="button" className="text-button" onClick={() => {
                setFilter("all");
                setQuery("");
                setModality("");
                document.getElementById("records-search")?.focus();
              }}>Limpar filtros</button>
            )}
            <p className="records-result" role="status">
              {filtered ? `Mostrando ${visible.length} de ${activities.length} atividades` : ""}
            </p>
          </div>
        )}
      </div>
      {activities.length === 0 ? (
        <div className="records-empty">
          <p>Ainda não há atividades neste mês.</p>
          <a
            className="secondary-button"
            href="#nova-atividade"
            onClick={(event) => {
              const trigger = document.getElementById("add-activity-trigger");
              if (trigger) {
                event.preventDefault();
                trigger.click();
              } else document.getElementById("activity-description")?.focus();
            }}
          >
            Registrar primeira atividade
          </a>
          <details>
            <summary>Precisa de um exemplo?</summary>
            <p>
              Os exemplos são fictícios. Substitua-os pelas atividades que você
              realizou.
            </p>
            <button className="secondary-button" onClick={onLoadSamples}>
              Carregar exemplos do GAT {user.gatNumber}
            </button>
          </details>
        </div>
      ) : (
        <>
          {visible.length === 0 && <p className="records-empty">{emptyFilterText}</p>}
          <div className="record-cards">
            {groups.map((group) => (
              <div className="record-group" key={group.week?.start ?? "all"}>
                {weekHead(group)}
                {group.items.map((activity) => (
                  <article className="record-card" key={activity.id} data-editing={editingId === activity.id}>
                    <div className="record-meta">
                      <time dateTime={activity.date}>{formatDateBR(activity.date)} · {weekdayShort(activity.date)}</time>
                      <strong>{activity.hours}h</strong>
                    </div>
                    <h3>{cleanActivityDescription(activity.description)}</h3>
                    <p>{activity.start} às {activity.end} · {activity.modality}</p>
                    <div className="record-actions">
                      {showProofs && <ProofChip activity={activity} count={proofCounts[activity.id] ?? 0} onOpen={onOpenProofs} onQuickAttach={onQuickAttach} disabled={attachDisabled} />}
                      {formsCell(activity)}
                      {editButtons(activity)}
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
          <div className="records-table">
            <table>
              <caption className="sr-only">Atividades de {monthLabel}</caption>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Atividade</th>
                  <th className="record-hours">Horas</th>
                  {showProofs && <th>Comprovante</th>}
                  <th>Forms</th>
                  <th><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              {groups.map((group) => (
                <tbody key={group.week?.start ?? "all"}>
                  {group.week && (
                    <tr className="week-row">
                      <th colSpan={columns} scope="rowgroup">{weekHead(group)}</th>
                    </tr>
                  )}
                  {group.items.map((activity) => (
                    <tr key={activity.id} data-editing={editingId === activity.id}>
                      <td className="record-date">
                        <time dateTime={activity.date} title={formatDateBR(activity.date)}>
                          <strong aria-hidden="true">{activity.date.slice(8)}</strong>
                          <small aria-hidden="true">{weekdayShort(activity.date)}</small>
                          <span className="sr-only">{formatDateBR(activity.date)}</span>
                        </time>
                      </td>
                      <td>
                        <strong>{cleanActivityDescription(activity.description)}</strong>
                        <small>{activity.start} às {activity.end} · {activity.modality}</small>
                      </td>
                      <td className="record-hours">{activity.hours}h</td>
                      {showProofs && (
                        <td><ProofChip activity={activity} count={proofCounts[activity.id] ?? 0} onOpen={onOpenProofs} onQuickAttach={onQuickAttach} disabled={attachDisabled} /></td>
                      )}
                      <td>{formsCell(activity)}</td>
                      <td>{editButtons(activity)}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
          <div className="records-total">
            <span>Total do mês <strong>{totalHours}h</strong></span>
            <button className="text-button" onClick={() => setConfirmClear(true)}>
              Limpar mês
            </button>
          </div>
        </>
      )}
      <ConfirmModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          onClearMonth();
          setConfirmClear(false);
        }}
        title="Limpar atividades deste mês?"
        message={`As ${activities.length} atividades de ${monthLabel} serão removidas. Os outros meses serão preservados. Salve uma cópia antes de continuar.`}
        confirmLabel="Limpar mês"
        isDestructive
      />
    </section>
  );
}
