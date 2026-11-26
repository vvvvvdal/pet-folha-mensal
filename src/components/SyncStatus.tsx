"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CloudAlert, CloudCheck, CloudOff, RefreshCw } from "lucide-react";
import type { DriveSync } from "@/lib/use-drive-sync";
import { GOOGLE_LOGIN_URL } from "@/lib/google-session";
import { InlineSpinner } from "./LoadingStates";
import "./google-sync.css";

function relative(iso: string | undefined, now: number) {
  if (!iso) return "";
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Replaces "Salvar cópia" in the top bar when the account syncs with Google Drive. */
export function SyncStatus({ sync }: { sync: Pick<DriveSync, "status" | "pending" | "lastSynced" | "error" | "flush"> }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const { status, pending, lastSynced } = sync;

  if (status === "reauth")
    return (
      <span className="sync-status" data-state="reauth">
        <span className="sync-status-text">Cópia no Drive parada</span>
        <a className="secondary-button sync-reconnect" href={GOOGLE_LOGIN_URL}>Reconectar ao Google</a>
      </span>
    );

  const labels: Record<string, { icon: ReactNode; text: string }> = {
    syncing: { icon: <InlineSpinner size={18} />, text: "Enviando para o Drive…" },
    pending: { icon: <InlineSpinner size={18} />, text: pending ? "Alterações aguardando envio" : "Enviando para o Drive…" },
    offline: { icon: <CloudOff size={18} aria-hidden="true" />, text: pending ? `Sem conexão · ${pending} ${pending === 1 ? "mês vai" : "meses vão"} quando voltar` : "Sem conexão" },
    error: { icon: <CloudAlert size={18} aria-hidden="true" />, text: "Falha ao enviar" },
    saved: { icon: <CloudCheck size={18} aria-hidden="true" />, text: `Salvo no Drive${lastSynced ? ` · ${relative(lastSynced, now)}` : ""}` },
    idle: { icon: <CloudCheck size={18} aria-hidden="true" />, text: lastSynced ? `Salvo no Drive · ${relative(lastSynced, now)}` : "Google Drive conectado" },
  };
  const { icon, text } = labels[status] ?? labels.idle;
  return (
    <span className="sync-status" data-state={status} role="status" title={status === "error" ? sync.error : undefined}>
      {icon}
      <span className="sync-status-text">{text}</span>
      {status === "error" && (
        <button type="button" className="sync-retry" aria-label="Tentar enviar de novo" onClick={() => void sync.flush()}>
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
