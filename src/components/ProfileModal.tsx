"use client";

import { Modal } from "./Modal";
import React, { useState, useEffect } from "react";
import { UserProfile, UserRole, GATInfo } from "@/types";
import { normalizeName } from "@/lib/storage";
import { X, Check } from "lucide-react";
import { useDialog } from "@/context/DialogContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  googleEmail?: string;
  allProfiles: UserProfile[];
  gats: Record<string, GATInfo>;
  roles: string[];
  onSaveProfile: (updated: UserProfile) => boolean | void;
}

export function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  googleEmail,
  allProfiles,
  gats,
  roles,
  onSaveProfile,
}: ProfileModalProps) {
  const { alert } = useDialog();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email ?? "");
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [gatNumber, setGatNumber] = useState(currentUser.gatNumber);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Opening the profile editor must discard a previously cancelled draft.
      setName(currentUser.name);
      setEmail(currentUser.email ?? "");
      setRole(currentUser.role);
      setGatNumber(currentUser.gatNumber);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Checar duplicata com outro participante existente
    const normalizedNew = normalizeName(name);
    if (
      allProfiles.some(
        (p) =>
          p.id !== currentUser.id && normalizeName(p.name) === normalizedNew,
      )
    ) {
      await alert({
        title: "Nome já cadastrado",
        message: `Já existe outro participante cadastrado com o nome "${name.trim()}".`,
        variant: "warning",
      });
      return;
    }

    const gatInfo = gats[gatNumber];
    const saved = onSaveProfile({
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      role,
      gatNumber,
      gatName: gatInfo?.name || `GAT ${gatNumber}`,
    });
    if (saved !== false) onClose();
    else
      await alert({
        title: "Identificação não salva",
        message:
          "Não foi possível gravar. O preenchimento foi mantido. Verifique o armazenamento do navegador e tente novamente.",
        variant: "warning",
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Identificação do participante" variant="editor">
      <form onSubmit={handleSave} className="editor-panel editor-narrow">
        <header className="editor-head">
          <div>
            <h2>Identificação do participante</h2>
            <p>Dados usados na folha e nos relatórios.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="editor-body editor-fields">
          <div className="field">
            <label htmlFor="profilemodal-field-1">Nome completo</label>
            <input id="profilemodal-field-1" type="text" required value={name}
              onChange={(event) => setName(event.target.value)} />
          </div>
          {googleEmail && <p className="field-hint">Conta Google para login e Drive <strong>{googleEmail}</strong></p>}
          <div className="field">
            <label htmlFor="profile-email">{googleEmail ? "E-mail dos relatórios" : "E-mail para o formulário (opcional)"}</label>
            <input id="profile-email" type="email" autoComplete="email" value={email}
              placeholder={googleEmail} aria-describedby={googleEmail ? "profile-email-hint" : undefined}
              onChange={(event) => setEmail(event.target.value)} />
            {googleEmail && <p id="profile-email-hint" className="field-hint">Deixe em branco para usar o e-mail da conta Google nos relatórios.</p>}
          </div>
          <div className="pair-fields">
            <div className="field">
              <label htmlFor="profilemodal-field-2">Grupo tutorial (GAT)</label>
              <select id="profilemodal-field-2" value={gatNumber}
                onChange={(event) => setGatNumber(event.target.value)}>
                {Object.entries(gats).map(([number, info]) => (
                  <option key={number} value={number}>GAT {number} ({info.name})</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="profilemodal-field-3">Função no PET</label>
              <select id="profilemodal-field-3" value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}>
                {roles.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>
          <p className="field-hint">{googleEmail ? "As alterações são sincronizadas com a pasta PET Folha do seu Drive." : "Seus dados ficam salvos neste navegador."}</p>
        </div>
        <footer className="editor-foot">
          <div className="editor-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary-button"><Check size={18} aria-hidden="true" /> Salvar Alterações</button>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
