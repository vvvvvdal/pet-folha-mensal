# Guia de design da interface

Este guia adapta os padrões de estrutura, componentes e verificação do Frequência Hub à identidade e aos fluxos do PET. O comportamento da interface e as evidências de verificação ficam no [registro de UI/UX](ui-ux.md). A origem e a atribuição dos componentes adaptados de coss ui constam em [THIRD-PARTY-UI.md](THIRD-PARTY-UI.md).

## Composição escolhida

O mantenedor escolheu o formulário ao lado da lista no desktop no
[protótipo navegável](wireframe-ui.html). No celular, a lista abre a inclusão
em janela de tela cheia. A ação de voltar preserva o preenchimento em andamento.

A prévia cobre lançamentos, folha e comprovantes, edição, identificação,
Forms, vínculo de arquivos e conclusão. **Esqueleto** mostra a organização;
**Aplicação visual** aplica tipografia, marca e tokens do PET. Os dados e as
ações de salvar são simulados.

As janelas propostas mantêm cabeçalho e ações visíveis, com rolagem no corpo.
No desktop, Forms e edição usam duas colunas. No celular, a janela ocupa a
tela. A composição da folha aproxima os comprovantes da prévia no desktop.

## Identidade, temas e tipografia

A interface usa os tokens definidos em `src/app/globals.css` e as marcas do [manual de identidade do PET-Saúde Clima](visual-identity/manual-de-idv.pdf). A aplicação abre em tema escuro e guarda a preferência no navegador. Inter é a família do corpo e Plus Jakarta Sans a dos títulos, com alternativas definidas no CSS. A escala de referência usa 16 px para texto principal e campos, pelo menos 14 px para metadados e ações compactas, 20–24 px para títulos de blocos e 28 px para o título da área de trabalho. A folha oficial usa papel branco e sua escala própria.

| Token | Escuro | Claro | Papel |
| --- | --- | --- | --- |
| `--background` | `#17181c` | `#f6f8f6` | Fundo |
| `--surface` | `#1f2126` | `#ffffff` | Superfície |
| `--foreground` | `#edf0f4` | `#202e26` | Texto principal |
| `--body` | `#cbd0d9` | `#46594d` | Texto de apoio |
| `--muted` | `#a6adb9` | `#627269` | Metadados |
| `--primary` | `#355b44` | `#007c46` | Ação principal |
| `--accent` | `#a1ccab` | `#00733e` | Acento PET |
| `--control-border` | `#818b85` | `#758278` | Contorno de controles |
| `--info` | `#86c9e5` | `#006b92` | Informação e foco |
| `--danger` | `#ff9f99` | `#b72c29` | Erro ou ação destrutiva |
| `--warning` | `#edc577` | `#94600b` | Aviso |

Use os tokens locais para superfícies, bordas e estados. Combine cor e texto para indicar erro, seleção ou aviso.

## Componentes e acessibilidade

Botões têm texto ou nome acessível, estado de foco visível e alvo de pelo menos 44 × 44 px, inclusive ações só com ícone. A ação principal tem destaque; ações secundárias e destrutivas conservam hierarquia distinta. Avisos descrevem o resultado conhecido e orientam o próximo passo, sem afirmar que o navegador concluiu um salvamento que não pode confirmar. Falhas preservam o preenchimento quando possível.

`Modal` usa `dialog` nativo, nome acessível, contenção e retorno de foco e fechamento por Escape. Confirmações de ações destrutivas explicam o efeito. `Frame`, `FrameHeader` e `FramePanel` agrupam conteúdo; `SegmentedControl` usa grupo e botões com `aria-pressed`, em `src/components/ui/access-controls.tsx`. Reutilize os componentes e tokens existentes antes de criar variantes.

## Layout e interação

- Em larguras pequenas, priorize a ordem de leitura e deixe conteúdo e ações quebrarem linha. A prévia da folha pode rolar dentro da própria região.
- Em espaço amplo, agrupe campos relacionados e mantenha o formulário ao lado dos registros. Data, chegada e saída pedem larguras menores que a descrição. No celular, formulário e registros seguem em coluna.
- Use a navegação existente para **Minha frequência** e **Folha oficial**. Mês, perfil e GAT dão contexto à tarefa. Use o rodapé para ajuda e links auxiliares.
- Mantenha o sino de **Novidades** no cabeçalho das duas abas. Use o diálogo compartilhado e o mesmo histórico da entrada, com indicação de atualização ainda não aberta no navegador.
- Mantenha rótulos visíveis, erros próximos ao campo, ordem de teclado lógica e o preenchimento em caso de erro. Apresente o cálculo PET antes de incluir a atividade.
- Em listas compactas, use a informação necessária para identificar cada item e deixe detalhes extensos quebrarem linha. A seleção múltipla oferece um resumo no item e a lista completa no diálogo.

## Movimento e estados

Use transições discretas de foco, hover e abertura onde os componentes já as oferecem. Respeite a preferência por movimento reduzido. Durante carregamento ou gravação, mostre a operação em andamento e desative as ações que dependem dela. Em caso de falha, informe se a pessoa pode tentar novamente e preserve a seleção. Prefira confirmação para remoção, substituição de dados e descarte de rascunho.

## Comprovantes e cópia

Na aba **Folha oficial**, a seção **Comprovantes** fica abaixo da prévia. O seletor **Atividade** e o envio dividem uma linha quando há espaço. No celular, o seletor vem acima de **Escolher arquivos**. A escolha vale para o lote. Cada arquivo ocupa uma linha de lista com nome, tamanho, páginas e atividades vinculadas. Os botões quebram linha conforme a largura.

**Vincular a atividades** abre o diálogo de seleção múltipla. Data, horário e descrição ajudam a distinguir os registros. O original é único e pode ser reutilizado. A remoção do arquivo pede confirmação. A contagem de páginas mostra o efeito da repetição no PDF. Os limites, a ordenação na impressão e a compatibilidade de cópias estão no [fluxo de cópia, restauração e conclusão](ui-ux.md#cópia-restauração-e-conclusão).

## Referências

| Fonte | Aplicação no PET |
| --- | --- |
| [Guia do Frequência Hub, revisão 79edea5](https://github.com/vvvvvdal/frequencia-hub/blob/79edea5dc3a4632da5a15e6a3c5d9d44b3bd7964/docs/UI-DESIGN.md) | Estrutura, densidade dos formulários, rótulos, resumo de seleção, ações em telas estreitas e validação proporcional. |
| [coss ui](https://coss.com/ui) | Origem de Frame e Segmented Control. O PET reutiliza as adaptações locais com HTML nativo. |
| [Manual de identidade do PET](visual-identity/manual-de-idv.pdf) | Aplicação da marca e da paleta institucional. |
| [Plano de reestruturação do PET](ui-ux-restructure-plan.md) | Hierarquia da entrada, percurso mensal, ergonomia e impressão oficial. |

## Verificação proporcional

Para cada alteração, registrar telas, larguras, temas e interações afetadas. Conferir reflow, foco, teclado, estados de erro e confirmações em celular e desktop, nos dois temas; avaliar zoom real de 200% quando aplicável. Para comprovantes, verificar lotes, múltiplos vínculos e remoção, limites incluindo repetições, migração das versões 1.0–1.3, restauração e ordem/conteúdo do PDF após assinaturas. Conferir também dados do Forms e preservação de originais. Executar os gates pertinentes (`npm run test:ui`, `npm run lint`, `npm run typecheck`, `npm run build` e `npm run test:e2e`) conforme a mudança e registrar resultados e limites reais. Revisões físicas de celular e impressão não são substituídas por emulação.
