'use client';

import React from 'react';

interface StatsGridProps {
  totalHours: number;
  activitiesCount: number;
  targetHours?: number;
}

export function StatsGrid({ totalHours, activitiesCount, targetHours = 32 }: StatsGridProps) {
  const remaining = Math.max(0, targetHours - totalHours);
  const pct = Math.min(100, Math.round((totalHours / targetHours) * 100));

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Realizado */}
        <div
          className="p-4 rounded-xl border transition-all"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
            Total Realizado
          </div>
          <div className="text-3xl font-extrabold flex items-baseline gap-1" style={{ color: 'var(--text-heading)' }}>
            {totalHours} <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>horas</span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {activitiesCount} {activitiesCount === 1 ? 'atividade registrada' : 'atividades registradas'}
          </div>
        </div>

        {/* Card 2: Meta do Mês */}
        <div
          className="p-4 rounded-xl border transition-all"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
            Meta do Mês (4 semanas)
          </div>
          <div className="text-3xl font-extrabold flex items-baseline gap-1" style={{ color: 'var(--text-heading)' }}>
            {targetHours} <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>horas</span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            8 horas semanais obrigatórias
          </div>
        </div>

        {/* Card 3: Saldo Restante */}
        <div
          className="p-4 rounded-xl border transition-all"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
            Saldo Restante
          </div>
          <div className="text-3xl font-extrabold flex items-baseline gap-1" style={{ color: remaining === 0 ? 'var(--accent-sage)' : 'var(--accent-sky)' }}>
            {remaining} <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>horas</span>
          </div>
          <div className="text-xs mt-1" style={{ color: remaining === 0 ? 'var(--accent-sage)' : 'var(--text-muted)' }}>
            {remaining === 0 ? '✅ Meta mensal atingida!' : `Faltam ${remaining}h para cumprir a meta`}
          </div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div
        className="p-4 rounded-xl border"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="flex justify-between text-xs font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>
          <span>Progresso Mensal da Carga Horária</span>
          <span>{pct}%</span>
        </div>
        <div
          className="w-full h-2.5 rounded-full overflow-hidden border"
          style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--accent-sky), var(--accent-sage))'
            }}
          />
        </div>
      </div>
    </div>
  );
}
