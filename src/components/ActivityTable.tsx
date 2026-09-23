'use client';

import React from 'react';
import { Activity, UserProfile } from '@/types';
import { formatDateBR } from '@/lib/pet-calculator';
import { Edit2, Trash2, Sparkles, RotateCcw, Calendar, Clock, ListChecks } from 'lucide-react';

interface ActivityTableProps {
  activities: Activity[];
  totalHours: number;
  editingId: string | null;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  user: UserProfile;
  monthLabel: string;
  onLoadSamples: () => void;
  onClearMonth: () => void;
}

export function ActivityTable({
  activities,
  totalHours,
  editingId,
  onEdit,
  onDelete,
  user,
  monthLabel,
  onLoadSamples,
  onClearMonth
}: ActivityTableProps) {
  const getModalityBadge = (modality: string) => {
    switch (modality) {
      case 'Síncrona presencial':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 whitespace-nowrap">
            Presencial
          </span>
        );
      case 'Assíncrona virtual':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
            Assíncrona
          </span>
        );
      case 'Síncrona virtual':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            Síncrona
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-xs mb-6">
      {/* Table Header Bar */}
      <div className="p-4 sm:px-6 py-3.5 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <ListChecks className="size-4 text-emerald-400" />
          <h3 className="text-xs sm:text-sm font-semibold text-slate-200">
            Lançamentos de {monthLabel}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
            {activities.length}
          </span>
        </div>

        {activities.length > 0 && (
          <button
            type="button"
            onClick={onClearMonth}
            className="text-[11px] text-slate-400 hover:text-red-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
            title="Exclui todas as atividades deste mês para começar do zero"
          >
            <RotateCcw className="size-3" />
            <span className="hidden sm:inline">Zerar mês</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-28">Data</th>
              <th className="py-3 px-4 w-32">Horário</th>
              <th className="py-3 px-4 w-24">Tipo</th>
              <th className="py-3 px-4">Descrição da Atividade</th>
              <th className="py-3 px-4 w-24 text-right">Horas</th>
              <th className="py-3 px-4 w-20 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 px-4 text-center">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                      <Clock className="size-5" />
                    </div>
                    <div className="text-sm font-semibold text-slate-200">
                      Nenhuma atividade registrada em {monthLabel}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sua folha deste mês está com 0 horas. Utilize o formulário acima para registrar seus encontros ou carregue o modelo de atividades padrão do seu GAT.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onLoadSamples}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold cursor-pointer transition-all shadow-xs"
                      >
                        <Sparkles className="size-3.5 text-emerald-400" />
                        <span>Carregar Atividades Padrão (GAT {user.gatNumber})</span>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              activities.map((act) => {
                const isEditing = editingId === act.id;
                return (
                  <tr
                    key={act.id}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      isEditing ? 'bg-emerald-950/25' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3 text-slate-500" />
                        <span>{formatDateBR(act.date)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      <span>{act.start}</span>
                      <span className="text-slate-500 mx-1">→</span>
                      <span>{act.end}</span>
                    </td>
                    <td className="py-3 px-4">
                      {getModalityBadge(act.modality)}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-normal">
                      <span>{act.description}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400 whitespace-nowrap">
                      {act.hours}h
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(act)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 cursor-pointer transition-colors"
                          title="Editar atividade"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(act.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
                          title="Excluir atividade"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {activities.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-800 bg-slate-950/60 font-semibold text-xs">
                <td colSpan={4} className="py-3 px-4 text-right text-slate-400 uppercase tracking-wider text-[11px]">
                  Total do Mês ({monthLabel}):
                </td>
                <td className="py-3 px-4 text-right text-emerald-400 font-extrabold text-sm">
                  {totalHours}h
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
