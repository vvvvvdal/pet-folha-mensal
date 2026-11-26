"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { UserProfile } from "@/types";
import { FolderOpen, Download, FileText, CircleHelp, ListChecks, Settings2, Upload, ChevronDown, ChevronUp, Paperclip, User, LogOut, ArrowLeft, ChevronRight } from "lucide-react";
import { Brand } from "./Brand";
import { NewsPopover } from "./NewsPopover";
import { ThemeSelector } from "./ThemeSelector";
import "./navigation-refinement.css";

export type WorkspaceTab = "dashboard" | "official" | "attachments" | "account";
interface NavbarProps {
  user: UserProfile;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onOpenProfileModal: () => void;
  hasChanges: boolean;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onOpenAdmin: () => void;
  onOpenExitModal: () => void;
  onOpenFeedback: () => void;
  onOpenHelp: () => void;
  onOpenSheets: () => void;
  /** Google Drive mode: the sync status replaces the manual copy buttons in the top bar. */
  cloud?: { status: ReactNode; folderUrl: string; email?: string };
}
export function initials(name: string) { return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
export function Navbar(props: NavbarProps) {
  const { user, activeTab, onTabChange, onOpenProfileModal, hasChanges, onExportBackup, onImportBackup, onOpenAdmin, onOpenExitModal, onOpenHelp, onOpenSheets, cloud } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLButtonElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const backupRef = useRef<HTMLDivElement>(null);
  function positionProfileMenu() {
    const trigger = profileRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const rect = trigger.getBoundingClientRect();
    menu.style.setProperty("--profile-bottom", `${Math.max(8, window.innerHeight - rect.top + 8)}px`);
    menu.style.setProperty("--profile-max-height", `${Math.max(80, rect.top - 16)}px`);
  }
  useEffect(() => {
    if (!profileOpen) return;
    window.addEventListener("scroll", positionProfileMenu, true);
    window.addEventListener("resize", positionProfileMenu);
    return () => {
      window.removeEventListener("scroll", positionProfileMenu, true);
      window.removeEventListener("resize", positionProfileMenu);
    };
  }, [profileOpen]);
  function menuAction(action: () => void) { menuRef.current?.hidePopover(); action(); }
  const tabs = [{value: "dashboard", label: "Frequência", Icon: ListChecks}, {value: "official", label: "Folha", Icon: FileText}, {value: "attachments", label: "Comprovantes", Icon: Paperclip}] as const;
  return <>
    <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <aside className="app-sidebar" aria-label="Navegação principal"><div className="sidebar-inner">
      <Brand />
      <p className="sidebar-group">GAT {user.gatNumber} · {user.gatName}</p>
      <nav className="app-tabs" aria-label="Seções da folha">{tabs.map(({value, label, Icon}) =>
        <button key={value} aria-pressed={activeTab === value} onClick={() => onTabChange(value)}><Icon size={20} aria-hidden="true" />{label}</button>)}</nav>
      <div className="sidebar-profile">
        <button ref={profileRef} className="profile-trigger" popoverTarget="profile-menu" aria-expanded={profileOpen} aria-haspopup="menu" onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); menuRef.current?.showPopover();
            requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
          }
        }}><span className="avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.role} · GAT {user.gatNumber}</small></span><ChevronUp size={18} className="profile-chevron" aria-hidden="true" /></button>
        <div ref={menuRef} id="profile-menu" popover="auto" className="profile-popover" onBeforeToggle={(event) => { if (event.newState === "open") positionProfileMenu(); }} onToggle={(event) => setProfileOpen(event.newState === "open")} onKeyDown={(event) => {
          const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('button') || []);
          const index = items.indexOf(document.activeElement as HTMLButtonElement);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus(); }
          if (event.key === "Home" || event.key === "End") { event.preventDefault(); items[event.key === "Home" ? 0 : items.length - 1]?.focus(); }
          if (event.key === "Escape") { menuRef.current?.hidePopover(); profileRef.current?.focus(); }
        }}>
          <div className="profile-identity"><span className="avatar">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{cloud?.email || user.email || `${user.role} · GAT ${user.gatNumber}`}</small></div></div>
          <div role="menu" aria-label="Perfil"><button role="menuitem" onClick={() => menuAction(onOpenProfileModal)}><User size={18} />Meu perfil</button><button role="menuitem" onClick={() => menuAction(onOpenSheets)}><FileText size={18} />Minhas folhas</button></div>
          {cloud && <div role="menu" aria-label="Cópia no Google Drive"><button role="menuitem" onClick={() => menuAction(() => window.open(cloud.folderUrl, "_blank", "noopener"))}><FolderOpen size={18} />Abrir pasta PET Folha no Drive</button><button role="menuitem" onClick={() => menuAction(onExportBackup)}><Download size={18} />Baixar cópia .json</button><button role="menuitem" onClick={() => menuAction(() => fileRef.current?.click())}><Upload size={18} />Importar cópia .json</button></div>}
          <div className="profile-theme"><p>Tema</p><ThemeSelector /></div>
          <div role="menu" aria-label="Suporte e saída"><button role="menuitem" onClick={() => menuAction(onOpenHelp)}><CircleHelp size={18} />Ajuda e suporte</button><button role="menuitem" onClick={() => menuAction(onOpenAdmin)}><Settings2 size={18} />Configurações</button><button role="menuitem" onClick={() => menuAction(onOpenExitModal)}><LogOut size={18} />Sair</button></div>
        </div>
      </div>
    </div></aside>
    <header className="app-topbar"><div className="mobile-brand"><Brand /></div><div className="app-top-actions">{cloud ? cloud.status : <><button className="secondary-button top-restore" onClick={() => fileRef.current?.click()}><Upload size={18} aria-hidden="true" />Restaurar cópia</button><button className="secondary-button top-save" onClick={onExportBackup}><Download size={18} aria-hidden="true" /><span>Salvar cópia</span>{hasChanges && <span className="change-indicator" aria-label="Alterações sem cópia" />}</button><button type="button" className="secondary-button mobile-copy" popoverTarget="mobile-backup-menu" aria-expanded={backupOpen} aria-controls="mobile-backup-menu"><Download size={18} aria-hidden="true" />Cópia<ChevronDown size={16} aria-hidden="true" />{hasChanges && <span className="change-indicator" aria-label="Alterações sem cópia" />}</button>
      <div ref={backupRef} id="mobile-backup-menu" popover="auto" className="backup-popover" role="region" aria-label="Cópia de segurança" onToggle={(event) => setBackupOpen(event.newState === "open")}>
        <h2>Cópia de segurança</h2>
        <button type="button" onClick={() => { backupRef.current?.hidePopover(); onExportBackup(); }}><Download size={22} aria-hidden="true" /><span><strong>Salvar cópia</strong><small>Baixar seus registros e comprovantes.</small></span></button>
        <button type="button" onClick={() => { backupRef.current?.hidePopover(); fileRef.current?.click(); }}><Upload size={22} aria-hidden="true" /><span><strong>Restaurar cópia</strong><small>Abrir uma cópia salva em arquivo.</small></span></button>
      </div></>}<NewsPopover /><button className="avatar mobile-avatar" aria-label="Abrir Conta" onClick={() => onTabChange("account")}>{initials(user.name)}</button></div></header>
    <nav className="mobile-tabbar" aria-label="Seções da folha no celular">{tabs.map(({value, label, Icon}) => <button key={value} aria-pressed={activeTab === value} onClick={() => onTabChange(value)}><Icon size={22} aria-hidden="true" /><span>{label}</span></button>)}</nav>
    <input ref={fileRef} type="file" accept=".json,application/json" aria-label="Restaurar cópia de segurança" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onImportBackup(file); event.target.value = ""; }} />
  </>;
}

