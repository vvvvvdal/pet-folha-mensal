'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2, Trash2, X } from 'lucide-react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
}

interface DialogState extends DialogOptions {
  isOpen: boolean;
  type: 'alert' | 'confirm';
}

interface DialogContextType {
  confirm: (options: DialogOptions | string) => Promise<boolean>;
  alert: (options: DialogOptions | string) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: 'alert',
    message: ''
  });

  const resolverRef = useRef<((value: any) => void) | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((options: DialogOptions | string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      if (typeof options === 'string') {
        const isDelete = options.toLowerCase().includes('excluir') || options.toLowerCase().includes('remover') || options.toLowerCase().includes('zerar');
        setDialog({
          isOpen: true,
          type: 'confirm',
          title: isDelete ? 'Confirmar Exclusão' : 'Confirmação',
          message: options,
          confirmText: isDelete ? 'Excluir' : 'Confirmar',
          cancelText: 'Cancelar',
          variant: isDelete ? 'danger' : 'warning'
        });
      } else {
        setDialog({
          isOpen: true,
          type: 'confirm',
          title: options.title || 'Confirmação',
          message: options.message,
          confirmText: options.confirmText || 'Confirmar',
          cancelText: options.cancelText || 'Cancelar',
          variant: options.variant || 'warning'
        });
      }
    });
  }, []);

  const alert = useCallback((options: DialogOptions | string): Promise<void> => {
    return new Promise<void>((resolve) => {
      resolverRef.current = resolve;
      if (typeof options === 'string') {
        const isError = options.toLowerCase().includes('erro') || options.toLowerCase().includes('inválid') || options.toLowerCase().includes('já existe') || options.toLowerCase().includes('já está');
        setDialog({
          isOpen: true,
          type: 'alert',
          title: isError ? 'Aviso' : 'Informação',
          message: options,
          confirmText: 'Entendido',
          variant: isError ? 'warning' : 'info'
        });
      } else {
        setDialog({
          isOpen: true,
          type: 'alert',
          title: options.title || 'Aviso',
          message: options.message,
          confirmText: options.confirmText || 'Entendido',
          variant: options.variant || 'warning'
        });
      }
    });
  }, []);

  const handleConfirm = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  // Suporte a teclado: Enter confirma, Esc cancela
  useEffect(() => {
    if (!dialog.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog.isOpen]);

  // Foco automático ao abrir
  useEffect(() => {
    if (dialog.isOpen) {
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);
    }
  }, [dialog.isOpen]);

  const renderIcon = () => {
    switch (dialog.variant) {
      case 'danger':
        return (
          <div className="size-11 rounded-2xl bg-[#DE3831]/10 text-[#DE3831] border border-[#DE3831]/20 flex items-center justify-center shrink-0">
            <Trash2 className="size-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>
        );
      case 'success':
        return (
          <div className="size-11 rounded-2xl bg-[#008D4C]/10 text-[#008D4C] dark:text-[#10B981] border border-[#008D4C]/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
        );
      default:
        return (
          <div className="size-11 rounded-2xl bg-[#00A3E0]/10 text-[#00A3E0] border border-[#00A3E0]/20 flex items-center justify-center shrink-0">
            <Info className="size-5" />
          </div>
        );
    }
  };

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      {dialog.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                {renderIcon()}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100">
                    {dialog.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer transition-colors"
                title="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Mensagem */}
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 whitespace-pre-line pl-1">
              {dialog.message}
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
              {dialog.type === 'confirm' && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  {dialog.cancelText || 'Cancelar'}
                </button>
              )}
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 text-white ${
                  dialog.variant === 'danger'
                    ? 'bg-[#DE3831] hover:bg-[#b82a24] shadow-md shadow-[#DE3831]/25'
                    : 'bg-[#008D4C] hover:bg-[#00733E] shadow-md shadow-[#008D4C]/25'
                }`}
              >
                <span>{dialog.confirmText || 'Confirmar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
