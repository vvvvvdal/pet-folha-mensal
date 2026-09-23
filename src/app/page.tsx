'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile, Activity, GATS } from '@/types';
import {
  getStoredProfiles,
  getActiveProfile,
  setActiveProfileId,
  getActivitiesForMonth,
  saveActivitiesForMonth
} from '@/lib/storage';
import { calcPetHours, getMonthYearLabel } from '@/lib/pet-calculator';
import { Navbar } from '@/components/Navbar';
import { ProfileSelector } from '@/components/ProfileSelector';
import { StatsGrid } from '@/components/StatsGrid';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityTable } from '@/components/ActivityTable';
import { AlertBanner } from '@/components/AlertBanner';
import { OfficialSheet } from '@/components/OfficialSheet';
import { Calendar, Download, Printer, CheckCircle2, ArrowLeft, Info } from 'lucide-react';

export default function Home() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [monthKey, setMonthKey] = useState('2026-09');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'official'>('dashboard');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inicialização no cliente
  useEffect(() => {
    const loadedProfiles = getStoredProfiles();
    setProfiles(loadedProfiles);

    const active = getActiveProfile();
    if (active) {
      setActiveUser(active);
      const acts = getActivitiesForMonth(active.id, monthKey);
      setActivities(acts);
    }
  }, [monthKey]);

  // Atualiza atividades quando muda o usuário
  const handleSelectProfile = (user: UserProfile) => {
    setActiveUser(user);
    setActiveProfileId(user.id);
    const acts = getActivitiesForMonth(user.id, monthKey);
    setActivities(acts);
    setEditingActivity(null);
    setHasChanges(false);
  };

  const handleLogout = () => {
    setActiveUser(null);
    setActiveProfileId(null);
    setEditingActivity(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const totalHours = activities.reduce((sum, act) => sum + act.hours, 0);
  const monthLabel = getMonthYearLabel(monthKey);

  // Manipulação de Atividades (Salvar / Editar / Excluir)
  const handleSaveActivity = (data: Omit<Activity, 'id' | 'hours'>, editingId?: string) => {
    if (!activeUser) return;

    const hours = calcPetHours(data.start, data.end);
    let updatedActivities: Activity[];

    if (editingId) {
      // Edição
      updatedActivities = activities.map((act) =>
        act.id === editingId ? { ...data, id: editingId, hours } : act
      );
      setEditingActivity(null);
      showToast('Atividade atualizada com sucesso! Lembre-se de salvar/imprimir o PDF atualizado.');
    } else {
      // Adição
      const newActivity: Activity = {
        ...data,
        id: `act-${Date.now()}`,
        hours
      };
      updatedActivities = [...activities, newActivity];
      showToast('Atividade adicionada com sucesso! Lembre-se de salvar/imprimir o PDF atualizado.');
    }

    setActivities(updatedActivities);
    saveActivitiesForMonth(activeUser.id, monthKey, updatedActivities);
    setHasChanges(true);
  };

  const handleDeleteActivity = (id: string) => {
    if (!activeUser) return;
    if (confirm('Deseja realmente remover esta atividade?')) {
      if (editingActivity?.id === id) {
        setEditingActivity(null);
      }
      const updated = activities.filter((act) => act.id !== id);
      setActivities(updated);
      saveActivitiesForMonth(activeUser.id, monthKey, updated);
      setHasChanges(true);
      showToast('Atividade removida. Lembre-se de salvar/imprimir o PDF atualizado.');
    }
  };

  const handlePrint = () => {
    setHasChanges(false);
    window.print();
  };

  if (!activeUser) {
    return (
      <ProfileSelector
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onRefreshProfiles={() => setProfiles(getStoredProfiles())}
      />
    );
  }

  return (
    <>
      {/* ============================================================
           INTERFACE PRINCIPAL DE TELA (.screen-only)
           ============================================================ */}
      <main className="min-h-screen p-4 sm:p-6 lg:p-8 screen-only transition-all" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <div className="max-w-5xl mx-auto">
          {/* Barra de Navegação Superior */}
          <Navbar
            user={activeUser}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            onPrint={handlePrint}
          />

          {/* Seletor de Mês e Aviso de Atualização */}
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: 'var(--accent-sage)' }} />
              <label htmlFor="month-select" className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Mês de Referência:
              </label>
              <select
                id="month-select"
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-heading)'
                }}
              >
                <option value="2026-08">Agosto/2026</option>
                <option value="2026-09">Setembro/2026</option>
                <option value="2026-10">Outubro/2026</option>
                <option value="2026-11">Novembro/2026</option>
                <option value="2026-12">Dezembro/2026</option>
              </select>
            </div>

            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Total no Mês: <strong style={{ color: 'var(--accent-sage)' }}>{totalHours} horas</strong>
            </div>
          </div>

          {/* Banner de Alerta para Baixar PDF quando houver alterações */}
          <AlertBanner visible={hasChanges} onPrint={handlePrint} />

          {/* ABA 1: PAINEL DE LANÇAMENTOS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Indicadores de Carga Horária */}
              <StatsGrid
                totalHours={totalHours}
                activitiesCount={activities.length}
                targetHours={32}
              />

              {/* Formulário de Adicionar / Editar Atividade */}
              <ActivityForm
                onSave={handleSaveActivity}
                editingActivity={editingActivity}
                onCancelEdit={() => setEditingActivity(null)}
                defaultGatNumber={activeUser.gatNumber}
                defaultGatName={activeUser.gatName || GATS[activeUser.gatNumber]?.name}
              />

              {/* Tabela Interativa */}
              <ActivityTable
                activities={activities}
                totalHours={totalHours}
                editingId={editingActivity ? editingActivity.id : null}
                onEdit={(act) => setEditingActivity(act)}
                onDelete={handleDeleteActivity}
              />

              {/* Barra de Ações Inferiores */}
              <div
                className="p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-3"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)'
                }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-sm hover:brightness-105"
                    style={{
                      backgroundColor: 'var(--accent-sage)',
                      color: '#0d2818'
                    }}
                  >
                    <Printer className="w-4 h-4" />
                    Salvar / Imprimir PDF Oficial (Paisagem)
                  </button>
                  <a
                    href="/templates/PET - Folha de Frequência Mensal - Setembro 2026.pdf"
                    download
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all hover:bg-[var(--bg-elevated)]"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-heading)'
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Template Original
                  </a>
                </div>

                <div className="text-xs text-center sm:text-right" style={{ color: 'var(--text-muted)' }}>
                  Padrão Ministério da Saúde (A4 Paisagem)
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: FOLHA OFICIAL (PRÉ-VISUALIZAÇÃO A4 PAISAGEM) */}
          {activeTab === 'official' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>
                    Folha Oficial Formatada (Padrão Imagem 3)
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Exibição da folha em A4 Paisagem com cabeçalho oficial do Ministério da Saúde e logos.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm hover:brightness-105"
                    style={{
                      backgroundColor: 'var(--accent-sage)',
                      color: '#0d2818'
                    }}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir / Salvar PDF
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="px-3 py-2 rounded-lg text-xs font-semibold border hover:bg-[var(--bg-elevated)] cursor-pointer flex items-center gap-1"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-heading)'
                    }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar ao Painel
                  </button>
                </div>
              </div>

              {/* Moldura de Papel A4 */}
              <div className="bg-gray-600 dark:bg-zinc-800 p-4 sm:p-6 rounded-xl overflow-x-auto flex justify-center shadow-inner">
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

        {/* Toast Notificação */}
        {toastMessage && (
          <div
            className="fixed bottom-6 right-6 px-4 py-3 rounded-xl border shadow-xl text-xs sm:text-sm font-medium animate-fade-in z-50 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--accent-sage-border)',
              color: 'var(--text-heading)'
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-sage)] flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>

      {/* ============================================================
           CONTAINER EXCLUSIVO DE IMPRESSÃO (@media print)
           100% IDÊNTICO À IMAGEM 3 EM A4 PAISAGEM
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
