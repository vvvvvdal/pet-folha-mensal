'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, GATInfo } from '@/types';
import { normalizeName } from '@/lib/storage';
import { X, Check, User, Shield } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allProfiles: UserProfile[];
  gats: Record<string, GATInfo>;
  roles: string[];
  onSaveProfile: (updated: UserProfile) => void;
  onOpenAdmin: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  allProfiles,
  gats,
  roles,
  onSaveProfile,
  onOpenAdmin
}: ProfileModalProps) {
  const { alert } = useDialog();
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [gatNumber, setGatNumber] = useState(currentUser.gatNumber);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setRole(currentUser.role);
      setGatNumber(currentUser.gatNumber);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Checar duplicata com outro participante existente
    const normalizedNew = normalizeName(name);
    if (
      allProfiles.some(
        (p) => p.id !== currentUser.id && normalizeName(p.name) === normalizedNew
      )
    ) {
      await alert({
        title: 'Nome Duplicado',
        message: `Já existe outro participante cadastrado com o nome "${name.trim()}".`,
        variant: 'warning'
      });
      return;
    }

    const gatInfo = gats[gatNumber];
    onSaveProfile({
      ...currentUser,
      name: name.trim(),
      role,
      gatNumber,
      gatName: gatInfo?.name || `GAT ${gatNumber}`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl transition-all max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <User className="size-4.5" style={{ color: '#10B981' }} />
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Identificação do Participante
            </h3>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                Grupo Tutorial (GAT)
              </label>
              <select
                value={gatNumber}
                onChange={(e) => setGatNumber(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2.5 text-base sm:text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C] cursor-pointer transition-colors"
              >
                {Object.entries(gats).map(([num, info]) => (
                  <option key={num} value={num}>
                    GAT {num} ({info.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                Função no SUS
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full min-h-[44px] px-3 py-2.5 text-base sm:text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C] cursor-pointer transition-colors"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Seus dados são salvos exclusivamente no seu dispositivo (100% no navegador).
          </p>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="text-xs text-slate-400 hover:text-[#10B981] flex items-center justify-center sm:justify-start gap-1.5 py-2 cursor-pointer transition-colors"
            >
              <Shield className="size-3.5" style={{ color: '#10B981' }} />
              <span>Painel Admin</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-[#008D4C] hover:bg-[#00733E] cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Check className="size-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
