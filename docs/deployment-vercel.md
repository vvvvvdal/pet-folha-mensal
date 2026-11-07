# Guia de Deploy na Vercel: PET Folha Mensal

Este guia orienta o processo de deploy, configuração de ambiente e observabilidade da aplicação na [Vercel](https://vercel.com).

---

## 1. Deploy Automático via GitHub (Recomendado)

Publicação atual de 07/11/2026, commit de origem 8851819, deployment
dpl_ER9SWok9fAohEaSHmFBTgzuTnFgM em produção, estado READY.
As explicações sobre impressão e formulário no histórico foram simplificadas e
conferidas no navegador em produção. As verificações funcionais abaixo se referem
à implementação de origem 3c08cfd, preservada neste ajuste textual.
Domínio principal conferido em contexto isolado do navegador, com Novidades,
preparo por atividade, geração do link e confirmação manual preservada após
recarregar. O pré-preenchimento da primeira etapa foi verificado separadamente
no Forms real, sem envio de resposta. A confirmação de envio permanece manual.

Build, tipagem, lint e 22 testes locais aprovados. Os 24 cenários de navegador
pertinentes passaram em desktop e celular simulado. O teste legado do seletor
de mês foi separado desta rodada, conforme a limitação já documentada.
O lint conserva três avisos dos scripts legados.

Publicação de 07/11/2026, commit de origem 55c3654, deployment
dpl_3VZWgMEXd3V1mCE27ZcCS7TBQi5w em produção, estado READY.
Domínio principal conferido no navegador. PDF gerado em produção com 40 registros
distribuídos em quatro páginas, todos os registros presentes e assinaturas
somente na última página da frequência. Lembrete do formulário visível.
Build, tipagem, lint e 20 testes locais aprovados. Oito testes de navegador
pertinentes passaram em desktop e celular simulado, incluindo comprovantes,
restauração e paginação. O lint conserva três avisos dos scripts legados.

Publicação de 02/11/2026: versão `d309198`, enviada diretamente pela API
conectada, deployment `dpl_DE2axZd65McaV146xzdYUKp3wcmf`, estado READY. Domínio
principal e percurso de retomada sem JSON conferidos. O build usou Node 22,
conforme `package.json`. [Evidência e limites](validation/ui-ux-20261102/README.md#publicação-em-produção--02112026).
O merge foi realizado na main local; o push e o primeiro CI remoto continuam
sob responsabilidade do mantenedor.

O projeto está configurado para integração contínua (CI/CD) direta com a branch `main`:

1. Acesse o painel da Vercel: [vercel.com/new](https://vercel.com/new).
2. Selecione sua conta do GitHub e importe o repositório `vvvvvdal/pet-folha-mensal`.
3. Na tela de configuração do projeto:
   * **Framework Preset**: `Next.js` (detectado automaticamente).
   * **Root Directory**: `./` (padrão).
   * **Build Command**: `next build`
   * **Output Directory**: `.next`
4. Em **Environment Variables**, configure o bloqueio do painel:
   * `ADMIN_PIN_HASH`: hash SHA-256 de uma frase longa de acesso (`printf %s 'SUA_FRASE' | sha256sum`).
   * `ADMIN_SESSION_SECRET`: segredo aleatório de sessão (`openssl rand -hex 32`).
   * Não use o prefixo `NEXT_PUBLIC_`: ele incluiria o valor no bundle entregue ao navegador.
5. Clique em **Deploy**.
6. A cada novo `git push origin main`, a Vercel executará o build Turbopack e atualizará a aplicação em produção automaticamente em `https://pet-folha-mensal.vercel.app`.

---

## 2. Deploy via Vercel CLI (Opcional)

Caso prefira gerenciar o deploy pelo terminal local:

```bash
# 1. Executar link e preview na Vercel
npx vercel

# 2. Promover diretamente para produção
npx vercel --prod
```

---

## 3. Variáveis de Ambiente

A aplicação opera no modelo **Local-First** e inicia sem variáveis de ambiente. O painel de configurações falha fechado e permanece indisponível até que as duas variáveis abaixo sejam configuradas.

| Variável | Obrigatória? | Descrição |
|---|---|---|
| `ADMIN_PIN_HASH` | Para o painel | Hash SHA-256 da frase de acesso. Sem fallback. Lido apenas no servidor. |
| `ADMIN_SESSION_SECRET` | Para o painel | Segredo aleatório com no mínimo 32 caracteres usado para assinar a sessão de 8 horas. |

Essas variáveis protegem o acesso casual à interface. Como perfis, atividades e configurações permanecem no `localStorage`, elas não conferem autoridade institucional aos dados gerados no navegador.

---

## 4. Telemetria e Analytics

A aplicação possui integração nativa com o **Vercel Analytics** (`@vercel/analytics`):
- O componente `<Analytics />` está montado em `src/app/layout.tsx`.
- Para visualizar as métricas de tráfego, visitantes únicos e dispositivos no painel da Vercel:
  1. Acesse seu projeto no dashboard da Vercel.
  2. Vá na aba **Analytics**.
  3. Clique em **Enable Analytics**.
- O rastreamento é 100% livre de cookies e atende plenamente aos requisitos de conformidade da LGPD.

---

## 5. Impressão e PDF no Edge

A renderização da folha oficial opera inteiramente no cliente via CSS `@media print` (`A4 landscape`):
- Não consome tempo de execução de Serverless Functions ou Edge Middleware.
- Não requer navegadores headless (Puppeteer/Playwright) rodando no servidor.
- Gera PDFs instantâneos e nítidos em qualquer navegador moderno (Chrome, Safari, Firefox e Edge).
