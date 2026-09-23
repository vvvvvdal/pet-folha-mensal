# PET Folha Mensal: Contrato de Execução para Agentes

Este repositório armazena a aplicação fullstack de gestão e emissão da **Folha de Frequência Mensal do PET-Saúde Clima UFG** (13ª Edição, Edital SGTES/MS nº 23/2026), preparada para deploy na **Vercel**.

---

## 1. Escopo e Diretrizes Fundamentais

* **Princípios Estruturantes**: SUS, Equidade em Saúde, Justiça Climática, Uma Só Saúde (*One Health*).
* **Proponentes**: SMS Goiânia (coordenação), SES Goiás e UFG.
* **Vigência**: 03/08/2026 a 02/08/2028.
* **Comunicação Oficial**: Toda frequência e comunicação institucional deve ser enviada para `petsaudeufg.smsgoiania@gmail.com`.

---

## 2. Regras de Negócio e Cálculo de Carga Horária

1. **Carga Horária Obrigatória**: 8 horas semanais por bolsista (~32 horas mensais). O não cumprimento por dois meses consecutivos acarreta desligamento automático.
2. **Regra Matemática do PET (Hora Relógio)**:
   * Cada hora ou fração de hora iniciada conta como 1 hora cheia.
   * Fórmula canônica: `CEILING(Saída) - FLOOR(Chegada)`.
   * Exemplos:
     * 14:00 às 15:30 = 2 horas (14h-15h + 15h-16h iniciada)
     * 13:30 às 17:30 = 5 horas (13h-14h + 14h-15h + 15h-16h + 16h-17h + 17h-18h iniciada)
     * 19:00 às 20:40 = 2 horas (19h-20h + 20h-21h iniciada)
3. **Prazos e Validação**:
   * Preenchimento do relatório no Google Forms até o final do mês.
   * Envio da Folha assinada até o **1º dia útil do mês subsequente**.

---

## 3. Estrutura Operacional (5 GATs)

* **GAT 1 (Araticum) — Eixo I**: Produção do cuidado e Segurança Alimentar e Nutricional (SAN) na APS.
* **GAT 2 (Buriti) — Eixo I**: Vigilância socioambiental territorial e Rede de Atenção Psicossocial (RAPS).
* **GAT 3 (Ipê-amarelo) — Eixo II**: Assistência especializada e cuidado farmacêutico em eventos extremos.
* **GAT 4 (Mangaba) — Eixo III**: Comunicação acessível (LIBRAS, Braille, audiodescrição) e educação popular.
* **GAT 5 (Pequi) — Eixo III**: Vigilância preditiva baseada em IA e modelagem computacional.

---

## 4. Stack Tecnológica e Padrões de Código

* **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS.
* **Design Ergonomico**: Tokens anti-fadiga visual da skill `frontend-design-ultimate` (Gentle Dark, Sépia, Claro).
* **Deploy**: Vercel (zero-config, build via `npm run build`).
* **Impressão / PDF**: Módulo A4 Paisagem estritamente compatível com o modelo oficial do Ministério da Saúde.

---

## 5. Handoff e Memória Compartilhada

Atualizações de arquitetura ou regras devem sincronizar a documentação canônica em `docs/` e a nota do Obsidian em:
`04 - Contexto Compartilhado/Projeto - PET Saúde Clima UFG.md`.
