"use client";

import { useState, type FormEvent } from "react";
import { Activity, ModalityType, ActivityTemplate } from "@/types";
import {
  calcPetHours,
  cleanActivityDescription,
  getCurrentMonth,
  getDefaultActivityDate,
} from "@/lib/pet-calculator";
import { Plus } from "lucide-react";

interface ActivityFormProps {
  onSave: (
    data: Omit<Activity, "id" | "hours">,
    editingId?: string,
  ) => boolean | void;
  defaultGatNumber?: string;
  defaultGatName?: string;
  templates?: ActivityTemplate[];
  monthKey?: string;
  onDirtyChange?: (dirty: boolean) => void;
}

export function ActivityForm({
  onSave,
  defaultGatNumber = "04",
  defaultGatName = "Mangaba",
  templates = [],
  monthKey = getCurrentMonth(),
  onDirtyChange,
}: ActivityFormProps) {
  const [date, setDate] = useState(() => getDefaultActivityDate(monthKey));
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [modality, setModality] = useState<ModalityType>("Síncrona virtual");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const hours = calcPetHours(start, end);
  const [year, month] = monthKey.split("-").map(Number);
  const lastDate = `${monthKey}-${new Date(year, month, 0).getDate()}`;
  function dirty() {
    onDirtyChange?.(true);
    setError("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!date.startsWith(monthKey) || !description.trim() || hours <= 0) {
      setError(
        !date.startsWith(monthKey)
          ? "Escolha uma data no mês desta folha."
          : !description.trim()
            ? "Descreva a atividade realizada."
            : "A saída deve ser posterior à entrada.",
      );
      return;
    }
    const saved = onSave({
      date,
      start,
      end,
      modality,
      description: cleanActivityDescription(description),
    });
    if (saved !== false) {
      setDescription("");
      setError("");
      onDirtyChange?.(false);
    }
  }
  return (
    <section
      id="nova-atividade"
      className="activity-form form-panel"
      aria-labelledby="activity-form-title"
    >
      <div className="form-panel-heading">
        <div>
          <p className="section-kicker">Registrar</p>
          <h2 id="activity-form-title">Adicionar atividade</h2>
        </div>
        <Plus size={20} aria-hidden="true" />
      </div>
      <form onSubmit={submit} className="activity-fields">
        {templates.length > 0 && (
          <div className="field">
            <label htmlFor="activity-template">
              Preenchimento rápido{" "}
              <span className="text-muted">· opcional</span>
            </label>
            <select
              id="activity-template"
              defaultValue=""
              onChange={(event) => {
                const template = templates.find(
                  (item) => item.id === event.target.value,
                );
                if (template) {
                  setDescription(
                    cleanActivityDescription(
                      template.name
                        .replaceAll("{gatNumber}", defaultGatNumber)
                        .replaceAll("{gatName}", defaultGatName),
                    ),
                  );
                  setModality(template.modality);
                  dirty();
                }
                event.target.value = "";
              }}
            >
              <option value="">Escolher um modelo</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name
                    .replaceAll("{gatNumber}", defaultGatNumber)
                    .replaceAll("{gatName}", defaultGatName)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor="activity-date">Data</label>
          <input
            id="activity-date"
            type="date"
            required
            min={`${monthKey}-01`}
            max={lastDate}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              dirty();
            }}
          />
        </div>
        <div className="time-fields">
          <div className="field">
            <label htmlFor="activity-start">Entrada</label>
            <input
              id="activity-start"
              type="time"
              required
              value={start}
              onChange={(event) => {
                setStart(event.target.value);
                dirty();
              }}
              aria-describedby={error ? "activity-error" : undefined}
            />
          </div>
          <div className="field">
            <label htmlFor="activity-end">Saída</label>
            <input
              id="activity-end"
              type="time"
              required
              value={end}
              onChange={(event) => {
                setEnd(event.target.value);
                dirty();
              }}
              aria-describedby={error ? "activity-error" : undefined}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="activity-modality">Modalidade</label>
          <select
            id="activity-modality"
            value={modality}
            onChange={(event) => {
              setModality(event.target.value as ModalityType);
              dirty();
            }}
          >
            <option>Síncrona virtual</option>
            <option>Síncrona presencial</option>
            <option>Assíncrona virtual</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="activity-description">Atividade realizada</label>
          <textarea
            id="activity-description"
            required
            rows={3}
            placeholder="Descreva o que você realizou"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              dirty();
            }}
          />
        </div>
        <div className="hours-preview">
          <span>Horas pela regra PET</span>
          <strong>{hours}h</strong>
        </div>
        <p className="field-hint">
          Cada hora do relógio iniciada conta. Ex.: 13h30 às 17h30 = 5h.
        </p>
        {error && (
          <p id="activity-error" role="alert" className="inline-error">
            {error}
          </p>
        )}
        <button type="submit" className="primary-button w-full">
          <Plus size={18} />
          Adicionar atividade
        </button>
      </form>
    </section>
  );
}
