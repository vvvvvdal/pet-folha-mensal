# Trabalho com agentes no PET Folha

## Começar pelo resultado

Use um **agente principal** na pasta do projeto, pelo app com acesso local ou pelo
Maestri. Ele entende o pedido, planeja, implementa e valida na mesma conversa.
Não é necessário alternar entre quatro agentes ou aprender comandos.

Leia [AGENTS](../AGENTS.md), a pendência de [TASKS](../TASKS.md) e somente o contrato
da área. [CONTRIBUTING](../CONTRIBUTING.md) define integração e gates.
Essas fontes prevalecem sobre papéis do Maestri. Modelos e disponibilidade são
configuração do ambiente, não regra de produto deste repositório.

## Papéis e entrada/saída

| Papel | Quando usar | Entrada e saída | Escrita |
| --- | --- | --- | --- |
| Principal | Padrão para toda tarefa | Objetivo e aceite → entrega, caminhos, checks e pendência real | Único integrador do recorte autorizado |
| Pesquisa | Questão factual ou investigação independente | Pergunta delimitada → fontes, datas, conclusões e limites | Sem implementar nem mudar contratos |
| Revisão | Mudança com risco ou revisão solicitada | Base/diff e aceite → achados por arquivo/linha e evidência | Sem corrigir o produto nem se autoaprovar |

O principal pode ser Claude ou Codex. Gemini fica disponível para pesquisa via
Antigravity. Um revisor de outro fornecedor é opcional; o modelo não substitui
verificação. Planejamento e execução são etapas do principal, não sessões fixas.

Preserve dados locais, isolamento por perfil/mês, backup, sessão/PIN verificados no servidor, cálculo CEILING - FLOOR e folha oficial A4 paisagem. Não envie dados de participantes para observabilidade remota.

## Uso no Maestri

Os presets globais são **Principal · Claude**, **Principal · Codex**,
**Pesquisa · Gemini** e **Revisão · Codex**. Abra somente o apoio necessário.
Os papéis globais Principal/Pesquisa/Revisão apontam para as regras do repositório.
Não dependem dos antigos arquivos de papel removidos deste checkout.

O canvas organiza sessões. Dar nomes ou conectar terminais não comprova que os
agentes trocaram contexto. Passe pergunta ou objetivo, arquivo/ID, limites,
base do diff e aceite; devolva resultado e evidência. Não copie o chat inteiro.
O contexto de outro app não é importado automaticamente.

Papéis são instruções, não sandbox. Pesquisa Gemini e revisão Claude usam modo
plan; revisão/pesquisa Codex usam sandbox read-only nos presets locais. O principal
confere os limites efetivos e os gates antes de integrar. Login e catálogo precisam
funcionar na conta atual; configurar um nome de modelo não os comprova.

## Subagentes e coordenação

Subagente é uma delegação interna da sessão que retorna ao principal. Outro
terminal é outra sessão, com histórico próprio. Ambos podem consumir cota.
Uma tarefa simples usa um agente. Delegação só com recorte independente,
instrução aplicável, entrada, saída, limites e aceite. Dois writers no mesmo
caminho precisam de worktrees ou execução em sequência; dois terminais no mesmo
checkout não isolam alterações. Revisão não recebe autoridade sobre produção.

Estado e decisões ficam no repositório. Publicação, comunicação externa e push
seguem a autorização da tarefa e as regras locais. Homologação de uma entrega
real no Maestri continua em TASKS; teste de configuração não a substitui.

Configuração nativa: `~/.maestri`. Backup antes desta simplificação:
`~/.local/state/oracle-maestri-20261109-simplificacao/`. Perfis e logins existentes
são reaproveitados. Referência: [presets e papéis do Maestri](https://www.themaestri.app/en/docs/terminals).
