"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";

export type SheetPdfAction = "download" | "print";

export function SheetPdfResult({ file, action, onClose }: {
  file: File;
  action: SheetPdfAction;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [printError, setPrintError] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const mobile = typeof navigator !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const share = mobile && navigator.canShare?.({ files: [file] });

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    const update = requestAnimationFrame(() => setUrl(objectUrl));
    return () => {
      cancelAnimationFrame(update);
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  function print() {
    if (share) {
      void navigator.share({ files: [file] }).catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setPrintError(true);
      });
    } else {
      try {
        const preview = frame.current?.contentWindow;
        if (!preview) throw new Error();
        preview.focus();
        preview.print();
      } catch {
        setPrintError(true);
      }
    }
  }

  return (
    <Modal isOpen onClose={onClose} label="PDF pronto">
      <div className="pdf-result">
        <h2>PDF pronto</h2>
        <p>{file.name}</p>
        {action === "print" && (
          <>
            {mobile && <p>{share ? "No menu do celular, toque em Imprimir." : "Abra o PDF e escolha Imprimir no menu do navegador."}</p>}
            {printError && <p role="alert">Abra o PDF e escolha Imprimir no menu do navegador.</p>}
            {!mobile && url && !printError && <iframe ref={frame} src={url} title="Documento para impressão" tabIndex={-1} aria-hidden="true" className="pdf-print-frame" onLoad={() => setFrameReady(true)} />}
            {(share || (!mobile && !printError)) && <button type="button" className="primary-button" onClick={print} disabled={!share && !frameReady}>Imprimir</button>}
          </>
        )}
        {url && <>
          <a href={url} download={file.name} className={action === "download" ? "primary-button" : "secondary-button"}>Baixar PDF</a>
          <a href={url} target="_blank" rel="noopener" className="secondary-button">Abrir PDF</a>
        </>}
        <button type="button" className="text-button" onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  );
}
