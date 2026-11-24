"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Trash2, X, Paperclip, CircleAlert, ListFilter, Image as ImageIcon, FileText, ChevronDown } from "lucide-react";
import {
  prepareAttachmentFiles, savePreparedAttachments, ATTACHMENT_LIMIT_MB,
  countAttachmentPages, linkedActivityIds, listAttachments, MONTH_LIMIT_MB,
  MONTH_PAGE_LIMIT, removeAttachment, updateAttachmentLinks, type Attachment,
} from "@/lib/attachments";
import { formatDateBR, cleanActivityDescription, getMonthName, weekdayShort } from "@/lib/pet-calculator";
import type { Activity } from "@/types";
import { useDialog } from "@/context/DialogContext";
import { Modal } from "./Modal";
import { AttachmentPreview } from "./AttachmentPreview";
import "./attachments-ui.css";
import "./attachments-redesign.css";

interface Props {
  profileId: string; monthKey: string; activities: Activity[]; busy: boolean;
  onBusyChange: (busy: boolean) => void; onChange: () => void;
  /** Shows only the proofs of one activity, chosen in the activity list or on a proof. */
  focusActivityId?: string | null;
  onFocusChange?: (activityId: string | null) => void;
}
function formatSize(size: number) {
  const mb = size >= 1024 * 1024;
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(size / (mb ? 1024 * 1024 : 1024)) + (mb ? " MB" : " KB");
}
function activityLabel(activity: Activity) {
  return `${formatDateBR(activity.date)} · ${cleanActivityDescription(activity.description)}`;
}
function fileMeta(item: Attachment) {
  return `${item.file.type === "application/pdf" ? "PDF" : "Imagem"} · ${item.pages} ${item.pages === 1 ? "página" : "páginas"} · ${formatSize(item.file.size)}`;
}
function FileInfo({ item }: { item: Attachment }) {
  return <div className="attachment-file-info"><h3>{item.name}</h3><p>{fileMeta(item)}</p></div>;
}
function ActivityChoices({ item, activities, disabled, onChange }: { item: Attachment; activities: Activity[]; disabled: boolean; onChange: (ids: string[]) => void }) {
  const ids = item.activityIds ?? [];
  return <fieldset className="attachment-choices" disabled={disabled}>
    <legend>Quais atividades este arquivo comprova?</legend>
    {activities.length ? activities.map((activity) => <label key={activity.id}>
      <input type="checkbox" checked={ids.includes(activity.id)} onChange={(event) => onChange(event.target.checked ? [...ids, activity.id] : ids.filter((id) => id !== activity.id))} />
      <span><strong>{cleanActivityDescription(activity.description)}</strong><small>{formatDateBR(activity.date)} · {activity.start} às {activity.end}</small></span>
    </label>) : <p>Você ainda não registrou atividades neste mês.</p>}
    {ids.length > 0 ? <button type="button" className="attachment-edit" onClick={() => onChange([])}>Limpar seleção</button> : <p>Sem atividade selecionada. O arquivo ficará no final dos comprovantes.</p>}
  </fieldset>;
}

type AttachmentSource = "gallery" | "files";

