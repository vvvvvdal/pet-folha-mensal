"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { GATInfo, UserProfile } from "@/types";
import { getMonthYearLabel } from "@/lib/pet-calculator";
import { getProfileMonths, getStoredProfiles, registerProfile, saveProfiles } from "@/lib/storage";
import { listRemoteMonths, pullMonth, type RemoteMonth } from "@/lib/drive-sync";
import type { GoogleSession } from "@/lib/google-session";
import { initials } from "./Navbar";
import { InlineSpinner } from "./LoadingStates";
import "./google-sync.css";

type Step = "checking" | "drive" | "local" | "new" | "error";

interface FirstEntryProps {
  session: GoogleSession & { sub: string };
  localProfiles: UserProfile[];
  gats: Record<string, GATInfo>;
  roles: string[];
  /** `pushMonths`: months already in this browser that must be sent to Drive. */
  onDone: (user: UserProfile, pushMonths: string[]) => void;
  onSignOut: () => void;
}

function formatSize(bytes?: number) {
  if (!bytes) return "";
  const mb = bytes >= 1024 * 1024;
  return ` · ${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(bytes / (mb ? 1024 * 1024 : 1024))} ${mb ? "MB" : "KB"}`;
}

export function FirstEntry({ session, localProfiles, gats, roles, onDone, onSignOut }: FirstEntryProps) {
  const [step, setStep] = useState<Step>("checking");
  const [remote, setRemote] = useState<RemoteMonth[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<{ index: number; done?: number; total?: number } | null>(null);
  const [chosen, setChosen] = useState(localProfiles[0]?.id ?? "");
  const [name, setName] = useState(session.name ?? "");
  const [role, setRole] = useState(roles[0] ?? "");
  const [gat, setGat] = useState(Object.keys(gats)[0] ?? "");
  const firstName = (session.name ?? "").split(" ")[0];

  useEffect(() => {
    let current = true;
    listRemoteMonths()
      .then((months) => {
        if (!current) return;
        setRemote(months);
        setStep(months.length ? "drive" : localProfiles.length ? "local" : "new");
      })
      .catch(() => {
        if (!current) return;
        setError("Não foi possível abrir a pasta PET Folha no seu Google Drive. Confira a conexão e tente de novo.");
        setStep("error");
      });
    return () => { current = false; };
  }, [attempt, localProfiles.length]);

  async function restoreFromDrive() {
    setError("");
    for (let index = 0; index < remote.length; index++) {
      setProgress({ index });
      try {
        const result = await pullMonth(session.sub, remote[index], {
          email: session.email,
          onProgress: (done, total) => setProgress({ index, done, total }),
        });
        if (!result.success) {
          setProgress(null);
          setError(`${getMonthYearLabel(remote[index].monthKey)}: ${result.error}`);
          return;
        }
      } catch {
        setProgress(null);
        setError(`Não foi possível trazer ${getMonthYearLabel(remote[index].monthKey)}. Tente de novo.`);
        return;
      }
    }
    setProgress(null);
    const user = getStoredProfiles().find((profile) => profile.googleSub === session.sub);
    if (user) onDone(user, []);
    else setError("Os meses foram trazidos, mas o perfil não foi encontrado. Tente de novo.");
  }

  function link(profile: UserProfile) {
    const linked: UserProfile = { ...profile, googleSub: session.sub, email: profile.email || session.email };
    try {
      saveProfiles(getStoredProfiles().map((item) => (item.id === profile.id ? linked : item)));
      onDone(linked, getProfileMonths(profile.id));
    } catch {
      setError("O navegador não conseguiu guardar o vínculo. Verifique o armazenamento e tente de novo.");
    }
  }

  function create(event: FormEvent) {
    event.preventDefault();
    setError("");
    const result = registerProfile({ name, role, gatNumber: gat });
    if (result.existingUser) {
      setChosen(result.existingUser.id);
      setStep("local");
      setError("Já existe uma folha com esse nome neste navegador. Se for sua, vincule-a.");
      return;
    }
    if (!result.success || !result.user) {
      setError(result.error ?? "Não foi possível criar o perfil.");
      return;
    }
    link(result.user);
  }

  const profilesHere = step === "local" && error.startsWith("Já existe")
    ? getStoredProfiles().filter((profile) => profile.id === chosen)
    : localProfiles;
  const titles: Record<Step, string> = {
    checking: "Procurando sua folha…",
    drive: firstName ? `Bem-vindo(a) de volta, ${firstName}` : "Bem-vindo(a) de volta",
    local: "Encontramos uma folha aqui",
    new: "Complete seu cadastro",
    error: "Não deu para abrir o Drive",
  };

  return (
    <div className="screen-only first-entry">
      <section className="first-entry-panel" role="dialog" aria-modal="false" aria-labelledby="first-entry-title">
        <header>
          <span className="avatar" aria-hidden="true">{initials(session.name || session.email || "?")}</span>
          <div>
            <h1 id="first-entry-title">{titles[step]}</h1>
            {session.email && <p>{session.email}</p>}
          </div>
        </header>

        <div className="first-entry-body">
          {step === "checking" && (
            <p className="first-entry-status" role="status"><InlineSpinner size={18} />Abrindo a pasta PET Folha no seu Drive…</p>
          )}

          {step === "drive" && (
            <>
              <p>Encontramos {remote.length} {remote.length === 1 ? "mês" : "meses"} na pasta PET Folha do seu Google Drive.</p>
              <ul className="first-entry-months">
                {remote.map((month, index) => (
                  <li key={month.fileId}>
                    <span><strong>{getMonthYearLabel(month.monthKey)}</strong><small>No Drive{formatSize(month.size)}</small></span>
                    <span data-state={!progress ? "idle" : index < progress.index ? "done" : index === progress.index ? "active" : "queued"}>
                      {!progress ? "" : index < progress.index ? "Pronto" : index === progress.index ? "Trazendo…" : "Na fila"}
                    </span>
                  </li>
                ))}
              </ul>
              {progress && (
                <div role="status" className="first-entry-progress">
                  <span>
                    Trazendo {getMonthYearLabel(remote[progress.index].monthKey)} · {progress.index + 1} de {remote.length}
                    {progress.total ? ` · comprovante ${progress.done} de ${progress.total}` : ""}
                  </span>
                  <span className="first-entry-bar" aria-hidden="true">
                    <span style={{ width: `${Math.round(((progress.index + (progress.total ? (progress.done ?? 0) / progress.total : 0)) / remote.length) * 100)}%` }} />
                  </span>
                </div>
              )}
            </>
          )}

          {step === "local" && (
            <>
              <p>Este navegador já tem uma folha do PET. Ela é sua?</p>
              <fieldset className="first-entry-profiles">
                <legend className="sr-only">Folhas neste navegador</legend>
                {profilesHere.map((profile) => {
                  const months = getProfileMonths(profile.id).length;
                  return (
                    <label key={profile.id} data-selected={chosen === profile.id}>
                      <input type="radio" name="local-profile" checked={chosen === profile.id} onChange={() => setChosen(profile.id)} />
                      <span className="avatar" aria-hidden="true">{initials(profile.name)}</span>
                      <span>
                        <strong>{profile.name}</strong>
                        <small>{profile.role} · GAT {profile.gatNumber} · {months} {months === 1 ? "mês" : "meses"}</small>
                      </span>
                    </label>
                  );
                })}
              </fieldset>
              <p className="first-entry-note">Ao vincular, a folha passa a ser da sua conta e é copiada para a pasta PET Folha do seu Drive.</p>
            </>
          )}

          {step === "new" && (
            <form id="first-entry-form" className="first-entry-form" onSubmit={create}>
              <p>Falta pouco. Esses dados aparecem na folha oficial.</p>
              <div className="field">
                <label htmlFor="first-entry-name">Nome completo</label>
                <input id="first-entry-name" required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
              </div>
              <div className="first-entry-pair">
                <div className="field">
                  <label htmlFor="first-entry-role">Função</label>
                  <select id="first-entry-role" value={role} onChange={(event) => setRole(event.target.value)}>
                    {roles.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="first-entry-gat">GAT</label>
                  <select id="first-entry-gat" value={gat} onChange={(event) => setGat(event.target.value)}>
                    {Object.values(gats).map((item) => <option key={item.number} value={item.number}>GAT {item.number} · {item.name}</option>)}
                  </select>
                </div>
              </div>
            </form>
          )}

          {step === "error" && <p>{error}</p>}
          {error && step !== "error" && <p className="operation-notice" role="alert">{error}</p>}
        </div>

        <footer className="first-entry-foot">
          <button type="button" className="text-button" onClick={onSignOut}>Entrou com a conta errada? Sair</button>
          <div>
            {step === "drive" && (
              <button type="button" className="primary-button" disabled={Boolean(progress)} aria-busy={Boolean(progress)} onClick={() => void restoreFromDrive()}>
                {progress && <InlineSpinner size={18} />}{progress ? "Trazendo meses…" : "Abrir minha folha"}
              </button>
            )}
            {step === "local" && (
              <>
                <button type="button" className="secondary-button" onClick={() => { setError(""); setStep("new"); }}>Não é minha</button>
                <button type="button" className="primary-button" disabled={!chosen} onClick={() => {
                  const profile = getStoredProfiles().find((item) => item.id === chosen);
                  if (profile) link(profile);
                }}>Vincular à minha conta</button>
              </>
            )}
            {step === "new" && <button type="submit" form="first-entry-form" className="primary-button">Começar minha folha</button>}
            {step === "error" && <button type="button" className="primary-button" onClick={() => { setStep("checking"); setError(""); setAttempt(attempt + 1); }}>Tentar de novo</button>}
          </div>
        </footer>
      </section>
    </div>
  );
}
