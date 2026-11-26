"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { ChevronDown, Trash2, X, Paperclip, CircleAlert, ListFilter, Image as ImageIcon, FileText } from "lucide-react";
import {
  prepareAttachmentFiles,
  savePreparedAttachments,
  ATTACHMENT_LIMIT_MB,
  countAttachmentPages,
  linkedActivityIds,
  listAttachments,
  MONTH_LIMIT_MB,
  MONTH_PAGE_LIMIT,
  removeAttachment,
  updateAttachmentLinks,
  type Attachment,
} from "@/lib/attachments";
import { formatDateBR, cleanActivityDescription, getMonthName, weekdayShort } from "@/lib/pet-calculator";
import type { Activity } from "@/types";
import { useDialog } from "@/context/DialogContext";
import { Modal } from "./Modal";
import { AttachmentPreview } from "./AttachmentPreview";
import { AttachmentSourceMenu, type AttachmentSource } from "./AttachmentSourceMenu";
import {
  ActivityChoices,
  AttachmentFileInfo,
  AttachmentReviewModal,
  attachmentMeta,
  PdfCoverOption,
} from "./AttachmentReviewModal";
import { AttachmentsListSkeleton, InlineSpinner, OperationProgressModal } from "./LoadingStates";
import "./attachments-ui.css";
import "./attachments-redesign.css";

interface Props {
  profileId: string;
  monthKey: string;
  activities: Activity[];
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onChange: () => void;
  /** Shows only the proofs of one activity, chosen in the activity list or on a proof. */
  focusActivityId?: string | null;
  onFocusChange?: (activityId: string | null) => void;
}

type LinkFilter = "all" | "linked" | "unlinked";

function activityLabel(activity: Activity) {
  return `${formatDateBR(activity.date)} · ${cleanActivityDescription(activity.description)}`;
}

