"use client";

import { Modal } from "./Modal";
import { DateInput } from "./DateInput";
import React, { useState, useEffect } from "react";
import { Activity, ModalityType, ActivityTemplate } from "@/types";
import { calcPetHours, cleanActivityDescription } from "@/lib/pet-calculator";
import { X } from "lucide-react";
import { useDialog } from "@/context/DialogContext";

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onDelete?: (id: string) => void;
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
  onDelete,
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
    <Modal isOpen={isOpen} onClose={onClose} label="Editar atividade" variant="editor">
      <form onSubmit={handleSubmit} className="editor-panel">
        <header className="editor-head">
          <div>
            <h2>Editar atividade</h2>
            <p>Atualize os dados do registro antes de salvar.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="editor-body">
          <div className="editor-columns">
            <section className="editor-section editor-fields">
              <h3>Dados da atividade</h3>
              <div className="field">
                <label htmlFor="edit-description">Descrição da Atividade</label>
                <textarea id="edit-description" required rows={4} value={description}
                  onChange={(event) => setDescription(event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="edit-date">Data</label>
                <DateInput id="edit-date" required value={date}
                  onChange={(event) => setDate(event.target.value)} />
              </div>
              <div className="pair-fields">
                <div className="field">
                  <label htmlFor="edit-start">Entrada</label>
                  <input id="edit-start" type="time" required value={start}
                    onChange={(event) => setStart(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="edit-end">Saída</label>
                  <input id="edit-end" type="time" required value={end}
                    onChange={(event) => setEnd(event.target.value)} />
                </div>
              </div>
            </section>
            <section className="editor-section editor-fields">
              <h3>Modalidade e carga horária</h3>
              {templates.length > 0 && (
                <div className="field">
                  <label htmlFor="edit-template">Preenchimento rápido</label>
                  <select id="edit-template" aria-label="Modelo de atividade para preenchimento rápido"
                    defaultValue="" onChange={(event) => {
                      const found = templates.find((template) => template.id === event.target.value);
                      if (found) {
                        const name = found.name || (found as ActivityTemplate & { descriptionTemplate?: string }).descriptionTemplate || "";
                        setDescription(cleanActivityDescription(name
                          .replace("{gatNumber}", defaultGatNumber)
                          .replace("{gatName}", defaultGatName || `GAT ${defaultGatNumber}`)));
                        setModality(found.modality);
                      }
                      event.target.value = "";
                    }}>
                    <option value="">Selecionar modelo…</option>
                    {templates.map((template) => {
                      const name = template.name || (template as ActivityTemplate & { descriptionTemplate?: string }).descriptionTemplate || "Atividade";
                      const label = template.isGatSpecific || name.includes("{gatNumber}")
                        ? `Reunião do GAT ${defaultGatNumber} (${template.modality})`
                        : `${name} (${template.modality})`;
                      return <option key={template.id} value={template.id}>{label}</option>;
                    })}
                  </select>
                </div>
              )}
              <div className="field">
                <label htmlFor="edit-modality">Modalidade</label>
                <select id="edit-modality" value={modality}
                  onChange={(event) => setModality(event.target.value as ModalityType)}>
                  <option>Síncrona virtual</option>
                  <option>Síncrona presencial</option>
                  <option>Assíncrona virtual</option>
                </select>
              </div>
              <div className="hours-preview">
                <span>Horas</span>
                <strong>{previewHours}h</strong>
              </div>
              <p className="field-hint">Cada hora do relógio iniciada conta para a carga horária.</p>
            </section>
          </div>
          {onDelete && <button type="button" className="text-button editor-danger edit-delete-action" onClick={() => onDelete(activity.id)}>Excluir atividade</button>}
        </div>
        <footer className="editor-foot">
          <div className="editor-actions activity-editor-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary-button" aria-label="Salvar Alterações">Salvar</button>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
