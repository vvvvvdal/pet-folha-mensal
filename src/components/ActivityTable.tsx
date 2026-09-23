'use client';

import React from 'react';
import { Activity, UserProfile } from '@/types';
import { formatDateBR } from '@/lib/pet-calculator';
import { Edit2, Trash2, Sparkles, RotateCcw } from 'lucide-react';

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
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3.5 w-24">Data</th>
              <th className="py-2.5 px-3.5 w-20">Entrada</th>
              <th className="py-2.5 px-3.5 w-28">Saída (PET)</th>
              <th className="py-2.5 px-3.5">Descrição da Atividade</th>
              <th className="py-2.5 px-3.5 w-24 text-right">Horas</th>
              <th className="py-2.5 px-3.5 w-24 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-4 text-center">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="text-sm font-medium text-slate-300">
                      Nenhuma atividade registrada para {user.name} em {monthLabel}.
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sua folha deste mês está zerada (0 horas). Lance suas atividades no formulário acima ou, se preferir, carregue o modelo de atividades padrão do seu GAT.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onLoadSamples}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium cursor-pointer transition-all shadow-xs"
                      >
                        <Sparkles className="size-3.5 text-emerald-400" />
                        <span>Carregar Atividades de Exemplo (GAT {user.gatNumber})</span>
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
                    className={`transition-colors hover:bg-slate-800/30 ${
                      isEditing ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3.5 font-medium text-slate-300">
                      {formatDateBR(act.date)}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-400">{act.start}</td>
                    <td className="py-2.5 px-3.5 text-slate-400 font-mono text-[11px]">
                      {act.end} <span className="text-slate-500">({act.hours}h)</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-200">
                      <span>{act.description}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-semibold text-emerald-400">
                      {act.hours}h
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(act)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 cursor-pointer transition-colors"
                          title="Editar atividade"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(act.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
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
                <td colSpan={3} className="py-2.5 px-3.5 text-left">
                  <button
                    type="button"
                    onClick={onClearMonth}
                    className="text-[11px] text-slate-500 hover:text-red-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    title="Exclui todas as atividades deste mês para começar do zero"
                  >
                    <RotateCcw className="size-3" />
                    <span>Zerar folha deste mês</span>
                  </button>
                </td>
                <td className="py-2.5 px-3.5 text-right text-slate-400 uppercase tracking-wider text-[11px]">
                  TOTAL DO MÊS:
                </td>
                <td className="py-2.5 px-3.5 text-right text-emerald-400 font-bold">
                  {totalHours} horas
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
