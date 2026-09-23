# Gemini: Contrato Local do Repositório pet-folha-mensal

Este arquivo define as regras de execução do Gemini para o repositório **pet-folha-mensal**.

---

## Diretrizes de Atuação

1. **Obediência à Regra de Horas do PET**:
   * Jamais alterar o cálculo de horas para simples subtração decimal.
   * Manter a regra: cada hora ou fração de hora iniciada conta como 1 hora cheia (`CEILING - FLOOR`).
2. **Fidelidade da Folha Oficial em PDF**:
   * O layout de impressão em `@media print` e o componente `OfficialSheet.tsx` devem preservar rigorosamente a orientação **A4 Paisagem**, cabeçalho tríplice do Ministério da Saúde com logo colorida, metadados, tabela com colunas de assinatura, total e notas de rodapé normativas.
3. **Padrões de Interface**:
   * Manter a paleta de conforto óptico (Gentle Dark, Sépia, Soft Light), sem contrastes cegantes, sem neons estridentes.
   * Manter avisos para salvar o PDF sempre que houver adição, edição ou exclusão de atividades.
4. **Deploy e Compatibilidade Vercel**:
   * Garantir que `npm run build` e `npm run lint` passem sem erros de TypeScript ou Next.js.
5. **Comunicação no Chat**:
   * Estilo caveman: direto, técnico, conciso, com links `file://`.
