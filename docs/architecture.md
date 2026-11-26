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
│                  Persistência e bloqueio de acesso                     │
│ localStorage + IndexedDB + Route Handler (PIN) + cookie HttpOnly      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Camadas do Sistema

### 2.1. Interface de Usuário (`src/components/`)

- **`Navbar.tsx`**: Navegação em duas faixas com identificação, seções da folha, ajuda e configurações. As ações de salvar/restaurar cópia permanecem visíveis no computador e no celular.
- **`LandingPage.tsx`**: Entrada com retomada dos perfis deste navegador, primeiro acesso e restauração. Perfil repetido oferece continuação explícita, preservando os meses existentes; novos navegadores não recebem perfis de exemplo. Prévia recolhida, FAQ e rodapé compartilhado.
- **`StatsGrid.tsx`**: Resumo único com horas, quantidade de atividades e referência mensal aproximada. Não declara aptidão nem usa média mensal como comprovação da obrigação semanal.
- **`ActivityForm.tsx`**: Formulário de inclusão de atividades, com cálculo instantâneo da regra de horas do PET, seleção de modalidade (Síncrona Virtual, Síncrona Presencial e Assíncrona Virtual) e templates dinâmicos por GAT.
- **`ActivityTable.tsx`**: Componente híbrido inteligente:
  - **Smartphone (`sm:hidden`)**: Renderiza uma lista de cartões empilhados completos, com touch targets mínimos de 44x44px (WCAG 2.5.5), texto legível sem zoom involuntário e ações de editar ou excluir.
  - **Desktop (`hidden sm:block`)**: Apresenta a tabela tabular densa com 7 colunas (`Data`, `Entrada`, `Saída`, `Tipo`, `Descrição`, `Horas` e `Ações`), incluindo edição e exclusão com confirmação.
- **`EditActivityModal.tsx`**: Modal de edição de lançamentos que recalcula as horas conforme a regra do PET antes de persistir a alteração.
- **`OfficialSheet.tsx`**: Gabarito oficial de impressão compatível com as exigências da SGTES/Ministério da Saúde, com paginação automática em A4 paisagem e assinaturas no final (`@media print`).
- **`MonthlyAttachments.tsx`**: Lista opcional de comprovantes por perfil e mês, com seleção de atividades. A impressão agrupa os comprovantes por atividade após as assinaturas.
- **`ExitModal.tsx`**: Fluxo de saída seguro e responsivo que incentiva o participante a baixar sua cópia de segurança em `.json` e gerar sua folha assinada em `.pdf` antes de encerrar a sessão, com confirmação explícita e uma única ação de download por vez.
- **`AdminModal.tsx`**: Painel de configurações locais. Consulta a sessão no servidor antes de exibir a interface e informa que o bloqueio não transforma dados do `localStorage` em dados administrativos confiáveis.
- **`FeedbackModal.tsx`**: Modal minimalista com atalho para o formulário oficial de avaliação do sistema, sugestões e envio de prints de bugs.

### 2.2. Núcleo Lógico e Utilitários (`src/lib/`)

- **`pet-calculator.ts`**: Implementa a regra matemática oficial do PET-Saúde:
  $$\text{Duração} = \lceil \text{Saída} \rceil - \lfloor \text{Chegada} \rfloor$$
  Contém também formatadores para datas no padrão brasileiro (`DD/MM/YYYY`) e rotulagem de meses de referência.
- **`storage.ts`**: Camada de abstração do `localStorage`. Implementa:
  - Isolamento de dados por perfil de usuário e por mês (`pet_folha_activities_v2_${userId}_${monthKey}`).
  - Leitura de cópias 1.0 a 1.3 e exportação 1.3 pela interface. A restauração valida a cópia antes de gravar, pede confirmação e oferece diagnóstico local sem conteúdo pessoal.
  - Remoção automática do campo legado `pin` dos perfis armazenados e importados.
  - Suporte a templates e funções dinâmicas.
- O IndexedDB guarda cada comprovante original e seus IDs de atividade no escopo do perfil e mês. O JSON 1.3 leva os bytes em Base64 e os vínculos. Na restauração, uma falha no `localStorage` aborta a transação do IndexedDB. Se a transação abortar após as escritas locais, a restauração tenta revertê-las.
- **`admin-auth.ts` + `/api/admin/session`**: Camada exclusivamente server-side que valida `ADMIN_PIN_HASH` com comparação constante, emite sessão assinada de 8 horas em cookie `HttpOnly`, `SameSite=Strict` e falha de forma fechada quando a configuração está ausente.
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

1. **PIN fora do bundle**: O hash e o segredo de sessão usam variáveis sem o prefixo `NEXT_PUBLIC_` e são lidos apenas por código marcado como `server-only`. Não existe hash padrão embutido.
2. **Sessão do painel**: O endpoint `/api/admin/session` valida o PIN no servidor, compara hashes em tempo constante, restringe requisições mutáveis à mesma origem e mantém a sessão em cookie assinado e `HttpOnly`. Parâmetros de URL não concedem acesso.
3. **Limite de confiança**: O painel altera somente o `localStorage` do navegador. A sessão reduz acesso casual à interface, mas não impede o proprietário do navegador de editar dados, scripts, backups ou folhas. Autoridade institucional real exige persistência, autenticação e autorização server-side sobre cada mutação.
4. **Zero Rastreamento Invasivo**: A telemetria de uso é fornecida pelo `@vercel/analytics`, que opera de maneira puramente estatística sem uso de cookies e sem coleta de IP ou dados identificáveis.
5. **Contenção de Viewport**: A interface implementa proteção estrita contra overflow horizontal (`overflow-x: hidden; max-width: 100vw;`) e dimensões fluidas, garantindo que navegadores móveis (Safari iOS e Chrome Android) mantenham a escala correta `1:1`.

