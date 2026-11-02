import {
  Activity,
  UserProfile,
  UserRole,
  GATInfo,
  DEFAULT_GATS,
  DEFAULT_ROLES,
  ActivityTemplate,
} from "@/types";
import {
  calcPetHours,
  cleanActivityDescription,
  sortActivitiesChronologically,
} from "./pet-calculator";

const PROFILES_KEY = "pet_folha_profiles_v2";
const ACTIVE_PROFILE_ID_KEY = "pet_folha_active_profile_id_v2";
const ACTIVITIES_PREFIX = "pet_folha_activities_v2_";
const GATS_KEY = "pet_folha_config_gats_v2";
const ROLES_KEY = "pet_folha_config_roles_v2";
const TEMPLATES_KEY = "pet_folha_config_templates_v2";

export const DEFAULT_PROFILES: UserProfile[] = [];

export const DEFAULT_TEMPLATES: ActivityTemplate[] = [
  {
    id: "tpl-1",
    name: "Reunião do GAT {gatNumber} ({gatName})",
    modality: "Síncrona virtual",
    isGatSpecific: true,
  },
  {
    id: "tpl-2",
    name: "Reunião geral do PET",
    modality: "Síncrona presencial",
  },
];

// ============================================================
// FUNÇÕES DE NORMALIZAÇÃO E ANTI-DUPLICIDADE
// ============================================================

export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function deduplicateProfiles(profiles: UserProfile[]): UserProfile[] {
  const seen = new Map<string, UserProfile>();
  for (const p of profiles) {
    const key = normalizeName(p.name);
    if (!seen.has(key)) {
      seen.set(key, p);
    }
  }
  return Array.from(seen.values());
}

function removeLegacyPin(
  profile: UserProfile & { pin?: unknown },
): UserProfile {
  const cleanProfile = { ...profile };
  delete cleanProfile.pin;
  return cleanProfile;
}

// ============================================================
// GESTÃO DE PERFIS (USUÁRIOS)
// ============================================================

export function getStoredProfiles(): UserProfile[] {
  if (typeof window === "undefined") return DEFAULT_PROFILES;
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    if (!data) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return DEFAULT_PROFILES;

    // Remove o PIN legado de perfil e desduplica os registros locais.
    const hadLegacyPin = parsed.some(
      (profile) =>
        typeof profile === "object" && profile !== null && "pin" in profile,
    );
    const sanitized = parsed.map(removeLegacyPin);
    const deduplicated = deduplicateProfiles(sanitized);
    if (hadLegacyPin || deduplicated.length !== parsed.length) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(deduplicated));
    }
    return deduplicated;
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  if (typeof window === "undefined") return;
  const clean = deduplicateProfiles(profiles.map(removeLegacyPin));
  localStorage.setItem(PROFILES_KEY, JSON.stringify(clean));
}

// Fingerprints dos cinco exemplos distribuídos em 208e663. A filtragem é só
// de apresentação: perfis e atividades nunca são apagados ou regravados aqui.
const LEGACY_EXAMPLES = new Set([
  "eb49f6bb",
  "c5c2db38",
  "85a70284",
  "759ff299",
  "78136f57",
]);

export function getProfilesForAccess(profiles: UserProfile[]): UserProfile[] {
  if (typeof window === "undefined") return profiles;
  try {
    const activeId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
    const activityKeys = Array.from({ length: localStorage.length }, (_, i) =>
      localStorage.key(i),
    );
    return profiles.filter((profile) => {
      if (profile.id === activeId) return true;
      // Um campo extra ou qualquer chave de atividades indica uso do perfil.
      if (
        Object.keys(profile).some((key) => ![
          "id", "name", "role", "gatNumber", "gatName", "createdAt", "email",
        ].includes(key))
      ) return true;
      if (
        activityKeys.some((key) => key?.startsWith(`${ACTIVITIES_PREFIX}${profile.id}_`))
      ) return true;
      const signature = JSON.stringify([
        profile.id, profile.name, profile.role, profile.gatNumber,
        profile.gatName, profile.createdAt, profile.email,
      ]);
      let hash = 2166136261;
      for (let i = 0; i < signature.length; i++) {
        hash = Math.imul(hash ^ signature.charCodeAt(i), 16777619);
      }
      return !LEGACY_EXAMPLES.has((hash >>> 0).toString(16));
    });
  } catch {
    return profiles;
  }
}

