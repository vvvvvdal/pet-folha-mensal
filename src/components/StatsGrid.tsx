'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface StatsGridProps {
  totalHours: number;
  activitiesCount: number;
  targetHours?: number;
}

export function StatsGrid({ totalHours, activitiesCount, targetHours = 32 }: StatsGridProps) {
  const remaining = Math.max(0, targetHours - totalHours);
  const pct = Math.min(100, Math.round((totalHours / targetHours) * 100));
  const isGoalReached = remaining === 0;

  return (
    <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        {/* Left: Summary numbers */}
        <div className="flex items-center gap-4">
          <div>
            <span className="text-2xl font-bold text-zinc-100 tracking-tight">{totalHours}h</span>
            <span className="text-xs text-zinc-500 ml-1">/ {targetHours}h meta</span>
          </div>

          <div className="h-4 w-px bg-zinc-800" />

          <div className="text-xs text-zinc-400">
            {activitiesCount} {activitiesCount === 1 ? 'registro' : 'registros'}
          </div>
        </div>

        {/* Right: Status badge */}
        <div>
          {isGoalReached ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="size-3.5" />
              Meta de 32h cumprida
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              <Clock className="size-3" />
              Faltam {remaining}h para meta mensal
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
