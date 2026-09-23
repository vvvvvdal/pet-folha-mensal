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
    <div
      className="rounded-xl border overflow-hidden mb-6 transition-all"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div
        className="p-4 border-b flex justify-between items-center flex-wrap gap-2"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <h2 className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>
          Registro de Atividades do Mês
        </h2>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Sincronizado automaticamente no dispositivo
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr
              className="border-b text-xs uppercase tracking-wider font-semibold"
              style={{
                backgroundColor: 'var(--table-header-bg)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-muted)'
              }}
            >
              <th className="p-3 w-[110px]">Data</th>
              <th className="p-3 w-[100px]">Chegada</th>
              <th className="p-3 w-[140px]">Saída (Formatada)</th>
              <th className="p-3">Atividade</th>
              <th className="p-3 w-[100px] text-right">Horas PET</th>
              <th className="p-3 w-[90px] text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  Nenhuma atividade registrada para este mês. Utilize o formulário acima para adicionar.
                </td>
              </tr>
            ) : (
              activities.map((act) => {
                const isEditing = editingId === act.id;
                return (
                  <tr
                    key={act.id}
                    className="border-b transition-colors hover:bg-[var(--table-hover)]"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: isEditing ? 'var(--accent-sky-bg)' : 'transparent'
                    }}
                  >
                    <td className="p-3 font-medium" style={{ color: 'var(--text-heading)' }}>
                      {formatDateBR(act.date)}
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-body)' }}>
                      {act.start}
                    </td>
                    <td className="p-3" style={{ color: 'var(--text-body)' }}>
                      {act.end} ({act.hours}h)
                    </td>
                    <td className="p-3 font-normal" style={{ color: 'var(--text-heading)' }}>
                      {act.description}
                    </td>
                    <td className="p-3 text-right font-bold" style={{ color: 'var(--accent-sage)' }}>
                      {act.hours} h
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(act)}
                          className="p-1.5 rounded hover:scale-110 transition-transform cursor-pointer"
                          style={{ color: 'var(--accent-sky)' }}
                          title="Editar atividade"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(act.id)}
                          className="p-1.5 rounded hover:scale-110 transition-transform cursor-pointer hover:text-[var(--accent-rose)]"
                          style={{ color: 'var(--text-muted)' }}
                          title="Excluir atividade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr
              className="font-bold text-sm"
              style={{
                backgroundColor: 'var(--table-header-bg)',
                color: 'var(--text-heading)'
              }}
            >
              <td colSpan={4} className="p-3 text-right pr-6">
                TOTAL GERAL:
              </td>
              <td className="p-3 text-right" style={{ color: 'var(--accent-sage)' }}>
                {totalHours} horas
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