function AttachmentSourceMenu({
  label,
  ariaLabel,
  disabled,
  onChoose,
}: {
  label: string;
  ariaLabel?: string;
  disabled: boolean;
  onChoose: (source: AttachmentSource) => void;
}) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const position = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    const panel = panelRef.current;
    if (!rect || !panel) return;
    const menuWidth = Math.min(320, window.innerWidth - 24);
    const preferRight = rect.left + menuWidth > window.innerWidth - 12 || rect.left > window.innerWidth / 2;
    const rawLeft = preferRight ? rect.right - menuWidth : rect.left;
    const left = Math.max(12, Math.min(rawLeft, window.innerWidth - menuWidth - 12));
    const estimatedHeight = 168;
    const openAbove = rect.bottom + estimatedHeight + 16 > window.innerHeight && rect.top > estimatedHeight + 16;
    panel.style.width = `${menuWidth}px`;
    panel.style.left = `${left}px`;
    panel.style.right = "auto";
    if (openAbove) {
      panel.style.top = "auto";
      panel.style.bottom = `${Math.max(12, window.innerHeight - rect.top + 8)}px`;
    } else {
      panel.style.bottom = "auto";
      panel.style.top = `${Math.max(12, rect.bottom + 8)}px`;
    }
  };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open]);

  function selectSource(source: AttachmentSource) {
    panelRef.current?.hidePopover();
    onChoose(source);
  }

  return (
    <div className="attachment-source-anchor">
      <button
        ref={triggerRef}
        type="button"
        className="secondary-button attachment-source-trigger"
        popoverTarget={menuId}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={position}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            position();
            panelRef.current?.showPopover();
            requestAnimationFrame(() => {
              const items = panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
              if (!items?.length) return;
              items[event.key === "ArrowUp" ? items.length - 1 : 0]?.focus();
            });
          }
        }}
      >
        <span>{label}</span>
        <ChevronDown size={16} className="attachment-source-chevron" aria-hidden="true" />
      </button>
      <div
        ref={panelRef}
        id={menuId}
        popover="auto"
        role="menu"
        aria-label="Origem do comprovante"
        className="attachment-source-popover"
        onBeforeToggle={(event) => {
          if (event.newState === "open") position();
        }}
        onToggle={(event) => {
          const next = event.newState === "open";
          setOpen(next);
          if (!next && (document.activeElement === document.body || panelRef.current?.contains(document.activeElement))) {
            triggerRef.current?.focus();
          }
        }}
        onKeyDown={(event) => {
          const items = Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
          const index = items.indexOf(document.activeElement as HTMLButtonElement);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
          }
          if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            items[event.key === "Home" ? 0 : items.length - 1]?.focus();
          }
          if (event.key === "Escape") {
            event.stopPropagation();
            panelRef.current?.hidePopover();
            triggerRef.current?.focus();
          }
        }}
      >
        <button type="button" role="menuitem" onClick={() => selectSource("gallery")}>
          <ImageIcon size={20} aria-hidden="true" />
          <span>
            <strong>Fotos da galeria</strong>
            <small>Imagens e capturas do aparelho.</small>
          </span>
        </button>
        <button type="button" role="menuitem" onClick={() => selectSource("files")}>
          <FileText size={20} aria-hidden="true" />
          <span>
            <strong>PDF ou arquivos</strong>
            <small>Documentos PDF, pastas ou Drive.</small>
          </span>
        </button>
      </div>
    </div>
  );
}

