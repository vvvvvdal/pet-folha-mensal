# PET-Saúde Clima: Folha de Frequência Mensal

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/Edital-SGTES%2FMS%20nº%2023%2F2026-008D4C?style=flat" alt="Edital SGTES/MS">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
</p>

---

<p align="center">
  <strong>Aplicação web oficial de gestão de dedicação, acompanhamento de metas e emissão da folha de frequência mensal em formato A4 Paisagem para os bolsistas e participantes do PET-Saúde Clima UFG.</strong>
</p>

<p align="center">
  🌐 <a href="https://pet-folha-mensal.vercel.app" target="_blank"><strong>Acessar Aplicação Online (Vercel)</strong></a> •
  💬 <a href="https://docs.google.com/forms/d/e/1FAIpQLSfIxvavW_gq0xCUb6qx7VKK-I9tYino158tsCrNCO6IZ1Wf-A/viewform" target="_blank"><strong>Avaliação e Sugestões (Forms)</strong></a> •
  📘 <a href="#-documentação-do-projeto"><strong>Documentação Técnica</strong></a>
</p>

---

## 🌿 Sobre o Projeto PET-Saúde Clima

O **PET-Saúde: Clima** (13ª Edição do Programa de Educação pelo Trabalho para a Saúde, regulamentado pelo **Edital SGTES/MS nº 23/2026** e Chamamento Público nº 16/2026) é uma iniciativa interinstitucional e interprofissional que integra a **Secretaria Municipal de Saúde de Goiânia (SMS Goiânia)** como proponente principal, a **Secretaria Estadual de Saúde de Goiás (SES Goiás)** e a **Universidade Federal de Goiás (UFG)**.

O projeto reúne estudantes de graduação, orientadores de serviço, preceptores da rede pública e tutores acadêmicos com foco no fortalecimento do Sistema Único de Saúde (SUS) diante das mudanças climáticas no Cerrado brasileiro.

* **Vigência**: 24 meses (03/08/2026 a 02/08/2028).
* **Coordenação Geral**: SMS Goiânia (Gerência de Planejamento e Projetos da DPP).
* **Canal Oficial**: `petsaudeufg.smsgoiania@gmail.com`.
* **Referenciais Normativos**: **AdaptaSUS** (Plano Clima Adaptação 2025–2035), **Plano de Ação em Saúde de Belém (BHAP)** (COP30), **Programa Brasil Saudável** (Decreto Federal nº 11.908/2024) e **Guia de Bolso de Mudanças Climáticas** (Ministério da Saúde, 2ª ed. 2026).

---

## 🏛️ Estrutura Operacional dos 5 GATs

A atuação territorial e formativa está organizada em 5 Grupos Tutoriais de Aprendizagem (GATs), distribuídos em três eixos estratégicos:

```text
PET-Saúde Clima (SMS Goiânia · SES Goiás · UFG)
│
├── Eixo I: Cuidado no Território e Vigilância Socioambiental
│   ├── GAT 1 (Araticum): Segurança Alimentar e Nutricional (SAN), SISVAN/TRIA, hortas e feiras agroecológicas na APS.
│   └── GAT 2 (Buriti): Vigilância socioambiental territorial, impactos psicossociais e apoio à RAPS.
│
├── Eixo II: Atenção Especializada e Assistência Integral
│   └── GAT 3 (Ipê-amarelo): Cuidado farmacêutico, assistência em eventos extremos e resiliência da cadeia de frio.
│
└── Eixo III: Comunicação, Inovação e Vigilância Preditiva
    ├── GAT 4 (Mangaba): Comunicação inclusiva (LIBRAS, Braille, audiodescrição), educação popular e podcast em saúde.
    └── GAT 5 (Pequi): Vigilância preditiva com inteligência artificial para antecipação de zoonoses e arboviroses.
```

---

## 🎯 Dores Resolvidas e Propósito da Aplicação

Historicamente, o controle mensal de frequência em projetos acadêmicos e do SUS sofre com planilhas manuais quebradas, fórmulas arrastadas de forma incorreta e inconsistências na formatação de impressão. 

O **PET Folha Mensal** foi desenvolvido para solucionar esses problemas de forma definitiva:

