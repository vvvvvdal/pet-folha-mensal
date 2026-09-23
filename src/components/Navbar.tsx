'use client';

import React from 'react';
import { UserProfile, GATS } from '@/types';
import { LayoutDashboard, FileText, Printer, Download, Upload, Shield, Leaf, ChevronDown } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="size-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Leaf className="size-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm sm:text-base tracking-tight truncate">
                PET Saúde Clima
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                13ª Edição
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">
              SMS Goiânia • SES Goiás • UFG
            </span>
          </div>
        </div>

        {/* Profile Switcher Pill */}
        <button
          type="button"
          onClick={onOpenProfileModal}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-left transition-all cursor-pointer group"
          title="Clique para trocar de participante ou editar seus dados"
        >
          <div className="size-7 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
            {user.gatNumber}
          </div>
          <div className="flex flex-col text-xs leading-tight">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
              <span className="truncate max-w-[140px]">{user.name}</span>
              <ChevronDown className="size-3 text-slate-400 group-hover:text-slate-200" />
            </div>
            <span className="text-[10px] text-slate-400">
              {user.role} • GAT {user.gatNumber} ({gatName})
            </span>
          </div>
        </button>

        {/* Tabs & Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Profile Trigger */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-xs text-slate-200 font-medium"
          >
            <span className="size-5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">
              {user.gatNumber}
            </span>
            <span className="truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
          </button>

          {/* Navigation Segmented Control */}
          <div className="flex p-0.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="size-3.5" />
              <span className="hidden sm:inline">Lançamentos</span>
            </button>
            <button
              onClick={() => onTabChange('official')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'official'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="size-3.5" />
              <span className="hidden sm:inline">Folha Oficial</span>
            </button>
          </div>

          {/* Backup Actions */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={onExportBackup}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
              title="Salvar cópia de segurança dos seus lançamentos no seu dispositivo"
            >
              <Download className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
              title="Restaurar lançamentos a partir de um arquivo salvo"
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

          {/* Admin Shield */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors"
            title="Acesso de gestão / modo administrador (PIN 4031)"
          >
            <Shield className="size-3.5" />
          </button>

          {/* Primary Action Button: Print PDF */}
          <button
            onClick={onPrint}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/10 cursor-pointer relative"
          >
            {hasChanges && (
              <span className="size-2 rounded-full bg-amber-400 animate-pulse absolute -top-0.5 -right-0.5 ring-2 ring-slate-950" />
            )}
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
