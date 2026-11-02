"use client";

import { Modal } from "./Modal";
import React, { useState, useEffect } from "react";
import { UserProfile, UserRole, GATInfo } from "@/types";
import { normalizeName } from "@/lib/storage";
import { X, Check, User } from "lucide-react";
import { useDialog } from "@/context/DialogContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allProfiles: UserProfile[];
  gats: Record<string, GATInfo>;
  roles: string[];
  onSaveProfile: (updated: UserProfile) => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  allProfiles,
  gats,
  roles,
  onSaveProfile,
}: ProfileModalProps) {
  const { alert } = useDialog();
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [gatNumber, setGatNumber] = useState(currentUser.gatNumber);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Opening the profile editor must discard a previously cancelled draft.
      setName(currentUser.name);
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
        title: "Nome Duplicado",
        message: `Já existe outro participante cadastrado com o nome "${name.trim()}".`,
        variant: "warning",
      });
      return;
    }

    const gatInfo = gats[gatNumber];
    onSaveProfile({
      ...currentUser,
      name: name.trim(),
      role,
      gatNumber,
      gatName: gatInfo?.name || `GAT ${gatNumber}`,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      label="Identificação do participante"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-[var(--page-shadow)] transition-all max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-line mb-4">
          <div className="flex items-center gap-2">
            <User className="size-4.5" style={{ color: "#10B981" }} />
            <h3 className="text-sm sm:text-base font-bold text-ink">
              Identificação do Participante
            </h3>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg text-muted hover:text-ink hover:bg-raised flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="profilemodal-field-1"
              className="block text-xs sm:text-sm font-medium text-body mb-1.5"
            >
              Nome Completo
            </label>
            <input
              id="profilemodal-field-1"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm rounded-xl bg-canvas border border-line text-ink outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="profilemodal-field-2"
                className="block text-xs sm:text-sm font-medium text-body mb-1.5"
              >
                Grupo Tutorial (GAT)
              </label>
              <select
                id="profilemodal-field-2"
                value={gatNumber}
                onChange={(e) => setGatNumber(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2.5 text-base sm:text-xs rounded-xl bg-canvas border border-line text-ink outline-none focus:border-accent cursor-pointer transition-colors"
              >
                {Object.entries(gats).map(([num, info]) => (
                  <option key={num} value={num}>
                    GAT {num} ({info.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="profilemodal-field-3"
                className="block text-xs sm:text-sm font-medium text-body mb-1.5"
              >
                Função no SUS
              </label>
              <select
                id="profilemodal-field-3"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full min-h-[44px] px-3 py-2.5 text-base sm:text-xs rounded-xl bg-canvas border border-line text-ink outline-none focus:border-accent cursor-pointer transition-colors"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Seus dados são salvos exclusivamente no seu dispositivo (100% no
            navegador).
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none min-h-[44px] px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-line text-body hover:bg-raised cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-primary hover:bg-[var(--primary-hover)] cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-[var(--page-shadow)]"
            >
              <Check className="size-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
