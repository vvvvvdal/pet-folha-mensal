# TASKS: Rastreamento de Tarefas e Entregas

## Tarefas Concluídas
- [x] Inicialização do projeto com Next.js 15 (App Router), TypeScript e Tailwind CSS.
- [x] Configuração da porta de desenvolvimento padrão para 5000 (`next dev -p 5000`).
- [x] Migração dos assets, templates oficiais (`.docx`, `.pdf`, `.xlsx`) e logo do PET.
- [x] Implementação dos tokens de conforto óptico e anti-fadiga visual (`frontend-design-ultimate`).
- [x] **Modo Administrador (PIN 4031) e Gestão Total**: Painel exclusivo para criação, edição e exclusão de usuários, criação de novos GATs, novos tipos de funções (roles no SUS) e personalização de templates de atividades.
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

## Modo de Execução Atual: Localhost
- [x] Execução autossuficiente em `http://localhost:5000` com persistência local (`localStorage`).

## Próximos Passos (Postergados para Etapa Futura)
- [ ] **Deploy na Vercel**: Configuração e publicação remota (ignorado temporariamente a pedido do usuário).
- [ ] **Persistência em Nuvem (Supabase opcional)**: Sincronização multi-dispositivo via PostgreSQL.
- [ ] **Exportação assinada**: Integração com assinatura digital Gov.br / ICP-Brasil.
- [ ] **Relatórios consolidados**: Exportação semestral consolidada por GAT.