export function getActiveProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const profiles = getStoredProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
  if (!activeId) return null;
  return profiles.find((p) => p.id === activeId) || null;
}

export function setActiveProfileId(profileId: string | null): void {
  if (typeof window === "undefined") return;
  if (profileId) {
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, profileId);
  } else {
    localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
  }
}

export function registerProfile(data: {
  name: string;
  email?: string;
  role: UserRole;
  gatNumber: string;
}): {
  success: boolean;
  user?: UserProfile;
  existingUser?: UserProfile;
  error?: string;
} {
  const profiles = getStoredProfiles();
  const trimmedName = data.name.trim();

  // Validação Anti-Duplicidade por Nome
  const normalizedNew = normalizeName(trimmedName);
  const existingUser = profiles.find(
    (p) => normalizeName(p.name) === normalizedNew,
  );
  if (existingUser) {
    return {
      success: false,
      existingUser,
      error: `Já existe um participante cadastrado como "${trimmedName}".`,
    };
  }

  // Validação Anti-Duplicidade por E-mail (se informado)
  if (data.email) {
    const cleanEmail = data.email.trim().toLowerCase();
    if (profiles.some((p) => p.email && p.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: "Já existe um participante cadastrado com este e-mail.",
      };
    }
  }

  const gats = getStoredGats();
  const gatInfo = gats[data.gatNumber] || { name: `GAT ${data.gatNumber}` };
  const baseId = trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const uniqueId = `${baseId}-${Date.now().toString(36).slice(-4)}`;

  const newProfile: UserProfile = {
    id: uniqueId,
    name: trimmedName,
    email: data.email?.trim().toLowerCase(),
    role: data.role,
    gatNumber: data.gatNumber,
    gatName: gatInfo.name,
    createdAt: new Date().toISOString(),
  };

  const updated = [...profiles, newProfile];
  saveProfiles(updated);
  setActiveProfileId(newProfile.id);

  return { success: true, user: newProfile };
}

export function deleteUserProfile(profileId: string): void {
  if (typeof window === "undefined") return;
  const profiles = getStoredProfiles().filter((p) => p.id !== profileId);
  saveProfiles(profiles);

  const activeId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
  if (activeId === profileId) {
    if (profiles.length > 0) {
      setActiveProfileId(profiles[0].id);
    } else {
      setActiveProfileId(null);
    }
  }
}

export function updateUserProfileAdmin(updated: UserProfile): {
  success: boolean;
  error?: string;
} {
  const profiles = getStoredProfiles();
  const normalizedNew = normalizeName(updated.name);

  // Verifica duplicidade com outro usuário que não seja ele mesmo
  if (
    profiles.some(
      (p) => p.id !== updated.id && normalizeName(p.name) === normalizedNew,
    )
  ) {
    return {
      success: false,
      error: `Já existe outro participante com o nome "${updated.name}".`,
    };
  }

  const gats = getStoredGats();
  const gatInfo = gats[updated.gatNumber];
  const finalUser = {
    ...updated,
    name: updated.name.trim(),
    gatName: gatInfo?.name || updated.gatName || `GAT ${updated.gatNumber}`,
  };

  const updatedProfiles = profiles.map((p) =>
    p.id === updated.id ? finalUser : p,
  );
  saveProfiles(updatedProfiles);
  return { success: true };
}

// ============================================================
// GESTÃO DINÂMICA DE GATS (ADMIN)
// ============================================================

export function getStoredGats(): Record<string, GATInfo> {
  if (typeof window === "undefined") return DEFAULT_GATS;
  try {
    const raw = localStorage.getItem(GATS_KEY);
    if (!raw) return DEFAULT_GATS;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null
      ? parsed
      : DEFAULT_GATS;
  } catch {
    return DEFAULT_GATS;
  }
}

export function saveGats(gats: Record<string, GATInfo>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GATS_KEY, JSON.stringify(gats));
}

export function updateGatInfo(oldNumber: string, updatedGat: GATInfo): void {
  if (typeof window === "undefined") return;
  const gats = getStoredGats();
  if (oldNumber !== updatedGat.number) {
    delete gats[oldNumber];
  }
  gats[updatedGat.number] = updatedGat;
  saveGats(gats);

  const profiles = getStoredProfiles();
  const updatedProfiles = profiles.map((p) => {
    if (p.gatNumber === oldNumber) {
      return {
        ...p,
        gatNumber: updatedGat.number,
        gatName: updatedGat.name,
      };
    }
    return p;
  });
  saveProfiles(updatedProfiles);
}

