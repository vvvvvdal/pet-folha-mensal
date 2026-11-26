"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown, FileText, Image as ImageIcon } from "lucide-react";
import "./attachments-ui.css";

export type AttachmentSource = "gallery" | "files";

export function AttachmentSourceMenu({
  label,
  ariaLabel,
  disabled,
  triggerClassName = "secondary-button",
  dataHas,
  leadingIcon,
  onChoose,
}: {
  label: string;
  ariaLabel?: string;
  disabled: boolean;
  triggerClassName?: string;
  dataHas?: "true" | "false";
  leadingIcon?: ReactNode;
  onChoose: (source: AttachmentSource) => void;
}) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const position = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    const panel = panelRef.current;
    if (!rect || !panel) return;
    const menuWidth = Math.min(320, window.innerWidth - 24);
    const preferRight = rect.left + menuWidth > window.innerWidth - 12 || rect.left > window.innerWidth / 2;
    const rawLeft = preferRight ? rect.right - menuWidth : rect.left;
    const left = Math.max(12, Math.min(rawLeft, window.innerWidth - menuWidth - 12));
    const estimatedHeight = 168;
    const openAbove = rect.bottom + estimatedHeight + 16 > window.innerHeight && rect.top > estimatedHeight + 16;
    panel.style.width = `${menuWidth}px`;
    panel.style.left = `${left}px`;
    panel.style.right = "auto";
    if (openAbove) {
      panel.style.top = "auto";
      panel.style.bottom = `${Math.max(12, window.innerHeight - rect.top + 8)}px`;
    } else {
      panel.style.bottom = "auto";
      panel.style.top = `${Math.max(12, rect.bottom + 8)}px`;
    }
  };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open]);

  function selectSource(source: AttachmentSource) {
    panelRef.current?.hidePopover();
    onChoose(source);
  }

  return (
    <div className="attachment-source-anchor">
      <button
        ref={triggerRef}
        type="button"
        className={`${triggerClassName} attachment-source-trigger`}
        data-has={dataHas}
        popoverTarget={menuId}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={position}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            position();
            panelRef.current?.showPopover();
            requestAnimationFrame(() => {
              const items = panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
              if (!items?.length) return;
              items[event.key === "ArrowUp" ? items.length - 1 : 0]?.focus();
            });
          }
        }}
      >
        {leadingIcon}
        <span>{label}</span>
        <ChevronDown size={15} className="attachment-source-chevron" aria-hidden="true" />
      </button>
      <div
        ref={panelRef}
        id={menuId}
        popover="auto"
        role="menu"
        aria-label="Origem do comprovante"
        className="attachment-source-popover"
        onBeforeToggle={(event) => {
          if (event.newState === "open") position();
        }}
        onToggle={(event) => {
          const next = event.newState === "open";
          setOpen(next);
          if (!next && (document.activeElement === document.body || panelRef.current?.contains(document.activeElement))) {
            triggerRef.current?.focus();
          }
        }}
        onKeyDown={(event) => {
          const items = Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
          const index = items.indexOf(document.activeElement as HTMLButtonElement);
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
          }
          if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            items[event.key === "Home" ? 0 : items.length - 1]?.focus();
          }
          if (event.key === "Escape") {
            event.stopPropagation();
            panelRef.current?.hidePopover();
            triggerRef.current?.focus();
          }
        }}
      >
        <button type="button" role="menuitem" onClick={() => selectSource("gallery")}>
          <ImageIcon size={20} aria-hidden="true" />
          <span>
            <strong>Fotos da galeria</strong>
            <small>Imagens e capturas do aparelho.</small>
          </span>
        </button>
        <button type="button" role="menuitem" onClick={() => selectSource("files")}>
          <FileText size={20} aria-hidden="true" />
          <span>
            <strong>PDF ou arquivos</strong>
            <small>Documentos PDF, pastas ou Drive.</small>
          </span>
        </button>
      </div>
    </div>
  );
}
