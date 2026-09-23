'use client';

import React from 'react';
import { UserProfile, GATS } from '@/types';
import { ThemeToggle } from './ThemeToggle';
import { LayoutDashboard, FileText, UserCheck, LogOut, Printer } from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'dashboard' | 'official';
  onTabChange: (tab: 'dashboard' | 'official') => void;
  onLogout: () => void;
  onPrint: () => void;
}

export function Navbar({ user, activeTab, onTabChange, onLogout, onPrint }: NavbarProps) {
  const gatName = user.gatName || GATS[user.gatNumber]?.name || 'PET';

  return (
    <nav
      className="p-3.5 sm:p-4 rounded-xl border mb-6 transition-all flex flex-col md:flex-row items-center justify-between gap-4"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* Lado Esquerdo: Identificação do Usuário e GAT */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border flex-shrink-0"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--accent-sage)'
            }}
          >
            {user.gatNumber}
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-heading)' }}>
              <span>{user.name}</span>
              <UserCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent-sage)' }} />
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {user.role} • GAT {user.gatNumber} ({gatName}) • SMS Goiânia / SES Goiás / UFG
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="md:hidden p-2 text-xs rounded-lg border hover:bg-[var(--bg-elevated)] cursor-pointer"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
          title="Trocar de perfil"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Centro: Alternador de Abas */}
      <div
        className="inline-flex p-1 rounded-lg border gap-1 w-full md:w-auto justify-center"
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dashboard' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'dashboard' ? 'var(--bg-elevated)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--text-heading)' : 'var(--text-muted)'
          }}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Painel de Lançamentos
        </button>
        <button
          onClick={() => onTabChange('official')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'official' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: activeTab === 'official' ? 'var(--bg-elevated)' : 'transparent',
            color: activeTab === 'official' ? 'var(--text-heading)' : 'var(--text-muted)'
          }}
        >
          <FileText className="w-3.5 h-3.5" />
          Folha Oficial (A4 Paisagem)
        </button>
      </div>

      {/* Lado Direito: Botão Imprimir, Alternador de Tema e Sair */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        <button
          onClick={onPrint}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm hover:brightness-105"
          style={{
            backgroundColor: 'var(--accent-sky)',
            color: '#0b1928'
          }}
        >
          <Printer className="w-3.5 h-3.5" />
          Salvar / Imprimir PDF
        </button>

        <ThemeToggle />

        <button
          onClick={onLogout}
          className="hidden md:flex p-1.5 text-xs rounded-lg border hover:bg-[var(--bg-elevated)] cursor-pointer items-center gap-1"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
          title="Trocar de bolsista/perfil"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
