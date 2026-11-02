# Reestruturação de UI/UX do PET Folha

## Validação deste plano

- Tipo: planejamento de interface, jornada, CI e diagnóstico local; sem implementação do produto.
- Conferências: fontes locais e externas, caminhos, sequência de entregas, limites e critérios de aceite.
- Implementação futura: testes focados por fluxo; tipagem, lint, `test:ui` e build na integração. Navegador e impressão exigem conferência própria.
- Ampliar/repetir somente por alteração relevante, falha ou dúvida concreta. Checks anteriores ao pull não comprovam o estado atual.

## Situação em 02/11/2026

Implementação autorizada pelo mantenedor e entregue na branch `codex/ui-ux-restructure`,
incluindo correção do bloqueio de cadastro repetido e aumento da tipografia.
O comportamento atual está em [UI/UX](ui-ux.md); validação e homologações pendentes
ficam nas [evidências](validation/ui-ux-20261102/README.md). O planejamento original
abaixo é preservado como referência; a implementação direta foi autorizada após
a escolha da direção, sem rodada separada de aprovação de protótipo.

## Objetivo e direção escolhida

Em 02/11/2026, o mantenedor definiu UI/UX como prioridade: **ferramenta enxuta para entrar, lançar horas e gerar a folha com poucos passos**, revisando o fluxo inteiro, incluindo celular e impressão. CI e diagnóstico sustentam essa entrega.

- **Produto:** preenchimento mensal e emissão da folha de frequência dos participantes PET-Saúde Clima UFG.
- **Caráter:** direto, acolhedor e preciso.
- **Contexto visual:** documento de trabalho do PET, com identidade Cerrado/Saúde e superfícies tranquilas para uso recorrente.
- **Destaques:** total de horas do mês e documento oficial; ações secundárias recebem menor peso.
- **Assinatura:** mês da folha e contexto do GAT reconhecíveis durante o trabalho, sem repetir a identificação em todos os blocos.

Esta direção está escolhida. A distribuição exata das telas será conferida em protótipo antes da reestruturação do produto.

## Base examinada e limites da evidência

PET: revisão `3c32740`, contendo a atualização de interface `f364183` e os planos Oracle/Maestri `a146674`. Frequência Hub: checkout local `14a631f`, usado apenas como fonte e inspiração.

O refinamento recebido já inclui tokens, modais nativos, ajuda, layout responsivo e `scripts/verify-ui.mjs`. Seu documento registra tipagem, lint, testes e build aprovados; a revisão visual, teclado e impressão continuam pendentes. O registro Oracle de 19 erros/5 avisos refere-se à base anterior `208e663`.

Nesta elaboração foram examinados código/documentação do PET e documentação, navegação e duas capturas históricas do Hub. Não houve auditoria do PET em navegador, execução dos gates atuais ou homologação física. Os problemas de composição abaixo são hipóteses até essa auditoria; valores e rótulos citados foram observados no código.

### Pontos concretos para investigar

- `page.tsx` inicia o mês em `2026-09` e oferece somente agosto–dezembro/2026; `ActivityForm` inicia a data em `2026-09-23`. Definir seleção coerente com mês ativo, restauração e vigência do projeto, evitando datas fixas e lançamentos no mês errado.
- `StatsGrid` divide horas do mês, média calculada por quatro semanas e situação em três blocos. A média não verifica o requisito de cada semana. O rótulo “Apta para envio” depende somente de atingir 32h; substituir a promessa de aptidão por informação factual sobre horas.
- Navegação, tabela e conclusão oferecem ações de saída; conferir se sua repetição e a sequência de confirmações ajudam na tarefa ou geram dúvida.
- JSON e PDF têm funções distintas. Mostrar “cópia para continuar/editá-la em outro aparelho” e “folha para imprimir/assinar” nos pontos de decisão.
- `handlePrint` abre `window.print()` e retorna sucesso. Apresentar abertura da impressão sem afirmar que houve salvamento/assinatura/envio. A alternativa de download do backup também só confirma início do download.
- `importUserData` verifica parcialmente a estrutura e depois grava perfis, perfil ativo e atividades em etapas. Investigar falhas de gravação e arquivos estruturalmente incompletos com dados sintéticos antes de afirmar que toda falha preserva o estado anterior.

## Jornada proposta

### 1. Abrir minha folha

Entrada curta, com identificação institucional e ações claras de criar folha ou restaurar cópia. Retomada local e troca de participante devem ser encontráveis conforme a persistência existente. Explicação do armazenamento junto da ação, com ajuda detalhada disponível sem disputar o primeiro acesso.

Mês, participante e GAT formam o contexto de trabalho. Ao restaurar, preservar o mês do arquivo. A regra de mês inicial deve respeitar registros existentes e vigência; não inferir que a aplicação funciona só até dezembro/2026.

### 2. Lançar e revisar

Uma área principal “Minha frequência”, com mês, total de horas, quantidade de atividades e uma indicação factual de progresso. Ação principal: **Adicionar atividade**. Meta mensal aproximada não substitui avaliação semanal nem validação institucional.

