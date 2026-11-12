# Interface e experiência de uso

O [guia de design](ui-design.md) reúne a identidade visual, os padrões de componentes e os critérios de verificação da interface.

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
finalidade distinta do PDF. A entrada inclui uma prévia ilustrativa identificada, com dados de exemplo. FAQ/ajuda
continuam disponíveis. Frame e Segmented Control foram adaptados dos componentes
nativos do Frequência Hub; [origem e licença](THIRD-PARTY-UI.md).

A versão antiga distribuía cinco perfis de exemplo. A entrada oculta somente
as assinaturas originais intactas, sem chave de atividades e sem perfil ativo.
Perfis editados, com campos extras ou qualquer chave de atividades (inclusive
vazia ou inválida) continuam acessíveis. A filtragem não grava nem remove dados;
o cadastro repetido ainda pode oferecer a retomada do perfil armazenado.
Isso é uma apresentação local, sem diretório remoto. Qualquer pessoa que use o
mesmo navegador pode abrir seus perfis, como informa a entrada.

### Frequência

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
abre a impressão da folha para assinatura. A janela “Antes de sair” distingue as duas ações e
mantém confirmação de saída quando existem alterações sem cópia acionada.
A aba **Comprovantes** reúne os arquivos opcionais do perfil e mês selecionados.
Escolha **Atividade** para o lote ou use **Vincular a atividades** nos arquivos já
salvos. O mesmo arquivo pode aparecer em várias atividades. O navegador guarda
um original, com limites de 20 MB por arquivo, 40 MB por mês e 30 páginas de
comprovantes no PDF, contando cada repetição.

O PDF acrescenta os comprovantes em A4 paisagem após as assinaturas, na ordem
das atividades e dos arquivos enviados. Os sem vínculo aparecem no final.
Cada página identifica o arquivo e, quando vinculada, a atividade. Assine o PDF completo.

A cópia JSON 1.3 inclui originais, vínculos e dados do Forms. As versões 1.1
e 1.2 restauram os arquivos da cópia sem vínculo. A versão 1.0 preserva os
arquivos locais e os vínculos cujas atividades existem no mês antes e depois
da restauração.

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

Em 10/11/2026, a validação de comprovantes passou em 23 testes locais e 28 de
navegador, com Chromium desktop e celular emulado. A matriz da seção cobre
360, 768 e 1440 px nos temas claro e escuro, incluindo teclado e foco.
O PDF sintético em A4 paisagem gerou duas páginas de folha e cinco de
comprovantes, com assinaturas antes dos anexos. A cópia 1.3 foi restaurada em
um contexto limpo do navegador. Build, tipagem e lint passaram, com três avisos
preexistentes no script legado do Google Sheets.

## Referências

