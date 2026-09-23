# PET Folha Mensal: Gestão de Frequência (PET-Saúde Clima UFG)

Aplicação web moderna desenvolvida para bolsistas, orientadores de serviço, preceptores e tutores do **PET-Saúde Clima: SMS Goiânia, SES Goiás e UFG** (13ª Edição do PET-Saúde, Edital SGTES/MS nº 23/2026).

Permite que os participantes de todos os 5 GATs registrem suas atividades, monitorem a meta de 8h semanais e emitam sua folha mensal de frequência em formato oficial **A4 Paisagem**, rigorosamente idêntico ao modelo exigido pelo Ministério da Saúde.

---

## 🌟 Funcionalidades Principais

1. **Acesso Simples e Sem Burocracia**:
   * Seleção rápida de perfil ou cadastro imediato com Nome, GAT (01 a 05) e Função no SUS.
   * Suporte multiusuário no mesmo dispositivo sem necessidade de senhas complexas.
2. **Cálculo Automático pela Regra do PET**:
   * Cada hora do relógio iniciada conta como 1 hora cheia (`CEILING(Saída) - FLOOR(Chegada)`).
   * Ex: 14:00 às 15:30 = 2 horas; 13:30 às 17:30 = 5 horas; 19:00 às 20:40 = 2 horas.
3. **Lançamento Ágil de Atividades**:
   * Botões de preenchimento rápido: `[👥 Reunião do GAT 04]` e `[🏛️ Reunião geral do PET]`.
   * Seletor de modalidade: `Síncrona virtual`, `Síncrona presencial` e `Assíncrona virtual`.
   * Edição completa (`✏️`) e exclusão (`🗑️`).
4. **Folha Oficial em PDF (A4 Paisagem)**:
   * Cabeçalho tríplice do Ministério da Saúde com logo colorida do PET-Saúde Clima e instituições parceiras (SMS Goiânia, SES Goiás, UFG).
   * Pré-visualização na tela e impressão nativa (`window.print()` / `@media print`) em 1 página horizontal.
   * Banner de alerta automático para baixar o PDF atualizado sempre que houver alterações.
5. **Ergonomia Visual Anti-Fadiga**:
   * Modos **Gentle Dark** (base em ardósia repousante), **Sépia / Papel** e **Claro Suave**, baseados na skill `frontend-design-ultimate`.

---

## 🚀 Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Acessar no navegador
# http://localhost:3000
```

---

## 🌐 Deploy na Vercel

A aplicação é nativa do **Next.js 15 (App Router)** e foi projetada para deploy com zero configuração na [Vercel](https://vercel.com):

1. Conecte o repositório `vvvvvdal/pet-folha-mensal` na Vercel.
2. Mantenha os padrões de build detectados automaticamente:
   * **Framework Preset**: Next.js
   * **Build Command**: `next build`
   * **Output Directory**: `.next`
3. Clique em **Deploy**.

Consulte [docs/deployment-vercel.md](docs/deployment-vercel.md) para detalhes adicionais.

---

## 📚 Documentação do Projeto

* 📋 [AGENTS.md](AGENTS.md) — Contrato de execução para agentes de inteligência artificial.
* 🏛️ [docs/regimento-pet.md](docs/regimento-pet.md) — Regras normativas, cálculo de horas e validação de bolsas.
* 🏗️ [docs/architecture.md](docs/architecture.md) — Arquitetura de software e modelo de dados.
* ☁️ [docs/deployment-vercel.md](docs/deployment-vercel.md) — Guia de deploy na Vercel.
* 📝 [TASKS.md](TASKS.md) — Backlog de tarefas e melhorias.

---

## 🏛️ Instituições Envolvidas

* **SMS Goiânia** (Coordenação Geral)
* **SES Goiás**
* **Universidade Federal de Goiás (UFG)** — Campus Goiânia
* **Ministério da Saúde (SGTES/MS)**
