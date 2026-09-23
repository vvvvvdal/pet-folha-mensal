'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ModalityType } from '@/types';
import { calcPetHours } from '@/lib/pet-calculator';
import { Plus, Edit2, X, Sparkles, Clock } from 'lucide-react';

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
    <div
      className="p-5 rounded-xl border mb-6 transition-all"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          {editingActivity ? (
            <>
              <Edit2 className="w-4 h-4" style={{ color: 'var(--accent-sky)' }} />
              <span>Editar Atividade</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" style={{ color: 'var(--accent-sage)' }} />
              <span>Novo Lançamento de Atividade</span>
            </>
          )}
        </h2>

        {/* Botões de Preenchimento Rápido Dinâmico */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Preenchimento rápido:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('gat')}
            className="px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1 transition-all cursor-pointer hover:border-[var(--accent-sky)] hover:text-[var(--accent-sky)]"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
          >
            <Sparkles className="w-3 h-3 text-[var(--accent-sky)]" />
            Reunião do GAT {defaultGatNumber}
          </button>
          <button
            type="button"
            onClick={() => applyPreset('geral')}
            className="px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1 transition-all cursor-pointer hover:border-[var(--accent-sage)] hover:text-[var(--accent-sage)]"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
          >
            <Sparkles className="w-3 h-3 text-[var(--accent-sage)]" />
            Reunião geral do PET
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end">
          {/* Data */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)]"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
            />
          </div>

          {/* Chegada */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              Chegada
            </label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)]"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
            />
          </div>

          {/* Saída real */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              Saída real
            </label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)]"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
            />
          </div>

          {/* Modalidade */}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              Modalidade
            </label>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value as ModalityType)}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)] cursor-pointer"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
            >
              <option value="Síncrona virtual">Síncrona virtual</option>
              <option value="Síncrona presencial">Síncrona presencial</option>
              <option value="Assíncrona virtual">Assíncrona virtual</option>
            </select>
          </div>

          {/* Atividade */}
          <div className="sm:col-span-2 md:col-span-1">
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
              Atividade realizada
            </label>
            <input
              type="text"
              placeholder="Ex: Reunião do GAT, Síntese..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-[var(--accent-sky)]"
              style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm hover:brightness-105"
              style={{
                backgroundColor: editingActivity ? 'var(--accent-sky)' : 'var(--accent-sage)',
                color: editingActivity ? '#0a192f' : '#0d2818'
              }}
            >
              {editingActivity ? 'Salvar' : 'Adicionar'}
            </button>
            {editingActivity && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer hover:bg-[var(--bg-subtle)]"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-heading)' }}
                title="Cancelar edição"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Pré-visualização do Cálculo PET */}
        <div
          className="p-2.5 rounded-lg border text-xs flex items-center gap-2"
          style={{
            backgroundColor: 'var(--accent-sky-bg)',
            borderColor: 'var(--accent-sky-border)',
            color: 'var(--text-heading)'
          }}
        >
          <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent-sky)' }} />
          <span>
            <strong>Cálculo Automático PET:</strong> {start} às {end} = <strong>{previewHours} hora{previewHours === 1 ? '' : 's'}</strong> (regra do Edital nº 23/2026: cada hora iniciada no relógio = 1h cheia).
          </span>
        </div>
      </form>
    </div>
  );
}
