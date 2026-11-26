"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UserProfile,
  Activity,
  UserRole,
  GATInfo,
  ActivityTemplate,
  FormReport,
} from "@/types";
import {
  getStoredProfiles,
  getProfilesForAccess,
  saveProfiles,
  getActiveProfile,
  setActiveProfileId,
  getActivitiesForMonth,
  saveActivitiesForMonth,
  loadSampleActivitiesForUser,
  exportUserData,
  inspectUserData,
  getRestoreDiagnostic,
  type RestoreCode,
  getStoredGats,
  getStoredRoles,
  getStoredTemplates,
  registerProfile,
} from "@/lib/storage";
import {
  countAttachmentPages,
  decodeAttachments,
  encodeAttachments,
  linkedActivityIds,
  listAttachments,
  prepareAttachmentFiles,
  prepareAttachmentPages,
  savePreparedAttachments,
  type Attachment,
} from "@/lib/attachments";
import { restoreWithAttachments } from "@/lib/attachment-backup";
import { buildAttachmentPrintPages } from "@/lib/attachment-print";
import {
  calcPetHours,
  getMonthYearLabel,
  formatDateBR,
  cleanActivityDescription,
  sortActivitiesChronologically,
  getCurrentMonth,
  PROJECT_MONTHS,
  formatShortDate,
  getMonthName,
  getSubmissionDeadline,
} from "@/lib/pet-calculator";
import { formReportStatus } from "@/lib/form-report";
import { SavedSheets } from "@/components/SavedSheets";
import "@/components/print-panel.css";
import { Navbar, AccountScreen, type WorkspaceTab } from "@/components/Navbar";
import { Toast } from "@/components/Toast";
import { ProfileModal } from "@/components/ProfileModal";
import { AdminModal } from "@/components/AdminModal";
import { StatsGrid, useSummaryView } from "@/components/StatsGrid";
import { ActivityForm } from "@/components/ActivityForm";
import { ACTIVITY_FORM_URL } from "@/lib/form-report";
import { ActivityReportModal } from "@/components/ActivityReportModal";
import { ActivityTable } from "@/components/ActivityTable";
import { AttachmentReviewModal } from "@/components/AttachmentReviewModal";
import type { AttachmentSource } from "@/components/AttachmentSourceMenu";
import {
  InlineSpinner,
  OperationProgressModal,
  WorkspaceSkeleton,
} from "@/components/LoadingStates";
import { EditActivityModal } from "@/components/EditActivityModal";
import { OfficialSheet } from "@/components/OfficialSheet";
import { MonthlyAttachments } from "@/components/MonthlyAttachments";
import { LandingPage } from "@/components/LandingPage";
import { ExitModal } from "@/components/ExitModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import { SiteFooter } from "@/components/SiteFooter";
import { HelpModal } from "@/components/Help";
import {
  Calendar,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Download,
  Paperclip,
  Printer,
  ArrowLeft,
} from "lucide-react";
import { useDialog } from "@/context/DialogContext";

