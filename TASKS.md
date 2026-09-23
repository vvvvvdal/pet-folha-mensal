# TASKS: Rastreamento de Tarefas e Entregas

## Tarefas Concluídas
- [x] Inicialização do projeto com Next.js 15 (App Router), TypeScript e Tailwind CSS.
- [x] Migração dos assets, templates oficiais (`.docx`, `.pdf`, `.xlsx`) e logo do PET.
- [x] Implementação dos tokens de conforto óptico e anti-fadiga visual (`frontend-design-ultimate`).
- [x] Criação do seletor de perfis e login ágil com suporte aos 5 GATs e papéis do SUS.
- [x] Implementação da regra canônica de cálculo de horas PET (`CEILING - FLOOR`).
- [x] Formulário de atividades com botões de preenchimento rápido (`GAT 04`, `Reunião Geral`) e seletor de modalidade (`Síncrona virtual`, `Síncrona presencial`, `Assíncrona virtual`).
- [x] Tabela de atividades com suporte a edição (`✏️`) e exclusão (`🗑️`).
- [x] Componente `OfficialSheet.tsx` e regras de impressão `@media print` gerando folha A4 Paisagem idêntica ao modelo do Ministério da Saúde.
- [x] Alerta dinâmico na tela lembrando o usuário de salvar/imprimir o PDF após modificações.
- [x] Criação da documentação canônica em `docs/` (`architecture.md`, `regimento-pet.md`, `deployment-vercel.md`).

## Tarefas Concluídas
- [x] Inicialização do projeto com Next.js 15 (App Router), TypeScript e Tailwind CSS.
- [x] Migração dos assets, templates oficiais (`.docx`, `.pdf`, `.xlsx`) e logo do PET.
- [x] Implementação dos tokens de conforto óptico e anti-fadiga visual (`frontend-design-ultimate`).
- [x] **Sistema de Autenticação Eficiente e Multi-usuário**: Implementado sistema com abas (Acesso Rápido com PIN, E-mail & PIN, e Cadastro Completo de Novo Participante com perfil SUS e GAT 01 a 05).
- [x] **Isolamento de dados por usuário**: Particionamento estrito de atividades por `userId` com geração dinâmica de sementes para todos os 5 GATs.
- [x] **Generalização Dinâmica por GAT**: O botão de atalho e formulário injetam dinamicamente o número e nome do GAT do usuário logado (`Reunião do GAT ${user.gatNumber} (${user.gatName})`), eliminando qualquer valor fixo.
- [x] **Refatoração Visual de UI/UX (`ui-ux-pro-max`)**: Tipografia *Plus Jakarta Sans*, substituição total de emojis crus por SVGs Lucide, cards tipo Bento, foco acessível e estados de transição suaves.
- [x] Implementação da regra canônica de cálculo de horas PET (`CEILING - FLOOR`).
- [x] Componente `OfficialSheet.tsx` e regras de impressão `@media print` gerando folha A4 Paisagem idêntica ao modelo do Ministério da Saúde.
- [x] Alerta dinâmico na tela lembrando o usuário de salvar/imprimir o PDF após modificações.
- [x] Criação da documentação canônica em `docs/` (`architecture.md`, `regimento-pet.md`, `deployment-vercel.md`).

## Próximos Passos (Deploy & Infraestrutura Vercel)
- [ ] **Deploy na Vercel**: Configuração do projeto na Vercel (`vercel.com`), vinculação com o repositório GitHub e checagem de build em produção.
- [ ] **Persistência em Nuvem (Supabase opcional)**: Conexão com banco PostgreSQL remoto via variáveis de ambiente para sincronização cross-device sem depender de localStorage.
- [ ] **Exportação assinada**: Integração com assinatura digital Gov.br / ICP-Brasil.
- [ ] **Relatórios consolidados**: Exportação semestral consolidada por GAT para a coordenação do projeto.
