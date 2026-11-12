# Proposta de nova interface (novembro de 2026)

Estado: **implementação local em revisão visual — 12/11/2026**.
Referência: HTML “PET Folha — nova interface” fornecido pelo mantenedor; os
rótulos alterados nele prevalecem sobre os exemplos desta proposta. O guia
[ui-design.md](ui-design.md) registra o padrão atual.

## Decisões confirmadas na implementação (12/11/2026)

- Tema inicial claro; Claro, Escuro e Sistema ficam disponíveis no perfil.
- Navegação: **Frequência · Folha · Comprovantes**, lateral no computador e
  inferior no celular. Conta abre pelo avatar no celular.
- Onboarding de três passos só no primeiro acesso do navegador, com Pular;
  o terceiro passo reutiliza a identificação.
- Sino contém apenas novidades; abre e fecha pelo próprio sino, clique fora
  ou Escape. Entrada e aplicação compartilham histórico e marcador de leitura.
- **Salvar cópia** e **Restaurar cópia** ficam lado a lado no computador;
  no celular, o botão **Cópia** reúne as duas ações num menu com explicações. Não há
  ação “Fechar o mês”. Sair leva à entrada e preserva os dados; a janela
  “Antes de sair” oferece cópia e PDF e avisa sobre alterações sem cópia.
- Minhas folhas abre os meses do perfil; o seletor de mês também permanece.
- E-mail aparece no perfil somente quando existe, sem endereço de exemplo.
- Semanas são de segunda a domingo, recortadas nas bordas do mês: podem ser
  quatro, cinco ou seis, sem perder os dias finais. Barras sempre verdes.

Os trechos abaixo preservam a referência original; decisões em aberto e exemplos
conflitantes foram resolvidos pelos itens acima. Lembretes locais ficam em uma seção expansível própria, com prazo institucional,
referência da semana e cópia pendente. O toast oferece Desfazer na última inclusão
ou edição enquanto a transação estiver intacta na mesma tela, perfil e mês.
Não há confirmação automática de envio, assinatura ou gravação de arquivo no aparelho.

## O que o canvas contém

| Quadro | Tela | Componente atual afetado |
| --- | --- | --- |
| Entrada (LP) | Hero com prévia do produto, três passos, JSON/PDF, dúvidas | `LandingPage.tsx`, `Help.tsx`, `SiteFooter.tsx` |
| Onboarding 1–3 | Boas-vindas, como funciona, identificação | novo `Onboarding.tsx`; substitui a aba "Primeiro acesso" |
| Aplicação · celular | Resumo do mês por semana, lista, ação fixa, barra inferior (Frequência, Minha folha, Comprovantes); o avatar abre a Conta | `Navbar.tsx`, `StatsGrid.tsx`, `ActivityTable.tsx` |
| Janela · nova atividade | Folha inferior com modelos, horários e cálculo PET | `ActivityForm.tsx`, `Modal.tsx` |
| Avisos e novidades | Pendências locais, novidades e aviso de confirmação | `ReleaseNotes.tsx`, `FeedbackModal.tsx`, novo `Toast` |
| Novidades · entrada, computador, celular | Painel de atualizações ancorado ao sino, sem ×, que abre e fecha pelo próprio sino | `Navbar.tsx`, `LandingPage.tsx`, `ReleaseNotes.tsx`, novo `NewsPopover.tsx` |
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

## Novidades (atualizações do site)

Quadros **Novidades · entrada**, **Novidades · aplicação no computador** e
**Novidades · celular** (interativos: clique no sino no modo Play).

**Problema atual**: o sino abre `Modal` em `Navbar.tsx` (linha ~131), uma janela
centralizada que tapa a tela e só fecha pelo **×**, por Escape ou pelo fundo.
O mantenedor quer que não haja **×** e que o próprio sino abra e feche.

**Comportamento proposto**

- O sino é um botão alternável: `aria-expanded` e `aria-controls`; o rótulo
  muda de "Novidades" para "Fechar novidades". Aberto, o sino fica destacado
  (fundo `--primary-soft`, borda e ícone `--primary`).
- O painel abre **ancorado ao sino**, com uma setinha apontando para ele, sem
  botão **×**. Fecha por: novo clique no sino, clique fora, Escape. O foco volta
  ao sino. Uma linha no rodapé ensina: "Toque no sino de novo para fechar."
- **Computador e entrada**: caixa de 400 px abaixo do sino, raio 20, sombra
  `--shadow-dialog`, sem escurecer a página. Corpo com rolagem (máx. ~430 px).
- **Celular**: caixa de largura total menos 12 px de cada lado, logo abaixo do
  cabeçalho, com fundo escurecido abaixo do cabeçalho (tocar nele fecha). O
  cabeçalho e o sino continuam visíveis e clicáveis por cima.
- **Conteúdo**: título "Novidades" e "N novas desde a sua última visita".
  Atualizações não vistas aparecem completas com a etiqueta **Nova**; as já
  vistas ficam só com data e título (computador) ou dentro de "Ver
  atualizações anteriores" (celular e entrada). Dados de `src/lib/releases.ts`.
- **Ponto vermelho** no sino quando há atualização não vista; some ao abrir.
  Guardar no `localStorage` a data da última atualização vista (já existe a
  lógica `hasUnreadNews` em `Navbar.tsx`; reaproveitar e contar as novas).
- **Entrada (LP)**: o sino entra no cabeçalho, ao lado de "Continuar minha
  folha", com o mesmo painel. A seção `<ReleaseNotes />` no meio da página sai;
  o link "Novidades" do rodapé abre o mesmo painel.

**Como implementar**

| Peça | Como fazer |
| --- | --- |
| Painel | Atributo HTML `popover="auto"` no painel e `popovertarget` no sino: o navegador já alterna no clique, fecha com Escape e clique fora, sem JavaScript de posição. Ancorar com CSS (`position-anchor`/`anchor()`) onde houver suporte e `position: absolute` dentro de um contêiner `relative` como alternativa. Sem biblioteca. |
| Celular | Mesmo `popover`, com `::backdrop` escurecido e `inset` fixo abaixo do cabeçalho; manter o cabeçalho acima (`z-index`) para o sino continuar tocável. |
| Componente | Novo `NewsPopover.tsx` com `ReleaseNotes` em modo compacto (prop `variant="popover"`); `Navbar.tsx` e `LandingPage.tsx` usam o mesmo. Remover o uso de `Modal` para novidades. |
| Setinha | `span` de 12 × 12 girado 45°, com borda superior e esquerda `--line`. |
| Movimento | Abrir com opacidade e `translateY(-4px)` em 150 ms; nada com `prefers-reduced-motion`. |

Teste: abrir e fechar pelo sino com mouse, toque e teclado (Enter/Espaço),
Escape devolve o foco ao sino, leitor de tela anuncia "expandido/recolhido",
painel não sai da tela em 360 px.

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
9. **Novidades**: painel ancorado ao sino, sem ×, na entrada e na aplicação.

Cada passo é uma entrega própria, com os gates do projeto (`typecheck`, `lint`,
`test:ui`, `build`, `test:e2e`) e conferência em 360, 390, 768 e 1440 px, nos
dois temas, com teclado e movimento reduzido. A folha oficial impressa não muda.

## Limites desta proposta

- O canvas é um desenho estático com dados de exemplo; não foi testado com
  pessoas do PET nem em aparelho físico.
- As bibliotecas alternativas (vaul, sonner) não foram instaladas nem testadas
  neste projeto.
- Contraste do tema escuro com os novos tons suaves ainda precisa ser medido.
