"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, ClipboardCopy, ExternalLink, X } from "lucide-react";
import type { Activity, FormReport, UserProfile } from "@/types";
import {
  ACTIVITY_FORM_URL, FORM_ACTIVITY_TYPES, FORM_GROUPS, FORM_ROLES,
  activitySummary, buildFormUrl, defaultFormReport, extraFieldsFor,
  formReportStatus, formSnapshot, suggestActivityType, suggestEventActivity,
} from "@/lib/form-report";
import { cleanActivityDescription, formatDateBR } from "@/lib/pet-calculator";
import { Modal } from "./Modal";

interface Props {
  activity: Activity;
  user: UserProfile;
  onClose: () => void;
  onEditProfile: () => void;
  onSaveProfile: (user: UserProfile) => boolean;
  onSave: (report: FormReport) => boolean;
}

function withDefaultDetail(activityType: string, extra: Record<string, string>, activity: Activity) {
  if (activityType === FORM_ACTIVITY_TYPES[8] && !extra.eventActivity?.trim())
    return { ...extra, eventActivity: suggestEventActivity(activity.description) };
  if (activityType !== FORM_ACTIVITY_TYPES[14] || extra.detail?.trim()) return extra;
  return { ...extra, detail: cleanActivityDescription(activity.description).slice(0, 300) };
}

