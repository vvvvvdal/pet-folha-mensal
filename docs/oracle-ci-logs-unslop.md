# Referências do Oracle: CI, logs e refinamento visual

## Validação desta task

- Tipo de mudança: planejamento/docs e configuração local de papéis de agentes.
- Durante a task: conferir scripts existentes, fontes, caminhos e JSON dos papéis.
- Integração final: diff/referências e gates locais de CONTRIBUTING: tipagem, lint e build.
- Repetir/ampliar: apenas por mudança relevante, falha ou dúvida concreta.

## Retomada

Prioridade definida pelo mantenedor em 02/11/2026: reestruturar UI/UX como
ferramenta enxuta, cobrindo o fluxo inteiro, celular e impressão. Seguir o
[plano integrado](ui-ux-restructure-plan.md), com CI como apoio inicial e
diagnóstico junto do backup/restauração. O refinamento recebido no pull muda
a base de comparação; os 19 erros/5 avisos abaixo são históricos de `208e663`.

Ao pedir “Vamos planejar usando as referências/skills que o Oracle deixou”,
escolher **OR-CI**, **OR-LOG** ou **OR-UI** e preparar o plano executável.
A reestruturação da interface, o diagnóstico de restauração e o workflow de CI
foram implementados conforme [UI/UX](ui-ux.md). A primeira execução remota do CI
e a homologação física permanecem pendentes. As seções abaixo preservam o plano
original e a baseline histórica; resultados atuais ficam nas
[evidências](validation/ui-ux-20261102/README.md). Ambiente e papéis em
[AGENT-WORKFLOW](AGENT-WORKFLOW.md). Avaliação dos dez posts e fontes fixadas no
[Oracle](</home/felipe/Documentos/Obsidian Vault/Oracle/09 - CI, Logs, Unslop e Maestri.md>).

## OR-CI — criar uma base pequena antes de otimizar

Na inspeção de 02/11/2026 não há `.github/workflows` nem suíte em `tests/`.
`package.json` oferece `lint` e `build`; a tipagem é `npx tsc --noEmit`.
A versão instalada é Next 16.3.6, apesar de trechos antigos citarem Next 15.
Reconfirmar a versão em package/lockfile antes de mudar ferramentas.

Baseline reproduzida em 02/11/2026 sobre `208e663`, antes desta configuração:
`npx tsc --noEmit` passou. Em cópia isolada da mesma revisão, Node 22.23.2 e
`npm ci` pelo lockfile, sem `.env`, o build Turbopack passou; lint falhou com
**19 erros e 5 avisos** (efeitos React, `any`, imagens e scripts legados).
Exemplo: `src/lib/theme.ts:14`, `react-hooks/set-state-in-effect`.
Os checks no volume original foram interrompidos após mais de dez minutos com
espera de arquivos e quase nenhum uso de CPU; a cópia local concluiu a compilação
em 4,6s, sem contar instalação/tipagem/geração. Essa comparação de ambientes não
mede ganho de CI. Nenhum arquivo do produto foi alterado nesta configuração.
Regularizar o baseline antes de tornar o futuro CI obrigatório.

Planejar um workflow com instalação reproduzível pelo lockfile, versão de Node
compatível, cache npm, typecheck, lint e build, cancelamento de runs superados,
permissões mínimas e timeout. Fixar actions em revisões verificadas no momento
da implementação. Começar com um job simples; medir fila/preparação/execução.

Para alterações futuras de comportamento, acrescentar testes focados do cálculo
canônico de horas e da restauração/isolamento por perfil+mês. Não introduzir uma
infraestrutura de Supabase/telemetria remota num aplicativo local-first.
Não comprar runners, instalar Nx ou trocar tsc/ESLint antes de haver medição.

Aceite: checkout limpo executa checks sem credenciais de produção; erro de
tipagem/lint/build faz o workflow falhar. Publicação continua etapa separada.
Registrar a primeira medição; não prometer os 20× de outro projeto.
Fontes: [Owen](https://x.com/owengretzinger/status/2116291924219060319) e
[Linear](https://linear.app/now/ci-bottleneck-reworked).
`systematic-debugging` só se surgir falha de causa incerta.

## OR-LOG — diagnóstico local que preserve dados do participante

`src/lib/storage.ts` e `src/lib/pet-calculator.ts` concentram persistência e horas;
`src/lib/admin-auth.ts` e `/api/admin/session` são servidor. O localStorage não
confere autoridade administrativa. Não copiar logs de SaaS multi-tenant para cá.

Planejar primeiro erros de importação/restauração: código estável, operação,
versão do schema e resultado, sem conteúdo do arquivo, nome, atividade, horários
ou identificador do participante. Diagnóstico para suporte deve ser voluntário,
visível antes da cópia e sem envio remoto automático. No servidor, somente
código permitido, duração e ocorrência; nunca PIN, hash, cookie ou sessão.

Aceite: backup sintético inválido produz orientação útil e mantém o estado
anterior; relatório sanitizado não contém sentinelas pessoais; dados continuam
locais. Verificar implementação atual antes de atribuir comportamento já existente.

Fonte: [Logging Sucks](https://loggingsucks.com/) e
[logging-best-practices](https://github.com/boristane/agent-skills/blob/8aa14dd16a1340a6049e6d7cd58e2ed52333a550/skills/logging-best-practices/SKILL.md),
referência externa não instalada. Aplicar apenas a estrutura mínima necessária.

## OR-UI — refinar a folha e o fluxo com identidade PET

Auditar uma tela escolhida entre `LandingPage`, `ActivityForm`, `ActivityTable`
e `ExitModal`. Capturar estado inicial local, com dados sintéticos, e localizar
hierarquia fraca, repetição de cards, espaçamento, rótulos e ações concorrentes.
Preservar paleta oficial PET/Cerrado, temas e ergonomia; a cor oficial não é
“slop” por existir. Dar destaque ao preenchimento e ao total de horas.

Aplicar passes de espaçamento→hierarquia/cor→ícones/texto→tipografia/detalhes.
Não remover confirmação de perda de dados ou acesso ao backup para simplificar
a aparência. `OfficialSheet.tsx` e impressão são fronteira protegida: manter o
gabarito oficial A4 paisagem em uma página e a fórmula `CEILING - FLOOR`.

Aceite: preencher, editar, excluir, salvar cópia, restaurar e imprimir continuam
funcionando; claro/escuro, mobile/desktop, teclado/foco, toque de 44px e inputs de
16px preservados. Se a folha for afetada, comparar o PDF com o modelo oficial.

Skill de execução: `frontend-design-ultimate`; para revisão,
`vercel-web-design-guidelines`, só quando necessária.
[Unslop de Damir](https://github.com/heydamir/unslop/blob/a6f121eee5f29c2f74976b75456feae8b66afb3a/skills/unslop/SKILL.md)
é referência externa não instalada, CC BY 4.0; manter atribuição em adaptações.
[Tobi](https://x.com/tobiadonadon_/status/2106430529113301163) inspira comparação
de conceitos só em reformulação ampla. Stageshow fica para um eventual tutorial
simulado de preenchimento/backup, sem mudar a folha oficial.
