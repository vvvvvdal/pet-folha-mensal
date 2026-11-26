# Entrega 2 — Login com Google obrigatório + cópia automática no Google Drive

Status (25/11/2026): plano aprovado e telas aprovadas no canvas. Interface e sincronização implementadas na branch `worktree-entrega-2-sync-ui`. Rotas do servidor em outra branch. Falta o projeto no Google Cloud.

## Context

Hoje o PET Folha é local-first: perfil e atividades em `localStorage`, comprovantes em IndexedDB, e a troca de aparelho depende de baixar/restaurar um `.json` à mão. A Entrega 1 (Gemini, commit `edcf636`) só deixou a Entrega 2 nomeada; não havia plano em `.md`.

Objetivo: entrar com Google em qualquer aparelho e ter a folha sincronizada sozinha com o Drive da própria pessoa, sem banco de dados no servidor.

Decisões do usuário (23–25/11/2026):
- **Login com Google obrigatório.** O `.json` vira importação/exportação manual dentro da conta.
- **Pasta visível "PET Folha"** no Drive da pessoa (escopo `drive.file`: o app só enxerga os arquivos que ele criou).
- **Sincronização sempre automática**: o servidor guarda a chave de renovação do Google criptografada num cookie `HttpOnly` do próprio navegador. Nada é gravado em banco.

