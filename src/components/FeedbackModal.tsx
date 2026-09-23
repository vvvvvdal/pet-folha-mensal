'use client';

import React from 'react';
import { UserProfile, GATS } from '@/types';
import {
  MessageSquareHeart,
  X,
  ExternalLink,
  Star,
  Bug,
  Lightbulb,
  CheckCircle2,
  Shield
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
}

export const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSfcrtAbMvnZmr2-gATJwkQlI_ATOsyAsPJz3EggxXPRwMLRcg/viewform';

export function FeedbackModal({ isOpen, onClose, user }: FeedbackModalProps) {
  if (!isOpen) return null;

  const gatName = user ? (user.gatName || GATS[user.gatNumber]?.name || `GAT ${user.gatNumber}`) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-[#00A3E0]/10 text-[#00A3E0] border border-[#00A3E0]/20 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="size-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Avaliação &amp; Sugestões
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajude a construir e aperfeiçoar o sistema do PET-Saúde Clima
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-colors"
            title="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Identificação ativa do participante (se logado) */}
        {user && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-[#008D4C]/10 text-[#008D4C] dark:text-[#10B981] flex items-center justify-center text-xs font-bold shrink-0">
                {user.gatNumber}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {user.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user.role} • GAT {user.gatNumber} ({gatName})
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#008D4C]/10 text-[#10B981] border border-[#008D4C]/20 shrink-0">
              Identificado
            </span>
          </div>
        )}

        {/* O que pode ser enviado */}
        <div className="space-y-2 mb-5">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
            <Star className="size-4 text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300">
              <strong className="text-slate-100">Avaliação de 0 a 10:</strong> Sua nota para usabilidade, clareza e facilidade de preenchimento.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
            <Bug className="size-4 text-[#DE3831] mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300">
              <strong className="text-slate-100">Bugs &amp; Prints:</strong> Encontrou algum erro? Você pode anexar capturas de tela para corrigirmos rápido.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3">
            <Lightbulb className="size-4 text-[#00A3E0] mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300">
              <strong className="text-slate-100">Sugestões &amp; Melhorias:</strong> Ideias de novos recursos ou ajustes específicos para a rotina do seu GAT.
            </div>
          </div>
        </div>

        {/* Botão de Ação Principal */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-[#00A3E0] hover:bg-[#008fc5] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00A3E0]/20 transition-all cursor-pointer"
          >
            <span>Preencher Formulário de Feedback</span>
            <ExternalLink className="size-4" />
          </a>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <Shield className="size-3.5 text-[#10B981]" />
              <span>Gerenciado pelo PET-Saúde Clima UFG</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Voltar ao sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
