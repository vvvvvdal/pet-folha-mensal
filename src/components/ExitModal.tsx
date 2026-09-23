'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle2, ShieldCheck, X, HardDrive, Smartphone, Cloud, ArrowRight, AlertTriangle } from 'lucide-react';

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
  hasChanges = false
}: ExitModalProps) {
  const [jsonTriggered, setJsonTriggered] = useState(false);
  const [pdfTriggered, setPdfTriggered] = useState(false);

  useEffect(() => {
    if (isOpen) {
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

  const handleExitClick = () => {
    // 1. Se não houve nenhuma alteração nesta sessão, conclui diretamente sem barreiras
    if (!hasChanges) {
      onConfirmExit();
      return;
    }

    // 2. Se houve alterações, solicita confirmação consciente ao usuário
    const confirmed = window.confirm(
      'Atenção: Suas alterações nesta folha só ficam salvas se você salvou o arquivo .json no seu computador ou celular.\n\nVocê já salvou seu arquivo .json e deseja realmente concluir a sessão?'
    );

    if (confirmed) {
      onConfirmExit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-[#008D4C]/10 text-[#008D4C] dark:text-[#10B981] border border-[#008D4C]/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Salvar Folha e Concluir Sessão
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Olá, {userName}. Para garantir sua total privacidade, seus dados ficam com você!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Informative Guidance */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-5 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <span>💡 O que é o arquivo .json e onde guardar?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            O arquivo <strong>.json</strong> é a sua <strong>cópia de segurança pessoal</strong>. Ele contém todos os seus lançamentos e horas calculadas. Como não usamos banco de dados centralizado, você precisa guardar esse arquivinho para continuar preenchendo em outro dia.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center gap-1">
              <Cloud className="size-4 text-[#00A3E0]" />
              <span>Google Drive / Nuvem</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center gap-1">
              <Smartphone className="size-4 text-[#10B981]" />
              <span>WhatsApp (para si mesmo)</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center gap-1">
              <HardDrive className="size-4 text-amber-400" />
              <span>Pasta Documentos</span>
            </div>
          </div>
        </div>

        {/* Status da sessão */}
        {!hasChanges ? (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-[#003d5c]/20 border border-[#00A3E0]/20 text-[#7DD3FC] text-xs flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#00A3E0] shrink-0" />
            <span>Nenhuma alteração foi realizada nesta sessão. Você pode sair livremente.</span>
          </div>
        ) : (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-400 shrink-0" />
            <span>Você realizou alterações nesta sessão. Lembre-se de baixar seu arquivo .json.</span>
          </div>
        )}

        {/* Ações de Download / Exportação */}
        <div className="space-y-3 mb-6">
          {/* Card 1: JSON */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-[#00A3E0]/10 border border-[#00A3E0]/20 flex items-center justify-center text-[#00A3E0] shrink-0">
                <Download className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                  1. Arquivo de Acesso (.json)
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {jsonTriggered ? 'Download acionado • guarde em local seguro' : 'Necessário para continuar preenchendo depois'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 hover:border-slate-600 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <Download className="size-3.5 text-[#00A3E0]" />
              <span>{jsonTriggered ? 'Baixar Novamente' : 'Baixar JSON'}</span>
            </button>
          </div>

          {/* Card 2: PDF */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-xl bg-[#008D4C]/10 border border-[#008D4C]/20 flex items-center justify-center text-[#008D4C] dark:text-[#10B981] shrink-0">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                  2. Folha Oficial em PDF
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {pdfTriggered ? 'Impressão/PDF acionada • salve ou imprima' : 'Documento oficial pronto para assinar'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 hover:border-slate-600 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <FileText className="size-3.5 text-[#008D4C] dark:text-[#10B981]" />
              <span>{pdfTriggered ? 'Gerar Novamente' : 'Gerar PDF'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Continuar Editando
          </button>

          <button
            type="button"
            onClick={handleExitClick}
            className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 bg-[#008D4C] hover:bg-[#00733E] text-white shadow-md shadow-[#008D4C]/25"
            title="Concluir a sessão"
          >
            <span>Concluir e Sair</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
