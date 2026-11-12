"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { Activity, ModalityType, ActivityTemplate } from "@/types";
import {
  calcPetHours,
  cleanActivityDescription,
  getCurrentMonth,
  getDefaultActivityDate,
} from "@/lib/pet-calculator";
import { Plus, X } from "lucide-react";
import { Modal } from "./Modal";

const COMPACT_MEDIA = "(max-width: 899px)";
function subscribeToLayout(onChange: () => void) {
  const query = window.matchMedia(COMPACT_MEDIA);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const compactLayout = () => window.matchMedia(COMPACT_MEDIA).matches;
const serverLayout = () => false;

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
  const [templateId, setTemplateId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const compact = useSyncExternalStore(subscribeToLayout, compactLayout, serverLayout);
  useEffect(() => {
    if (error) document.getElementById("activity-error")?.scrollIntoView({ block: "nearest" });
  }, [error]);
  const hours = calcPetHours(start, end);
  const [year, month] = monthKey.split("-").map(Number);
  const lastDate = `${monthKey}-${new Date(year, month, 0).getDate()}`;
  function dirty() {
    setHasDraft(true);
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
      setTemplateId("");
      setError("");
      setHasDraft(false);
      setDialogOpen(false);
      onDirtyChange?.(false);
    } else {
      setError("Não foi possível salvar. Seu preenchimento foi mantido. Tente novamente.");
    }
  }
  const fields = (
      <form onSubmit={submit} className={compact ? "editor-panel activity-entry" : "activity-fields"}>
        <header className={compact ? "editor-head" : "form-panel-heading"}>
          <div>
            <h2 id="activity-form-title">Adicionar atividade</h2>
            {compact && <p>Atividades de {monthKey.split("-").reverse().join("/")}</p>}
          </div>
          {compact && (
            <button type="button" className="icon-button" onClick={() => setDialogOpen(false)} aria-label="Fechar atividade">
              <X size={20} aria-hidden="true" />
            </button>
          )}
        </header>
        <div className={compact ? "editor-body editor-fields" : "activity-entry-fields"}>
          {templates.length > 0 && <div className="field entry-template"><span id="templates-label">Começar por um modelo</span><div className="template-choices" role="group" aria-labelledby="templates-label">
            {templates.map((template) => <button type="button" key={template.id} aria-pressed={templateId === template.id} onClick={() => {
              setTemplateId(template.id);
              setDescription(cleanActivityDescription(template.name.replaceAll("{gatNumber}", defaultGatNumber).replaceAll("{gatName}", defaultGatName)));
              setModality(template.modality); dirty();
            }}>{template.name.replaceAll("{gatNumber}", defaultGatNumber).replaceAll("{gatName}", defaultGatName)}</button>)}
            <button type="button" aria-pressed={!templateId} onClick={() => { setTemplateId(""); setDescription(""); dirty(); }}>Em branco</button>
          </div></div>}

        <div className="field">
          <label htmlFor="activity-description">Atividade realizada</label>
          <textarea
            id="activity-description"
            required
            rows={2}
            placeholder="Descreva o que você realizou"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setTemplateId("");
              dirty();
            }}
          />
        </div>
        <div className="pair-fields">
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
          <div
            className="hours-preview"
            title="Cada hora do relógio iniciada conta. Ex.: 13h30 às 17h30 = 5h."
          >
            <span>Horas PET</span>
            <strong>{hours}h</strong>
          </div>
        </div>
        {hours > 0 && <p className="pet-hours-explained">Entram <strong>{hours} {hours === 1 ? "hora" : "horas"}</strong> na folha. A hora iniciada conta inteira.</p>}
        {error && (
          <p id="activity-error" role="alert" className="inline-error">
            {error}
          </p>
        )}
        </div>
        <footer className={compact ? "editor-foot" : "activity-entry-actions"}>
          {compact && <button type="button" className="secondary-button" onClick={() => setDialogOpen(false)}>Voltar à lista</button>}
        <button type="submit" className="primary-button">
          <Plus size={18} />
          Adicionar atividade
        </button>
        </footer>
      </form>
  );

  return compact ? (
    <div className="mobile-activity-entry">
      <button id="add-activity-trigger" type="button" className="primary-button" onClick={() => setDialogOpen(true)}>
        <Plus size={18} aria-hidden="true" /> {hasDraft ? "Continuar atividade" : "Adicionar atividade"}
      </button>
      <Modal isOpen={dialogOpen} onClose={() => setDialogOpen(false)} label="Adicionar atividade" variant="editor">
        <section id="nova-atividade" className="new-activity-dialog">{fields}</section>
      </Modal>
    </div>
  ) : (
    <section id="nova-atividade" className="activity-form form-panel" aria-labelledby="activity-form-title">
      {fields}
    </section>
  );
}
