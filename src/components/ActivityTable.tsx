"use client";

import { useState } from "react";
import { Activity, UserProfile } from "@/types";
import { cleanActivityDescription, formatDateBR } from "@/lib/pet-calculator";
import { Pencil, Trash2, ListChecks } from "lucide-react";
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
}: ActivityTableProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const actions = (activity: Activity) => (
    <div className="record-actions">
      <button
        className="icon-button"
        onClick={() => onEdit(activity)}
        aria-label={`Editar atividade: ${cleanActivityDescription(activity.description)}`}
      >
        <Pencil size={19} />
      </button>
      <button
        className="icon-button"
        onClick={() => onDelete(activity.id)}
        aria-label={`Excluir atividade: ${cleanActivityDescription(activity.description)}`}
      >
        <Trash2 size={19} />
      </button>
    </div>
  );
  return (
    <section className="activity-list" aria-labelledby="records-title">
      <div className="records-heading">
        <div>
          <ListChecks size={20} aria-hidden="true" />
          <h2 id="records-title">Atividades do mês</h2>
          <span>{activities.length}</span>
        </div>
        {activities.length > 0 && (
          <button className="text-button" onClick={() => setConfirmClear(true)}>
            Limpar mês
          </button>
        )}
      </div>
      {activities.length === 0 ? (
        <div className="records-empty">
          <ListChecks size={32} aria-hidden="true" />
          <h3>Sua primeira atividade começa aqui</h3>
          <p>
            Preencha “Adicionar atividade” para começar a folha de {monthLabel}.
          </p>
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
          <div className="record-cards">
            {activities.map((activity) => (
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
                {activities.map((activity) => (
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
