# Comprovantes e revisão geral — 12/11/2026

## Entrega

- Miniaturas de imagens e da primeira página dos PDFs. A miniatura abre o arquivo
  original em outra aba. Prévia com proporções preservadas e páginas indicadas.
- Inclusão em três momentos: escolher arquivos, conferir atividades por arquivo,
  salvar. Preparar a seleção não grava no mês. O lote revisado é atômico.
- Cancelar mantém o que já estava salvo. Falha de gravação mantém a seleção para
  nova tentativa. Limpar seleção desmarca atividades sem retirar o arquivo.
- Atividades, nome, tamanho e páginas ficam junto da miniatura. A remoção mantém
  confirmação. Limites e repetição de páginas ficam em uma explicação expansível.
- Textos revisados na entrada, ajuda, saída, Forms, configurações e demais telas.
  Sem travessões e ponto e vírgula nos textos de interface. Conteúdo digitado pelo
  participante e modelo oficial não são reescritos.
- Rodapés com links e botões na mesma tipografia. Janelas com largura comum de
  720 px e espaçamento compartilhado. Abas de acesso com área estável. Editores
  móveis encostam no fundo e mantêm as ações acessíveis.
- Sidebar de 304 px em telas largas e 280 px em 900–1199 px. Menu do perfil dentro
  da barra, sem brilho verde. Rodapé ocupa a largura da aplicação. Cabeçalho da
  entrada reúne ajuda, tema e configurações em Mais opções.
- Removidos nome duplicado no topo, Lembretes da folha e instrução de fechar o
  sino. Modelo voltou ao seletor e Sair substituiu Sair / trocar participante.

## Validação

- Node 22.23.2. Build de produção e tipos aprovados após a integração final.
- ESLint sem erros. Três avisos preexistentes em scripts/legacy-tools/apps_script_google_sheets.js.
- `npm run test:ui`: 25/25.
- `node scripts/verify-attachment-drafts.mjs`: IndexedDB real, lote integral,
  IDs repetidos, vínculos removidos e limites que contam cada repetição no PDF.
- `attachments-review.spec.ts`: 4/4 na build local de produção final. Preparo
  sem gravar, cancelamento, vínculos por arquivo, Limpar seleção, primeira página
  do PDF, original completo, falha de escrita e retentativa. Diálogos móveis
  a até 2 px da borda inferior da tela.
- `frequency.spec.ts`: 34 casos exercitados em desktop/mobile. A execução integral
  passou 30/34. Casos afetados por texto, seletor de Sair e prazo do cenário de
  restauração foram corrigidos nos testes e passaram no reteste (6/6). Mantidas
  verificações de impressão, vínculos, cópias antigas e restauração.
- `redesign.spec.ts`: 26 casos exercitados. 21/22 passaram na primeira execução,
  os quatro casos adicionais de navegação passaram e o caso de tema foi corrigido
  e retestado nos dois projetos (2/2). Tipografia, janelas, estabilidade do acesso,
  teclado, foco, reflow, temas e navegação aprovados entre essas execuções.
- Área de acesso medida nas três abas: em 1440 px, 720 × 646,8 px. Em 390 px,
  358 × 830,8 px. Em 360 px, 328 × 830,8 px. Sem corte de conteúdo ou altura máxima.
- Conferência visual em 360, 390, 768, 1000 e 1440 px conforme o componente,
  nos dois temas. Imagens das capturas e nomes de perfis são de demonstração.

## Correção do tema Sistema

A verificação encontrou uma corrida após recarregar: o aparelho mudava de tema
antes da assinatura de eventos, e a aplicação mantinha o tema inicial. A
instrumentação confirmou zero assinaturas antes da mudança e quatro depois,
com a preferência do sistema já diferente do tema aplicado. A assinatura agora
sincroniza o estado atual ao montar, além de acompanhar as próximas mudanças.

## Capturas

- [Conferência antes de salvar](conferencia-desktop.png)
- [Lista com prévias no computador](lista-desktop.png)
- [Lista no celular](lista-celular.png)
- [Alterar atividades no celular](atividades-celular.png)
- [Menu de perfil, modelo e rodapé](navegacao-desktop.png)
- [Cabeçalho da entrada](entrada.png)
- [Cabeçalho da entrada no celular](entrada-celular.png)

## Rótulos finais

Tema substitui Ativar tema claro/escuro no menu da entrada. Configurações
substitui Configurações locais nos menus e no nome acessível da janela.
Tipagem, build e lint direcionado passaram. Os dois testes de teclado do menu
passaram novamente em desktop e celular. As capturas foram atualizadas.

## Limites

Chromium desktop e celular emulado. Homologação em aparelho físico, leitor de tela
real, zoom de sistema e impressora continuam próprias. Não houve envio de resposta
real ao Forms. Miniaturas são geradas no navegador e os originais permanecem na
cópia 1.3. O formato e as regras de impressão oficiais foram preservados.

## Publicação em produção

- Data: 12/11/2026. Código de origem `d838926`, enviado pela API conectada.
- Deployment `dpl_2EbBmde1QPpctxRuwqGsG8s4GZ4y`, produção, estado READY.
- [Domínio principal](https://pet-folha-mensal.vercel.app), HTTP 200.
- Next.js, Node 22. Build remoto de aproximadamente 21 segundos.
- Conferidos Tema/Configurações, sidebar de 304 px, ausência do nome no topo
  e de Lembretes, seletor Modelo e fluxo real de conferência de dois arquivos.
- PNG e primeira página do PDF renderizados. Nenhum comprovante gravado antes
  de Salvar. Ambos foram salvos com a atividade selecionada.
- Cópia 1.3 baixada e restaurada em 390 px, com dois originais, vínculos e 5 h
  conferidos. Download padrão exercitado com seletor nativo de salvamento
  desabilitado apenas no navegador de teste.
- Zero erros de página. Consulta de error/fatal deste deployment nos últimos dez
  minutos sem registros. Sem drains externos configurados.
- [Captura do domínio publicado](producao-comprovantes.png), somente com dados sintéticos.
