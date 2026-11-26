"use client";

import { Check } from "lucide-react";
import "./loading-states.css";

export interface ProgressStep {
  label: string;
  state: "done" | "active" | "pending";
}

export function InlineSpinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="pet-spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OperationProgressModal({
  title,
  steps,
  done,
  total,
  inline = false,
}: {
  title: string;
  steps: ProgressStep[];
  done?: number;
  total?: number;
  inline?: boolean;
}) {
  const hasRatio = typeof done === "number" && typeof total === "number" && total > 0;
  const percent = hasRatio ? Math.min(100, Math.max(8, Math.round((done / total) * 100))) : 38;

  const content = (
    <div
      className={inline ? "operation-progress-inline" : "operation-progress-card"}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="operation-progress-head">
        <span className="operation-progress-title">
          <InlineSpinner size={18} />
          <span>{title}</span>
        </span>
        {hasRatio && (
          <span className="operation-progress-count">
            {done} de {total}
          </span>
        )}
      </div>
      <div
        className="operation-progress-track"
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={hasRatio ? total : 100}
        aria-valuenow={hasRatio ? done : undefined}
      >
        <div className="operation-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      {steps.length > 0 && (
        <ol className="operation-progress-steps">
          {steps.map((step) => (
            <li key={step.label} className="operation-progress-step" data-state={step.state}>
              <span className="operation-step-dot" aria-hidden="true">
                {step.state === "done" ? (
                  <Check size={12} strokeWidth={2.75} />
                ) : step.state === "active" ? (
                  <InlineSpinner size={15} />
                ) : null}
              </span>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );

  if (inline) return content;
  return <div className="operation-progress-backdrop screen-only">{content}</div>;
}

export function WorkspaceSkeleton() {
  return (
    <main className="workspace-skeleton-shell screen-only" aria-busy="true" aria-label="Abrindo sua folha">
      <span className="sr-only">Abrindo sua folha…</span>
      <aside className="workspace-skeleton-sidebar" aria-hidden="true">
        <div className="pet-skeleton-bar" style={{ width: "68%", height: 28 }} />
        <div className="pet-skeleton-bar" style={{ width: "48%", height: 14 }} />
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <div className="pet-skeleton-bar" style={{ width: "100%", height: 44, borderRadius: 12 }} />
          <div className="pet-skeleton-bar" style={{ width: "100%", height: 44, borderRadius: 12 }} />
          <div className="pet-skeleton-bar" style={{ width: "100%", height: 44, borderRadius: 12 }} />
        </div>
      </aside>
      <div className="workspace-skeleton-main" aria-hidden="true">
        <div className="workspace-skeleton-head">
          <div style={{ display: "grid", gap: 8 }}>
            <div className="pet-skeleton-bar" style={{ width: 180, height: 30 }} />
            <div className="pet-skeleton-bar" style={{ width: 120, height: 16 }} />
          </div>
          <div className="pet-skeleton-bar" style={{ width: 196, height: 44, borderRadius: 12 }} />
        </div>
        <div className="workspace-skeleton-tiles">
          {[0, 1, 2].map((index) => (
            <div key={index} className="workspace-skeleton-tile">
              <div className="pet-skeleton-bar" style={{ width: "45%", height: 14 }} />
              <div className="pet-skeleton-bar" style={{ width: "36%", height: 32 }} />
              <div className="pet-skeleton-bar" style={{ width: "85%", height: 8 }} />
            </div>
          ))}
        </div>
        <div className="workspace-skeleton-card">
          <div className="pet-skeleton-bar" style={{ width: 160, height: 20 }} />
          <div className="pet-skeleton-bar" style={{ width: "100%", height: 48, borderRadius: 12 }} />
          <div className="pet-skeleton-bar" style={{ width: "100%", height: 48, borderRadius: 12 }} />
        </div>
      </div>
    </main>
  );
}

export function AttachmentsListSkeleton() {
  return (
    <div className="attachments-skeleton-list" role="status" aria-label="Carregando comprovantes">
      <span className="sr-only">Carregando comprovantes…</span>
      {[0, 1].map((index) => (
        <div key={index} className="attachments-skeleton-row" aria-hidden="true">
          <div className="pet-skeleton-box attachments-skeleton-thumb" />
          <div className="attachments-skeleton-lines">
            <div className="pet-skeleton-bar" style={{ width: "34%", height: 14 }} />
            <div className="pet-skeleton-bar" style={{ width: "78%", height: 52, borderRadius: 12 }} />
            <div className="pet-skeleton-bar" style={{ width: "52%", height: 14 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