Formulário agrupa data/horários, modalidade e descrição, mantém modelos frequentes e mostra o cálculo PET antes de adicionar. Erros aparecem próximos ao campo, preservando o preenchimento. Edição reaproveita a mesma linguagem e organização.

Lançamentos continuam em ordem cronológica, em lista legível no celular e tabela no desktop. Editar e excluir têm nomes contextuais. Limpar mês recebe menor destaque e confirmação. No estado vazio, o próximo passo é registrar uma atividade; exemplos permanecem identificados e opcionais.

Para o primeiro protótipo, testar formulário no próprio fluxo, sem exigir abrir e fechar um diálogo para cada lançamento. A composição no desktop pode aproximar formulário e lista se houver espaço; no celular, uma coluna. Escolher após observar a tarefa, sem impor uma sidebar para dois destinos.

### 3. Conferir e gerar a folha

Destino “Folha oficial” com mês/participante visíveis, retorno aos lançamentos e ação “Imprimir / salvar PDF”. A prévia pode ter rolagem/escala própria, sem provocar rolagem horizontal da página.

Na conclusão, apresentar cópia de segurança e folha oficial com finalidades distintas e indicação honesta de cada ação. Preservar confirmação para saída com alterações e proteção contra perda de dados, reduzindo repetição apenas após conferir o fluxo completo. Não declarar PDF salvo ou comunicação institucional enviada por abrir uma janela.

### 4. Recuperar e pedir ajuda

Restaurar cópia disponível na entrada e durante o trabalho. Informar resultado, mês e eventual substituição antes de sobrescrever registros existentes. Arquivo inválido ou falha de armazenamento conserva o estado anterior; o preenchimento e a seleção de perfil não podem desaparecer silenciosamente.

Ajuda contextual curta, FAQ e configurações locais acessíveis. A configuração administrativa permanece secundária ao preenchimento, com suas verificações existentes.

## O que adaptar do Frequência Hub

| Fonte local do Hub | Aplicação no PET |
| --- | --- |
| `docs/UI-DESIGN.md`, tokens e classes de controle | Separar superfície, texto, contorno de campo, seleção, foco e status; manter paleta PET, sem importar a paleta violeta do Hub. |
| Formulários e `docs/validation/design-refinement/` | Grupos de campos, largura legível, ações alcançáveis, fonte móvel de 16px e alvo mínimo de 44×44px. |
| `src/components/WorkspaceSidebar.tsx` | Clareza de destino ativo, contexto e rótulos; a forma final de navegação será dimensionada aos dois destinos centrais do PET. |
| Estados descritos em `docs/UI-DESIGN.md` | Erro perto da operação, tentativa novamente quando aplicável, sucesso factual e preservação de rascunho. |
| Capturas e matriz de validação do Hub | Comparação antes/depois em claro/escuro e celular/desktop; capturas históricas servem como referência, não como homologação do PET. |

Componentes e dependências só serão reutilizados depois de conferir compatibilidade e licença. A inspiração inicial é de padrões; manter o armazenamento local e os componentes existentes quando resolverem a tarefa.

## Entregas e sequência

### P0 — Conferir a base e preparar proteção mínima (OR-CI)

1. Trabalhar em branch própria de UI/UX a partir da base integrada, preservando o setup atual. Antes de código, localizar a regra `.agents/rules/ponytail.md`, ausente neste checkout durante a leitura, e consultar apenas os guias Next pertinentes.
2. Executar uma vez tipagem, lint, `npm run test:ui` e build sobre a base atual. Registrar revisão, ambiente e resultado. Corrigir somente bloqueios confirmados; não planejar em torno dos 19 erros antigos.
3. Preparar workflow simples: Node compatível, `npm ci`, cache npm, os quatro checks, permissões mínimas, timeout e cancelamento de execução superada. Conferir e fixar revisões das actions na implementação. Reaproveitar a suíte atual; acrescentar somente testes que cubram lacunas reais.
4. A execução remota só poderá ser comprovada após o envio humano. Publicação da aplicação permanece uma etapa própria.

**Saída:** base verificável e CI preparado, com falhas e limites explícitos. Esta etapa deve ser curta e viabilizar a frente visual, sem virar um projeto independente de infraestrutura.

### P1 — Auditoria visual e protótipo do fluxo completo (OR-UI)

1. Abrir a versão atual em ambiente isolado com dados sintéticos; capturar entrada, mês vazio/preenchido, edição, restauração, conclusão e prévia.
2. Anotar problemas observados de prioridade, repetição, leitura, toque, teclado e retorno após erro. Usar tarefas reais: primeiro lançamento, correção, recuperação e geração da folha.
3. Produzir um protótipo navegável enxuto da jornada proposta em celular e desktop, com claro/escuro. O primeiro protótipo cobre o percurso completo, mesmo com menor detalhe visual.
4. Revisar com o mantenedor entrada, disposição do formulário, resumo, backup e conclusão. Registrar ajustes na mesma direção escolhida antes de alterar o produto.

**Saída:** fluxo e composição revisáveis, com comparação ao estado atual; pontos não observados continuam identificados como hipóteses.

