'use client';

import React from 'react';
import { CheckCircle2, Clock, CalendarCheck, TrendingUp, Target } from 'lucide-react';

interface StatsGridProps {
  totalHours: number;
  activitiesCount: number;
  targetHours?: number;
}

export function StatsGrid({ totalHours, activitiesCount, targetHours = 32 }: StatsGridProps) {
  const remaining = Math.max(0, targetHours - totalHours);
  const pct = Math.min(100, Math.round((totalHours / targetHours) * 100));
  const isGoalReached = remaining === 0;
  const weeklyAvg = activitiesCount > 0 ? (totalHours / 4).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
      {/* Card 1: Horas Computadas & Progresso */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Horas Apuradas
          </span>
          <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,141,76,0.12)', color: '#10B981' }}>
            <Target className="size-4" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {totalHours}h
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {targetHours}h meta</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500`}
              style={{ backgroundColor: '#10B981', width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{pct}% concluído</span>
            <span>{isGoalReached ? 'Meta alcançada' : `Faltam ${remaining}h`}</span>
          </div>
        </div>
      </div>

      {/* Card 2: Ritmo Semanal */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Média Semanal
          </span>
          <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,163,224,0.12)', color: '#00A3E0' }}>
            <TrendingUp className="size-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {weeklyAvg}h
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 8h obrigatórias</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Dedicação regulamentar do edital: 8h por semana.
          </p>
        </div>
      </div>

      {/* Card 3: Status de Validação */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status da Frequência
          </span>
          <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(249,189,71,0.12)', color: '#F9BD47' }}>
            <CalendarCheck className="size-4" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            {isGoalReached ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(0,141,76,0.15)', color: '#10B981', border: '1px solid rgba(0,141,76,0.25)' }}>
                <CheckCircle2 className="size-3.5" />
                Apta para Envio
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                <Clock className="size-3.5" />
                Em Preenchimento
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {activitiesCount} {activitiesCount === 1 ? 'atividade registrada' : 'atividades registradas'}.
          </p>
        </div>
      </div>
    </div>
  );
}
