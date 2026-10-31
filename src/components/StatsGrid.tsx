"use client";

import { CheckCircle2, Clock3, ListChecks, TrendingUp } from "lucide-react";

interface StatsGridProps {
  totalHours: number;
  activitiesCount: number;
  targetHours?: number;
}

export function StatsGrid({
  totalHours,
  activitiesCount,
  targetHours = 32,
}: StatsGridProps) {
  const progress = Math.min(100, Math.max(0, (totalHours / targetHours) * 100));
  const complete = totalHours >= targetHours;
  const weeklyAvg = Math.round((totalHours / 4) * 10) / 10;
  return (
    <section className="stats-grid" aria-label="Resumo da frequência">
      <div className="stat-card">
        <div className="stat-label">
          Horas no mês
          <Clock3 size={17} className="text-accent" />
        </div>
        <p className="stat-value">
          {totalHours}
          <small>/ {targetHours} horas</small>
        </p>
        <div
          className="progress-track mt-4"
          role="progressbar"
          aria-label="Meta mensal de horas"
          aria-valuenow={totalHours}
          aria-valuemin={0}
          aria-valuemax={Math.max(targetHours, totalHours)}
        >
          <span style={{ width: progress + "%" }} />
        </div>
        <p className="stat-caption">
          {complete
            ? "Meta mensal de horas alcançada."
            : "Faltam " + (targetHours - totalHours) + "h para a meta."}
        </p>
      </div>
      <div className="stat-card">
        <div className="stat-label">
          Média semanal
          <TrendingUp size={17} className="text-info" />
        </div>
        <p className="stat-value">
          {weeklyAvg}
          <small>h / semana</small>
        </p>
        <p className="stat-caption">Meta: 8h · média de quatro semanas.</p>
      </div>
      <div className="stat-card">
        <div className="stat-label">
          Situação
          <ListChecks size={17} className="text-muted" />
        </div>
        <span className={complete ? "status-badge complete" : "status-badge"}>
          {complete ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {complete ? "Apta para envio" : "Em preenchimento"}
        </span>
        <p className="stat-caption">
          {activitiesCount}{" "}
          {activitiesCount === 1
            ? "atividade registrada"
            : "atividades registradas"}
          .
        </p>
      </div>
    </section>
  );
}
