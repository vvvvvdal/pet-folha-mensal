# Interface e experiência de uso

Refinamento de 31/10/2026. Toda a interface permanece em PT-BR.

## Organização

A entrada apresenta identificação do projeto e acesso por criação ou restauração antes das explicações. A prévia abaixo do acesso é somente visual, com dados fictícios locais ao componente: não consulta perfis, não grava atividades e não simula controles.

O painel mantém a sequência identificação e mês → resumo → formulário → lançamentos. As ações “Salvar cópia” e “Restaurar cópia” aparecem em todos os tamanhos de tela. Exclusão e limpeza do mês continuam com confirmação.

O tema escuro usa cinza e grafite, sem superfícies esverdeadas. Foram removidos slogans, blocos promocionais, textos repetidos e a exibição da licença no rodapé. O FAQ possui seis assuntos e é reutilizado no diálogo de ajuda do painel. O rodapé é compartilhado, com créditos e links essenciais. O canal de avaliação existente e os créditos foram preservados.

## Componentes e estilos

- As cores da interface usam tokens semânticos de fundo, superfície, texto, borda, destaque, informação, aviso e erro. O tema claro não depende mais de sobrescritas globais com `!important`.
- Inter é usada no conteúdo; Plus Jakarta Sans nos títulos. Os títulos do documento oficial preservam a fonte do próprio documento.
- `Modal` usa o elemento nativo `dialog`. A contenção do foco e o comportamento de diálogos sobrepostos ficam a cargo do navegador; Escape atualiza o estado React e o fechamento restaura o foco. Os painéis têm altura limitada e rolagem interna.
- Campos têm rótulos associados; a modalidade usa `fieldset` e `legend`, com estado selecionado anunciado.
- `useTheme` usa `useSyncExternalStore` para manter os componentes sincronizados. A preferência continua usando a chave `pet_theme`, com compatibilidade com o parâmetro `theme` da URL.
- Animações são discretas e respeitam `prefers-reduced-motion`.

## Compatibilidade

Não foram alterados o armazenamento, os tipos de perfis e atividades, o formato dos arquivos de cópia, o cálculo de horas ou as rotas de autenticação administrativa. Não há novas dependências de produção.

O componente `OfficialSheet` permanece inalterado. As regras de impressão existentes foram preservadas; a interface, a ajuda e o rodapé são excluídos da impressão.

## Verificação

```text
npm run test:ui
npx tsc --noEmit
npm run lint
npm run build
```

A suíte `test:ui` executa os módulos reais com armazenamento isolado em memória e renderização estática de React, sem abrir navegador nem acessar dados do usuário. Cobre cálculo, criação de perfil, persistência, edição/exclusão por mês, isolamento de participante, exportação/restauração, arquivo inválido, prévia sem acesso a armazenamento, FAQ, campos e estrutura do documento oficial.

Nesta entrega, a abertura de `http://localhost:5000` no navegador de verificação foi recusada pela permissão de acesso. Portanto, os testes acima não substituem a revisão visual em 360, 768 e 1440 pixels nos dois temas, os testes reais de teclado/foco e a impressão efetiva em uma página A4 paisagem. Esses itens continuam pendentes. Nenhuma publicação em produção foi realizada.