## Login com Google e cópia no Google Drive (25/11/2026)

Plano e decisões: [entrega-2-login-google-drive.md](entrega-2-login-google-drive.md).

- **Modo de operação**: com `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_SESSION_SECRET` configurados, o login com Google é obrigatório. Sem eles, `/api/google/session` responde `configured: false` (ou a rota não existe) e o app mantém o modo somente local, para desenvolvimento e testes.
- **Sessão**: o servidor guarda o refresh token do Google criptografado (AES-256-GCM) no cookie `HttpOnly` `pet_google`, no próprio navegador. Não há banco de dados. O navegador pede tokens de acesso curtos em `/api/google/token`.
- **Continua local-first**: `localStorage` e IndexedDB seguem como fonte de trabalho. `src/lib/drive-sync.ts` envia cada mês alterado para a pasta visível **PET Folha** (escopo `drive.file`), um arquivo JSON 1.3 por mês, identificado por `appProperties` (`petFolha=month`, `monthKey`, `profileId`). O envio vai do navegador direto para a API do Drive (limite de ~4,5 MB por requisição nas funções da Vercel).
- **Agendamento** (`src/lib/use-drive-sync.ts`): envio cerca de 3 s depois de cada alteração; nova tentativa ao voltar a conexão e ao esconder a aba; busca de meses mais novos ao abrir o app e ao voltar à aba após 1 min. O estado por conta fica em `pet_folha_drive_sync_v1`.
- **Conflito**: se o mesmo mês mudou aqui e no Drive desde a última sincronização, a pessoa escolhe qual versão fica. A outra é gravada na mesma pasta como cópia de conflito (`petFolha=conflict`), nunca apagada. Meses locais nunca sincronizados são enviados ou viram conflito, nunca sobrescritos.
- **Perfil vinculado**: `UserProfile.googleSub` liga o perfil à conta. Primeira entrada num aparelho: traz os meses do Drive, vincula uma folha que já está no navegador ou cria o cadastro (`src/components/FirstEntry.tsx`).
- **Saída**: `Sair da conta` revoga o acesso e pode apagar os dados deste aparelho, só depois que tudo foi enviado.

## Refinamento de interface (31/10/2026)

A interface usa tokens semânticos e componentes compartilhados de marca, rodapé e ajuda. Os modais utilizam o elemento nativo `dialog`, e o tema é sincronizado com `useSyncExternalStore`, preservando a preferência no navegador. Não há alteração de contratos de dados nem de autenticação. Consulte [ui-ux.md](ui-ux.md) para detalhes e verificação.


## Reestruturação do percurso (02/11/2026)

A entrada permite continuar sem JSON quando o perfil permanece neste navegador.
As áreas centrais são Minha frequência e Folha oficial. Datas acompanham o mês
selecionado; a lista de meses cobre agosto/2026 a agosto/2028 e mantém visível
um mês válido de backup legado fora desse intervalo. O cálculo canônico e a
leitura de cópias 1.0 permanecem.

A importação valida todos os registros antes de escrever, recusa colisão de nome
com ID diferente e registra os valores anteriores das três chaves afetadas.
Falha intermediária tenta recuperar as escritas já concluídas; falha dessa
recuperação é anunciada separadamente. Há teste das duas situações. O relatório
opcional contém somente operação, código permitido e versão suportada, sem envio
remoto. O estado React só confirma uma gravação concluída.

A camada de leitura usa texto principal/campos em 16px e auxiliares a partir de
14px. A tipografia do documento mantém tamanhos em pontos e entrelinha própria.
A paginação automática permite distribuir o conteúdo pelo espaço
A4 disponível, preservando os registros para revisão. Resultado de impressão ou
download acionado não é apresentado como confirmação de arquivo salvo.

O CI está definido em `.github/workflows/ci.yml`, com Node 22, instalação pelo
lockfile, lint, testes, build, tipagem e percurso Playwright. A documentação de
[UI/UX](ui-ux.md) concentra as evidências e limites de homologação.

A impressão divide frequências extensas automaticamente em A4 paisagem. Os cabeçalhos da tabela se repetem nas páginas seguintes. O total e os campos de assinatura aparecem juntos somente no final da frequência, antes dos comprovantes. Na área de lançamentos há um lembrete com acesso ao formulário de cada atividade.

## Preparo do Forms e histórico de publicações

form-report.ts centraliza o endereço oficial, os identificadores da primeira
etapa, as opções e a montagem do link. Os identificadores e o preenchimento
foram conferidos no formulário respondente em 07/11/2026. Nome precisa
corresponder à grafia da lista oficial. As próximas etapas variam com o tipo
de atividade e são preenchidas pelo participante no Google.

Activity.formReport é opcional. Contém grupo, perfil e tipo escolhidos.
A confirmação manual guarda data e uma representação ordenada dos dados
da atividade e identificação. A comparação com os valores atuais determina
Enviado, Pendente ou Revisar envio. Editar uma atividade preserva esses metadados.
Os links preenchidos são gerados na ação do participante, sem persistência
da URL. O site não recebe confirmação de envio do Google.

A restauração 1.2 valida o preparo e os campos da confirmação antes de gravar.
Versões anteriores são lidas sem confirmação de relatório.
ReleaseNotes usa uma lista estática de publicações em releases.ts, com datas
explícitas no fuso de São Paulo.
