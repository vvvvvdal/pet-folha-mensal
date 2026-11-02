"use client";

import { Modal } from "./Modal";
import React, { useState, useEffect } from "react";
import { Activity, ModalityType, ActivityTemplate } from "@/types";
import { calcPetHours, cleanActivityDescription } from "@/lib/pet-calculator";
import { X, Calendar, Clock, Check, Edit3 } from "lucide-react";
import { useDialog } from "@/context/DialogContext";

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onSave: (
    data: Omit<Activity, "id" | "hours">,
    editingId?: string,
  ) => boolean | void;
  defaultGatNumber?: string;
  defaultGatName?: string;
  templates?: ActivityTemplate[];
  monthKey?: string;
}

export function EditActivityModal({
  isOpen,
  onClose,
  activity,
  onSave,
  defaultGatNumber = "04",
  defaultGatName = "Mangaba",
  templates = [],
  monthKey,
}: EditActivityModalProps) {
  const { alert } = useDialog();

  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [modality, setModality] = useState<ModalityType>("Síncrona virtual");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (activity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset modal fields when the selected record or open state changes.
      setDate(activity.date);
      setStart(activity.start);
      setEnd(activity.end);
      setModality(activity.modality);
      setDescription(cleanActivityDescription(activity.description));
    }
  }, [activity, isOpen]);

  if (!isOpen || !activity) return null;

  const previewHours = calcPetHours(start, end);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      await alert({
        title: "Descrição Obrigatória",
        message: "Por favor, informe a descrição detalhada da atividade.",
        variant: "warning",
      });
      return;
    }

    if (previewHours <= 0) {
      await alert({
        title: "Horário Inválido",
        message: "O horário de saída deve ser posterior ao horário de entrada.",
        variant: "warning",
      });
      return;
    }

    const cleanDesc = cleanActivityDescription(description);

    if (monthKey && !date.startsWith(monthKey)) {
      await alert({
        title: "Confira a data",
        message: "Escolha uma data no mês desta folha.",
        variant: "warning",
      });
      return;
    }

    const saved = onSave(
      {
        date,
        start,
        end,
        modality,
        description: cleanDesc,
      },
      activity.id,
    );

    if (saved !== false) onClose();
    else
      await alert({
        title: "Atividade não salva",
        message:
          "Não foi possível gravar. O preenchimento foi mantido. Verifique o armazenamento do navegador e tente novamente.",
        variant: "warning",
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Editar atividade">
      <div
        className="w-full max-w-xl rounded-2xl border border-line bg-surface shadow-[var(--page-shadow)] p-4 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-accent/15 text-accent  flex items-center justify-center font-bold">
              <Edit3 className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Editar Atividade</h3>
              <p className="text-xs text-muted">
                Atualize os horários, modalidade ou descrição do registro
              </p>
            </div>
          </div>
          <button
            aria-label="Fechar"
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg border border-line hover:bg-raised text-muted hover:text-body flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modelos rápidos no modal */}
        {templates && templates.length > 0 && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-canvas border border-line">
            <span className="text-xs text-muted">Preenchimento rápido:</span>
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
              className="text-xs px-2.5 py-1.5 rounded-lg bg-surface border border-line text-body outline-none cursor-pointer focus:border-accent"
            >
              <option value="" disabled>
                Selecionar modelo...
              </option>
              {templates.map((tpl) => {
                const tplName =
                  tpl?.name ||
                  (tpl as ActivityTemplate & { descriptionTemplate?: string })
                    ?.descriptionTemplate ||
                  "Atividade";
                const isGat =
                  Boolean(tpl?.isGatSpecific) ||
                  tplName.includes("{gatNumber}");
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
              <label
                htmlFor="editactivitymodal-wrapped-1"
                className="block text-xs font-semibold text-body mb-1.5"
              >
                Data
              </label>
              <div className="relative flex items-center">
                <input
                  id="editactivitymodal-wrapped-1"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {}
                  }}
                  required
                  className="w-full min-h-[44px] pl-3 pr-10 py-2 text-sm rounded-xl bg-canvas border border-line text-body outline-none focus:border-accent transition-colors cursor-pointer"
                />
                <Calendar className="absolute right-3 size-4 text-body pointer-events-none z-1" />
              </div>
            </div>

            {/* Entrada */}
            <div>
              <label
                htmlFor="editactivitymodal-wrapped-2"
                className="block text-xs font-semibold text-body mb-1.5"
              >
                Entrada
              </label>
              <div className="relative flex items-center">
                <input
                  id="editactivitymodal-wrapped-2"
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {}
                  }}
                  required
                  className="w-full min-h-[44px] pl-3 pr-10 py-2 text-sm rounded-xl bg-canvas border border-line text-body outline-none focus:border-accent transition-colors cursor-pointer"
                />
                <Clock className="absolute right-3 size-4 text-body pointer-events-none z-1" />
              </div>
            </div>

            {/* Saída */}
            <div>
              <label
                htmlFor="editactivitymodal-wrapped-3"
                className="block text-xs font-semibold text-body mb-1.5"
              >
                Saída
              </label>
              <div className="relative flex items-center">
                <input
                  id="editactivitymodal-wrapped-3"
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {}
                  }}
                  required
                  className="w-full min-h-[44px] pl-3 pr-10 py-2 text-sm rounded-xl bg-canvas border border-line text-body outline-none focus:border-accent transition-colors cursor-pointer"
                />
                <Clock className="absolute right-3 size-4 text-body pointer-events-none z-1" />
              </div>
            </div>

            {/* Duração Calculada */}
            <div className="min-h-[44px] px-3 py-2 rounded-xl bg-canvas border border-line flex items-center justify-between">
              <span className="text-xs font-medium text-muted">Duração:</span>
              <span className="text-sm font-bold text-accent">
                {previewHours}h {previewHours === 1 ? "hora" : "horas"}
              </span>
            </div>
          </div>

          {/* Row 2: Modalidade */}
          <fieldset>
            <legend className="block text-xs font-semibold text-body mb-1.5">
              Modalidade
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                aria-pressed={modality === "Síncrona virtual"}
                onClick={() => setModality("Síncrona virtual")}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  modality === "Síncrona virtual"
                    ? "bg-[#00A3E0]/15 border-info/50 text-info  font-semibold"
                    : "bg-canvas border-line text-muted hover:text-body"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${modality === "Síncrona virtual" ? "bg-[#00A3E0]" : "bg-line"}`}
                />
                <span>Síncrona Virtual</span>
              </button>

              <button
                type="button"
                aria-pressed={modality === "Síncrona presencial"}
                onClick={() => setModality("Síncrona presencial")}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  modality === "Síncrona presencial"
                    ? "bg-info/10 border-info/50 text-info  font-semibold"
                    : "bg-canvas border-line text-muted hover:text-body"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${modality === "Síncrona presencial" ? "bg-info" : "bg-line"}`}
                />
                <span>Síncrona Presencial</span>
              </button>

              <button
                type="button"
                aria-pressed={modality === "Assíncrona virtual"}
                onClick={() => setModality("Assíncrona virtual")}
                className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  modality === "Assíncrona virtual"
                    ? "bg-info/10 border-info/50 text-info  font-semibold"
                    : "bg-canvas border-line text-muted hover:text-body"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${modality === "Assíncrona virtual" ? "bg-info" : "bg-line"}`}
                />
                <span>Assíncrona Virtual</span>
              </button>
            </div>
          </fieldset>

          {/* Row 3: Descrição */}
          <div>
            <label
              htmlFor="editactivitymodal-field-1"
              className="block text-xs font-semibold text-body mb-1.5"
            >
              Descrição da Atividade
            </label>
            <textarea
              id="editactivitymodal-field-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
              placeholder="Ex: Reunião do GAT 04, Oficina formativa..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-canvas border border-line text-body outline-none focus:border-accent transition-colors resize-none"
            />
            <p className="text-[11px] text-muted mt-1">
              O tipo da atividade selecionado acima é incluído automaticamente
              na Folha oficial.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-line hover:bg-raised text-body text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary hover:bg-[var(--primary-hover)] text-white text-sm font-bold transition-all shadow-[var(--page-shadow)] flex items-center gap-2 cursor-pointer"
            >
              <Check className="size-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
