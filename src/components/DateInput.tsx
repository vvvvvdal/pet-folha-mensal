"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { Calendar } from "lucide-react";

type DateInputProps = Omit<ComponentPropsWithoutRef<"input">, "type">;

export function DateInput({ disabled, readOnly, ...props }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    try {
      input.showPicker();
    } catch {
      input.click();
    }
  }

  return (
    <div className="date-input">
      <input {...props} ref={inputRef} type="date" disabled={disabled} readOnly={readOnly} />
      <button
        type="button"
        className="date-input-trigger"
        aria-label="Abrir calendário"
        disabled={disabled || readOnly}
        onClick={openPicker}
      >
        <Calendar size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
