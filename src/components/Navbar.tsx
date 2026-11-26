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
  googlePicture?: string;
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
  /** Google Drive mode groups file actions next to the sync status. */
  cloud?: { status: ReactNode; folderUrl: string };
}
export function initials(name: string) { return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
function ProfileAvatar({ name, picture }: { name: string; picture?: string }) {
  const [failed, setFailed] = useState<string>();
  return (
    <span className="avatar profile-avatar" aria-hidden="true">
      {picture && picture !== failed ? (
        // The Google avatar is loaded directly without exposing the page URL.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={picture} alt="" referrerPolicy="no-referrer" onError={() => setFailed(picture)} />
      ) : initials(name)}
    </span>
  );
}
export function Navbar(props: NavbarProps) {
  const { user, activeTab, onTabChange, onOpenProfileModal, hasChanges, onExportBackup, onImportBackup, onOpenAdmin, onOpenExitModal, onOpenHelp, cloud } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLButtonElement>(null);
  const sidebarTabsRef = useRef<HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const driveButtonRef = useRef<HTMLButtonElement>(null);
  const drivePanelRef = useRef<HTMLDivElement>(null);
  const [driveOpen, setDriveOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const backupRef = useRef<HTMLDivElement>(null);

  function positionProfileMenu() {
    const trigger = profileRef.current;
    const menu = menuRef.current;
    const tabs = sidebarTabsRef.current;
    if (!trigger || !menu || !tabs || !trigger.getClientRects().length) return false;
    const rect = trigger.getBoundingClientRect();
    const top = Math.max(12, tabs.getBoundingClientRect().bottom + 8);
    const bottom = Math.max(12, window.innerHeight - rect.top + 8);
    const availableHeight = window.innerHeight - top - bottom;
    if (availableHeight < 60) return false;
    menu.style.setProperty("--profile-left", `${rect.left}px`);
    menu.style.setProperty("--profile-width", `${rect.width}px`);
    menu.style.setProperty("--profile-bottom", `${bottom}px`);
    menu.style.setProperty("--profile-max-height", `${availableHeight}px`);
    return true;
  }

  function positionDrivePanel() {
    const trigger = driveButtonRef.current;
    const panel = drivePanelRef.current;
    if (!trigger || !panel) return;
    const rect = trigger.getBoundingClientRect();
    if (!rect.width || rect.bottom < 0) {
      panel.hidePopover();
      return;
    }
    panel.style.setProperty("--drive-top", `${Math.max(12, rect.bottom + 8)}px`);
    panel.style.setProperty("--drive-right", `${Math.max(12, window.innerWidth - rect.right)}px`);
  }

  useEffect(() => {
    if (!profileOpen && !driveOpen) return;
    const position = () => {
      if (profileOpen && !positionProfileMenu()) menuRef.current?.hidePopover();
      if (driveOpen) positionDrivePanel();
    };
    window.addEventListener("scroll", position, true);
    window.addEventListener("resize", position);
    return () => {
      window.removeEventListener("scroll", position, true);
      window.removeEventListener("resize", position);
    };
  }, [profileOpen, driveOpen]);

  function menuAction(action: () => void) { menuRef.current?.hidePopover(); action(); }
  function driveAction(action: () => void) { drivePanelRef.current?.hidePopover(); action(); }
  function chooseBackup() { fileRef.current?.click(); }

  const tabs = [{value: "dashboard", label: "Frequência", Icon: ListChecks}, {value: "official", label: "Folha", Icon: FileText}, {value: "attachments", label: "Comprovantes", Icon: Paperclip}] as const;
  const profileActions = [
    { label: "Meu perfil", Icon: User, action: onOpenProfileModal },
    { label: "Ajuda e suporte", Icon: CircleHelp, action: onOpenHelp },
    { label: "Configurações", Icon: Settings2, action: onOpenAdmin },
    { label: "Sair", Icon: LogOut, action: onOpenExitModal },
  ];
  return <>
    <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <aside className="app-sidebar" aria-label="Navegação principal"><div className="sidebar-inner">
      <Brand />
      <p className="sidebar-group">GAT {user.gatNumber} · {user.gatName}</p>
      <nav ref={sidebarTabsRef} className="app-tabs" aria-label="Seções da folha">{tabs.map(({value, label, Icon}) =>
        <button key={value} aria-pressed={activeTab === value} onClick={() => onTabChange(value)}><Icon size={20} aria-hidden="true" />{label}</button>)}</nav>
      <div className="sidebar-profile">
        <button ref={profileRef} className="profile-trigger" popoverTarget="profile-menu"
          aria-controls="profile-menu" aria-expanded={profileOpen} aria-haspopup="menu" onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); menuRef.current?.showPopover();
            const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
            if (items?.length) items[event.key === "ArrowUp" ? items.length - 1 : 0]?.focus();
          }
        }}><ProfileAvatar name={user.name} picture={props.googlePicture} /><span><strong>{user.name}</strong><small>{user.role} · GAT {user.gatNumber}</small></span><ChevronUp size={18} className="profile-chevron" aria-hidden="true" /></button>
        <div ref={menuRef} id="profile-menu" popover="auto" className="profile-popover"
          onBeforeToggle={(event) => {
            if (event.newState !== "open" || positionProfileMenu()) return;
            event.preventDefault();
            onTabChange("account");
          }}
          onToggle={(event) => {
            const open = event.newState === "open";
            setProfileOpen(open);
            if (open && document.activeElement === profileRef.current) menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
          }}
          onKeyDown={(event) => {
          if (event.key === "Escape") { menuRef.current?.hidePopover(); profileRef.current?.focus(); }
        }}>
          <div role="menu" aria-label="Ações do perfil" onKeyDown={(event) => {
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
            const index = items.indexOf(document.activeElement as HTMLButtonElement);
            if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus(); }
            if (event.key === "Home" || event.key === "End") { event.preventDefault(); items[event.key === "Home" ? 0 : items.length - 1]?.focus(); }
          }}>
            {profileActions.map(({ label, Icon, action }) => (
              <button key={label} type="button" role="menuitem" onClick={() => menuAction(action)}>
                <Icon size={18} aria-hidden="true" />{label}
              </button>
            ))}
          </div>
          <div className="profile-theme"><ThemeSelector /></div>
        </div>
      </div>
    </div></aside>
    <header className="app-topbar">
      <div className="mobile-brand"><Brand /></div>
      <div className="app-top-actions">
      {cloud ? <>
        {cloud.status}
        <button
          ref={driveButtonRef}
          type="button"
          className="secondary-button desktop-drive"
          popoverTarget="drive-menu"
          aria-expanded={driveOpen}
          aria-controls="drive-menu"
        >
          Drive<ChevronDown size={16} aria-hidden="true" />
        </button>
        <div
          ref={drivePanelRef}
          id="drive-menu"
          className="drive-popover"
          popover="auto"
          role="region"
          aria-label="Google Drive e cópias"
          onBeforeToggle={(event) => { if (event.newState === "open") positionDrivePanel(); }}
          onToggle={(event) => setDriveOpen(event.newState === "open")}
        >
          <a href={cloud.folderUrl} target="_blank" rel="noopener noreferrer" onClick={() => drivePanelRef.current?.hidePopover()}>
            <FolderOpen size={18} aria-hidden="true" />Abrir no Drive
          </a>
          <button type="button" onClick={() => driveAction(onExportBackup)}><Download size={18} aria-hidden="true" />Baixar cópia .json</button>
          <button type="button" onClick={() => driveAction(chooseBackup)}><Upload size={18} aria-hidden="true" />Importar cópia .json</button>
        </div>
      </> : <><button className="secondary-button top-restore" onClick={chooseBackup}><Upload size={18} aria-hidden="true" />Restaurar cópia</button><button className="secondary-button top-save" onClick={onExportBackup}><Download size={18} aria-hidden="true" /><span>Salvar cópia</span>{hasChanges && <span className="change-indicator" aria-label="Alterações sem cópia" />}</button><button type="button" className="secondary-button mobile-copy" popoverTarget="mobile-backup-menu" aria-expanded={backupOpen} aria-controls="mobile-backup-menu"><Download size={18} aria-hidden="true" />Cópia<ChevronDown size={16} aria-hidden="true" />{hasChanges && <span className="change-indicator" aria-label="Alterações sem cópia" />}</button>
      <div ref={backupRef} id="mobile-backup-menu" popover="auto" className="backup-popover" role="region" aria-label="Cópia de segurança" onToggle={(event) => setBackupOpen(event.newState === "open")}>
        <h2>Cópia de segurança</h2>
        <button type="button" onClick={() => { backupRef.current?.hidePopover(); onExportBackup(); }}><Download size={22} aria-hidden="true" /><span><strong>Salvar cópia</strong><small>Baixar seus registros e comprovantes.</small></span></button>
        <button type="button" onClick={() => { backupRef.current?.hidePopover(); chooseBackup(); }}><Upload size={22} aria-hidden="true" /><span><strong>Restaurar cópia</strong><small>Abrir uma cópia salva em arquivo.</small></span></button>
      </div></>}<NewsPopover /><button type="button" className="mobile-avatar mobile-account-trigger" aria-label="Abrir Conta" onClick={() => onTabChange("account")}><ProfileAvatar name={user.name} picture={props.googlePicture} /><ChevronDown size={14} aria-hidden="true" /></button></div></header>
    <nav className="mobile-tabbar" aria-label="Seções da folha no celular">{tabs.map(({value, label, Icon}) => <button key={value} aria-pressed={activeTab === value} onClick={() => onTabChange(value)}><Icon size={22} aria-hidden="true" /><span>{label}</span></button>)}</nav>
    <input ref={fileRef} type="file" accept=".json,application/json" aria-label="Restaurar cópia de segurança" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onImportBackup(file); event.target.value = ""; }} />
  </>;
}

