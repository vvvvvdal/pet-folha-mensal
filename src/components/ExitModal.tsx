'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileText, CheckCircle2, ShieldCheck, X, HardDrive, Smartphone, Cloud, ArrowRight, AlertTriangle } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

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
  const { confirm } = useDialog();
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

  const handleExitClick = async () => {
    // 1. Se não houve nenhuma alteração nesta sessão, conclui diretamente sem barreiras
    if (!hasChanges) {
      onConfirmExit();
      return;
    }

    // 2. Se houve alterações, solicita confirmação consciente ao usuário
    const confirmed = await confirm({
      title: 'Atenção aos Dados',
      message: 'Suas alterações nesta folha só ficam preservadas se você salvou o arquivo .json no seu computador ou celular.\n\nVocê já salvou seu arquivo .json e deseja realmente concluir a sessão?',
      confirmText: 'Sim, Concluir e Sair',
      cancelText: 'Voltar e Salvar',
      variant: 'warning'
    });

    if (confirmed) {
      onConfirmExit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-xl sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="size-12 sm:size-14 rounded-2xl bg-[#008D4C]/10 text-[#008D4C] dark:text-[#10B981] border border-[#008D4C]/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-7 sm:size-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 leading-snug">
                Salvar Folha e Concluir Sessão
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 sm:mt-1">
                Olá, {userName}. Para garantir sua total privacidade, seus dados ficam com você.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-colors"
            title="Fechar"
          >
            <X className="size-5 sm:size-6" />
          </button>
        </div>

        {/* Informative Guidance */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-6 space-y-3">
          <h4 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            <span>O que é o arquivo .json e onde guardar?</span>
          </h4>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            O arquivo <strong>.json</strong> é a sua <strong>cópia de segurança pessoal</strong>. Ele contém todos os seus lançamentos e horas calculadas. Como não usamos banco de dados centralizado, você precisa guardar esse arquivinho para continuar preenchendo em outro dia.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs sm:text-sm text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center gap-1.5">
              <Cloud className="size-5 text-[#00A3E0]" />
              <span className="font-medium">Google Drive / Nuvem</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center gap-1.5">
              <Smartphone className="size-5 text-[#10B981]" />
              <span className="font-medium">WhatsApp (para si mesmo)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center text-center gap-1.5">
              <HardDrive className="size-5 text-amber-400" />
              <span className="font-medium">Pasta Documentos</span>
            </div>
          </div>
        </div>

        {/* Status da sessão */}
        {!hasChanges ? (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-[#003d5c]/20 border border-[#00A3E0]/20 text-[#7DD3FC] text-xs sm:text-sm flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-[#00A3E0] shrink-0" />
            <span>Nenhuma alteração foi realizada nesta sessão. Você pode sair livremente.</span>
          </div>
        ) : (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertTriangle className="size-5 text-amber-400 shrink-0" />
            <span>Você realizou alterações nesta sessão. Lembre-se de baixar seu arquivo .json.</span>
          </div>
        )}

        {/* Ações de Download / Exportação */}
        <div className="space-y-3.5 mb-6">
          {/* Card 1: JSON */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-11 sm:size-12 rounded-xl bg-[#00A3E0]/10 border border-[#00A3E0]/20 flex items-center justify-center text-[#00A3E0] shrink-0">
                <Download className="size-5 sm:size-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-slate-100 truncate">
                  1. Arquivo de Acesso (.json)
                </div>
                <div className="text-xs sm:text-sm text-slate-300 truncate mt-0.5">
                  {jsonTriggered ? 'Download acionado: guarde em local seguro' : 'Necessário para continuar preenchendo depois'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 hover:border-slate-600 text-xs sm:text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 shadow-xs"
            >
              <Download className="size-4 text-[#00A3E0]" />
              <span>{jsonTriggered ? 'Baixar Novamente' : 'Baixar JSON'}</span>
            </button>
          </div>

          {/* Card 2: PDF */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="size-11 sm:size-12 rounded-xl bg-[#008D4C]/10 border border-[#008D4C]/20 flex items-center justify-center text-[#008D4C] dark:text-[#10B981] shrink-0">
                <FileText className="size-5 sm:size-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-slate-100 truncate">
                  2. Folha Oficial em PDF
                </div>
                <div className="text-xs sm:text-sm text-slate-300 truncate mt-0.5">
                  {pdfTriggered ? 'Impressão/PDF acionada: salve ou imprima' : 'Documento oficial pronto para assinar'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 hover:border-slate-600 text-xs sm:text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 shadow-xs"
            >
              <FileText className="size-4 text-[#008D4C] dark:text-[#10B981]" />
              <span>{pdfTriggered ? 'Gerar Novamente' : 'Gerar PDF'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] px-5 py-3 rounded-xl border border-slate-800 text-sm font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Continuar Editando
          </button>

          <button
            type="button"
            onClick={handleExitClick}
            className="min-h-[46px] px-6 py-3 rounded-xl text-sm sm:text-base font-bold cursor-pointer transition-all flex items-center justify-center gap-2 bg-[#008D4C] hover:bg-[#00733E] text-white shadow-md shadow-[#008D4C]/25"
            title="Concluir a sessão"
          >
            <span>Concluir e Sair</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
