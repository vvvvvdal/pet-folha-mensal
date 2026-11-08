"use client";

import { useState } from "react";
import { Activity, UserProfile } from "@/types";
import { cleanActivityDescription, formatDateBR } from "@/lib/pet-calculator";
import { Pencil, Trash2, ListChecks, ExternalLink } from "lucide-react";
import { formReportStatus } from "@/lib/form-report";
import { ConfirmModal } from "./ConfirmModal";

interface ActivityTableProps {
  activities: Activity[];
  totalHours: number;
  editingId: string | null;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  user: UserProfile;
  monthLabel: string;
  onLoadSamples: () => void;
  onClearMonth: () => void;
  onPrepareForm?: (activity: Activity) => void;
}

export function ActivityTable({
  activities,
  totalHours,
  editingId,
  onEdit,
  onDelete,
  user,
  monthLabel,
  onLoadSamples,
  onClearMonth,
  onPrepareForm,
}: ActivityTableProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [pendingOnly, setPendingOnly] = useState(false);
  const pendingCount = activities.filter((activity) => formReportStatus(user, activity) !== "Enviado").length;
  const visibleActivities = pendingOnly
    ? activities.filter((activity) => formReportStatus(user, activity) !== "Enviado")
    : activities;
  const actions = (activity: Activity) => {
    const state = formReportStatus(user, activity);
    return (
      <div className="record-actions">
        <span className="report-state" data-state={state}>{state}</span>
        <button className="report-launch" type="button"
          onClick={() => onPrepareForm?.(activity)}
          aria-label={"Enviar ao Forms: " + cleanActivityDescription(activity.description)}>
          Forms <ExternalLink size={14} aria-hidden="true" />
        </button>
        <button
          className="icon-button"
          onClick={() => onEdit(activity)}
          aria-label={`Editar atividade: ${cleanActivityDescription(activity.description)}`}
        >
          <Pencil size={18} />
        </button>
        <button
          className="icon-button"
          onClick={() => onDelete(activity.id)}
          aria-label={`Excluir atividade: ${cleanActivityDescription(activity.description)}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  };
  return (
    <section className="activity-list" aria-labelledby="records-title">
      <div className="records-heading">
        <div>
          <ListChecks size={20} aria-hidden="true" />
          <h2 id="records-title">Atividades do mês</h2>
          <span>{activities.length}</span>
        </div>
        {activities.length > 0 && (
          <div className="records-tools">
            <label className="records-filter" title="O envio é confirmado por você depois de concluir no Google.">
              <input type="checkbox" checked={pendingOnly}
                onChange={(event) => setPendingOnly(event.target.checked)}
                aria-label="Mostrar só pendências do Forms" />
              Pendentes <span>{pendingCount}</span>
            </label>
            <button className="text-button" onClick={() => setConfirmClear(true)}>
              Limpar mês
            </button>
          </div>
        )}
      </div>
      {activities.length === 0 ? (
        <div className="records-empty">
          <p>Use “Adicionar atividade” para começar a folha.</p>
          <a
            className="secondary-button"
            href="#nova-atividade"
            onClick={() => document.getElementById("activity-date")?.focus()}
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
          {visibleActivities.length === 0 && <p className="records-empty">Nenhuma pendência do Forms neste mês.</p>}
          <div className="record-cards">
            {visibleActivities.map((activity) => (
              <article
                className="record-card"
                key={activity.id}
                data-editing={editingId === activity.id}
              >
                <div className="record-meta">
                  <time dateTime={activity.date}>
                    {formatDateBR(activity.date)}
                  </time>
                  <strong>{activity.hours}h</strong>
                </div>
                <h3>{cleanActivityDescription(activity.description)}</h3>
                <p>
                  {activity.start} às {activity.end} · {activity.modality}
                </p>
                {actions(activity)}
              </article>
            ))}
          </div>
          <div className="records-table">
            <table>
              <caption className="sr-only">Atividades de {monthLabel}</caption>
              <thead>
                <tr>
                  <th>Data e horário</th>
                  <th>Atividade</th>
                  <th>Horas</th>
                  <th>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    data-editing={editingId === activity.id}
                  >
                    <td>
                      <time dateTime={activity.date}>
                        {formatDateBR(activity.date)}
                      </time>
                      <small>
                        {activity.start} às {activity.end}
                      </small>
                    </td>
                    <td>
                      <strong>
                        {cleanActivityDescription(activity.description)}
                      </strong>
                      <small>{activity.modality}</small>
                    </td>
                    <td className="record-hours">{activity.hours}h</td>
                    <td>{actions(activity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="records-total">
            <span>Total do mês</span>
            <strong>{totalHours}h</strong>
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
