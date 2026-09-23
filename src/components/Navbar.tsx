'use client';

import React from 'react';
import { UserProfile, GATS } from '@/types';
import { LayoutDashboard, FileText, Printer, User, Download, Upload, Shield } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'dashboard' | 'official';
  onTabChange: (tab: 'dashboard' | 'official') => void;
  onOpenProfileModal: () => void;
  onPrint: () => void;
  hasChanges: boolean;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onOpenAdmin: () => void;
}

export function Navbar({
  user,
  activeTab,
  onTabChange,
  onOpenProfileModal,
  onPrint,
  hasChanges,
  onExportBackup,
  onImportBackup,
  onOpenAdmin
}: NavbarProps) {
  const gatName = user.gatName || GATS[user.gatNumber]?.name || 'PET';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="mb-6 pb-4 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Brand & Profile Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-bold text-xs">
            {user.gatNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">PET Folha Mensal</span>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="text-xs text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                title="Clique para alterar seus dados ou trocar de GAT"
              >
                <span className="underline decoration-slate-600 underline-offset-2 hover:decoration-emerald-400">{user.name}</span>
                <span className="text-[11px] text-slate-400 font-normal">({gatName})</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">trocar</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Edital SGTES/MS 23/2026 • SMS Goiânia / SES Goiás / UFG</p>
          </div>
        </div>
      </div>

      {/* Tabs & Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Navigation Tabs */}
        <div className="flex p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-slate-100 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="size-3.5" />
            <span>Lançamentos</span>
          </button>
          <button
            onClick={() => onTabChange('official')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'official'
                ? 'bg-slate-800 text-slate-100 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="size-3.5" />
            <span>Folha Oficial (A4)</span>
          </button>
        </div>

        {/* Local Backup Friendly Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExportBackup}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-slate-100 hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all"
            title="Baixa uma cópia de segurança com seus dados e atividades no seu dispositivo."
          >
            <Download className="size-3.5 text-slate-400" />
            <span className="hidden sm:inline">Salvar Cópia</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-slate-100 hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all"
            title="Restaura a folha a partir de uma cópia de segurança salva anteriormente."
          >
            <Upload className="size-3.5 text-slate-400" />
            <span className="hidden sm:inline">Restaurar</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onImportBackup(file);
                e.target.value = '';
              }
            }}
          />
        </div>

        {/* Modo Admin (PIN 4031) */}
        <button
          type="button"
          onClick={onOpenAdmin}
          className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all"
          title="Acesso restrito para administradores e gestão (PIN 4031)"
        >
          <Shield className="size-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Admin</span>
        </button>

        {/* Primary Action: Print PDF */}
        <button
          onClick={onPrint}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer relative"
        >
          {hasChanges && (
            <span className="size-2 rounded-full bg-amber-400 animate-pulse absolute -top-0.5 -right-0.5 ring-2 ring-slate-950" />
          )}
          <Printer className="size-3.5" />
          <span>Imprimir / Salvar PDF</span>
        </button>
      </div>
    </header>
  );
}
