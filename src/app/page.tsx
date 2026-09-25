'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, Activity, UserRole, GATInfo, ActivityTemplate } from '@/types';
import {
  getStoredProfiles,
  saveProfiles,
  getActiveProfile,
  setActiveProfileId,
  getActivitiesForMonth,
  saveActivitiesForMonth,
  loadSampleActivitiesForUser,
  clearActivitiesForMonth,
  exportUserData,
  importUserData,
  getStoredGats,
  getStoredRoles,
  getStoredTemplates,
  registerProfile
} from '@/lib/storage';
import { calcPetHours, getMonthYearLabel, formatDateBR } from '@/lib/pet-calculator';
import { Navbar } from '@/components/Navbar';
import { ProfileModal } from '@/components/ProfileModal';
import { AdminModal } from '@/components/AdminModal';
import { StatsGrid } from '@/components/StatsGrid';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityTable } from '@/components/ActivityTable';
import { EditActivityModal } from '@/components/EditActivityModal';
import { OfficialSheet } from '@/components/OfficialSheet';
import { LandingPage } from '@/components/LandingPage';
import { ExitModal } from '@/components/ExitModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { Calendar, Download, Printer, CheckCircle2, ArrowLeft, MessageSquareHeart } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

export default function Home() {
  const { alert, confirm } = useDialog();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [monthKey, setMonthKey] = useState('2026-09');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'official'>('dashboard');
  const [showBlankTemplate, setShowBlankTemplate] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados Dinâmicos de Configuração (GATs, Funções e Templates)
  const [gats, setGats] = useState<Record<string, GATInfo>>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);

  // Inicialização Local-First
  useEffect(() => {
    const loadedProfiles = getStoredProfiles();
    setProfiles(loadedProfiles);

    const loadedGats = getStoredGats();
    setGats(loadedGats);

    const loadedRoles = getStoredRoles();
    setRoles(loadedRoles);

    const loadedTemplates = getStoredTemplates();
    setTemplates(loadedTemplates);

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (urlParams?.get('admin') === '1') {
      setIsAdminModalOpen(true);
    }

    if (urlParams?.get('demo') === '1') {
      const demoUser = loadedProfiles[0] || {
        id: 'usr-felipe',
        name: 'Felipe Gonçalves Vidal',
        role: 'Estudante',
        gatNumber: '04',
        gatName: 'Mangaba',
        createdAt: new Date().toISOString()
      };
      setActiveUser(demoUser);
      setActiveProfileId(demoUser.id);
      const acts = getActivitiesForMonth(demoUser.id, monthKey);
      setActivities(acts.length > 0 ? acts : [
        {
          id: 'act-1',
          date: '2026-08-05',
          start: '19:00',
          end: '21:00',
          description: 'Reunião do GAT 04 (Mangaba)',
          modality: 'Síncrona virtual',
          hours: 2
        },
        {
          id: 'act-2',
          date: '2026-08-12',
          start: '08:00',
          end: '12:00',
          description: 'Ação territorial na USF',
          modality: 'Síncrona presencial',
          hours: 4
        },
        {
          id: 'act-3',
          date: '2026-08-18',
          start: '14:00',
          end: '16:00',
          description: 'Estudo do Guia de Bolso MS',
          modality: 'Assíncrona virtual',
          hours: 2
        }
      ]);
      return;
    }

    const active = getActiveProfile();
    if (active) {
      setActiveUser(active);
      const acts = getActivitiesForMonth(active.id, monthKey);
      setActivities(acts);
    } else {
      setActiveUser(null);
    }
  }, [monthKey]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectProfile = (user: UserProfile) => {
    setActiveUser(user);
    setActiveProfileId(user.id);
    const acts = getActivitiesForMonth(user.id, monthKey);
    setActivities(acts);
    setEditingActivity(null);
    setHasChanges(false);
  };

  const handleSaveProfile = (updated: UserProfile) => {
    const updatedProfiles = profiles.map((p) => (p.id === updated.id ? updated : p));
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
    setActiveUser(updated);
    showToast('Identificação atualizada.');
  };

  const handleCreateNewProfile = async (name: string, gatNumber: string, role: UserRole) => {
    const res = registerProfile({ name, role, gatNumber });
    if (!res.success) {
      await alert({
        title: 'Cadastro Não Realizado',
        message: res.error || 'Erro ao cadastrar participante.',
        variant: 'warning'
      });
      return;
    }

    const updated = getStoredProfiles();
    setProfiles(updated);
    if (res.user) {
      handleSelectProfile(res.user);
      showToast(`Participante cadastrado: ${name}`);
    }
  };

  // Manipulação de Atividades (Salvar / Editar / Excluir)
  const handleSaveActivity = (data: Omit<Activity, 'id' | 'hours'>, editingId?: string) => {
    if (!activeUser) return;

    const hours = calcPetHours(data.start, data.end);
    let updatedActivities: Activity[];

    if (editingId) {
      updatedActivities = activities.map((act) =>
        act.id === editingId ? { ...data, id: editingId, hours } : act
      );
      setEditingActivity(null);
      showToast('Atividade atualizada.');
    } else {
      const newActivity: Activity = {
        ...data,
        id: `act-${Date.now().toString(36)}`,
        hours
      };
      updatedActivities = [...activities, newActivity];
      showToast('Atividade adicionada.');
    }

    setActivities(updatedActivities);
    saveActivitiesForMonth(activeUser.id, monthKey, updatedActivities);
    setHasChanges(true);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!activeUser) return;
    const act = activities.find((a) => a.id === id);
    const confirmed = await confirm({
      title: 'Excluir Atividade?',
      message: act
        ? `Deseja realmente remover o registro "${act.description}" de ${formatDateBR(act.date)} (${act.hours}h)?`
        : 'Deseja realmente remover esta atividade da sua folha mensal?',
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      variant: 'danger'
    });
    if (!confirmed) return;

    if (editingActivity?.id === id) {
      setEditingActivity(null);
    }
    const updated = activities.filter((act) => act.id !== id);
    setActivities(updated);
    saveActivitiesForMonth(activeUser.id, monthKey, updated);
    setHasChanges(true);
    showToast('Lançamento excluído.');
  };

  const handleLoadSamples = () => {
    if (!activeUser) return;
    const samples = loadSampleActivitiesForUser(activeUser.id, monthKey);
    setActivities(samples);
    setHasChanges(true);
    showToast(`Atividades de exemplo do GAT ${activeUser.gatNumber} carregadas.`);
  };

  const handleClearMonth = () => {
    if (!activeUser) return;
    clearActivitiesForMonth(activeUser.id, monthKey);
    setActivities([]);
    setEditingActivity(null);
    setHasChanges(true);
    showToast(`Folha de ${getMonthYearLabel(monthKey)} zerada.`);
  };

  const handlePrint = async (): Promise<boolean> => {
    window.print();
    return true;
  };

  // Exportar Backup Local em JSON
  const handleExportBackup = async (): Promise<boolean> => {
    if (!activeUser) return false;
    const jsonString = exportUserData(activeUser, monthKey);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = `backup-frequencia-${activeUser.name.toLowerCase().replace(/\s+/g, '-')}-${monthKey}.json`;

    // 1. Tenta API moderna showSaveFilePicker (Chromium/Edge) se suportada
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'Arquivo de Backup JSON',
              accept: { 'application/json': ['.json'] }
            }
          ]
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        setHasChanges(false);
        showToast('Backup da folha salvo com sucesso!');
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          showToast('Salvamento cancelado.');
          return false;
        }
        console.warn('showSaveFilePicker falhou, tentando fallback:', err);
      }
    }

    // 2. Download direto padrão (Brave, Firefox, Safari, Mobile)
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Download do backup iniciado.');
      return true;
    } catch {
      return false;
    }
  };

  // Importar Backup Local em JSON
  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      const result = importUserData(content);
      if (result.success && result.user && result.activities) {
        setProfiles(getStoredProfiles());
        setActiveUser(result.user);
        if (result.monthKey) setMonthKey(result.monthKey);
        setActivities(result.activities);
        showToast('Backup da folha restaurado com sucesso!');
      } else {
        await alert({
          title: 'Erro no Arquivo',
          message: result.error || 'Erro ao carregar arquivo de backup.',
          variant: 'warning'
        });
      }
    };
    reader.readAsText(file);
  };

  // Se não houver participante ativo, exibir Landing Page informativa e privada
  if (!activeUser) {
    return (
      <>
        <LandingPage
          onLoginWithJson={handleImportBackup}
          onCreateProfile={handleCreateNewProfile}
          gats={gats}
          roles={roles}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        />

        {/* Modal de Gestão & Administração */}
        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          profiles={profiles}
          gats={gats}
          roles={roles}
          templates={templates}
          onProfilesChange={(updated) => {
            setProfiles(updated);
          }}
          onGatsChange={(updated) => setGats(updated)}
          onRolesChange={(updated) => setRoles(updated)}
          onTemplatesChange={(updated) => setTemplates(updated)}
          onSelectUser={(user) => {
            handleSelectProfile(user);
            setIsAdminModalOpen(false);
          }}
        />

        {/* Modal de Feedback & Avaliação */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />

        {/* Toast Notificação */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 px-3.5 py-2 rounded-lg border border-[#008D4C]/25 bg-slate-900 shadow-xl text-xs font-medium text-slate-200 z-50 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="size-3.5 text-[#10B981] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  const totalHours = activities.reduce((sum, act) => sum + act.hours, 0);
  const monthLabel = getMonthYearLabel(monthKey);

  return (
    <>
      <div className="screen-only">
        {/* Header Superior Fixo com Blur */}
        <Navbar
          user={activeUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          hasChanges={hasChanges}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenExitModal={() => setIsExitModalOpen(true)}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        />

        <main className="w-full max-w-full sm:max-w-6xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 transition-all text-slate-200 min-w-0 overflow-x-hidden">
          {/* Hero / Overview Banner */}
          <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                {activeTab === 'dashboard' ? 'Painel de Frequência' : 'Folha de Frequência Oficial'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {activeTab === 'dashboard'
                  ? `Controle de dedicação e presença • GAT ${activeUser.gatNumber} (${activeUser.gatName || gats[activeUser.gatNumber]?.name || 'PET'})`
                  : 'Documento impresso e assinado para validação mensal de bolsa (SGTES/MS)'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shadow-xs">
                <Calendar className="size-4 text-[#10B981]" />
                <span className="text-slate-400 font-medium">Mês:</span>
                <select
                  value={monthKey}
                  onChange={(e) => setMonthKey(e.target.value)}
                  className="font-bold text-slate-100 bg-transparent outline-none cursor-pointer text-sm sm:text-xs"
                >
                  <option value="2026-08" className="bg-slate-900 text-slate-200">Agosto/2026</option>
                  <option value="2026-09" className="bg-slate-900 text-slate-200">Setembro/2026</option>
                  <option value="2026-10" className="bg-slate-900 text-slate-200">Outubro/2026</option>
                  <option value="2026-11" className="bg-slate-900 text-slate-200">Novembro/2026</option>
                  <option value="2026-12" className="bg-slate-900 text-slate-200">Dezembro/2026</option>
                </select>
              </div>
            </div>
          </div>

          {/* ABA 1: PAINEL DE LANÇAMENTOS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <StatsGrid
                totalHours={totalHours}
                activitiesCount={activities.length}
                targetHours={32}
              />

              <ActivityForm
                onSave={handleSaveActivity}
                defaultGatNumber={activeUser.gatNumber}
                defaultGatName={activeUser.gatName || gats[activeUser.gatNumber]?.name}
                templates={templates}
              />

              <ActivityTable
                activities={activities}
                totalHours={totalHours}
                editingId={editingActivity ? editingActivity.id : null}
                onEdit={(act) => setEditingActivity(act)}
                onDelete={handleDeleteActivity}
                user={activeUser}
                monthLabel={monthLabel}
                onLoadSamples={handleLoadSamples}
                onClearMonth={handleClearMonth}
                onOpenExitModal={() => setIsExitModalOpen(true)}
              />
            </div>
          )}

          {/* ABA 2: FOLHA OFICIAL (PREVIEW A4 PAISAGEM) */}
          {activeTab === 'official' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 text-xs shadow-xs">
                {/* Seletor entre Minha Folha e Template Vazio */}
                <div className="flex p-0.5 rounded-xl bg-slate-950 border border-slate-800 font-medium">
                  <button
                    type="button"
                    onClick={() => setShowBlankTemplate(false)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      !showBlankTemplate
                        ? 'bg-slate-800 text-slate-100 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Minha Folha ({activeUser.name})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBlankTemplate(true)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      showBlankTemplate
                        ? 'bg-slate-800 text-slate-100 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Template em Branco / Vazio
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {showBlankTemplate && (
                    <a
                      href="/templates/PET%20-%20Folha%20de%20Frequ%C3%AAncia%20-%20Modelo%20Vazio.pdf"
                      download="PET - Folha de Frequência - Modelo Vazio.pdf"
                      className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer flex items-center gap-1.5 text-xs font-medium transition-all"
                      title="Baixar arquivo PDF original em branco"
                    >
                      <Download className="size-3.5" />
                      <span>Baixar PDF</span>
                    </a>
                  )}
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 rounded-xl font-semibold bg-[#008D4C] text-white hover:bg-[#10B981] cursor-pointer flex items-center gap-1.5 transition-all text-xs shadow-sm shadow-[#008D4C]/10"
                  >
                    <Printer className="size-3.5" />
                    <span>
                      {showBlankTemplate ? 'Imprimir / Gerar PDF' : 'Imprimir / PDF'}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer flex items-center gap-1 text-xs transition-colors"
                  >
                    <ArrowLeft className="size-3.5" />
                    Voltar
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 sm:hidden w-full text-center pt-1">
                  Dica: no celular, escolha a orientação <strong>Horizontal</strong> na janela de impressão do sistema.
                </p>
              </div>

              <div className="overflow-x-auto max-w-full p-2.5 sm:p-8 md:p-10 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex justify-start sm:justify-center shadow-inner">
                <div className="shadow-2xl rounded-xs ring-1 ring-slate-800/60 overflow-hidden">
                  <OfficialSheet
                    user={activeUser}
                    monthLabel={monthLabel}
                    activities={activities}
                    totalHours={totalHours}
                    isBlankTemplate={showBlankTemplate}
                  />
                </div>
              </div>
            </div>
          )}

        {/* Modal de Identificação do Participante */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={activeUser}
          allProfiles={profiles}
          gats={gats}
          roles={roles}
          onSaveProfile={handleSaveProfile}
        />

        {/* Modal Dedicado de Edição de Atividade */}
        <EditActivityModal
          isOpen={Boolean(editingActivity)}
          onClose={() => setEditingActivity(null)}
          activity={editingActivity}
          onSave={handleSaveActivity}
          defaultGatNumber={activeUser.gatNumber}
          defaultGatName={activeUser.gatName || gats[activeUser.gatNumber]?.name}
          templates={templates}
        />

        {/* Modal de Gestão & Administração */}
        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          profiles={profiles}
          gats={gats}
          roles={roles}
          templates={templates}
          onProfilesChange={(updated) => {
            setProfiles(updated);
            if (activeUser && !updated.some((p) => p.id === activeUser.id)) {
              if (updated.length > 0) handleSelectProfile(updated[0]);
            }
          }}
          onGatsChange={(updated) => setGats(updated)}
          onRolesChange={(updated) => setRoles(updated)}
          onTemplatesChange={(updated) => setTemplates(updated)}
          onSelectUser={(user) => handleSelectProfile(user)}
        />

        {/* Modal de Saída / Backup Obrigatório */}
        <ExitModal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          onConfirmExit={() => {
            setIsExitModalOpen(false);
            setActiveProfileId(null);
            setActiveUser(null);
            setActivities([]);
            setHasChanges(false);
            showToast('Sessão encerrada com sucesso.');
          }}
          onDownloadJson={handleExportBackup}
          onDownloadPdf={handlePrint}
          userName={activeUser.name}
          hasChanges={hasChanges}
        />

        {/* Modal de Feedback & Avaliação */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />

        {/* Toast Notificação Minimalista */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 px-3.5 py-2 rounded-lg border border-[#008D4C]/25 bg-slate-900 shadow-xl text-xs font-medium text-slate-200 z-50 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="size-3.5 text-[#10B981] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

      </main>

      {/* Footer com Créditos */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-400 mt-12">
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
          </a>{" "}
          • Licença MIT
        </p>
        <div className="mt-2.5 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="hover:text-[#00A3E0] underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <MessageSquareHeart className="size-3.5 text-[#00A3E0]" />
            <span>Avaliação do Sistema &amp; Relato de Bugs</span>
          </button>
        </div>
      </footer>
    </div>

      {/* ============================================================
           CONTAINER EXCLUSIVO DE IMPRESSÃO (@media print)
           ============================================================ */}
      <div className="print-only-wrapper">
        <OfficialSheet
          user={activeUser}
          monthLabel={monthLabel}
          activities={activities}
          totalHours={totalHours}
          isBlankTemplate={showBlankTemplate}
        />
      </div>
    </>
  );
}
