# TASKS: Rastreamento de Tarefas e Entregas

## Tarefas Concluídas
- [x] Inicialização do projeto com Next.js 15 (App Router), TypeScript e Tailwind CSS.
- [x] Configuração da porta de desenvolvimento padrão para 5000 (`next dev -p 5000`).
- [x] Migração dos assets, templates oficiais (`.docx`, `.pdf`, `.xlsx`) e logo do PET.
- [x] Implementação dos tokens de conforto óptico e anti-fadiga visual (`frontend-design-ultimate`).
- [x] **Redesign Minimalista e Despoluição Visual (`shadcn` + `vercel-web-design-guidelines`)**: Eliminação de barreiras de login, remoção de banners e ruído visual, bloqueio exclusivo em Dark Mode (`#09090b`), formulário compacto e barra de progresso em linha.
- [x] **Arquitetura Local-First & Conformidade LGPD (Privacy by Design)**: Dados 100% no navegador (`localStorage`), zero custos com nuvem e sem risco de vazamento de dados de terceiros, com suporte a Exportação/Importação de backup em JSON.
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
