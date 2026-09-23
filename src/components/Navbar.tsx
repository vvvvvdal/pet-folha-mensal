'use client';

import React from 'react';
import { UserProfile, GATS } from '@/types';
import { useTheme } from '@/lib/theme';
import {
  LayoutDashboard,
  FileText,
  Printer,
  Download,
  Upload,
  Shield,
  Sun,
  Moon
} from 'lucide-react';

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
  onOpenExitModal: () => void;
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
  onOpenAdmin,
  onOpenExitModal
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const gatName = user.gatName || GATS[user.gatNumber]?.name || 'PET';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Identity Oficial do PET-Saúde Clima */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/images/avatar-pet-clima.png"
            alt="Avatar Oficial PET-Saúde Clima"
            className="size-8 sm:size-9 object-contain drop-shadow-xs"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-base sm:text-lg tracking-tight select-none">
              <span className="text-[#DE3831] font-black">PET</span>
              <span className="text-slate-400 font-semibold">-</span>
              <span className="text-[#008D4C] dark:text-[#10B981] font-black">Saúde</span>{' '}
              <span className="text-[#00A3E0] font-black tracking-wider">CLIMA</span>
            </span>
          </div>
        </div>

        {/* Profile Pill: Apenas dados do participante ativo */}
        <button
          type="button"
          onClick={onOpenProfileModal}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-left transition-all cursor-pointer group shadow-xs"
          title="Clique para editar seus dados de identificação"
        >
          <div className="size-7 rounded-lg bg-[#008D4C]/15 text-[#008D4C] dark:text-[#10B981] border border-[#008D4C]/30 flex items-center justify-center font-bold text-xs">
            {user.gatNumber}
          </div>
          <div className="flex flex-col text-xs leading-tight">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 group-hover:text-[#00A3E0] transition-colors">
              <span className="truncate max-w-[150px]">{user.name}</span>
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
            <span className="size-5 rounded bg-[#008D4C]/20 text-[#008D4C] dark:text-[#10B981] font-bold text-[10px] flex items-center justify-center">
              {user.gatNumber}
            </span>
            <span className="truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
          </button>

          {/* Navigation Segmented Control */}
          <div className="flex p-0.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-slate-100 shadow-xs font-semibold'
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
                  ? 'bg-slate-800 text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="size-3.5" />
              <span className="hidden sm:inline">Folha Oficial</span>
            </button>
          </div>

          {/* Backup Actions */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              type="button"
              onClick={onExportBackup}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-[#00A3E0] cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Salvar cópia de segurança (.json) no seu dispositivo"
            >
              <Download className="size-3.5" />
              <span>Baixar</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-[#00A3E0] cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Carregar outro arquivo .json salvo"
            >
              <Upload className="size-3.5" />
              <span>Carregar</span>
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

          {/* Alternador de Tema: Claro / Escuro */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 cursor-pointer transition-colors"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4 text-slate-400" />
            )}
          </button>

          {/* Admin Shield */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-[#008D4C]/30 text-slate-400 hover:text-[#008D4C] dark:hover:text-[#10B981] cursor-pointer transition-colors"
            title="Acesso de gestão / modo administrador"
          >
            <Shield className="size-4" />
          </button>

          {/* Sair / Salvar Obrigatório */}
          <button
            type="button"
            onClick={onOpenExitModal}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
            title="Salvar arquivo de backup e sair"
          >
            Salvar e Sair
          </button>

          {/* Primary Action Button: Print PDF */}
          <button
            onClick={onPrint}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#008D4C] text-white hover:bg-[#00733E] transition-all flex items-center gap-1.5 shadow-sm shadow-[#008D4C]/25 cursor-pointer relative"
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
