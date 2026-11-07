"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Activity, FormReport, UserProfile } from "@/types";
import {
  ACTIVITY_FORM_URL, FORM_ACTIVITY_TYPES, FORM_GROUPS, FORM_ROLES,
  activitySummary, buildFormUrl, defaultFormReport, formReportStatus, formSnapshot,
} from "@/lib/form-report";
import { formatDateBR, getMonthYearLabel } from "@/lib/pet-calculator";
import { Modal } from "./Modal";

interface Props {
  activity: Activity;
  user: UserProfile;
  onClose: () => void;
  onEditProfile: () => void;
  onSaveProfile: (user: UserProfile) => boolean;
  onSave: (report: FormReport) => boolean;
}

export function ActivityReportModal({ activity, user, onClose, onEditProfile, onSaveProfile, onSave }: Props) {
  const initial = activity.formReport ?? defaultFormReport(user);
  const [email, setEmail] = useState(user.email ?? "");
  const [group, setGroup] = useState(initial.group);
  const [role, setRole] = useState(initial.role);
  const [activityType, setActivityType] = useState(initial.activityType);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preparedUrl, setPreparedUrl] = useState("");
  const summary = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- A nested profile edit refreshes email without dropping the activity draft.
    setEmail(user.email ?? "");
  }, [user.email]);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(activitySummary(activity));
      setMessage("Resumo copiado. Cole nas próximas etapas do Google Forms.");
      setError("");
    } catch {
      summary.current?.focus();
      summary.current?.select();
      setError("A cópia automática está indisponível. O resumo foi selecionado para você copiar.");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    const updatedUser = { ...user, email: email.trim() };
    const report: FormReport = { group, role, activityType, confirmation: activity.formReport?.confirmation };
    let url: string;
    try {
      url = buildFormUrl(updatedUser, activity, report);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Confira os campos.");
      return;
    }
    if (action === "mark") {
      report.confirmation = { at: new Date().toISOString(), snapshot: formSnapshot(updatedUser, activity, report) };
    }
    if (updatedUser.email !== user.email && !onSaveProfile(updatedUser)) {
      setError("Não foi possível salvar o e-mail. Seu preenchimento continua aqui.");
      return;
    }
    if (!onSave(report)) {
      setError("Não foi possível salvar o preparo. Seu preenchimento continua aqui. Tente novamente.");
      return;
    }
    if (action !== "open") {
      setMessage(action === "mark" ? "Envio confirmado por você." : "Preparo salvo neste navegador.");
      return;
    }
    setPreparedUrl(url);
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      setError("O navegador bloqueou a nova aba. Use o link abaixo para abrir o Forms.");
      return;
    }
    tab.opener = null;
    tab.location.replace(url);
    setMessage("Forms aberto. Confira os campos, complete as próximas etapas e envie pelo Google.");
  }

  function unmark() {
    if (activity.formReport && onSave({ ...activity.formReport, confirmation: undefined })) {
      setMessage("Confirmação removida. Esta atividade está pendente.");
      setError("");
    } else {
      setError("Não foi possível remover a confirmação. Tente novamente.");
    }
  }

  const state = formReportStatus(user, activity);
  return (
    <Modal isOpen onClose={onClose} label="Preparar formulário">
      <section className="report-panel">
        <header className="report-heading">
          <div>
            <p className="section-kicker">Relatório por atividade</p>
            <h2>Preparar formulário</h2>
          </div>
          <button className="secondary-button" type="button" onClick={onClose}>Fechar</button>
        </header>
        <p>Revise a primeira etapa aqui. No Google, complete as próximas etapas, resolva o CAPTCHA e envie.</p>
        <form onSubmit={submit} className="report-fields">
          <div className="field">
            <label htmlFor="report-name">Nome no formulário</label>
            <input id="report-name" value={user.name} readOnly />
            <p className="access-hint">Use a mesma grafia da lista oficial. Confira a seleção no Google.</p>
            <button type="button" className="text-button" onClick={onEditProfile}>Corrigir identificação</button>
          </div>
          <div className="field">
            <label htmlFor="report-email">E-mail para o formulário</label>
            <input id="report-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </div>
          <div className="report-grid">
            <div className="field">
              <label htmlFor="report-group">Grupo Tutorial no Forms</label>
              <select id="report-group" required value={group} onChange={(event) => setGroup(event.target.value)}>
                <option value="">Selecione o grupo</option>
                {FORM_GROUPS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="report-role">Perfil no Forms</label>
              <select id="report-role" required value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="">Selecione o perfil</option>
                {FORM_ROLES.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
          </div>
          <div className="report-grid">
            <div className="field">
              <label htmlFor="report-date">Data da atividade</label>
              <input id="report-date" value={formatDateBR(activity.date)} readOnly />
            </div>
            <div className="field">
              <label htmlFor="report-month">Mês de referência</label>
              <input id="report-month" value={getMonthYearLabel(activity.date.slice(0, 7))} readOnly />
            </div>
          </div>
          <div className="field">
            <label htmlFor="report-type">Tipo de atividade no Forms</label>
            <select id="report-type" required value={activityType} onChange={(event) => setActivityType(event.target.value)}>
              <option value="">Selecione o tipo de atividade</option>
              {FORM_ACTIVITY_TYPES.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div className="report-actions">
            <button className="primary-button" type="submit" value="open">Abrir Forms preenchido</button>
            <button className="secondary-button" type="submit" value="save">Salvar preparo</button>
          </div>
          {preparedUrl && <a href={preparedUrl} target="_blank" rel="noopener noreferrer" className="text-button">Abrir o link preparado</a>}
          <div className="report-confirmation">
            <p><strong>{state}</strong> · Controle informado por você.</p>
            {activity.formReport?.confirmation && (
              <p className="access-hint">Última confirmação em {new Date(activity.formReport.confirmation.at).toLocaleString("pt-BR")}.
                {state === "Revisar envio" && " Os dados mudaram desde essa confirmação. Confira o relatório no Google."}
              </p>
            )}
            <p className="access-hint">Marque o envio depois de ver a confirmação do Google Forms.</p>
            <div className="report-actions">
              <button className="secondary-button" type="submit" value="mark">Marcar como enviado</button>
              {activity.formReport?.confirmation && <button className="text-button" type="button" onClick={unmark}>Desmarcar envio</button>}
            </div>
          </div>
        </form>
        <div className="field">
          <label htmlFor="report-summary">Resumo para as próximas etapas</label>
          <textarea ref={summary} id="report-summary" readOnly rows={6} value={activitySummary(activity)} />
          <button type="button" className="secondary-button" onClick={() => void copySummary()}>Copiar resumo da atividade</button>
        </div>
        <details className="report-help">
          <summary>Algum campo não foi preenchido no Google?</summary>
          <p>O formulário pode mudar. Confira as seleções no Google e use o resumo para completar os campos restantes.</p>
          <a href={ACTIVITY_FORM_URL} target="_blank" rel="noopener noreferrer" className="text-button">Abrir formulário original</a>
        </details>
        {message && <p role="status" className="access-hint">{message}</p>}
        {error && <p role="alert" className="operation-notice">{error}</p>}
      </section>
    </Modal>
  );
}
