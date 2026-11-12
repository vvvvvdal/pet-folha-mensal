# Melhorias e ideias para o PET Folha (11/11/2026)

Levantamento rápido, feito junto com a [proposta de nova interface](ui-nova-interface.md).
Serve de ponto de partida para o Codex planejar e aprofundar. Cobertura: leitura
de `globals.css`, `LandingPage.tsx`, `StatsGrid.tsx`, `package.json`, `TASKS.md`
e contagens por `grep`. Não houve execução da aplicação nem dos testes.

Itens marcados **[achado]** têm evidência no código. **[ideia]** é sugestão de
produto e depende de decisão do mantenedor.

## Código e manutenção

| # | Item | Evidência | Impacto |
| --- | --- | --- | --- |
| 1 | **[achado]** Espaçamentos e raios sem escala | `globals.css`: 20px em 29 usos, 10px em 25, 6px em 14; onze raios entre 5 e 18px | Inconsistência visual; resolvido pelos tokens da proposta |
| 2 | **[achado]** Dez pontos de quebra diferentes | `globals.css`: 400, 600, 639, 700, 767, 899, 900, 1000, 1100 e 1440px | Comportamento difícil de prever; reduzir para três ou quatro |
| 3 | **[achado]** Arquivos muito grandes | `globals.css` 2.770 linhas, `AdminModal.tsx` 1.304, `page.tsx` 1.039 | Revisão e mudança lentas; dividir por tela ou componente |
| 4 | **[achado]** Fontes por `@import` de CSS | `globals.css`, linha 1 | Bloqueia a renderização e depende de rede; avaliar `next/font` |
| 5 | **[achado]** Meta semanal só em dica de mouse | `StatsGrid.tsx`: referência de 8 h/semana no atributo `title` | Invisível no celular; a regra de desligamento depende dessa conta |
| 6 | **[achado]** Um arquivo de testes de ponta a ponta | `tests/e2e/frequency.spec.ts`, 16 testes | Conferir se cobre restauração, comprovantes e impressão |
| 7 | **[achado]** Sobras do modelo do Next em `public/` | `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Remover se não forem usadas |
| 8 | **[achado]** `AGENTS.md` cita Next.js 15 | `package.json` usa `next` 16.3.6 | Corrigir o contrato para evitar erro de agente |

## Produto

| # | Ideia | Por que ajuda | Custo provável |
| --- | --- | --- | --- |
| 9 | **[ideia]** Horas por semana visíveis | Mostra cedo quem está abaixo de 8 h | Baixo; função pura e cartão |
| 10 | **[ideia]** Instalar como aplicativo (PWA) | Ícone na tela inicial e uso sem internet, público é de celular | Médio; manifesto e service worker |
| 11 | **[ideia]** Lembrete de prazo | Aviso local do 1º dia útil; opção de exportar evento `.ics` | Baixo |
| 12 | **[ideia]** Aviso de cópia pendente | Dados só no navegador; lembrar após N atividades novas | Baixo |
| 13 | **[ideia]** Compartilhar a cópia pelo celular | Web Share API para mandar o `.json` a si mesmo | Baixo; conferir suporte nos navegadores |
| 14 | **[ideia]** Repetir atividade | "Repetir toda terça" ou duplicar a última reunião | Médio |
| 15 | **[ideia]** Botão "Enviar por e-mail" | Abre o e-mail com destinatário oficial e assunto prontos; o anexo continua manual | Baixo |
| 16 | **[ideia]** Visão da tutoria | Importar várias cópias e ver quem está abaixo da meta | Alto; envolve LGPD e decisão da coordenação |
| 17 | **[ideia]** Assinatura digital | Orientar o uso do gov.br no PDF, sem integrar | Baixo (texto de ajuda) |
| 18 | **[ideia]** Teste com usuários reais | Cinco pessoas do PET, no celular delas, antes de aprovar o redesenho | Baixo; já previsto em `TASKS.md` como homologação física |

## Ferramentas parecidas para comparar

Não foram inspecionadas nesta rodada; servem de pauta para a análise do Codex.

- **Ponto eletrônico** (Pontomais, Tangerino, Oitchau): registro por celular,
  lembretes e espelho de ponto mensal.
- **Controle de horas** (Clockify, Toggl Track): cronômetro, resumo semanal e
  relatório em PDF.
- **Fluxo atual do programa**: Google Forms e planilha; o PET Folha já prepara
  o Forms, falta medir quanto retrabalho ainda existe.

## Sugestão de ordem

Primeiro 8, 5 e 9 (baratos e ligados à regra do programa), depois 1 e 2 junto
com os tokens da nova interface, depois 10 a 13. O item 16 só com a coordenação.
