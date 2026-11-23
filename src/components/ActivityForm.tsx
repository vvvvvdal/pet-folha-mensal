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
import "./frequency-redesign.css";

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

  const templateField = templates.length > 0 && (
    <div className="field entry-template">
      <label htmlFor="activity-template">Modelo</label>
      <select id="activity-template" value={templateId} onChange={(event) => {
        const id = event.target.value;
        const template = templates.find((item) => item.id === id);
        setTemplateId(id);
        setDescription(template ? cleanActivityDescription(template.name.replaceAll("{gatNumber}", defaultGatNumber).replaceAll("{gatName}", defaultGatName)) : "");
        if (template) setModality(template.modality);
        dirty();
      }}>
        <option value="">Em branco</option>
        {templates.map((template) => <option key={template.id} value={template.id}>{template.name.replaceAll("{gatNumber}", defaultGatNumber).replaceAll("{gatName}", defaultGatName)}</option>)}
      </select>
    </div>
  );
  const descriptionField = (
    <div className="field entry-description">
      <label htmlFor="activity-description">Atividade realizada</label>
      <textarea
        id="activity-description"
        required
        rows={compact ? 2 : 1}
        placeholder="Descreva o que você realizou"
        value={description}
        onChange={(event) => {
          setDescription(event.target.value);
          setTemplateId("");
          dirty();
        }}
      />
    </div>
  );
  const dateField = (
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
  );
  const modalityField = (
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
  );
  const timeField = (id: string, label: string, value: string, set: (value: string) => void) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="time"
        required
        value={value}
        onChange={(event) => {
          set(event.target.value);
          dirty();
        }}
        aria-describedby={error ? "activity-error" : undefined}
      />
    </div>
  );
  const hoursPreview = (
    <div
      className="hours-preview"
      title="Cada hora do relógio iniciada conta. Ex.: 13h30 às 17h30 = 5h."
    >
      <span>Horas PET</span>
      <strong>{hours}h</strong>
    </div>
  );
  const errorMessage = error && (
    <p id="activity-error" role="alert" className="inline-error">
      {error}
    </p>
  );

  if (!compact)
    return (
      <section id="nova-atividade" className="activity-composer" aria-labelledby="activity-form-title">
        <form onSubmit={submit}>
          <header className="composer-head">
            <h2 id="activity-form-title">Nova atividade</h2>
            <p>A hora iniciada conta inteira. Ex.: 14:00 às 15:30 = 2 h.</p>
          </header>
          <div className="composer-row" data-row="main">
            {templateField}
            {descriptionField}
          </div>
          <div className="composer-row" data-row="time">
            {dateField}
            {modalityField}
            {timeField("activity-start", "Entrada", start, setStart)}
            {timeField("activity-end", "Saída", end, setEnd)}
            {hoursPreview}
            <button type="submit" className="primary-button" aria-label="Adicionar atividade">
              <Plus size={18} aria-hidden="true" />
              Adicionar
            </button>
          </div>
          {errorMessage}
        </form>
      </section>
    );

  return (
    <div className="mobile-activity-entry">
      <button id="add-activity-trigger" type="button" className="primary-button" onClick={() => setDialogOpen(true)}>
        <Plus size={18} aria-hidden="true" /> {hasDraft ? "Continuar atividade" : "Adicionar atividade"}
      </button>
      <Modal isOpen={dialogOpen} onClose={() => setDialogOpen(false)} label="Adicionar atividade" variant="editor">
        <section id="nova-atividade" className="new-activity-dialog">
          <form onSubmit={submit} className="editor-panel activity-entry">
            <header className="editor-head">
              <div>
                <h2 id="activity-form-title">Adicionar atividade</h2>
                <p>Atividades de {monthKey.split("-").reverse().join("/")}</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setDialogOpen(false)} aria-label="Fechar atividade">
                <X size={20} aria-hidden="true" />
              </button>
            </header>
            <div className="editor-body editor-fields">
              {templateField}
              {descriptionField}
              <div className="pair-fields">
                {dateField}
                {modalityField}
              </div>
              <div className="time-fields">
                {timeField("activity-start", "Entrada", start, setStart)}
                {timeField("activity-end", "Saída", end, setEnd)}
                {hoursPreview}
              </div>
              {hours > 0 && <p className="pet-hours-explained">Entram <strong>{hours} {hours === 1 ? "hora" : "horas"}</strong> na folha. A hora iniciada conta inteira.</p>}
              {errorMessage}
            </div>
            <footer className="editor-foot">
              <button type="button" className="secondary-button" onClick={() => setDialogOpen(false)}>Voltar à lista</button>
              <button type="submit" className="primary-button">
                <Plus size={18} aria-hidden="true" />
                Adicionar atividade
              </button>
            </footer>
          </form>
        </section>
      </Modal>
    </div>
  );
}
