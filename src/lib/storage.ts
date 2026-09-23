import {
  Activity,
  UserProfile,
  UserRole,
  GATInfo,
  DEFAULT_GATS,
  DEFAULT_ROLES,
  ActivityTemplate
} from '@/types';
import { calcPetHours } from './pet-calculator';

// Hash SHA-256 do PIN administrativo (padrão ou configurado via .env)
export const ADMIN_PIN_HASH =
  process.env.NEXT_PUBLIC_ADMIN_PIN_HASH ||
  '683a9e878af26dfcbfb2b70bc63214acfd3614519ead8c1912c7d1907061d1a2';

export async function verifyAdminPin(inputPin: string): Promise<boolean> {
  const clean = inputPin.trim();
  if (!clean) return false;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(clean);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex === ADMIN_PIN_HASH;
  }
  return false;
}

const PROFILES_KEY = 'pet_folha_profiles_v2';
const ACTIVE_PROFILE_ID_KEY = 'pet_folha_active_profile_id_v2';
const ACTIVITIES_PREFIX = 'pet_folha_activities_v2_';
const GATS_KEY = 'pet_folha_config_gats_v2';
const ROLES_KEY = 'pet_folha_config_roles_v2';
const TEMPLATES_KEY = 'pet_folha_config_templates_v2';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'felipe-vidal',
    name: 'Felipe Gonçalves Vidal',
    role: 'Estudante',
    gatNumber: '04',
    gatName: 'Mangaba',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'mariana-rios',
    name: 'Mariana Dias Rios',
    role: 'Estudante',
    gatNumber: '01',
    gatName: 'Araticum',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'carlos-meireles',
    name: 'Carlos Eduardo Meireles',
    role: 'Preceptor',
    gatNumber: '02',
    gatName: 'Buriti',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'dra-juliana',
    name: 'Dra. Juliana Peixoto',
    role: 'Tutor',
    gatNumber: '03',
    gatName: 'Ipê-amarelo',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'lucas-alencar',
    name: 'Lucas Alencar Ferreira',
    role: 'Estudante',
    gatNumber: '05',
    gatName: 'Pequi',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  }
];

export const DEFAULT_TEMPLATES: ActivityTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Reunião do GAT {gatNumber} ({gatName})',
    modality: 'Síncrona virtual',
    isGatSpecific: true
  },
  {
    id: 'tpl-2',
    name: 'Reunião geral do PET',
    modality: 'Síncrona presencial'
  }
];

// ============================================================
// FUNÇÕES DE NORMALIZAÇÃO E ANTI-DUPLICIDADE
// ============================================================

export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
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

// ============================================================
// GESTÃO DE PERFIS (USUÁRIOS)
// ============================================================

export function getStoredProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return DEFAULT_PROFILES;
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    if (!data) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PROFILES;

    // Auto-desduplicação para garantir integridade e resolver casos como imagem 1
    const deduplicated = deduplicateProfiles(parsed);
    if (deduplicated.length !== parsed.length) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(deduplicated));
    }
    return deduplicated;
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  if (typeof window === 'undefined') return;
  const clean = deduplicateProfiles(profiles);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(clean));
}

export function getActiveProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const profiles = getStoredProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
  if (!activeId) return null;
  return profiles.find((p) => p.id === activeId) || null;
}

