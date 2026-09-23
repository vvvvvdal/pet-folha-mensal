'use client';

import React, { useState, useRef } from 'react';
import { UserProfile, UserRole, GATInfo } from '@/types';
import {
  Leaf,
  Upload,
  UserPlus,
  FileCheck,
  ShieldCheck,
  Clock,
  HardDrive,
  Cloud,
  Smartphone,
  HelpCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onLoginWithJson: (file: File) => void;
  onCreateProfile: (name: string, gatNumber: string, role: UserRole) => void;
  gats: Record<string, GATInfo>;
  roles: string[];
  onOpenAdmin: () => void;
}

export function LandingPage({
  onLoginWithJson,
  onCreateProfile,
  gats,
  roles,
  onOpenAdmin
}: LandingPageProps) {
  const [tab, setTab] = useState<'upload' | 'create'>('upload');
  const [name, setName] = useState('');
  const [selectedGat, setSelectedGat] = useState(Object.keys(gats)[0] || '04');
  const [selectedRole, setSelectedRole] = useState(roles[0] || 'Estudante');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, digite seu nome completo.');
      return;
    }
    onCreateProfile(name.trim(), selectedGat, selectedRole);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        alert('Por favor, selecione um arquivo com formato .json.');
        return;
      }
      onLoginWithJson(file);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Header Superior Limpo */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Leaf className="size-5" />
            </div>
            <span className="font-bold text-slate-100 text-base sm:text-lg tracking-tight">
              PET Saúde Clima
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-emerald-500/30 bg-slate-900/60 cursor-pointer transition-colors"
          >
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Acesso Gestão</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
            <Sparkles className="size-3.5" />
            <span>Folha de Frequência Mensal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Controle de presença simples, rápido e 100% privado.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Lance suas 8 horas semanais de dedicação, acompanhe o cômputo oficial do edital e emita sua folha em A4 pronta para impressão e validação da bolsa.
          </p>
        </section>

        {/* Bloco Explicativo Amigável: O que é o arquivo .json? */}
        <section className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
              <HelpCircle className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Como funciona o seu acesso? O que é o arquivo .json?
              </h2>
              <p className="text-xs text-slate-400">
                Entenda em 1 minuto como seus dados ficam seguros sem necessidade de senha.
              </p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
            <p>
              O arquivo <strong>.json</strong> funciona como o seu <strong>crachá e cofre digital pessoal</strong>. Ele é apenas um arquivo de texto muito leve que guarda o seu nome, seu GAT e as atividades que você já cadastrou.
            </p>
            <p className="text-slate-400">
              Para respeitar rigorosamente a sua <strong>privacidade (LGPD)</strong>, este sistema não armazena os dados de ninguém em um servidor central na internet. As suas informações ficam estritamente com você.
            </p>
          </div>

          {/* Dicas de onde salvar */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-200 block mb-2">
              💡 Recomendação: Onde guardar seu arquivo .json após baixar?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                <Cloud className="size-4 text-sky-400 shrink-0" />
                <span><strong>Google Drive:</strong> Salve em uma pasta na nuvem.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                <Smartphone className="size-4 text-emerald-400 shrink-0" />
                <span><strong>WhatsApp:</strong> Envie em conversa consigo mesmo.</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                <HardDrive className="size-4 text-amber-400 shrink-0" />
                <span><strong>Documentos:</strong> Na pasta do computador ou celular.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Card Interativo de Acesso (Login via JSON ou Primeiro Acesso) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl max-w-2xl mx-auto">
          {/* Alternador de Ação */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-semibold mb-6">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                tab === 'upload'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="size-4" />
              <span>Já tenho meu arquivo .json</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('create')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                tab === 'create'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="size-4" />
              <span>Primeiro Acesso (Criar)</span>
            </button>
          </div>

          {/* Opção 1: Upload do Arquivo .json para Entrar */}
          {tab === 'upload' && (
            <div className="space-y-4 animate-fade-in">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 sm:p-10 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700/80 bg-slate-950/50 hover:border-emerald-500/50 hover:bg-slate-950'
                }`}
              >
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Upload className="size-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    Carregar meu arquivo .json de folha
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Arraste o seu arquivo aqui ou clique para selecionar do seu dispositivo.
                  </p>
                </div>
                <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors mt-2">
                  Selecionar Arquivo .json
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onLoginWithJson(file);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <p className="text-center text-[11px] text-slate-400">
                Seus dados serão abertos exclusivamente no seu navegador sem expor suas informações.
              </p>
            </div>
          )}

          {/* Opção 2: Criação Inicial de Perfil */}
          {tab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Maria Eduarda Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-sm outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Sua Função no PET
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs sm:text-sm outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-slate-100">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Seu Grupo (GAT)
                  </label>
                  <select
                    value={selectedGat}
                    onChange={(e) => setSelectedGat(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs sm:text-sm outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.values(gats).map((gat) => (
                      <option key={gat.number} value={gat.number} className="bg-slate-900 text-slate-100">
                        GAT {gat.number} ({gat.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 mt-2"
              >
                <span>Criar Minha Folha e Começar</span>
                <ArrowRight className="size-4" />
              </button>

              <p className="text-center text-[11px] text-slate-400">
                Ao criar, você começará sua folha vazia e ao final poderá salvar seu arquivo .json.
              </p>
            </form>
          )}
        </section>

        {/* 3 Pilares do Sistema */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Cálculo Preciso das 8h</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calcula os intervalos obedecendo à regra oficial de horas inteiras iniciadas para validação do Ministério da Saúde.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="size-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <FileCheck className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Folha Oficial A4</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exatamente no modelo exigido pela SGTES/MS, pronta para visualização, impressão em página única e assinatura.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">Privacidade Garantida</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nenhum dado é salvo em servidor central. Você não vê o nome dos outros participantes e ninguém vê o seu.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>PET-Saúde Clima • SMS Goiânia, SES Goiás e Universidade Federal de Goiás (UFG)</p>
      </footer>
    </div>
  );
}