export function AccountScreen({ user, googleEmail, onBack, onProfile, onSheets, onHelp, onAdmin, onExit, onRestore, onDownload }: { user: UserProfile; googleEmail?: string; onBack: () => void; onProfile: () => void; onSheets: () => void; onHelp: () => void; onAdmin: () => void; onExit: () => void; onRestore: () => void; onDownload?: () => void }) {
  const accountEmail = googleEmail || user.email;
  return <section className="account-screen"><header><button className="icon-button" onClick={onBack} aria-label="Voltar à frequência"><ArrowLeft size={22} /></button><h1>Conta</h1></header><div className="account-card profile-identity"><span className="avatar">{initials(user.name)}</span><div><strong>{user.name}</strong>{accountEmail && <small>{accountEmail}</small>}<small>{user.role} · GAT {user.gatNumber} · {user.gatName}</small></div></div><div className="account-card">{[{label:"Meu perfil", Icon:User, action:onProfile}, {label:"Minhas folhas", Icon:FileText, action:onSheets}, ...(onDownload ? [{label:"Baixar cópia .json", Icon:Download, action:onDownload}] : []), {label: onDownload ? "Importar cópia .json" : "Restaurar cópia", Icon:Upload, action:onRestore}].map(({label,Icon,action}) => <button key={label} onClick={action}><Icon size={20}/>{label}<ChevronRight size={18}/></button>)}</div><div className="account-card account-theme"><h2>Tema</h2><ThemeSelector /></div><div className="account-card"><button onClick={onHelp}><CircleHelp size={20}/>Ajuda e suporte<ChevronRight size={18}/></button><button onClick={onAdmin}><Settings2 size={20}/>Configurações<ChevronRight size={18}/></button></div><button className="secondary-button account-exit" onClick={onExit}><LogOut size={20}/>Sair</button></section>;
}
