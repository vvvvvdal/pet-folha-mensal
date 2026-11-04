# TASKS: Rastreamento de Tarefas e Entregas

## Tarefas Concluídas
- [x] Inicialização do projeto com Next.js 15 (App Router), TypeScript e Tailwind CSS.
- [x] Configuração da porta de desenvolvimento padrão para 5000 (`next dev -p 5000`).
- [x] Migração dos assets, templates oficiais (`.docx`, `.pdf`, `.xlsx`) e logo do PET.
- [x] Implementação dos tokens de conforto óptico e anti-fadiga visual (`frontend-design-ultimate`).
- [x] **Painel de Configurações Locais**: Interface para criação, edição e exclusão de usuários, GATs, funções e templates; o bloqueio por PIN limita acesso casual, sem atribuir autoridade institucional aos dados do navegador.
- [x] **Motor Anti-Duplicação e Normalização de Participantes**: Normalização algorítmica (`normalizeName`), bloqueio rigoroso de nomes idênticos no cadastro e rotina de auto-desduplicação para limpar clones órfãos pré-existentes no `localStorage`.
- [x] **Ajuste de Conforto Óptico (Dark Slate Suave)**: Transição do preto absoluto (`#09090b`) para uma paleta carvão/slate balanceada (`#141720` canvas, `#1b202c` surface, `#232938` elevated, bordas `#2b3346`), garantindo descanso visual e contraste confortável.
- [x] **Isolamento Transparente de Dados de Perfis**: Remoção do auto-povoamento acidental de atividades de exemplo para novos usuários. Novos participantes começam com a folha zerada (0h), com botão opcional de carregar exemplos do GAT e ação de zerar folha.
- [x] **UX Simplificada de Backup (Sem Jargão Técnico)**: Substituição de termos como "Exportar JSON" por ações claras e acessíveis como "Salvar Cópia" e "Restaurar", protegendo os dados do bolsista contra limpezas de histórico.
- [x] **Redesign Minimalista e Despoluição Visual (`shadcn` + `vercel-web-design-guidelines`)**: Eliminação de barreiras de login, remoção de banners e ruído visual, bloqueio exclusivo em Dark Mode, formulário compacto e barra de progresso em linha.
- [x] **Arquitetura Local-First & Conformidade LGPD (Privacy by Design)**: Dados 100% no navegador (`localStorage`), zero custos com nuvem e sem risco de vazamento de dados de terceiros.
- [x] **Generalização Dinâmica por GAT**: Botão de atalho e formulário injetam dinamicamente o número e tema do GAT ativo (`Reunião do GAT ${user.gatNumber} (${user.gatName})`).
- [x] Implementação da regra canônica de cálculo de horas PET (`CEILING - FLOOR`).
- [x] Componente `OfficialSheet.tsx` e regras de impressão `@media print` gerando folha A4 Paisagem idêntica ao modelo do Ministério da Saúde.
- [x] Criação da documentação canônica em `docs/` (`architecture.md`, `regimento-pet.md`, `deployment-vercel.md`).
- [x] **Identidade Visual Oficial (PET-Saúde Clima)**: Integração da paleta oficial do Cerrado/Saúde/Clima (`#008D4C`, `#00A3E0`, `#F9BD47`, `#DE3831`, `#94C12D`), logos em alta resolução vetorial, favicon oficial e suporte a alternância dinâmico Modo Claro / Modo Escuro suave.
- [x] **Simplificação e Limpeza Administrativa**: Remoção de campos desnecessários de e-mail no Admin, confirmação de segurança na exclusão de templates, e redução dos modelos padrão para 2 essenciais (Reunião do GAT e Reunião Geral).
- [x] **Licenciamento e Autoria**: Licença MIT adicionada ao repositório com atribuição oficial a Felipe Gonçalves Vidal e Robert Francisco Taveira no rodapé e metadados.
- [x] **Fluxo Guiado de Onboarding e Backup**: Landing page com explicação simplificada de arquivos `.json` e segurança 100% local, tela de bloqueio de saída com download forçado do backup e folha A4.
- [x] **Ciclo de Ergonomia e Operação (23/09/2026)**: Inclusão de edição de lançamentos, confirmação para exclusão, controles de saída responsivos sem ações duplicadas, ícones de calendário e hora consistentes entre temas, restauração do acesso administrativo no mobile e ajustes para preservar a folha em A4 paisagem.
- [x] **Correção do Bloqueio do Painel (24/09/2026)**: Remoção do bypass `auth=1`, do hash público/fallback e dos PINs legados de perfil; validação server-side, sessão assinada em cookie `HttpOnly` e documentação explícita do limite de confiança do `localStorage`.

## Modo de Execução Atual: Localhost
- [x] Execução autossuficiente em `http://localhost:5000` com persistência local (`localStorage`).

## Comprovantes da folha mensal

- [x] Anexar comprovantes opcionais por perfil e mês, incluir no PDF para assinatura e levar os originais na cópia de segurança. [Fluxo e limites](docs/ui-ux.md).

## Próximos Passos (Postergados para Etapa Futura)
- [x] Conferir a base após o pull: baseline antiga de 19 erros/5 avisos superada. Lint atual sem erros, com 3 avisos legados; demais gates e ambiente nas [evidências](docs/validation/ui-ux-20261102/README.md).
- [x] Implementar o [plano de reestruturação UI/UX](docs/ui-ux-restructure-plan.md): retomada de perfil sem JSON, tipografia maior, formulário/lista, referência de horas, diagnóstico/restauração e impressão protegida. [Comportamento](docs/ui-ux.md) e [evidências/limites](docs/validation/ui-ux-20261102/README.md).
- [x] Corrigir contraste das opções do seletor de mês no modo escuro, com teste de teclado e contraste nos dois temas; entrada/JSON/perfis refinados e publicados em `d93a128`. [Evidência local e produção](docs/validation/entry-theme-20261102/README.md).
- [ ] Conferir a primeira execução remota do CI após push humano: workflow preparado com tipagem, lint, testes locais, build e Playwright.
- [ ] Homologar a nova UI em smartphone físico, zoom real de 200% e impressora; matriz local emulada e PDFs conferidos. [Escopo](docs/validation/ui-ux-20261102/README.md).
- [ ] Homologar o primeiro fluxo do [Maestri com Codex/Gemini Argon 4](docs/AGENT-WORKFLOW.md): confirmar modelo, comunicação, limites de escrita e gates reais.
- [x] **Deploy na Vercel (02/11/2026)**: snapshot de `d309198` publicado em produção, estado READY e domínio principal conferido. Retomada sem JSON, isolamento entre meses e fontes de 16px aprovados no navegador publicado. [Registro e limites](docs/validation/ui-ux-20261102/README.md#publicação-em-produção--02112026).

## Refinamento de UI/UX (31/10/2026)
- [x] Entrada com acesso prioritário e FAQ; refinada em 02/11 com explicação visível de JSON/PDF, componentes do Hub e tratamento não destrutivo dos exemplos antigos. Prévia demonstrativa removida. [Detalhes](docs/ui-ux.md).
- [x] Temas por tokens semânticos, navegação responsiva, campos associados e modais nativos.
- [x] Verificação de tipos, lint e compilação de produção; regressão de cálculo e cópias de segurança.
- [x] Revisão posterior no navegador em 360/390/768/1440 px, claro/escuro, teclado/foco e PDF A4. A limitação da sessão de 31/10 foi superada na validação local de 02/11; homologação física permanece no item próprio acima.