// ============================================================
// GESTÃO DINÂMICA DE FUNÇÕES / ROLES (ADMIN)
// ============================================================

export function getStoredRoles(): string[] {
  if (typeof window === "undefined") return DEFAULT_ROLES;
  try {
    const raw = localStorage.getItem(ROLES_KEY);
    if (!raw) return DEFAULT_ROLES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ROLES;
  } catch {
    return DEFAULT_ROLES;
  }
}

export function saveRoles(roles: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

export function updateRoleName(oldRole: string, newRole: string): void {
  if (typeof window === "undefined") return;
  const roles = getStoredRoles();
  const updatedRoles = roles.map((r) => (r === oldRole ? newRole.trim() : r));
  saveRoles(updatedRoles);

  const profiles = getStoredProfiles();
  const updatedProfiles = profiles.map((p) =>
    p.role === oldRole ? { ...p, role: newRole.trim() } : p,
  );
  saveProfiles(updatedProfiles);
}

// ============================================================
// GESTÃO DINÂMICA DE TEMPLATES DE ATIVIDADES (ADMIN)
// ============================================================

export function getStoredTemplates(): ActivityTemplate[] {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TEMPLATES;

    // Migração de schema legado caso existam templates salvos anteriormente sem 'name'
    const migrated: ActivityTemplate[] = parsed.map(
      (item: unknown, idx: number) => {
        const legacy =
          typeof item === "object" && item !== null
            ? (item as Record<string, unknown>)
            : {};
        const storedName = [
          legacy.name,
          legacy.descriptionTemplate,
          legacy.description,
        ].find(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        );
        const name = storedName || `Atividade Modelo ${idx + 1}`;

        const isGatSpecific =
          Boolean(legacy.isGatSpecific) ||
          name.includes("{gatNumber}") ||
          name.includes("{gatLabel}") ||
          name.toLowerCase().includes("reunião do gat");

        const modality =
          legacy.modality === "Síncrona presencial" ||
          legacy.modality === "Assíncrona virtual"
            ? legacy.modality
            : "Síncrona virtual";

        return {
          id:
            typeof legacy.id === "string" && legacy.id
              ? legacy.id
              : `tpl-${idx + 1}`,
          name:
            isGatSpecific && !name.includes("{gatNumber}")
              ? "Reunião do GAT {gatNumber} ({gatName})"
              : name,
          modality,
          isGatSpecific,
        };
      },
    );

    const filtered = migrated.filter((item) => {
      const name = item.name.toLowerCase();
      if (
        name.includes("redcap") ||
        name.includes("sustentabilidade") ||
        name.includes("cavernas como arquivo") ||
        name.includes("conselho federal de psicologia") ||
        name.includes("síntese analítica")
      ) {
        return false;
      }
      return true;
    });

    const result = filtered.length > 0 ? filtered : DEFAULT_TEMPLATES;
    if (result.length !== parsed.length) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(result));
    }

    return result;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplates(templates: ActivityTemplate[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// ============================================================
// GERAÇÃO E CARREGAMENTO DE ATIVIDADES
// ============================================================

export function generateSeedActivities(
  gatNumber: string,
  gatName: string,
  monthKey: string = "2026-09",
): Activity[] {
  const templates = getStoredTemplates();

  const defaultSlots = [
    { day: 8, start: "19:00", end: "21:00" },
    { day: 10, start: "10:00", end: "12:00" },
    { day: 11, start: "13:30", end: "17:30" },
    { day: 21, start: "15:00", end: "19:20" },
    { day: 17, start: "19:00", end: "20:07" },
    { day: 16, start: "20:00", end: "21:27" },
    { day: 22, start: "15:00", end: "16:00" },
    { day: 22, start: "19:00", end: "20:40" },
  ];

  const generated = templates.map((tpl, index) => {
    const slot = defaultSlots[index % defaultSlots.length];
    const dayStr = String(slot.day).padStart(2, "0");
    const date = `${monthKey}-${dayStr}`;
    const description = cleanActivityDescription(
      tpl.name.replace("{gatNumber}", gatNumber).replace("{gatName}", gatName),
    );
    return {
      id: `act-seed-${index + 1}-${Date.now().toString(36).slice(-3)}`,
      date,
      start: slot.start,
      end: slot.end,
      modality: tpl.modality,
      description,
      hours: calcPetHours(slot.start, slot.end),
    };
  });

  return sortActivitiesChronologically(generated);
}

export function getActivitiesForMonth(
  profileId: string,
  monthKey: string,
): Activity[] {
  if (typeof window === "undefined") return [];
  const key = `${ACTIVITIES_PREFIX}${profileId}_${monthKey}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Apenas o perfil inicial de demonstração (felipe-vidal) recebe atividades semente automaticamente
      if (monthKey === "2026-09" && profileId === "felipe-vidal") {
        const initialActs = generateSeedActivities("04", "Mangaba", "2026-09");
        saveActivitiesForMonth(profileId, monthKey, initialActs);
        return initialActs;
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortActivitiesChronologically(parsed) : [];
  } catch {
    return [];
  }
}

export function loadSampleActivitiesForUser(
  profileId: string,
  monthKey: string,
): Activity[] {
  const profiles = getStoredProfiles();
  const user = profiles.find((p) => p.id === profileId);
  const gats = getStoredGats();
  const gatNumber = user?.gatNumber || "04";
  const gatName = user?.gatName || gats[gatNumber]?.name || "PET";
  const samples = generateSeedActivities(gatNumber, gatName, monthKey);
  saveActivitiesForMonth(profileId, monthKey, samples);
  return samples;
}

export function clearActivitiesForMonth(
  profileId: string,
  monthKey: string,
): void {
  if (typeof window === "undefined") return;
  const key = `${ACTIVITIES_PREFIX}${profileId}_${monthKey}`;
  localStorage.setItem(key, JSON.stringify([]));
}

export function saveActivitiesForMonth(
  profileId: string,
  monthKey: string,
  activities: Activity[],
): void {
  if (typeof window === "undefined") return;
  const key = `${ACTIVITIES_PREFIX}${profileId}_${monthKey}`;
  const sorted = sortActivitiesChronologically(activities);
  localStorage.setItem(key, JSON.stringify(sorted));
}

// ============================================================
// EXPORTAÇÃO / IMPORTAÇÃO LOCAL
// ============================================================

export function exportUserData(user: UserProfile, monthKey: string): string {
  const activities = getActivitiesForMonth(user.id, monthKey);
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    user: removeLegacyPin(user),
    monthKey,
    activities,
  };
  return JSON.stringify(data, null, 2);
}

export type RestoreCode =
  | "RESTORED"
  | "INVALID_JSON"
  | "INVALID_BACKUP"
  | "UNSUPPORTED_VERSION"
  | "PROFILE_CONFLICT"
  | "STORAGE_FAILED"
  | "ROLLBACK_FAILED";
export type RestoreResult = {
  success: boolean;
  user?: UserProfile;
  monthKey?: string;
  activities?: Activity[];
  error?: string;
  code: RestoreCode;
};

const restoreMessages: Record<RestoreCode, string> = {
  RESTORED: "Cópia restaurada.",
  INVALID_JSON:
    "Não foi possível ler esta cópia. Selecione o arquivo .json salvo pelo sistema; o PDF não restaura os registros.",
  INVALID_BACKUP:
    "A cópia está incompleta ou contém registros inválidos. Selecione outra cópia. Seus registros não foram alterados.",
  UNSUPPORTED_VERSION:
    "Esta versão de cópia não é compatível. Use uma cópia no formato 1.0. Seus registros não foram alterados.",
  PROFILE_CONFLICT:
    "Já existe um perfil com este nome e outra identificação neste navegador. Continue com o perfil local ou peça ajuda antes de restaurar.",
  STORAGE_FAILED:
    "O navegador não conseguiu guardar a cópia. Verifique o espaço disponível e as permissões de armazenamento. Os registros anteriores foram preservados.",
  ROLLBACK_FAILED:
    "A restauração não foi concluída e não foi possível recuperar todo o estado anterior. Guarde seu arquivo original e peça ajuda antes de continuar.",
};

function restoreFailure(code: RestoreCode): RestoreResult {
  return { success: false, code, error: restoreMessages[code] };
}

const nonempty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const validDate = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const validTime = (value: unknown): value is string =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

// Validate the entire legacy 1.0 format before any browser write.
export function inspectUserData(jsonStr: string): RestoreResult {
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    return restoreFailure("INVALID_JSON");
  }
  if (!data || typeof data !== "object")
    return restoreFailure("INVALID_BACKUP");
  if (data.version !== undefined && data.version !== "1.0")
    return restoreFailure("UNSUPPORTED_VERSION");
  const profile = data.user;
  if (
    !profile ||
    !["id", "name", "role", "gatNumber", "createdAt"].every((key) =>
      nonempty(profile[key]),
    ) ||
    typeof data.monthKey !== "string" ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.monthKey) ||
    !Array.isArray(data.activities)
  )
    return restoreFailure("INVALID_BACKUP");
  const ids = new Set<string>();
  const activities: Activity[] = [];
  for (const record of data.activities) {
    if (
      !record ||
      !nonempty(record.id) ||
      ids.has(record.id) ||
      !validDate(record.date) ||
      !validTime(record.start) ||
      !validTime(record.end) ||
      record.end <= record.start ||
      !nonempty(record.description) ||
      ![
        "Síncrona virtual",
        "Síncrona presencial",
        "Assíncrona virtual",
      ].includes(record.modality)
    )
      return restoreFailure("INVALID_BACKUP");
    ids.add(record.id);
    activities.push({
      id: record.id,
      date: record.date,
      start: record.start,
      end: record.end,
      description: record.description,
      modality: record.modality,
      hours: calcPetHours(record.start, record.end),
    });
  }
  const user: UserProfile = {
    id: profile.id,
    name: profile.name.trim(),
    role: profile.role,
    gatNumber: profile.gatNumber,
    createdAt: profile.createdAt,
  };
  if (typeof profile.gatName === "string") user.gatName = profile.gatName;
  if (typeof profile.email === "string") user.email = profile.email;
  return {
    success: true,
    code: "RESTORED",
    user,
    monthKey: data.monthKey,
    activities: sortActivitiesChronologically(activities),
  };
}

export function importUserData(jsonStr: string): RestoreResult {
  const result = inspectUserData(jsonStr);
  if (!result.success || !result.user || !result.monthKey || !result.activities)
    return result;
  if (typeof window === "undefined") return restoreFailure("STORAGE_FAILED");
  const { user, monthKey, activities } = result;
  const activityKey = `${ACTIVITIES_PREFIX}${user.id}_${monthKey}`;
  const keys = [activityKey, PROFILES_KEY, ACTIVE_PROFILE_ID_KEY];
  const previous = new Map<string, string | null>();
  const written: string[] = [];
  try {
    for (const key of keys) previous.set(key, localStorage.getItem(key));
    // Read without running migration writes inside this transaction.
    const rawProfiles = previous.get(PROFILES_KEY);
    const profiles: UserProfile[] = rawProfiles ? JSON.parse(rawProfiles) : [];
    if (!Array.isArray(profiles)) return restoreFailure("STORAGE_FAILED");
    if (
      profiles.some(
        (profile) =>
          profile.id !== user.id &&
          normalizeName(profile.name) === normalizeName(user.name),
      )
    )
      return restoreFailure("PROFILE_CONFLICT");
    const updated = profiles.some((profile) => profile.id === user.id)
      ? profiles.map((profile) =>
          profile.id === user.id ? user : removeLegacyPin(profile),
        )
      : [...profiles.map(removeLegacyPin), user];
    const values = [
      JSON.stringify(activities),
      JSON.stringify(updated),
      user.id,
    ];
    for (let index = 0; index < keys.length; index++) {
      localStorage.setItem(keys[index], values[index]);
      written.push(keys[index]);
    }
    return result;
  } catch {
    let rollbackFailed = false;
    for (const key of written.reverse()) {
      try {
        const value = previous.get(key);
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        rollbackFailed = true;
      }
    }
    return restoreFailure(
      rollbackFailed ? "ROLLBACK_FAILED" : "STORAGE_FAILED",
    );
  }
}

// Allowlisted, local support details. Never include file content or raw exceptions.
export function getRestoreDiagnostic(code: RestoreCode): string {
  const safeCode = Object.hasOwn(restoreMessages, code)
    ? code
    : "INVALID_BACKUP";
  return JSON.stringify(
    { operation: "restore_backup", code: safeCode, supportedSchema: "1.0" },
    null,
    2,
  );
}