export function MonthlyAttachments({ profileId, monthKey, activities, busy, onBusyChange, onChange, focusActivityId = null, onFocusChange }: Props) {
  const { confirm } = useDialog();
  const headingId = useId();
  const galleryInput = useRef<HTMLInputElement>(null);
  const filesInput = useRef<HTMLInputElement>(null);
  const preselect = useRef<string | null>(null);
  const activeOp = useRef<Promise<void>>(Promise.resolve());
  const localBusy = useRef(false);
  const [items, setItems] = useState<Attachment[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [drafts, setDrafts] = useState<Attachment[] | null>(null);
  const [reviewErrors, setReviewErrors] = useState<string[]>([]);
  const [editing, setEditing] = useState<Attachment | null>(null);
  const [linkError, setLinkError] = useState("");
  const activityIds = new Set(activities.map(({ id }) => id));
  const pages = items ? countAttachmentPages(items, activityIds) : 0;
  const stagedPages = countAttachmentPages(drafts ?? [], activityIds);
  const monthShort = getMonthName(monthKey).slice(0, 3).toUpperCase();
  const focusActivity = focusActivityId ? activities.find(({ id }) => id === focusActivityId) : undefined;
  const linkedTo = (item: Attachment) => linkedActivityIds(item, activityIds);
  const visibleItems = items && focusActivity ? items.filter((item) => linkedTo(item).includes(focusActivity.id)) : items;
  const proven = new Set(items?.flatMap(linkedTo) ?? []);
  const withoutProof = activities.filter(({ id }) => !proven.has(id));

  useEffect(() => {
    let current = true;
    listAttachments({ profileId, monthKey }).then((next) => { if (current) setItems(next); }).catch(() => {
      if (current) setErrors(["Não foi possível abrir os comprovantes. Tente novamente."]);
    });
    return () => { current = false; };
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
      setStatus("Conferindo arquivos…");
      setErrors([]);
      try {
        const result = await prepareAttachmentFiles(files);
        const accepted = activityId ? result.accepted.map((item) => ({ ...item, activityIds: [activityId] })) : result.accepted;
        setDrafts((current) => [...(current ?? []), ...accepted]);
        setReviewErrors(result.rejected);
        setStatus("");
      } catch {
        setErrors(["Não foi possível preparar os arquivos. Tente novamente."]);
        setStatus("");
      } finally {
        localBusy.current = false;
        onBusyChange(false);
      }
    });
  }
  async function closeReview() {
    if (busy) return;
    if (drafts?.length && !(await confirm({ title: "Descartar arquivos selecionados?", message: "Os arquivos desta seleção ainda não foram salvos. Os comprovantes já salvos serão mantidos.", confirmText: "Descartar seleção", cancelText: "Continuar conferindo", variant: "warning" }))) return;
    setDrafts(null);
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
        setStatus("Comprovantes salvos.");
        onChange();
      } catch (error) {
        setReviewErrors([error instanceof Error ? error.message : "Não foi possível salvar. Confira os arquivos e tente novamente."]);
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
      setItems(await updateAttachmentLinks({ profileId, monthKey }, editing.id, editing.activityIds ?? []));
      setEditing(null);
      setStatus("Atividades atualizadas.");
      onChange();
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : "Não foi possível salvar. Tente novamente.");
    } finally { onBusyChange(false); }
  }
  async function remove(item: Attachment) {
    if (busy || !(await confirm({ title: "Remover comprovante?", message: `O arquivo “${item.name}” será removido de todas as atividades deste mês.`, confirmText: "Remover arquivo", variant: "danger" }))) return;
    onBusyChange(true);
    setErrors([]);
    setStatus("");
    try {
      setItems(await removeAttachment({ profileId, monthKey }, item.id));
      setStatus("Comprovante removido.");
      onChange();
    } catch { setErrors(["Não foi possível remover o comprovante. Tente novamente."]); }
    finally { onBusyChange(false); }
  }
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void prepare(files);
  }
  const choosers = (
    <>
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
    </>
  );

  return <section className="attachments-panel attachments-v2" aria-labelledby={headingId}>
    <header className="attachments-heading">
      <div>
        <h2 id={headingId}>Arquivos deste mês</h2>
        <p>Adicione fotos da galeria ou PDFs e escolha as atividades que eles comprovam.</p>
      </div>
      <div className="attachments-actions">
        <button type="button" className="primary-button" disabled={busy || !items} onClick={() => choose(null, "gallery")}>
          <ImageIcon size={18} aria-hidden="true" />Fotos da galeria
        </button>
        <button type="button" className="secondary-button" disabled={busy || !items} onClick={() => choose(null, "files")}>
          <FileText size={18} aria-hidden="true" />PDF ou arquivos
        </button>
      </div>
    </header>
    {choosers}
    <div className="attachments-meta"><p>{items ? `${items.length} ${items.length === 1 ? "arquivo" : "arquivos"} · ${pages} de ${MONTH_PAGE_LIMIT} páginas no PDF${activities.length ? ` · ${activities.length - withoutProof.length} de ${activities.length} atividades com comprovante` : ""}` : "Carregando comprovantes…"}</p><details><summary>Formatos e limites</summary><p>PDF, JPEG, PNG e WebP. Até {ATTACHMENT_LIMIT_MB} MB por arquivo e {MONTH_LIMIT_MB} MB por mês. O PDF pode ter até {MONTH_PAGE_LIMIT} páginas de comprovantes. Um arquivo usado em duas atividades aparece duas vezes no PDF.</p></details></div>
    {focusActivity && <div className="attachments-focus" role="status">
      <ListFilter size={18} aria-hidden="true" />
      <p>Mostrando os comprovantes de <strong>{activityLabel(focusActivity)}</strong></p>
      <div>
        <AttachmentSourceMenu label="Adicionar para esta atividade" disabled={busy || !items} onChoose={(source) => choose(focusActivity.id, source)} />
        <button type="button" className="secondary-button" onClick={() => onFocusChange?.(null)}>Ver todos</button>
      </div>
    </div>}
    {items?.length === 0 && <div className="attachments-empty"><Paperclip size={28} aria-hidden="true" /><h3>Nenhum comprovante neste mês</h3><p>Você pode adicionar arquivos se o seu GAT solicitar.</p></div>}
    {!!items?.length && focusActivity && visibleItems?.length === 0 && <p className="attachments-focus-empty">Esta atividade ainda não tem comprovante.</p>}
    {!!visibleItems?.length && <ol className="attachments-list">{visibleItems.map((item) => {
      const linked = activities.filter(({ id }) => linkedTo(item).includes(id));
      return <li key={item.id} className="attachment-row"><AttachmentPreview item={item} /><div className="attachment-details">
        {linked.length
          ? <p className="attachment-count">Comprova {linked.length} {linked.length === 1 ? "atividade" : "atividades"}</p>
          : <p className="attachment-unlinked"><CircleAlert size={16} aria-hidden="true" />Sem atividade · entra no final dos comprovantes</p>}
        {linked.length > 0 && <ul aria-label="Atividades vinculadas" className="attachment-linked">{linked.map((activity) => <li key={activity.id}>
          <button type="button" className="activity-chip" aria-pressed={focusActivity?.id === activity.id} onClick={() => onFocusChange?.(activity.id)} title={`Ver só os comprovantes de ${activityLabel(activity)}`}>
            <span className="activity-chip-date" aria-hidden="true"><strong>{activity.date.slice(8)}</strong><span>{monthShort}</span></span>
            <span className="activity-chip-text"><strong>{cleanActivityDescription(activity.description)}</strong><small>{formatDateBR(activity.date)} · {weekdayShort(activity.date)} · {activity.start} às {activity.end} · {activity.hours} h</small></span>
          </button>
        </li>)}</ul>}
        <p className="attachment-file-line"><span className="attachment-file-name" title={item.name}>{item.name}</span><span>· {fileMeta(item)}{linked.length > 1 ? ` · entra ${linked.length} vezes no PDF` : ""}</span></p>
        <button type="button" className="secondary-button attachment-change" aria-label={`Alterar atividades de ${item.name}`} disabled={busy} onClick={() => { setLinkError(""); setEditing({ ...item, activityIds: linkedTo(item) }); }}>{linked.length ? "Alterar atividades" : "Escolher atividades"}</button>
      </div><button type="button" className="icon-button attachment-remove" title="Remover arquivo" aria-label={`Remover arquivo ${item.name}`} disabled={busy} onClick={() => void remove(item)}><Trash2 size={20} aria-hidden="true" /></button></li>;
    })}</ol>}
    {!focusActivity && !!items && items.length > 0 && withoutProof.length > 0 && <details className="attachments-missing">
      <summary>Atividades sem comprovante ({withoutProof.length})</summary>
      <ul>{withoutProof.map((activity) => <li key={activity.id}>
        <span>{activityLabel(activity)}</span>
        <AttachmentSourceMenu label="Anexar" ariaLabel={`Anexar comprovante a ${activityLabel(activity)}`} disabled={busy} onChoose={(source) => choose(activity.id, source)} />
      </li>)}</ul>
    </details>}
    {status && <p role="status" className="attachment-status">{status}</p>}
    {errors.length > 0 && <div className="operation-notice" role="alert">{errors.map((error) => <p key={error}>{error}</p>)}{!items && <button type="button" className="secondary-button" onClick={() => { setErrors([]); setAttempt(attempt + 1); }}>Tentar novamente</button>}</div>}
    {drafts !== null && <Modal isOpen label="Conferir comprovantes" variant="editor" onClose={() => { void closeReview(); }}><section className="editor-panel attachment-review"><header className="editor-head"><div><h2>Conferir comprovantes</h2><p>{drafts.length} {drafts.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}</p></div><button type="button" className="icon-button" aria-label="Fechar conferência" disabled={busy} onClick={() => { void closeReview(); }}><X size={20} aria-hidden="true" /></button></header><div className="editor-body"><ol className="review-files">{drafts.map((item) => <li key={item.id} className="review-file"><div className="review-file-heading"><AttachmentPreview item={item} /><FileInfo item={item} /><button type="button" className="icon-button" aria-label={`Retirar ${item.name} da seleção`} title="Retirar da seleção" disabled={busy} onClick={() => setDrafts((current) => current?.filter(({ id }) => id !== item.id) ?? [])}><X size={20} aria-hidden="true" /></button></div><ActivityChoices item={item} activities={activities} disabled={busy} onChange={(ids) => setDrafts((current) => current?.map((draft) => draft.id === item.id ? { ...draft, activityIds: ids } : draft) ?? [])} /></li>)}</ol>{drafts.length === 0 && <p>Nenhum arquivo selecionado. Adicione um arquivo para continuar.</p>}<AttachmentSourceMenu label="Adicionar mais arquivos" disabled={busy} onChoose={(source) => choose(null, source)} /><p className="attachment-page-budget">Com esta seleção: {pages + stagedPages} de {MONTH_PAGE_LIMIT} páginas de comprovantes no PDF.</p>{reviewErrors.length > 0 && <div className="operation-notice" role="alert">{reviewErrors.map((error, index) => <p key={index}>{error}</p>)}</div>}</div><footer className="editor-foot"><button type="button" className="secondary-button" disabled={busy} onClick={() => { void closeReview(); }}>Cancelar</button><button type="button" className="primary-button" disabled={busy || !drafts.length} onClick={() => { void saveDrafts(); }}>{busy ? "Salvando…" : "Salvar comprovantes"}</button></footer></section></Modal>}
    {editing && <Modal isOpen label="Alterar atividades do comprovante" variant="editor" onClose={() => { if (!busy) setEditing(null); }}><section className="editor-panel"><header className="editor-head"><h2>Alterar atividades</h2><button type="button" className="icon-button" aria-label="Fechar atividades" disabled={busy} onClick={() => setEditing(null)}><X size={20} aria-hidden="true" /></button></header><div className="editor-body"><div className="review-file-heading"><AttachmentPreview item={editing} /><FileInfo item={editing} /></div><ActivityChoices item={editing} activities={activities} disabled={busy} onChange={(ids) => setEditing((current) => current && ({ ...current, activityIds: ids }))} />{linkError && <p className="operation-notice" role="alert">{linkError}</p>}</div><footer className="editor-foot"><button type="button" className="secondary-button" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button><button type="button" className="primary-button" disabled={busy} onClick={() => { void saveLinks(); }}>{busy ? "Salvando…" : "Salvar atividades"}</button></footer></section></Modal>}
  </section>;
}
