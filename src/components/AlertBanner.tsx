'use client';

import React from 'react';
import { AlertTriangle, Printer } from 'lucide-react';

interface AlertBannerProps {
  visible: boolean;
  onPrint: () => void;
}

export function AlertBanner({ visible, onPrint }: AlertBannerProps) {
  if (!visible) return null;

  return (
    <div
      className="p-3.5 sm:p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 my-4 animate-fade-in transition-all"
      style={{
        backgroundColor: 'var(--accent-amber-bg)',
        borderColor: 'var(--accent-amber-border)',
        color: 'var(--text-heading)'
      }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-amber)' }} />
        <span className="text-xs sm:text-sm font-medium">
          <strong>Lançamentos alterados:</strong> Baixe ou imprima a versão atualizada da folha em PDF para manter o documento oficial sincronizado com as horas.
        </span>
      </div>
      <button
        onClick={onPrint}
        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
        style={{
          backgroundColor: 'var(--accent-sage)',
          color: '#0d2818'
        }}
      >
        <Printer className="w-3.5 h-3.5" />
        Salvar / Imprimir PDF Agora
      </button>
    </div>
  );
}
