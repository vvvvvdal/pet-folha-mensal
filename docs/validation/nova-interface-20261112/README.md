# Nova interface — validação local de 12/11/2026

Referência: HTML fornecido pelo mantenedor e decisões registradas em
[ui-nova-interface.md](../../ui-nova-interface.md). Branch
`codex/fluxo-agentes-simples`, sobre `2c61eb9`.

## Resultado

Entrada com prévia ilustrativa e onboarding; navegação Frequência/Folha/Comprovantes;
formulário ao lado da lista no computador e folha inferior no celular; perfil/Conta;
temas Claro/Escuro/Sistema (inicial claro); resumo mensal/semanal; novidades no sino;
lembretes locais e toast com Desfazer da última inclusão/edição intacta.

Restaurar cópia e Salvar cópia ficam juntos no cabeçalho do computador. No celular,
Cópia abre um menu com as duas ações e explicações. A cópia é uma ação cotidiana;
Sair preserva os dados e avisa sobre alterações sem cópia. Não há Fechar o mês.

## Verificações

- Node 22.23.2; `npm run test:ui`: 25/25.
- `npm run typecheck` e tipagem do build: aprovados.
- `npm run build`: aprovado após o menu de cópias.
- `npm run lint -- --ignore-pattern 'test-results/**' --ignore-pattern 'playwright-report/**'`:
  zero erros e três avisos preexistentes em scripts/legacy-tools/apps_script_google_sheets.js.
  A exclusão temporária evita disputa com os artefatos do Playwright durante a execução.
- Regressão `frequency.spec.ts`: os 32 casos anteriores passaram entre a execução
  integral (27/32) e repetições focadas após correções de tipografia e estabilização
  do servidor. Os primeiros testes sofreram recargas durante a implementação e
  limpeza concorrente de traces; os casos afetados foram repetidos, sem remover
  as verificações de cópia, restauração, impressão e comprovantes.
- `redesign.spec.ts`: 16/16 em uma execução final isolada. Onboarding e Pular;
  tema claro inicial mesmo com aparelho escuro; Sistema e persistência; Conta;
  Minhas folhas e cancelamento do descarte de rascunho no próprio mês;
  resumo semanal com dia 30; sino com teclado, Escape e foco; Desfazer,
  expiração e invalidação; lembretes locais.
- Após o ajuste final de cópias, oito casos afetados passaram (sete juntos e
  um em repetição isolada): botões adjacentes no desktop, menu móvel com Escape/foco,
  download e abertura do seletor real de restauração, incluindo os originais dos
  comprovantes. Foram acrescentados dois casos à regressão (34 no total).
- Reflow com nome/descrição longos em 360, 390, 768 e 1440 px, claro/escuro e
  movimento reduzido. Capturas locais inspecionadas; sem dados pessoais reais.

## Capturas

- [Computador](computador.png)
- [Celular](celular.png)
- [Menu de cópia no celular](menu-copia-celular.png)
- [Novidades](novidades.png)
- [Conta no tema escuro](conta-escura.png)

## Limites

Validação em Chromium desktop e celular emulado. Ainda cabe homologação em
smartphone físico, zoom real de 200% e impressão física. A abertura da impressão
não comprova assinatura ou envio do documento. Nenhum Forms real foi enviado.
Esta validação corresponde à implementação local.
