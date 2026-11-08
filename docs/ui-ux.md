# Interface e experiência de uso

## Percurso entregue — 02/11/2026

A prioridade é preencher a frequência com poucos passos, inclusive no celular:
abrir perfil → escolher mês → lançar/revisar → conferir folha → guardar cópia e PDF.
A direção e as referências estão no [plano](ui-ux-restructure-plan.md).

### Entrada e retomada sem JSON

“Continuar” oferece um seletor dos perfis que permanecem neste navegador. O participante pode
abrir outro mês sem restaurar o arquivo anterior. Primeiro acesso cria um perfil;
novos navegadores começam sem participantes de exemplo. Uma tentativa com nome
já cadastrado oferece “Continuar com este perfil”, mostrando a identificação
existente, sem recriar, alterar sua função/GAT ou apagar os meses anteriores.

A restauração atende à troca de aparelho. A interface explica que os registros
antigos dependem do navegador original ou da cópia .json; um PDF não os restaura.
A entrada mostra, sem expansão, o que é o JSON, como salvar/restaurar e a
finalidade distinta do PDF. A prévia demonstrativa foi removida. FAQ/ajuda
continuam disponíveis. Frame e Segmented Control foram adaptados dos componentes
nativos do Frequência Hub; [origem e licença](THIRD-PARTY-UI.md).

A versão antiga distribuía cinco perfis de exemplo. A entrada oculta somente
as assinaturas originais intactas, sem chave de atividades e sem perfil ativo.
Perfis editados, com campos extras ou qualquer chave de atividades (inclusive
vazia ou inválida) continuam acessíveis. A filtragem não grava nem remove dados;
o cadastro repetido ainda pode oferecer a retomada do perfil armazenado.
Isso é uma apresentação local, sem diretório remoto. Qualquer pessoa que use o
mesmo navegador pode abrir seus perfis, como informa a entrada.

### Minha frequência

Mês, participante e GAT definem o contexto. O mês inicial acompanha a data atual,
limitado aos meses da vigência. A seleção cobre agosto/2026 a agosto/2028. Um mês
válido restaurado fora desse intervalo continua selecionável, preservando a
compatibilidade. A data inicial da atividade acompanha o mês escolhido. As opções dos seletores
nativos definem fundo e texto com os tokens do tema, evitando texto claro sobre
um popup claro no modo escuro.

O resumo mostra horas, atividades e referência mensal aproximada de 32h. Não usa
média por quatro semanas como validação semanal nem declara “Apta para envio”.
O formulário mostra o cálculo PET antes de adicionar, oferece modelos opcionais
e mantém o preenchimento diante de erro. Troca de mês/seção pede confirmação
antes de descartar um formulário ainda não adicionado.

Formulário e registros ficam lado a lado quando há espaço e em uma coluna no
celular. A tabela usa quatro colunas; listas em cartões atendem espaços menores.
Editar/excluir têm nomes acessíveis com a descrição do registro. Limpar mês exige
confirmação; exemplos são opcionais e identificados como fictícios.

### Tipografia e conforto

A escala deriva da orientação `frontend-design-ultimate` e dos controles e
formulários documentados no Frequência Hub, adaptados à identidade PET:

| Uso | Tamanho |
| --- | --- |
| Texto principal, campos, rótulos e ações usuais | 16px |
| Informações auxiliares, metadados e rodapé | Pelo menos 14px |
| Navegação compacta no celular | 15–16px |
| Títulos de blocos | 20–24px |
| Título da área de trabalho | 28px |

A entrelinha do texto é de 1,5–1,65. As superfícies são claras ou grafite; a ação
principal usa verde PET acessível. Contornos de campos são distintos das bordas
estruturais. Foco visível, alvos de pelo menos 44×44px e movimento reduzido são
preservados. A folha oficial mantém sua escala em pontos e entrelinha própria.

### Cópia, restauração e conclusão

“Salvar cópia” produz o JSON para continuar editando e leva os comprovantes originais. “Imprimir / salvar PDF”
abre a impressão da folha para assinatura. A conclusão distingue as duas ações e
mantém confirmação de saída quando existem alterações sem cópia acionada.
Em **Minha folha**, a seção opcional **Comprovantes** fica abaixo da prévia.
Aceita PDFs, JPEGs e PNGs de até 20 MB por arquivo, com limite mensal de 40 MB
e 30 páginas de comprovantes. A impressão mantém a folha oficial primeiro e
acrescenta uma página A4 em paisagem para cada imagem ou página de PDF, na ordem
da lista. As páginas de comprovantes saem como imagens. Assine o PDF completo.
Restaurar uma cópia antiga preserva os comprovantes locais daquele mês.

Os avisos descrevem a ação iniciada, sem afirmar que um download/PDF foi salvo
quando o navegador não fornece essa confirmação.

Antes da restauração, a interface mostra participante, mês, quantidade de
atividades e o efeito da substituição. Todos os registros são validados antes
de gravar. Colisão de nome com outro ID é recusada. A restauração recupera as
escritas anteriores se uma etapa falhar; se a recuperação também falhar, informa
isso explicitamente. Outros perfis e meses permanecem fora da operação.

