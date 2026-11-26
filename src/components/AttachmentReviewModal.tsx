"use client";

import { X } from "lucide-react";
import {
  countAttachmentPages,
  effectiveAttachmentPages,
  MONTH_PAGE_LIMIT,
  type Attachment,
} from "@/lib/attachments";
import { cleanActivityDescription, formatDateBR } from "@/lib/pet-calculator";
import type { Activity } from "@/types";
import { Modal } from "./Modal";
import { AttachmentPreview } from "./AttachmentPreview";
import { AttachmentSourceMenu, type AttachmentSource } from "./AttachmentSourceMenu";
import { InlineSpinner } from "./LoadingStates";

export function formatAttachmentSize(size: number) {
  const mb = size >= 1024 * 1024;
  return (
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
      size / (mb ? 1024 * 1024 : 1024),
    ) + (mb ? "\u00A0MB" : "\u00A0KB")
  );
}

export function attachmentMeta(item: Attachment) {
  const used = effectiveAttachmentPages(item);
  const pageText =
    item.file.type === "application/pdf" && item.firstPageOnly && item.pages > 1
      ? `1ª de ${item.pages} páginas`
      : `${used} ${used === 1 ? "página" : "páginas"}`;
  return `${item.file.type === "application/pdf" ? "PDF" : "Imagem"} · ${pageText} · ${formatAttachmentSize(item.file.size)}`;
}

export function AttachmentFileInfo({ item }: { item: Attachment }) {
  return (
    <div className="attachment-file-info">
      <h3>{item.name}</h3>
      <p>{attachmentMeta(item)}</p>
    </div>
  );
}

export function PdfCoverOption({
  item,
  disabled,
  onChange,
}: {
  item: Attachment;
  disabled: boolean;
  onChange: (firstPageOnly: boolean) => void;
}) {
  if (item.file.type !== "application/pdf" || item.pages <= 1) return null;
  return (
    <label className="attachment-cover-option">
      <input
        type="checkbox"
        checked={Boolean(item.firstPageOnly)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <strong>Incluir só a 1ª página no PDF final</strong>
        <small>
          {item.firstPageOnly
            ? `Usa 1 página em vez de ${item.pages} na folha para assinatura.`
            : `Este PDF tem ${item.pages} páginas. Marque para imprimir apenas a 1ª página e economizar ${item.pages - 1} ${item.pages - 1 === 1 ? "página" : "páginas"}.`}
        </small>
      </span>
    </label>
  );
}

function ActivityOption({
  activity,
  checked,
  proven,
  showProvenBadge,
  onToggle,
}: {
  activity: Activity;
  checked: boolean;
  proven: boolean;
  showProvenBadge: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onToggle(event.target.checked)}
      />
      <span>
        <span className="choice-head-row">
          <strong>{cleanActivityDescription(activity.description)}</strong>
          {showProvenBadge && (
            <em className="choice-proof-tag" data-proven={proven ? "true" : "false"}>
              {proven ? "Com anexo" : "Sem comprovante"}
            </em>
          )}
        </span>
        <small>
          {formatDateBR(activity.date)} · {activity.start} às {activity.end}
        </small>
      </span>
    </label>
  );
}

export function ActivityChoices({
  item,
  activities,
  provenIds,
  targetActivityId = null,
  disabled,
  onChange,
}: {
  item: Attachment;
  activities: Activity[];
  provenIds: ReadonlySet<string>;
  targetActivityId?: string | null;
  disabled: boolean;
  onChange: (ids: string[]) => void;
}) {
  const ids = item.activityIds ?? [];
  const toggle = (activityId: string, nextChecked: boolean) =>
    onChange(nextChecked ? [...ids, activityId] : ids.filter((id) => id !== activityId));

  const targetActivity = targetActivityId
    ? activities.find(({ id }) => id === targetActivityId)
    : undefined;

  if (targetActivity) {
    const others = activities
      .filter(({ id }) => id !== targetActivity.id)
      .slice()
      .sort((a, b) => Number(provenIds.has(a.id)) - Number(provenIds.has(b.id)));
    const extraCount = others.filter(({ id }) => ids.includes(id)).length;

    return (
      <fieldset className="attachment-choices" disabled={disabled}>
        <legend>Atividade deste comprovante</legend>
        <ActivityOption
          activity={targetActivity}
          checked={ids.includes(targetActivity.id)}
          proven={provenIds.has(targetActivity.id)}
          showProvenBadge={false}
          onToggle={(checked) => toggle(targetActivity.id, checked)}
        />
        {others.length > 0 && (
          <details className="attachment-other-choices" open={extraCount > 0}>
            <summary>
              {extraCount > 0
                ? `Outras atividades marcadas (${extraCount} de ${others.length})`
                : `Usar também em outras atividades deste mês (${others.length})`}
            </summary>
            <div className="attachment-other-list">
              {others.map((activity) => (
                <ActivityOption
                  key={activity.id}
                  activity={activity}
                  checked={ids.includes(activity.id)}
                  proven={provenIds.has(activity.id)}
                  showProvenBadge={activities.length > 1}
                  onToggle={(checked) => toggle(activity.id, checked)}
                />
              ))}
            </div>
          </details>
        )}
        {ids.length > 0 ? (
          <button type="button" className="attachment-edit" onClick={() => onChange([])}>
            Limpar seleção
          </button>
        ) : (
          <p>Sem atividade selecionada. O arquivo ficará no final dos comprovantes.</p>
        )}
      </fieldset>
    );
  }

  const ordered = activities.slice().sort((a, b) => {
    const rank = (act: Activity) => (ids.includes(act.id) ? 0 : !provenIds.has(act.id) ? 1 : 2);
    return rank(a) - rank(b);
  });

  return (
    <fieldset className="attachment-choices" disabled={disabled}>
      <legend>Quais atividades este arquivo comprova?</legend>
      {ordered.length ? (
        ordered.map((activity) => (
          <ActivityOption
            key={activity.id}
            activity={activity}
            checked={ids.includes(activity.id)}
            proven={provenIds.has(activity.id)}
            showProvenBadge={provenIds.size > 0 && provenIds.size < activities.length}
            onToggle={(checked) => toggle(activity.id, checked)}
          />
        ))
      ) : (
        <p>Você ainda não registrou atividades neste mês.</p>
      )}
      {ids.length > 0 ? (
        <button type="button" className="attachment-edit" onClick={() => onChange([])}>
          Limpar seleção
        </button>
      ) : (
        <p>Sem atividade selecionada. O arquivo ficará no final dos comprovantes.</p>
      )}
    </fieldset>
  );
}