export function setActiveProfileId(profileId: string | null): void {
  if (typeof window === 'undefined') return;
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
  pin?: string;
}): { success: boolean; user?: UserProfile; error?: string } {
  const profiles = getStoredProfiles();
  const trimmedName = data.name.trim();

  // Validação Anti-Duplicidade por Nome
  const normalizedNew = normalizeName(trimmedName);
  if (profiles.some((p) => normalizeName(p.name) === normalizedNew)) {
    return {
      success: false,
      error: `Já existe um participante cadastrado como "${trimmedName}".`
    };
  }

  // Validação Anti-Duplicidade por E-mail (se informado)
  if (data.email) {
    const cleanEmail = data.email.trim().toLowerCase();
    if (profiles.some((p) => p.email && p.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Já existe um participante cadastrado com este e-mail.' };
    }
  }

  const gats = getStoredGats();
  const gatInfo = gats[data.gatNumber] || { name: `GAT ${data.gatNumber}` };
  const baseId = trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const uniqueId = `${baseId}-${Date.now().toString(36).slice(-4)}`;

  const newProfile: UserProfile = {
    id: uniqueId,
    name: trimmedName,
    email: data.email?.trim().toLowerCase(),
    role: data.role,
    gatNumber: data.gatNumber,
    gatName: gatInfo.name,
    pin: data.pin?.trim() || '1234',
    createdAt: new Date().toISOString()
  };

  const updated = [...profiles, newProfile];
  saveProfiles(updated);
  setActiveProfileId(newProfile.id);

  return { success: true, user: newProfile };
}

export function deleteUserProfile(profileId: string): void {
  if (typeof window === 'undefined') return;
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

export function updateUserProfileAdmin(updated: UserProfile): { success: boolean; error?: string } {
  const profiles = getStoredProfiles();
  const normalizedNew = normalizeName(updated.name);

  // Verifica duplicidade com outro usuário que não seja ele mesmo
  if (profiles.some((p) => p.id !== updated.id && normalizeName(p.name) === normalizedNew)) {
    return { success: false, error: `Já existe outro participante com o nome "${updated.name}".` };
  }

  const gats = getStoredGats();
  const gatInfo = gats[updated.gatNumber];
  const finalUser = {
    ...updated,
    name: updated.name.trim(),
    gatName: gatInfo?.name || updated.gatName || `GAT ${updated.gatNumber}`
  };

  const updatedProfiles = profiles.map((p) => (p.id === updated.id ? finalUser : p));
  saveProfiles(updatedProfiles);
  return { success: true };
}

// ============================================================
// GESTÃO DINÂMICA DE GATS (ADMIN)
// ============================================================

export function getStoredGats(): Record<string, GATInfo> {
  if (typeof window === 'undefined') return DEFAULT_GATS;
  try {
    const raw = localStorage.getItem(GATS_KEY);
    if (!raw) return DEFAULT_GATS;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : DEFAULT_GATS;
  } catch {
    return DEFAULT_GATS;
  }
}

export function saveGats(gats: Record<string, GATInfo>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GATS_KEY, JSON.stringify(gats));
}

export function updateGatInfo(oldNumber: string, updatedGat: GATInfo): void {
  if (typeof window === 'undefined') return;
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
        gatName: updatedGat.name
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
  if (typeof window === 'undefined') return DEFAULT_ROLES;
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
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

export function updateRoleName(oldRole: string, newRole: string): void {
  if (typeof window === 'undefined') return;
  const roles = getStoredRoles();
  const updatedRoles = roles.map((r) => (r === oldRole ? newRole.trim() : r));
  saveRoles(updatedRoles);

  const profiles = getStoredProfiles();
  const updatedProfiles = profiles.map((p) =>
    p.role === oldRole ? { ...p, role: newRole.trim() } : p
  );
  saveProfiles(updatedProfiles);
}

// ============================================================
// GESTÃO DINÂMICA DE TEMPLATES DE ATIVIDADES (ADMIN)
// ============================================================

export function getStoredTemplates(): ActivityTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_TEMPLATES;

    // Migração de schema legado caso existam templates salvos anteriormente sem 'name'
    const migrated: ActivityTemplate[] = parsed.map((item: any, idx: number) => {
      const name =
        item.name ||
        item.descriptionTemplate ||
        item.description ||
        `Atividade Modelo ${idx + 1}`;

      const isGatSpecific =
        Boolean(item.isGatSpecific) ||
        name.includes('{gatNumber}') ||
        name.includes('{gatLabel}') ||
        name.toLowerCase().includes('reunião do gat');

      return {
        id: item.id || `tpl-${idx + 1}`,
        name: isGatSpecific && !name.includes('{gatNumber}')
          ? 'Reunião do GAT {gatNumber} ({gatName})'
          : name,
        modality: item.modality || 'Síncrona virtual',
        isGatSpecific
      };
    });

    const filtered = migrated.filter((item) => {
      const name = item.name.toLowerCase();
      if (
        name.includes('redcap') ||
        name.includes('sustentabilidade') ||
        name.includes('cavernas como arquivo') ||
        name.includes('conselho federal de psicologia') ||
        name.includes('síntese analítica')
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
  if (typeof window === 'undefined') return;
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// ============================================================
// GERAÇÃO E CARREGAMENTO DE ATIVIDADES
// ============================================================

export function generateSeedActivities(
  gatNumber: string,
  gatName: string,
  monthKey: string = '2026-09'
): Activity[] {
  const templates = getStoredTemplates();

  const defaultSlots = [
    { day: 8, start: '19:00', end: '21:00' },
    { day: 10, start: '10:00', end: '12:00' },
    { day: 11, start: '13:30', end: '17:30' },
    { day: 21, start: '15:00', end: '19:20' },
    { day: 17, start: '19:00', end: '20:07' },
    { day: 16, start: '20:00', end: '21:27' },
    { day: 22, start: '15:00', end: '16:00' },
    { day: 22, start: '19:00', end: '20:40' }
  ];

  return templates.map((tpl, index) => {
    const slot = defaultSlots[index % defaultSlots.length];
    const dayStr = String(slot.day).padStart(2, '0');
    const date = `${monthKey}-${dayStr}`;
    let description = tpl.name.replace('{gatNumber}', gatNumber).replace('{gatName}', gatName);
    if (!description.includes('(') && !description.includes(')')) {
      description = `${description} (${tpl.modality})`;
    }
    return {
      id: `act-seed-${index + 1}-${Date.now().toString(36).slice(-3)}`,
      date,
      start: slot.start,
      end: slot.end,
      modality: tpl.modality,
      description,
      hours: calcPetHours(slot.start, slot.end)
    };
  });
}

export function getActivitiesForMonth(profileId: string, monthKey: string): Activity[] {
  if (typeof window === 'undefined') return [];
  const key = `${ACTIVITIES_PREFIX}${profileId}_${monthKey}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Apenas o perfil inicial de demonstração (felipe-vidal) recebe atividades semente automaticamente
      if (monthKey === '2026-09' && profileId === 'felipe-vidal') {
        const initialActs = generateSeedActivities('04', 'Mangaba', '2026-09');
        saveActivitiesForMonth(profileId, monthKey, initialActs);
        return initialActs;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function loadSampleActivitiesForUser(profileId: string, monthKey: string): Activity[] {
  const profiles = getStoredProfiles();
  const user = profiles.find((p) => p.id === profileId);
  const gats = getStoredGats();
  const gatNumber = user?.gatNumber || '04';
  const gatName = user?.gatName || gats[gatNumber]?.name || 'PET';
  const samples = generateSeedActivities(gatNumber, gatName, monthKey);
  saveActivitiesForMonth(profileId, monthKey, samples);
  return samples;
}

export function clearActivitiesForMonth(profileId: string, monthKey: string): void {
  if (typeof window === 'undefined') return;
  const key = `${ACTIVITIES_PREFIX}${profileId}_${monthKey}`;
  localStorage.setItem(key, JSON.stringify([]));
}

export function saveActivitiesForMonth(
  profileId: string,
  monthKey: string,
  activities: Activity[]
): void {
  if (typeof window === 'undefined') return;
  const key = `${ACTIVITIES_PREFIX}${profileId}_${monthKey}`;
  localStorage.setItem(key, JSON.stringify(activities));
}

// ============================================================
// EXPORTAÇÃO / IMPORTAÇÃO LOCAL
// ============================================================

export function exportUserData(user: UserProfile, monthKey: string): string {
  const activities = getActivitiesForMonth(user.id, monthKey);
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    user,
    monthKey,
    activities
  };
  return JSON.stringify(data, null, 2);
}

export function importUserData(jsonStr: string): {
  success: boolean;
  user?: UserProfile;
  monthKey?: string;
  activities?: Activity[];
  error?: string;
} {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.user || !data.user.name || !Array.isArray(data.activities)) {
      return { success: false, error: 'Arquivo de cópia de folha inválido.' };
    }
    const user: UserProfile = data.user;
    const monthKey: string = data.monthKey || '2026-09';
    const activities: Activity[] = data.activities;

    const profiles = getStoredProfiles();
    const existingIndex = profiles.findIndex((p) => p.id === user.id);
    let updatedProfiles: UserProfile[];
    if (existingIndex >= 0) {
      updatedProfiles = [...profiles];
      updatedProfiles[existingIndex] = user;
    } else {
      updatedProfiles = [...profiles, user];
    }
    saveProfiles(updatedProfiles);
    setActiveProfileId(user.id);
    saveActivitiesForMonth(user.id, monthKey, activities);

    return { success: true, user, monthKey, activities };
  } catch {
    return { success: false, error: 'Falha ao processar arquivo de folha.' };
  }
}
