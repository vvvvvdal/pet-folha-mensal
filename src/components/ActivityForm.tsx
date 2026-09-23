'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ModalityType, ActivityTemplate } from '@/types';
import { calcPetHours } from '@/lib/pet-calculator';
import { Plus, Check } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

interface ActivityFormProps {
  onSave: (data: Omit<Activity, 'id' | 'hours'>, editingId?: string) => void;
  editingActivity: Activity | null;
  onCancelEdit: () => void;
  defaultGatNumber?: string;
  defaultGatName?: string;
  templates?: ActivityTemplate[];
}

export function ActivityForm({
  onSave,
  editingActivity,
  onCancelEdit,
  defaultGatNumber = '04',
  defaultGatName = 'Mangaba',
  templates = []
}: ActivityFormProps) {
  const { alert } = useDialog();
  const [date, setDate] = useState('2026-09-23');
  const [start, setStart] = useState('19:00');
  const [end, setEnd] = useState('20:40');
  const [modality, setModality] = useState<ModalityType>('Síncrona virtual');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingActivity) {
      setDate(editingActivity.date);
      setStart(editingActivity.start);
      setEnd(editingActivity.end);

      let coreDesc = editingActivity.description;
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
        setModality(editingActivity.modality);
      }

      setDescription(coreDesc);
    }
  }, [editingActivity]);

  const previewHours = calcPetHours(start, end);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !start || !end || !description.trim()) {
      await alert({
        title: 'Campos Incompletos',
        message: 'Por favor, preencha a data, horários e a descrição da atividade.',
        variant: 'warning'
      });
      return;
    }

    let finalDesc = description.trim();
    if (!finalDesc.includes('(') && !finalDesc.includes(')')) {
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
      editingActivity ? editingActivity.id : undefined
    );

    if (!editingActivity) {
      setDescription('');
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xs mb-6 transition-all">
      {/* Top Header: Title & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-[#008D4C]/15 text-[#008D4C] dark:text-[#10B981] flex items-center justify-center font-bold text-xs">
            {editingActivity ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            {editingActivity ? 'Editar Lançamento' : 'Novo Lançamento de Atividade'}
          </span>
        </div>

        {/* Quick presets from dynamic templates with clear helper text */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          {templates && templates.length > 0 && (
            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden md:inline">
                Preenchimento rápido de atividades frequentes:
              </span>
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
                className="w-full sm:w-auto min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700/70 text-slate-200 text-sm sm:text-xs outline-none cursor-pointer focus:border-[#008D4C] hover:border-slate-600 transition-colors"
                title="Selecione uma atividade para preencher o nome e a modalidade automaticamente"
              >
                <option value="" disabled>
                  Selecionar modelo pré-configurado...
                </option>
                {templates.map((tpl) => {
                  const tplName = tpl?.name || (tpl as any)?.descriptionTemplate || 'Atividade';
                  const isGat = Boolean(tpl?.isGatSpecific) || tplName.includes('{gatNumber}') || tplName.includes('{gatLabel}');
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
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Data + Entrada + Saída + Duração Calculada */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          {/* Data */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-[#008D4C] transition-colors"
            />
          </div>

          {/* Horário Entrada */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Horário Entrada</label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-[#008D4C] transition-colors"
            />
          </div>

          {/* Horário Saída */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Horário Saída</label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-[#008D4C] transition-colors"
            />
          </div>

          {/* Duração Calculada */}
          <div className="min-h-[44px] p-2.5 sm:p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-400">Duração:</span>
            <span className="text-sm sm:text-base font-bold text-[#10B981]">
              {previewHours}h {previewHours === 1 ? 'hora' : 'horas'}
            </span>
          </div>
        </div>

        {/* Row 2: Modalidade da Atividade - Tons equilibrados de Azul */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Modalidade</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Síncrona Virtual: Azul Turquesa / Cyan */}
            <button
              type="button"
              onClick={() => setModality('Síncrona virtual')}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modality === 'Síncrona virtual'
                  ? 'bg-[#00A3E0]/15 border-[#00A3E0]/50 text-[#00A3E0] dark:text-[#7DD3FC] shadow-xs font-semibold'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <span className={`size-2 rounded-full ${modality === 'Síncrona virtual' ? 'bg-[#00A3E0]' : 'bg-slate-600'}`} />
              <span>Síncrona Virtual</span>
            </button>

            {/* Síncrona Presencial: Azul Cobalto / Royal Blue */}
            <button
              type="button"
              onClick={() => setModality('Síncrona presencial')}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modality === 'Síncrona presencial'
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-600 dark:text-blue-300 shadow-xs font-semibold'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <span className={`size-2 rounded-full ${modality === 'Síncrona presencial' ? 'bg-blue-500' : 'bg-slate-600'}`} />
              <span>Síncrona Presencial</span>
            </button>

            {/* Assíncrona Virtual: Azul Índigo / Slate Blue */}
            <button
              type="button"
              onClick={() => setModality('Assíncrona virtual')}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modality === 'Assíncrona virtual'
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <span className={`size-2 rounded-full ${modality === 'Assíncrona virtual' ? 'bg-indigo-500' : 'bg-slate-600'}`} />
              <span>Assíncrona Virtual</span>
            </button>
          </div>
        </div>

        {/* Row 3: Descrição e Ações */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
              Descrição da Atividade
            </label>
            <input
              type="text"
              placeholder="Ex: Reunião do GAT 04, Oficina formativa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full min-h-[44px] px-4 py-2.5 text-base sm:text-sm rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-[#008D4C] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <button
              type="submit"
              className="flex-1 sm:flex-none min-h-[44px] px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-[#008D4C] text-white hover:bg-[#00733E] cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#008D4C]/25"
            >
              {editingActivity ? (
                <>
                  <Check className="size-4" />
                  <span>Salvar Alterações</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Adicionar à Folha</span>
                </>
              )}
            </button>
            {editingActivity && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold cursor-pointer transition-all"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