### P2 — Implementar por percurso utilizável (OR-UI)

1. Consolidar tokens/controles necessários e cabeçalho/contexto da folha, preservando os dois temas existentes.
2. Entregar entrada → identificação/mês → primeiro lançamento → lista/edição, mantendo o percurso funcional em cada incremento.
3. Completar revisão → cópia de segurança → prévia/impressão → conclusão, incluindo ajuda e acesso às configurações locais.
4. Aplicar os passes inspirados no Unslop: espaçamento, hierarquia/cor, ícones/textos, tipografia, composição e detalhes; movimento somente quando orientar interação. A marca PET permanece o ponto de partida.

**Saída:** percurso completo funcionando no celular e desktop; sem acumular telas novas desconectadas.

### P3 — Diagnóstico junto das operações de arquivo (OR-LOG)

Integrar durante a entrega de backup/restauração, antes do aceite final:

- Códigos estáveis para JSON inválido, estrutura inválida, falha de leitura, armazenamento indisponível e falha de gravação, conforme reprodução real.
- Validação antes de qualquer escrita e estratégia mínima de preservação/restauração do estado se uma gravação intermediária falhar. Conferir também falha da própria recuperação; não exibir sucesso parcial como restauração concluída.
- Mensagem orienta próximo passo sem perder o contexto do usuário.
- Detalhes de suporte opcionais, visíveis antes de copiar: operação, código, versão de formato quando disponível e resultado. Sem nome, ID pessoal, conteúdo, atividades, horários, nome do arquivo, PIN, cookie ou exceção bruta. Nenhum envio automático.

**Saída:** erro compreensível para o participante e diagnóstico útil para suporte, com teste sintético de ausência de dados pessoais e preservação do estado.

### P4 — Aceite integrado

- Executar o percurso: criar/retomar → escolher mês → adicionar → editar/excluir → recarregar → salvar cópia → restaurar → conferir folha → abrir impressão → concluir/retornar.
- Conferir isolamento entre dois perfis e dois meses, cópia antiga válida, arquivo inválido e falha de armazenamento, sem tocar em registros reais.
- Navegador: 360, 390, 768 e 1440px, claro/escuro; nomes e descrições longos; nenhum overflow da página; campos móveis de pelo menos 16px e controles de 44×44px; contraste de texto de pelo menos 4,5:1, foco identificável, teclado/Escape/retorno de foco, zoom de 200% e movimento reduzido.
- Impressão: comparar com modelo oficial; PDF A4 paisagem em uma página com cabeçalho, assinatura e linhas preservados. Usar mês vazio, comum e limite de conteúdo suportado; conteúdo acima do limite recebe tratamento explícito, sem corte silencioso ou alteração informal do gabarito.
- Reutilizar `test:ui` para lógica/estrutura; acrescentar uma verificação de navegador do percurso crítico se a infraestrutura existente não a cobrir. Teste de HTML estático não substitui interação ou PDF.
- Gates completos uma vez na integração final, repetindo só o afetado após correção. Separar aprovação local, primeira execução do CI remoto e conferência física em smartphone/impressão.
- Atualizar `docs/ui-ux.md` com o comportamento entregue e `TASKS.md` com as pendências reais. Se houver mudança de arquitetura, atualizar o contrato e o mapa Oracle pertinente.

**Conclusão:** UI/UX entregue exige percurso e impressão conferidos; compilação isolada não basta. A primeira medição registra passos e dificuldades observados, sem prometer ganho de tempo ainda não medido.

## Referências e atribuição

- [Plano Oracle do PET](oracle-ci-logs-unslop.md) e [interface recebida](ui-ux.md).
- [Design do Frequência Hub](</mnt/hddw/Users/felip/Documents/GitHub/frequencia-hub/docs/UI-DESIGN.md>) e [refinamento de formulários](</mnt/hddw/Users/felip/Documents/GitHub/frequencia-hub/docs/validation/design-refinement/README.md>).
- [Unslop, Damir Sokolovsky, revisão a6f121e](https://github.com/heydamir/unslop/blob/a6f121eee5f29c2f74976b75456feae8b66afb3a/skills/unslop/SKILL.md), CC BY 4.0. Método adaptado à direção e ao gabarito PET; a reorganização do fluxo decorre do pedido do mantenedor.
- [Linear: reestruturação do CI](https://linear.app/now/ci-bottleneck-reworked): aproveitar medição e redução de preparação repetida; decisões de runners e ferramentas dependem da realidade local.
- [Logging Sucks, Boris Tane](https://loggingsucks.com/): adaptar contexto estruturado por operação aos campos estritamente permitidos pelo PET.
- Avaliação dos dez links no [Oracle](</home/felipe/Documentos/Obsidian Vault/Oracle/09 - CI, Logs, Unslop e Maestri.md>). Demonstrações promocionais não foram tratadas como evidência de usabilidade. Stageshow e efeitos de divulgação ficam fora do percurso operacional.

O piloto [Maestri](AGENT-WORKFLOW.md) permanece disponível para revisão quando solicitado; homologar a ferramenta não é dependência da reestruturação visual.
