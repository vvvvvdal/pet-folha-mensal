"use client";

import { useRef } from "react";
import { UserProfile, GATS } from "@/types";
import { useTheme } from "@/lib/theme";
import {
  Download,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings2,
  Sun,
  Upload,
} from "lucide-react";
import { Brand } from "./Brand";

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
  const gat = user.gatName || GATS[user.gatNumber]?.name || "PET";
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
          <span>{user.gatNumber}</span>
          <span>
            <strong>{user.name}</strong>
            <small>
              {user.role} · GAT {user.gatNumber} · {gat}
            </small>
          </span>
        </button>
        <div className="workspace-tools">
          <button
            className="icon-button"
            onClick={onOpenHelp}
            aria-label="Abrir ajuda"
          >
            <HelpCircle size={18} />
          </button>
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
            }
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="icon-button"
            onClick={onOpenAdmin}
            aria-label="Abrir configurações locais"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>
      <div className="workspace-nav-bottom">
        <nav className="workspace-tabs" aria-label="Seções da folha">
          <button
            aria-pressed={activeTab === "dashboard"}
            onClick={() => onTabChange("dashboard")}
          >
            <LayoutDashboard size={16} />
            Lançamentos
          </button>
          <button
            aria-pressed={activeTab === "official"}
            onClick={() => onTabChange("official")}
          >
            <FileText size={16} />
            Folha oficial
          </button>
        </nav>
        <div className="backup-tools" aria-label="Cópia de segurança">
          <button onClick={onExportBackup}>
            <Download size={15} />
            Salvar cópia
          </button>
          <button onClick={() => fileRef.current?.click()}>
            <Upload size={15} />
            Restaurar cópia
          </button>
          <span className="h-4 border-l border-line mx-1" aria-hidden="true" />
          <button onClick={onOpenExitModal}>
            <LogOut size={15} />
            Concluir
            {hasChanges && (
              <span
                className="size-1.5 bg-warning rounded-full"
                aria-label="Alterações nesta sessão"
              />
            )}
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
