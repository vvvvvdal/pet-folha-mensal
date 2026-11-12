# Proposta de nova interface (novembro de 2026)

Estado: **proposta para revisão do mantenedor**. Nada aqui foi implementado.
O desenho está no canvas [PET Folha — nova interface](https://claude.ai/artifact/CXGXM1hxx3j9TKDYCKszRb)
(privado; abra com a conta do mantenedor). Este arquivo diz ao Codex como levar
o desenho ao código. O [guia de design](ui-design.md) continua valendo até a
proposta ser aprovada.

## O que o canvas contém

| Quadro | Tela | Componente atual afetado |
| --- | --- | --- |
| Entrada (LP) | Hero com prévia do produto, três passos, JSON/PDF, dúvidas | `LandingPage.tsx`, `Help.tsx`, `SiteFooter.tsx` |
| Onboarding 1–3 | Boas-vindas, como funciona, identificação | novo `Onboarding.tsx`; substitui a aba "Primeiro acesso" |
| Aplicação · celular | Resumo do mês por semana, lista, ação fixa, barra inferior (Frequência, Minha folha, Comprovantes); o avatar abre a Conta | `Navbar.tsx`, `StatsGrid.tsx`, `ActivityTable.tsx` |
| Janela · nova atividade | Folha inferior com modelos, horários e cálculo PET | `ActivityForm.tsx`, `Modal.tsx` |
| Avisos e novidades | Pendências locais, novidades e aviso de confirmação | `ReleaseNotes.tsx`, `FeedbackModal.tsx`, novo `Toast` |
| Menu de perfil | Menu que abre de um botão de perfil no computador: Meu perfil, Minhas folhas, Tema, Ajuda e suporte, Sair | `Navbar.tsx`, `ProfileModal.tsx`, novo `ProfileMenu.tsx` |
| Perfil · celular | Tela Conta com os mesmos itens, aberta pelo avatar | novo `AccountScreen.tsx` |
| Aplicação · computador | Menu lateral, resumo com alternância Mensal / Semanal, lista e formulário lado a lado | `page.tsx`, `Navbar.tsx`, `StatsGrid.tsx` |
| Janela · concluir o mês | Lista de etapas com a etapa atual destacada | `ExitModal.tsx`, `ActivityReportModal.tsx` |

## Ajustes do mantenedor no canvas (12/11/2026)

Feitos diretamente no canvas depois da primeira versão. Valem sobre o restante
deste documento quando houver conflito.

1. **Resumo de horas (computador)**: alternância com **Mensal** primeiro e
   selecionado por padrão; **Semanal** mostra as quatro semanas.
2. **Cor das barras**: todas as barras usam o verde `--primary`, inclusive
   semanas abaixo de 8 h. O estado "falta" fica no texto ("6 de 8 h") e na
   etiqueta "faltam 11 h", que continua âmbar.
3. **Barra inferior do celular**: passou a ser **Frequência · Minha folha ·
   Comprovantes**. "Fechar o mês" saiu da barra; no celular, a conclusão fica no
   botão da folha (decidir onde, ver abaixo).
4. **Menu de perfil (computador)**: botão no rodapé do menu lateral com avatar
   (iniciais sobre `--primary`), nome e "Estudante · GAT 2", seta para cima.
   Abre um menu de 296 px acima dele, com cabeçalho (avatar, nome, e-mail),
   **Meu perfil**, **Minhas folhas**, seletor de **Tema** (Claro, Escuro,
   Sistema), **Ajuda e suporte** e **Sair**, separados por linhas.
5. **Conta (celular)**: o avatar do topo leva a uma tela "Conta" com cartão de
   identificação, duas listas (Meu perfil, Minhas folhas; Ajuda e suporte),
   o mesmo seletor de tema em fundo `--raised` e **Sair** como botão largo no fim.

### Como implementar os itens novos

| Peça | Como fazer |
| --- | --- |
| Botão e menu de perfil | `<button aria-haspopup="menu" aria-expanded>` no fim do `<aside>`; menu com `role="menu"` e itens `role="menuitem"`, setas para navegar, Escape fecha e devolve o foco. Pode usar o atributo `popover` nativo com posicionamento por CSS; sem biblioteca. Itens com 44 px de altura, raio 10, ícones `User`, `FileText`, `CircleHelp`, `LogOut` do `lucide-react` (18 px). |
| Seletor de tema | Três botões com `aria-pressed` em grade de três colunas, 56 px de altura, ícone em cima e rótulo embaixo (`Sun`, `Moon`, `Monitor`). Ativo: fundo `--primary-soft` (menu) ou branco com sombra (Conta), texto `--primary` em peso 700. |
| Tema "Sistema" | `src/lib/theme.ts` hoje só tem `"dark" \| "light"`. Acrescentar `"system"`, guardar a escolha em `pet_theme` e resolver com `matchMedia("(prefers-color-scheme: dark)")`, ouvindo a mudança. |
| Tela Conta | Rota ou painel de tela cheia no celular, com voltar no topo; listas em cartões brancos de raio 20, linhas de 52 px com seta `ChevronRight`. Reaproveitar o seletor de tema acima. |
| Avatar | Iniciais do `UserProfile.name` em círculo `--primary` com texto branco (40–56 px). Sem foto. |
| Alternância Mensal / Semanal | `SegmentedControl` existente; padrão Mensal; guardar a escolha no `localStorage`. |

### Pontos a decidir antes de implementar

- **E-mail no menu**: `UserProfile` tem `email` opcional, mas o onboarding não
  pede e-mail. Mostrar só quando existir, ou trocar pela linha "Estudante · GAT 2".
  O exemplo do canvas usa `@aluno.ufu.br`; a instituição é a UFG.
- **"Sair"** num app sem conta: propor que signifique "Trocar de perfil" (volta
  à entrada sem apagar dados), com aviso de salvar a cópia se houver mudanças
  não salvas, reaproveitando `ExitModal.tsx`.
- **"Minhas folhas"**: lista de meses do perfil (abrir mês anterior). Hoje a
  troca de mês fica no seletor do cabeçalho; decidir se os dois convivem.
- **Fechar o mês no celular**: sem item na barra, definir onde fica o botão
  (topo da aba Minha folha é a sugestão).
- **Entrada (LP)**: há um parágrafo solto "9o que" no fim do quadro, que parece
  digitação acidental; não levar para o código.

## Referências usadas

Lidas em 11/11/2026 pela página pública do X. Texto do post e imagem foram
vistos; vídeo, site e código dos autores não foram inspecionados.

| Fonte | O que se aproveita |
| --- | --- |
| [Magdiel, regra dos 8 pontos](https://x.com/magdiel_rb/status/2120593918056108341) | Escala de espaço, alturas de controle, variantes de card, anatomia de janela e tokens. É a base desta proposta. |
| [Felix, onboarding do Mudajá](https://x.com/ryanfelixbr/status/2120570511294095691) | Três telas: cartão ilustrado com dado real, título grande, lista de passos, pontos de progresso, botão largo, "Pular". |
| [rico, Getting Started](https://x.com/_heyrico/status/2120268783168504039) | Lista "Fechar o mês" com anel de progresso e contagem de etapas. |
| [Yasir, antes e depois](https://x.com/yasirahmadnoori/status/2120580349189320801) | Menu lateral em grupos, cartões com borda fina e número grande. |
| [Zahra, dashboard](https://x.com/zahragr8r/status/2120374323462697112) | Cartão de métrica com barras de progresso por item (aqui: horas por semana). |
| [Kishor](https://x.com/kxshor/status/2120520484676939933) | Painel lateral de formulário com cabeçalho, corpo e ações fixas. |
| [Milon](https://x.com/milonspace/status/2120394427802034400), [Aryan](https://x.com/aryanxjs/status/2120262009900220783) | Densidade e agrupamento do menu; não se aproveitam gráficos decorativos. |

Não lidos (o X pediu login): desdivj, nizamdesign e sterlynavneet. Se forem
importantes, o mantenedor pode enviar as imagens.

## Decisões tomadas no desenho (do autor da proposta)

- Manter a identidade do PET: mesmas cores de `globals.css` e as mesmas fontes
  (Plus Jakarta Sans nos títulos, Inter no texto). Nenhuma fonte nova.
- Mostrar o tema claro no canvas. O escuro usa os mesmos componentes com os
  tokens escuros já existentes.
- Avisos são locais, calculados no navegador. Não há push nem servidor.
- Linguagem para quem não é de tecnologia: "cópia", "folha", "aviso". As
  extensões `.json` e `.pdf` aparecem só como etiqueta.

## Decisões em aberto (do mantenedor)

1. Tema inicial: com a opção "Sistema" no canvas, sugerimos seguir o sistema por
   padrão; confirmar.
2. Barra inferior no celular (Frequência, Minha folha, Comprovantes) no lugar
   das abas do cabeçalho? A ordem dos itens foi definida no canvas.
3. O onboarding de três telas aparece só no primeiro acesso do navegador, com
   "Pular"?
4. O sino passa a reunir pendências e novidades, ou continua só com novidades?

## Tokens a criar em `src/app/globals.css`

Hoje o CSS usa valores soltos: 20px (29 vezes), 10px (25), 6px (14), 14px, 18px,
28px; e onze raios diferentes (5 a 18px). A proposta fixa as escalas.

```css
:root {
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 40px; --space-8: 48px;
  --space-9: 64px; --space-10: 80px;
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
  --radius-xl: 24px; --radius-2xl: 32px; --radius-pill: 999px;
  --control-sm: 44px; --control-md: 48px; --control-lg: 56px;
  --shadow-card: 0 1px 2px #173b240d, 0 12px 32px #173b2414;
  --shadow-float: 0 8px 24px #173b241a;
  --shadow-dialog: 0 24px 64px #173b2447;
}
```

Regras de uso:

- Espaço: 8 entre título e descrição, 16 entre campos, 24 entre grupos e como
  padding de card, 32 como padding de janela, 80 entre seções da entrada.
- Card compacto 16, padrão 24, destaque 32.
- Controles: 44 no computador (mínimo já exigido), 48 em formulário, 56 no
  celular e na ação principal.
- Raio: campo e botão 12–16, card 24, moldura ilustrada 32, etiqueta 999.
- Título: peso 800, `letter-spacing: -0.03em`, `line-height` 1.05–1.1.
- Tipos: 12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 36, 48, 56. Texto de leitura
  nunca abaixo de 14.
- Tons suaves novos por tema: `--primary-soft`, `--info-soft`, `--warning-soft`
  (claro: `#e6f3ec`, `#e3f1f6`, `#fbf1dc`; no escuro, derivar com
  `color-mix(in srgb, var(--primary) 18%, var(--surface))` e conferir contraste).

## Componentes: o que criar e de onde vem

Nenhuma dependência nova é obrigatória. O projeto já tem `lucide-react`,
`<dialog>` nativo em `Modal.tsx` e as adaptações de coss ui em
`src/components/ui/access-controls.tsx`.

| Peça | Como fazer | Fonte |
| --- | --- | --- |
| Folha inferior (celular) | Variante de `Modal.tsx`: `<dialog>` ancorado embaixo, raio 32 no topo, cabeçalho e ações fixos, corpo com rolagem. Entrada com `translateY` de 200 ms. | Local. Alternativa com gesto de arrastar: [vaul](https://github.com/emilkowalski/vaul) (`npm i vaul`); conferir suporte a React 19 antes. |
| Aviso de confirmação (toast) | `Toast.tsx` com `role="status"`, fila de um item, botão "Desfazer", some em 5 s, pausa com foco. | Local. Alternativa: [sonner](https://sonner.emilkowal.ski) (`npm i sonner`). |
| Anel de progresso | SVG com dois `<circle>`; `stroke-dasharray = fração × 2πr`, `stroke-linecap: round`, `rotate(-90)`. | Local, ver quadro "Aplicação · computador". |
| Alternância Mensal / Semanal | Dois botões com `aria-pressed` acima das barras: "Mensal" (padrão) mostra uma barra única de 21 de 32 h, "Semanal" as quatro semanas. Guardar a escolha no `localStorage`. | `SegmentedControl` existente. |
| Barras por semana | `div` com `role="progressbar"`; reaproveitar `.progress-track` de `StatsGrid.tsx`. Preenchimento sempre verde, com o texto "6 de 8 h". | Local. |
| Lista de etapas | `<ol>` com estado feito, atual e pendente; a etapa atual abre a ação. | Anatomia de Stepper em [coss ui](https://coss.com/ui); registrar em `THIRD-PARTY-UI.md` se copiar código. |
| Seleção por etiquetas (função, modelo) | `SegmentedControl` existente com quebra de linha e `aria-pressed`. | Local. |
| Pontos do onboarding | Três `span`; o ativo tem 24 × 6, os demais 6 × 6; `role="img"` com "Passo 1 de 3". | Local. |
| Cartão ilustrado do hero | HTML e CSS: gradiente `--primary-soft` → `--info-soft`, dois cartões brancos com sombra e dados do próprio produto. Sem imagem nem biblioteca. | Local. |
| Ícones | `lucide-react`, 20 px em controles e 16 px em texto: `Clock`, `FileText`, `Paperclip`, `Bell`, `Download`, `ArrowRight`, `ChevronLeft`, `Plus`, `Check`, `CalendarDays`, `Lock`, `Pencil`. | Já instalado. |
| Fontes | Mesmas famílias. Trocar o `@import` do Google Fonts por `next/font/google` em `layout.tsx`. | Ler antes `node_modules/next/dist/docs/` (regra do `AGENTS.md`). |

## Ordem sugerida de implementação

1. **Tokens**: adicionar as escalas e trocar os valores soltos de `globals.css`
   por elas, sem mudar o layout. Conferir com `npm run test:ui` e capturas.
2. **Entrada**: hero com cartão ilustrado e os três passos; manter o `Frame`
   de acesso logo abaixo do hero para quem já tem perfil.
3. **Onboarding**: três telas no primeiro acesso, guardando "já visto" no
   `localStorage`; a terceira reaproveita `onCreateProfile`.
4. **Resumo por semana**: função pura em `pet-calculator.ts` que agrupa horas
   por semana do mês, com teste; depois o cartão novo em `StatsGrid.tsx`.
5. **Janelas**: folha inferior, cálculo PET em destaque, modelos como etiquetas.
6. **Fechar o mês**: lista de etapas no menu lateral e na janela de conclusão.
7. **Avisos**: regras locais (prazo, semana sem horas, cópia pendente) e toast.
8. **Perfil e tema**: menu de perfil no computador, tela Conta no celular e o
   tema "Sistema" em `theme.ts`.

Cada passo é uma entrega própria, com os gates do projeto (`typecheck`, `lint`,
`test:ui`, `build`, `test:e2e`) e conferência em 360, 390, 768 e 1440 px, nos
dois temas, com teclado e movimento reduzido. A folha oficial impressa não muda.

## Limites desta proposta

- O canvas é um desenho estático com dados de exemplo; não foi testado com
  pessoas do PET nem em aparelho físico.
- As bibliotecas alternativas (vaul, sonner) não foram instaladas nem testadas
  neste projeto.
- Contraste do tema escuro com os novos tons suaves ainda precisa ser medido.
