"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export function SheetPreview({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(false);
  const region = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0, viewport: 0 });

  useEffect(() => {
    const view = region.current;
    const sheet = paper.current;
    if (!view || !sheet) return;
    const measure = () => setSize({
      width: sheet.offsetWidth,
      height: sheet.offsetHeight,
      viewport: view.clientWidth,
    });
    const observer = new ResizeObserver(measure);
    observer.observe(view);
    observer.observe(sheet);
    measure();
    return () => observer.disconnect();
  }, []);

  const fitted = size.width ? Math.min(1, size.viewport / size.width) : 1;
  const scale = zoom ? Math.max(1, fitted * 1.25) : fitted;

  return (
    <section className="sheet-preview" aria-label="Prévia da folha">
      <button type="button" className="secondary-button sheet-zoom" aria-pressed={zoom} onClick={() => {
        if (region.current) region.current.scrollLeft = 0;
        setZoom(!zoom);
      }}>
        {zoom ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
        {zoom ? "Ajustar à tela" : "Ampliar prévia"}
      </button>
      <div ref={region} className="sheet-paper-viewport" data-zoom={zoom} tabIndex={zoom ? 0 : undefined} role={zoom ? "region" : undefined} aria-label={zoom ? "Prévia ampliada" : undefined}>
        <div className="sheet-paper-frame" style={size.width ? {
          width: size.width * scale,
          height: Math.ceil(size.height * scale),
        } : undefined}>
          <div ref={paper} className="sheet-paper-document" style={{ transform: `scale(${scale})` }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
