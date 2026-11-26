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
  getSheetSubmission,
  setSheetSubmission,
  loadSampleActivitiesForUser,
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
  linkedActivityIds,
  listAttachments,
  prepareAttachmentFiles,
  savePreparedAttachments,
  type Attachment,
} from "@/lib/attachments";
import { restoreWithAttachments } from "@/lib/attachment-backup";
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
  getSubmissionPeriod,
} from "@/lib/pet-calculator";
import { formReportStatus } from "@/lib/form-report";
import { SavedSheets } from "@/components/SavedSheets";
import "@/components/print-panel.css";
import { Navbar, AccountScreen, MobileNavigation, type WorkspaceTab } from "@/components/Navbar";
import { Toast } from "@/components/Toast";
import { ProfileModal } from "@/components/ProfileModal";
import { AdminModal } from "@/components/AdminModal";
import { StatsGrid, useSummaryView } from "@/components/StatsGrid";
import { ActivityForm } from "@/components/ActivityForm";
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
import { SheetPdfResult, type SheetPdfAction } from "@/components/SheetPdfResult";
import { SheetPreview } from "@/components/SheetPreview";
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
  CloudUpload,
  CircleAlert,
  CircleCheck,
  Download,
  FileText,
  Paperclip,
  Printer,
  ArrowLeft,
} from "lucide-react";
import { useDialog } from "@/context/DialogContext";
import { FirstEntry } from "@/components/FirstEntry";
import { SyncStatus } from "@/components/SyncStatus";
import { SyncConflictModal } from "@/components/SyncConflictModal";
import { fetchGoogleSession, logoutGoogle, type GoogleLoginError, type GoogleSession } from "@/lib/google-session";
import { driveFolderUrl, forgetAccountState, markMonthDirty, saveSheetPdf } from "@/lib/drive-sync";
import { useDriveSync } from "@/lib/use-drive-sync";
import { createMonthBackup, removeMonthAttachments } from "@/lib/month-backup";
import { removeProfileFromDevice } from "@/lib/storage";

