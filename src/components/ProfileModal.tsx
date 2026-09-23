'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, GATInfo } from '@/types';
import { normalizeName } from '@/lib/storage';
import { X, Check, User, Shield } from 'lucide-react';

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Checar duplicata com outro participante existente
    const normalizedNew = normalizeName(name);
    if (
      allProfiles.some(
        (p) => p.id !== currentUser.id && normalizeName(p.name) === normalizedNew
      )
    ) {
      alert(`Já existe outro participante cadastrado com o nome "${name.trim()}".`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <User className="size-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Identificação do Participante
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Grupo Tutorial (GAT)
              </label>
              <select
                value={gatNumber}
                onChange={(e) => setGatNumber(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
              >
                {Object.entries(gats).map(([num, info]) => (
                  <option key={num} value={num}>
                    GAT {num} ({info.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Função no SUS
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Seus dados são salvos exclusivamente no seu dispositivo (100% no navegador).
          </p>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Shield className="size-3 text-emerald-400" />
              <span>Painel Admin</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Check className="size-3.5" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
