"use client";

import { useRef, useState, type DragEvent, type FormEvent } from "react";
import {
  ArrowRight,
  FolderOpen,
  HelpCircle,
  LockKeyhole,
  Moon,
  Settings2,
  Sun,
  Upload,
  UserPlus,
} from "lucide-react";
import { UserRole, GATInfo } from "@/types";
import { useTheme } from "@/lib/theme";
import { useDialog } from "@/context/DialogContext";
import { Brand } from "./Brand";
import { FAQ, HelpModal } from "./Help";
import { SiteFooter } from "./SiteFooter";
import { SystemPreview } from "./SystemPreview";

interface LandingPageProps {
  onLoginWithJson: (file: File) => void;
  onCreateProfile: (name: string, gatNumber: string, role: UserRole) => void;
  gats: Record<string, GATInfo>;
  roles: string[];
  onOpenAdmin: () => void;
  onOpenFeedback: () => void;
}

export function LandingPage({
  onLoginWithJson,
  onCreateProfile,
  gats,
  roles,
  onOpenAdmin,
  onOpenFeedback,
}: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const { alert } = useDialog();
  const [tab, setTab] = useState<"upload" | "create">("create");
  const [name, setName] = useState("");
  const [selectedGat, setSelectedGat] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const gat = selectedGat || Object.keys(gats)[0] || "";
  const role = selectedRole || roles[0] || "";

  async function openFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      await alert({
        title: "Escolha uma cópia de segurança",
        message:
          "Selecione o arquivo .json salvo pelo sistema. O PDF é usado para impressão e assinatura.",
        variant: "warning",
      });
      return;
    }
    onLoginWithJson(file);
  }

  function createProfile(event: FormEvent) {
    event.preventDefault();
    if (name.trim() && gat && role) onCreateProfile(name.trim(), gat, role);
  }

  function dropFile(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    void openFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="entry-page screen-only">
      <a href="#acesso" className="skip-link">
        Pular para o acesso
      </a>
      <header className="entry-header">
        <div className="entry-header-inner">
          <Brand />
          <nav aria-label="Navegação principal">
            <a className="header-preview" href="#previa">
              Prévia
            </a>
            <button
              className="icon-button"
              onClick={() => setHelpOpen(true)}
              aria-label="Abrir ajuda"
            >
              <HelpCircle size={19} />
            </button>
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
              }
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button
              className="icon-button"
              onClick={onOpenAdmin}
              aria-label="Abrir configurações locais"
            >
              <Settings2 size={19} />
            </button>
          </nav>
        </div>
      </header>
      <main className="entry-main">
        <section className="entry-hero" aria-labelledby="entry-title">
          <div className="entry-intro">
            <h1 id="entry-title">Folha de frequência</h1>
            <p className="entry-description">
              Registre atividades e gere sua folha mensal.
            </p>
          </div>
          <section
            id="acesso"
            className="access-card"
            aria-label="Criar ou restaurar folha"
          >
            <div
              className="access-tabs"
              role="group"
              aria-label="Como deseja começar"
            >
              <button
                type="button"
                aria-pressed={tab === "create"}
                className={tab === "create" ? "selected" : ""}
                onClick={() => setTab("create")}
              >
                <UserPlus size={16} />
                Criar minha folha
              </button>
              <button
                type="button"
                aria-pressed={tab === "upload"}
                className={tab === "upload" ? "selected" : ""}
                onClick={() => setTab("upload")}
              >
                <FolderOpen size={16} />
                Restaurar minha folha
              </button>
            </div>
            {tab === "create" ? (
              <form
                onSubmit={createProfile}
                className="access-form animate-fade-in"
              >
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
                  />
                </div>
                <div className="access-field-row">
                  <div className="field">
                    <label htmlFor="entry-role">Função no PET</label>
                    <select
                      id="entry-role"
                      value={role}
                      onChange={(event) => setSelectedRole(event.target.value)}
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
                      onChange={(event) => setSelectedGat(event.target.value)}
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
                  Criar minha folha
                  <ArrowRight size={17} />
                </button>
              </form>
            ) : (
              <div className="animate-fade-in">
                <div
                  className={
                    isDragging ? "upload-zone dragging" : "upload-zone"
                  }
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(event) => {
                    if (
                      !event.currentTarget.contains(event.relatedTarget as Node)
                    )
                      setIsDragging(false);
                  }}
                  onDrop={dropFile}
                >
                  <span className="upload-icon">
                    <Upload size={25} />
                  </span>
                  <h3>Restaurar cópia de segurança</h3>
                  <p>Selecione ou arraste seu arquivo .json.</p>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => fileRef.current?.click()}
                  >
                    Selecionar cópia <ArrowRight size={16} />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    aria-label="Cópia de segurança da folha"
                    onChange={(event) => {
                      void openFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>
            )}
            <div className="access-privacy">
              <LockKeyhole size={16} />
              <p>
                Os dados ficam neste navegador. Salve uma cópia de segurança.
              </p>
            </div>
          </section>
        </section>

        <SystemPreview />
        <section
          className="faq-section"
          id="perguntas"
          aria-labelledby="faq-title"
        >
          <h2 id="faq-title">Perguntas frequentes</h2>
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
