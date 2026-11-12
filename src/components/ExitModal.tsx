"use client";

import { useState } from "react";
import { Download, FileText, X, ArrowRight } from "lucide-react";
import { Modal } from "./Modal";

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  onDownloadJson: () => Promise<boolean> | boolean | void;
  onDownloadPdf: () => Promise<boolean> | boolean | void;
  userName: string;
  hasChanges?: boolean;
}

export function ExitModal(props: ExitModalProps) {
  if (!props.isOpen) return null;
  return <Conclusion {...props} />;
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
  const [busy, setBusy] = useState(false);
  async function download(kind: "json" | "pdf") {
    if (busy) return;
    setBusy(true);
    try {
      const result = await (kind === "json"
        ? onDownloadJson()
        : onDownloadPdf());
      if (result !== false) {
        if (kind === "json") setJsonTriggered(true);
        else setPdfTriggered(true);
      }
    } finally {
      setBusy(false);
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
          <button className="secondary-button" disabled={busy} onClick={() => void download("json")}>{jsonTriggered ? "Salvar outra cópia" : "Salvar cópia"}</button>
        </div>
        <div className="conclusion-option">
          <FileText size={24} aria-hidden="true" />
          <div>
            <h3>Folha para assinatura (opcional)</h3>
            <p>Quando precisar, salve o PDF em A4 na horizontal para assinar.</p>
            {pdfTriggered && <p role="status">Impressão aberta. Salve o PDF ou imprima na janela do navegador.</p>}
          </div>
          <button className="secondary-button" disabled={busy} onClick={() => void download("pdf")}>Imprimir / salvar PDF</button>
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
