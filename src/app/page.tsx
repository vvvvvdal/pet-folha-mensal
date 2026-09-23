'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, Activity, UserRole, GATS } from '@/types';
import {
  getStoredProfiles,
  saveProfiles,
  getActiveProfile,
  setActiveProfileId,
  getActivitiesForMonth,
  saveActivitiesForMonth,
  exportUserData,
  importUserData
} from '@/lib/storage';
import { calcPetHours, getMonthYearLabel } from '@/lib/pet-calculator';
import { Navbar } from '@/components/Navbar';
import { ProfileModal } from '@/components/ProfileModal';
import { StatsGrid } from '@/components/StatsGrid';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityTable } from '@/components/ActivityTable';
import { OfficialSheet } from '@/components/OfficialSheet';
import { Calendar, Download, Printer, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Home() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [monthKey, setMonthKey] = useState('2026-09');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'official'>('dashboard');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inicialização Local-First: carrega direto no painel
  useEffect(() => {
    const loadedProfiles = getStoredProfiles();
    setProfiles(loadedProfiles);

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
    const gatInfo = GATS[gatNumber];
    const newProfile: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name,
      gatNumber,
      gatName: gatInfo?.name || `GAT ${gatNumber}`,
      role,
      createdAt: new Date().toISOString()
    };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
    handleSelectProfile(newProfile);
    showToast(`Participante cadastrado: ${name}`);
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

  const handlePrint = () => {
    setHasChanges(false);
    window.print();
  };

  // Exportar Backup Local em JSON (Zero Custos, Zero LGPD)
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
    showToast('Backup JSON exportado com sucesso.');
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
        showToast('Backup importado com sucesso!');
      } else {
        alert(result.error || 'Erro ao importar arquivo.');
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
      <main className="min-h-screen p-4 sm:p-6 lg:p-8 screen-only transition-all bg-zinc-950 text-zinc-200">
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
          />

          {/* Subheader: Mês e Total */}
          <div className="flex items-center justify-between gap-3 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-zinc-400" />
              <span className="text-zinc-400 font-medium">Mês:</span>
              <select
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
                className="px-2 py-1 text-xs font-semibold rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 outline-none cursor-pointer focus:border-emerald-500"
              >
                <option value="2026-08">Agosto/2026</option>
                <option value="2026-09">Setembro/2026</option>
                <option value="2026-10">Outubro/2026</option>
                <option value="2026-11">Novembro/2026</option>
                <option value="2026-12">Dezembro/2026</option>
              </select>
            </div>

            <div className="text-zinc-400">
              Total apurado: <strong className="text-emerald-400">{totalHours} horas</strong>
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
                defaultGatName={activeUser.gatName || GATS[activeUser.gatNumber]?.name}
              />

              <ActivityTable
                activities={activities}
                totalHours={totalHours}
                editingId={editingActivity ? editingActivity.id : null}
                onEdit={(act) => setEditingActivity(act)}
                onDelete={handleDeleteActivity}
              />
            </div>
          )}

          {/* ABA 2: FOLHA OFICIAL (PREVIEW A4 PAISAGEM) */}
          {activeTab === 'official' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs">
                <span className="text-zinc-400">
                  Pré-visualização do modelo oficial em A4 Paisagem (Ministério da Saúde).
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="size-3.5" />
                    Imprimir / Gerar PDF
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-300 cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft className="size-3.5" />
                    Voltar
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto p-4 md:p-8 bg-zinc-900/60 rounded-xl border border-zinc-800 flex justify-center">
                <OfficialSheet
                  user={activeUser}
                  monthLabel={monthLabel}
                  activities={activities}
                  totalHours={totalHours}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Minimalista de Identificação / Troca de GAT */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={activeUser}
          allProfiles={profiles}
          onSaveProfile={handleSaveProfile}
          onSwitchProfile={handleSelectProfile}
          onCreateNew={handleCreateNewProfile}
        />

        {/* Toast Notificação Minimalista */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 px-3.5 py-2 rounded-lg border border-emerald-500/20 bg-zinc-900 shadow-xl text-xs font-medium text-zinc-200 z-50 flex items-center gap-2 animate-fade-in">
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
        />
      </div>
    </>
  );
}
