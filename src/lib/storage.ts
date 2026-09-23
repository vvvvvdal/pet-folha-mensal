import { Activity, UserProfile } from '@/types';
import { calcPetHours } from './pet-calculator';

const PROFILES_KEY = 'pet_folha_profiles_v1';
const ACTIVE_PROFILE_ID_KEY = 'pet_folha_active_profile_id_v1';
const ACTIVITIES_PREFIX = 'pet_folha_activities_v1_';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'felipe-vidal',
    name: 'Felipe Gonçalves Vidal',
    email: 'felipe.vidal@discente.ufg.br',
    role: 'Estudante',
    gatNumber: '04',
    pin: '1234',
    createdAt: '2026-09-01T00:00:00.000Z'
  }
];

export const DEFAULT_SEPTEMBER_ACTIVITIES: Omit<Activity, 'id' | 'hours'>[] = [
  { date: '2026-09-08', start: '19:00', end: '21:00', modality: 'Síncrona virtual', description: 'Reunião do GAT 04 (Síncrona virtual)' },
  { date: '2026-09-10', start: '10:00', end: '12:00', modality: 'Síncrona virtual', description: 'Oficina formativa: REDCap e construção de instrumentos para pesquisa científica (Síncrona virtual)' },
  { date: '2026-09-11', start: '13:30', end: '17:30', modality: 'Síncrona presencial', description: 'Reunião geral do PET (Síncrona presencial)' },
  { date: '2026-09-21', start: '15:00', end: '19:20', modality: 'Síncrona presencial', description: 'Oficinas de SUStentabilidade (Síncrona presencial)' },
  { date: '2026-09-17', start: '19:00', end: '20:07', modality: 'Síncrona virtual', description: 'Ciclo de Palestra 2026 - Cavernas como arquivo climático: A região Centro-Oeste no holoceno (Síncrona virtual)' },
  { date: '2026-09-16', start: '20:00', end: '21:27', modality: 'Síncrona virtual', description: 'Conselho Federal de Psicologia - Atuação psicossocial em desastres climáticos e o El Niño (Síncrona virtual)' },
  { date: '2026-09-22', start: '15:00', end: '16:00', modality: 'Assíncrona virtual', description: 'Síntese: Intervenção de Bruna Kitazono na palestra Conselho Federal de Psicologia - Atuação psicossocial em desastres climáticos e o El Niño (Assíncrona virtual)' },
  { date: '2026-09-22', start: '19:00', end: '20:40', modality: 'Síncrona virtual', description: 'Reunião do GAT 04 (Síncrona virtual)' }
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
  if (!activeId) return profiles[0] || null;
  return profiles.find(p => p.id === activeId) || profiles[0] || null;
}

export function setActiveProfileId(profileId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_PROFILE_ID_KEY, profileId);
}

export function getActivitiesForMonth(profileId: string, monthKey: string): Activity[] {
  if (typeof window === 'undefined') return [];
  const key = `${ACTIVITIES_PREFIX}${profileId}_${monthKey}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Se for o perfil padrão e mês Setembro/2026, popula com as 8 atividades canônicas
      if (profileId === 'felipe-vidal' && monthKey === '2026-09') {
        const initialActs: Activity[] = DEFAULT_SEPTEMBER_ACTIVITIES.map((act, index) => ({
          ...act,
          id: `act-default-${index + 1}`,
          hours: calcPetHours(act.start, act.end)
        }));
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
