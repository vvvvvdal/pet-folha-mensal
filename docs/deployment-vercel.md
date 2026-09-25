# Guia de Deploy na Vercel: PET Folha Mensal

Este guia orienta o processo de deploy, configuração de ambiente e observabilidade da aplicação na [Vercel](https://vercel.com).

---

## 1. Deploy Automático via GitHub (Recomendado)

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
