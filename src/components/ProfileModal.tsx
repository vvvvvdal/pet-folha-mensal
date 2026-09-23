'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole, GATS } from '@/types';
import { X, Check, User, Users } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allProfiles: UserProfile[];
  onSaveProfile: (updated: UserProfile) => void;
  onSwitchProfile: (profile: UserProfile) => void;
  onCreateNew: (name: string, gatNumber: string, role: UserRole) => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  allProfiles,
  onSaveProfile,
  onSwitchProfile,
  onCreateNew
}: ProfileModalProps) {
  const [mode, setMode] = useState<'edit' | 'switch'>('edit');
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [gatNumber, setGatNumber] = useState(currentUser.gatNumber);

  // New profile state
  const [newName, setNewName] = useState('');
  const [newGat, setNewGat] = useState('04');
  const [newRole, setNewRole] = useState<UserRole>('Estudante');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const gatInfo = GATS[gatNumber];
    onSaveProfile({
      ...currentUser,
      name: name.trim(),
      role,
      gatNumber,
      gatName: gatInfo?.name || `GAT ${gatNumber}`
    });
    onClose();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateNew(newName.trim(), newGat, newRole);
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
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              {mode === 'edit' ? 'Identificação do Participante' : 'Alternar Participante'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-0.5 rounded-lg bg-slate-950/60 border border-slate-800 mb-4 text-xs font-medium">
          <button
            onClick={() => setMode('edit')}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'edit' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Editar Meus Dados
          </button>
          <button
            onClick={() => setMode('switch')}
            className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer ${
              mode === 'switch' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trocar / Novo ({allProfiles.length})
          </button>
        </div>

        {mode === 'edit' ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome Completo</label>
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
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Grupo Tutorial (GAT)</label>
                <select
                  value={gatNumber}
                  onChange={(e) => setGatNumber(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="01">GAT 01 (Araticum)</option>
                  <option value="02">GAT 02 (Buriti)</option>
                  <option value="03">GAT 03 (Ipê-amarelo)</option>
                  <option value="04">GAT 04 (Mangaba)</option>
                  <option value="05">GAT 05 (Pequi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Função no SUS</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Estudante">Estudante</option>
                  <option value="Preceptor">Preceptor</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Orientador de Serviço">Orientador</option>
                  <option value="Coordenador de GAT">Coordenador</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Os dados ficam armazenados exclusivamente no seu navegador (Local-First).
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {allProfiles.map((p) => {
                const isActive = p.id === currentUser.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSwitchProfile(p);
                      onClose();
                    }}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.role} • GAT {p.gatNumber} ({p.gatName || GATS[p.gatNumber]?.name})
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2">Cadastrar Outro Participante</div>
              <form onSubmit={handleCreate} className="space-y-2.5">
                <input
                  type="text"
                  required
                  placeholder="Nome do novo participante..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newGat}
                    onChange={(e) => setNewGat(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="01">GAT 01 (Araticum)</option>
                    <option value="02">GAT 02 (Buriti)</option>
                    <option value="03">GAT 03 (Ipê)</option>
                    <option value="04">GAT 04 (Mangaba)</option>
                    <option value="05">GAT 05 (Pequi)</option>
                  </select>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Estudante">Estudante</option>
                    <option value="Preceptor">Preceptor</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Orientador de Serviço">Orientador</option>
                    <option value="Coordenador de GAT">Coordenador</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  Adicionar e Ativar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