1. **Cálculo Matemático Automatizado do PET**:
   Aplica com precisão a regra editalícia do Ministério da Saúde: cada hora iniciada computa uma hora inteira de dedicação:
   $$\text{Horas Computadas} = \lceil \text{Saída} \rceil - \lfloor \text{Chegada} \rfloor$$
   *Exemplos*:
   - 14:00 às 15:30 = **2 horas**
   - 13:30 às 17:30 = **5 horas**
   - 19:00 às 20:40 = **2 horas**
2. **Monitoramento da Meta Semanal e Mensal**:
   Acompanhamento visual em tempo real da meta de **8 horas semanais** (totalizando ~32 horas mensais obrigatórias), sinalizando o status da folha (*Em Preenchimento* ou *Apta para Envio*).
3. **Fidelidade Normativa em PDF Oficial (A4 Paisagem)**:
   Motor de renderização e impressão que produz a Folha Oficial do Ministério da Saúde em exatamente **1 página A4 Paisagem**, contendo o cabeçalho tríplice ministerial, campos de dados cadastrais, tabela de atividades e linhas de assinatura do bolsista e do orientador/coordenador.
4. **Respeito à LGPD e Paradigma Local-First**:
   Todos os dados de lançamentos, nomes e perfis residem exclusivamente no navegador do participante (`localStorage`). Nenhuma informação de presença ou dado sensível transita por servidores externos.

---

## ✨ Recursos da Aplicação

- **Autenticação Multiusuário sem Burocracia**: Seleção rápida de perfil ou cadastro instantâneo por Nome, Função no SUS e GAT (01 a 05).
- **Interface Mobile-First Ergonômica**:
  - Em telas de smartphone (`< 640px`), os lançamentos são exibidos em cards empilhados completos, com toque mínimo de 44x44px (WCAG 2.5.5) e texto legível sem zoom involuntário.
  - Em computadores e tablets (`>= 640px`), apresenta a tabela tabular densa com colunas completas.
- **Modelos Pré-Configurados por GAT**: Preenchimento rápido em um clique de atividades recorrentes (reuniões tutoradas de GAT, reuniões gerais do PET, oficinas formativas e estudos de campo).
- **Painel Administrativo com Hash SHA-256**: Gestão centralizada de perfis, funções e templates, protegida por autenticação criptográfica local (`crypto.subtle`) e sobreposição configurável em produção via `NEXT_PUBLIC_ADMIN_PIN_HASH`.
- **Cópia de Segurança (.json)**: Exportação e importação manual instantânea do banco de dados local para troca de aparelho ou guarda de histórico.
- **Alternador de Temas Anti-Fadiga**: Modos **Gentle Dark** e **Soft Light** com conforto óptico para preenchimento noturno e ícones nativos adaptados.
- **Canal de Avaliação e Feedback**: Acesso direto ao formulário oficial de sugestões, relatos de bugs e avaliação geral da plataforma.
- **Telemetria com Privacidade**: Integração com `@vercel/analytics` sem cookies, respeitando a privacidade dos usuários.

---

## 🛠️ Tecnologias Utilizadas

