"use client";

import React, { useState, useEffect } from "react";
import { Activity, ModalityType, ActivityTemplate } from "@/types";
import { calcPetHours, cleanActivityDescription } from "@/lib/pet-calculator";
import { Plus, Check, Calendar, Clock } from "lucide-react";
import { useDialog } from "@/context/DialogContext";

interface ActivityFormProps {
  onSave: (data: Omit<Activity, "id" | "hours">, editingId?: string) => void;
  editingActivity?: Activity | null;
  onCancelEdit?: () => void;
  defaultGatNumber?: string;
  defaultGatName?: string;
  templates?: ActivityTemplate[];
}

export function ActivityForm({
  onSave,
  editingActivity = null,
  onCancelEdit,
  defaultGatNumber = "04",
  defaultGatName = "Mangaba",
  templates = [],
}: ActivityFormProps) {
  const { alert } = useDialog();
  const [date, setDate] = useState("2026-09-23");
  const [start, setStart] = useState("19:00");
  const [end, setEnd] = useState("20:40");
  const [modality, setModality] = useState<ModalityType>("Síncrona virtual");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingActivity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset the existing form when an activity is selected for editing.
      setDate(editingActivity.date);
      setStart(editingActivity.start);
      setEnd(editingActivity.end);
      setModality(editingActivity.modality);
      setDescription(cleanActivityDescription(editingActivity.description));
    }
  }, [editingActivity]);

  const previewHours = calcPetHours(start, end);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !start || !end || !description.trim()) {
      await alert({
        title: "Campos Incompletos",
        message:
          "Por favor, preencha a data, horários e a descrição da atividade.",
        variant: "warning",
      });
      return;
    }

    const cleanDesc = cleanActivityDescription(description);

    onSave(
      {
        date,
        start,
        end,
        modality,
        description: cleanDesc,
      },
      editingActivity ? editingActivity.id : undefined,
    );

    if (!editingActivity) {
      setDescription("");
    }
  };

  return (
    <div
      id="nova-atividade"
      className="activity-form p-4 sm:p-6 rounded-2xl border border-line bg-surface shadow-[var(--page-shadow)] mb-6 transition-all"
    >
      {/* Top Header: Title & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-accent/15 text-accent  flex items-center justify-center font-bold text-xs">
            {editingActivity ? (
              <Check className="size-3.5" />
            ) : (
              <Plus className="size-3.5" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-body">
            {editingActivity ? "Editar Lançamento" : "Nova atividade"}
          </span>
        </div>

        {/* Quick presets from dynamic templates with clear helper text */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          {templates && templates.length > 0 && (
            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs text-muted hidden md:inline">
                Atividade frequente?
              </span>
              <select
                aria-label="Modelo de atividade para preenchimento rápido"
                onChange={(e) => {
                  const tplId = e.target.value;
                  if (!tplId) return;
                  const found = templates.find((t) => t.id === tplId);
                  if (found) {
                    const rawName =
                      found.name ||
                      (
                        found as ActivityTemplate & {
                          descriptionTemplate?: string;
                        }
                      ).descriptionTemplate ||
                      "";
                    const finalTitle = cleanActivityDescription(
                      rawName
                        .replace("{gatNumber}", defaultGatNumber)
                        .replace(
                          "{gatName}",
                          defaultGatName || `GAT ${defaultGatNumber}`,
                        ),
                    );
                    setDescription(finalTitle);
                    setModality(found.modality);
                  }
                  e.target.value = "";
                }}
                defaultValue=""
                className="w-full sm:w-auto min-h-[44px] px-3.5 py-2 rounded-xl bg-canvas border border-line text-body text-sm sm:text-xs outline-none cursor-pointer focus:border-accent hover:border-slate-600 transition-colors"
                title="Selecione uma atividade para preencher o nome e a modalidade automaticamente"
              >
                <option value="" disabled>
                  Selecionar modelo pré-configurado...
                </option>
                {templates.map((tpl) => {
                  const tplName =
                    tpl?.name ||
                    (tpl as ActivityTemplate & { descriptionTemplate?: string })
                      ?.descriptionTemplate ||
                    "Atividade";
                  const isGat =
                    Boolean(tpl?.isGatSpecific) ||
                    tplName.includes("{gatNumber}") ||
                    tplName.includes("{gatLabel}");
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
            <label
              htmlFor="activityform-wrapped-1"
              className="block text-xs sm:text-sm font-medium text-body mb-1.5"
            >
              Data
            </label>
            <div className="relative flex items-center">
              <input
                id="activityform-wrapped-1"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {}
                }}
                required
                className="w-full min-h-[44px] pl-3.5 pr-10 py-2.5 text-base sm:text-sm rounded-xl bg-canvas border border-line text-body outline-none focus:border-accent transition-colors cursor-pointer"
              />
              <Calendar className="absolute right-3.5 size-4 text-body pointer-events-none z-1" />
            </div>
          </div>

          {/* Entrada */}
          <div>
            <label
              htmlFor="activityform-wrapped-2"
              className="block text-xs sm:text-sm font-medium text-body mb-1.5"
            >
              Entrada
            </label>
            <div className="relative flex items-center">
              <input
                id="activityform-wrapped-2"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {}
                }}
                required
                className="w-full min-h-[44px] pl-3.5 pr-10 py-2.5 text-base sm:text-sm rounded-xl bg-canvas border border-line text-body outline-none focus:border-accent transition-colors cursor-pointer"
              />
              <Clock className="absolute right-3.5 size-4 text-body pointer-events-none z-1" />
            </div>
          </div>

          {/* Saída */}
          <div>
            <label
              htmlFor="activityform-wrapped-3"
              className="block text-xs sm:text-sm font-medium text-body mb-1.5"
            >
              Saída
            </label>
            <div className="relative flex items-center">
              <input
                id="activityform-wrapped-3"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {}
                }}
                required
                className="w-full min-h-[44px] pl-3.5 pr-10 py-2.5 text-base sm:text-sm rounded-xl bg-canvas border border-line text-body outline-none focus:border-accent transition-colors cursor-pointer"
              />
              <Clock className="absolute right-3.5 size-4 text-body pointer-events-none z-1" />
            </div>
          </div>

          {/* Duração Calculada */}
          <div className="min-h-[44px] p-2.5 sm:p-3 rounded-xl bg-canvas border border-line flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted">
              Duração:
            </span>
            <span className="text-sm sm:text-base font-bold text-accent">
              {previewHours}h {previewHours === 1 ? "hora" : "horas"}
            </span>
          </div>
        </div>

        {/* Row 2: Modalidade da Atividade - Tons equilibrados de Azul */}
        <fieldset>
          <legend className="block text-xs sm:text-sm font-medium text-body mb-1.5">
            Modalidade
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Síncrona Virtual: Azul Turquesa / Cyan */}
            <button
              type="button"
              aria-pressed={modality === "Síncrona virtual"}
              onClick={() => setModality("Síncrona virtual")}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modality === "Síncrona virtual"
                  ? "bg-[#00A3E0]/15 border-info/50 text-info  shadow-[var(--page-shadow)] font-semibold"
                  : "bg-canvas border-line text-muted hover:text-body hover:bg-canvas"
              }`}
            >
              <span
                className={`size-2 rounded-full ${modality === "Síncrona virtual" ? "bg-[#00A3E0]" : "bg-line"}`}
              />
              <span>Síncrona Virtual</span>
            </button>

            {/* Síncrona Presencial: Azul Cobalto / Royal Blue */}
            <button
              type="button"
              aria-pressed={modality === "Síncrona presencial"}
              onClick={() => setModality("Síncrona presencial")}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modality === "Síncrona presencial"
                  ? "bg-info/10 border-info/50 text-info  shadow-[var(--page-shadow)] font-semibold"
                  : "bg-canvas border-line text-muted hover:text-body hover:bg-canvas"
              }`}
            >
              <span
                className={`size-2 rounded-full ${modality === "Síncrona presencial" ? "bg-info" : "bg-line"}`}
              />
              <span>Síncrona Presencial</span>
            </button>

            {/* Assíncrona Virtual: Azul Índigo / Slate Blue */}
            <button
              type="button"
              aria-pressed={modality === "Assíncrona virtual"}
              onClick={() => setModality("Assíncrona virtual")}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                modality === "Assíncrona virtual"
                  ? "bg-info/10 border-info/50 text-info  shadow-[var(--page-shadow)] font-semibold"
                  : "bg-canvas border-line text-muted hover:text-body hover:bg-canvas"
              }`}
            >
              <span
                className={`size-2 rounded-full ${modality === "Assíncrona virtual" ? "bg-info" : "bg-line"}`}
              />
              <span>Assíncrona Virtual</span>
            </button>
          </div>
        </fieldset>

        {/* Row 3: Descrição e Ações */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
          <div className="flex-1">
            <label
              htmlFor="activityform-field-1"
              className="block text-xs sm:text-sm font-medium text-body mb-1.5"
            >
              Descrição da Atividade
            </label>
            <input
              id="activityform-field-1"
              type="text"
              placeholder="Ex: Reunião do GAT 04, Oficina formativa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full min-h-[44px] px-4 py-2.5 text-base sm:text-sm rounded-xl bg-canvas border border-line text-body outline-none focus:border-accent transition-colors"
            />
            <p className="text-[11px] text-muted mt-1">
              O tipo da atividade selecionado acima é incluído automaticamente
              na Folha oficial.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            <button
              type="submit"
              className="flex-1 sm:flex-none min-h-[44px] px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-primary text-white hover:bg-[var(--primary-hover)] cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[var(--page-shadow)]"
            >
              {editingActivity ? (
                <>
                  <Check className="size-4" />
                  <span>Salvar Alterações</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Adicionar atividade</span>
                </>
              )}
            </button>
            {editingActivity && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-line text-body hover:text-ink hover:bg-raised text-sm font-semibold cursor-pointer transition-all"
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
