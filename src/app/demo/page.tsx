'use client';

import React, { useState } from 'react';
import { UserProfile, Activity, GATS, DEFAULT_ROLES } from '@/types';
import { DEFAULT_PROFILES, DEFAULT_TEMPLATES, loadSampleActivitiesForUser } from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { StatsGrid } from '@/components/StatsGrid';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityTable } from '@/components/ActivityTable';
import { OfficialSheet } from '@/components/OfficialSheet';
import { AdminModal } from '@/components/AdminModal';
import { ExitModal } from '@/components/ExitModal';
import { getMonthYearLabel } from '@/lib/pet-calculator';

export default function DemoPage() {
  const [user, setUser] = useState<UserProfile>(DEFAULT_PROFILES[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'official'>('dashboard');
  const [activities, setActivities] = useState<Activity[]>(() =>
    loadSampleActivitiesForUser(DEFAULT_PROFILES[0].id, '04')
  );
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('admin') === '1';
    }
    return false;
  });
  const [isExitOpen, setIsExitOpen] = useState(false);
  const [monthKey, setMonthKey] = useState('2026-09');

  const totalHours = activities.reduce((acc, curr) => acc + curr.hours, 0);
  const monthLabel = getMonthYearLabel(monthKey);

  const handleSaveActivity = (data: Omit<Activity, 'id' | 'hours'>, editingId?: string) => {
    // Demo save
    if (editingId) {
      setActivities(prev =>
        prev.map(a => (a.id === editingId ? { ...a, ...data, hours: 2 } : a))
      );
      setEditingActivity(null);
    } else {
      const newAct: Activity = {
        ...data,
        id: `act-${Date.now()}`,
        hours: 2
      };
      setActivities(prev => [newAct, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-100 flex flex-col justify-between selection:bg-[#008D4C] selection:text-white transition-colors">
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenProfileModal={() => {}}
        onPrint={() => window.print()}
        hasChanges={false}
        onExportBackup={() => {}}
        onImportBackup={() => {}}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenExitModal={() => setIsExitOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {activeTab === 'dashboard' ? (
          <>
            <StatsGrid totalHours={totalHours} activitiesCount={activities.length} targetHours={32} />

            <ActivityForm
              onSave={handleSaveActivity}
              editingActivity={editingActivity}
              onCancelEdit={() => setEditingActivity(null)}
              defaultGatNumber={user.gatNumber}
              defaultGatName={user.gatName}
              templates={DEFAULT_TEMPLATES}
            />

            <ActivityTable
              activities={activities}
              totalHours={totalHours}
              editingId={editingActivity ? editingActivity.id : null}
              onEdit={act => setEditingActivity(act)}
              onDelete={id => setActivities(prev => prev.filter(a => a.id !== id))}
              user={user}
              monthLabel={monthLabel}
              onLoadSamples={() => setActivities(loadSampleActivitiesForUser(user.id, user.gatNumber))}
              onClearMonth={() => setActivities([])}
            />
          </>
        ) : (
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <OfficialSheet
              user={user}
              monthLabel={monthLabel}
              activities={activities}
              totalHours={totalHours}
            />
          </div>
        )}

        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          profiles={DEFAULT_PROFILES}
          gats={GATS}
          roles={DEFAULT_ROLES}
          templates={DEFAULT_TEMPLATES}
          onProfilesChange={() => {}}
          onGatsChange={() => {}}
          onRolesChange={() => {}}
          onTemplatesChange={() => {}}
          onSelectUser={() => {}}
        />

        <ExitModal
          isOpen={isExitOpen}
          onClose={() => setIsExitOpen(false)}
          onConfirmExit={() => setIsExitOpen(false)}
          onDownloadJson={() => {}}
          onDownloadPdf={() => {}}
          userName={user.name}
          hasChanges={false}
        />
      </main>

      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-400 mt-12">
        <p>
          Desenvolvido por{' '}
          <strong className="text-slate-200 font-semibold">Felipe Gonçalves Vidal</strong> &amp;{' '}
          <strong className="text-slate-200 font-semibold">Robert Francisco Taveira</strong> • Licença MIT
        </p>
      </footer>
    </div>
  );
}
