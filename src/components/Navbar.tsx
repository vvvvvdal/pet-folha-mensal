"use client";

import { useRef, useState } from "react";
import { UserProfile, GATS } from "@/types";
import { useTheme } from "@/lib/theme";
import {
  Download,
  FileText,
  HelpCircle,
  ListChecks,
  Moon,
  Settings2,
  Sun,
  Upload,
  ArrowRight,
  Bell,
  X,
} from "lucide-react";
import { Brand } from "./Brand";
import { Modal } from "./Modal";
import { ReleaseNotes } from "./ReleaseNotes";
import { RELEASES } from "@/lib/releases";

const LAST_SEEN_RELEASE_KEY = "pet_folha_last_seen_release";
const latestRelease = RELEASES[0].date + " " + RELEASES[0].title;

interface NavbarProps {
  user: UserProfile;
  activeTab: "dashboard" | "official";
  onTabChange: (tab: "dashboard" | "official") => void;
  onOpenProfileModal: () => void;
  hasChanges: boolean;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onOpenAdmin: () => void;
  onOpenExitModal: () => void;
  onOpenFeedback: () => void;
  onOpenHelp: () => void;
}

export function Navbar({
  user,
  activeTab,
  onTabChange,
  onOpenProfileModal,
  hasChanges,
  onExportBackup,
  onImportBackup,
  onOpenAdmin,
  onOpenExitModal,
  onOpenHelp,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [newsOpen, setNewsOpen] = useState(false);
  const [hasUnreadNews, setHasUnreadNews] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(LAST_SEEN_RELEASE_KEY) !== latestRelease;
    } catch {
      return false;
    }
  });

  function openNews() {
    setNewsOpen(true);
    setHasUnreadNews(false);
    try {
      localStorage.setItem(LAST_SEEN_RELEASE_KEY, latestRelease);
    } catch {
      // The news remains available when browser storage is disabled.
    }
  }
  return (
    <header className="workspace-nav">
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <div className="workspace-nav-top">
        <Brand />
        <button
          className="profile-button"
          onClick={onOpenProfileModal}
          title="Editar identificação"
        >
          <span aria-hidden="true">{user.gatNumber}</span>
          <span>
            <strong>{user.name}</strong>
            <small>
              {user.role} · GAT {user.gatNumber} ·{" "}
              {user.gatName || GATS[user.gatNumber]?.name || "PET"}
            </small>
          </span>
        </button>
        <div className="workspace-tools">
          <button type="button"
            className="icon-button news-button"
            onClick={openNews}
            aria-haspopup="dialog"
            aria-label={hasUnreadNews ? "Novidades, atualização disponível" : "Novidades"}
            title="Novidades"
          >
            <Bell size={20} aria-hidden="true" />
            {hasUnreadNews && <span className="news-dot" aria-hidden="true" />}
          </button>
          <button
            className="icon-button"
            onClick={onOpenHelp}
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
        </div>
      </div>
      {newsOpen && (
        <Modal isOpen label="Novidades" onClose={() => setNewsOpen(false)}>
          <div className="release-panel">
            <div className="release-panel-header">
              <h2>Novidades</h2>
              <button type="button" className="icon-button" aria-label="Fechar novidades" onClick={() => setNewsOpen(false)}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <ReleaseNotes inDialog />
          </div>
        </Modal>
      )}
      <div className="workspace-nav-bottom">
        <nav className="workspace-tabs" aria-label="Seções da folha">
          <button
            aria-pressed={activeTab === "dashboard"}
            onClick={() => onTabChange("dashboard")}
          >
            <ListChecks size={18} />
            Minha frequência
          </button>
          <button
            aria-pressed={activeTab === "official"}
            onClick={() => onTabChange("official")}
          >
            <FileText size={18} />
            Folha oficial
          </button>
        </nav>
        <div className="backup-tools" aria-label="Cópia de segurança">
          <button onClick={onExportBackup}>
            <Download size={17} />
            Salvar cópia
          </button>
          <button onClick={() => fileRef.current?.click()}>
            <Upload size={17} />
            Restaurar cópia
          </button>
          <button className="conclude-button" onClick={onOpenExitModal}>
            Concluir
            {hasChanges && (
              <span
                className="change-indicator"
                aria-label="Alterações nesta sessão"
              />
            )}
            <ArrowRight size={17} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            aria-label="Restaurar cópia de segurança"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportBackup(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>
    </header>
  );
}
