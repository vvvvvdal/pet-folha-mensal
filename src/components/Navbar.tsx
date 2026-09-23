'use client';

import React from 'react';
import { UserProfile, GATS } from '@/types';
import { useTheme } from '@/lib/theme';
import {
  LayoutDashboard,
  FileText,
  Download,
  Upload,
  Shield,
  Sun,
  Moon,
  MessageSquareHeart
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'dashboard' | 'official';
  onTabChange: (tab: 'dashboard' | 'official') => void;
  onOpenProfileModal: () => void;
  hasChanges: boolean;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onOpenAdmin: () => void;
  onOpenExitModal: () => void;
  onOpenFeedback: () => void;
}

export function Navbar({
  user,
  activeTab,
  onTabChange,
  onOpenProfileModal,
  hasChanges,
  onExportBackup,
  onImportBackup,
  onOpenAdmin,
  onOpenExitModal,
  onOpenFeedback
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const gatName = user.gatName || GATS[user.gatNumber]?.name || 'PET';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Identity Oficial do PET-Saúde Clima */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <img
            src="/images/avatar-pet-clima.png"
            alt="Avatar Oficial PET-Saúde Clima"
            className="size-7 sm:size-9 object-contain drop-shadow-xs"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-sm sm:text-lg tracking-tight select-none">
              <span className="text-[#DE3831] font-black">PET</span>
              <span className="text-slate-400 font-semibold">-</span>
              <span className="text-[#008D4C] dark:text-[#10B981] font-black">Saúde</span>{' '}
              <span className="text-[#00A3E0] font-black tracking-wider">CLIMA</span>
            </span>
          </div>
        </div>

        {/* Profile Pill: Desktop */}
        <button
          type="button"
          onClick={onOpenProfileModal}
          className="hidden md:flex items-center gap-2.5 h-10 px-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-left transition-all cursor-pointer group shadow-xs shrink-0"
          title="Clique para editar seus dados de identificação"
        >
          <div className="size-7 rounded-lg bg-[#008D4C]/15 text-[#008D4C] dark:text-[#10B981] border border-[#008D4C]/30 flex items-center justify-center font-bold text-xs shrink-0">
            {user.gatNumber}
          </div>
          <div className="flex flex-col justify-center leading-tight min-w-0">
            <span className="text-sm font-semibold text-slate-100 group-hover:text-[#00A3E0] transition-colors truncate max-w-[170px]">
              {user.name}
            </span>
            <span className="text-xs text-slate-400 truncate">
              {user.role} • GAT {user.gatNumber} ({gatName})
            </span>
          </div>
        </button>

        {/* Tabs & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Profile Trigger (compact) */}
          <button
            type="button"
            onClick={onOpenProfileModal}
            className="md:hidden flex items-center gap-1.5 h-9 px-2 sm:px-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-100 font-semibold cursor-pointer shrink-0"
            title="Seu perfil"
          >
            <span className="size-6 rounded-lg bg-[#008D4C]/20 text-[#008D4C] dark:text-[#10B981] font-bold text-xs flex items-center justify-center">
              {user.gatNumber}
            </span>
            <span className="truncate max-w-[65px]">{user.name.split(' ')[0]}</span>
          </button>

          {/* Navigation Segmented Control: Desktop */}
          <div className="hidden md:flex h-10 p-1 items-center gap-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`h-8 px-3 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="size-4" />
              <span>Lançamentos</span>
            </button>
            <button
              onClick={() => onTabChange('official')}
              className={`h-8 px-3 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'official'
                  ? 'bg-slate-800 text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="size-4" />
              <span>Folha Oficial</span>
            </button>
          </div>

          {/* Backup Actions: Desktop */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              type="button"
              onClick={onExportBackup}
              className="h-10 px-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-[#00A3E0] cursor-pointer transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-medium"
              title="Salvar cópia de segurança (.json) no seu dispositivo"
            >
              <Download className="size-4" />
              <span>Baixar</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-[#00A3E0] cursor-pointer transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-medium"
              title="Carregar outro arquivo .json salvo"
            >
              <Upload className="size-4" />
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
            className="size-9 sm:size-10 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 cursor-pointer transition-colors flex items-center justify-center shrink-0"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="size-4 sm:size-4.5" />
            ) : (
              <Moon className="size-4 sm:size-4.5 text-slate-400" />
            )}
          </button>

          {/* Feedback & Avaliação */}
          <button
            type="button"
            onClick={onOpenFeedback}
            className="size-9 sm:size-10 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-[#00A3E0]/40 text-slate-400 hover:text-[#00A3E0] cursor-pointer transition-colors flex items-center justify-center shrink-0"
            title="Avaliação do sistema, sugestões e relato de bugs"
            aria-label="Avaliação do sistema, sugestões e relato de bugs"
          >
            <MessageSquareHeart className="size-4 sm:size-4.5" />
          </button>

          {/* Admin Shield */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="size-9 sm:size-10 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-[#008D4C]/30 text-slate-400 hover:text-[#008D4C] dark:hover:text-[#10B981] cursor-pointer transition-colors flex items-center justify-center shrink-0"
            title="Acesso de gestão / modo administrador"
            aria-label="Acesso de gestão / modo administrador"
          >
            <Shield className="size-4 sm:size-4.5" />
          </button>

          {/* Salvar e Sair */}
          <button
            type="button"
            onClick={onOpenExitModal}
            className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold cursor-pointer transition-colors relative flex items-center gap-1.5 shrink-0"
            title="Salvar arquivo de backup e sair"
          >
            {hasChanges && (
              <span className="size-2 rounded-full bg-amber-400 animate-pulse absolute -top-0.5 -right-0.5 ring-2 ring-slate-950" />
            )}
            <span className="hidden sm:inline">Salvar e Sair</span>
            <span className="sm:hidden">Sair</span>
          </button>
        </div>
      </div>

      {/* Navigation Segmented Control: Mobile Row */}
      <div className="md:hidden px-3.5 pb-2.5 pt-0.5 border-t border-slate-800/40">
        <div className="w-full grid grid-cols-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`min-h-[38px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-slate-100 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="size-3.5" />
            <span>Lançamentos</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('official')}
            className={`min-h-[38px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'official'
                ? 'bg-slate-800 text-slate-100 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="size-3.5" />
            <span>Folha Oficial</span>
          </button>
        </div>
      </div>
    </header>
  );
}
