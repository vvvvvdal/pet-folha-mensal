# Arquitetura de Software: PET Folha Mensal

## 1. Visão Geral

A aplicação é construída com **Next.js 15 (App Router)** utilizando **TypeScript** e **Tailwind CSS**. A arquitetura foi desenhada com modelo **Local-First**, garantindo persistência imediata e confiável no navegador sem dependências obrigatórias de bancos de dados externos para operação básica, com portas prontas para sincronização em nuvem via Supabase ou PostgreSQL.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 15 App Router                │
├─────────────────────────┬──────────────────────────────┤
│    Tela de Acesso       │      Painel do Bolsista      │
│  (ProfileSelector.tsx)  │     (Dashboard / Navbar)     │
├─────────────────────────┼──────────────────────────────┤
│  • Cadastro ágil        │  • StatsGrid (Metas / Horas) │
│  • Seleção dos 5 GATs   │  • ActivityForm (Presets)    │
│  • Funções do SUS       │  • ActivityTable (Edit/Del)  │
│  • PIN de proteção      │  • AlertBanner (Notificações)│
├─────────────────────────┴──────────────────────────────┤
│                OfficialSheet.tsx                       │
│    (Motor de Renderização e Impressão A4 Paisagem)     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Camadas e Componentes

### 2.1. Componentes Principais (`src/components/`)
* **`ProfileSelector.tsx`**: Interface de autenticação sem fricção. Permite alternar entre participantes registrados ou criar novo perfil com Nome, GAT e Função no SUS.
* **`Navbar.tsx`**: Barra de navegação com dados do bolsista ativo, seletor de abas (`Painel` vs `Folha Oficial`), alternador de temas e botão de impressão direta.
* **`StatsGrid.tsx`**: Indicadores de horas realizadas, meta de 32h e barra de progresso mensal.
* **`ActivityForm.tsx`**: Formulário de registro com cálculo de horas em tempo real, seleção de modalidade e botões rápidos (`Reunião do GAT`, `Reunião Geral`). Suporta modo de criação e edição.
* **`ActivityTable.tsx`**: Tabela interativa com ações inline de edição (`✏️`) e exclusão (`🗑️`).
* **`AlertBanner.tsx`**: Alerta contextual que surge após qualquer alteração lembrando o usuário de salvar o PDF.
* **`OfficialSheet.tsx`**: Gabarito oficial em A4 Paisagem com cabeçalho tríplice do Ministério da Saúde, logo colorida e tabela com colunas de assinatura.
* **`ThemeToggle.tsx`**: Alternador de ergonomia visual (Gentle Dark, Sépia, Soft Light).

### 2.2. Núcleo Lógico (`src/lib/`)
* **`pet-calculator.ts`**: Implementa a regra matemática `CEILING(Saída) - FLOOR(Chegada)` e formatação brasileira de datas e meses.
* **`storage.ts`**: Gerenciador de persistência no `localStorage` com suporte a múltiplos usuários e múltiplos meses por usuário. Precarrega o perfil de referência de Felipe Vidal (Setembro/2026, 21h).

---

## 3. Modelo de Dados (`src/types/index.ts`)

```typescript
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: 'Estudante' | 'Orientador de Serviço' | 'Preceptor' | 'Tutor' | 'Coordenador de GAT';
  gatNumber: string; // '01' | '02' | '03' | '04' | '05'
  pin?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  modality: 'Síncrona virtual' | 'Síncrona presencial' | 'Assíncrona virtual';
  description: string;
  hours: number;
}
```