export default function Home() {
  const { alert, confirm } = useDialog();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [helpTopic, setHelpTopic] = useState<"general" | "install" | null>(null);
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
  const [mobileActivitySlot, setMobileActivitySlot] = useState<HTMLDivElement | null>(null);
  const [showBlankTemplate, setShowBlankTemplate] = useState(false);
  const [reportingActivity, setReportingActivity] = useState<{
    profileId: string; monthKey: string; id: string;
  } | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [attachmentsBusy, setAttachmentsBusy] = useState(false);
  const [preparingPrint, setPreparingPrint] = useState(false);
  const printInProgress = useRef(false);
  const pdfScope = useRef<object>(null);
  const cachedPdf = useRef<{ scope: object; blank: boolean; file: File } | null>(null);
  const [pdfResult, setPdfResult] = useState<{ file: File; action: SheetPdfAction } | null>(null);
  const [savedPdf, setSavedPdf] = useState<{ month: string | null; sub: string; url: string } | null>(null);
  const [period, setPeriod] = useState(() => getSubmissionPeriod());
  const [, refreshSubmission] = useState(0);
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

  // Google login and Drive copy. Without server credentials the app keeps the local-only mode.
  const [google, setGoogle] = useState<GoogleSession | null>(null);
  const [loginError, setLoginError] = useState<GoogleLoginError>();
  useEffect(() => {
    let current = true;
    const url = new URL(window.location.href);
    const params = url.searchParams;
    if (params.get("login") === "erro") {
      const reason = params.get("motivo");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- The OAuth callback reports failures through the URL once.
      setLoginError(reason === "permissao" ? "permission" : reason === "negado" ? "denied" : "failed");
      params.delete("login");
      params.delete("motivo");
      window.history.replaceState(window.history.state, "", url);
    }
    fetchGoogleSession().then((session) => {
      if (!current) return;
      if (session.authenticated) setLoginError(undefined);
      setGoogle(session);
    });
    return () => { current = false; };
  }, []);
  const cloudMode = google?.configured === true;
  const syncSub = !cloudMode
    ? undefined
    : google.authenticated
      ? google.sub
      : google.unreachable
        ? activeUser?.googleSub
        : undefined;
  const syncUser = activeUser && syncSub && activeUser.googleSub === syncSub ? activeUser : null;
  const googlePicture = syncUser ? google?.picture : undefined;
  const sync = useDriveSync({
    enabled: Boolean(syncUser),
    sub: syncSub,
    email: google?.email,
    user: syncUser,
    onRemoteApplied: (months) => {
      const stored = getStoredProfiles();
      setProfiles(stored);
      const fresh = stored.find((profile) => profile.id === activeUser?.id);
      if (fresh) setActiveUser(fresh);
      if (fresh && months.includes(monthKey)) {
        setActivities(sortActivitiesChronologically(getActivitiesForMonth(fresh.id, monthKey)));
        setAttachmentsRevision((revision) => revision + 1);
        if (!draftDirty) setFormRevision((revision) => revision + 1);
      }
      showToast("Folha atualizada com o Google Drive.");
    },
  });
  const activeProfileId = activeUser?.id;
  useEffect(() => {
    const refreshPeriod = () => setPeriod(getSubmissionPeriod());
    window.addEventListener("focus", refreshPeriod);
    const onStorage = () => refreshSubmission((revision) => revision + 1);
    window.addEventListener("storage", onStorage);
    const timer = window.setInterval(refreshPeriod, 60_000);
    return () => {
      window.removeEventListener("focus", refreshPeriod);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    pdfScope.current = {};
    cachedPdf.current = null;
    return () => { pdfScope.current = null; };
  }, [activeUser, monthKey, showBlankTemplate, activities, attachmentsRevision, syncSub]);
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

  // Open the profile linked to the signed-in Google account.
  useEffect(() => {
    if (!ready || !cloudMode || !google?.authenticated || activeUser?.googleSub === google.sub) return;
    const linked = profiles.find((profile) => profile.googleSub === google.sub);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- The linked profile opens after the session check; another account's profile must not stay open.
    if (linked) handleSelectProfile(linked);
    else if (activeUser) setActiveUser(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleSelectProfile only reads the current month.
  }, [ready, cloudMode, google, profiles, activeUser]);

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
      sync.schedule(monthKey);
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
      sync.schedule(monthKey);
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

  const exportSheet = async (action: SheetPdfAction | "drive", blank = showBlankTemplate): Promise<boolean> => {
    const scope = pdfScope.current;
    if (!scope || !activeUser || printInProgress.current || (!blank && attachmentsBusy) || importInProgress.current)
      return false;
    if (action === "drive" && (!syncUser || !syncSub)) return false;

    const stillCurrent = () => pdfScope.current === scope;
    printInProgress.current = true;
    setPreparingPrint(true);
    try {
      const cached = cachedPdf.current;
      let file = cached?.scope === scope && cached.blank === blank ? cached.file : null;
      if (!file) {
        const { createSheetPdf } = await import("@/lib/sheet-pdf");
        let partial = false;
        file = await createSheetPdf(activeUser, monthKey, activities, blank,
          (done, total) => setPrintProgress({ done, total }),
          async () => {
            setPrintProgress(null);
            partial = await confirm({
              title: "Gerar PDF só com a folha?",
              message: "Não foi possível incluir os comprovantes deste mês.",
              confirmText: "Gerar só a folha",
              cancelText: "Voltar",
              variant: "warning",
            });
            return partial;
          });
        if (file && stillCurrent() && !partial) cachedPdf.current = { scope, blank, file };
        if (file && stillCurrent() && partial && action === "drive") {
          // Preserve a previously exported complete PDF when proof preparation failed.
          setPdfResult({ file, action: "download" });
          return false;
        }
      }
      if (!file) return false;
      if (!stillCurrent()) throw new Error("A folha mudou durante o preparo. Tente novamente.");
      if (action === "drive" && syncSub) {
        try {
          const pdfMonth = blank ? null : monthKey;
          if (pdfMonth) await sync.flush();
          const saved = await saveSheetPdf(syncSub, pdfMonth, file, stillCurrent);
          if (stillCurrent()) {
            setSavedPdf({ month: pdfMonth, sub: syncSub, url: saved.url });
            showToast("PDF salvo no Drive.");
          }
        } catch (error) {
          await alert({
            title: "Não foi possível salvar no Drive",
            message: error instanceof Error ? error.message : "Tente novamente.",
            variant: "warning",
          });
          if (stillCurrent()) setPdfResult({ file, action: "download" });
          return false;
        }
      } else if (action !== "drive") {
        setPdfResult({ file, action });
      }
      return true;
    } catch (error) {
      await alert({
        title: "Não foi possível preparar o PDF",
        message: error instanceof Error ? error.message : "Tente novamente.",
        variant: "warning",
      });
      return false;
    } finally {
      printInProgress.current = false;
      setPreparingPrint(false);
      setPrintProgress(null);
    }
  };

  // Exportar Backup Local em JSON
  const handleExportBackup = async (): Promise<boolean> => {
    if (!activeUser || attachmentsBusy || importInProgress.current) return false;
    let jsonString: string;
    try {
      jsonString = await createMonthBackup(activeUser, monthKey);
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
  const handleImportBackup = async (file: File, firstGoogleAccount?: { sub: string; email?: string }) => {
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
      // Signed in with Google: the copy becomes a month of the linked profile.
      if (syncUser) preview.user = syncUser;
      else if (firstGoogleAccount) {
        const backupUser = preview.user!;
        preview.user = {
          ...backupUser,
          id: crypto.randomUUID(),
          googleSub: firstGoogleAccount.sub,
          email: backupUser.email || firstGoogleAccount.email,
        };
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
        message: `${preview.user!.name} · ${getMonthYearLabel(preview.monthKey!)} · ${preview.activities!.length} atividades. ${contents} ${existing ? "Os dados deste perfil e deste mês serão substituídos pela cópia. Os outros meses serão preservados." : "O perfil e os registros desta cópia serão adicionados neste navegador."}${syncUser || firstGoogleAccount ? " O mês será enviado à pasta PET Folha do seu Drive." : ""}`,
        confirmText: "Restaurar cópia",
        cancelText: "Cancelar",
        variant: "warning",
      });
      if (!accepted) return;
      if (firstGoogleAccount && getStoredProfiles().some((profile) => profile.googleSub === firstGoogleAccount.sub)) {
        setRestoreIssue({ code: "PROFILE_CONFLICT", message: "Já existe uma folha vinculada a esta conta neste navegador. Recarregue a página, abra a folha e importe a cópia na Conta." });
        return;
      }
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
      if (firstGoogleAccount) markMonthDirty(firstGoogleAccount.sub, result.monthKey!);
      else sync.schedule(result.monthKey!);
      showToast(syncUser || firstGoogleAccount ? "Cópia restaurada. Confira o envio ao Drive no topo da página." : "Cópia restaurada. Confira o mês e os registros.");
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
          title="Preparando PDF"
          done={printProgress.done}
          total={printProgress.total}
          steps={[
            { label: "Preparando comprovantes", state: "active" },
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

  if (!ready || google === null) return <WorkspaceSkeleton />;

  // Login com Google obrigatório quando o servidor tem as credenciais.
  if (cloudMode && !syncUser) {
    // The linked profile is being opened by the effect above.
    if (google.authenticated && profiles.some((profile) => profile.googleSub === google.sub)) return <WorkspaceSkeleton />;
    const signOut = async () => {
      await logoutGoogle();
      setGoogle({ configured: true, authenticated: false });
    };
    return (
      <>
        {notices}
        {google.authenticated && google.sub ? (
          <FirstEntry
            session={{ ...google, sub: google.sub }}
            localProfiles={getProfilesForAccess(profiles).filter((profile) => !profile.googleSub)}
            gats={gats}
            roles={roles}
            onSignOut={() => void signOut()}
            onImport={(file) => void handleImportBackup(file, { sub: google.sub!, email: google.email })}
            importing={restoring}
            onDone={(user, pushMonths) => {
              for (const month of pushMonths) markMonthDirty(google.sub!, month);
              setProfiles(getStoredProfiles());
              handleSelectProfile(user);
              showToast(pushMonths.length ? "Folha vinculada. Enviando para o seu Drive…" : "Folha aberta.");
            }}
          />
        ) : (
          <LandingPage
            google
            loginError={loginError ?? (google.unreachable ? "unavailable" : undefined)}
            onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          />
        )}
        <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
        {toastMessage && <Toast key={toastRevision} message={toastMessage} onClose={() => setToastMessage(null)} />}
      </>
    );
  }

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
  const previousStatus = getSheetSubmission(activeUser.id, period.previous);
  const selectedStatus = getSheetSubmission(activeUser.id, monthKey);
  const showSubmissionReminder = activeTab !== "account" && period.due && previousStatus !== "sent" &&
    getActivitiesForMonth(activeUser.id, period.previous).length > 0;
  const namePreviousMonth = getMonthName(period.previous);

  async function respondToSubmission(target: string, sent: boolean, advance = false) {
    if (!activeUser || !(await confirmDraft())) return;
    try {
      setSheetSubmission(activeUser.id, target, sent ? "sent" : "pending");
      refreshSubmission((revision) => revision + 1);
      sync.schedule(target);
      if (advance) {
        setEditingActivity(null);
        setUndoActivity(null);
        setAttachmentsFocus(null);
        setMonthKey(sent ? period.current : target);
        setShowBlankTemplate(false);
        setActiveTab(sent ? "dashboard" : "official");
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      if (sent) showToast("Folha marcada como enviada.");
    } catch {
      showToast("Não foi possível salvar o estado da entrega. Tente novamente.");
    }
  }

  async function showPreviousSheet() {
    if (!(await changeMonth(period.previous))) return;
    setShowBlankTemplate(false);
    setActiveTab("official");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
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
      sync.schedule(monthKey);
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
          googlePicture={googlePicture}
          activeTab={activeTab}
          onTabChange={(tab) => void changeTab(tab)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          hasChanges={hasChanges}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenExitModal={openConclusion}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          onOpenHelp={() => setHelpTopic("general")}
          cloud={syncUser && syncSub ? { status: <SyncStatus sync={sync} />, folderUrl: driveFolderUrl(syncSub) } : undefined}
        />

        <main id="conteudo" className="workspace-main" data-tab={activeTab}>
          {notices}
          {showSubmissionReminder && (
            <section className="submission-reminder" aria-labelledby="submission-reminder-title">
              <CalendarDays size={19} aria-hidden="true" />
              <h2 id="submission-reminder-title">
                {previousStatus === "pending" ? `Folha de ${namePreviousMonth} pendente` : `Você enviou a folha de ${namePreviousMonth} à coordenação?`}
              </h2>
              <div className="submission-actions">
                <button type="button" className="secondary-button" onClick={() => void (previousStatus === "pending" ? showPreviousSheet() : respondToSubmission(period.previous, false, true))}>
                  {previousStatus === "pending" ? "Ver folha" : "Ainda não"}
                </button>
                <button type="button" className="primary-button" onClick={() => void respondToSubmission(period.previous, true, true)}>
                  {previousStatus === "pending" ? "Já enviei" : "Sim, já enviei"}
                </button>
              </div>
            </section>
          )}
          <div className="workspace-overview" hidden={activeTab === "account"}>
            <div className="workspace-title-row">
              <div>
                <h1>{activeTab === "dashboard" ? "Frequência" : activeTab === "attachments" ? "Comprovantes" : "Folha"}</h1>
                {activeTab === "dashboard" && <p>GAT {activeUser.gatNumber} · {activeUser.gatName || gats[activeUser.gatNumber]?.name || "PET"}</p>}
              </div>
              {activeTab === "dashboard" && <div className="mobile-add-slot" ref={setMobileActivitySlot} />}
            </div>
            <div className="workspace-overview-actions">
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
              {activeTab === "official" && (
                <button type="button" className="secondary-button" aria-haspopup="dialog" onClick={() => setSheetsOpen(true)}>
                  <FileText size={18} aria-hidden="true" />Minhas folhas
                </button>
              )}
            </div>
          </div>

          {activeTab === "dashboard" && <StatsGrid totalHours={totalHours} activitiesCount={activities.length} targetHours={32} activities={activities} monthKey={monthKey} formsPending={formsPending} view={summaryView} onViewChange={setSummaryView} />}
          {activeTab === "account" && <AccountScreen user={activeUser} googlePicture={googlePicture} googleEmail={syncUser ? google?.email : undefined} onBack={() => setActiveTab("dashboard")} onProfile={() => setIsProfileModalOpen(true)} onHelp={() => setHelpTopic("general")} onInstall={() => setHelpTopic("install")} onAdmin={() => setIsAdminModalOpen(true)} onExit={openConclusion} onRestore={() => document.querySelector<HTMLInputElement>('input[aria-label="Restaurar cópia de segurança"]')?.click()} onDownload={syncUser ? () => void handleExportBackup() : undefined} onOpenDrive={syncUser && syncSub ? () => window.open(driveFolderUrl(syncSub), "_blank", "noopener") : undefined} />}
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
                  mobileActionSlot={mobileActivitySlot}
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
                  <div className="print-panel-toolbar">
                    <div>
                      <h2 id="print-panel-title">{showBlankTemplate ? "Modelo em branco" : "Conferir folha"}</h2>
                      <p className="print-paper">A4 horizontal</p>
                    </div>
                    <div className="print-actions">
                      <button type="button" className="primary-button" disabled={preparingPrint || (!showBlankTemplate && attachmentsBusy)} onClick={() => void exportSheet("download")}>
                        <Download size={18} aria-hidden="true" />Baixar PDF
                      </button>
                      <button type="button" className="secondary-button" disabled={preparingPrint || (!showBlankTemplate && attachmentsBusy)} onClick={() => void exportSheet("print")}>
                        <Printer size={18} aria-hidden="true" />Imprimir PDF
                      </button>
                      {syncUser && (
                        <button type="button" className="secondary-button" disabled={preparingPrint || (!showBlankTemplate && attachmentsBusy)} onClick={() => void exportSheet("drive")}>
                          <CloudUpload size={18} aria-hidden="true" />Salvar PDF no Drive
                        </button>
                      )}
                    </div>
                  </div>
                  {!showBlankTemplate && (
                    <ul className="print-checks">
                      <li data-tone={totalHours >= 32 ? "done" : "warning"}>
                        {totalHours >= 32 ? <CircleCheck size={20} aria-hidden="true" /> : <CircleAlert size={20} aria-hidden="true" />}
                        <span>
                          <strong>{totalHours} de 32 h no mês</strong>
                        </span>
                      </li>
                      <li data-tone={formsPending ? "warning" : "done"}>
                        {formsPending ? <CircleAlert size={20} aria-hidden="true" /> : <CircleCheck size={20} aria-hidden="true" />}
                        <span>
                          <strong>{formsPending ? `${formsPending} ${formsPending === 1 ? "atividade pendente" : "atividades pendentes"} no Forms` : "Forms em dia"}</strong>
                          {formsPending ? (
                            <button type="button" className="text-button" onClick={() => void changeTab("dashboard")}>Ver pendências</button>
                          ) : null}
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
                        </span>
                      </li>
                      <li data-tone="neutral">
                        <CalendarDays size={20} aria-hidden="true" />
                        <span>
                          <strong>{selectedStatus === "sent" ? "Entrega marcada como enviada" : `Entrega até ${formatShortDate(deadline)}`}</strong>
                          {monthKey < period.current && activities.length > 0 && !(showSubmissionReminder && monthKey === period.previous) && (
                            <button type="button" className="text-button" onClick={() => void respondToSubmission(monthKey, selectedStatus !== "sent")}>
                              {selectedStatus === "sent" ? "Desfazer confirmação" : "Marcar como enviada"}
                            </button>
                          )}
                        </span>
                      </li>
                    </ul>
                  )}
                  {preparingPrint && <p className="print-progress" aria-live="polite"><InlineSpinner size={16} /> Preparando PDF…</p>}
                  {savedPdf?.month === (showBlankTemplate ? null : monthKey) && savedPdf.sub === syncSub && (
                    <a href={savedPdf.url} target="_blank" rel="noopener" className="text-button print-drive-link">Abrir PDF no Drive</a>
                  )}
                </aside>

                <SheetPreview>
                  <OfficialSheet user={activeUser} monthLabel={monthLabel} activities={activities} totalHours={totalHours} isBlankTemplate={showBlankTemplate} />
                </SheetPreview>
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
                  onChange={() => { setHasChanges(true); setUndoActivity(null); setAttachmentsRevision((revision) => revision + 1); sync.schedule(monthKey); }}
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
              googleEmail={syncUser ? google?.email : undefined}
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
            googleEmail={syncUser ? google?.email : undefined}
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
            onDownloadPdf={() => exportSheet("download", false)}
            userName={activeUser.name}
            hasChanges={hasChanges}
            cloud={syncUser && syncSub ? {
              email: google?.email,
              pending: sync.pending,
              hasSynced: Boolean(sync.lastSynced),
              offline: sync.status === "offline",
              onLogout: async (eraseDevice) => {
                if (sync.pending) await sync.flush();
                if (eraseDevice) {
                  await removeMonthAttachments(activeUser.id, PROJECT_MONTHS).catch(() => undefined);
                  removeProfileFromDevice(activeUser.id);
                  forgetAccountState(syncSub);
                  setProfiles(getStoredProfiles());
                } else setActiveProfileId(null);
                await logoutGoogle();
                setIsExitModalOpen(false);
                setDraftDirty(false);
                setActiveTab("dashboard");
                setActiveUser(null);
                setActivities([]);
                setHasChanges(false);
                setGoogle({ configured: true, authenticated: false });
                showToast(eraseDevice ? "Você saiu e os dados deste aparelho foram apagados." : "Você saiu da conta.");
              },
            } : undefined}
          />
          {sync.conflict && (
            <SyncConflictModal
              key={sync.conflict.monthKey}
              conflict={sync.conflict}
              busy={sync.resolving}
              local={(() => {
                const items = getActivitiesForMonth(activeUser.id, sync.conflict.monthKey);
                return { activities: items.length, hours: items.reduce((sum, item) => sum + item.hours, 0) };
              })()}
              onResolve={(keep) => void sync.resolveConflict(keep)}
            />
          )}

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
          onBlankSheet={async () => {
            if (!(await confirmDraft())) return;
            setShowBlankTemplate(true);
            setActiveTab("official");
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          onHelp={() => setHelpTopic("general")}
          onFeedback={() => setIsFeedbackModalOpen(true)}
        />
        <MobileNavigation activeTab={activeTab} onTabChange={(tab) => void changeTab(tab)} />
        <HelpModal google={Boolean(syncUser)} topic={helpTopic ?? undefined} isOpen={helpTopic !== null} onClose={() => setHelpTopic(null)} />
      </div>

      {/* ============================================================
           CONTAINER EXCLUSIVO DE IMPRESSÃO (@media print)
           ============================================================ */}
      <div
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
      {pdfResult && <SheetPdfResult {...pdfResult} onClose={() => setPdfResult(null)} />}
    </>
  );
}
