"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Download,
  FileText,
  Plus,
  BarChart3,
  LockKeyhole,
  Clock,
  HelpCircle,
  Moon,
  MoreHorizontal,
  Settings2,
  Sun,
} from "lucide-react";
import { UserProfile, UserRole, GATInfo } from "@/types";
import { useTheme } from "@/lib/theme";
import { Brand } from "./Brand";
import { FAQ, HelpModal } from "./Help";
import { GoogleAccess } from "./GoogleAccess";
import type { GoogleLoginError } from "@/lib/google-session";
import { NewsPopover } from "./NewsPopover";
import { Onboarding } from "./Onboarding";
import "./entry-redesign.css";
import { SiteFooter } from "./SiteFooter";
import { Frame, FrameHeader, FramePanel, SegmentedControl, SegmentedControlItem } from "./ui/access-controls";

interface LocalAccessProps {
  google?: never;
  loginError?: never;
  onLoginWithJson: (file: File) => void;
  onCreateProfile: (name: string, gatNumber: string, role: UserRole) => void;
  profiles?: UserProfile[];
  onSelectProfile?: (profile: UserProfile) => void;
  gats: Record<string, GATInfo>;
  roles: string[];
  onOpenAdmin: () => void;
}

type LandingPageProps = {
  onOpenFeedback: () => void;
} & (LocalAccessProps | { google: true; loginError?: GoogleLoginError });

