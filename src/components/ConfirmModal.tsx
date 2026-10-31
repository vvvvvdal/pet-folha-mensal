"use client";

import { Modal } from "./Modal";
import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isDestructive = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} label={title}>
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-[var(--page-shadow)] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? "bg-red-500/10 text-danger border border-red-500/20"
                  : "bg-amber-500/10 text-warning border border-amber-500/20"
              }`}
            >
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">{title}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar confirmação"
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-raised cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-line hover:bg-raised text-body text-xs font-semibold cursor-pointer transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer transition-all shadow-[var(--page-shadow)] ${
              isDestructive
                ? "bg-red-600 hover:bg-red-500 shadow-red-600/20"
                : "text-white cursor-pointer transition-all shadow-[var(--page-shadow)]"
            }`}
            style={
              isDestructive
                ? {}
                : {
                    backgroundColor: "var(--primary)",
                    boxShadow: "var(--page-shadow)",
                  }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