Erro exibe orientação e detalhes opcionais selecionáveis para suporte: operação,
código permitido e formato suportado. Conteúdo, identificadores pessoais, nomes,
atividades, horários e exceções brutas não entram nesse relatório. Não há envio
automático. Edição de perfil/atividade conserva o diálogo e o preenchimento
quando a gravação falha.

### Folha e impressão

A folha oficial usa paginação automática em A4 paisagem, com assinaturas no final.
A impressão força papel branco também
quando a interface usa tema escuro. A prévia tem rolagem própria, sem alargar a
página inteira.

## Validação e limites

Com Node 22 e instalação pelo lockfile:

```text
npm run test:ui
npm run lint
npm run build
npm run typecheck
npx playwright install chromium
npm run test:e2e
```

A suíte local cobre cálculo, isolamento, formato de cópia, retomada sem JSON,
validação antes de escrita, falha intermediária/recuperação e estrutura da UI.
Playwright cobre o percurso real, download/restauração, edição/exclusão, foco,
rascunhos, falha de armazenamento e conteúdo acima do limite de impressão, em
Chromium desktop e celular emulado. A matriz inclui 360/390/768/1440px e os dois
temas. HTML estático não é tratado como teste de interação.

Resultados, capturas, PDFs e limites de homologação estão em
[evidências da reestruturação](validation/ui-ux-20261102/README.md).
O CI está preparado; sua primeira execução remota depende do push humano.
Conferência física de smartphone, zoom real de 200% e impressora continuam
pendentes. O piloto Maestri tem sua homologação própria e não bloqueia esta UI.

## Referências

- [Design do Frequência Hub](</mnt/hddw/Users/felip/Documents/GitHub/frequencia-hub/docs/UI-DESIGN.md>) e [formulários refinados](</mnt/hddw/Users/felip/Documents/GitHub/frequencia-hub/docs/validation/design-refinement/README.md>).
- [Unslop, Damir Sokolovsky, revisão a6f121e](https://github.com/heydamir/unslop/blob/a6f121eee5f29c2f74976b75456feae8b66afb3a/skills/unslop/SKILL.md), CC BY 4.0: direção do produto e passes de refinamento adaptados ao PET.
- [Referências Oracle](oracle-ci-logs-unslop.md) para CI e diagnóstico local.

A impressão divide frequências extensas automaticamente em A4 paisagem. Os cabeçalhos da tabela se repetem nas páginas seguintes. O total e os campos de assinatura aparecem juntos somente no final da frequência, antes dos comprovantes. Na área de lançamentos há um lembrete com acesso ao formulário de cada atividade.

## Formulário por atividade e novidades

O botão "Forms" de cada atividade abre o modal "Enviar ao Forms": e-mail, grupo,
perfil e tipo de atividade, mais as perguntas do tipo escolhido (local da visita,
nome do evento, dados do curso EAD; em "Outros", a atividade vem com o nome
registrado), atendimento a usuários do SUS, declaração e cópia por e-mail.
O link pré-preenche todas as etapas do Forms oficial (campos mapeados em
`src/lib/form-report.ts`, horários em `entry.X_hour/_minute`). O participante
confere, resolve o CAPTCHA, anexa o certificado do curso EAD (se houver) e envia
pelo Google. O resumo continua disponível para copiar.

O envio só é confirmado quando a pessoa marca "Já enviei". A lista oferece filtro
de pendências. Alterações nos dados da atividade ou na identificação após a
confirmação mostram "Revisar envio". O preparo e a confirmação acompanham a
cópia 1.2; respostas extras são opcionais e não invalidam confirmações antigas.
Cópias 1.0 e 1.1 entram com os relatórios pendentes.

## Layout em tela única

No desktop (a partir de 1100 px de largura e 640 px de altura) a tela de
lançamentos ocupa a janela sem rolar a página: barra superior em uma linha,
resumo de horas na faixa do título, lembrete do formulário e "Conferir folha" em
uma barra inferior. Só a lista de atividades rola, quando necessário. No celular
a ordem é natural e a rolagem é esperada, com espaçamento compacto.

## Peso dos comprovantes

Páginas de comprovantes em PDF e fotos reduzidas para a página são geradas em
JPEG a 80% com fundo branco, a ~150 dpi, em vez de PNG, para manter o PDF final
abaixo dos 5 MB aceitos para assinatura. Fotos que já cabem na página não são
recodificadas. O tamanho final não foi medido com comprovantes reais.

Na entrada, Novidades apresenta a publicação mais recente e um histórico
expansível antes das dúvidas frequentes. As datas vêm de publicações
registradas em src/lib/releases.ts. A retomada de perfil é descrita como
dados guardados no navegador.

Validação de 07/11/2026 para Forms assistido: 22 testes locais, build e tipagem
aprovados. Lint sem erros, com três avisos dos scripts legados. Os 24 casos
de navegador pertinentes passaram em desktop e celular simulado, com checagem
visual em 390 e 1440 px, nos dois temas. O teste legado do seletor de mês foi
separado desta rodada; sua falha no mobile já foi reproduzida na versão anterior.
O pré-preenchimento real foi conferido na primeira etapa do Forms, encerrando
a verificação antes de avançar ou enviar respostas.