export default function Home() {
  const { alert, confirm } = useDialog();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [monthKey, setMonthKey] = useState(getCurrentMonth);
  const [ready, setReady] = useState(false);
  const [draftDirty, setDraftDirty] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [restoreIssue, setRestoreIssue] = useState<{
    code: RestoreCode;
    message: string;
  } | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState<{
    phase: "reading" | "attachments" | "writing";
    done?: number;
    total?: number;
  } | null>(null);
  const [printProgress, setPrintProgress] = useState<{ done: number; total: number } | null>(null);
  const importInProgress = useRef(false);
  const [formRevision, setFormRevision] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(
    "dashboard",
  );
  const [sheetsOpen, setSheetsOpen] = useState(false);
  const [showBlankTemplate, setShowBlankTemplate] = useState(false);
  const [reportingActivity, setReportingActivity] = useState<{
    profileId: string; monthKey: string; id: string;
  } | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [attachmentsBusy, setAttachmentsBusy] = useState(false);
  const [preparingPrint, setPreparingPrint] = useState(false);
  const printInProgress = useRef(false);
  const printSheetRef = useRef<HTMLDivElement>(null);
  const printActivitiesRef = useRef(activities);
  const printAttachmentsRef = useRef<HTMLDivElement>(null);
  const clearPrintAttachments = useRef<(() => void) | null>(null);
  const [undoActivity, setUndoActivity] = useState<{ before: Activity[]; after: string; profileId: string; month: string } | null>(null);
  const [toastRevision, setToastRevision] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [summaryView, setSummaryView] = useSummaryView();
  const [attachmentState, setAttachmentState] = useState<{ key: string; items: Attachment[] } | null>(null);
  const [attachmentsRevision, setAttachmentsRevision] = useState(0);
  const [attachmentsFocus, setAttachmentsFocus] = useState<string | null>(null);
  const quickGalleryRef = useRef<HTMLInputElement>(null);
  const quickFilesRef = useRef<HTMLInputElement>(null);
  const quickPreselectRef = useRef<string | null>(null);
  const [quickDrafts, setQuickDrafts] = useState<Attachment[] | null>(null);
  const [quickTargetId, setQuickTargetId] = useState<string | null>(null);
  const [quickErrors, setQuickErrors] = useState<string[]>([]);
  const [quickPrepareProgress, setQuickPrepareProgress] = useState<{ done: number; total: number } | null>(null);

  const activeProfileId = activeUser?.id;
  useEffect(() => () => clearPrintAttachments.current?.(), [activeProfileId, monthKey, showBlankTemplate]);
  // Proof counts for the activity list and the print review; the Comprovantes tab keeps its own copy.
  useEffect(() => {
    if (!activeProfileId) return;
    const key = `${activeProfileId}:${monthKey}`;
    let current = true;
    listAttachments({ profileId: activeProfileId, monthKey })
      .then((items) => { if (current) setAttachmentState({ key, items }); })
      .catch(() => { if (current) setAttachmentState(null); });
    return () => { current = false; };
  }, [activeProfileId, monthKey, attachmentsRevision, formRevision]);
  useEffect(() => { printActivitiesRef.current = activities; }, [activities]);

  // Estados Dinâmicos de Configuração (GATs, Funções e Templates)
  const [gats, setGats] = useState<Record<string, GATInfo>>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [templates, setTemplates] = useState<ActivityTemplate[]>([]);

  // Inicialização Local-First
  useEffect(() => {
    try {
      const loadedProfiles = getStoredProfiles();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Browser records are hydrated after SSR to preserve the existing local storage contract.
      setProfiles(loadedProfiles);

      const loadedGats = getStoredGats();
      setGats(loadedGats);

      const loadedRoles = getStoredRoles();
      setRoles(loadedRoles);

      const loadedTemplates = getStoredTemplates();
      setTemplates(loadedTemplates);

      const urlParams =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      if (urlParams?.get("admin") === "1") {
        setIsAdminModalOpen(true);
      }

      setReady(true);
      const active = getActiveProfile();
      if (active) {
        setActiveUser(active);
        const acts = getActivitiesForMonth(active.id, monthKey);
        setActivities(sortActivitiesChronologically(acts));
      } else {
        setActiveUser(null);
      }
    } catch {
      setStorageError(
        "Leitura indisponível. Permita o armazenamento neste navegador para acessar e salvar sua folha.",
      );
      setReady(true);
    }
  }, [monthKey]);

  const showToast = (msg: string) => {
    setUndoActivity(null);
    setToastRevision((revision) => revision + 1);
    setToastMessage(msg);
  };

  const handleSelectProfile = (user: UserProfile) => {
    try {
      setActiveProfileId(user.id);
      const acts = getActivitiesForMonth(user.id, monthKey);
      setActiveUser(user);
      setActivities(sortActivitiesChronologically(acts));
      setEditingActivity(null);
      setHasChanges(false);
      setDraftDirty(false);
      setStorageError("");
    } catch {
      setStorageError(
        "Não foi possível abrir o perfil. Permita o armazenamento neste navegador e tente novamente.",
      );
    }
  };

  const confirmDraft = async () => {
    if (!draftDirty) return true;
    const discard = await confirm({
      title: "Atividade ainda não adicionada",
      message:
        "O formulário tem alterações. Deseja descartá-las para continuar?",
      confirmText: "Descartar preenchimento",
      cancelText: "Continuar editando",
      variant: "warning",
    });
    if (discard) {
      setDraftDirty(false);
      setFormRevision((revision) => revision + 1);
    }
    return discard;
  };

  const changeMonth = async (value: string) => {
    if (value === monthKey) return await confirmDraft();
    if (!(await confirmDraft())) return false;
    setDraftDirty(false);
    setEditingActivity(null);
    setUndoActivity(null);
    setAttachmentsFocus(null);
    setMonthKey(value);
    return true;
  };

  const openConclusion = async () => {
    if (await confirmDraft()) {
      setDraftDirty(false);
      setIsExitModalOpen(true);
    }
  };

  const persistActivities = (next: Activity[], message: string): boolean => {
    if (!activeUser) return false;
    try {
      const sorted = sortActivitiesChronologically(next);
      saveActivitiesForMonth(activeUser.id, monthKey, sorted);
      setActivities(sorted);
      setHasChanges(true);
      setStorageError("");
      showToast(message);
      return true;
    } catch {
      setStorageError(
        "Não foi possível salvar. Verifique o espaço e as permissões do navegador. Seu preenchimento foi mantido. Tente novamente.",
      );
      return false;
    }
  };

  const handleSaveProfile = (updated: UserProfile) => {
    try {
      const updatedProfiles = profiles.map((profile) =>
        profile.id === updated.id ? updated : profile,
      );
      saveProfiles(updatedProfiles);
      setProfiles(updatedProfiles);
      setActiveUser(updated);
      setHasChanges(true);
      showToast("Identificação atualizada.");
      return true;
    } catch {
      setStorageError(
        "Não foi possível salvar a identificação. Verifique o armazenamento e tente novamente.",
      );
      return false;
    }
  };

  const handleCreateNewProfile = async (
    name: string,
    gatNumber: string,
    role: UserRole,
  ) => {
    try {
      const result = registerProfile({ name, role, gatNumber });
      if (result.existingUser) {
        const user = result.existingUser;
        const resume = await confirm({
          title: "Sua folha já está neste navegador",
          message: `${user.name} · ${user.role} · GAT ${user.gatNumber}. Você pode continuar com este perfil e escolher o mês, sem precisar do arquivo anterior.`,
          confirmText: "Continuar com este perfil",
          cancelText: "Voltar",
          variant: "info",
        });
        if (resume) handleSelectProfile(user);
        return;
      }
      if (!result.success || !result.user) {
        await alert({
          title: "Confira a identificação",
          message: result.error || "Não foi possível criar o perfil.",
          variant: "warning",
        });
        return;
      }
      setProfiles(getStoredProfiles());
      handleSelectProfile(result.user);
    } catch {
      setStorageError(
        "Não foi possível guardar o perfil. Permita o armazenamento neste navegador e tente novamente.",
      );
    }
  };

  // Manipulação de Atividades (Salvar / Editar / Excluir)
  const handleSaveActivity = (
    data: Omit<Activity, "id" | "hours">,
    editingId?: string,
  ) => {
    if (!activeUser) return false;
    if (
      !data.date.startsWith(monthKey) ||
      calcPetHours(data.start, data.end) <= 0
    ) {
      setStorageError(
        "Confira a data e os horários: a atividade deve pertencer ao mês selecionado e a saída deve ser posterior à entrada.",
      );
      return false;
    }
    const hours = calcPetHours(data.start, data.end);
    const next = editingId
      ? activities.map((activity) =>
          activity.id === editingId
            ? { ...activity, ...data, id: editingId, hours }
            : activity,
        )
      : [
          ...activities,
          {
            ...data,
            id:
              globalThis.crypto?.randomUUID?.() ??
              `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            hours,
          },
        ];
    const saved = persistActivities(
      next,
      editingId ? "Atividade atualizada." : "Atividade adicionada.",
    );
    if (saved) {
      setEditingActivity(null);
      setUndoActivity({ before: activities, after: JSON.stringify(sortActivitiesChronologically(next)), profileId: activeUser.id, month: monthKey });
    }
    return saved;
  };

  const handleDeleteActivity = async (id: string) => {
    if (!activeUser) return;
    const act = activities.find((a) => a.id === id);
    const confirmed = await confirm({
      title: "Excluir Atividade?",
      message: act
        ? `Deseja realmente remover o registro "${cleanActivityDescription(act.description)}" de ${formatDateBR(act.date)} (${act.hours}h)?`
        : "Deseja realmente remover esta atividade da sua folha mensal?",
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      variant: "danger",
    });
    if (!confirmed) return;

    if (editingActivity?.id === id) {
      setEditingActivity(null);
    }
    persistActivities(
      activities.filter((activity) => activity.id !== id),
      "Atividade excluída.",
    );
  };

  const handleLoadSamples = () => {
    if (!activeUser) return;
    try {
      const samples = loadSampleActivitiesForUser(activeUser.id, monthKey);
      persistActivities(
        samples,
        "Exemplos carregados. Substitua pelos seus registros reais.",
      );
    } catch {
      setStorageError(
        "Não foi possível carregar os exemplos. Verifique o armazenamento.",
      );
    }
  };

  const handleClearMonth = () => {
    if (persistActivities([], "Atividades deste mês removidas."))
      setEditingActivity(null);
  };

  const handlePrint = async (blank = showBlankTemplate): Promise<boolean> => {
    const wrapper = printSheetRef.current;
    const proofs = printAttachmentsRef.current;
    if (!wrapper || !proofs || !activeUser || printInProgress.current || attachmentsBusy || importInProgress.current)
      return false;

    printInProgress.current = true;
    setPreparingPrint(true);
    clearPrintAttachments.current?.();
    try {
      const scope = { profileId: activeUser.id, monthKey };
      const stillCurrent = () =>
        wrapper.isConnected &&
        printActivitiesRef.current === activities &&
        wrapper.dataset.profileId === scope.profileId &&
        wrapper.dataset.month === scope.monthKey &&
        wrapper.dataset.blank === String(blank);

      if (!stillCurrent()) return false;

      if (!blank) {
        const attachments = await listAttachments(scope).catch(() => null);
        if (!attachments) {
          const proceed = await confirm({
            title: "Imprimir só a folha?",
            message: "O navegador não conseguiu ler os comprovantes deste mês. Você pode tentar novamente ou imprimir apenas a folha oficial.",
            confirmText: "Imprimir só a folha",
            cancelText: "Voltar",
            variant: "warning",
          });
          if (!proceed) return false;
        } else if (attachments.length) {
          const printActivityIds = new Set(activities.map(({ id }) => id));
          setPrintProgress({ done: 0, total: attachments.length });
          const { pagesByAttachment, release } = await prepareAttachmentPages(attachments, {
            activityIds: printActivityIds,
            onProgress: (done, total) => setPrintProgress({ done, total }),
          });
          const pages = await buildAttachmentPrintPages(attachments, activities, pagesByAttachment)
            .catch((error: unknown) => {
              release();
              throw error;
            });
          setPrintProgress(null);
          if (!stillCurrent()) {
            release();
            return false;
          }
          proofs.replaceChildren(pages);
          const cleanup = () => {
            proofs.replaceChildren();
            release();
            window.removeEventListener("afterprint", cleanup);
            clearPrintAttachments.current = null;
          };
          clearPrintAttachments.current = cleanup;
          window.addEventListener("afterprint", cleanup, { once: true });
        }
      }

      if (!stillCurrent()) return false;
      window.print();
      return true;
    } catch (error) {
      clearPrintAttachments.current?.();
      await alert({
        title: "Não foi possível preparar o PDF",
        message: error instanceof Error ? error.message : "Tente imprimir novamente.",
        variant: "warning",
      });
      return false;
    } finally {
      printInProgress.current = false;
      setPreparingPrint(false);
      setPrintProgress(null);
    }
  };

  const printParticipantSheet = async () => {
    setShowBlankTemplate(false);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    return handlePrint(false);
  };

  // Exportar Backup Local em JSON
  const handleExportBackup = async (): Promise<boolean> => {
    if (!activeUser || attachmentsBusy || importInProgress.current) return false;
    let jsonString: string;
    try {
      const items = await listAttachments({ profileId: activeUser.id, monthKey });
      const snapshot = getActivitiesForMonth(activeUser.id, monthKey);
      const activityIds = new Set(snapshot.map(({ id }) => id));
      jsonString = exportUserData(activeUser, monthKey, await encodeAttachments(items, activityIds), snapshot);
    } catch {
      setStorageError(
        "Não foi possível ler os registros para criar a cópia. Verifique o armazenamento e tente novamente.",
      );
      return false;
    }
    const blob = new Blob([jsonString], { type: "application/json" });
    const filename = `backup-frequencia-${activeUser.name.toLowerCase().replace(/\s+/g, "-")}-${monthKey}.json`;

    // 1. Tenta API moderna showSaveFilePicker (Chromium/Edge) se suportada
    if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
      try {
        const fileHandle = await (
          window as Window & {
            showSaveFilePicker: (options: {
              suggestedName: string;
              types: {
                description: string;
                accept: Record<string, string[]>;
              }[];
            }) => Promise<{
              createWritable: () => Promise<{
                write: (data: Blob) => Promise<void>;
                close: () => Promise<void>;
              }>;
            }>;
          }
        ).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: "Cópia de segurança (.json)",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        setHasChanges(false);
        showToast("Cópia da folha salva com sucesso!");
        return true;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          showToast("Salvamento cancelado.");
          return false;
        }
        // The standard download remains available when the file picker is unsupported.
      }
    }

    // 2. Download direto padrão (Brave, Firefox, Safari, Mobile)
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast("Download da cópia iniciado.");
      return true;
    } catch {
      setStorageError(
        "O download não foi iniciado. Tente salvar a cópia novamente.",
      );
      return false;
    }
  };

  // Importar Backup Local em JSON
  const handleImportBackup = async (file: File) => {
    if (importInProgress.current) return;
    if (attachmentsBusy || printInProgress.current) {
      await alert({
        title: "Aguarde a operação em andamento",
        message: "Quando terminar, selecione novamente a cópia que deseja restaurar.",
      });
      return;
    }
    importInProgress.current = true;
    if (!(await confirmDraft())) {
      importInProgress.current = false;
      return;
    }
    setRestoring(true);
    setRestoreProgress({ phase: "reading" });
    setRestoreIssue(null);
    try {
      const content = await file.text();
      const preview = inspectUserData(content);
      if (!preview.success) {
        setRestoreIssue({ code: preview.code, message: preview.error! });
        return;
      }
      let attachments;
      try {
        if (preview.attachmentData) {
          setRestoreProgress({
            phase: "attachments",
            done: 0,
            total: preview.attachmentData.length,
          });
          attachments = await decodeAttachments(
            preview.attachmentData,
            preview.hasAttachmentLinks ? new Set(preview.activities?.map(({ id }) => id)) : undefined,
            (done, total) => setRestoreProgress({ phase: "attachments", done, total }),
          );
        }
      } catch (error) {
        setRestoreIssue({
          code: "INVALID_BACKUP",
          message: error instanceof Error ? error.message : "A cópia contém comprovantes inválidos.",
        });
        return;
      }
      setRestoreProgress(null);
      const existing = profiles.find(
        (profile) => profile.id === preview.user!.id,
      );
      const contents = attachments === undefined
        ? "A cópia antiga preserva os comprovantes já salvos."
        : "Comprovantes na cópia: " + attachments.length + ".";
      const accepted = await confirm({
        title: "Restaurar esta cópia?",
        message: `${preview.user!.name} · ${getMonthYearLabel(preview.monthKey!)} · ${preview.activities!.length} atividades. ${contents} ${existing ? "Os dados deste perfil e deste mês serão substituídos pela cópia. Os outros meses serão preservados." : "O perfil e os registros desta cópia serão adicionados neste navegador."}`,
        confirmText: "Restaurar cópia",
        cancelText: "Cancelar",
        variant: "warning",
      });
      if (!accepted) return;
      setRestoreProgress({ phase: "writing" });
      const result = await restoreWithAttachments(preview, preview.user!.id, preview.monthKey!, attachments);
      if (!result.success) {
        setRestoreIssue({ code: result.code, message: result.error! });
        return;
      }
      setProfiles(getStoredProfiles());
      setMonthKey(result.monthKey!);
      setActiveUser(result.user!);
      setActivities(result.activities!);
      setFormRevision((revision) => revision + 1);
      setDraftDirty(false);
      setHasChanges(false);
      setStorageError("");
      showToast("Cópia restaurada. Confira o mês e os registros.");
    } catch {
      setRestoreIssue({
        code: "STORAGE_FAILED",
        message:
          "Não foi possível ler ou abrir a cópia. Verifique o arquivo e as permissões deste navegador e tente novamente.",
      });
    } finally {
      setRestoreProgress(null);
      setRestoring(false);
      importInProgress.current = false;
    }
  };

  const notices = (
    <>
      {storageError && (
        <div className="operation-notice" role="alert">
          <p>{storageError}</p>
        </div>
      )}
      {restoreProgress && (
        <OperationProgressModal
          title="Restaurando cópia de segurança"
          done={restoreProgress.done}
          total={restoreProgress.total}
          steps={[
            {
              label: "Lendo e validando estrutura do arquivo JSON",
              state: restoreProgress.phase === "reading" ? "active" : "done",
            },
            {
              label: "Conferindo comprovantes da cópia",
              state:
                restoreProgress.phase === "reading"
                  ? "pending"
                  : restoreProgress.phase === "attachments"
                    ? "active"
                    : "done",
            },
            {
              label: "Gravando registros neste navegador",
              state: restoreProgress.phase === "writing" ? "active" : "pending",
            },
          ]}
        />
      )}
      {printProgress && (
        <OperationProgressModal
          title="Preparando PDF para impressão"
          done={printProgress.done}
          total={printProgress.total}
          steps={[
            { label: "Montando folha oficial A4 horizontal", state: "done" },
            { label: "Otimizando páginas de comprovantes em JPEG", state: "active" },
          ]}
        />
      )}
      {quickPrepareProgress && (
        <OperationProgressModal
          title="Preparando comprovantes"
          done={quickPrepareProgress.done}
          total={quickPrepareProgress.total}
          steps={[
            { label: "Validando formato e otimizando tamanho", state: "active" },
          ]}
        />
      )}
      {restoreIssue && (
        <div className="operation-notice" role="alert">
          <strong>Não foi possível restaurar</strong>
          <p>{restoreIssue.message}</p>
          <details>
            <summary>Detalhes para suporte</summary>
            <p>
              Estes detalhes não incluem seus registros. Selecione e copie se
              precisar pedir ajuda.
            </p>
            <pre tabIndex={0}>{getRestoreDiagnostic(restoreIssue.code)}</pre>
          </details>
          <button
            className="secondary-button"
            onClick={() => setRestoreIssue(null)}
          >
            Fechar aviso
          </button>
        </div>
      )}
    </>
  );

  if (!ready) return <WorkspaceSkeleton />;

  // Se não houver participante ativo, exibir Landing Page informativa e privada
  if (!activeUser) {
    return (
      <>
        {notices}
        <LandingPage
          profiles={getProfilesForAccess(profiles)}
          onSelectProfile={handleSelectProfile}
          onLoginWithJson={handleImportBackup}
          onCreateProfile={handleCreateNewProfile}
          gats={gats}
          roles={roles}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        />

        {/* Modal de configurações locais */}
        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          profiles={profiles}
          gats={gats}
          roles={roles}
          templates={templates}
          onProfilesChange={(updated) => {
            setProfiles(updated);
          }}
          onGatsChange={(updated) => setGats(updated)}
          onRolesChange={(updated) => setRoles(updated)}
          onTemplatesChange={(updated) => setTemplates(updated)}
        />

        {/* Modal de Feedback & Avaliação */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />

        {/* Toast Notificação */}
        {toastMessage && <Toast key={toastRevision} message={toastMessage} onClose={() => setToastMessage(null)} />}
      </>
    );
  }

  const totalHours = activities.reduce((sum, act) => sum + act.hours, 0);
  const monthLabel = getMonthYearLabel(monthKey);
  const activityIdSet = new Set(activities.map(({ id }) => id));
  const attachmentItems = attachmentState?.key === `${activeUser.id}:${monthKey}` ? attachmentState.items : undefined;
  const provenActivityIds = new Set(
    attachmentItems?.flatMap((item) => linkedActivityIds(item, activityIdSet)) ?? [],
  );
  const proofCounts = attachmentItems?.reduce<Record<string, number>>((counts, item) => {
    for (const id of linkedActivityIds(item, activityIdSet)) counts[id] = (counts[id] ?? 0) + 1;
    return counts;
  }, {});
  const proofPages = attachmentItems ? countAttachmentPages(attachmentItems, activityIdSet) : 0;
  const formsPending = activities.filter((activity) => formReportStatus(activeUser, activity) !== "Enviado").length;
  const deadline = getSubmissionDeadline(monthKey);
  const quickBusy = attachmentsBusy || preparingPrint || restoring;

  const chooseQuickAttach = (activityId: string | null, source: AttachmentSource) => {
    if (quickBusy) return;
    quickPreselectRef.current = activityId;
    if (source === "gallery") quickGalleryRef.current?.click();
    else quickFilesRef.current?.click();
  };

  const handleQuickInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    const activityId = quickPreselectRef.current;
    quickPreselectRef.current = null;
    if (!files.length || quickBusy) return;
    setAttachmentsBusy(true);
    setQuickPrepareProgress({ done: 0, total: files.length });
    try {
      const result = await prepareAttachmentFiles(files, (done, total) => {
        setQuickPrepareProgress({ done, total });
      });
      const effectiveTarget = activityId ?? quickTargetId;
      const accepted = effectiveTarget
        ? result.accepted.map((item) => ({ ...item, activityIds: [effectiveTarget] }))
        : result.accepted;
      if (activityId !== null && quickDrafts === null) {
        setQuickTargetId(activityId);
      } else if (quickDrafts === null) {
        setQuickTargetId(null);
      }
      setQuickDrafts((current) => [...(current ?? []), ...accepted]);
      setQuickErrors(result.rejected);
    } catch {
      setStorageError("Não foi possível preparar os arquivos. Tente novamente.");
    } finally {
      setQuickPrepareProgress(null);
      setAttachmentsBusy(false);
    }
  };

  const closeQuickReview = async () => {
    if (attachmentsBusy) return;
    if (
      quickDrafts?.length &&
      !(await confirm({
        title: "Descartar arquivos selecionados?",
        message:
          "Os arquivos desta seleção ainda não foram salvos. Os comprovantes já salvos serão mantidos.",
        confirmText: "Descartar seleção",
        cancelText: "Continuar conferindo",
        variant: "warning",
      }))
    )
      return;
    setQuickDrafts(null);
    setQuickTargetId(null);
    setQuickErrors([]);
  };

  const saveQuickDrafts = async () => {
    if (!quickDrafts?.length || attachmentsBusy) return;
    const batch = quickDrafts;
    setAttachmentsBusy(true);
    setQuickErrors([]);
    try {
      const next = await savePreparedAttachments({ profileId: activeUser.id, monthKey }, batch);
      setAttachmentState({ key: `${activeUser.id}:${monthKey}`, items: next });
      setQuickDrafts(null);
      setQuickTargetId(null);
      setHasChanges(true);
      setUndoActivity(null);
      setAttachmentsRevision((revision) => revision + 1);
      showToast("Comprovantes salvos.");
    } catch (error) {
      setQuickErrors([
        error instanceof Error
          ? error.message
          : "Não foi possível salvar. Confira os arquivos e tente novamente.",
      ]);
    } finally {
      setAttachmentsBusy(false);
    }
  };
  const changeTab = async (tab: WorkspaceTab) => {
    if (tab === activeTab || (await confirmDraft())) {
      setDraftDirty(false);
      setUndoActivity(null);
      setAttachmentsFocus(null);
      setActiveTab(tab);
      if (tab !== activeTab) window.scrollTo({ top: 0, behavior: "instant" });
    }
  };
  const openProofs = async (activity: Activity) => {
    if (!(await confirmDraft())) return;
    setDraftDirty(false);
    setUndoActivity(null);
    setAttachmentsFocus(activity.id);
    setActiveTab("attachments");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const reportActivity = reportingActivity?.profileId === activeUser.id &&
    reportingActivity.monthKey === monthKey
    ? activities.find((activity) => activity.id === reportingActivity.id)
    : undefined;
  const saveFormReport = (formReport: FormReport) => {
    if (!reportActivity) return false;
    return persistActivities(activities.map((activity) =>
      activity.id === reportActivity.id ? { ...activity, formReport } : activity
    ), "Dados do formulário salvos.");
  };

  return (
    <>
      <div className="screen-only dashboard-shell">
        {/* Header Superior Fixo com Blur */}
        <Navbar
          user={activeUser}
          activeTab={activeTab}
          onTabChange={(tab) => void changeTab(tab)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenSheets={() => setSheetsOpen(true)}
          hasChanges={hasChanges}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenExitModal={openConclusion}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        <main id="conteudo" className="workspace-main" data-tab={activeTab}>
          {notices}
          <div className="workspace-overview" hidden={activeTab === "account"}>
            <div>
              <h1>
                {activeTab === "dashboard" ? "Frequência" : activeTab === "attachments" ? "Comprovantes" : "Folha"}
              </h1>
              <p hidden={activeTab === "attachments"}>
                {activeTab === "dashboard"
                  ? `GAT ${activeUser.gatNumber} · ${activeUser.gatName || gats[activeUser.gatNumber]?.name || "PET"}`
                  : activeTab === "attachments" ? "Fotos e PDFs que acompanham as atividades do mês." : "Confira os dados antes de imprimir e assinar."}
              </p>
            </div>
            <label className="workspace-month">
              <Calendar className="size-4 text-accent" />
              <span>Mês</span>
              <select
                aria-label="Mês da folha"
                value={monthKey}
                onChange={(e) => void changeMonth(e.target.value)}
              >
                {Array.from(new Set([...PROJECT_MONTHS, monthKey]))
                  .sort()
                  .map((month) => (
                    <option key={month} value={month}>
                      {getMonthYearLabel(month)}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {activeTab === "dashboard" && <StatsGrid totalHours={totalHours} activitiesCount={activities.length} targetHours={32} activities={activities} monthKey={monthKey} formsPending={formsPending} view={summaryView} onViewChange={setSummaryView} />}
          {activeTab === "account" && <AccountScreen user={activeUser} onBack={() => setActiveTab("dashboard")} onProfile={() => setIsProfileModalOpen(true)} onSheets={() => setSheetsOpen(true)} onHelp={() => setIsHelpOpen(true)} onAdmin={() => setIsAdminModalOpen(true)} onExit={openConclusion} onRestore={() => document.querySelector<HTMLInputElement>('input[aria-label="Restaurar cópia de segurança"]')?.click()} />}
          {sheetsOpen && (
            <SavedSheets
              profileId={activeUser.id}
              profileLabel={`${activeUser.name} · GAT ${activeUser.gatNumber}`}
              selectedMonth={monthKey}
              onClose={() => setSheetsOpen(false)}
              onOpen={async (month, target) => {
                if (await changeMonth(month)) {
                  setUndoActivity(null);
                  setActiveTab(target);
                  setSheetsOpen(false);
                }
              }}
            />
          )}


          {/* ABA 1: PAINEL DE LANÇAMENTOS */}
          {activeTab === "dashboard" && (
            <div className="frequency-page">
              <div className="frequency-workbench">
                <ActivityForm
                  key={`${activeUser.id}-${monthKey}-${formRevision}`}
                  monthKey={monthKey}
                  onDirtyChange={setDraftDirty}
                  onSave={handleSaveActivity}
                  defaultGatNumber={activeUser.gatNumber}
                  defaultGatName={
                    activeUser.gatName || gats[activeUser.gatNumber]?.name
                  }
                  templates={templates}
                />

                <ActivityTable
                  key={JSON.stringify([activeUser.id, monthKey])}
                  onPrepareForm={(activity) => setReportingActivity({
                    profileId: activeUser.id, monthKey, id: activity.id,
                  })}
                  activities={activities}
                  totalHours={totalHours}
                  editingId={editingActivity ? editingActivity.id : null}
                  onEdit={(act) => setEditingActivity(act)}
                  onDelete={handleDeleteActivity}
                  user={activeUser}
                  monthLabel={monthLabel}
                  monthKey={monthKey}
                  view={summaryView}
                  proofCounts={proofCounts}
                  onOpenProofs={(activity) => void openProofs(activity)}
                  onQuickAttach={(activity, source) => chooseQuickAttach(activity.id, source)}
                  attachDisabled={quickBusy || attachmentItems === undefined}
                  onLoadSamples={handleLoadSamples}
                  onClearMonth={handleClearMonth}
                />
              </div>
              <div className="review-next">
                <p>
                  Registre também cada atividade no{" "}
                  <a target="_blank" rel="noopener noreferrer" href={ACTIVITY_FORM_URL}>
                    formulário do PET-Saúde Clima
                  </a>
                  . Terminou? Confira a folha antes de imprimir.
                </p>
                <button
                  className="primary-button"
                  onClick={async () => {
                    if (await confirmDraft()) {
                      setDraftDirty(false);
                      setActiveTab("official");
                    }
                  }}
                >
                  Conferir folha <ArrowLeft className="rotate-180" size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ABA 2: FOLHA OFICIAL (PREVIEW A4 PAISAGEM) */}
          {activeTab === "official" && (
            <div className="sheet-view animate-fade-in">
                <div className="sheet-mode-tabs" role="group" aria-label="Tipo de folha">
                  <button
                    type="button"
                    onClick={() => setShowBlankTemplate(false)}
                    className="sheet-mode-option"
                    aria-pressed={!showBlankTemplate}
                  >
                    Minha folha
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBlankTemplate(true)}
                    className="sheet-mode-option"
                    aria-pressed={showBlankTemplate}
                  >
                    Modelo em branco
                  </button>
                </div>

              <div className="sheet-layout">
                <aside className="print-panel" aria-labelledby="print-panel-title">
                  {showBlankTemplate ? (
                    <div className="print-panel-intro">
                      <h2 id="print-panel-title">Modelo em branco</h2>
                      <p>Para preencher à mão. Mesmo formato oficial, sem os seus registros.</p>
                    </div>
                  ) : (
                    <div className="print-panel-intro">
                      <h2 id="print-panel-title">Antes de imprimir</h2>
                      <ul className="print-checks">
                        <li data-tone={totalHours >= 32 ? "done" : "warning"}>
                          {totalHours >= 32 ? <CircleCheck size={20} aria-hidden="true" /> : <CircleAlert size={20} aria-hidden="true" />}
                          <span>
                            <strong>{totalHours} de 32 h no mês</strong>
                            <small>{totalHours >= 32 ? "Referência mensal alcançada." : `Faltam ${32 - totalHours} h para a referência mensal.`}</small>
                          </span>
                        </li>
                        <li data-tone={formsPending ? "warning" : "done"}>
                          {formsPending ? <CircleAlert size={20} aria-hidden="true" /> : <CircleCheck size={20} aria-hidden="true" />}
                          <span>
                            <strong>{formsPending ? `${formsPending} ${formsPending === 1 ? "atividade pendente" : "atividades pendentes"} no Forms` : "Forms em dia"}</strong>
                            {formsPending ? (
                              <button type="button" className="text-button" onClick={() => void changeTab("dashboard")}>Ver pendências</button>
                            ) : (
                              <small>Envios marcados em todas as atividades.</small>
                            )}
                          </span>
                        </li>
                        <li data-tone={attachmentItems?.length ? "done" : "neutral"}>
                          <Paperclip size={20} aria-hidden="true" />
                          <span>
                            <strong>
                              {attachmentItems === undefined
                                ? "Conferindo comprovantes…"
                                : attachmentItems.length
                                  ? `${attachmentItems.length} ${attachmentItems.length === 1 ? "comprovante" : "comprovantes"} · ${proofPages} ${proofPages === 1 ? "página" : "páginas"}`
                                  : "Sem comprovantes"}
                            </strong>
                            <small>{attachmentItems?.length ? "Entram depois das assinaturas." : "Opcional. Adicione em Comprovantes se o seu GAT pedir."}</small>
                          </span>
                        </li>
                        <li data-tone="neutral">
                          <CalendarDays size={20} aria-hidden="true" />
                          <span>
                            <strong>Entrega até {formatShortDate(deadline)}</strong>
                            <small>1º dia útil de {getMonthName(deadline.slice(0, 7))}. Envie como o seu GAT orientar.</small>
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}
                  <p className="print-paper">
                    <Printer size={18} aria-hidden="true" />
                    <span>Papel <strong>A4</strong> · orientação <strong>Horizontal</strong></span>
                  </p>
                  <div className="print-actions">
                    {showBlankTemplate && (
                      <a
                        href="/templates/PET%20-%20Folha%20de%20Frequ%C3%AAncia%20-%20Modelo%20Vazio.pdf"
                        download="PET - Folha de Frequência - Modelo Vazio.pdf"
                        className="primary-button"
                      >
                        <Download size={18} aria-hidden="true" />
                        Baixar modelo em PDF
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => void handlePrint()}
                      disabled={preparingPrint || attachmentsBusy}
                      aria-busy={preparingPrint}
                      className={showBlankTemplate ? "secondary-button" : "primary-button"}
                    >
                      {preparingPrint ? <InlineSpinner size={18} /> : <Printer size={18} aria-hidden="true" />}
                      {preparingPrint ? "Preparando PDF…" : showBlankTemplate ? "Imprimir modelo" : "Imprimir ou salvar PDF"}
                    </button>
                    <p>Para gerar o arquivo, escolha “Salvar como PDF” no destino da impressão.</p>
                  </div>
                </aside>

                <section className="sheet-preview" aria-label="Prévia da folha">
                  <div className="sheet-stage overflow-x-auto max-w-full p-2.5 sm:p-8 md:p-10 bg-canvas rounded-2xl border border-line flex justify-start sm:justify-center shadow-inner">
                    <div className="shadow-[var(--page-shadow)] rounded-xs ring-1 ring-line overflow-hidden">
                      <OfficialSheet
                        user={activeUser}
                        monthLabel={monthLabel}
                        activities={activities}
                        totalHours={totalHours}
                        isBlankTemplate={showBlankTemplate}
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

              {activeTab === "attachments" && (
                <MonthlyAttachments
                  key={JSON.stringify([activeUser.id, monthKey, formRevision])}
                  profileId={activeUser.id}
                  monthKey={monthKey}
                  activities={activities}
                  busy={attachmentsBusy || preparingPrint || restoring}
                  focusActivityId={attachmentsFocus}
                  onFocusChange={setAttachmentsFocus}
                  onBusyChange={setAttachmentsBusy}
                  onChange={() => { setHasChanges(true); setUndoActivity(null); setAttachmentsRevision((revision) => revision + 1); }}
                />
              )}
          {activeTab !== "attachments" && (
            <>
              <input
                ref={quickGalleryRef}
                className="sr-only"
                type="file"
                multiple
                aria-label="Adicionar fotos da galeria"
                accept="image/*"
                disabled={quickBusy}
                onChange={(event) => void handleQuickInputChange(event)}
              />
              <input
                ref={quickFilesRef}
                className="sr-only"
                type="file"
                multiple
                aria-label="Adicionar comprovantes"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                disabled={quickBusy}
                onChange={(event) => void handleQuickInputChange(event)}
              />
            </>
          )}
          {quickDrafts !== null && activeTab !== "attachments" && (
            <AttachmentReviewModal
              drafts={quickDrafts}
              activities={activities}
              savedPages={proofPages}
              provenIds={provenActivityIds}
              targetActivityId={quickTargetId}
              busy={attachmentsBusy}
              reviewErrors={quickErrors}
              onClose={() => {
                void closeQuickReview();
              }}
              onSave={() => {
                void saveQuickDrafts();
              }}
              onAddMore={(source) => chooseQuickAttach(quickTargetId, source)}
              onUpdateDrafts={(updater) => setQuickDrafts((current) => updater(current ?? []))}
            />
          )}
          {reportActivity && (
            <ActivityReportModal
              key={JSON.stringify([activeUser.id, monthKey, reportActivity.id])}
              activity={reportActivity}
              user={activeUser}
              onClose={() => setReportingActivity(null)}
              onEditProfile={() => setIsProfileModalOpen(true)}
              onSaveProfile={handleSaveProfile}
              onSave={saveFormReport}
            />
          )}

          {/* Modal de Identificação do Participante */}
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={activeUser}
            allProfiles={profiles}
            gats={gats}
            roles={roles}
            onSaveProfile={handleSaveProfile}
          />

          {/* Modal Dedicado de Edição de Atividade */}
          <EditActivityModal
            isOpen={Boolean(editingActivity)}
            onClose={() => setEditingActivity(null)}
            activity={editingActivity}
            onSave={handleSaveActivity}
            onDelete={handleDeleteActivity}
            defaultGatNumber={activeUser.gatNumber}
            defaultGatName={
              activeUser.gatName || gats[activeUser.gatNumber]?.name
            }
            templates={templates}
            monthKey={monthKey}
          />

          {/* Modal de configurações locais */}
          <AdminModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            profiles={profiles}
            gats={gats}
            roles={roles}
            templates={templates}
            onProfilesChange={(updated) => {
              setProfiles(updated);
              if (activeUser && !updated.some((p) => p.id === activeUser.id)) {
                if (updated.length > 0) handleSelectProfile(updated[0]);
              }
            }}
            onGatsChange={(updated) => setGats(updated)}
            onRolesChange={(updated) => setRoles(updated)}
            onTemplatesChange={(updated) => setTemplates(updated)}
          />

          {/* Modal de Saída / Backup Obrigatório */}
          <ExitModal
            isOpen={isExitModalOpen}
            onClose={() => setIsExitModalOpen(false)}
            onConfirmExit={() => {
              setDraftDirty(false);
              setActiveTab("dashboard");
              setIsExitModalOpen(false);
              setActiveProfileId(null);
              setActiveUser(null);
              setActivities([]);
              setHasChanges(false);
              showToast("Sessão encerrada com sucesso.");
            }}
            onDownloadJson={handleExportBackup}
            onDownloadPdf={printParticipantSheet}
            userName={activeUser.name}
            hasChanges={hasChanges}
          />

          {/* Modal de Feedback & Avaliação */}
          <FeedbackModal
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
          />

          {/* Toast Notificação Minimalista */}
          {toastMessage && <Toast key={toastRevision} message={toastMessage} onClose={() => { setToastMessage(null); setUndoActivity(null); }} onUndo={undoActivity && undoActivity.profileId === activeUser.id && undoActivity.month === monthKey && JSON.stringify(activities) === undoActivity.after ? () => {
            persistActivities(undoActivity.before, "Última alteração desfeita.");
          } : undefined} />}
        </main>

        <SiteFooter
          compact
          onHelp={() => setIsHelpOpen(true)}
          onFeedback={() => setIsFeedbackModalOpen(true)}
        />
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>

      {/* ============================================================
           CONTAINER EXCLUSIVO DE IMPRESSÃO (@media print)
           ============================================================ */}
      <div
        ref={printSheetRef}
        className="print-only-wrapper"
        data-profile-id={activeUser.id}
        data-month={monthKey}
        data-blank={showBlankTemplate}
      >
        <OfficialSheet
          user={activeUser}
          monthLabel={monthLabel}
          activities={activities}
          totalHours={totalHours}
          isBlankTemplate={showBlankTemplate}
        />
      </div>
      <div ref={printAttachmentsRef} className="print-attachments" aria-hidden="true" />
    </>
  );
}
