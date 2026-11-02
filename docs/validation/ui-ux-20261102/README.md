# Validação da reestruturação — 02/11/2026

## Escopo e ambiente

Mudança de UI/UX, retomada de perfil, datas, diagnóstico/restauração e CI.
Base: `3c32740`; implementação na branch `codex/ui-ux-restructure`. Todas as
interações usaram contextos isolados e participantes sintéticos. Os dados reais
do navegador do mantenedor e os arquivos recebidos no relato não foram usados
como fixtures.

Node 22.23.2, Next 16.3.6 e dependências do lockfile. Os gates finais foram
executados em cópia no volume local Linux, sem `.env`, para evitar a espera de
arquivos observada no volume do repositório. O navegador usou uma cópia da mesma
fonte, Next em modo de desenvolvimento com Webpack e Chromium; o build de
produção foi Turbopack. A instalação das dependências novas também foi concluída
no checkout original. Esta conferência não mede ganho de desempenho de CI.

## Resultados

| Verificação | Resultado |
| --- | --- |
| Tipagem (`npm run typecheck`) | Aprovada |
| Build de produção (`npm run build`) | Aprovado; página inicial, not-found e rota administrativa geradas |
| Lint (`npm run lint`) | Sem erros; 3 avisos de funções de entrada não usadas no script legado de Google Sheets |
| `npm run test:ui` | 20 testes aprovados |
| Playwright desktop/celular emulado | 7 cenários por projeto, 14 casos distintos aprovados em recortes; somente caminhos alterados/falhos foram repetidos |
| Leitura do painel preenchido | 360/390/768/1440px × claro/escuro, sem overflow, sem texto medido abaixo de 14px e sem falha na amostra de contraste |
| Impressão | PDFs vazio, comum e dez registros em uma página A4 paisagem, papel branco e assinaturas preservadas |
| Conteúdo extenso | 40 registros longos bloqueiam abertura da impressão; todos os registros permanecem armazenados |

A amostra de contraste percorreu os textos visíveis do painel preenchido,
excluindo o documento oficial e ferramentas de desenvolvimento, com limites de
4,5:1 para texto comum e 3:1 para texto grande. O relatório agregado está em
[leitura.json](leitura.json). Não representa uma certificação de acessibilidade
nem uma medição de todos os estados de hover/erro do aplicativo.

### Percursos do navegador

1. Nome já registrado → continuação explícita sem JSON → mês novo vazio → mês anterior intacto → saída, retomada e recarga sem duplicação.
2. Criar → adicionar → editar → recarregar → baixar JSON → restaurar com confirmação → conferir folha → abrir impressão → excluir.
3. Cópia inválida sem perda de registros; detalhes sem sentinela pessoal; cancelamento de troca de mês conserva o formulário.
4. Temas e quatro larguras com mês preenchido, controles/escala de texto, Escape e retorno de foco da ajuda.
5. Falha de gravação mantém o formulário e permite tentar novamente após recuperar o armazenamento.
6. Conteúdo acima de uma página mantém os dados e não aciona impressão silenciosamente cortada.
7. Falha ao editar atividade/perfil mantém os diálogos e valores; fechar o aviso devolve o foco à ação anterior.

A primeira reprodução automatizada falhou para cadastro repetido sem perfil de
continuação e para navegador novo preenchido com perfis de exemplo. Os dois
casos passaram após a correção. A suite também cobre falha intermediária da
restauração, falha de sua recuperação e colisão de nomes com IDs diferentes.

Durante a validação foram corrigidos seletores dos novos testes, uma anotação
TypeScript de callback de teste e a configuração local de dependências do build.
Essas falhas não foram apresentadas como defeitos confirmados em produção.

## Capturas

As capturas anteriores foram produzidas a partir da base preservada, com mês
vazio. As posteriores mostram uma atividade sintética para conferir a tabela,
as fontes e os cartões. Não são uma comparação de tempo para a mesma tarefa.
O indicador de desenvolvimento do Next pode aparecer nas imagens locais.

| Tela | Evidência |
| --- | --- |
| Base anterior | [Desktop](antes-desktop.png), [celular](antes-mobile.png) |
| Entrada atual | [Desktop](entrada-dark-desktop.png), [celular](entrada-dark-mobile.png) |
| Painel atual, escuro | [Desktop](painel-dark-1440.png), [celular](painel-dark-390.png) |
| Painel atual, claro | [Desktop](painel-light-1440.png), [celular](painel-light-390.png) |
| PDFs sintéticos | [Vazio](folha-vazia.pdf), [comum](folha-comum.pdf), [dez registros](folha-dez-registros.pdf) |

Os três PDFs foram inspecionados por contagem de páginas e dimensão física
(841,92 × 594,96 pontos, A4 paisagem); as páginas foram renderizadas para
conferência visual do cabeçalho, tabela, total, assinaturas e margens. O modelo
original também é A4 paisagem de uma página. `OfficialSheet.tsx` e o PDF mestre
não foram modificados. O CSS mantém a entrelinha original do documento e força
`color-scheme: light` na impressão para evitar margens escuras.

## CI e pendências reais

O workflow possui permissões de leitura, cancelamento de execuções superadas,
timeout, instalação pelo lockfile, cache npm, quatro checks e Playwright. As
actions foram conferidas nos repositórios oficiais e fixadas nas revisões de
checkout 7.0.1, setup-node 7.1.0 e upload-artifact 7.0.2. A execução remota ainda
não foi comprovada: depende do push humano e da abertura do PR/atualização da main.

Permanecem a conferência em smartphone físico com teclado virtual, zoom real de
200% e impressora. A emulação Chromium não comprova Safari/iOS real. A medição
preventiva de altura é uma proteção local; a impressão deve ser conferida nos
navegadores efetivamente usados pelos participantes. Configurações e autenticação
administrativas continuam com seu contrato existente.

O portal Maestri não estava disponível no PATH deste terminal; a conferência
foi executada diretamente com Playwright. A homologação do canvas e do fluxo
entre agentes permanece independente desta entrega.
