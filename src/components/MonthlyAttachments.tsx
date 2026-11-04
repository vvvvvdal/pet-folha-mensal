import { useEffect, useId, useState } from "react";
import {
  addAttachments,
  ATTACHMENT_LIMIT_MB,
  listAttachments,
  MONTH_LIMIT_MB,
  MONTH_PAGE_LIMIT,
  removeAttachment,
  type Attachment,
} from "@/lib/attachments";

interface Props {
  profileId: string;
  monthKey: string;
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

export function MonthlyAttachments({ profileId, monthKey, busy, onBusyChange, onChange }: Props) {
  const headingId = useId();
  const hintId = useId();
  const [items, setItems] = useState<Attachment[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [attempt, setAttempt] = useState(0);

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
      const result = await addAttachments({ profileId, monthKey }, files);
      setItems(result.attachments);
      setErrors(result.rejected);
      setStatus(result.added ? "Comprovantes salvos neste navegador." : "");
      if (result.added) onChange();
    } catch {
      setStatus("");
      setErrors(["Não foi possível salvar os arquivos. Verifique o espaço disponível e tente novamente."]);
    } finally {
      onBusyChange(false);
    }
  }

  async function remove(id: string) {
    if (busy) return;
    onBusyChange(true);
    setErrors([]);
    setStatus("");
    try {
      setItems(await removeAttachment({ profileId, monthKey }, id));
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
          Eles saem depois da folha, na ordem desta lista.
          Até {ATTACHMENT_LIMIT_MB} MB por arquivo, {MONTH_LIMIT_MB} MB e {MONTH_PAGE_LIMIT} páginas no total.
        </p>
      </div>
      <label className="block text-sm font-semibold text-body">
        Adicionar comprovantes
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          disabled={busy || !items}
          aria-describedby={hintId}
          className="mt-2 block max-w-full w-full text-sm font-normal file:mr-3 file:rounded-lg file:border file:border-line file:bg-raised file:px-3 file:py-2 file:text-ink disabled:opacity-60"
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            event.currentTarget.value = "";
            void add(files);
          }}
        />
      </label>
      {items?.length === 0 && (
        <p className="text-sm text-muted">Nenhum comprovante neste mês.</p>
      )}
      {!!items?.length && (
        <ol className="divide-y divide-line rounded-lg border border-line">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
              <div className="min-w-0 flex-1 basis-40">
                <p className="break-all text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-muted">{formatSize(item.file.size)}</p>
              </div>
              <button type="button" className="secondary-button" aria-label={"Abrir " + item.name}
                onClick={() => openAttachment(item.file)}>Abrir</button>
              <button type="button" className="secondary-button" aria-label={"Remover " + item.name}
                disabled={busy} onClick={() => void remove(item.id)}>Remover</button>
            </li>
          ))}
        </ol>
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
