"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Plus, Trash2, X, Paperclip } from "lucide-react";
import {
  prepareAttachmentFiles, savePreparedAttachments, ATTACHMENT_LIMIT_MB,
  countAttachmentPages, linkedActivityIds, listAttachments, MONTH_LIMIT_MB,
  MONTH_PAGE_LIMIT, removeAttachment, updateAttachmentLinks, type Attachment,
} from "@/lib/attachments";
import { formatDateBR, cleanActivityDescription } from "@/lib/pet-calculator";
import type { Activity } from "@/types";
import { useDialog } from "@/context/DialogContext";
import { Modal } from "./Modal";
import { AttachmentPreview } from "./AttachmentPreview";
import "./attachments-ui.css";

interface Props {
  profileId: string; monthKey: string; activities: Activity[]; busy: boolean;
  onBusyChange: (busy: boolean) => void; onChange: () => void;
}
function formatSize(size: number) {
  const mb = size >= 1024 * 1024;
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(size / (mb ? 1024 * 1024 : 1024)) + (mb ? "\u00a0MB" : "\u00a0KB");
}
function activityLabel(activity: Activity) {
  return `${formatDateBR(activity.date)} · ${cleanActivityDescription(activity.description)}`;
}
function FileInfo({ item }: { item: Attachment }) {
  return <div className="attachment-file-info"><h3>{item.name}</h3><p>{item.file.type === "application/pdf" ? "PDF" : "Imagem"} · {item.pages} {item.pages === 1 ? "página" : "páginas"} · {formatSize(item.file.size)}</p></div>;
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

export function MonthlyAttachments({ profileId, monthKey, activities, busy, onBusyChange, onChange }: Props) {
  const { confirm } = useDialog();
  const headingId = useId();
  const input = useRef<HTMLInputElement>(null);
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

  async function prepare(files: File[]) {
    if (!files.length || busy) return;
    onBusyChange(true);
    setStatus("Conferindo arquivos…");
    setErrors([]);
    try {
      const result = await prepareAttachmentFiles(files);
      setDrafts((current) => [...(current ?? []), ...result.accepted]);
      setReviewErrors(result.rejected);
      setStatus("");
    } catch {
      setErrors(["Não foi possível preparar os arquivos. Tente novamente."]);
      setStatus("");
    } finally { onBusyChange(false); }
  }
  async function closeReview() {
    if (busy) return;
    if (drafts?.length && !(await confirm({ title: "Descartar arquivos selecionados?", message: "Os arquivos desta seleção ainda não foram salvos. Os comprovantes já salvos serão mantidos.", confirmText: "Descartar seleção", cancelText: "Continuar conferindo", variant: "warning" }))) return;
    setDrafts(null);
    setReviewErrors([]);
  }
  async function saveDrafts() {
    if (!drafts?.length || busy) return;
    onBusyChange(true);
    setReviewErrors([]);
    try {
      setItems(await savePreparedAttachments({ profileId, monthKey }, drafts));
      setDrafts(null);
      setStatus("Comprovantes salvos.");
      onChange();
    } catch (error) {
      setReviewErrors([error instanceof Error ? error.message : "Não foi possível salvar. Confira os arquivos e tente novamente."]);
    } finally { onBusyChange(false); }
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
  const chooser = <input ref={input} className="sr-only" type="file" multiple aria-label="Adicionar comprovantes" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" disabled={busy || !items} onChange={(event) => { const files = Array.from(event.target.files ?? []); event.target.value = ""; void prepare(files); }} />;

  return <section className="attachments-panel" aria-labelledby={headingId}>
    <header className="attachments-heading"><div><h2 id={headingId}>Arquivos deste mês</h2><p>Adicione fotos ou PDFs e escolha as atividades que eles comprovam.</p></div><button type="button" className="primary-button" disabled={busy || !items} onClick={() => input.current?.click()}><Plus size={18} aria-hidden="true" />Adicionar comprovantes</button></header>
    {drafts === null && chooser}
    <div className="attachments-meta"><p>{items ? `${items.length} ${items.length === 1 ? "arquivo" : "arquivos"} · ${pages} de ${MONTH_PAGE_LIMIT} páginas no PDF` : "Carregando comprovantes…"}</p><details><summary>Formatos e limites</summary><p>PDF, JPEG e PNG. Até {ATTACHMENT_LIMIT_MB} MB por arquivo e {MONTH_LIMIT_MB} MB por mês. O PDF pode ter até {MONTH_PAGE_LIMIT} páginas de comprovantes. Um arquivo usado em duas atividades aparece duas vezes no PDF.</p></details></div>
    {items?.length === 0 && <div className="attachments-empty"><Paperclip size={28} aria-hidden="true" /><h3>Nenhum comprovante neste mês</h3><p>Você pode adicionar arquivos se o seu GAT solicitar.</p></div>}
    {!!items?.length && <ol className="attachments-list">{items.map((item) => {
      const linked = activities.filter(({ id }) => linkedActivityIds(item, activityIds).includes(id));
      return <li key={item.id} className="attachment-row"><AttachmentPreview item={item} /><div className="attachment-details"><FileInfo item={item} />{linked.length ? <ul aria-label="Atividades vinculadas" className="attachment-linked">{linked.map((activity) => <li key={activity.id}>{activityLabel(activity)}</li>)}</ul> : <p className="attachment-unlinked">Sem atividade. Aparece no final dos comprovantes.</p>}<button type="button" className="attachment-edit" aria-label={`Alterar atividades de ${item.name}`} disabled={busy} onClick={() => { setLinkError(""); setEditing({ ...item, activityIds: linkedActivityIds(item, activityIds) }); }}>{linked.length ? "Alterar atividades" : "Escolher atividades"}</button></div><button type="button" className="icon-button attachment-remove" title="Remover arquivo" aria-label={`Remover arquivo ${item.name}`} disabled={busy} onClick={() => void remove(item)}><Trash2 size={20} aria-hidden="true" /></button></li>;
    })}</ol>}
    {status && <p role="status" className="attachment-status">{status}</p>}
    {errors.length > 0 && <div className="operation-notice" role="alert">{errors.map((error) => <p key={error}>{error}</p>)}{!items && <button type="button" className="secondary-button" onClick={() => { setErrors([]); setAttempt(attempt + 1); }}>Tentar novamente</button>}</div>}
    {drafts !== null && <Modal isOpen label="Conferir comprovantes" variant="editor" onClose={() => { void closeReview(); }}><section className="editor-panel attachment-review"><header className="editor-head"><div><h2>Conferir comprovantes</h2><p>{drafts.length} {drafts.length === 1 ? "arquivo selecionado" : "arquivos selecionados"}</p></div><button type="button" className="icon-button" aria-label="Fechar conferência" disabled={busy} onClick={() => { void closeReview(); }}><X size={20} aria-hidden="true" /></button></header><div className="editor-body">{chooser}<ol className="review-files">{drafts.map((item) => <li key={item.id} className="review-file"><div className="review-file-heading"><AttachmentPreview item={item} /><FileInfo item={item} /><button type="button" className="icon-button" aria-label={`Retirar ${item.name} da seleção`} title="Retirar da seleção" disabled={busy} onClick={() => setDrafts((current) => current?.filter(({ id }) => id !== item.id) ?? [])}><X size={20} aria-hidden="true" /></button></div><ActivityChoices item={item} activities={activities} disabled={busy} onChange={(ids) => setDrafts((current) => current?.map((draft) => draft.id === item.id ? { ...draft, activityIds: ids } : draft) ?? [])} /></li>)}</ol>{drafts.length === 0 && <p>Nenhum arquivo selecionado. Adicione um arquivo para continuar.</p>}<button type="button" className="secondary-button" disabled={busy} onClick={() => input.current?.click()}><Plus size={18} aria-hidden="true" />Adicionar mais arquivos</button><p className="attachment-page-budget">Com esta seleção: {pages + stagedPages} de {MONTH_PAGE_LIMIT} páginas de comprovantes no PDF.</p>{reviewErrors.length > 0 && <div className="operation-notice" role="alert">{reviewErrors.map((error, index) => <p key={index}>{error}</p>)}</div>}</div><footer className="editor-foot"><button type="button" className="secondary-button" disabled={busy} onClick={() => { void closeReview(); }}>Cancelar</button><button type="button" className="primary-button" disabled={busy || !drafts.length} onClick={() => { void saveDrafts(); }}>{busy ? "Salvando…" : "Salvar comprovantes"}</button></footer></section></Modal>}
    {editing && <Modal isOpen label="Alterar atividades do comprovante" variant="editor" onClose={() => { if (!busy) setEditing(null); }}><section className="editor-panel"><header className="editor-head"><h2>Alterar atividades</h2><button type="button" className="icon-button" aria-label="Fechar atividades" disabled={busy} onClick={() => setEditing(null)}><X size={20} aria-hidden="true" /></button></header><div className="editor-body"><div className="review-file-heading"><AttachmentPreview item={editing} /><FileInfo item={editing} /></div><ActivityChoices item={editing} activities={activities} disabled={busy} onChange={(ids) => setEditing((current) => current && ({ ...current, activityIds: ids }))} />{linkError && <p className="operation-notice" role="alert">{linkError}</p>}</div><footer className="editor-foot"><button type="button" className="secondary-button" disabled={busy} onClick={() => setEditing(null)}>Cancelar</button><button type="button" className="primary-button" disabled={busy} onClick={() => { void saveLinks(); }}>{busy ? "Salvando…" : "Salvar atividades"}</button></footer></section></Modal>}
  </section>;
}