export function AccountScreen({ user, googleEmail, googlePicture, onBack, onProfile, onHelp, onAdmin, onExit, onRestore, onDownload, onOpenDrive }: { user: UserProfile; googleEmail?: string; googlePicture?: string; onBack: () => void; onProfile: () => void; onHelp: () => void; onAdmin: () => void; onExit: () => void; onRestore: () => void; onDownload?: () => void; onOpenDrive?: () => void }) {
  const accountEmail = googleEmail || user.email;
  return <section className="account-screen"><header><button className="icon-button" onClick={onBack} aria-label="Voltar à frequência"><ArrowLeft size={22} /></button><h1>Conta</h1></header><div className="account-card profile-identity"><ProfileAvatar name={user.name} picture={googlePicture} /><div><strong>{user.name}</strong>{accountEmail && <small>{accountEmail}</small>}<small>{user.role} · GAT {user.gatNumber} · {user.gatName}</small></div></div><div className="account-card">{[{label:"Meu perfil", Icon:User, action:onProfile}, ...(onOpenDrive ? [{label:"Abrir no Google Drive", Icon:FolderOpen, action:onOpenDrive}] : []), ...(onDownload ? [{label:"Baixar cópia .json", Icon:Download, action:onDownload}] : []), {label: onDownload ? "Importar cópia .json" : "Restaurar cópia", Icon:Upload, action:onRestore}].map(({label,Icon,action}) => <button key={label} onClick={action}><Icon size={20}/>{label}<ChevronRight size={18}/></button>)}</div><div className="account-card account-theme"><h2>Tema</h2><ThemeSelector /></div><div className="account-card"><button onClick={onHelp}><CircleHelp size={20}/>Ajuda e suporte<ChevronRight size={18}/></button><button onClick={onAdmin}><Settings2 size={20}/>Configurações<ChevronRight size={18}/></button></div><button className="secondary-button account-exit" onClick={onExit}><LogOut size={20}/>Sair</button></section>;
}
