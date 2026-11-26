"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export function SheetPreview({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const document = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useEffect(() => {
    const view = region.current;
    const paper = document.current;
    if (!view || !paper) return;
    const measure = () => {
      const scale = Math.min(1, view.clientWidth / paper.offsetWidth);
      setFit({ scale, height: Math.ceil(paper.offsetHeight * scale) });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(view);
    observer.observe(paper);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <section className="sheet-preview" aria-label="Prévia da folha">
      <button type="button" className="secondary-button sheet-zoom" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>
        {zoom ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        {zoom ? "Ajustar à tela" : "Ampliar prévia"}
      </button>
      <div ref={region} className="sheet-paper-viewport" tabIndex={zoom ? 0 : undefined} aria-label={zoom ? "Folha ampliada, deslize para ver o restante" : undefined}>
        <div className="sheet-paper-frame" style={zoom || !fit.height ? undefined : { height: fit.height }}>
          <div ref={document} className="sheet-paper-document" style={zoom ? undefined : { transform: `scale(${fit.scale})` }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
