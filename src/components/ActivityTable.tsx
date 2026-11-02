import { useState } from "react";
import { Activity, UserProfile } from "@/types";
import { formatDateBR, cleanActivityDescription } from "@/lib/pet-calculator";
import {
  Edit2,
  Trash2,
  Sparkles,
  RotateCcw,
  Calendar,
  Clock,
  ListChecks,
  LogOut,
} from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";

interface ActivityTableProps {
  activities: Activity[];
  totalHours: number;
  editingId: string | null;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
  user: UserProfile;
  monthLabel: string;
  onLoadSamples: () => void;
  onClearMonth: () => void;
  onOpenExitModal?: () => void;
}

export function ActivityTable({
  activities,
  totalHours,
  editingId,
  onEdit,
  onDelete,
  user,
  monthLabel,
  onLoadSamples,
  onClearMonth,
  onOpenExitModal,
}: ActivityTableProps) {
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Modalidades em 3 tons distintos e harmoniosos da família azul
  const getModalityBadge = (modality: string) => {
    switch (modality) {
      case "Síncrona presencial":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/15 text-info  border border-blue-500/30 whitespace-nowrap">
            Síncrona presencial
          </span>
        );
      case "Assíncrona virtual":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/15 text-info  border border-indigo-500/30 whitespace-nowrap">
            Assíncrona virtual
          </span>
        );
      case "Síncrona virtual":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#00A3E0]/15 text-info  border border-info/30 whitespace-nowrap">
            Síncrona virtual
          </span>
        );
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-[var(--page-shadow)] mb-6">
        {/* Table Header Bar */}
        <div className="activity-header p-4 sm:px-6 py-4 border-b border-line flex items-center justify-between gap-3 bg-canvas">
          <div className="flex items-center gap-2.5">
            <ListChecks className="size-5 text-accent " />
            <h3 className="text-sm sm:text-base font-bold text-ink">
              Lançamentos de {monthLabel}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-raised text-body">
              {activities.length}
            </span>
          </div>

          {activities.length > 0 && (
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(true)}
              className="text-xs sm:text-sm text-muted hover:text-danger transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-transparent hover:border-red-500/20 hover:bg-red-500/10 cursor-pointer font-medium"
              title="Exclui todas as atividades deste mês para começar do zero"
            >
              <RotateCcw className="size-3.5" />
              <span>Zerar mês</span>
            </button>
          )}
        </div>

        {/* Mobile View: Cards ergonômicos para smartphone (sm:hidden) */}
        <div className="block sm:hidden divide-y divide-line">
          {activities.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <div className="max-w-sm mx-auto space-y-3">
                <div className="size-11 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto border border-accent/20">
                  <Clock className="size-5" />
                </div>
                <div className="text-base font-bold text-ink">
                  Nenhuma atividade em {monthLabel}
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Adicione uma atividade pelo formulário acima.
                </p>
                <div className="pt-2">
                  <a href="#nova-atividade" className="empty-action">
                    Registrar primeira atividade
                  </a>
                  <button
                    type="button"
                    onClick={onLoadSamples}
                    className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-accent/30 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold cursor-pointer transition-all shadow-[var(--page-shadow)]"
                  >
                    <Sparkles className="size-4 text-accent" />
                    <span>Carregar exemplos do GAT {user.gatNumber}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            activities.map((act) => {
              const isEditing = editingId === act.id;
              return (
                <div
                  key={act.id}
                  className={`p-4 transition-colors space-y-3 ${
                    isEditing ? "bg-accent/10 border-l-4 border-accent" : ""
                  }`}
                >
                  {/* Top Bar: Data, Modalidade e Horas */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-canvas border border-line text-body text-xs font-semibold">
                        <Calendar className="size-3 text-muted" />
                        <span>{formatDateBR(act.date)}</span>
                      </span>
                      {getModalityBadge(act.modality)}
                    </div>
                    <span className="font-black text-base text-accent shrink-0">
                      {act.hours}h
                    </span>
                  </div>

                  {/* Horário */}
                  <div className="flex items-center gap-2 text-xs text-body font-mono">
                    <Clock className="size-3.5 text-muted shrink-0" />
                    <span>
                      {act.start} às {act.end}
                    </span>
                  </div>

                  {/* Descrição Completa */}
                  <p className="text-sm text-ink font-medium leading-relaxed break-words">
                    {cleanActivityDescription(act.description)}
                  </p>

                  {/* Ações Mobile com 44px min-height */}
                  <div className="flex items-center gap-2 pt-1 border-t border-line">
                    <button
                      type="button"
                      onClick={() => onEdit(act)}
                      className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-raised hover:bg-hover text-body text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      aria-label="Editar atividade"
                      title="Editar atividade"
                    >
                      <Edit2 className="size-3.5 text-accent" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(act.id)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-danger text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      aria-label="Excluir atividade"
                      title="Excluir atividade"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Rodapé Mobile: Total e Ação Rápida de Saída */}
          {activities.length > 0 && (
            <div className="p-3.5 bg-canvas flex items-center justify-between border-t border-line gap-2">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase font-bold text-muted tracking-wider">
                  Total ({monthLabel}):
                </span>
                <span className="text-lg font-black text-accent">
                  {totalHours}h
                </span>
              </div>
              {onOpenExitModal && (
                <button
                  type="button"
                  onClick={onOpenExitModal}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-raised hover:bg-hover text-ink text-xs font-bold border border-line flex items-center gap-1.5 shadow-[var(--page-shadow)] cursor-pointer transition-colors"
                >
                  <LogOut className="size-3.5 text-accent" />
                  <span>Concluir e salvar</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop View: Tabela tabular completa (hidden sm:block) */}
        <div className="hidden sm:block overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse min-w-full">
            <thead>
              <tr className="border-b border-line bg-canvas text-xs font-bold text-body uppercase tracking-wider">
                <th className="py-3.5 px-4 w-28">Data</th>
                <th className="py-3.5 px-3 w-24">Entrada</th>
                <th className="py-3.5 px-3 w-24">Saída</th>
                <th className="py-3.5 px-4 w-40">Tipo</th>
                <th className="py-3.5 px-4">Descrição da Atividade</th>
                <th className="py-3.5 px-4 w-24 text-right">Horas</th>
                <th className="py-3.5 px-4 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3.5">
                      <div className="size-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto border border-accent/20">
                        <Clock className="size-6" />
                      </div>
                      <div className="text-base font-bold text-ink">
                        Nenhuma atividade registrada em {monthLabel}
                      </div>
                      <p className="text-sm text-muted leading-relaxed">
                        Adicione uma atividade pelo formulário acima.
                      </p>
                      <div className="pt-2">
                        <a href="#nova-atividade" className="empty-action">
                          Registrar primeira atividade
                        </a>
                        <button
                          type="button"
                          onClick={onLoadSamples}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent/30 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-semibold cursor-pointer transition-all shadow-[var(--page-shadow)]"
                        >
                          <Sparkles className="size-4 text-accent" />
                          <span>Carregar exemplos do GAT {user.gatNumber}</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                activities.map((act) => {
                  const isEditing = editingId === act.id;
                  return (
                    <tr
                      key={act.id}
                      className={`transition-colors hover:bg-raised text-sm ${
                        isEditing ? "bg-accent/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-body whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-muted" />
                          <span>{formatDateBR(act.date)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-body font-mono text-xs sm:text-sm whitespace-nowrap font-medium">
                        {act.start}
                      </td>
                      <td className="py-3.5 px-3 text-body font-mono text-xs sm:text-sm whitespace-nowrap font-medium">
                        {act.end}
                      </td>
                      <td className="py-3.5 px-4">
                        {getModalityBadge(act.modality)}
                      </td>
                      <td className="py-3.5 px-4 text-ink font-medium leading-relaxed">
                        <span>{cleanActivityDescription(act.description)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-base text-accent whitespace-nowrap">
                        {act.hours}h
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(act)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-muted hover:text-accent hover:bg-raised cursor-pointer transition-colors"
                            aria-label="Editar atividade"
                            title="Editar atividade"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => onDelete(act.id)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-muted hover:text-danger hover:bg-raised cursor-pointer transition-colors"
                            aria-label="Excluir atividade"
                            title="Excluir atividade"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {activities.length > 0 && (
              <tfoot>
                <tr className="border-t border-line bg-canvas font-semibold text-sm">
                  <td
                    colSpan={5}
                    className="py-4 px-4 text-right text-body uppercase tracking-wider text-xs"
                  >
                    Total do Mês ({monthLabel}):
                  </td>
                  <td className="py-4 px-4 text-right text-accent font-extrabold text-lg">
                    {totalHours}h
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Confirmação Segura de Zerar Mês */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        onClose={() => setIsConfirmClearOpen(false)}
        onConfirm={onClearMonth}
        title={`Zerar Folha de ${monthLabel}?`}
        message={`Esta ação apagará todos os ${activities.length} lançamentos deste mês. Recomendamos salvar sua cópia de segurança (.json) antes caso queira guardar o histórico.`}
        confirmLabel="Sim, zerar mês"
        cancelLabel="Cancelar"
        isDestructive={true}
      />
    </>
  );
}
