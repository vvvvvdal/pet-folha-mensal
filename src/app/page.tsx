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
import { calcPetHours, getMonthYearLabel } from '@/lib/pet-calculator';
import { Navbar } from '@/components/Navbar';
import { ProfileModal } from '@/components/ProfileModal';
import { AdminModal } from '@/components/AdminModal';
import { StatsGrid } from '@/components/StatsGrid';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityTable } from '@/components/ActivityTable';
import { OfficialSheet } from '@/components/OfficialSheet';
import { Calendar, Download, Printer, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
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

    const active = getActiveProfile() || loadedProfiles[0];
    if (active) {
      setActiveUser(active);
      const acts = getActivitiesForMonth(active.id, monthKey);
      setActivities(acts);
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

  const handleCreateNewProfile = (name: string, gatNumber: string, role: UserRole) => {
    const res = registerProfile({ name, role, gatNumber });
    if (!res.success) {
      alert(res.error || 'Erro ao cadastrar participante.');
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

  const handleDeleteActivity = (id: string) => {
    if (!activeUser) return;
    if (confirm('Deseja excluir este lançamento?')) {
      if (editingActivity?.id === id) {
        setEditingActivity(null);
      }
      const updated = activities.filter((act) => act.id !== id);
      setActivities(updated);
      saveActivitiesForMonth(activeUser.id, monthKey, updated);
      setHasChanges(true);
      showToast('Lançamento excluído.');
    }
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
    if (
      confirm(
        `Deseja realmente apagar todos os lançamentos de ${getMonthYearLabel(
          monthKey
        )} para recomeçar a folha do zero?`
      )
    ) {
      clearActivitiesForMonth(activeUser.id, monthKey);
      setActivities([]);
      setEditingActivity(null);
      setHasChanges(true);
      showToast(`Folha de ${getMonthYearLabel(monthKey)} zerada.`);
    }
  };

  const handlePrint = () => {
    setHasChanges(false);
    window.print();
  };

  // Exportar Backup Local em JSON
  const handleExportBackup = () => {
    if (!activeUser) return;
    const jsonString = exportUserData(activeUser, monthKey);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-frequencia-${activeUser.name.toLowerCase().replace(/\s+/g, '-')}-${monthKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup da folha exportado com sucesso.');
  };

  // Importar Backup Local em JSON
  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
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
        alert(result.error || 'Erro ao carregar arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  if (!activeUser) {
    return null;
  }

  const totalHours = activities.reduce((sum, act) => sum + act.hours, 0);
  const monthLabel = getMonthYearLabel(monthKey);

  return (
    <>
      <main className="min-h-screen p-4 sm:p-6 lg:p-8 screen-only transition-all bg-[var(--bg-canvas)] text-slate-200">
        <div className="max-w-5xl mx-auto">
          {/* Header Minimalista */}
          <Navbar
            user={activeUser}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onPrint={handlePrint}
            hasChanges={hasChanges}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onOpenAdmin={() => setIsAdminModalOpen(true)}
          />

          {/* Subheader: Mês e Total */}
          <div className="flex items-center justify-between gap-3 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Mês:</span>
              <select
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
                className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-900 border border-slate-800 text-slate-200 outline-none cursor-pointer focus:border-emerald-500"
              >
                <option value="2026-08">Agosto/2026</option>
                <option value="2026-09">Setembro/2026</option>
                <option value="2026-10">Outubro/2026</option>
                <option value="2026-11">Novembro/2026</option>
                <option value="2026-12">Dezembro/2026</option>
              </select>
            </div>

            <div className="text-slate-400">
              Total apurado: <strong className="text-emerald-400 font-bold">{totalHours} horas</strong>
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
                editingActivity={editingActivity}
                onCancelEdit={() => setEditingActivity(null)}
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
              />
            </div>
          )}

          {/* ABA 2: FOLHA OFICIAL (PREVIEW A4 PAISAGEM) */}
          {activeTab === 'official' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
                {/* Seletor entre Minha Folha e Template Vazio */}
                <div className="flex p-0.5 rounded-lg bg-slate-950 border border-slate-800 font-medium">
                  <button
                    type="button"
                    onClick={() => setShowBlankTemplate(false)}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
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
                      className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer flex items-center gap-1.5 text-xs font-medium transition-all"
                      title="Baixar arquivo PDF original em branco"
                    >
                      <Download className="size-3.5" />
                      <span>Baixar PDF</span>
                    </a>
                  )}
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 rounded-lg font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer flex items-center gap-1.5 transition-all text-xs"
                  >
                    <Printer className="size-3.5" />
                    <span>
                      {showBlankTemplate ? 'Imprimir / Gerar PDF' : 'Imprimir / PDF'}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <ArrowLeft className="size-3.5" />
                    Voltar
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto p-4 md:p-8 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-center">
                <OfficialSheet
                  user={activeUser}
                  monthLabel={monthLabel}
                  activities={activities}
                  totalHours={totalHours}
                  isBlankTemplate={showBlankTemplate}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal de Identificação / Troca de GAT */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={activeUser}
          allProfiles={profiles}
          gats={gats}
          roles={roles}
          onSaveProfile={handleSaveProfile}
          onSwitchProfile={handleSelectProfile}
          onCreateNew={handleCreateNewProfile}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />

        {/* Modal de Gestão & Administração (PIN 4031) */}
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

        {/* Toast Notificação Minimalista */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 px-3.5 py-2 rounded-lg border border-emerald-500/25 bg-slate-900 shadow-xl text-xs font-medium text-slate-200 z-50 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>

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
