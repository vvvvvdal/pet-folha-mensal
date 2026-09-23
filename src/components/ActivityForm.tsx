'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ModalityType, ActivityTemplate } from '@/types';
import { calcPetHours } from '@/lib/pet-calculator';
import { Plus, Check, X, Sparkles } from 'lucide-react';

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

  const applyPreset = (type: 'gat' | 'geral') => {
    if (type === 'gat') {
      const label = defaultGatName
        ? `Reunião do GAT ${defaultGatNumber} (${defaultGatName})`
        : `Reunião do GAT ${defaultGatNumber}`;
      setDescription(label);
      setModality('Síncrona virtual');
    } else {
      setDescription('Reunião geral do PET');
      setModality('Síncrona presencial');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !start || !end || !description.trim()) {
      alert('Por favor, preencha todos os campos da atividade.');
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
          <div className="size-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
            {editingActivity ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            {editingActivity ? 'Editar Lançamento' : 'Novo Lançamento de Atividade'}
          </span>
        </div>

        {/* Quick presets from dynamic templates */}
        <div className="flex items-center gap-2">
          {templates && templates.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-400 shrink-0" />
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
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/70 text-slate-300 text-xs outline-none cursor-pointer focus:border-emerald-500 hover:border-slate-600 transition-colors"
              >
                <option value="" disabled>
                  ⚡ Selecionar modelo pré-configurado...
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
        {/* Row 1: Data + Entrada + Saída + Duração */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          {/* Data */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Horário Entrada */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Horário Entrada</label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Horário Saída */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Horário Saída</label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Duração Computada */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Cômputo PET:</span>
            <span className="text-sm font-bold text-emerald-400">
              {previewHours}h {previewHours === 1 ? 'hora' : 'horas'}
            </span>
          </div>
        </div>

        {/* Row 2: Modalidade da Atividade */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Modalidade</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setModality('Síncrona virtual')}
              className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modality === 'Síncrona virtual'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-xs'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <span className={`size-2 rounded-full ${modality === 'Síncrona virtual' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span>Síncrona Virtual</span>
            </button>
            <button
              type="button"
              onClick={() => setModality('Síncrona presencial')}
              className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modality === 'Síncrona presencial'
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 shadow-xs'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <span className={`size-2 rounded-full ${modality === 'Síncrona presencial' ? 'bg-sky-400' : 'bg-slate-600'}`} />
              <span>Síncrona Presencial</span>
            </button>
            <button
              type="button"
              onClick={() => setModality('Assíncrona virtual')}
              className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modality === 'Assíncrona virtual'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-xs'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
              }`}
            >
              <span className={`size-2 rounded-full ${modality === 'Assíncrona virtual' ? 'bg-amber-400' : 'bg-slate-600'}`} />
              <span>Assíncrona Virtual</span>
            </button>
          </div>
        </div>

        {/* Row 3: Descrição e Ações */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Descrição da Atividade
            </label>
            <input
              type="text"
              placeholder="Ex: Reunião do GAT 04, Oficina formativa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/15"
            >
              {editingActivity ? (
                <>
                  <Check className="size-3.5" />
                  <span>Salvar Alterações</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Adicionar à Folha</span>
                </>
              )}
            </button>
            {editingActivity && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3.5 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium cursor-pointer transition-all"
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