- [Design do Frequência Hub](</mnt/hddw/Users/felip/Documents/GitHub/frequencia-hub/docs/UI-DESIGN.md>) e [formulários refinados](</mnt/hddw/Users/felip/Documents/GitHub/frequencia-hub/docs/validation/design-refinement/README.md>).
- [Unslop, Damir Sokolovsky, revisão a6f121e](https://github.com/heydamir/unslop/blob/a6f121eee5f29c2f74976b75456feae8b66afb3a/skills/unslop/SKILL.md), CC BY 4.0: direção do produto e passes de refinamento adaptados ao PET.
- [Referências Oracle](oracle-ci-logs-unslop.md) para CI e diagnóstico local.

A impressão divide frequências extensas automaticamente em A4 paisagem. Os cabeçalhos da tabela se repetem nas páginas seguintes. O total e os campos de assinatura aparecem juntos somente no final da frequência, antes dos comprovantes. Na área de lançamentos há um lembrete com acesso ao formulário de cada atividade.

## Formulário por atividade e novidades

O botão "Forms" de cada atividade abre o modal "Enviar ao Forms": e-mail, grupo,
perfil e tipo de atividade, mais as perguntas do tipo escolhido (local da visita,
nome do evento e dados do curso EAD), atendimento a usuários do SUS e declaração.
Em **Participação em eventos**, o campo **Qual foi a
atividade?** sugere o trecho após o primeiro hífen ou travessão entre espaços.
Se não houver separador, sugere o nome registrado. A pessoa pode editar a
sugestão antes de abrir o Forms. Em **Outros**, a sugestão usa o nome registrado.
A opção **Receber cópia por e-mail** foi retirada do preparo e do link gerado.
O link pré-preenche os campos preparados no Forms oficial (campos mapeados em
`src/lib/form-report.ts`, horários em `entry.X_hour/_minute`). O participante
confere, resolve o CAPTCHA, anexa o certificado do curso EAD (se houver) e envia
pelo Google. O resumo continua disponível para copiar.

O envio só é confirmado quando a pessoa marca "Já enviei". A lista oferece filtro
de pendências. Alterações nos dados da atividade ou na identificação após a
confirmação mostram "Revisar envio". O preparo e a confirmação acompanham a
cópia 1.2; respostas extras são opcionais e não invalidam confirmações antigas.
Cópias 1.0 e 1.1 entram com os relatórios pendentes.

## Navegação e uso diário — 12/11/2026

Frequência, Folha e Comprovantes aparecem no menu lateral do computador e na
barra inferior do celular. No desktop, lista e formulário ficam lado a lado;
no celular, Adicionar atividade abre uma folha inferior e preserva o rascunho
ao voltar. A página rola para acomodar os campos e listas extensas.

No computador, Restaurar cópia e Salvar cópia ficam juntos no cabeçalho.
No celular, o botão Cópia abre um menu curto com Salvar cópia e Restaurar cópia,
ícones e explicações. As duas ações ficam disponíveis durante o uso diário. Não há “Fechar o mês”. O menu de perfil (computador) e Conta (avatar
no celular) reúnem identificação, Minhas folhas, tema, ajuda e Sair.
A saída preserva os registros, oferece cópia/PDF e alerta sobre alterações
sem cópia. Minhas folhas permite escolher um mês do perfil; o seletor de mês
continua disponível. Trocas preservam a confirmação de descarte de rascunho.

Tema inicial claro, com Claro/Escuro/Sistema persistidos no navegador. O resumo
alterna Mensal/Semanal, lembrando a escolha. Semanas começam na segunda-feira,
recortadas nas bordas do mês; todas as barras usam verde e a referência semanal
é de 8 h. O total mensal aproximado de 32 h não substitui a conferência semanal.

A entrada apresenta a prévia do produto, três passos, arquivos e dúvidas.
Onboarding oferece duas telas introdutórias e identificação, com Pular e
atalho para restaurar cópia; aparece apenas no primeiro acesso do navegador.
As confirmações de operação aparecem por cinco segundos, pausando ao receber
foco ou ponteiro. A última inclusão/edição pode ser desfeita enquanto não houver
outra alteração ou troca de seção/mês; outras operações invalidam a ação.
Lembretes locais ficam numa seção expansível: prazo institucional, referência
da semana corrente (com aviso das semanas parciais) e cópia pendente.


## Peso dos comprovantes

Páginas de comprovantes em PDF e fotos reduzidas para a página são geradas em
JPEG a 80% com fundo branco, a ~150 dpi, em vez de PNG, para manter o PDF final
abaixo dos 5 MB aceitos para assinatura. Fotos que já cabem na página não são
recodificadas. O tamanho final não foi medido com comprovantes reais.

Na entrada e na aplicação, o sino abre um popover de Novidades ancorado ao
botão, sem ×. Fecha pelo sino, clique fora ou Escape. O marcador de leitura é
compartilhado e gravado ao abrir. Atualizações novas aparecem completas;
anteriores ficam no histórico expansível. Os dados vêm de `src/lib/releases.ts`.
O rodapé da entrada abre o mesmo painel. O sino não reúne pendências locais.

Validação de 07/11/2026 para Forms assistido: 22 testes locais, build e tipagem
aprovados. Lint sem erros, com três avisos dos scripts legados. Os 24 casos
de navegador pertinentes passaram em desktop e celular simulado, com checagem
visual em 390 e 1440 px, nos dois temas. O teste legado do seletor de mês foi
separado desta rodada; sua falha no mobile já foi reproduzida na versão anterior.
O pré-preenchimento real foi conferido na primeira etapa do Forms, encerrando
a verificação antes de avançar ou enviar respostas.
