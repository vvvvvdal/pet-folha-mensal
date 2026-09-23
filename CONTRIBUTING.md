# Como Colaborar no PET Folha Mensal

O projeto adota a branch `main` como linha integrada, estável e demonstrável. Branches de trabalho devem representar uma mudança lógica verificável, com foco em uma única entrega por vez.

---

## 1. Princípios Fundamentais

- **Foco e Escopo**: Trabalhe em uma task por vez e consulte `TASKS.md` antes de iniciar. Não expanda escopo sem sinalizar a necessidade.
- **Local-First e Privacidade**: Todos os dados dos participantes (perfis, frequências e backups) residem no navegador (`localStorage`). Nenhuma chave privada, credencial ou dado pessoal deve ser enviado para servidores externos.
- **Conformidade Normativa SUS**: O documento emitido em PDF deve seguir rigorosamente o padrão A4 Paisagem oficial do Ministério da Saúde (SGTES/MS) e as diretrizes do Edital SGTES/MS nº 23/2026.
- **Ergonomia e Mobile-First**: A maioria dos participantes acessa a aplicação pelo smartphone. Todo novo controle ou tela deve respeitar a área de toque mínima de 44x44px (WCAG 2.5.5), fontes de formulário `>= 16px` (prevenindo zoom involuntário no iOS Safari) e contenção total de viewport (zero scroll horizontal indesejado).
- **Não Versione Segredos ou Arquivos Temporários**: Não versione arquivos `.env.local`, builds `.next/`, certificados ou caches de dependências.
- **Autonomia de Envio Remoto**: Agentes de inteligência artificial ou ferramentas automatizadas **nunca executam `git push`**; o envio para o repositório remoto é prerrogativa exclusiva do integrador humano.

---

## 2. Estado Atual das Frentes

As frentes do sistema coexistem de forma desacoplada e modular:

| Frente | Responsabilidade | Regra de Integração |
|---|---|---|
| **UI / Dashboard** | Telas de acesso, formulários, cards móveis e tabela desktop | Mobile-first com touch targets `>= 44px`; nunca forçar tabela de 7 colunas em telas menores que 640px |
| **Motor de Impressão (PDF)** | Gabarito oficial A4 Paisagem (`OfficialSheet.tsx`) | Preservar proporção exata para impressão em 1 página horizontal; cabeçalho tríplice intacto |
| **Cálculo de Horas** | Motor matemático (`pet-calculator.ts`) | Regra editalícia `CEILING(Saída) - FLOOR(Chegada)`; 8h semanais obrigatórias |
| **Persistência Local** | Gerenciador multiusuário e backups (`storage.ts`) | Isolamento de dados por perfil; validação de PIN de admin via hash SHA-256 (`crypto.subtle`) |
| **Telemetria e Feedback** | `@vercel/analytics` e `FeedbackModal.tsx` | Sem cookies invasivos; compatibilidade estrita com LGPD e formulário de sugestões externo |

---

## 3. Fluxo de Git

Atualize a branch `main` antes de iniciar qualquer atividade:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/nome-da-sua-feature
```

Durante o desenvolvimento:

```bash
git status --short
git --no-pager diff
```

Antes de submeter o commit:

```bash
git diff --check
git status --short
```

### Padrão de Commits

Utilize **Conventional Commits** em mensagens atômicas e descritivas:

```text
feat(ui): adicionar cards móveis para lançamentos de frequência
fix(calc): corrigir arredondamento de minutos fracionados
docs(arch): atualizar especificações de persistência local-first
refactor(navbar): desacoplar controles de navegação para telas compactas
test(storage): validar integridade de restauração de backup JSON
```

---

## 4. Gates de Validação (Obrigatórios)

Antes de concluir qualquer tarefa ou solicitar merge para a `main`, todos os gates abaixo devem ser executados com sucesso:

### 4.1. Verificação Estática de Tipagem (TypeScript)

Garante conformidade com o TypeScript 5 sem emissão de erros:

```bash
npx tsc --noEmit
```

*Critério de aceite*: Retorno código 0 (zero erros de tipagem).

### 4.2. Compilação de Produção (Next.js Turbopack)

Valida a geração de páginas estáticas, otimização de bundles e CSS:

```bash
npm run build
```

*Critério de aceite*: Compilação Turbopack concluída com sucesso e geração de todas as rotas estáticas.

### 4.3. Linter e Qualidade de Código

```bash
npm run lint
```

*Critério de aceite*: Sem warnings críticos ou erros de sintaxe ESLint.

---

## 5. Estrutura de Arquivos

Pastas do repositório indicam a especialidade do código:

- `src/app/`: Rotas Next.js App Router (`layout.tsx`, `page.tsx`, `globals.css`).
- `src/components/`: Componentes visuais desacoplados e ergonomicamente responsivos.
- `src/lib/`: Lógica de cálculo matemático do PET, persistência local e alternador de tema.
- `src/context/`: Contextos globais leves (ex: `DialogContext` para modais e alertas).
- `src/types/`: Interfaces e contratos TypeScript consolidados.
- `public/templates/`: Arquivos oficiais de referência (.pdf, .docx e .xlsx).
- `scripts/legacy-tools/`: Scripts arquivados de automação e manipulação de planilhas.
- `docs/`: Documentação canônica, arquitetura de software, regimento do PET e guias de deploy.

---

## 6. Critérios para Merge

Para que uma alteração seja incorporada à `main`:

1. `git diff --check` deve estar limpo (sem trailing whitespace ou quebras inadequadas).
2. `npx tsc --noEmit` deve passar com 0 erros.
3. `npm run build` deve compilar sem avisos de falha.
4. Não pode haver inclusão acidental de segredos, dados pessoais ou arquivos de cache.
5. A documentação (`README.md`, `TASKS.md` ou `docs/`) deve ser atualizada sempre que houver alteração de comportamento ou nova funcionalidade.
6. A memória compartilhada canônica no Obsidian deve ser sincronizada conforme as diretrizes do projeto.
