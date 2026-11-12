"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImageOff, Maximize2 } from "lucide-react";
import { canvasToBlob, loadImage, type Attachment } from "@/lib/attachments";

const previews = new WeakMap<Blob, Promise<Blob>>();
function thumbnail(file: Blob) {
  let pending = previews.get(file);
  if (!pending) {
    pending = file.type === "application/pdf"
      ? import("@/lib/attachment-pdf").then(({ renderPdfThumbnail }) => renderPdfThumbnail(file))
      : (async () => {
        const original = URL.createObjectURL(file);
        const canvas = document.createElement("canvas");
        try {
          const image = await loadImage(original);
          const scale = Math.min(1, 320 / Math.max(image.naturalWidth, image.naturalHeight));
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Prévia indisponível.");
          context.fillStyle = "white";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          return await canvasToBlob(canvas);
        } finally {
          URL.revokeObjectURL(original);
          canvas.width = 0;
          canvas.height = 0;
        }
      })();
    previews.set(file, pending);
    pending.catch(() => previews.delete(file));
  }
  return pending;
}

export function openAttachment(file: Blob) {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function AttachmentPreview({ item }: { item: Attachment }) {
  const root = useRef<HTMLButtonElement>(null);
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let current = true;
    let url = "";
    const load = () => {
      void thumbnail(item.file).then((blob) => {
        if (!current) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      }).catch(() => { if (current) setFailed(true); });
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { observer?.disconnect(); load(); }
    }, { rootMargin: "160px" });
    if (observer && root.current) observer.observe(root.current);
    else load();
    return () => { current = false; observer?.disconnect(); if (url) URL.revokeObjectURL(url); };
  }, [item.file]);
  return <button ref={root} type="button" className="attachment-preview" aria-label={`Visualizar ${item.name} em outra aba`} onClick={() => openAttachment(item.file)}>
    {src ? /* eslint-disable-next-line @next/next/no-img-element -- Locally generated Blob thumbnail. */
      <img src={src} alt={`Prévia de ${item.name}`} /> : failed ? <ImageOff size={28} aria-hidden="true" /> : <FileText size={28} aria-hidden="true" />}
    <span className="preview-zoom"><Maximize2 size={14} aria-hidden="true" />Ampliar</span>
    {item.file.type === "application/pdf" && <span className="preview-page">1/{item.pages}</span>}
    {failed && <span className="preview-unavailable">Abrir arquivo</span>}
  </button>;
}
