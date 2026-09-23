'use client';

import React, { useState, useRef } from 'react';
import { UserRole, GATInfo } from '@/types';
import { useTheme } from '@/lib/theme';
import {
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
  Sparkles,
  Sun,
  Moon,
  MessageSquareHeart
} from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

interface LandingPageProps {
  onLoginWithJson: (file: File) => void;
  onCreateProfile: (name: string, gatNumber: string, role: UserRole) => void;
  gats: Record<string, GATInfo>;
  roles: string[];
  onOpenAdmin: () => void;
  onOpenFeedback: () => void;
}

export function LandingPage({
  onLoginWithJson,
  onCreateProfile,
  gats,
  roles,
  onOpenAdmin,
  onOpenFeedback
}: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const { alert } = useDialog();
  const [tab, setTab] = useState<'upload' | 'create'>('upload');
  const [name, setName] = useState('');
  const [selectedGat, setSelectedGat] = useState(Object.keys(gats)[0] || '04');
  const [selectedRole, setSelectedRole] = useState(roles[0] || 'Estudante');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      await alert({
        title: 'Nome Obrigatório',
        message: 'Por favor, digite seu nome completo para continuar.',
        variant: 'warning'
      });
      return;
    }
    onCreateProfile(name.trim(), selectedGat, selectedRole);
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        await alert({
          title: 'Formato Inválido',
          message: 'Por favor, selecione um arquivo de backup com formato .json.',
          variant: 'warning'
        });
        return;
      }
      onLoginWithJson(file);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-100 flex flex-col justify-between selection:bg-[#008D4C] selection:text-white transition-colors">
      {/* Header Superior Limpo com Identidade Visual Oficial */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-2">
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

            {/* Feedback & Avaliação */}
            <button
              type="button"
              onClick={onOpenFeedback}
              className="text-xs sm:text-sm text-slate-400 hover:text-[#00A3E0] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-[#00A3E0]/30 bg-slate-900/60 cursor-pointer transition-colors"
              title="Avaliação do sistema, sugestões e relato de bugs"
            >
              <MessageSquareHeart className="size-4 text-[#00A3E0]" />
              <span className="hidden sm:inline">Avaliação / Feedback</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs sm:text-sm text-slate-400 hover:text-[#008D4C] dark:hover:text-[#10B981] font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-[#008D4C]/30 bg-slate-900/60 cursor-pointer transition-colors"
            >
              <ShieldCheck className="size-4 text-[#008D4C] dark:text-[#10B981]" />
              <span>Acesso Gestão</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#008D4C]/10 border border-[#008D4C]/30 text-[#008D4C] dark:text-[#10B981] text-sm sm:text-base font-bold shadow-xs">
            <Sparkles className="size-4" />
            <span>Folha de Frequência Mensal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Controle de presença simples, rápido e 100% privado.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Lance suas 32 horas mensais de forma simples, acompanhe o total de horas calculadas automaticamente e gere sua folha em A4 pronta para imprimir e assinar.
          </p>
        </section>

        {/* Bloco Explicativo Amigável: O que é o arquivo .json? */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-[#00A3E0]/15 text-[#00A3E0] border border-[#00A3E0]/25 flex items-center justify-center shrink-0">
              <HelpCircle className="size-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                Como funciona o seu acesso? O que é o arquivo .json?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Entenda em 1 minuto como seus dados ficam seguros sem necessidade de senha.
              </p>
            </div>
          </div>

          <div className="text-sm sm:text-base text-slate-200 leading-relaxed space-y-3">
            <p>
              O arquivo <strong>.json</strong> funciona como o seu <strong>crachá e cofre digital pessoal</strong>. Ele é apenas um arquivo de texto muito leve que guarda o seu nome, seu GAT e as atividades que você já cadastrou.
            </p>
            <p className="text-slate-300">
              Para respeitar rigorosamente a sua <strong>privacidade  </strong>, este sistema não armazena os dados de ninguém em um servidor central na internet. As suas informações ficam estritamente com você.
            </p>
          </div>

          {/* Dicas de onde salvar */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-sm font-semibold text-slate-200 block mb-2.5">
              💡 Recomendação: Onde guardar seu arquivo .json após baixar?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs sm:text-sm text-slate-300">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                <Cloud className="size-5 text-[#00A3E0] shrink-0" />
                <span><strong>Google Drive:</strong> Salve em uma pasta na nuvem.</span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                <Smartphone className="size-5 text-[#008D4C] dark:text-[#10B981] shrink-0" />
                <span><strong>WhatsApp:</strong> Envie em conversa consigo mesmo.</span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                <HardDrive className="size-5 text-[#F9BD47] shrink-0" />
                <span><strong>Documentos:</strong> Na pasta do computador ou celular.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Card Interativo de Acesso (Login via JSON ou Primeiro Acesso) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl max-w-2xl mx-auto">
          {/* Alternador de Ação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-semibold mb-6">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                tab === 'upload'
                  ? 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="size-4" />
              <span>Já tenho meu arquivo .json</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('create')}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                tab === 'create'
                  ? 'bg-slate-800 text-white shadow-xs font-bold'
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
                className={`p-8 sm:p-10 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3.5 ${
                  isDragging
                    ? 'border-[#008D4C] bg-[#008D4C]/10'
                    : 'border-slate-700/80 bg-slate-950/50 hover:border-[#008D4C]/50 hover:bg-slate-950'
                }`}
              >
                <div className="size-14 rounded-2xl bg-[#008D4C]/10 text-[#008D4C] dark:text-[#10B981] border border-[#008D4C]/20 flex items-center justify-center">
                  <Upload className="size-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100">
                    Carregar meu arquivo .json de folha
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
                    Arraste o seu arquivo aqui ou clique para selecionar do seu dispositivo.
                  </p>
                </div>
                <span className="min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#008D4C] text-white hover:bg-[#00733E] transition-colors mt-2 shadow-sm shadow-[#008D4C]/25 flex items-center justify-center">
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
              <p className="text-center text-xs sm:text-sm text-slate-300 font-medium">
                Seus dados serão abertos exclusivamente no seu navegador sem expor suas informações.
              </p>
            </div>
          )}

          {/* Opção 2: Criação Inicial de Perfil */}
          {tab === 'create' && (
            <form onSubmit={handleCreateSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Maria Eduarda Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-base sm:text-sm outline-none focus:border-[#008D4C] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                    Sua Função no PET
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-base sm:text-sm outline-none focus:border-[#008D4C] cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-slate-100">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-300 mb-1.5">
                    Seu Grupo (GAT)
                  </label>
                  <select
                    value={selectedGat}
                    onChange={(e) => setSelectedGat(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-base sm:text-sm outline-none focus:border-[#008D4C] cursor-pointer"
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
                className="w-full min-h-[48px] py-3.5 px-5 rounded-xl text-sm sm:text-base font-bold bg-[#008D4C] text-white hover:bg-[#00733E] cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#008D4C]/25 mt-2"
              >
                <span>Criar Minha Folha e Começar</span>
                <ArrowRight className="size-4" />
              </button>

              <p className="text-center text-xs sm:text-sm text-slate-300 font-medium">
                Ao criar, você começará sua folha vazia e ao final poderá salvar seu arquivo .json.
              </p>
            </form>
          )}
        </section>

        {/* 3 Pilares do Sistema - Ampliados */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
          <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="size-12 rounded-xl bg-[#008D4C]/10 text-[#008D4C] dark:text-[#10B981] flex items-center justify-center border border-[#008D4C]/20">
              <Clock className="size-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">Cálculo Preciso das 32h</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Calcula os intervalos obedecendo à regra oficial de horas inteiras iniciadas para validação do Ministério da Saúde.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="size-12 rounded-xl bg-[#00A3E0]/10 text-[#00A3E0] flex items-center justify-center border border-[#00A3E0]/20">
              <FileCheck className="size-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">Folha Oficial A4</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Exatamente no modelo exigido pela SGTES/MS, pronta para visualização, impressão em página única e assinatura.
            </p>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="size-12 rounded-xl bg-[#DE3831]/10 text-[#DE3831] flex items-center justify-center border border-[#DE3831]/20">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">Privacidade Garantida</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Nenhum dado é salvo em servidor central. Não coletamos, guardamos ou visualizamos nenhum registro seu.
            </p>
          </div>
        </section>
      </main>

      {/* Footer com Créditos */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>
          PET-Saúde Clima: Folha de Frequência Mensal &copy; {new Date().getFullYear()} • Desenvolvido por{' '}
          <a
            href="https://www.linkedin.com/in/vvvvvdal/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-200 font-semibold underline underline-offset-2 hover:text-[#008D4C] dark:hover:text-[#10B981] transition-colors"
          >
            Felipe Vidal
          </a>{' '}
          &amp;{' '}
          <a
            href="https://www.linkedin.com/in/robert-taveira/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-200 font-semibold underline underline-offset-2 hover:text-[#008D4C] dark:hover:text-[#10B981] transition-colors"
          >
            Robert Taveira
          </a>
        </p>
        <div className="mt-2.5 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <button
            type="button"
            onClick={onOpenFeedback}
            className="hover:text-[#00A3E0] underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquareHeart className="size-3.5 text-[#00A3E0]" />
            <span>Avaliação do Sistema &amp; Relato de Bugs</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
