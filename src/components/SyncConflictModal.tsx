"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import type { SyncConflict } from "@/lib/use-drive-sync";
import { getMonthYearLabel } from "@/lib/pet-calculator";
import { Modal } from "./Modal";
import { InlineSpinner } from "./LoadingStates";
import "./google-sync.css";

interface Props {
  conflict: SyncConflict;
  local: { activities: number; hours: number };
  busy: boolean;
  onResolve: (keep: "device" | "drive") => void;
}

export function SyncConflictModal({ conflict, local, busy, onResolve }: Props) {
  const [keep, setKeep] = useState<"device" | "drive">("device");
  const month = getMonthYearLabel(conflict.monthKey);
  const remoteDate = new Date(conflict.remote.modifiedTime).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const options = [
    { value: "device" as const, title: "Este aparelho", detail: `${local.activities} ${local.activities === 1 ? "atividade" : "atividades"} · ${local.hours} h` },
    { value: "drive" as const, title: "Google Drive", detail: `Alterado em ${remoteDate} em outro aparelho` },
  ];
  return (
    <Modal isOpen label={`${month} mudou em dois lugares`} onClose={() => undefined}>
      <section className="sync-conflict">
        <header>
          <h2>{month} mudou em dois lugares</h2>
          <p>Você editou este mês aqui e em outro aparelho antes de sincronizar. Escolha qual versão continua.</p>
        </header>
        <fieldset disabled={busy}>
          <legend className="sr-only">Versão que continua</legend>
          {options.map((option) => (
            <label key={option.value} data-selected={keep === option.value}>
              <input type="radio" name="sync-conflict" value={option.value} checked={keep === option.value} onChange={() => setKeep(option.value)} />
              <span><strong>{option.title}</strong><small>{option.detail}</small></span>
            </label>
          ))}
        </fieldset>
        <p className="sync-conflict-note">
          <Info size={18} aria-hidden="true" />
          A outra versão não é apagada: fica na pasta PET Folha como uma cópia de conflito.
        </p>
        <footer>
          <button type="button" className="primary-button" disabled={busy} aria-busy={busy} onClick={() => onResolve(keep)}>
            {busy && <InlineSpinner size={18} />}
            {busy ? "Guardando as duas versões…" : keep === "device" ? "Continuar com este aparelho" : "Continuar com a do Drive"}
          </button>
        </footer>
      </section>
    </Modal>
  );
}
