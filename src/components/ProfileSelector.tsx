'use client';

import React, { useState } from 'react';
import { UserProfile, UserRole, GATS } from '@/types';
import { ThemeToggle } from './ThemeToggle';
import {
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  LogIn,
  AlertCircle,
  Users
} from 'lucide-react';
import { loginWithPin, registerProfile } from '@/lib/storage';

interface ProfileSelectorProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onRefreshProfiles: () => void;
}

export function ProfileSelector({ profiles, onSelectProfile, onRefreshProfiles }: ProfileSelectorProps) {
  const [activeTab, setActiveTab] = useState<'quick' | 'login' | 'register'>('quick');

  // Estado para PIN de login rápido
  const [selectedUserForPin, setSelectedUserForPin] = useState<UserProfile | null>(null);
  const [quickPin, setQuickPin] = useState('');
  const [quickPinError, setQuickPinError] = useState('');

  // Estado para login com e-mail
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estado para cadastro de novo usuário
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Estudante');
  const [regGatNumber, setRegGatNumber] = useState('04');
  const [regPin, setRegPin] = useState('');
  const [regError, setRegError] = useState('');

  // Submissão do PIN rápido
  const handleQuickPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPin) return;

    if (!selectedUserForPin.pin || selectedUserForPin.pin === quickPin.trim()) {
      onSelectProfile(selectedUserForPin);
    } else {
      setQuickPinError('PIN incorreto. O PIN padrão para testes é 1234.');
    }
  };

  // Submissão do login por e-mail
  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const result = loginWithPin(loginEmail, loginPin);
    if (result.success && result.user) {
      onSelectProfile(result.user);
    } else {
      setLoginError(result.error || 'Credenciais inválidas.');
    }
  };

  // Submissão do registro
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Por favor preencha nome e e-mail.');
      return;
    }

    const result = registerProfile({
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      gatNumber: regGatNumber,
      pin: regPin.trim() || '1234'
    });

    if (result.success && result.user) {
      onRefreshProfiles();
      onSelectProfile(result.user);
    } else {
      setRegError(result.error || 'Falha ao cadastrar participante.');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 transition-all"
      style={{ backgroundColor: 'var(--bg-canvas)' }}
    >
      <div className="w-full max-w-lg">
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

          {/* Seletor de Abas de Autenticação */}
          <div
            className="flex p-1 rounded-xl mb-5 border"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('quick');
                setSelectedUserForPin(null);
                setQuickPin('');
                setQuickPinError('');
              }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === 'quick' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'quick' ? 'var(--text-heading)' : 'var(--text-muted)',
                boxShadow: activeTab === 'quick' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Acesso Rápido</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError('');
              }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'login' ? 'var(--text-heading)' : 'var(--text-muted)',
                boxShadow: activeTab === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>E-mail & PIN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError('');
              }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === 'register' ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === 'register' ? 'var(--text-heading)' : 'var(--text-muted)',
                boxShadow: activeTab === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar</span>
            </button>
          </div>

          {/* ============================================================
              ABA 1: ACESSO RÁPIDO (SELEÇÃO DE PERFIL COM PIN)
              ============================================================ */}
          {activeTab === 'quick' && (
            <div>
              {!selectedUserForPin ? (
                <>
                  <div className="text-xs font-semibold mb-3 flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
                    <span>Selecione seu perfil para entrar:</span>
                    <span className="text-[11px] opacity-75">5 GATs disponíveis</span>
                  </div>

                  <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-1">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (p.pin) {
                            setSelectedUserForPin(p);
                            setQuickPin('');
                            setQuickPinError('');
                          } else {
                            onSelectProfile(p);
                          }
                        }}
                        className="w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer hover:border-[var(--accent-sage)] hover:bg-[var(--bg-elevated)] group"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border-subtle)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border flex-shrink-0"
                            style={{
                              backgroundColor: 'var(--bg-canvas)',
                              borderColor: 'var(--border-subtle)',
                              color: 'var(--accent-sage)'
                            }}
                          >
                            {p.gatNumber}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate group-hover:text-[var(--accent-sage)] transition-colors" style={{ color: 'var(--text-heading)' }}>
                              {p.name}
                            </div>
                            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                              {p.role} • GAT {p.gatNumber} ({p.gatName || GATS[p.gatNumber]?.name || 'GAT'})
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {p.pin && (
                            <Lock className="w-3.5 h-3.5 opacity-60" style={{ color: 'var(--text-muted)' }} />
                          )}
                          <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" style={{ color: 'var(--accent-sage)' }} />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="text-xs font-semibold transition-colors hover:underline cursor-pointer"
                      style={{ color: 'var(--accent-sky)' }}
                    >
                      Não encontrou seu nome? Cadastre-se em segundos →
                    </button>
                  </div>
                </>
              ) : (
                /* Modal de confirmação de PIN */
                <form onSubmit={handleQuickPinSubmit} className="space-y-4">
                  <div className="p-4 rounded-xl border text-center" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                    <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-sm border" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--accent-sage)', borderColor: 'var(--border-subtle)' }}>
                      {selectedUserForPin.gatNumber}
                    </div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>
                      {selectedUserForPin.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {selectedUserForPin.role} • GAT {selectedUserForPin.gatNumber} ({selectedUserForPin.gatName || GATS[selectedUserForPin.gatNumber]?.name})
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                      Digite seu PIN de 4 dígitos:
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={6}
                        autoFocus
                        required
                        placeholder="••••"
                        value={quickPin}
                        onChange={(e) => setQuickPin(e.target.value)}
                        className="w-full px-3 py-2.5 text-center text-lg tracking-widest font-mono rounded-xl border outline-none focus:border-[var(--accent-sage)]"
                        style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                      />
                      <KeyRound className="w-4 h-4 absolute right-3 top-3.5 opacity-50" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {quickPinError && (
                      <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {quickPinError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm hover:brightness-105 flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: 'var(--accent-sage)', color: '#0d2818' }}
                    >
                      <LogIn className="w-4 h-4" />
                      Acessar Folha
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserForPin(null);
                        setQuickPin('');
                        setQuickPinError('');
                      }}
                      className="py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer hover:bg-[var(--bg-elevated)]"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                    >
                      Voltar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ============================================================
              ABA 2: LOGIN COM E-MAIL E PIN
              ============================================================ */}
          {activeTab === 'login' && (
            <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  E-mail institucional ou cadastrado
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="usuario@ufg.br ou @sms.goiania..."
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none focus:border-[var(--accent-sky)]"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-3 opacity-50" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  PIN / Senha de Acesso
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="••••"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none focus:border-[var(--accent-sky)]"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                  />
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 opacity-50" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm hover:brightness-105 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--accent-sky)', color: '#0a192f' }}
              >
                <LogIn className="w-4 h-4" />
                Entrar no Sistema
              </button>
            </form>
          )}

          {/* ============================================================
              ABA 3: CADASTRO DE NOVO PARTICIPANTE
              ============================================================ */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Carolina Freitas"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border outline-none focus:border-[var(--accent-sage)]"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  E-mail Institucional
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@discente.ufg.br"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border outline-none focus:border-[var(--accent-sage)]"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                    Grupo Tutorial (GAT)
                  </label>
                  <select
                    value={regGatNumber}
                    onChange={(e) => setRegGatNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border outline-none focus:border-[var(--accent-sage)] cursor-pointer"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                  >
                    <option value="01">GAT 01 (Araticum - SAN)</option>
                    <option value="02">GAT 02 (Buriti - RAPS)</option>
                    <option value="03">GAT 03 (Ipê - Farmácia)</option>
                    <option value="04">GAT 04 (Mangaba - Com.)</option>
                    <option value="05">GAT 05 (Pequi - IA/Vig.)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                    Perfil / Função SUS
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm rounded-xl border outline-none focus:border-[var(--accent-sage)] cursor-pointer"
                    style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                  >
                    <option value="Estudante">Estudante Bolsista</option>
                    <option value="Preceptor">Preceptor SMS/SES</option>
                    <option value="Tutor">Tutor Bolsista</option>
                    <option value="Orientador de Serviço">Orientador de Serviço</option>
                    <option value="Coordenador de GAT">Coordenador de GAT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  Defina um PIN de Acesso (4 a 6 dígitos)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="Ex: 1234"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border outline-none focus:border-[var(--accent-sage)]"
                  style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                />
              </div>

              {regError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {regError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm hover:brightness-105 flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--accent-sage)', color: '#0d2818' }}
              >
                <UserPlus className="w-4 h-4" />
                Cadastrar e Acessar Folha
              </button>
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

