"use client";

import { Modal } from "./Modal";
import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  CheckCircle2,
  X,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useDialog } from "@/context/DialogContext";

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  onDownloadJson: () => Promise<boolean> | boolean | void;
  onDownloadPdf: () => Promise<boolean> | boolean | void;
  userName: string;
  hasChanges?: boolean;
}

export function ExitModal({
  isOpen,
  onClose,
  onConfirmExit,
  onDownloadJson,
  onDownloadPdf,
  userName,
  hasChanges = false,
}: ExitModalProps) {
  const { confirm } = useDialog();
  const [jsonTriggered, setJsonTriggered] = useState(false);
  const [pdfTriggered, setPdfTriggered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Download indicators belong to each opening of the exit dialog.
      setJsonTriggered(false);
      setPdfTriggered(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadJson = async () => {
    const success = await onDownloadJson();
    if (success !== false) {
      setJsonTriggered(true);
    }
  };

  const handleDownloadPdf = async () => {
    const success = await onDownloadPdf();
    if (success !== false) {
      setPdfTriggered(true);
    }
  };

  const handleExitClick = async () => {
    // 1. Se não houve nenhuma alteração nesta sessão, conclui diretamente sem barreiras
    if (!hasChanges) {
      onConfirmExit();
      return;
    }

    // 2. Se houve alterações, solicita confirmação consciente ao usuário
    const confirmed = await confirm({
      title: "Atenção aos Dados",
      message:
        "Os registros ficam neste navegador. Salve uma cópia de segurança para recuperá-los se os dados locais forem apagados.\n\nVocê já salvou seu arquivo .json e deseja realmente concluir a sessão?",
      confirmText: "Sim, Concluir e Sair",
      cancelText: "Voltar e Salvar",
      variant: "warning",
    });

    if (confirmed) {
      onConfirmExit();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Salvar folha e concluir">
      <div
        className="w-full max-w-xl sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-[var(--page-shadow)] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-ink leading-snug">
                Concluir folha
              </h3>
              <p className="text-xs sm:text-sm text-body mt-0.5 sm:mt-1">
                {userName}
              </p>
            </div>
          </div>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl text-muted hover:text-ink hover:bg-raised cursor-pointer transition-colors"
            title="Fechar"
          >
            <X className="size-5 sm:size-6" />
          </button>
        </div>

        {/* Status da sessão */}
        {!hasChanges ? (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-[#003d5c]/20 border border-info/20 text-info text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-info shrink-0" />
            <span>Nenhuma alteração nesta sessão.</span>
          </div>
        ) : (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-warning text-xs sm:text-sm flex items-center gap-2.5">
            <AlertTriangle className="size-5 text-warning shrink-0" />
            <span>Salve uma cópia das alterações antes de sair.</span>
          </div>
        )}

        {/* Ações de Download / Exportação */}
        <div className="space-y-3.5 mb-6">
          {/* Card 1: JSON */}
          <div className="p-4 sm:p-5 rounded-2xl border border-line bg-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-11 sm:size-12 rounded-xl bg-[#00A3E0]/10 border border-info/20 flex items-center justify-center text-info shrink-0">
                <Download className="size-5 sm:size-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-ink truncate">
                  Cópia de segurança (.json)
                </div>
                <div className="text-xs sm:text-sm text-body truncate mt-0.5">
                  {jsonTriggered
                    ? "Download acionado: guarde em local seguro"
                    : "Guarde para restaurar sua folha em outro dispositivo"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-raised hover:bg-hover text-ink hover:text-ink border border-line hover:border-slate-600 text-xs sm:text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 shadow-[var(--page-shadow)]"
            >
              <Download className="size-4 text-info" />
              <span>{jsonTriggered ? "Baixar Novamente" : "Salvar cópia"}</span>
            </button>
          </div>

          {/* Card 2: PDF */}
          <div className="p-4 sm:p-5 rounded-2xl border border-line bg-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-11 sm:size-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent  shrink-0">
                <FileText className="size-5 sm:size-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-ink truncate">
                  Folha oficial em PDF
                </div>
                <div className="text-xs sm:text-sm text-body truncate mt-0.5">
                  {pdfTriggered
                    ? "Impressão/PDF acionada: salve ou imprima"
                    : "Documento oficial pronto para assinar"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-raised hover:bg-hover text-ink hover:text-ink border border-line hover:border-slate-600 text-xs sm:text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 shadow-[var(--page-shadow)]"
            >
              <FileText className="size-4 text-accent " />
              <span>
                {pdfTriggered ? "Gerar Novamente" : "Imprimir / salvar PDF"}
              </span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-5 py-3 rounded-xl border border-line text-sm font-semibold text-body hover:text-ink hover:bg-raised cursor-pointer transition-colors"
          >
            Continuar Editando
          </button>

          <button
            aria-label="Concluir a sessão"
            type="button"
            onClick={handleExitClick}
            className="min-h-[46px] px-6 py-3 rounded-xl text-sm sm:text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 bg-primary hover:bg-[var(--primary-hover)] text-white shadow-[var(--page-shadow)]"
            title="Concluir a sessão"
          >
            <span>Concluir e Sair</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