Fontes conferidas em 25/11/2026 (Google, documentação oficial):
- `drive.file` e `drive.appdata` são escopos **não sensíveis**: só exigem verificação básica de marca, sem auditoria de segurança ([Drive API auth](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)).
- No modelo de token só de navegador, o token dura pouco e só renova com clique ([token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)). Para renovar sozinho é preciso o fluxo com código de autorização e refresh token guardado no servidor ([code model](https://developers.google.com/identity/oauth2/web/guides/use-code-model)).
- Em status **Testing**, o app só aceita usuários de teste e os refresh tokens expiram em 7 dias. Por isso o app precisa ir para **In production**. Nome e logo na tela de consentimento exigem verificação de marca: página inicial, política de privacidade no mesmo domínio e domínio verificado no Search Console ([requisitos](https://support.google.com/cloud/answer/13464321), [branding](https://support.google.com/cloud/answer/15549049)).
- A Vercel limita o corpo de cada requisição a uma função a ~4,5 MB. Por isso o envio para o Drive sai **do navegador direto para a API do Google**, usando um token de acesso curto entregue pelo servidor.

## Arquitetura

```
Navegador ──/api/google/login──► Google (código + PKCE + state)
          ◄─/api/google/callback─ troca código → refresh token + id_token
             cookie pet_google (AES-256-GCM: refresh token, sub, e-mail, nome e URL opcional da foto)
Navegador ──/api/google/token───► servidor renova e devolve access token (~1 h, sem cache)
Navegador ──REST/CORS──────────► Drive API v3 (pasta "PET Folha", 1 arquivo por mês)
```

- Escopos: `openid email profile https://www.googleapis.com/auth/drive.file`, com `access_type=offline` e `prompt=consent` no primeiro login.
- Continua local-first. `localStorage`/IndexedDB seguem como fonte de trabalho, e o Drive é a cópia sincronizada. O app funciona offline e envia as pendências quando a conexão volta.
- Drive: pasta `PET Folha` criada pelo app. Um arquivo por mês, `PET Folha - {Nome} - {AAAA-MM}.json`, no formato 1.3 atual (com comprovantes em Base64). `appProperties` = `{ petFolha: "1", profileSub, monthKey }` para localizar sem depender do nome. Envio *multipart* até 5 MB e *resumable* acima disso.
- Variáveis na Vercel: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_SESSION_SECRET` (≥32 bytes). Atualizar `.env.example`.

## Implementação

### Fase 0 — Telas no canvas (aprovação visual antes de codar a UI)
Adicionar ao canvas existente (https://claude.ai/artifact/NkxyKRMjfY7pUE4vmoctVo) quatro telas:
1. Entrada com "Entrar com Google" (botão no padrão de marca do Google).
2. Primeira entrada no aparelho: "Encontramos estes meses no seu Drive" / vincular folha local existente.
3. Status de sincronização no topo ("Salvo no Drive há 2 min" / "Sincronizando…" / "Sem conexão: envio pendente").
4. Conflito entre aparelhos.

### Fase 1 — Servidor (`src/lib/google-auth.ts`, `src/app/api/google/*`)
- `google-auth.ts` (`server-only`): seguir o padrão de `src/lib/admin-auth.ts` (configuração por env que falha fechada, `timingSafeEqual`). Implementar `sealSession`/`openSession` com AES-256-GCM via `node:crypto`, a geração de PKCE/state e a verificação do `id_token` (`aud`, `iss`, `exp`).
- Rotas, todas com `runtime = 'nodejs'`, `no-store` e verificação de origem como `src/app/api/admin/session/route.ts`:
  - `login`: redireciona ao Google com state/PKCE em cookie curto.
  - `callback`: valida o state, troca o código e grava o cookie `pet_google` (`HttpOnly`, `Secure`, `SameSite=Lax`, 180 dias).
  - `session`: GET devolve `{ authenticated, email, name, sub }`.
  - `token`: POST devolve o access token; em `invalid_grant`, apaga o cookie e responde 401.
  - `logout`: POST revoga o token no Google e apaga o cookie.
- Ler `node_modules/next/dist/docs/01-app` (route handlers, `cookies()`) antes de escrever, como pede o `AGENTS.md`.

### Fase 2 — Cliente Drive e motor de sincronização (`src/lib/drive-sync.ts`)
- `getAccessToken()` com memória até perto de expirar. Depois as funções `ensureFolder`, `listMonthFiles`, `downloadMonth` e `uploadMonth`, com controle de concorrência por `version`/`modifiedTime`.
- Reaproveitar `exportUserData`, `inspectUserData` e `applyUserData` (`src/lib/storage.ts`), `encodeAttachments`/`decodeAttachments` (`src/lib/attachments.ts`) e `restoreWithAttachments` (`src/lib/attachment-backup.ts`). O progresso real usa `OperationProgressModal` (`src/components/LoadingStates.tsx`).
- Estado local por mês: `pet_folha_sync_v1_{sub}_{mês}` = `{ fileId, remoteModified, localDirty, lastSyncedAt }`.
- Gatilhos:
  - Após `persistActivities`, perfil salvo e `MonthlyAttachments.onChange`, envio com espera de ~3 s.
  - Em `online`, `visibilitychange` e `pagehide`, envio das pendências.
  - Ao abrir o app, busca dos meses mais novos do Drive.
- Conflito (os dois lados mudaram desde a última sincronização): perguntar qual manter, "Este aparelho" ou "Drive (de {data})". A versão descartada é guardada como `…-conflito-{data}.json` na mesma pasta, nunca apagada.

### Fase 3 — Interface
- `LandingPage.tsx`: a ação principal vira "Entrar com Google". Saem os blocos Continuar / Primeiro acesso / Restaurar, mantendo o FAQ e a explicação de privacidade. Página `/privacidade` (nova rota) com uso dos dados do Google e LGPD, linkada na entrada e no rodapé.
- `page.tsx`: o gate passa a ser a sessão Google, e não mais `getActiveProfile()`.
  - Primeiro login num aparelho: se o Drive já tem meses, baixa e restaura com progresso.
  - Se há perfis locais sem vínculo: "Vincular esta folha à sua conta" (um perfil por conta). Grava `googleSub`/`email` no `UserProfile` (`src/types/index.ts`) e envia todos os meses.
  - Conta nova sem nada: o cadastro atual (nome, função, GAT) já preenche o nome do Google.
- `Navbar.tsx`: "Salvar cópia"/"Restaurar cópia" e o ponto de alteração viram o status de sincronização. "Baixar cópia .json" e "Importar .json" vão para o menu do perfil/Conta.
- `ExitModal.tsx`: "Sair" confirma que tudo foi enviado e oferece "Apagar os dados deste aparelho" (para computador compartilhado).
- Textos curtos, sem jargão ("Salvo no seu Google Drive"). Botão de login segue as diretrizes de marca do Google.

### Fase 4 — Testes, documentação e publicação
- `scripts/verify-ui.mjs`: testes de `sealSession`/`openSession` (adulteração e expiração) e do agendador de sincronização.
- Playwright: interceptar `/api/google/session|token` e `https://www.googleapis.com/**` com `page.route`. Cenários:
  - Login e restauração de meses do Drive.
  - Vínculo de perfil local.
  - Envio após adicionar atividade.
  - Offline → online.
  - Conflito.
  - Logout apagando os dados.
- Ajustar os testes que hoje semeiam o perfil direto no `localStorage` para também simular a sessão.
- Docs: `docs/architecture.md` (deixa de ser só local), `docs/ui-ux.md`, `docs/ui-design.md`, `docs/deployment-vercel.md` (env e Google Cloud), `TASKS.md`, novidade em `src/lib/releases.ts`. Sincronizar a nota do Obsidian `Projeto - PET Saúde Clima UFG.md`, como pede o `AGENTS.md`.

## O que só você pode fazer (fora do código)
1. No Google Cloud Console: criar o projeto, ativar a Drive API, configurar a tela de consentimento (Externo, escopos acima, e-mail de suporte, links de página inicial e `/privacidade`) e criar o cliente OAuth "Aplicativo da Web". Redirecionamentos: `https://pet-folha-mensal.vercel.app/api/google/callback` e `http://localhost:5013/api/google/callback`.
2. Pôr as 3 variáveis na Vercel e no `.env.local`.
3. Mudar o status para **In production**. Opcional: verificar o domínio no Search Console e enviar a marca para mostrar nome e logo.

## Riscos e limites
- Quem já usa o app hoje precisa entrar uma vez e vincular a folha local. Sem isso, os dados continuam no aparelho, mas atrás do login.
- Mês com muitos comprovantes (até 80 MB) gera arquivo grande no Drive e downloads lentos no celular. O progresso fica visível e o download é só sob demanda nos meses antigos.
- Revogar o acesso em myaccount.google.com interrompe a sincronização. O app mostra "Reconectar ao Google".

## Verificação
- Gates: `npm run typecheck`, `npm run lint`, `npm run test:ui`, `npm run test:e2e`, `npm run build`, `slop-lint` nos arquivos de UI alterados.
- Manual, com o cliente OAuth real em `localhost:5013`:
  - Login.
  - Pasta e arquivo criados no Drive.
  - Segundo navegador recuperando os meses.
  - Edição nos dois para forçar conflito.
  - Revogação do acesso.
  - Logout com e sem apagar dados.
- Depois em produção na Vercel.
- Sem commit/push até você pedir.
