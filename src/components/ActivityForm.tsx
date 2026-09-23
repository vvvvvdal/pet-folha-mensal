'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ModalityType } from '@/types';
import { calcPetHours } from '@/lib/pet-calculator';
import { Plus, Check, X, Sparkles } from 'lucide-react';

interface ActivityFormProps {
  onSave: (data: Omit<Activity, 'id' | 'hours'>, editingId?: string) => void;
  editingActivity: Activity | null;
  onCancelEdit: () => void;
  defaultGatNumber?: string;
  defaultGatName?: string;
}

export function ActivityForm({
  onSave,
  editingActivity,
  onCancelEdit,
  defaultGatNumber = '04',
  defaultGatName = 'Mangaba'
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
    <div className="p-4 sm:p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 mb-6 transition-all">
      {/* Top Header: Title & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          {editingActivity ? (
            <span className="text-emerald-400 font-medium">Editando Lançamento</span>
          ) : (
            <span>Novo Lançamento</span>
          )}
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset('gat')}
            className="px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-slate-100 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="size-3 text-emerald-400" />
            <span>Reunião GAT {defaultGatNumber}</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('geral')}
            className="px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-slate-100 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="size-3 text-sky-400" />
            <span>Reunião Geral PET</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
          {/* Data */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Horários */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Entrada</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
                className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Saída</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
                className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Modalidade */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Modalidade</label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as ModalityType)}
              className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Síncrona virtual">Síncrona virtual</option>
              <option value="Síncrona presencial">Síncrona presencial</option>
              <option value="Assíncrona virtual">Assíncrona virtual</option>
            </select>
          </div>

          {/* Descrição */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Atividade</label>
            <input
              type="text"
              placeholder="Ex: Reunião do GAT, Síntese..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950/70 border border-slate-800 text-slate-200 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Action */}
          <div className="lg:col-span-2 flex items-center gap-1.5">
            <button
              type="submit"
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer transition-all flex items-center justify-center gap-1"
            >
              {editingActivity ? (
                <>
                  <Check className="size-3.5" />
                  <span>Salvar</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Adicionar</span>
                </>
              )}
            </button>
            {editingActivity && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
                title="Cancelar edição"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Calculated Hours Tag */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>
            Duração apurada: <strong className="text-slate-200">{previewHours} hora{previewHours === 1 ? '' : 's'} PET</strong> ({start} às {end}, regra da hora cheia iniciada)
          </span>
        </div>
      </form>
    </div>
  );
}
