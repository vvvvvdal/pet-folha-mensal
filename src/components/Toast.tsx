"use client";
import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
export function Toast({ message, onClose, onUndo }: { message: string; onClose: () => void; onUndo?: () => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remaining = useRef(5000);
  const started = useRef(0);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  function resume() {
    if (timer.current) return;
    started.current = Date.now();
    timer.current = setTimeout(() => close.current(), remaining.current);
  }
  function pause() {
    if (!timer.current) return;
    clearTimeout(timer.current); timer.current = null;
    remaining.current = Math.max(0, remaining.current - (Date.now() - started.current));
  }
  useEffect(() => {
    remaining.current = 5000; started.current = Date.now();
    timer.current = setTimeout(() => close.current(), 5000);
    return () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  }, [message]);
  return <div role="status" className="pet-toast" tabIndex={0} onFocus={pause} onBlur={resume} onMouseEnter={pause} onMouseLeave={(event) => { if (!event.currentTarget.contains(document.activeElement)) resume(); }}><CheckCircle2 size={20} aria-hidden="true" /><span>{message}</span>{onUndo && <button type="button" onClick={onUndo}>Desfazer</button>}</div>;
}