export function LandingPage(props: LandingPageProps) {
  const { google, loginError, onOpenFeedback } = props;
  const local = props.google ? undefined : props;
  const { profiles = [], gats = {}, roles = [] } = local ?? {};
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<"local" | "create" | "upload">(
    profiles.length ? "local" : "create",
  );
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (google || profiles.length || typeof window === "undefined") return false;
    try { return localStorage.getItem("pet_folha_onboarding_seen") !== "1"; }
    catch { return true; }
  });
  const [name, setName] = useState("");
  const [gat, setGat] = useState(Object.keys(gats)[0] || "");
  const [role, setRole] = useState(roles[0] || "");
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileId, setProfileId] = useState(profiles[0]?.id || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const optionsTrigger = useRef<HTMLButtonElement>(null);
  const optionsPanel = useRef<HTMLDivElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  function positionOptions() {
    const rect = optionsTrigger.current?.getBoundingClientRect();
    if (!rect || !optionsPanel.current) return;
    optionsPanel.current.style.setProperty("--options-top", `${rect.bottom + 8}px`);
    optionsPanel.current.style.setProperty("--options-right", `${Math.max(12, window.innerWidth - rect.right)}px`);
  }
  useEffect(() => {
    if (!optionsOpen) return;
    window.addEventListener("scroll", positionOptions, true);
    window.addEventListener("resize", positionOptions);
    return () => {
      window.removeEventListener("scroll", positionOptions, true);
      window.removeEventListener("resize", positionOptions);
    };
  }, [optionsOpen]);
  function optionsAction(action: () => void) {
    optionsPanel.current?.hidePopover();
    action();
  }

  function finishOnboarding() {
    try { localStorage.setItem("pet_folha_onboarding_seen", "1"); } catch { /* Access remains available without storage. */ }
    setShowOnboarding(false);
  }

  function createProfile(event: FormEvent) {
    event.preventDefault();
    if (name.trim() && gat && role) local?.onCreateProfile(name.trim(), gat, role);
  }

  return (
    <div className="entry-page screen-only">
      <a href="#acesso" className="skip-link">
        Pular para o acesso
      </a>
      <header className="entry-header">
        <div className="entry-header-inner">
          <Brand />
          <nav aria-label="Seções e preferências">
            <a className="entry-nav-link" href="#como-funciona">Como funciona</a>
            <a className="entry-nav-link" href="#arquivos">O que guardar</a>
            <a className="entry-nav-link" href="#perguntas">Dúvidas</a>
            <a className="entry-header-access" href="#acesso">{google ? "Entrar" : "Continuar minha folha"}</a>
            <NewsPopover id="entry-news" variant="entry" />
            <button ref={optionsTrigger} type="button" className="icon-button entry-options-trigger"
              aria-label="Mais opções" aria-controls="entry-options" aria-expanded={optionsOpen}
              popoverTarget="entry-options" onClick={positionOptions}>
              <MoreHorizontal size={22} aria-hidden="true" />
            </button>
            <div ref={optionsPanel} id="entry-options" popover="auto" className="entry-options-panel"
              aria-label="Mais opções" role="region"
              onBeforeToggle={(event) => { if (event.newState === "open") positionOptions(); }}
              onToggle={(event) => setOptionsOpen(event.newState === "open")}>
              <button type="button" onClick={() => optionsAction(() => setHelpOpen(true))}><HelpCircle size={20} aria-hidden="true" />Ajuda</button>
              <button type="button" aria-pressed={theme === "dark"} onClick={() => optionsAction(toggleTheme)}>{theme === "dark" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}Tema</button>
              {local && <button type="button" onClick={() => optionsAction(local.onOpenAdmin)}><Settings2 size={20} aria-hidden="true" />Configurações</button>}
            </div>
          </nav>
        </div>
      </header>
      <main className="start-main">
        <section className="entry-hero" aria-labelledby="entry-title">
          <div className="entry-hero-copy">
            <h1 id="entry-title">Sua folha do mês, pronta para assinar.</h1>
            <p>Anote cada atividade quando ela acontece. O PET Folha soma as horas pela regra do programa e monta a folha oficial em PDF.</p>
            {google ? (
              <>
                <GoogleAccess error={loginError} />
                <p className="entry-privacy">
                  <LockKeyhole size={17} aria-hidden="true" />
                  <span>Sua folha sincroniza na pasta <strong>PET Folha</strong> do seu Drive. <a href="/privacidade">Política de privacidade</a></span>
                </p>
              </>
            ) : (
              <>
                <div className="entry-hero-actions">
                  <a className="primary-button" href="#acesso" onClick={() => setTab("create")}>Começar agora <ArrowRight size={20} /></a>
                  <a className="entry-secondary-button" href="#acesso" onClick={() => setTab(profiles.length ? "local" : "create")}>Continuar minha folha</a>
                </div>
                <p className="entry-privacy"><LockKeyhole size={17} aria-hidden="true" /> Sem cadastro e sem senha. Os registros ficam neste aparelho.</p>
              </>
            )}
          </div>
          <div className="entry-preview" aria-label="Exemplo ilustrativo de uma folha">
            <div className="entry-preview-card">
              <div className="entry-preview-heading"><span>Novembro de 2026</span><span>GAT 2 · Buriti</span></div>
              <p><strong>21</strong> de 32 horas no mês</p>
              <div className="entry-preview-bar" aria-hidden="true"><span /></div>
              <div className="entry-preview-row"><span>ter<br /><strong>17</strong></span><span><strong>Reunião do GAT 2</strong><br />14:00 às 18:00</span><strong>4 h</strong></div>
              <div className="entry-preview-row"><span>qui<br /><strong>12</strong></span><span><strong>Estudo dirigido</strong><br />14:00 às 15:30</span><strong>2 h</strong></div>
            </div>
            <div className="entry-preview-note"><Clock size={20} aria-hidden="true" /><span><strong>14:00 às 15:30 = 2 horas</strong><br />hora iniciada conta como hora cheia</span></div>
          </div>
        </section>
        {local && <div className="start-layout">
          <section id="acesso" aria-labelledby="access-title">
            <Frame>
              <FrameHeader><h2 id="access-title">Abrir minha folha</h2></FrameHeader>
              <FramePanel>
                {showOnboarding ? <Onboarding onComplete={finishOnboarding} onRestore={() => { setTab("upload"); finishOnboarding(); }} /> : <>
                <SegmentedControl aria-label="Como deseja começar">
                  {profiles.length > 0 && (
                    <SegmentedControlItem selected={tab === "local"} onClick={() => setTab("local")}>Continuar</SegmentedControlItem>
                  )}
                  <SegmentedControlItem selected={tab === "create"} onClick={() => setTab("create")}>Primeiro acesso</SegmentedControlItem>
                  <SegmentedControlItem selected={tab === "upload"} onClick={() => setTab("upload")}>Restaurar cópia</SegmentedControlItem>
                </SegmentedControl>
                {tab === "local" ? (
                  <form className="start-form" onSubmit={(event) => {
                    event.preventDefault();
                    const profile = profiles.find((item) => item.id === profileId);
                    if (profile) local.onSelectProfile?.(profile);
                  }}>
                    <p className="access-hint">Abra seu perfil e escolha o mês. Você pode começar um novo mês sem o arquivo anterior.</p>
                    <div className="field">
                      <label htmlFor="entry-profile">Perfil neste navegador</label>
                      <select id="entry-profile" value={profileId} onChange={(event) => setProfileId(event.target.value)} required>
                        {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name} · {profile.role} · GAT {profile.gatNumber}</option>)}
                      </select>
                    </div>
                    <button className="primary-button w-full" type="submit">Continuar com este perfil <ArrowRight size={18} /></button>
                  </form>
                ) : tab === "create" ? (
                  <form onSubmit={createProfile} className="start-form">
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
                    <div className="start-field-row">
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
                        if (file) local.onLoginWithJson(file);
                        event.target.value = "";
                      }}
                    />
                    <p className="access-hint">
                      Sem a cópia? Procure seu perfil neste navegador. Em outro aparelho,
                      você pode começar um novo mês. Para recuperar registros antigos,
                      use a cópia ou o navegador original.
                    </p>
                  </div>
                )}
                <p className="local-note">
                  Os registros ficam neste navegador. Quem usa este navegador pode abrir os perfis salvos. Não há sincronização entre aparelhos.
                </p>
                </>}
              </FramePanel>
            </Frame>
          </section>
        </div>}
        <section id="como-funciona" className="entry-how" aria-labelledby="how-title">
          <div className="entry-section-heading"><p className="section-kicker">Como funciona</p><h2 id="how-title">Três passos por mês.</h2></div>
          <div className="entry-steps">
            <article><span><Plus size={20} aria-hidden="true" /></span><h3>1. Registre as atividades</h3><p>Data, chegada, saída e o que foi feito. As horas aparecem antes de você salvar.</p></article>
            <article><span><BarChart3 size={20} aria-hidden="true" /></span><h3>2. Acompanhe as 8 h da semana</h3><p>Veja quanto falta em cada semana e no mês, com a referência de cerca de 32 horas.</p></article>
            <article><span><FileText size={20} aria-hidden="true" /></span><h3>3. Gere a folha e assine</h3><p>O PDF sai no modelo oficial. Envie assinado até o 1º dia útil do mês seguinte.</p></article>
          </div>
        </section>
        <section id="arquivos" className="entry-files" aria-labelledby="files-title">
          <div className="entry-section-heading"><p className="section-kicker">O que guardar</p><h2 id="files-title">Dois arquivos, cada um com sua função.</h2><p>{google ? "A folha sincroniza no Google Drive. Guarde o PDF para assinatura e baixe uma cópia .json quando precisar." : "Ao terminar o mês, guarde os dois. Não há sincronização entre aparelhos: a cópia é o que permite continuar em outro lugar."}</p></div>
          <div className="entry-file-cards">
            <article><span>.pdf</span><h3>Folha para assinar</h3><p>É o documento que você imprime ou assina e envia. Ele não traz os registros de volta para edição.</p></article>
            <article><span>.json</span><h3>{google ? "Cópia manual" : "Cópia para continuar"}</h3><p>Guarda sua identificação, atividades, comprovantes e relatórios. {google ? "Depois de entrar, acesse a Conta para baixar ou importar uma cópia." : "Use Restaurar cópia para abrir em outro aparelho."}</p></article>
          </div>
        </section>
        <section
          className="faq-section"
          id="perguntas"
          aria-labelledby="faq-title"
        >
          <h2 id="faq-title">Dúvidas frequentes</h2>
          <FAQ google={google} />
        </section>
      </main>
      <SiteFooter
        onHelp={() => setHelpOpen(true)}
        onFeedback={onOpenFeedback}
        onNews={() => {
          const trigger = document.querySelector<HTMLButtonElement>('[aria-controls="entry-news"]');
          trigger?.scrollIntoView({ block: "center" });
          trigger?.focus({ preventScroll: true });
          trigger?.click();
        }}
      />
      <HelpModal google={google} isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
