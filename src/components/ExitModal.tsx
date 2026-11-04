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
    <Modal isOpen={isOpen} onClose={onClose} label="Salvar folha e concluir">
      <section className="conclusion-panel">
        <div className="form-panel-heading">
          <div>
            <p className="section-kicker">Finalizar</p>
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
              Arquivo .json com suas atividades e comprovantes para abrir a folha em outro aparelho.
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
              Os comprovantes, se houver, saem depois da folha. Use A4 em paisagem e assine o PDF completo.
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
        <p className="local-note">
          Os registros permanecem neste navegador ao sair. Guarde a cópia para
          se proteger de limpezas dos dados locais.
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
