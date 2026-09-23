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
  const [downloadedJson, setDownloadedJson] = useState(false);
  const [downloadedPdf, setDownloadedPdf] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDownloadedJson(false);
      setDownloadedPdf(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadJson = async () => {
    const success = await onDownloadJson();
    if (success !== false) {
      setDownloadedJson(true);
    } else {
      setDownloadedJson(false);
    }
  };

  const handleDownloadPdf = async () => {
    const success = await onDownloadPdf();
    if (success !== false) {
      setDownloadedPdf(true);
    }
  };

  const handleDownloadAll = async () => {
    setIsProcessing(true);
    try {
      // 1. Salva o JSON primeiro e aguarda confirmação de gravação em disco
      const jsonSuccess = await onDownloadJson();
      if (jsonSuccess === false) {
        // Usuário cancelou no diálogo de salvamento do SO! Interrompe imediatamente sem deslogar.
        setDownloadedJson(false);
        return;
      }
      setDownloadedJson(true);

      // 2. Dispara a emissão da folha em PDF
      const pdfSuccess = await onDownloadPdf();
      if (pdfSuccess !== false) {
        setDownloadedPdf(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExitClick = () => {
    // 1. Se houve alterações na folha mas o JSON não foi salvo com sucesso (ou foi cancelado)
    if (hasChanges && !downloadedJson) {
      window.alert(
        'Atenção: O arquivo .json de segurança ainda NÃO foi salvo nesta sessão (ou o salvamento foi cancelado na janela do sistema).\n\nPara não perder suas alterações em outro dispositivo, clique no Passo 1 e salve seu arquivo .json antes de sair.'
      );
      return;
    }

    // 2. Se a folha em PDF ainda não foi gerada
    if (!downloadedPdf) {
      const proceed = window.confirm(
        'Você ainda não baixou ou gerou a Folha de Frequência em PDF pronta para impressão.\n\nDeseja realmente concluir e sair sem a folha impressa/PDF?'
      );
      if (!proceed) return;
    }

    // Ambos verificados ou confirmados pelo usuário
    onConfirmExit();
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

        {/* Status de alteração da sessão */}
        {!hasChanges && (
          <div className="mb-4 px-3.5 py-2 rounded-xl bg-[#003d5c]/20 border border-[#00A3E0]/20 text-[#7DD3FC] text-xs flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-[#00A3E0] shrink-0" />
            <span>Nenhuma alteração foi realizada nesta sessão. Você pode sair livremente.</span>
          </div>
        )}

        {/* Step-by-step Downloads */}
        <div className="space-y-2.5 mb-6">
          <button
            type="button"
            onClick={handleDownloadJson}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              downloadedJson
                ? 'bg-[#00341f]/20 border-[#008D4C]/40 text-[#10B981]'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`size-8 rounded-xl flex items-center justify-center ${
                downloadedJson ? 'bg-[#008D4C]/20 text-[#10B981]' : 'bg-slate-800 text-slate-400'
              }`}>
                <Download className="size-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold">
                  1. Baixar Arquivo de Acesso (.json)
                </div>
                <div className="text-[11px] text-slate-400">
                  {downloadedJson ? '✓ Arquivo baixado com sucesso!' : 'Necessário para entrar novamente depois'}
                </div>
              </div>
            </div>
            {downloadedJson ? (
              <CheckCircle2 className="size-5 text-[#10B981] shrink-0" />
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#008D4C]/10 text-[#10B981] border border-[#008D4C]/20">
                Baixar
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              downloadedPdf
                ? 'bg-[#00341f]/20 border-[#008D4C]/40 text-[#10B981]'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`size-8 rounded-xl flex items-center justify-center ${
                downloadedPdf ? 'bg-[#008D4C]/20 text-[#10B981]' : 'bg-slate-800 text-slate-400'
              }`}>
                <FileText className="size-4" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold">
                  2. Baixar Folha de Frequência em PDF
                </div>
                <div className="text-[11px] text-slate-400">
                  {downloadedPdf ? '✓ PDF gerado com sucesso!' : 'Folha oficial pronta para assinar'}
                </div>
              </div>
            </div>
            {downloadedPdf ? (
              <CheckCircle2 className="size-5 text-[#10B981] shrink-0" />
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Gerar PDF
              </span>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleDownloadAll}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Download className="size-3.5" />
            <span>{isProcessing ? 'Processando...' : 'Baixar Ambos (JSON + PDF)'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
              className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                (downloadedJson && downloadedPdf) || (!hasChanges && downloadedPdf)
                  ? 'bg-[#008D4C] hover:bg-[#00733E] text-white shadow-md shadow-[#008D4C]/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600'
              }`}
              title={
                !hasChanges && downloadedPdf
                  ? 'Nenhuma alteração e PDF gerado. Concluir saída.'
                  : downloadedJson && downloadedPdf
                  ? 'Arquivos salvos com sucesso. Concluir saída com segurança.'
                  : 'Salvar arquivos antes de sair'
              }
            >
              <span>Concluir e Sair</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
