'use client';

import React from 'react';
import { Activity } from '@/types';
import { formatDateBR } from '@/lib/pet-calculator';
import { Edit2, Trash2 } from 'lucide-react';

interface ActivityTableProps {
  activities: Activity[];
  totalHours: number;
  editingId: string | null;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export function ActivityTable({ activities, totalHours, editingId, onEdit, onDelete }: ActivityTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              <th className="py-2.5 px-3.5 w-24">Data</th>
              <th className="py-2.5 px-3.5 w-20">Entrada</th>
              <th className="py-2.5 px-3.5 w-28">Saída (PET)</th>
              <th className="py-2.5 px-3.5">Descrição da Atividade</th>
              <th className="py-2.5 px-3.5 w-24 text-right">Horas</th>
              <th className="py-2.5 px-3.5 w-20 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-xs text-zinc-500">
                  Nenhuma atividade registrada neste mês.
                </td>
              </tr>
            ) : (
              activities.map((act) => {
                const isEditing = editingId === act.id;
                return (
                  <tr
                    key={act.id}
                    className={`transition-colors hover:bg-zinc-800/30 ${
                      isEditing ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3.5 font-medium text-zinc-300">
                      {formatDateBR(act.date)}
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-400">{act.start}</td>
                    <td className="py-2.5 px-3.5 text-zinc-400 font-mono text-[11px]">
                      {act.end} <span className="text-zinc-500">({act.hours}h)</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-zinc-200">
                      <span>{act.description}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-semibold text-emerald-400">
                      {act.hours}h
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(act)}
                          className="p-1 rounded text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 cursor-pointer transition-colors"
                          title="Editar atividade"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(act.id)}
                          className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 cursor-pointer transition-colors"
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
              <tr className="border-t border-zinc-800 bg-zinc-950/60 font-semibold text-xs">
                <td colSpan={4} className="py-2.5 px-3.5 text-right text-zinc-400">
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