export function MonthlyAttachments({
  profileId,
  monthKey,
  activities,
  busy,
  onBusyChange,
  onChange,
  focusActivityId = null,
  onFocusChange,
}: Props) {
  const { confirm } = useDialog();
  const headingId = useId();
  const galleryInput = useRef<HTMLInputElement>(null);
  const filesInput = useRef<HTMLInputElement>(null);
  const preselect = useRef<string | null>(null);
  const activeOp = useRef<Promise<void>>(Promise.resolve());
  const localBusy = useRef(false);
  const [items, setItems] = useState<Attachment[] | null>(null);
  const [linkFilter, setLinkFilter] = useState<LinkFilter>("all");
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [drafts, setDrafts] = useState<Attachment[] | null>(null);
  const [reviewTargetId, setReviewTargetId] = useState<string | null>(null);
  const [reviewErrors, setReviewErrors] = useState<string[]>([]);
  const [prepareProgress, setPrepareProgress] = useState<{ done: number; total: number } | null>(null);
  const [editing, setEditing] = useState<Attachment | null>(null);
  const [linkError, setLinkError] = useState("");

  const activityIds = new Set(activities.map(({ id }) => id));
  const pages = items ? countAttachmentPages(items, activityIds) : 0;
  const monthShort = getMonthName(monthKey).slice(0, 3).toUpperCase();
  const focusActivity = focusActivityId
    ? activities.find(({ id }) => id === focusActivityId)
    : undefined;
  const linkedTo = (item: Attachment) => linkedActivityIds(item, activityIds);
  const files = items?.map((item) => ({ item, links: linkedTo(item) })) ?? [];
  const linkedCount = files.filter(({ links }) => links.length > 0).length;
  const visibleFiles = files.filter(({ links }) =>
    focusActivity ? links.includes(focusActivity.id)
      : linkFilter === "all" || (linkFilter === "linked" ? links.length > 0 : links.length === 0),
  );
  const filters: { value: LinkFilter; label: string; count: number }[] = [
    { value: "all", label: "Todos", count: files.length },
    { value: "linked", label: "Com atividade", count: linkedCount },
    { value: "unlinked", label: "Sem atividade", count: files.length - linkedCount },
  ];
  const proven = new Set(files.flatMap(({ links }) => links));
  const withoutProof = activities.filter(({ id }) => !proven.has(id));

  useEffect(() => {
    let current = true;
    listAttachments({ profileId, monthKey })
      .then((next) => {
        if (current) setItems(next);
      })
      .catch(() => {
        if (current) setErrors(["Não foi possível abrir os comprovantes. Tente novamente."]);
      });
    return () => {
      current = false;
    };
  }, [profileId, monthKey, attempt]);

  useEffect(() => {
    if (!drafts?.length) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [drafts]);

  function choose(activityId: string | null, source: AttachmentSource = "files") {
    preselect.current = activityId;
    if (source === "gallery") galleryInput.current?.click();
    else filesInput.current?.click();
  }

  function runExclusive(task: () => Promise<void>) {
    const next = activeOp.current.then(task, task);
    activeOp.current = next;
    return next;
  }

  async function prepare(files: File[]) {
    const activityId = preselect.current;
    preselect.current = null;
    if (!files.length || (busy && !localBusy.current)) return;
    await runExclusive(async () => {
      localBusy.current = true;
      onBusyChange(true);
      setPrepareProgress({ done: 0, total: files.length });
      setStatus("");
      setErrors([]);
      try {
        const result = await prepareAttachmentFiles(files, (done, total) => {
          setPrepareProgress({ done, total });
        });
        const effectiveTarget = activityId ?? reviewTargetId;
        const accepted = effectiveTarget
          ? result.accepted.map((item) => ({ ...item, activityIds: [effectiveTarget] }))
          : result.accepted;
        if (activityId !== null && drafts === null) {
          setReviewTargetId(activityId);
        } else if (drafts === null) {
          setReviewTargetId(null);
        }
        setDrafts((current) => [...(current ?? []), ...accepted]);
        setReviewErrors(result.rejected);
      } catch {
        setErrors(["Não foi possível preparar os arquivos. Tente novamente."]);
      } finally {
        setPrepareProgress(null);
        localBusy.current = false;
        onBusyChange(false);
      }
    });
  }

  async function closeReview() {
    if (busy) return;
    if (
      drafts?.length &&
      !(await confirm({
        title: "Descartar arquivos selecionados?",
        message:
          "Os arquivos desta seleção ainda não foram salvos. Os comprovantes já salvos serão mantidos.",
        confirmText: "Descartar seleção",
        cancelText: "Continuar conferindo",
        variant: "warning",
      }))
    )
      return;
    setDrafts(null);
    setReviewTargetId(null);
    setReviewErrors([]);
  }

  async function saveDrafts() {
    if (!drafts?.length || busy) return;
    const batch = drafts;
    await runExclusive(async () => {
      localBusy.current = true;
      onBusyChange(true);
      setReviewErrors([]);
      try {
        setItems(await savePreparedAttachments({ profileId, monthKey }, batch));
        setDrafts(null);
        setReviewTargetId(null);
        setStatus("Comprovantes salvos.");
        onChange();
      } catch (error) {
        setReviewErrors([
          error instanceof Error
            ? error.message
            : "Não foi possível salvar. Confira os arquivos e tente novamente.",
        ]);
      } finally {
        localBusy.current = false;
        onBusyChange(false);
      }
    });
  }

  async function saveLinks() {
    if (!editing || busy) return;
    onBusyChange(true);
    setLinkError("");
    try {
      setItems(
        await updateAttachmentLinks(
          { profileId, monthKey },
          editing.id,
          editing.activityIds ?? [],
          editing.firstPageOnly,
        ),
      );
      setEditing(null);
      setStatus("Atividades atualizadas.");
      onChange();
    } catch (error) {
      setLinkError(
        error instanceof Error ? error.message : "Não foi possível salvar. Tente novamente.",
      );
    } finally {
      onBusyChange(false);
    }
  }

  async function remove(item: Attachment) {
    if (
      busy ||
      !(await confirm({
        title: "Remover comprovante?",
        message: `O arquivo “${item.name}” será removido de todas as atividades deste mês.`,
        confirmText: "Remover arquivo",
        variant: "danger",
      }))
    )
      return;
    onBusyChange(true);
    setErrors([]);
    setStatus("");
    try {
      setItems(await removeAttachment({ profileId, monthKey }, item.id));
      setStatus("Comprovante removido.");
      onChange();
    } catch {
      setErrors(["Não foi possível remover o comprovante. Tente novamente."]);
    } finally {
      onBusyChange(false);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void prepare(files);
  }

  const headerTargetId = focusActivity?.id ?? null;

  return (
    <section className="attachments-panel attachments-v2" aria-labelledby={headingId}>
      <header className="attachments-heading">
        <div>
          <h2 id={headingId}>Arquivos deste mês</h2>
          <p>
            {focusActivity
              ? `Novos envios aqui já entram vinculados a ${activityLabel(focusActivity)}.`
              : "Adicione fotos da galeria ou PDFs e escolha as atividades que eles comprovam."}
          </p>
        </div>
        <div className="attachments-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={busy || !items}
            onClick={() => choose(headerTargetId, "gallery")}
          >
            <ImageIcon size={18} aria-hidden="true" />
            Fotos da galeria
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={busy || !items}
            onClick={() => choose(headerTargetId, "files")}
          >
            <FileText size={18} aria-hidden="true" />
            PDF ou arquivos
          </button>
        </div>
      </header>
      <input
        ref={galleryInput}
        className="sr-only"
        type="file"
        multiple
        aria-label="Adicionar fotos da galeria"
        accept="image/*"
        disabled={busy || !items}
        onChange={handleInputChange}
      />
      <input
        ref={filesInput}
        className="sr-only"
        type="file"
        multiple
        aria-label="Adicionar comprovantes"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        disabled={busy || !items}
        onChange={handleInputChange}
      />
      <div className="attachments-meta">
        <p>
          {items
            ? `${items.length} ${items.length === 1 ? "arquivo" : "arquivos"} · ${pages} de ${MONTH_PAGE_LIMIT} páginas no PDF${activities.length ? ` · ${activities.length - withoutProof.length} de ${activities.length} atividades com comprovante` : ""}`
            : "Carregando comprovantes…"}
        </p>
        <details>
          <summary>Formatos e limites<ChevronDown size={16} aria-hidden="true" /></summary>
          <p>
            PDF, JPEG, PNG e WebP. Até {ATTACHMENT_LIMIT_MB} MB por arquivo e {MONTH_LIMIT_MB} MB
            por mês. O PDF pode ter até {MONTH_PAGE_LIMIT} páginas de comprovantes (em PDFs longos,
            você pode incluir só a 1ª página). Um arquivo usado em duas atividades aparece duas
            vezes no PDF.
          </p>
        </details>
      </div>
      {prepareProgress && (
        <OperationProgressModal
          inline
          title="Preparando comprovantes"
          done={prepareProgress.done}
          total={prepareProgress.total}
          steps={[
            {
              label: "Validando formato e otimizando tamanho para o PDF",
              state: "active",
            },
          ]}
        />
      )}
      {focusActivity && (
        <div className="attachments-focus" role="status">
          <ListFilter size={18} aria-hidden="true" />
          <p>
            Mostrando os comprovantes de <strong>{activityLabel(focusActivity)}</strong>
          </p>
          <div>
            <AttachmentSourceMenu
              label="Adicionar para esta atividade"
              disabled={busy || !items}
              onChoose={(source) => choose(focusActivity.id, source)}
            />
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setLinkFilter("all");
                onFocusChange?.(null);
              }}
            >
              Ver todos
            </button>
          </div>
        </div>
      )}
      {!focusActivity && files.length > 0 && (
        <div className="list-filters attachment-filters" role="group" aria-label="Filtrar comprovantes">
          {filters.map(({ value, label, count }) => (
            <button key={value} type="button" aria-pressed={linkFilter === value} onClick={() => setLinkFilter(value)}>
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
      )}
      {!focusActivity && linkFilter === "all" && files.length > 0 && withoutProof.length > 0 && (
        <details className="attachments-missing" open={withoutProof.length <= 3}>
          <summary>Atividades sem comprovante ({withoutProof.length})</summary>
          <ul>
            {withoutProof.map((activity) => (
              <li key={activity.id}>
                <span>{activityLabel(activity)}</span>
                <AttachmentSourceMenu
                  label="Anexar"
                  ariaLabel={`Anexar comprovante a ${activityLabel(activity)}`}
                  disabled={busy}
                  onChoose={(source) => choose(activity.id, source)}
                />
              </li>
            ))}
          </ul>
        </details>
      )}
      {items === null && errors.length === 0 && <AttachmentsListSkeleton />}
      {items?.length === 0 && (
        <div className="attachments-empty">
          <Paperclip size={28} aria-hidden="true" />
          <h3>Nenhum comprovante neste mês</h3>
          <p>Você pode adicionar arquivos se o seu GAT solicitar.</p>
        </div>
      )}
      {files.length > 0 && visibleFiles.length === 0 && (
        <p className="attachments-focus-empty" role="status">
          {focusActivity ? "Esta atividade ainda não tem comprovante."
            : linkFilter === "linked" ? "Nenhum comprovante vinculado a uma atividade."
              : "Todos os comprovantes estão vinculados a atividades."}
        </p>
      )}
      {visibleFiles.length > 0 && (
        <ol className="attachments-list">
          {visibleFiles.map(({ item, links }) => {
            const linked = activities.filter(({ id }) => links.includes(id));
            return (
              <li key={item.id} className="attachment-row">
                <AttachmentPreview item={item} />
                <div className="attachment-details">
                  {linked.length ? (
                    <p className="attachment-count">
                      Comprova {linked.length} {linked.length === 1 ? "atividade" : "atividades"}
                    </p>
                  ) : (
                    <p className="attachment-unlinked">
                      <CircleAlert size={16} aria-hidden="true" />
                      Sem atividade · entra no final dos comprovantes
                    </p>
                  )}
                  {linked.length > 0 && (
                    <ul aria-label="Atividades vinculadas" className="attachment-linked">
                      {linked.map((activity) => (
                        <li key={activity.id}>
                          <button
                            type="button"
                            className="activity-chip"
                            aria-pressed={focusActivity?.id === activity.id}
                            onClick={() => onFocusChange?.(activity.id)}
                            title={`Ver só os comprovantes de ${activityLabel(activity)}`}
                          >
                            <span className="activity-chip-date" aria-hidden="true">
                              <strong>{activity.date.slice(8)}</strong>
                              <span>{monthShort}</span>
                            </span>
                            <span className="activity-chip-text">
                              <strong>{cleanActivityDescription(activity.description)}</strong>
                              <small>
                                {formatDateBR(activity.date)} · {weekdayShort(activity.date)} ·{" "}
                                {activity.start} às {activity.end} · {activity.hours} h
                              </small>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="attachment-file-line">
                    <span className="attachment-file-name" title={item.name}>
                      {item.name}
                    </span>
                    <span>
                      · {attachmentMeta(item)}
                      {linked.length > 1 ? ` · entra ${linked.length} vezes no PDF` : ""}
                    </span>
                  </p>
                  <button
                    type="button"
                    className="secondary-button attachment-change"
                    aria-label={`Alterar atividades de ${item.name}`}
                    disabled={busy}
                    onClick={() => {
                      setLinkError("");
                      setEditing({ ...item, activityIds: linkedTo(item) });
                    }}
                  >
                    {linked.length ? "Alterar atividades" : "Escolher atividades"}
                  </button>
                </div>
                <button
                  type="button"
                  className="icon-button attachment-remove"
                  title="Remover arquivo"
                  aria-label={`Remover arquivo ${item.name}`}
                  disabled={busy}
                  onClick={() => void remove(item)}
                >
                  <Trash2 size={20} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
      {status && (
        <p role="status" className="attachment-status">
          {status}
        </p>
      )}
      {errors.length > 0 && (
        <div className="operation-notice" role="alert">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
          {!items && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setErrors([]);
                setAttempt(attempt + 1);
              }}
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}
      {drafts !== null && (
        <AttachmentReviewModal
          drafts={drafts}
          activities={activities}
          savedPages={pages}
          provenIds={proven}
          targetActivityId={reviewTargetId}
          busy={busy}
          reviewErrors={reviewErrors}
          onClose={() => {
            void closeReview();
          }}
          onSave={() => {
            void saveDrafts();
          }}
          onAddMore={(source) => choose(reviewTargetId, source)}
          onUpdateDrafts={(updater) => setDrafts((current) => updater(current ?? []))}
        />
      )}
      {editing && (
        <Modal
          isOpen
          label="Alterar atividades do comprovante"
          variant="editor"
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <section className="editor-panel">
            <header className="editor-head">
              <h2>Alterar atividades</h2>
              <button
                type="button"
                className="icon-button"
                aria-label="Fechar atividades"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>
            <div className="editor-body">
              <div className="review-file-heading">
                <AttachmentPreview item={editing} />
                <AttachmentFileInfo item={editing} />
              </div>
              <PdfCoverOption
                item={editing}
                disabled={busy}
                onChange={(firstPageOnly) =>
                  setEditing((current) => current && { ...current, firstPageOnly })
                }
              />
              <ActivityChoices
                item={editing}
                activities={activities}
                provenIds={proven}
                disabled={busy}
                onChange={(ids) =>
                  setEditing((current) => current && { ...current, activityIds: ids })
                }
              />
              {linkError && (
                <p className="operation-notice" role="alert">
                  {linkError}
                </p>
              )}
            </div>
            <footer className="editor-foot">
              <button
                type="button"
                className="secondary-button"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={busy}
                aria-busy={busy}
                onClick={() => {
                  void saveLinks();
                }}
              >
                {busy && <InlineSpinner size={16} />}
                {busy ? "Salvando…" : "Salvar atividades"}
              </button>
            </footer>
          </section>
        </Modal>
      )}
    </section>
  );
}
