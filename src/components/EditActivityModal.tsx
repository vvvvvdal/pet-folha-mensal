'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ModalityType, ActivityTemplate } from '@/types';
import { calcPetHours } from '@/lib/pet-calculator';
import { X, Calendar, Clock, Check, Edit3 } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';
import { useTheme } from '@/lib/theme';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onSave: (data: Omit<Activity, 'id' | 'hours'>, editingId?: string) => void;
  defaultGatNumber?: string;
  defaultGatName?: string;
  templates?: ActivityTemplate[];
}

export function EditActivityModal({
  isOpen,
  onClose,
  activity,
  onSave,
  defaultGatNumber = '04',
  defaultGatName = 'Mangaba',
  templates = []
}: EditActivityModalProps) {
  const { theme } = useTheme();
  const { alert } = useDialog();

  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [modality, setModality] = useState<ModalityType>('Síncrona virtual');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (activity) {
      setDate(activity.date);
      setStart(activity.start);
      setEnd(activity.end);

      let coreDesc = activity.description;
      if (coreDesc.includes('(Síncrona virtual)')) {
        setModality('Síncrona virtual');
        coreDesc = coreDesc.replace('(Síncrona virtual)', '').trim();
      } else if (coreDesc.includes('(Síncrona presencial)')) {
        setModality('Síncrona presencial');
        coreDesc = coreDesc.replace('(Síncrona presencial)', '').trim();
      } else if (coreDesc.includes('(Assíncrona virtual)')) {
        setModality('Assíncrona virtual');
        coreDesc = coreDesc.replace('(Assíncrona virtual)', '').trim();
      } else {
        setModality(activity.modality);
      }

      setDescription(coreDesc);
    }
  }, [activity, isOpen]);

  if (!isOpen || !activity) return null;

  const previewHours = calcPetHours(start, end);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      await alert({
        title: 'Descrição Obrigatória',
        message: 'Por favor, informe a descrição detalhada da atividade.',
        variant: 'warning'
      });
      return;
    }

    if (previewHours <= 0) {
      await alert({
        title: 'Horário Inválido',
        message: 'O horário de saída deve ser posterior ao horário de entrada.',
        variant: 'warning'
      });
      return;
    }

    let finalDesc = description.trim();
    if (!finalDesc.includes(`(${modality})`)) {
      finalDesc = `${finalDesc} (${modality})`;
    }

    onSave(
      {
        date,
        start,
        end,
        modality,
        description: finalDesc
      },
      activity.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-4 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#008D4C]/15 text-[#008D4C] dark:text-[#10B981] flex items-center justify-center font-bold">
              <Edit3 className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Editar Atividade</h3>
              <p className="text-xs text-slate-400">Atualize os horários, modalidade ou descrição do registro</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modelos rápidos no modal */}
        {templates && templates.length > 0 && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <span className="text-xs text-slate-400">Preenchimento rápido:</span>
            <select
              onChange={(e) => {
                const tplId = e.target.value;
                if (!tplId) return;
                const found = templates.find((t) => t.id === tplId);
                if (found) {
                  const rawName = found.name || (found as any).descriptionTemplate || '';
                  const finalTitle = rawName
                    .replace('{gatNumber}', defaultGatNumber)
                    .replace('{gatName}', defaultGatName || `GAT ${defaultGatNumber}`);
                  setDescription(finalTitle);
                  setModality(found.modality);
                }
                e.target.value = '';
              }}
              defaultValue=""
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 outline-none cursor-pointer focus:border-[#008D4C]"
            >
              <option value="" disabled>Selecionar modelo...</option>
              {templates.map((tpl) => {
                const tplName = tpl?.name || (tpl as any)?.descriptionTemplate || 'Atividade';
                const isGat = Boolean(tpl?.isGatSpecific) || tplName.includes('{gatNumber}');
                const label = isGat
                  ? `Reunião do GAT ${defaultGatNumber} (${tpl.modality})`
                  : `${tplName} (${tpl.modality})`;
                return (
                  <option key={tpl.id} value={tpl.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Data + Entrada + Saída + Duração */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            {/* Data */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Data</label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      (e.target as any).showPicker?.();
                    } catch {}
                  }}
                  required
                  style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                  className="w-full min-h-[44px] pl-3 pr-10 py-2 text-sm rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-[#008D4C] transition-colors cursor-pointer"
                />
                <Calendar className="absolute right-3 size-4 text-slate-200 pointer-events-none z-1" />
              </div>
            </div>

            {/* Entrada */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Entrada</label>
              <div className="relative flex items-center">
                <input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  onClick={(e) => {
                    try {
                      (e.target as any).showPicker?.();
                    } catch {}
                  }}
                  required
                  style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                  className="w-full min-h-[44px] pl-3 pr-10 py-2 text-sm rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-[#008D4C] transition-colors cursor-pointer"
                />
                <Clock className="absolute right-3 size-4 text-slate-200 pointer-events-none z-1" />
              </div>
            </div>

            {/* Saída */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Saída</label>
              <div className="relative flex items-center">
                <input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  onClick={(e) => {
                    try {
                      (e.target as any).showPicker?.();
                    } catch {}
                  }}
                  required
                  style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                  className="w-full min-h-[44px] pl-3 pr-10 py-2 text-sm rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-[#008D4C] transition-colors cursor-pointer"
                />
                <Clock className="absolute right-3 size-4 text-slate-200 pointer-events-none z-1" />
              </div>
            </div>

            {/* Duração Calculada */}
            <div className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Duração:</span>
              <span className="text-sm font-bold text-[#10B981]">
                {previewHours}h {previewHours === 1 ? 'hora' : 'horas'}
              </span>
            </div>
          </div>

          {/* Row 2: Modalidade */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Modalidade</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setModality('Síncrona virtual')}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  modality === 'Síncrona virtual'
                    ? 'bg-[#00A3E0]/15 border-[#00A3E0]/50 text-[#00A3E0] dark:text-[#7DD3FC] font-semibold'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`size-2 rounded-full ${modality === 'Síncrona virtual' ? 'bg-[#00A3E0]' : 'bg-slate-600'}`} />
                <span>Síncrona Virtual</span>
              </button>

              <button
                type="button"
                onClick={() => setModality('Síncrona presencial')}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  modality === 'Síncrona presencial'
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-600 dark:text-blue-300 font-semibold'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`size-2 rounded-full ${modality === 'Síncrona presencial' ? 'bg-blue-500' : 'bg-slate-600'}`} />
                <span>Síncrona Presencial</span>
              </button>

              <button
                type="button"
                onClick={() => setModality('Assíncrona virtual')}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  modality === 'Assíncrona virtual'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-600 dark:text-indigo-300 font-semibold'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className={`size-2 rounded-full ${modality === 'Assíncrona virtual' ? 'bg-indigo-500' : 'bg-slate-600'}`} />
                <span>Assíncrona Virtual</span>
              </button>
            </div>
          </div>

          {/* Row 3: Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Descrição da Atividade</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
              placeholder="Ex: Reunião do GAT 04, Oficina formativa..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-[#008D4C] transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#008D4C] hover:bg-[#00733e] text-white text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check className="size-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