function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset className="fm-choice">
      <legend>{label}</legend>
      <div role="radiogroup" aria-label={label}>
        {["sim", "não"].map((option) => (
          <label key={option} data-on={value === option}>
            <input type="radio" name={label} checked={value === option} onChange={() => onChange(option)} />
            {option === "sim" ? "Sim" : "Não"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ActivityReportModal({ activity, user, onClose, onEditProfile, onSaveProfile, onSave }: Props) {
  const saved = activity.formReport ?? defaultFormReport(user);
  const initial = { ...saved, activityType: saved.activityType || suggestActivityType(activity.description) };
  const [email, setEmail] = useState(user.email ?? "");
  const [group, setGroup] = useState(initial.group);
  const [role, setRole] = useState(initial.role);
  const [activityType, setActivityType] = useState(initial.activityType);
  const [extra, setExtra] = useState<Record<string, string>>(() => withDefaultDetail(initial.activityType, initial.extra ?? {}, activity));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preparedUrl, setPreparedUrl] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const summary = useRef<HTMLTextAreaElement>(null);
  const served = extra.served === "sim" ? "sim" : "não";
  const declaration = extra.declaration === "sim" ? "sim" : "não";
  const typeFields = extraFieldsFor(activityType);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- A nested profile edit refreshes email without dropping the activity draft.
    setEmail(user.email ?? "");
  }, [user.email]);
  useEffect(() => {
    if (error) form.current?.querySelector('[role="alert"]')?.scrollIntoView({ block: "nearest" });
  }, [error]);

  const setExtraValue = (key: string, value: string) => setExtra((current) => ({ ...current, [key]: value }));

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(activitySummary(activity));
      setMessage("Resumo copiado.");
      setError("");
    } catch {
      summary.current?.focus();
      summary.current?.select();
      setError("A cópia automática está indisponível. O resumo foi selecionado para você copiar.");
    }
  }

  // Valida, grava o preparo e devolve o link; null se algo impediu.
  function persist(confirm: boolean | "keep"): string | null {
    setError("");
    setMessage("");
    const updatedUser = { ...user, email: email.trim() };
    // Keep the legacy receipt answer when saving old reports so their confirmations remain comparable.
    const visible = new Set([...typeFields.map((field) => field.key), "served", "declaration",
      "receipt", ...(served === "sim" ? ["servedCount", "servedKind"] : [])]);
    const cleanExtra = Object.fromEntries(Object.entries({ ...extra, served, declaration })
      .filter(([key, text]) => visible.has(key) && text.trim()));
    const report: FormReport = {
      group, role, activityType,
      ...(Object.keys(cleanExtra).length > 0 && { extra: cleanExtra }),
      confirmation: confirm === "keep" ? activity.formReport?.confirmation : undefined,
    };
    let url: string;
    try {
      url = buildFormUrl(updatedUser, activity, report);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Confira os campos.");
      return null;
    }
    if (confirm === true)
      report.confirmation = { at: new Date().toISOString(), snapshot: formSnapshot(updatedUser, activity, report) };
    if (updatedUser.email !== user.email && !onSaveProfile(updatedUser)) {
      setError("Não foi possível salvar o e-mail. Seu preenchimento continua aqui.");
      return null;
    }
    if (!onSave(report)) {
      setError("Não foi possível salvar. Seu preenchimento continua aqui. Tente novamente.");
      return null;
    }
    return url;
  }

  function open(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = persist("keep");
    if (!url) return;
    setPreparedUrl(url);
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setError("O navegador bloqueou a nova aba. Use o link abaixo para abrir o Forms.");
      return;
    }
    tab.opener = null;
    tab.location.replace(url);
    setMessage("Forms aberto com todas as etapas preenchidas. Confira, resolva o CAPTCHA e envie.");
  }

  function toggleSent(sent: boolean) {
    if (!sent) {
      if (activity.formReport && onSave({ ...activity.formReport, confirmation: undefined })) {
        setMessage("Marcado como pendente.");
        setError("");
      } else {
        setError("Não foi possível remover a confirmação. Tente novamente.");
      }
      return;
    }
    if (form.current && !form.current.reportValidity()) return;
    if (persist(true)) setMessage("Marcado como enviado.");
  }

  const state = formReportStatus(user, activity);
  return (
    <Modal isOpen onClose={onClose} label="Enviar ao Forms" variant="editor">
      <form ref={form} onSubmit={open} className="editor-panel fm-panel">
        <header className="editor-head fm-head">
          <div>
            <h2>Enviar ao Forms</h2>
            <p>
              <strong title={cleanActivityDescription(activity.description)}>{cleanActivityDescription(activity.description)}</strong>
              <span>{formatDateBR(activity.date)} · {activity.start} às {activity.end} · {activity.hours}h</span>
            </p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="editor-body fm-body">
          <div className="editor-columns">
          <section className="editor-section">
            <h3>Dados da atividade</h3>
            <div className="editor-fields">
            <div className="field">
              <label htmlFor="report-type">Tipo de atividade no Forms</label>
              <select id="report-type" required value={activityType} onChange={(event) => {
                setActivityType(event.target.value);
                setExtra((current) => withDefaultDetail(event.target.value, current, activity));
              }}>
                <option value="">Selecione</option>
                {FORM_ACTIVITY_TYPES.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            {typeFields.map((field) => (
              <div className="field" key={field.key}>
                <label htmlFor={"report-" + field.key}>{field.label}</label>
                {field.options ? (
                  <select id={"report-" + field.key} required={!field.optional} value={extra[field.key] ?? ""}
                    onChange={(event) => setExtraValue(field.key, event.target.value)}>
                    <option value="">Selecione</option>
                    {field.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                ) : (
                  <input id={"report-" + field.key} required={!field.optional} maxLength={300}
                    inputMode={field.numeric ? "numeric" : undefined} pattern={field.numeric ? "[0-9]+" : undefined}
                    value={extra[field.key] ?? ""} onChange={(event) => setExtraValue(field.key, event.target.value)} />
                )}
              </div>
            ))}
            </div>
          </section>
          <section className="editor-section">
            <h3>Identificação e declarações</h3>
            <div className="editor-fields">
              <div className="fm-who">
                <strong>{user.name}</strong>
                <button type="button" className="text-button" onClick={onEditProfile}>Corrigir nome no perfil</button>
              </div>
              <div className="pair-fields">
                <div className="field">
                  <label htmlFor="report-group">Grupo Tutorial no Forms</label>
                  <select id="report-group" required value={group} onChange={(event) => setGroup(event.target.value)}>
                    <option value="">Selecione</option>
                    {FORM_GROUPS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="report-role">Perfil no Forms</label>
                  <select id="report-role" required value={role} onChange={(event) => setRole(event.target.value)}>
                    <option value="">Selecione</option>
                    {FORM_ROLES.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="report-email">E-mail para o formulário</label>
                <input id="report-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </div>
              <div className="fm-grid">
            <YesNo label="Atendeu usuários do SUS?" value={served} onChange={(value) => setExtraValue("served", value)} />
            <YesNo label="Precisa de declaração?" value={declaration} onChange={(value) => setExtraValue("declaration", value)} />
              </div>
            {served === "sim" && (
              <>
                <div className="field">
                  <label htmlFor="report-servedCount">Quantas pessoas (só número)</label>
                  <input id="report-servedCount" required inputMode="numeric" pattern="[0-9]+" maxLength={6}
                    value={extra.servedCount ?? ""} onChange={(event) => setExtraValue("servedCount", event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="report-servedKind">Tipo de atendimento ou procedimento</label>
                  <input id="report-servedKind" required maxLength={300}
                    value={extra.servedKind ?? ""} onChange={(event) => setExtraValue("servedKind", event.target.value)} />
                </div>
              </>
            )}
              <button className="text-button fm-copy" type="button" onClick={() => void copySummary()}>
                <ClipboardCopy size={16} aria-hidden="true" /> Copiar resumo
              </button>
            </div>
          </section>
          </div>
          <textarea ref={summary} className="sr-only" readOnly tabIndex={-1} aria-hidden="true" value={activitySummary(activity)} />
          <p className="fm-note">
            O CAPTCHA e o anexo do certificado (curso EAD) ficam no Google.{" "}
            <a href={preparedUrl || ACTIVITY_FORM_URL} target="_blank" rel="noopener noreferrer" className="text-button">
              {preparedUrl ? "Abrir o link preparado" : "Abrir formulário original"}
            </a>
          </p>
          {message && <p role="status" className="fm-message">{message}</p>}
          {error && <p role="alert" className="operation-notice">{error}</p>}
        </div>
        <footer className="editor-foot fm-foot">
          <label className="fm-sent">
            <input type="checkbox" checked={state === "Enviado" || state === "Revisar envio"}
              onChange={(event) => toggleSent(event.target.checked)} />
            <span>{state === "Revisar envio" ? "Revisar envio" : "Já enviei"}</span>
            {state === "Enviado" && <Check size={16} aria-hidden="true" />}
          </label>
          <span className="fm-status">{state}</span>
          <div className="fm-actions">
            <button className="secondary-button fm-cancel" type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" type="submit">
              Abrir Forms preenchido <ExternalLink size={16} aria-hidden="true" />
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
