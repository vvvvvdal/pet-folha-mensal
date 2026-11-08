"use client";

import { useState } from "react";
import { Download, FileText, ClipboardList, X, ArrowRight } from "lucide-react";
import { ACTIVITY_FORM_URL } from "@/lib/form-report";
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
    <Modal isOpen={isOpen} onClose={onClose} label="Salvar folha e concluir">
      <section className="conclusion-panel">
        <div className="form-panel-heading">
          <div>
            <h2>Guarde sua folha</h2>
            <p className="access-hint">{userName}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className="conclusion-option">
          <Download size={24} aria-hidden="true" />
          <div>
            <h3>Cópia de segurança</h3>
            <p>
              Guarde uma cópia para continuar editando em outro aparelho.
            </p>
            {jsonTriggered && (
              <p role="status">
                Ação de salvar acionada. Confira o arquivo na pasta escolhida.
              </p>
            )}
          </div>
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => void download("json")}
          >
            {jsonTriggered ? "Salvar outra cópia" : "Salvar cópia"}
          </button>
        </div>
        <div className="conclusion-option">
          <FileText size={24} aria-hidden="true" />
          <div>
            <h3>Folha para assinatura</h3>
            <p>
              Salve o PDF completo em A4 na horizontal para assinar.
            </p>
            {pdfTriggered && (
              <p role="status">
                Impressão aberta. Salve o PDF ou imprima na janela do navegador.
              </p>
            )}
          </div>
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => void download("pdf")}
          >
            Imprimir / salvar PDF
          </button>
        </div>
        <div className="conclusion-option">
          <ClipboardList size={24} aria-hidden="true" />
          <div>
            <h3>Formulário de atividades</h3>
            <p>Preencha um formulário por atividade. Você pode preparar os dados na lista de atividades.</p>
          </div>
          <a className="secondary-button" href={ACTIVITY_FORM_URL}
            target="_blank" rel="noopener noreferrer"
            aria-label="Abrir formulário de atividades">
            Abrir formulário
          </a>
        </div>
        <p className="local-note">
          Salve a cópia para proteger seus dados e continuar em outro aparelho.
        </p>
        {exitWarning && (
          <div className="operation-notice" role="alert">
            <p>
              Há alterações nesta sessão e você ainda não acionou a cópia.
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
        <div className="conclusion-actions">
          <button className="secondary-button" onClick={onClose}>
            Continuar editando
          </button>
          <button className="primary-button" disabled={busy} onClick={leave}>
            Sair / trocar participante <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </Modal>
  );
}
