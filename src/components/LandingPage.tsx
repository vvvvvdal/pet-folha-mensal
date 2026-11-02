"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Download,
  FolderOpen,
  HelpCircle,
  Moon,
  Settings2,
  Sun,
} from "lucide-react";
import { UserProfile, UserRole, GATInfo } from "@/types";
import { useTheme } from "@/lib/theme";
import { Brand } from "./Brand";
import { FAQ, HelpModal } from "./Help";
import { SiteFooter } from "./SiteFooter";
import { SystemPreview } from "./SystemPreview";

interface LandingPageProps {
  onLoginWithJson: (file: File) => void;
  onCreateProfile: (name: string, gatNumber: string, role: UserRole) => void;
  profiles?: UserProfile[];
  onSelectProfile?: (profile: UserProfile) => void;
  gats: Record<string, GATInfo>;
  roles: string[];
  onOpenAdmin: () => void;
  onOpenFeedback: () => void;
}

export function LandingPage({
  onLoginWithJson,
  onCreateProfile,
  profiles = [],
  onSelectProfile,
  gats,
  roles,
  onOpenAdmin,
  onOpenFeedback,
}: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<"local" | "create" | "upload">(
    profiles.length ? "local" : "create",
  );
  const [name, setName] = useState("");
  const [gat, setGat] = useState(Object.keys(gats)[0] || "");
  const [role, setRole] = useState(roles[0] || "");
  const [helpOpen, setHelpOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function createProfile(event: FormEvent) {
    event.preventDefault();
    if (name.trim() && gat && role) onCreateProfile(name.trim(), gat, role);
  }

  return (
    <div className="entry-page screen-only">
      <a href="#acesso" className="skip-link">
        Pular para o acesso
      </a>
      <header className="entry-header">
        <div className="entry-header-inner">
          <Brand />
          <nav aria-label="Ajuda e preferências">
            <button
              className="icon-button"
              onClick={() => setHelpOpen(true)}
              aria-label="Abrir ajuda"
            >
              <HelpCircle size={20} />
            </button>
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
              }
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="icon-button"
              onClick={onOpenAdmin}
              aria-label="Abrir configurações locais"
            >
              <Settings2 size={20} />
            </button>
          </nav>
        </div>
      </header>
      <main className="entry-main">
        <section className="entry-hero" aria-labelledby="entry-title">
          <div className="entry-intro">
            <p className="section-kicker">PET-Saúde Clima · UFG</p>
            <h1 id="entry-title">
              Sua frequência,
              <br />
              mês a mês.
            </h1>
            <p className="entry-description">
              Registre as atividades, confira suas horas e prepare a folha para
              assinatura.
            </p>
            <ol className="entry-steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Abra sua folha</strong>
                  <p>Continue neste navegador ou restaure uma cópia.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Registre as atividades</strong>
                  <p>As horas são calculadas pela regra do PET.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Confira e gere o PDF</strong>
                  <p>Guarde também uma cópia para continuar depois.</p>
                </div>
              </li>
            </ol>
          </div>
          <section
            id="acesso"
            className="access-card"
            aria-label="Abrir minha folha"
          >
            <div className="access-card-heading">
              <FolderOpen size={22} />
              <h2>Vamos começar</h2>
            </div>
            <div
              className="access-tabs"
              role="group"
              aria-label="Como deseja começar"
            >
              {profiles.length > 0 && (
                <button
                  type="button"
                  aria-pressed={tab === "local"}
                  className={tab === "local" ? "selected" : ""}
                  onClick={() => setTab("local")}
                >
                  Continuar
                </button>
              )}
              <button
                type="button"
                aria-pressed={tab === "create"}
                className={tab === "create" ? "selected" : ""}
                onClick={() => setTab("create")}
              >
                Primeiro acesso
              </button>
              <button
                type="button"
                aria-pressed={tab === "upload"}
                className={tab === "upload" ? "selected" : ""}
                onClick={() => setTab("upload")}
              >
                Restaurar cópia
              </button>
            </div>
            {tab === "local" ? (
              <div className="local-profiles">
                <p className="access-hint">
                  Folhas neste navegador. Você pode abrir um novo mês sem o
                  arquivo anterior.
                </p>
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    className="local-profile"
                    onClick={() => onSelectProfile?.(profile)}
                  >
                    <span className="profile-initial" aria-hidden="true">
                      {profile.name.charAt(0)}
                    </span>
                    <span>
                      <strong>{profile.name}</strong>
                      <small>
                        {profile.role} · GAT {profile.gatNumber} ·{" "}
                        {profile.gatName || gats[profile.gatNumber]?.name}
                      </small>
                    </span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : tab === "create" ? (
              <form onSubmit={createProfile} className="access-form">
                <p className="access-hint">
                  Informe sua identificação uma vez. Nos próximos meses,
                  continue com o mesmo perfil.
                </p>
                <div className="field">
                  <label htmlFor="entry-name">Nome completo</label>
                  <input
                    id="entry-name"
                    name="name"
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={150}
                  />
                </div>
                <div className="access-field-row">
                  <div className="field">
                    <label htmlFor="entry-role">Função no PET</label>
                    <select
                      id="entry-role"
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                      required
                    >
                      {roles.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="entry-gat">Grupo tutorial</label>
                    <select
                      id="entry-gat"
                      value={gat}
                      onChange={(event) => setGat(event.target.value)}
                      required
                    >
                      {Object.values(gats).map((item) => (
                        <option key={item.number} value={item.number}>
                          GAT {item.number} · {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  className="primary-button w-full"
                  disabled={!gat || !role}
                  type="submit"
                >
                  Abrir minha folha <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <div className="restore-entry">
                <Download size={28} aria-hidden="true" />
                <h3>Continue em outro aparelho</h3>
                <p>
                  Abra a cópia de segurança (.json) salva anteriormente. O PDF é
                  a folha para assinatura e não restaura os registros.
                </p>
                <button
                  className="primary-button w-full"
                  type="button"
                  onClick={() => fileRef.current?.click()}
                >
                  Selecionar cópia <ArrowRight size={18} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  aria-label="Cópia de segurança da folha"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onLoginWithJson(file);
                    event.target.value = "";
                  }}
                />
                <p className="access-hint">
                  Sem o arquivo? Se usou este navegador, procure em “Continuar”.
                  Em outro aparelho, você pode criar a folha do novo mês; os
                  registros antigos dependem da cópia ou do navegador original.
                </p>
              </div>
            )}
            <p className="local-note">
              Seus registros ficam neste navegador. Não há sincronização
              automática entre aparelhos.
            </p>
          </section>
        </section>
        <details className="preview-disclosure">
          <summary>Veja como sua folha fica organizada</summary>
          <SystemPreview />
        </details>
        <section
          className="faq-section"
          id="perguntas"
          aria-labelledby="faq-title"
        >
          <h2 id="faq-title">Dúvidas frequentes</h2>
          <FAQ />
        </section>
      </main>
      <SiteFooter
        onHelp={() => setHelpOpen(true)}
        onFeedback={onOpenFeedback}
      />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
