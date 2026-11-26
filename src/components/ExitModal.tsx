"use client";

import { useState } from "react";
import { Download, FileText, X, ArrowRight } from "lucide-react";
import { Modal } from "./Modal";
import { InlineSpinner } from "./LoadingStates";
import "./google-sync.css";

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  onDownloadJson: () => Promise<boolean> | boolean | void;
  onDownloadPdf: () => Promise<boolean> | boolean | void;
  userName: string;
  hasChanges?: boolean;
  /** Google Drive mode: sign out of the account instead of saving a manual copy. */
  cloud?: {
    email?: string;
    pending: number;
    hasSynced: boolean;
    offline: boolean;
    onLogout: (eraseDevice: boolean) => Promise<void> | void;
  };
}

export function ExitModal(props: ExitModalProps) {
  if (!props.isOpen) return null;
  return props.cloud ? <CloudExit {...props} cloud={props.cloud} /> : <Conclusion {...props} />;
}

function CloudExit({ isOpen, onClose, onDownloadPdf, userName, cloud }: ExitModalProps & { cloud: NonNullable<ExitModalProps["cloud"]> }) {
  const [erase, setErase] = useState(false);
  const [busy, setBusy] = useState<"pdf" | "exit" | null>(null);
  const unsent = cloud.pending > 0;
  async function run(kind: "pdf" | "exit") {
    if (busy) return;
    setBusy(kind);
    try {
      if (kind === "pdf") await onDownloadPdf();
      else await cloud.onLogout(erase && !unsent);
    } finally {
      setBusy(null);
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Sair da conta" variant="editor">
      <section className="editor-panel editor-narrow">
        <header className="editor-head">
          <div>
            <h2>Sair da conta</h2>
            <p className="access-hint">{userName}{cloud.email ? ` · ${cloud.email}` : ""}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>
        <div className="editor-body editor-fields conclusion-body">
          {unsent ? (
            <div className="operation-notice" role="alert">
              <p>
                {cloud.offline ? "Sem conexão: " : ""}
                {cloud.pending} {cloud.pending === 1 ? "mês ainda não foi enviado" : "meses ainda não foram enviados"} ao Google Drive.
                {" "}Se apagar os dados deste aparelho agora, essas alterações se perdem.
              </p>
            </div>
          ) : cloud.hasSynced ? (
            <p>Tudo está salvo na pasta PET Folha do seu Google Drive. Ao entrar de novo, sua folha volta.</p>
          ) : (
            <p>A primeira atividade que você salvar vai para a pasta PET Folha no Drive.</p>
          )}
          <div className="conclusion-option">
            <FileText size={24} aria-hidden="true" />
            <div>
              <h3>Folha para assinatura (opcional)</h3>
              <p>Quando precisar, salve o PDF em A4 na horizontal para assinar.</p>
            </div>
            <button className="secondary-button" disabled={Boolean(busy)} aria-busy={busy === "pdf"} onClick={() => void run("pdf")}>
              {busy === "pdf" && <InlineSpinner size={16} />}
              {busy === "pdf" ? "Preparando PDF…" : "Imprimir ou salvar PDF"}
            </button>
          </div>
          <label className="exit-erase">
            <input type="checkbox" checked={erase} disabled={unsent} onChange={(event) => setErase(event.target.checked)} />
            <span>
              <strong>Apagar os dados deste aparelho</strong>
              <small>{unsent ? "Disponível depois que tudo for enviado ao Drive." : "Use em computador compartilhado para remover a folha deste navegador."}</small>
            </span>
          </label>
        </div>
        <footer className="editor-foot conclusion-actions">
          <button className="secondary-button" onClick={onClose}>
            Continuar editando
          </button>
          <button className="primary-button" disabled={Boolean(busy)} aria-busy={busy === "exit"} onClick={() => void run("exit")}>
            {busy === "exit" && <InlineSpinner size={16} />}
            Sair da conta <ArrowRight size={18} />
          </button>
        </footer>
      </section>
    </Modal>
  );
}

function Conclusion({
  isOpen,
  onClose,
  onConfirmExit,
  onDownloadJson,
  onDownloadPdf,
  userName,
  hasChanges = false,
}: ExitModalProps) {
  const [jsonTriggered, setJsonTriggered] = useState(false);
  const [pdfTriggered, setPdfTriggered] = useState(false);
  const [exitWarning, setExitWarning] = useState(false);
  const [busyKind, setBusyKind] = useState<"json" | "pdf" | null>(null);
  const busy = busyKind !== null;
  async function download(kind: "json" | "pdf") {
    if (busy) return;
    setBusyKind(kind);
    try {
      const result = await (kind === "json"
        ? onDownloadJson()
        : onDownloadPdf());
      if (result !== false) {
        if (kind === "json") setJsonTriggered(true);
        else setPdfTriggered(true);
      }
    } finally {
      setBusyKind(null);
    }
  }
  function leave() {
    if (hasChanges && !jsonTriggered) {
      setExitWarning(true);
      return;
    }
    onConfirmExit();
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Antes de sair" variant="editor">
      <section className="editor-panel editor-narrow">
        <header className="editor-head">
          <div>
            <h2>Antes de sair</h2>
            <p className="access-hint">{userName}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>
        <div className="editor-body editor-fields conclusion-body">
        <p>Salve uma cópia atualizada para proteger seus registros e continuar em outro aparelho.</p>
        <div className="conclusion-option">
          <Download size={24} aria-hidden="true" />
          <div>
            <h3>Cópia de segurança</h3>
            {jsonTriggered && <p role="status">Confira se a cópia foi salva na pasta escolhida.</p>}
          </div>
          <button className="secondary-button" disabled={busy} aria-busy={busyKind === "json"} onClick={() => void download("json")}>
            {busyKind === "json" && <InlineSpinner size={16} />}
            {busyKind === "json" ? "Preparando cópia…" : jsonTriggered ? "Salvar outra cópia" : "Salvar cópia"}
          </button>
        </div>
        <div className="conclusion-option">
          <FileText size={24} aria-hidden="true" />
          <div>
            <h3>Folha para assinatura (opcional)</h3>
            <p>Quando precisar, salve o PDF em A4 na horizontal para assinar.</p>
            {pdfTriggered && <p role="status">Impressão aberta. Salve o PDF ou imprima na janela do navegador.</p>}
          </div>
          <button className="secondary-button" disabled={busy} aria-busy={busyKind === "pdf"} onClick={() => void download("pdf")}>
            {busyKind === "pdf" && <InlineSpinner size={16} />}
            {busyKind === "pdf" ? "Preparando PDF…" : "Imprimir ou salvar PDF"}
          </button>
        </div>
        {exitWarning && (
          <div className="operation-notice" role="alert">
            <p>
              Há alterações nesta sessão e você ainda não salvou uma cópia.
              Deseja sair mesmo assim?
            </p>
            <button className="secondary-button" onClick={onConfirmExit}>
              Sair sem salvar cópia
            </button>
            <button
              className="secondary-button"
              onClick={() => setExitWarning(false)}
            >
              Voltar e salvar
            </button>
          </div>
        )}
        </div>
        <footer className="editor-foot conclusion-actions">
          <button className="secondary-button" onClick={onClose}>
            Continuar editando
          </button>
          <button className="primary-button" disabled={busy} onClick={leave}>
            Sair <ArrowRight size={18} />
          </button>
        </footer>
      </section>
    </Modal>
  );
}
