# Guia de Deploy na Vercel: PET Folha Mensal

Este guia orienta o deploy contínuo da aplicação na [Vercel](https://vercel.com).

---

## 1. Deploy Automático via GitHub

1. Acesse o painel da Vercel: [vercel.com/new](https://vercel.com/new).
2. Selecione sua conta do GitHub e importe o repositório `vvvvvdal/pet-folha-mensal`.
3. Na tela de configuração do projeto:
   * **Framework Preset**: `Next.js` (detectado automaticamente).
   * **Root Directory**: `./`
   * **Build Command**: `next build`
   * **Output Directory**: `.next`
4. Clique em **Deploy**.
5. Em menos de 2 minutos a aplicação estará no ar em um domínio `*.vercel.app` com SSL automático.

---

## 2. Deploy via Vercel CLI (Opcional)

Se preferir fazer o deploy diretamente pela linha de comando:

```bash
# 1. Instalar a CLI da Vercel globalmente
npm install -g vercel

# 2. Na raiz do repositório, executar
vercel

# 3. Para atualizar em produção
vercel --prod
```

---

## 3. Variáveis de Ambiente (Opcionais)

A aplicação opera em modo **Local-First**, portanto **não requer variáveis de ambiente obrigatórias** para rodar perfeitamente na Vercel.

Caso queira integrar um banco de dados Supabase no futuro para sincronização multi-dispositivo entre membros da equipe, adicione:

* `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima pública do Supabase.

---

## 4. Otimização de Impressão e PDF na Vercel

O gerador de folha oficial opera nativamente no navegador do cliente através de CSS `@media print` (`A4 landscape`). Isso significa que a geração de PDF:
* Não consome tempo de execução de Serverless Functions.
* Não depende de instâncias de Chrome/Chromium no backend da Vercel.
* Funciona instantaneamente em qualquer dispositivo (desktop, notebook, tablet ou smartphone).
