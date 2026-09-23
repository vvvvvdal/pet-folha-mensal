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

## Próximos Passos e Melhorias Futuras
- [ ] Conexão opcional com Supabase para sincronização em nuvem entre múltiplos navegadores via PostgreSQL.
- [ ] Exportação automática da folha assinada digitalmente com Gov.br / ICP-Brasil.
- [ ] Suporte a relatórios semestrais consolidados de atividades por GAT.
