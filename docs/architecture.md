# Arquitetura de Software: PET Folha Mensal

Este documento detalha o desenho arquitetural, os princípios de engenharia, a modelagem de dados e as decisões técnicas que sustentam o **PET Folha Mensal**.

---

## 1. Visão Geral e Paradigma

A aplicação é construída com **Next.js 16 (App Router)** utilizando **React 19**, **TypeScript 5** e **Tailwind CSS v4**.

O sistema adota o paradigma **Local-First**, fundamentado nas seguintes premissas:
1. **Privacidade e Conformidade LGPD**: Os dados cadastrais dos participantes e os registros de atividades residem exclusivamente no armazenamento local do navegador (`localStorage`).
2. **Disponibilidade e Resiliência**: O sistema opera plenamente sem depender de conexão permanente com bancos de dados relacionais na nuvem para leitura e escrita diária.
3. **Portabilidade de Dados**: O usuário possui soberania total sobre suas informações, podendo exportar e importar a qualquer momento sua cópia de segurança estruturada em formato `.json`.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router                           │
├──────────────────────────┬─────────────────────────────────────────────┤
│    Tela de Acesso        │             Painel Principal                │
│    (LandingPage.tsx)     │            (Dashboard / Navbar)             │
├──────────────────────────┼─────────────────────────────────────────────┤
│  • Acesso Rápido         │  • Navbar (Mobile-First / Multiabas)        │
│  • Seleção dos 5 GATs    │  • StatsGrid (Metas semanais / Progresso)   │
│  • Funções do SUS        │  • ActivityForm (Templates rápidos por GAT) │
│  • Modal de Registro     │  • ActivityTable (Cards Mobile vs. Tabela)  │
│  • Cópia de Segurança    │  • ExitModal (Exportação JSON + PDF)        │
├──────────────────────────┴─────────────────────────────────────────────┤
│                          OfficialSheet.tsx                             │
│       (Motor de Renderização e Impressão Nativa A4 Paisagem)           │
├────────────────────────────────────────────────────────────────────────┤
│                       Camada de Persistência                           │
│     localStorage (Key-Value) + Validação SHA-256 (crypto.subtle)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Camadas do Sistema

### 2.1. Interface de Usuário (`src/components/`)

- **`Navbar.tsx`**: Barra de navegação responsiva em dois níveis no smartphone e nível único no desktop. Gerencia identificação do usuário ativo, troca de abas (`Lançamentos` vs `Folha Oficial`), alternância de temas (Gentle Dark e Soft Light), feedback e acesso ao painel de administração.
- **`LandingPage.tsx`**: Tela de boas-vindas com lista de participantes recentes, botão de novo cadastro e importação direta de cópia de segurança em `.json`.
- **`StatsGrid.tsx`**: Painel com 3 cards de métricas (Horas Apuradas, Média Semanal de 8h e Status da Frequência), calculando o progresso percentual e a distância para a meta mensal.
- **`ActivityForm.tsx`**: Formulário de inclusão e edição de atividades, com cálculo instantâneo da regra de horas do PET, seleção de modalidade (Síncrona Virtual, Síncrona Presencial e Assíncrona Virtual) e templates dinâmicos por GAT.
- **`ActivityTable.tsx`**: Componente híbrido inteligente:
  - **Smartphone (`sm:hidden`)**: Renderiza uma lista de cartões empilhados completos, com touch targets mínimos de 44x44px (WCAG 2.5.5), texto legível sem zoom involuntário e ações de editar ou excluir.
  - **Desktop (`hidden sm:block`)**: Apresenta a tabela tabular densa com 7 colunas (`Data`, `Entrada`, `Saída`, `Tipo`, `Descrição`, `Horas` e `Ações`), incluindo edição e exclusão com confirmação.
- **`EditActivityModal.tsx`**: Modal de edição de lançamentos que recalcula as horas conforme a regra do PET antes de persistir a alteração.
- **`OfficialSheet.tsx`**: Gabarito oficial de impressão compatível com as exigências da SGTES/Ministério da Saúde, desenhado para fechar em exatamente 1 página horizontal A4 (`@media print`).
- **`ExitModal.tsx`**: Fluxo de saída seguro e responsivo que incentiva o participante a baixar sua cópia de segurança em `.json` e gerar sua folha assinada em `.pdf` antes de encerrar a sessão, com confirmação explícita e uma única ação de download por vez.
- **`AdminModal.tsx`**: Painel gerencial protegido por hash SHA-256 para configuração de GATs, papéis institucionais e templates de atividades.
- **`FeedbackModal.tsx`**: Modal minimalista com atalho para o formulário oficial de avaliação do sistema, sugestões e envio de prints de bugs.

### 2.2. Núcleo Lógico e Utilitários (`src/lib/`)

- **`pet-calculator.ts`**: Implementa a regra matemática oficial do PET-Saúde:
  $$\text{Duração} = \lceil \text{Saída} \rceil - \lfloor \text{Chegada} \rfloor$$
  Contém também formatadores para datas no padrão brasileiro (`DD/MM/YYYY`) e rotulagem de meses de referência.
- **`storage.ts`**: Camada de abstração do `localStorage`. Implementa:
  - Isolamento de dados por perfil de usuário e por mês (`pet_folha_activities_v2_${userId}_${monthKey}`).
  - Exportação e importação de backups completos (`exportUserData`, `importUserData`).
  - Verificação assíncrona do PIN de administração via `crypto.subtle.digest('SHA-256', ...)`.
  - Suporte a templates e funções dinâmicas.
- **`theme.ts`**: Hook `useTheme` que controla os modos `dark` e `light` via atributo `data-theme` na raiz do documento e chave `pet_theme` no storage.

---

## 3. Modelo de Dados (`src/types/index.ts`)

```typescript
export type UserRole =
  | 'Estudante'
  | 'Orientador de Serviço'
  | 'Preceptor'
  | 'Tutor'
  | 'Coordenador de GAT';

export type ModalityType =
  | 'Síncrona virtual'
  | 'Síncrona presencial'
  | 'Assíncrona virtual';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  gatNumber: string; // '01' a '05'
  gatName?: string;
  pin?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  modality: ModalityType;
  description: string;
  hours: number;
}

export interface ActivityTemplate {
  id: string;
  name: string;
  modality: ModalityType;
  isGatSpecific?: boolean;
}

export interface GATInfo {
  number: string;
  name: string;
  axis: string;
  color: string;
}
```

---

## 4. Segurança e Privacidade

1. **Autenticação Administrativa Descentralizada**: O PIN de administração nunca é armazenado em texto plano. Sua verificação compara o hash SHA-256 gerado no navegador com a variável `NEXT_PUBLIC_ADMIN_PIN_HASH`.
2. **Zero Rastreamento Invasivo**: A telemetria de uso é fornecida pelo `@vercel/analytics`, que opera de maneira puramente estatística sem uso de cookies e sem coleta de IP ou dados identificáveis.
3. **Contenção de Viewport**: A interface implementa proteção estrita contra overflow horizontal (`overflow-x: hidden; max-width: 100vw;`) e dimensões fluidas, garantindo que navegadores móveis (Safari iOS e Chrome Android) mantenham a escala correta `1:1`.
