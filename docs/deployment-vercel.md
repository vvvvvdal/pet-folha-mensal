# Guia de Deploy na Vercel: PET Folha Mensal

Este guia orienta o processo de deploy, configuração de ambiente e observabilidade da aplicação na [Vercel](https://vercel.com).

---

## 1. Deploy Automático via GitHub (Recomendado)

Publicação atual de 12/11/2026, origem `e8d0435`, deployment
`dpl_DDS8Xqox85gQ5fhaa1u6Db5WPHhX`, produção READY. Removida somente a
etiqueta Folha de frequência mensal do hero da entrada. Lint direcionado e
build remoto aprovados. Domínio principal conferido com HTTP 200, título
preservado e etiqueta ausente.

Publicação de 12/11/2026, commit de origem `d838926`, deployment
`dpl_2EbBmde1QPpctxRuwqGsG8s4GZ4y`, produção, estado READY. O conteúdo exato
do commit foi enviado pela API conectada, com Next.js e Node 22. Build remoto
concluído em cerca de 21 segundos. Domínio principal:
https://pet-folha-mensal.vercel.app.

No domínio publicado foram conferidos os rótulos Tema e Configurações, sidebar
de 304 px, ausência do nome duplicado e de Lembretes da folha, seletor Modelo,
prévia real de PNG e da primeira página de PDF, conferência antes de gravar e
salvamento dos dois arquivos com atividades. No celular emulado de 390 px, a
cópia 1.3 foi baixada e restaurada pelo menu Cópia, com dois originais, vínculos
e atividade de 5 h conferidos. HTTP 200 e nenhum erro de página no contexto
isolado. Consulta de logs error/fatal deste deployment nos últimos dez minutos
sem registros. Nenhum drain externo configurado.
[Registro e limites](validation/comprovantes-deslop-20261112/README.md#publicação-em-produção).

Publicação de 12/11/2026, commit de origem `4ea40af`, deployment
`dpl_35cfSEy4xJceigtxW2Nf1xrspGhz`, produção, estado READY. O conteúdo do commit
foi enviado pela API conectada, com Next.js e Node 22, sem push no GitHub.
Build remoto concluído em cerca de 28 segundos. Domínio principal:
https://pet-folha-mensal.vercel.app.

No domínio publicado, Chromium em contexto isolado conferiu entrada/onboarding,
tema claro inicial mesmo com preferência escura do aparelho, botões de cópia
adjacentes no computador e menu Cópia em 390 px. Uma atividade sintética de
13:30–17:30 produziu 5 h; a cópia 1.3 foi baixada e restaurada pelo menu móvel,
com registros e horas conferidos. O sino abriu/fechou por Escape com retorno de
foco. Sem erros de página nessa conferência. O download padrão foi exercitado
com o seletor nativo de salvamento desabilitado no contexto de teste.
A consulta de logs dos últimos dez minutos, filtrada por este deployment e
níveis error/fatal, não retornou registros; o projeto não possui drains externos.
[Captura e limites](validation/nova-interface-20261112/README.md#publicação-em-produção).

Publicação de 10/11/2026, commit de origem `1e8e5fc`, deployment
`dpl_531fHyMV7Hjy5MTiNgjUW8vJQuP2` em produção, estado READY.
A composição escolhida mantém o formulário ao lado da lista no desktop e abre
a inclusão em janela no celular. As janelas de edição e Forms usam ações fixas.
A opção **Receber cópia por e-mail** foi removida do preparo e o link não emite
mais `emailReceipt`. A mudança está nas novidades da aplicação.
No domínio principal, foram conferidos o detalhe do evento, a ausência da opção
e do parâmetro, a composição desktop e a preservação do rascunho em 390 px no
Chromium emulado. Não houve envio de resposta ao Google Forms.
Passaram 24 testes locais e 32 testes de navegador em desktop e celular emulado,
build, tipagem e lint com três avisos legados.

Publicação de 10/11/2026, commit de origem `bc99b2a`, deployment
`dpl_9QiRrZRa1mz1tqHSF7sLZCSe71Xd` em produção, estado READY.
O detalhe da atividade em eventos passou a ser sugerido, editável e incluído no
link para a seção **Qual foi a atividade?**. A sugestão e o parâmetro do link
foram conferidos no domínio principal em Chromium móvel emulado. A conferência
na página autenticada do Google Forms depende da sessão Google do participante.
Passaram 24 testes locais, quatro testes de Forms e quatro de novidades em
desktop e celular emulado, build, tipagem e lint com três avisos legados.

Publicação de 10/11/2026, commit de origem `dfac167`, deployment
`dpl_6JwzCt4AYbz6R4p5b1YrweUcygHX` em produção, estado READY. O domínio
principal foi conferido em Chromium móvel emulado com dados sintéticos. A nota
de comprovantes aparece na entrada e no sino da folha. O fluxo vinculou um
arquivo à atividade e gerou um PDF com a frequência e uma página de comprovante.
Build, tipagem, lint, 23 testes locais e 30 testes de navegador passaram.
O lint conserva três avisos do script legado.

Publicação de 07/11/2026, commit de origem 8851819, deployment
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

### Login com Google e cópia no Drive

Com as três variáveis abaixo, o login com Google passa a ser obrigatório. Sem elas, o app continua no modo somente local.

| Variável | Descrição |
|---|---|
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth "Aplicativo da Web". |
| `GOOGLE_CLIENT_SECRET` | Segredo desse cliente. Lido apenas no servidor. |
| `GOOGLE_SESSION_SECRET` | Segredo aleatório (≥ 32 bytes, `openssl rand -hex 32`) que criptografa o cookie da sessão. Trocar invalida todas as sessões. |

Passos no Google Cloud Console (feitos pelo mantenedor):

1. Criar um projeto e ativar a **Google Drive API**.
2. Em **Google Auth Platform › Branding**: nome do app (sem usar marcas do Google), e-mail de suporte, página inicial `https://pet-folha-mensal.vercel.app` e política de privacidade `https://pet-folha-mensal.vercel.app/privacidade`.
3. Em **Audience**: tipo **Externo**. Depois dos testes, mudar o status para **In production**. Em **Testing**, só usuários de teste entram e os tokens expiram em 7 dias.
4. Em **Data Access**: escopos `openid`, `email`, `profile` e `https://www.googleapis.com/auth/drive.file` (todos não sensíveis).
5. Em **Clients**: criar cliente **Aplicativo da Web** com URIs de redirecionamento `https://pet-folha-mensal.vercel.app/api/google/callback` e `http://localhost:5013/api/google/callback`.
6. Pôr as três variáveis na Vercel (Production e Preview) e no `.env.local`.
7. Opcional: verificar o domínio no Google Search Console e enviar a marca para verificação, para mostrar nome e logo na tela de consentimento.

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
