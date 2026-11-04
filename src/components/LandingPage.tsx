"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Download,
  FileJson,
  FileText,
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
import { Frame, FrameHeader, FramePanel, SegmentedControl, SegmentedControlItem } from "./ui/access-controls";

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
  const [profileId, setProfileId] = useState(profiles[0]?.id || "");
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
      <main className="start-main">
        <div className="start-heading">
          <p className="section-kicker">PET-Saúde Clima · UFG</p>
          <h1>Folha de frequência</h1>
          <p>Registre suas atividades e prepare a folha mensal para assinatura.</p>
        </div>
        <div className="start-layout">
          <section id="acesso" aria-labelledby="access-title">
            <Frame>
              <FrameHeader><h2 id="access-title">Abrir minha folha</h2></FrameHeader>
              <FramePanel>
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
                    if (profile) onSelectProfile?.(profile);
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
                  Os registros ficam neste navegador. Quem usa este navegador pode abrir os perfis salvos. Não há sincronização entre aparelhos.
                </p>
              </FramePanel>
            </Frame>
          </section>
          <aside className="file-guide" aria-labelledby="files-title">
            <h2 id="files-title">JSON e PDF: o que guardar</h2>
            <div className="file-guide-item">
              <FileJson size={24} aria-hidden="true" />
              <div>
                <h3><span className="file-extension">.json</span> Cópia para continuar</h3>
                <p>O JSON é um arquivo que guarda sua identificação, as atividades e os comprovantes da folha. Ele permite continuar editando ou levar os registros para outro aparelho.</p>
                <p>Na sua folha, use <strong>Salvar cópia</strong>. Para abrir o arquivo aqui, escolha <strong>Restaurar cópia</strong>. Não precisa abrir nem editar o JSON por conta própria; guarde-o em local seguro.</p>
              </div>
            </div>
            <div className="file-guide-item">
              <FileText size={24} aria-hidden="true" />
              <div>
                <h3><span className="file-extension">.pdf</span> Folha para assinar</h3>
                <p>Em <strong>Folha oficial</strong>, use <strong>Imprimir / salvar PDF</strong> para gerar o documento de assinatura. O PDF não permite restaurar as atividades no sistema.</p>
              </div>
            </div>
            <p className="file-guide-tip">Ao terminar o mês, guarde os dois: o PDF para assinatura e o JSON para manter uma cópia editável.</p>
          </aside>
        </div>
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
