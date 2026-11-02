# Refinamento de entrada e seletor — 02/11/2026

Base: `69f083b`, após o primeiro deploy da reestruturação. Branch de execução:
`codex/entry-clarity-theme`. O formulário externo foi resolvido pelo mantenedor,
conforme informado na conversa; não houve alteração dele nesta entrega.

## Resultado

- Entrada factual, sem slogan, passos promocionais ou prévia demonstrativa.
- Guia JSON/PDF sempre expandido, com finalidade e ações reais do sistema.
- Frame e Segmented Control adaptados do Frequência Hub/coss ui; origem e MIT em
  [THIRD-PARTY-UI](../../THIRD-PARTY-UI.md). Sem nova dependência de produção.
- Seletor de perfil substitui a lista de cartões; aviso explícito sobre acesso
  por quem usa o mesmo navegador. Sem diretório público ou consulta remota.
- Exemplos legados são filtrados da entrada somente se intactos, inativos e sem
  qualquer chave de atividades. Registros e perfis originais são preservados.
- Opções dos seletores usam fundo/texto do tema e `--control-color-scheme`.
  O teste no build de produção detectou que o compilador convertia
  `color-scheme: inherit` em `normal`; a variável explícita preservou o tema.

## Evidência

Node 22.23.2, Next 16.3.6, dependências do lockfile, cópias Linux sem `.env`.
Build Turbopack e tipagem aprovados. Lint sem erros e com os mesmos três avisos
legados de Google Sheets. Vinte testes locais aprovados, incluindo a filtragem
sem escrita e preservação de exemplos usados/editados/ativos.

Chromium: 18 casos distintos aprovados em desktop e celular emulado, em recortes
(14 percursos existentes e quatro casos da entrada/seletor). A primeira execução
foi interrompida pelo encerramento do servidor de desenvolvimento; a validação
conclusiva usou `next start` com build de produção. O primeiro teste novo do
seletor falhou por `color-scheme: normal`; passou após a correção, sem relaxar o
limite de contraste de 4,5:1, fundo opaco e tema correto.

Entrada conferida em 360/390/1440 px nos dois temas: sem overflow, campos de
16 px e controles segmentados com altura mínima de 44 px. As imagens da entrada
foram capturadas em desenvolvimento; a mesma composição foi percorrida nos testes
de produção. As imagens `mes-*.png` registram o controle após uso pelo teclado;
o popup do sistema não aparece na captura headless e sua aparência em cada SO
permanece sujeita à homologação física.

As regras completas de impressão foram comparadas com a base e permanecem
idênticas, assim como `OfficialSheet.tsx`. O percurso de impressão/download e o
bloqueio de folha extensa passaram no navegador de produção.

- [Entrada desktop escuro](entrada-desktop-escuro.png)
- [Entrada celular claro](entrada-celular-claro.png)
- [Mês escuro](mes-escuro.png) / [Mês claro](mes-claro.png)

Safari/iOS real, impressora e primeiro CI remoto continuam com a pendência própria
em TASKS. Nenhum dado de participante foi enviado ao servidor pelos testes.

## Publicação

Integrado por avanço direto na `main` local: `d93a128a51e7cffee5900d94e6872dd51031683c`.
Publicação de produção autorizada na conversa, enviada pela API conectada da
Vercel com 46 arquivos de aplicação/configuração/assets desse checkout.

- Deployment `dpl_GdQvu1K1jUG64hiN73JeW2FRBRND`, target `production`, estado `READY`, sem erro de alias.
- Domínio: [pet-folha-mensal.vercel.app](https://pet-folha-mensal.vercel.app/), HTTP 200.
- A API não expôs metadados Git; o hash acima identifica a fonte local do snapshot.
- Chromium isolado em 1440 e 390 px: explicação JSON/PDF visível, navegador novo
  sem exemplos, criação de perfil, troca real de tema, mês pelo teclado e nenhum
  erro de página. Contraste computado das opções: 14,09:1 no escuro e 14,19:1 no
  claro. [Medições agregadas](producao.json), sem dados pessoais.

O Git remoto permanece aguardando push humano, conforme a regra do repositório.