export function AttachmentReviewModal({
  drafts,
  activities,
  savedPages,
  provenIds,
  targetActivityId = null,
  busy,
  reviewErrors,
  onClose,
  onSave,
  onAddMore,
  onUpdateDrafts,
}: {
  drafts: Attachment[];
  activities: Activity[];
  savedPages: number;
  provenIds: ReadonlySet<string>;
  targetActivityId?: string | null;
  busy: boolean;
  reviewErrors: string[];
  onClose: () => void;
  onSave: () => void;
  onAddMore: (source: AttachmentSource) => void;
  onUpdateDrafts: (updater: (current: Attachment[]) => Attachment[]) => void;
}) {
  const activityIds = new Set(activities.map(({ id }) => id));
  const stagedPages = countAttachmentPages(drafts, activityIds);
  const totalPages = savedPages + stagedPages;
  const overPageLimit = totalPages > MONTH_PAGE_LIMIT;
  const excessPages = totalPages - MONTH_PAGE_LIMIT;

  return (
    <Modal isOpen label="Conferir comprovantes" variant="editor" onClose={onClose}>
      <section className="editor-panel attachment-review">
        <header className="editor-head">
          <div>
            <h2>Conferir comprovantes</h2>
            <p>
              {drafts.length} {drafts.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Fechar conferência"
            disabled={busy}
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="editor-body">
          <ol className="review-files">
            {drafts.map((item) => (
              <li key={item.id} className="review-file">
                <div className="review-file-heading">
                  <AttachmentPreview item={item} />
                  <AttachmentFileInfo item={item} />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Retirar ${item.name} da seleção`}
                    title="Retirar da seleção"
                    disabled={busy}
                    onClick={() =>
                      onUpdateDrafts((current) => current.filter(({ id }) => id !== item.id))
                    }
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
                <PdfCoverOption
                  item={item}
                  disabled={busy}
                  onChange={(firstPageOnly) =>
                    onUpdateDrafts((current) =>
                      current.map((draft) =>
                        draft.id === item.id ? { ...draft, firstPageOnly } : draft,
                      ),
                    )
                  }
                />
                <ActivityChoices
                  item={item}
                  activities={activities}
                  provenIds={provenIds}
                  targetActivityId={targetActivityId}
                  disabled={busy}
                  onChange={(ids) =>
                    onUpdateDrafts((current) =>
                      current.map((draft) =>
                        draft.id === item.id ? { ...draft, activityIds: ids } : draft,
                      ),
                    )
                  }
                />
              </li>
            ))}
          </ol>
          {drafts.length === 0 && (
            <p>Nenhum arquivo selecionado. Adicione um arquivo para continuar.</p>
          )}
          <AttachmentSourceMenu
            label="Adicionar mais arquivos"
            disabled={busy}
            onChoose={onAddMore}
          />
          <p className="attachment-page-budget" data-over={overPageLimit ? "true" : "false"}>
            {savedPages > 0
              ? `Páginas de comprovantes no PDF: ${savedPages} já ${savedPages === 1 ? "salva" : "salvas"} + ${stagedPages} ${stagedPages === 1 ? "nova" : "novas"} = ${totalPages} de ${MONTH_PAGE_LIMIT}.`
              : `Com esta seleção: ${totalPages} de ${MONTH_PAGE_LIMIT} páginas de comprovantes no PDF.`}
          </p>
          {overPageLimit && (
            <div className="operation-notice" role="alert">
              <p>
                Esta seleção ultrapassa o limite mensal em {excessPages}{" "}
                {excessPages === 1 ? "página" : "páginas"} ({savedPages} já{" "}
                {savedPages === 1 ? "salva" : "salvas"} + {stagedPages}{" "}
                {stagedPages === 1 ? "nova" : "novas"} = {totalPages} de {MONTH_PAGE_LIMIT}).
                Retire algum arquivo ou marque &ldquo;Incluir só a 1ª página no PDF final&rdquo;
                nos documentos longos.
              </p>
            </div>
          )}
          {reviewErrors.length > 0 && (
            <div className="operation-notice" role="alert">
              {reviewErrors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </div>
        <footer className="editor-foot">
          <button type="button" className="secondary-button" disabled={busy} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={busy || !drafts.length || overPageLimit}
            aria-busy={busy}
            onClick={onSave}
          >
            {busy && <InlineSpinner size={16} />}
            {busy ? "Salvando…" : "Salvar comprovantes"}
          </button>
        </footer>
      </section>
    </Modal>
  );
}