- **Framework Web**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components)
- **Biblioteca de Interface**: [React 19](https://react.dev/)
- **Estilização e Design System**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Tipagem Estática**: [TypeScript 5](https://www.typescriptlang.org/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Hospedagem e Edge Network**: [Vercel](https://vercel.com/)
- **Telemetria Responsável**: [@vercel/analytics](https://vercel.com/analytics)

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18.18+ (recomendado Node.js 20 ou 22 LTS)
- Gerenciador de pacotes npm

### Passos de Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/vvvvvdal/pet-folha-mensal.git
cd pet-folha-mensal

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev

# 4. Acessar no navegador
# Abra http://localhost:5000
```

---

## 🧪 Gates de Validação e Qualidade

Antes de qualquer entrega ou submissão para deploy, execute os comandos de verificação:

```bash
# Verificação estática de tipos (TypeScript)
npx tsc --noEmit

# Compilação completa para produção com Turbopack
npm run build

# Análise estática de código e boas práticas
npm run lint
```

---

## ☁️ Deploy Contínuo na Vercel

A aplicação está configurada para deploy automático via Git na [Vercel](https://vercel.com):

1. Conecte o repositório `vvvvvdal/pet-folha-mensal`.
2. As opções de build são identificadas nativamente:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
3. **Variáveis de Ambiente (Opcional)**:
   - `NEXT_PUBLIC_ADMIN_PIN_HASH`: Hash SHA-256 da senha de acesso ao painel de administração (se omitido, utiliza o hash padrão configurado no código).

Para mais detalhes, consulte [docs/deployment-vercel.md](docs/deployment-vercel.md).

---

## 📂 Estrutura do Repositório

```text
pet-folha-mensal/
├── docs/                        # Documentação técnica e arquitetural canônica
│   ├── README.md                # Índice consolidado da documentação
│   ├── architecture.md          # Arquitetura de software e contratos de dados
│   ├── deployment-vercel.md     # Guia detalhado de deploy na Vercel
│   ├── regimento-pet.md         # Normas, cálculo de horas e validação de bolsas
│   └── visual-identity/         # Referências de identidade visual oficial
├── public/                      # Imagens oficiais, logos e templates de frequência
│   ├── images/                  # Logotipo colorida e avatar oficial do PET
│   └── templates/               # Gabarito oficial (.pdf, .docx e .xlsx expandido)
├── scripts/                     # Ferramentas auxiliares e scripts históricos
│   └── legacy-tools/            # Automações legadas (Python e Google Apps Script)
├── src/
│   ├── app/                     # Next.js App Router (layout, página principal e CSS)
│   ├── components/              # Componentes React desacoplados e responsivos
│   ├── context/                 # Contextos de diálogo e feedback
│   ├── lib/                     # Calculadora de horas, gerenciador de storage e temas
│   └── types/                   # Interfaces e contratos de dados TypeScript
├── AGENTS.md                    # Contrato de execução para agentes de IA
├── CONTRIBUTING.md              # Diretrizes de colaboração e convenções de código
├── LICENSE                      # Licença de código aberto MIT
└── README.md                    # Este documento
```

---

## 📚 Documentação do Projeto

* 📘 [docs/architecture.md](docs/architecture.md): Arquitetura de software, fluxo de estados e diagrama de componentes.
* 🏛️ [docs/regimento-pet.md](docs/regimento-pet.md): Regras de carga horária, relatórios no Google Forms e comprovação de bolsa.
* ☁️ [docs/deployment-vercel.md](docs/deployment-vercel.md): Manual de infraestrutura, DNS e variáveis de ambiente na Vercel.
* 🤝 [CONTRIBUTING.md](CONTRIBUTING.md): Diretrizes de contribuição, fluxo Git e gates de aceitação.
* 📋 [AGENTS.md](AGENTS.md): Contrato normativo para agentes de IA que atuam no repositório.

---

## 👥 Autoria e Desenvolvimento

Este sistema foi concebido, desenhado e implementado no âmbito do PET-Saúde Clima UFG por:

* **[Felipe Vidal](https://www.linkedin.com/in/vvvvvdal/)** (Estudante e Bolsista PET-Saúde Clima / UFG)
* **[Robert Taveira](https://www.linkedin.com/in/robert-taveira/)** (Colaborador e Desenvolvedor)

---

## 🏛️ Instituições Parceiras

* **Secretaria Municipal de Saúde de Goiânia (SMS Goiânia)** — Coordenação Geral
* **Secretaria Estadual de Saúde de Goiás (SES Goiás)**
* **Universidade Federal de Goiás (UFG)** — Campus Goiânia
* **Ministério da Saúde (SGTES/MS)** — 13ª Edição do PET-Saúde

---

## 📄 Licença

Este software é livre e de código aberto, publicado sob os termos da [Licença MIT](LICENSE).

---

<p align="center">
  PET-Saúde Clima: Folha de Frequência Mensal &copy; 2026 • Desenvolvido por <a href="https://www.linkedin.com/in/vvvvvdal/">Felipe Vidal</a> & <a href="https://www.linkedin.com/in/robert-taveira/">Robert Taveira</a>
</p>
