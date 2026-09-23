import { useState } from 'react';
import { Activity, UserProfile } from '@/types';
import { formatDateBR } from '@/lib/pet-calculator';
import { Edit2, Trash2, Sparkles, RotateCcw, Calendar, Clock, ListChecks, LogOut } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';

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
  onOpenExitModal
}: ActivityTableProps) {
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Modalidades em 3 tons distintos e harmoniosos da família azul
  const getModalityBadge = (modality: string) => {
    switch (modality) {
      case 'Síncrona presencial':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 whitespace-nowrap">
            Síncrona presencial
          </span>
        );
      case 'Assíncrona virtual':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
            Assíncrona virtual
          </span>
        );
      case 'Síncrona virtual':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#00A3E0]/15 text-[#0284C7] dark:text-[#7DD3FC] border border-[#00A3E0]/30 whitespace-nowrap">
            Síncrona virtual
          </span>
        );
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-xs mb-6">
        {/* Table Header Bar */}
        <div className="p-4 sm:px-6 py-4 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <ListChecks className="size-5 text-[#008D4C] dark:text-[#10B981]" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              Lançamentos de {monthLabel}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200">
              {activities.length}
            </span>
          </div>

          {activities.length > 0 && (
            <button
              type="button"
              onClick={() => setIsConfirmClearOpen(true)}
              className="text-xs sm:text-sm text-slate-400 hover:text-red-400 transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-transparent hover:border-red-500/20 hover:bg-red-500/10 cursor-pointer font-medium"
              title="Exclui todas as atividades deste mês para começar do zero"
            >
              <RotateCcw className="size-3.5" />
              <span>Zerar mês</span>
            </button>
          )}
        </div>

        {/* Mobile View: Cards ergonômicos para smartphone (sm:hidden) */}
        <div className="block sm:hidden divide-y divide-slate-800/60">
          {activities.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <div className="max-w-sm mx-auto space-y-3">
                <div className="size-11 rounded-2xl bg-[#008D4C]/10 text-[#10B981] flex items-center justify-center mx-auto border border-[#008D4C]/20">
                  <Clock className="size-5" />
                </div>
                <div className="text-base font-bold text-slate-100">
                  Nenhuma atividade em {monthLabel}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sua folha deste mês está com 0 horas. Registre pelo formulário acima ou use o modelo padrão do seu GAT.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onLoadSamples}
                    className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl border border-[#008D4C]/30 bg-[#008D4C]/10 hover:bg-[#008D4C]/20 text-[#10B981] text-xs font-semibold cursor-pointer transition-all shadow-xs"
                  >
                    <Sparkles className="size-4 text-[#10B981]" />
                    <span>Carregar Padrão (GAT {user.gatNumber})</span>
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
                    isEditing ? 'bg-[#00341f]/30 border-l-4 border-[#10B981]' : ''
                  }`}
                >
                  {/* Top Bar: Data, Modalidade e Horas */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-semibold">
                        <Calendar className="size-3 text-slate-400" />
                        <span>{formatDateBR(act.date)}</span>
                      </span>
                      {getModalityBadge(act.modality)}
                    </div>
                    <span className="font-black text-base text-[#10B981] shrink-0">
                      {act.hours}h
                    </span>
                  </div>

                  {/* Horário */}
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                    <Clock className="size-3.5 text-slate-500 shrink-0" />
                    <span>{act.start} às {act.end}</span>
                  </div>

                  {/* Descrição Completa */}
                  <p className="text-sm text-slate-100 font-medium leading-relaxed break-words">
                    {act.description}
                  </p>

                  {/* Ações Mobile com 44px min-height */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/50">
                    <button
                      type="button"
                      onClick={() => onEdit(act)}
                      className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      title="Editar atividade"
                    >
                      <Edit2 className="size-3.5 text-[#10B981]" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(act.id)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
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
            <div className="p-3.5 bg-slate-950/90 flex items-center justify-between border-t border-slate-800 gap-2">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Total ({monthLabel}):
                </span>
                <span className="text-lg font-black text-[#10B981]">
                  {totalHours}h
                </span>
              </div>
              {onOpenExitModal && (
                <button
                  type="button"
                  onClick={onOpenExitModal}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <LogOut className="size-3.5 text-emerald-400" />
                  <span>Salvar e Sair</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop View: Tabela tabular completa (hidden sm:block) */}
        <div className="hidden sm:block overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse min-w-full">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/70 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-28">Data</th>
                <th className="py-3.5 px-3 w-24">Entrada</th>
                <th className="py-3.5 px-3 w-24">Saída</th>
                <th className="py-3.5 px-4 w-40">Tipo</th>
                <th className="py-3.5 px-4">Descrição da Atividade</th>
                <th className="py-3.5 px-4 w-24 text-right">Horas</th>
                <th className="py-3.5 px-4 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3.5">
                      <div className="size-12 rounded-2xl bg-[#008D4C]/10 text-[#10B981] flex items-center justify-center mx-auto border border-[#008D4C]/20">
                        <Clock className="size-6" />
                      </div>
                      <div className="text-base font-bold text-slate-100">
                        Nenhuma atividade registrada em {monthLabel}
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Sua folha deste mês está com 0 horas. Utilize o formulário acima para registrar seus encontros ou carregue o modelo de atividades padrão do seu GAT.
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={onLoadSamples}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#008D4C]/30 bg-[#008D4C]/10 hover:bg-[#008D4C]/20 text-[#10B981] text-sm font-semibold cursor-pointer transition-all shadow-xs"
                        >
                          <Sparkles className="size-4 text-[#10B981]" />
                          <span>Carregar Atividades Padrão (GAT {user.gatNumber})</span>
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
                      className={`transition-colors hover:bg-slate-800/40 text-sm ${
                        isEditing ? 'bg-[#00341f]/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3.5 text-slate-500" />
                          <span>{formatDateBR(act.date)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono text-xs sm:text-sm whitespace-nowrap font-medium">
                        {act.start}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono text-xs sm:text-sm whitespace-nowrap font-medium">
                        {act.end}
                      </td>
                      <td className="py-3.5 px-4">
                        {getModalityBadge(act.modality)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-100 font-medium leading-relaxed">
                        <span>{act.description}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-base text-[#10B981] whitespace-nowrap">
                        {act.hours}h
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(act)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-[#10B981] hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Editar atividade"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => onDelete(act.id)}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
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
                <tr className="border-t border-slate-800 bg-slate-950/70 font-semibold text-sm">
                  <td colSpan={5} className="py-4 px-4 text-right text-slate-300 uppercase tracking-wider text-xs">
                    Total do Mês ({monthLabel}):
                  </td>
                  <td className="py-4 px-4 text-right text-[#10B981] font-extrabold text-lg">
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
