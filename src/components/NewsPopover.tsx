"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { RELEASES } from "@/lib/releases";
import { ReleaseNotes } from "./ReleaseNotes";

const KEY = "pet_folha_last_seen_release";
const releaseKey = (release: typeof RELEASES[number]) => `${release.date} ${release.title}`;

export function NewsPopover({ id, variant = "app" }: { id?: string; variant?: "entry" | "app" }) {
  const generatedId = useId();
  const panelId = id || `news-${generatedId}`;
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<string | null>(releaseKey(RELEASES[0]));
  const [sessionSeen, setSessionSeen] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      try { setSeen(localStorage.getItem(KEY)); } catch { setSeen(null); }
    };
    update();
    window.addEventListener("pet-news-seen", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("pet-news-seen", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  const unseenCount = (marker: string | null) => {
    const index = RELEASES.findIndex((release) => releaseKey(release) === marker);
    if (index >= 0) return index;
    return marker ? RELEASES.filter((release) => release.date > marker.slice(0, 10)).length : RELEASES.length;
  };
  const position = () => {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect || !panel.current) return;
    panel.current.style.setProperty("--news-top", `${rect.bottom + 12}px`);
    panel.current.style.setProperty("--news-right", `${Math.max(12, window.innerWidth - rect.right)}px`);
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
  return <div className={`news-anchor news-${variant}`}>
    <button ref={trigger} type="button" className="icon-button news-button" popoverTarget={panelId}
      aria-expanded={open} aria-controls={panelId} aria-label={open ? "Fechar novidades" : "Novidades"}
      title="Novidades" onClick={position}>
      <Bell size={20} aria-hidden="true" />
      {unseenCount(seen) > 0 && <span className="news-dot" aria-label="Atualização disponível" />}
    </button>
    <div ref={panel} id={panelId} popover="auto" role="region" aria-label="Novidades" className="news-popover"
      onBeforeToggle={(event) => {
        if (event.newState === "open") {
          position();
          setSessionSeen(seen);
        }
      }}
      onToggle={(event) => {
        const next = event.newState === "open";
        setOpen(next);
        if (next) {
          const latest = releaseKey(RELEASES[0]);
          setSeen(latest);
          try { localStorage.setItem(KEY, latest); } catch { /* Readable without storage. */ }
          window.dispatchEvent(new Event("pet-news-seen"));
        } else if (document.activeElement === document.body || panel.current?.contains(document.activeElement)) {
          trigger.current?.focus();
        }
      }}>
      <header><h2>Novidades</h2><p>{unseenCount(sessionSeen) ? `${unseenCount(sessionSeen)} novas desde a sua última visita` : "Você está em dia com as atualizações."}</p></header>
      <div className="news-scroll"><ReleaseNotes variant="popover" unreadCount={unseenCount(sessionSeen)} /></div>
    </div>
  </div>;
}
