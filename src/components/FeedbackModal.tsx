'use client';

import {
  MessageSquareHeart,
  X,
  ExternalLink,
  Star,
  Bug,
  Lightbulb
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfIxvavW_gq0xCUb6qx7VKK-I9tYino158tsCrNCO6IZ1Wf-A/viewform';

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="size-12 sm:size-14 rounded-2xl bg-[#00A3E0]/10 text-[#00A3E0] border border-[#00A3E0]/20 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="size-7 sm:size-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-100 leading-snug">
                Avaliação e Sugestões
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 sm:mt-1">
                PET-Saúde Clima: Folha de Frequência Mensal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-colors"
            title="Fechar"
          >
            <X className="size-5 sm:size-6" />
          </button>
        </div>

        {/* O que pode ser enviado */}
        <div className="space-y-3 mb-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3.5 sm:gap-4">
            <Star className="size-5 sm:size-6 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm sm:text-base text-slate-300 leading-relaxed">
              <strong className="text-slate-100 font-semibold">Avaliação detalhada:</strong> Dê sua nota para facilidade de uso, clareza das regras e salvamento de arquivos.
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3.5 sm:gap-4">
            <Bug className="size-5 sm:size-6 text-[#DE3831] mt-0.5 shrink-0" />
            <div className="text-sm sm:text-base text-slate-300 leading-relaxed">
              <strong className="text-slate-100 font-semibold">Bugs e Prints:</strong> Encontrou falhas ou lentidão? Você pode relatar e anexar prints de tela para ajuste rápido.
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3.5 sm:gap-4">
            <Lightbulb className="size-5 sm:size-6 text-[#00A3E0] mt-0.5 shrink-0" />
            <div className="text-sm sm:text-base text-slate-300 leading-relaxed">
              <strong className="text-slate-100 font-semibold">Sugestões e Melhorias:</strong> Proponha novas ideias ou facilidades específicas para a rotina do seu GAT.
            </div>
          </div>
        </div>

        {/* Botão de Ação Principal */}
        <div className="pt-3 border-t border-slate-800/80">
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[50px] sm:min-h-[54px] py-3.5 sm:py-4 px-6 rounded-2xl bg-[#00A3E0] hover:bg-[#008fc5] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#00A3E0]/20 transition-all cursor-pointer"
          >
            <span>Preencher Formulário de Feedback</span>
            <ExternalLink className="size-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
