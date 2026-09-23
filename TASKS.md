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

## Pendências para o Robert

### 1. Sistema de Autenticação e Multi-usuário em Nuvem
- [ ] **Login eficiente para produção**: Substituir o seletor local (`localStorage`) por autenticação real persistente em nuvem (ex: Supabase Auth, NextAuth/Auth.js ou Magic Link via e-mail).
- [ ] **Isolamento de dados por usuário**: Cada participante (estudante, tutor, preceptor) só acessa e edita sua própria folha de frequência, persistindo no PostgreSQL / Supabase.
- [ ] **Branch sugerida**: `feat/auth-login`

### 2. Generalização Dinâmica por GAT
- [ ] **Ajuste de atalhos e presets**: O botão de preenchimento rápido de reunião do GAT deve puxar dinamicamente o número do GAT do perfil ativo (`Reunião do GAT ${user.gatNumber}`) para qualquer um dos 5 GATs (01 a 05), sem nenhum valor fixo/hardcoded.
- [ ] **Vinculação de dados**: Garantir que as atividades padrão e descrições reflitam o GAT cadastrado do participante.
- [ ] **Branch sugerida**: `feat/gat-dynamic`

### 3. Refatoração Visual de UI/UX
- [ ] **Refatoração com `ui-ux-pro-max`**: Polir a interface de usuário (layout, hierarquia visual, espaçamento, microinterações, estados de foco e acessibilidade WCAG AAA).
- [ ] **Skills que o Robert deve baixar e utilizar**:
  1. `ui-ux-pro-max` (Design systems, heurísticas de usabilidade, microinterações).
  2. `frontend-design-ultimate` (Tokens anti-fadiga visual, contraste e paletas dark/sepia/light).
  3. `security-best-practices` (Autenticação segura, sanitização e proteção de dados no Next.js).
  4. `codebase-onboarding` (Assimilação rápida da arquitetura e contratos do projeto).
- [ ] **Branch sugerida**: `style/ui-ux-redesign`

### 4. Deploy e Infraestrutura Vercel
- [ ] **Deploy na Vercel**: Configuração de variáveis de ambiente de produção, banco de dados serverless e checagem de build em branch de staging.
- [ ] **Branch sugerida**: `deploy/vercel-production`

## Melhorias Futuras
- [ ] Exportação automática da folha assinada digitalmente com Gov.br / ICP-Brasil.
- [ ] Suporte a relatórios semestrais consolidados de atividades por GAT.
