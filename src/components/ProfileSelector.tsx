'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole, GATS } from '@/types';
import { ThemeToggle } from './ThemeToggle';
import { UserPlus, UserCheck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface ProfileSelectorProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onCreateProfile: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => void;
}

export function ProfileSelector({ profiles, onSelectProfile, onCreateProfile }: ProfileSelectorProps) {
  const [isCreating, setIsCreating] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Estudante');
  const [gatNumber, setGatNumber] = useState('04');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateProfile({
      name: name.trim(),
      role,
      gatNumber,
      email: email.trim() || undefined,
      pin: pin.trim() || undefined
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 transition-all"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <div className="w-full max-w-md">
        {/* Header com Logo e ThemeToggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-pet-clima.png" alt="PET-Saúde Clima" className="h-10 object-contain" />
          </div>
          <ThemeToggle />
        </div>

        {/* Card Principal */}
        <div
          className="p-6 rounded-2xl border shadow-xl transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="mb-5 text-center">
            <h1 className="text-xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-heading)' }}>
              PET-Saúde Clima UFG
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Gestor de Folha de Frequência Mensal • Edital SGTES/MS 23/2026
            </p>
          </div>

          {!isCreating ? (
            <div>
              <div className="text-xs font-semibold mb-3 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>Bolsistas e Membros Registrados:</span>
                <span className="text-[11px] opacity-80">Selecione para entrar</span>
              </div>

              <div className="space-y-2 mb-5">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectProfile(p)}
                    className="w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer hover:border-[var(--accent-sage)] hover:bg-[var(--bg-elevated)] group"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-subtle)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border"
                        style={{
                          backgroundColor: 'var(--bg-canvas)',
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--accent-sage)'
                        }}
                      >
                        {p.gatNumber}
                      </div>
                      <div>
                        <div className="text-sm font-semibold group-hover:text-[var(--accent-sage)] transition-colors" style={{ color: 'var(--text-heading)' }}>
                          {p.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {p.role} • GAT {p.gatNumber} ({GATS[p.gatNumber]?.name || 'GAT'})
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" style={{ color: 'var(--accent-sage)' }} />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-[var(--accent-sky)] hover:text-[var(--accent-sky)]"
                style={{
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-muted)'
                }}
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar Novo Bolsista / Orientador
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>
                Identificação do Participante:
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Clara dos Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)]"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                />
              </div>

              {/* GAT e Papel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                    Grupo Tutorial (GAT)
                  </label>
                  <select
                    value={gatNumber}
                    onChange={(e) => setGatNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)]"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                  >
                    <option value="01">GAT 01 (Araticum)</option>
                    <option value="02">GAT 02 (Buriti)</option>
                    <option value="03">GAT 03 (Ipê-amarelo)</option>
                    <option value="04">GAT 04 (Mangaba)</option>
                    <option value="05">GAT 05 (Pequi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                    Perfil / Função
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)]"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                  >
                    <option value="Estudante">Estudante</option>
                    <option value="Orientador de Serviço">Orientador de Serviço</option>
                    <option value="Preceptor">Preceptor</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Coordenador de GAT">Coordenador de GAT</option>
                  </select>
                </div>
              </div>

              {/* E-mail e PIN opcional */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                    E-mail (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="email@ufg.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)]"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                    PIN / Senha Rápida
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Ex: 1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)]"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm hover:brightness-105 flex items-center justify-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--accent-sage)',
                    color: '#0d2818'
                  }}
                >
                  <UserCheck className="w-4 h-4" />
                  Salvar e Acessar Folha
                </button>

                {profiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--bg-elevated)]"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-heading)'
                    }}
                  >
                    Voltar
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="mt-6 text-center text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
          <p>SMS Goiânia • SES Goiás • Universidade Federal de Goiás</p>
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent-sage)' }} />
            Regra PET: Cada hora do relógio iniciada = 1h cheia (Meta: 8h/semana)
          </p>
        </div>
      </div>
    </div>
  );
}
