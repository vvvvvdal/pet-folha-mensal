import { useState } from 'react';
import { Activity, UserProfile } from '@/types';
import { formatDateBR } from '@/lib/pet-calculator';
import { Edit2, Trash2, Sparkles, RotateCcw, Calendar, Clock, ListChecks } from 'lucide-react';
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
  onClearMonth
}: ActivityTableProps) {
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Modalidades em tons harmônicos de azul, com texto por extenso
  const getModalityBadge = (modality: string) => {
    switch (modality) {
      case 'Síncrona presencial':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 whitespace-nowrap">
            Síncrona presencial
          </span>
        );
      case 'Assíncrona virtual':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
            Assíncrona virtual
          </span>
        );
      case 'Síncrona virtual':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 whitespace-nowrap">
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
            <ListChecks className="size-5 text-emerald-400" />
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
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
                      <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
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
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-sm font-semibold cursor-pointer transition-all shadow-xs"
                        >
                          <Sparkles className="size-4 text-emerald-400" />
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
                        isEditing ? 'bg-emerald-950/30' : ''
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
                      <td className="py-3.5 px-4 text-right font-extrabold text-base text-emerald-400 whitespace-nowrap">
                        {act.hours}h
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(act)}
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Editar atividade"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => onDelete(act.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
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
                  <td className="py-4 px-4 text-right text-emerald-400 font-extrabold text-lg">
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
