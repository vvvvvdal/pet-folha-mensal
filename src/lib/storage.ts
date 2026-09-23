import { Activity, UserProfile, UserRole, GATS } from '@/types';
import { calcPetHours } from './pet-calculator';

const PROFILES_KEY = 'pet_folha_profiles_v2';
const ACTIVE_PROFILE_ID_KEY = 'pet_folha_active_profile_id_v2';
const ACTIVITIES_PREFIX = 'pet_folha_activities_v2_';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'felipe-vidal',
    name: 'Felipe Gonçalves Vidal',
    email: 'felipe.vidal@discente.ufg.br',
    role: 'Estudante',
    gatNumber: '04',
    gatName: 'Mangaba',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'mariana-rios',
    name: 'Mariana Dias Rios',
    email: 'mariana.rios@discente.ufg.br',
    role: 'Estudante',
    gatNumber: '01',
    gatName: 'Araticum',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'carlos-meireles',
    name: 'Carlos Eduardo Meireles',
    email: 'carlos.meireles@sms.goiania.go.gov.br',
    role: 'Preceptor',
    gatNumber: '02',
    gatName: 'Buriti',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'dra-juliana',
    name: 'Dra. Juliana Peixoto',
    email: 'juliana.peixoto@ufg.br',
    role: 'Tutor',
    gatNumber: '03',
    gatName: 'Ipê-amarelo',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'lucas-alencar',
    name: 'Lucas Alencar Ferreira',
    email: 'lucas.alencar@inf.ufg.br',
    role: 'Estudante',
    gatNumber: '05',
    gatName: 'Pequi',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  }
];

export function getStoredProfiles(): UserProfile[] {
  if (typeof window === 'undefined') return DEFAULT_PROFILES;
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    if (!data) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROFILES;
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getActiveProfile(): UserProfile | null {
  if (typeof window === 'undefined') return DEFAULT_PROFILES[0];
  const profiles = getStoredProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
  if (!activeId) return null;
  return profiles.find(p => p.id === activeId) || null;
}

export function setActiveProfileId(profileId: string | null): void {
  if (typeof window === 'undefined') return;
  if (profileId) {
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, profileId);
  } else {
    localStorage.removeItem(ACTIVE_PROFILE_ID_KEY);
  }
}

export function loginWithPin(identifier: string, pin: string): { success: boolean; user?: UserProfile; error?: string } {
  const profiles = getStoredProfiles();
  const cleanId = identifier.trim().toLowerCase();
  
  const user = profiles.find(
    p => p.id.toLowerCase() === cleanId || (p.email && p.email.toLowerCase() === cleanId) || p.name.toLowerCase() === cleanId
  );

  if (!user) {
    return { success: false, error: 'Participante não encontrado no sistema.' };
  }

  // Se o usuário tem PIN configurado, valida
  if (user.pin && user.pin !== pin.trim()) {
    return { success: false, error: 'PIN de acesso incorreto. Tente novamente.' };
  }

  setActiveProfileId(user.id);
  return { success: true, user };
}

export function registerProfile(data: {
  name: string;
  email: string;
  role: UserRole;
  gatNumber: string;
  pin: string;
}): { success: boolean; user?: UserProfile; error?: string } {
  const profiles = getStoredProfiles();
  const cleanEmail = data.email.trim().toLowerCase();
  
  if (profiles.some(p => p.email && p.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'Já existe um participante cadastrado com este e-mail.' };
  }

  const gatInfo = GATS[data.gatNumber] || { name: `GAT ${data.gatNumber}` };
  const baseId = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const uniqueId = `${baseId}-${Date.now().toString(36).slice(-4)}`;

  const newProfile: UserProfile = {
    id: uniqueId,
    name: data.name.trim(),
    email: cleanEmail,
    role: data.role,
    gatNumber: data.gatNumber,
    gatName: gatInfo.name,
    pin: data.pin.trim() || '1234',
    createdAt: new Date().toISOString()
  };

  const updated = [...profiles, newProfile];
  saveProfiles(updated);
  setActiveProfileId(newProfile.id);

  return { success: true, user: newProfile };
}

export function generateSeedActivities(gatNumber: string, gatName: string): Activity[] {
  const gatLabel = `Reunião do GAT ${gatNumber} (${gatName})`;
  const seed: Omit<Activity, 'id' | 'hours'>[] = [
    { date: '2026-09-08', start: '19:00', end: '21:00', modality: 'Síncrona virtual', description: `${gatLabel} (Síncrona virtual)` },
    { date: '2026-09-10', start: '10:00', end: '12:00', modality: 'Síncrona virtual', description: 'Oficina formativa: REDCap e construção de instrumentos para pesquisa científica (Síncrona virtual)' },
    { date: '2026-09-11', start: '13:30', end: '17:30', modality: 'Síncrona presencial', description: 'Reunião geral do PET (Síncrona presencial)' },
    { date: '2026-09-21', start: '15:00', end: '19:20', modality: 'Síncrona presencial', description: 'Oficinas de SUStentabilidade (Síncrona presencial)' },
    { date: '2026-09-17', start: '19:00', end: '20:07', modality: 'Síncrona virtual', description: 'Ciclo de Palestra 2026 - Cavernas como arquivo climático: A região Centro-Oeste no holoceno (Síncrona virtual)' },
    { date: '2026-09-16', start: '20:00', end: '21:27', modality: 'Síncrona virtual', description: 'Conselho Federal de Psicologia - Atuação psicossocial em desastres climáticos e o El Niño (Síncrona virtual)' },
    { date: '2026-09-22', start: '15:00', end: '16:00', modality: 'Assíncrona virtual', description: 'Síntese analítica: Desastres climáticos e atuação psicossocial (Assíncrona virtual)' },
    { date: '2026-09-22', start: '19:00', end: '20:40', modality: 'Síncrona virtual', description: `${gatLabel} (Síncrona virtual)` }
  ];

  return seed.map((act, index) => ({
    ...act,
    id: `act-seed-${index + 1}`,
    hours: calcPetHours(act.start, act.end)
  }));
}

export function getActivitiesForMonth(profileId: string, monthKey: string): Activity[] {
  if (typeof window === 'undefined') return [];
  const key = `${ACTIVITIES_PREFIX}${profileId}_${monthKey}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Se for Setembro/2026 e primeira vez do usuário, popula com as atividades semente contextualizadas com seu GAT
      if (monthKey === '2026-09') {
        const profiles = getStoredProfiles();
        const user = profiles.find(p => p.id === profileId);
        const gatNumber = user?.gatNumber || '04';
        const gatName = user?.gatName || GATS[gatNumber]?.name || 'Mangaba';
        
        const initialActs = generateSeedActivities(gatNumber, gatName);
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

export function saveActivitiesForMonth(profileId: string, monthKey: string, activities: Activity[]): void {
  if (typeof window === 'undefined') return;
  const key = `${ACTIVITIES_PREFIX}${profileId}_${monthKey}`;
  localStorage.setItem(key, JSON.stringify(activities));
}

