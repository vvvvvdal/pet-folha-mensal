export type UserRole = string;

export const DEFAULT_ROLES: string[] = [
  'Estudante',
  'Orientador de Serviço',
  'Preceptor',
  'Tutor',
  'Coordenador de GAT'
];

export interface GATInfo {
  number: string;
  name: string;
  fullName: string;
  axis: string;
  description: string;
}

export const DEFAULT_GATS: Record<string, GATInfo> = {
  '01': {
    number: '01',
    name: 'Araticum',
    fullName: 'GAT 01 (Araticum)',
    axis: 'Eixo I',
    description: 'Produção do cuidado e Segurança Alimentar e Nutricional (SAN) na APS'
  },
  '02': {
    number: '02',
    name: 'Buriti',
    fullName: 'GAT 02 (Buriti)',
    axis: 'Eixo I',
    description: 'Vigilância socioambiental territorial e Rede de Atenção Psicossocial (RAPS)'
  },
  '03': {
    number: '03',
    name: 'Ipê-amarelo',
    fullName: 'GAT 03 (Ipê-amarelo)',
    axis: 'Eixo II',
    description: 'Atenção especializada, cuidado farmacêutico e estoques estratégicos'
  },
  '04': {
    number: '04',
    name: 'Mangaba',
    fullName: 'GAT 04 (Mangaba)',
    axis: 'Eixo III',
    description: 'Comunicação acessível (LIBRAS, Braille, audiodescrição) e educação popular'
  },
  '05': {
    number: '05',
    name: 'Pequi',
    fullName: 'GAT 05 (Pequi)',
    axis: 'Eixo III',
    description: 'Vigilância preditiva baseada em IA e modelagem computacional'
  }
};

export const GATS = DEFAULT_GATS;

export interface ActivityTemplate {
  id: string;
  name: string; // nome da atividade (ex: "Reunião do GAT", "Oficina formativa...")
  modality: ModalityType; // Síncrona virtual | Síncrona presencial | Assíncrona virtual
  isGatSpecific?: boolean;
}

export type ModalityType =
  | 'Síncrona virtual'
  | 'Síncrona presencial'
  | 'Assíncrona virtual';

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  modality: ModalityType;
  description: string;
  hours: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  gatNumber: string;
  gatName?: string;
  createdAt: string;
}

export interface MonthRecord {
  monthYear: string; // ex: "Setembro/2026"
  monthKey: string; // ex: "2026-09"
  activities: Activity[];
}
