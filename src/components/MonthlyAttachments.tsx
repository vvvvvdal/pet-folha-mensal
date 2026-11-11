import { useEffect, useId, useState } from "react";
import {
  addAttachments,
  ATTACHMENT_LIMIT_MB,
  AttachmentLinkError,
  countAttachmentPages,
  linkedActivityIds,
  listAttachments,
  MONTH_LIMIT_MB,
  MONTH_PAGE_LIMIT,
  removeAttachment,
  updateAttachmentLinks,
  type Attachment,
} from "@/lib/attachments";
import { formatActivityForSheet, formatDateBR } from "@/lib/pet-calculator";
import type { Activity } from "@/types";
import { useDialog } from "@/context/DialogContext";
import { Modal } from "./Modal";
import { X } from "lucide-react";

interface Props {
  profileId: string;
  monthKey: string;
  activities: Activity[];
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onChange: () => void;
}

function formatSize(size: number) {
  const unit = size < 1024 * 1024 ? "KB" : "MB";
  const divisor = unit === "KB" ? 1024 : 1024 * 1024;
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 })
    .format(size / divisor) + " " + unit;
}

function openAttachment(file: Blob) {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function activityLabel(activity: Activity) {
  return `${formatDateBR(activity.date)} · ${activity.start} às ${activity.end} · ${formatActivityForSheet(activity.description, activity.modality)}`;
}

export function MonthlyAttachments({ profileId, monthKey, activities, busy, onBusyChange, onChange }: Props) {
  const { confirm } = useDialog();
  const headingId = useId();
  const hintId = useId();
  const activityFieldId = useId();
  const [items, setItems] = useState<Attachment[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [uploadActivity, setUploadActivity] = useState("");
  const [editing, setEditing] = useState<{ item: Attachment; ids: string[] } | null>(null);
  const [linkError, setLinkError] = useState("");
  const activityIds = new Set(activities.map(({ id }) => id));
  const selectedUpload = activityIds.has(uploadActivity) ? uploadActivity : "";
  const pages = items ? countAttachmentPages(items, activityIds) : 0;

  useEffect(() => {
    let current = true;
    listAttachments({ profileId, monthKey })
      .then((items) => { if (current) setItems(items); })
      .catch(() => {
        if (current) setErrors(["Não foi possível abrir os comprovantes neste navegador."]);
      });
    return () => { current = false; };
  }, [profileId, monthKey, attempt]);

  async function add(files: File[]) {
    if (!files.length || busy) return;
    onBusyChange(true);
    setStatus("Conferindo os arquivos…");
    setErrors([]);
    try {
      const result = await addAttachments({ profileId, monthKey }, files, selectedUpload);
      setItems(result.attachments);
      setErrors(result.rejected);
      setStatus(result.added ? "Comprovantes salvos neste navegador." : "");
      if (result.added) onChange();
    } catch (error) {
      setStatus("");
      setErrors([error instanceof AttachmentLinkError
        ? error.message
        : "Não foi possível salvar os arquivos. Verifique o espaço disponível e tente novamente."]);
    } finally {
      onBusyChange(false);
    }
  }

  async function saveLinks() {
    if (!editing || busy) return;
    onBusyChange(true);
    setLinkError("");
    try {
      const next = await updateAttachmentLinks({ profileId, monthKey }, editing.item.id, editing.ids);
      setItems(next);
      setEditing(null);
      setErrors([]);
      setStatus("Vínculos atualizados.");
      onChange();
    } catch (error) {
      setLinkError(error instanceof AttachmentLinkError
        ? error.message
        : "Não foi possível atualizar os vínculos. Tente novamente.");
    } finally {
      onBusyChange(false);
    }
  }

  async function remove(item: Attachment) {
    if (busy) return;
    if (!(await confirm({
      title: "Remover comprovante?",
      message: `O arquivo “${item.name}” e todos os seus vínculos serão removidos deste mês.`,
      confirmText: "Remover arquivo",
      variant: "danger",
    }))) return;
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

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 sm:p-6 space-y-4" aria-labelledby={headingId}>
      <div>
        <h2 id={headingId} className="text-lg font-semibold text-ink">
          Comprovantes <span className="text-sm font-normal text-muted">(opcional)</span>
        </h2>
        <p id={hintId} className="mt-1 text-sm text-muted">
          Se o seu GAT pedir comprovantes, anexe PDFs ou imagens JPEG e PNG.
          Eles saem depois da folha, agrupados por atividade.
          Até {ATTACHMENT_LIMIT_MB} MB por arquivo e {MONTH_LIMIT_MB} MB por mês.
        </p>
      </div>
      <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="field min-w-0">
          <label htmlFor={activityFieldId}>Atividade</label>
          <select id={activityFieldId} className="w-full min-w-0 truncate" value={selectedUpload}
            disabled={busy || !items || !activities.length}
            onChange={(event) => setUploadActivity(event.target.value)}>
            <option value="">Sem atividade vinculada</option>
            {activities.map((activity) =>
              <option key={activity.id} value={activity.id}>{activityLabel(activity)}</option>
            )}
          </select>
        </div>
        <label className="block font-semibold text-body">
          <input
            type="file"
            multiple
            aria-label="Adicionar comprovantes"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            disabled={busy || !items}
            aria-describedby={hintId}
            className="peer sr-only"
            onChange={(event) => {
              const files = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = "";
              void add(files);
            }}
          />
          <span className="inline-flex min-h-12 cursor-pointer items-center rounded-lg border border-line bg-raised px-4 font-semibold text-ink hover:bg-hover peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-info peer-disabled:cursor-not-allowed peer-disabled:opacity-60">
            Escolher arquivos
          </span>
        </label>
      </div>
      <p className="text-sm text-muted" role="status">
        {items
          ? `${pages} de ${MONTH_PAGE_LIMIT} páginas de comprovantes no PDF. Cada vínculo conta as páginas do arquivo.`
          : errors.length === 0 && "Carregando comprovantes…"}
      </p>
      {items?.length === 0 && (
        <p className="text-sm text-muted">Nenhum comprovante neste mês.</p>
      )}
      {!!items?.length && (
        <ol className="divide-y divide-line rounded-lg border border-line">
          {items.map((item) => {
            const ids = linkedActivityIds(item, activityIds);
            const linked = activities.filter(({ id }) => ids.includes(id));
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
                <div className="min-w-0 flex-1 basis-60">
                  <p className="wrap-anywhere font-medium text-ink">{item.name}</p>
                  <p className="text-sm text-muted">
                    {formatSize(item.file.size)} · {item.pages} {item.pages === 1 ? "página" : "páginas"}
                  </p>
                  {linked.length > 0 ? (
                    <ul aria-label="Atividades vinculadas" className="mt-1 space-y-0.5 text-sm text-body">
                      {linked.map((activity) =>
                        <li key={activity.id} className="line-clamp-2 wrap-anywhere">{activityLabel(activity)}</li>
                      )}
                    </ul>
                  ) : <p className="mt-1 text-sm text-muted">Sem atividade vinculada</p>}
                </div>
                <div className="flex min-w-0 flex-wrap gap-2">
                  <button type="button" className="secondary-button" aria-label={"Abrir " + item.name}
                    onClick={() => openAttachment(item.file)}>Abrir</button>
                  <button type="button" className="secondary-button" aria-label={"Vincular a atividades " + item.name}
                    disabled={busy} onClick={() => {
                      setLinkError("");
                      setEditing({ item, ids });
                    }}>Vincular a atividades</button>
                  <button type="button" className="secondary-button" aria-label={"Remover arquivo " + item.name}
                    disabled={busy} onClick={() => void remove(item)}>Remover arquivo</button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {editing && (
        <Modal isOpen label="Vincular a atividades" variant="editor" onClose={() => { if (!busy) setEditing(null); }}>
          <div className="editor-panel editor-narrow">
            <header className="editor-head">
              <div>
                <h2>Vincular a atividades</h2>
                <p className="wrap-anywhere">{editing.item.name}</p>
              </div>
              <button type="button" className="icon-button" disabled={busy}
                onClick={() => setEditing(null)} aria-label="Fechar vínculos">
                <X size={20} aria-hidden="true" />
              </button>
            </header>
            <div className="editor-body editor-fields">
            <fieldset className="min-w-0 space-y-2" disabled={busy}>
              <legend className="mb-2 font-semibold text-ink">Atividades deste mês</legend>
              {activities.length === 0 && <p className="text-sm text-muted">Nenhuma atividade neste mês.</p>}
              {activities.map((activity) => (
                <label key={activity.id} className="flex min-h-[44px] items-start gap-3 rounded-lg border border-line px-3 py-2.5 text-body">
                  <input type="checkbox" className="mt-1 size-4 shrink-0 accent-info"
                    checked={editing.ids.includes(activity.id)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setLinkError("");
                      setEditing((current) => current && ({
                        ...current,
                        ids: checked
                          ? [...current.ids, activity.id]
                          : current.ids.filter((id) => id !== activity.id),
                      }));
                    }} />
                  <span className="min-w-0 wrap-anywhere">{activityLabel(activity)}</span>
                </label>
              ))}
            </fieldset>
            <p className="text-sm text-muted">Sem seleção, o arquivo vai para o fim dos comprovantes no PDF.</p>
            {linkError && <p className="operation-notice" role="alert">{linkError}</p>}
            </div>
            <footer className="editor-foot">
              <button type="button" className="secondary-button" disabled={busy}
                onClick={() => setEditing(null)}>Cancelar</button>
              <button type="button" className="primary-button" disabled={busy}
                onClick={() => void saveLinks()}>{busy ? "Salvando…" : "Salvar vínculos"}</button>
            </footer>
          </div>
        </Modal>
      )}
      {status && <p className="text-sm text-muted" role="status">{status}</p>}
      {errors.length > 0 && (
        <div className="operation-notice" role="alert">
          <ul className="space-y-1">
            {errors.map((error, index) => <li className="break-words" key={index}>{error}</li>)}
          </ul>
          {!items && <button type="button" className="secondary-button"
            onClick={() => { setErrors([]); setAttempt(attempt + 1); }}>Tentar novamente</button>}
        </div>
      )}
    </section>
  );
}
