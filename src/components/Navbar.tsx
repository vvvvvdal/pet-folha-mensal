'use client';

import React from 'react';
import { UserProfile, GATS } from '@/types';
import { LayoutDashboard, FileText, Printer, User, Download, Upload } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'dashboard' | 'official';
  onTabChange: (tab: 'dashboard' | 'official') => void;
  onOpenProfileModal: () => void;
  onPrint: () => void;
  hasChanges: boolean;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
}

export function Navbar({
  user,
  activeTab,
  onTabChange,
  onOpenProfileModal,
  onPrint,
  hasChanges,
  onExportBackup,
  onImportBackup
}: NavbarProps) {
  const gatName = user.gatName || GATS[user.gatNumber]?.name || 'PET';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="mb-6 pb-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Brand & Profile Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            {user.gatNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100">PET Folha Mensal</span>
              <span className="text-zinc-600">•</span>
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                title="Clique para alterar seus dados ou trocar de GAT"
              >
                <span>{user.name}</span>
                <span className="text-[11px] text-zinc-500 font-normal">({gatName})</span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-800/80 text-zinc-400 ml-0.5">editar</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">Edital SGTES/MS 23/2026 • SMS Goiânia / SES Goiás / UFG</p>
          </div>
        </div>
      </div>

      {/* Tabs & Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Navigation Tabs */}
        <div className="flex p-0.5 rounded-lg bg-zinc-900 border border-zinc-800/80 text-xs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="size-3.5" />
            <span>Lançamentos</span>
          </button>
          <button
            onClick={() => onTabChange('official')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'official'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="size-3.5" />
            <span>Folha Oficial (A4)</span>
          </button>
        </div>

        {/* Local Backup Dropdown / Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onExportBackup}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs cursor-pointer"
            title="Exportar backup das minhas atividades (.json)"
          >
            <Download className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-xs cursor-pointer"
            title="Importar backup (.json)"
          >
            <Upload className="size-3.5" />
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

        {/* Primary Action: Print PDF */}
        <button
          onClick={onPrint}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer relative"
        >
          {hasChanges && (
            <span className="size-2 rounded-full bg-amber-400 animate-pulse absolute -top-0.5 -right-0.5 ring-2 ring-zinc-950" />
          )}
          <Printer className="size-3.5" />
          <span>Imprimir / Salvar PDF</span>
        </button>
      </div>
    </header>
  );
}
