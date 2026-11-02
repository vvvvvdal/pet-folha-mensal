# Maestri: Codex e Gemini no PET Folha

## Validação desta configuração

- Tipo: configuração de papéis locais e documentação; produto sem alteração.
- Conferir JSON dos dois papéis, diretórios, fontes, comandos, exclusões de arquivos gerados e diff.
- Na primeira tarefa real: confirmar modelo/login, comunicação, limites de escrita e gates.
- Repetir checks apenas por mudança relevante, falha ou dúvida nova.

## Entradas

- [Regras](../AGENTS.md), [tarefas](../TASKS.md) e [referências do Oracle](oracle-ci-logs-unslop.md).
- Papéis portáveis em `.maestri/roles/*/role.json`, schema 1; cada pasta contém
  `AGENTS.md` gerado pelo app, ignorado no Git. O Maestri oferece **Discover Roles** na edição do terminal.
- Dois papéis no Maestri são restritos ao workspace deste projeto. O canvas usa
  o repositório local e uma nota curta com ponteiros; o andamento fica em TASKS/docs.

## Operação

1. Abrir Maestri pelo menu de aplicativos e escolher **PET Folha**.
2. Os terminais estão preparados. Ativar Codex para conduzir
   o pedido; Gemini fica disponível para revisão ou um recorte isolado.
3. Codex usa o login ChatGPT do CLI existente. Gemini usa Antigravity CLI (`agy` 1.4.12) e o login Google existente.
   O catálogo `agy models` listou **gemini-4-argon-medium**, selecionado no terminal.
   Não há API key nova nem troca para cobrança de API.
4. Dar objetivo, frente/ID, limites e aceite ao Codex. Para CI/logs/UI, começar
   pelo plano [Oracle](oracle-ci-logs-unslop.md) e escolher OR-CI, OR-LOG ou OR-UI.
5. Ao precisar de revisão, informar ao Gemini o arquivo/ID e a base exata do diff.
   Revisão começa sem escrita. Implementação isolada exige atribuição explícita;
   o integrador confere o diff e os gates antes de integrar.

O Maestri organiza CLIs; esta conversa do app e o ChatGPT de um projeto não são
transportados automaticamente para os terminais. A retomada usa documentos.
O terminal Gemini executa `agy --model gemini-4-argon-medium --mode plan`.
`antigravity` abre a IDE instalada; `agy` é o cliente de terminal atual.
O teste com `gemini` 0.60.0 falhou com `UNSUPPORTED_CLIENT`: o login individual
legado foi encerrado, conforme a [migração oficial do Google](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/).
Isso não é evidência de indisponibilidade do Argon no plano Google.
Antigravity descobre `AGENTS.md`, `GEMINI.md` e skills do projeto; mantenha as
regras locais. [Descoberta oficial](https://antigravity.google/docs/customization-discovery?tab=cli).

## Limites e responsabilidade

Preserve localStorage, isolamento por perfil/mês, backup, fórmula CEILING - FLOOR e folha oficial A4 paisagem. PIN/sessão são verificados no servidor; dados do navegador não têm autoridade institucional. Não enviar dados de participantes para observabilidade remota.

Papéis são instruções, não sandbox nem permissão do sistema. Codex é responsável
por integração; Gemini revisa por padrão. Para executar em paralelo, isolar writers
em worktrees e definir dono dos caminhos; dois terminais no mesmo checkout não
produzem isolamento. Não carregar skills ou contratar serviços por rotina.

Um papel recebe objetivo/arquivo/ID, escopo, base e aceite e entrega resultado,
check executado/ambiente, caminhos e pendência real. “Concluído” só com evidência.
Reutilizar checks aprovados para o mesmo código/ambiente; falha repetida sem nova
informação exige mudar hipótese. Push continua humano. Produção e comunicação
externa seguem autorização específica e contratos do projeto.

## Instalação e limites verificados

Configuração: quatro schemas de papel nos dois pilotos, referências locais e
exclusões de arquivos gerados conferidos. Neste repo, tipagem passou; build
Turbopack passou em cópia isolada da base `208e663`, com Node 22.23.2 e lockfile.
Lint da mesma base falhou com 19 erros/5 avisos preexistentes; ver
[OR-CI](oracle-ci-logs-unslop.md#or-ci--criar-uma-base-pequena-antes-de-otimizar).
Integração à main fica pendente desse gate, conforme CONTRIBUTING.

Em 02/11/2026, Maestri Linux **0.29.0, build 113** foi instalado para este usuário
em `/home/felipe/Applications/Maestri.AppImage` pelo instalador oficial, com SHA-256
conferido contra o checksum publicado. O processo do app e o daemon iniciaram; os dois workspaces foram carregados
e os papéis/conexões foram preservados. Abrir um workspace pode iniciar seus terminais. Inspeção visual do canvas ainda não realizada.
A versão Linux tem numeração diferente do changelog geral 0.58.0.
Neste ambiente, o lançamento padrão registrou falha de renderização/captura do
canvas. O atalho local usa `--disable-gpu`; no reinício por software, os erros
gráficos anteriores não se repetiram. Isso não substitui a conferência visual.
Uma reinstalação pode recriar o atalho padrão; a cópia anterior está no backup.

A configuração nativa é local em `~/.maestri`; os dois espaços e papéis foram
preparados para este projeto e o outro piloto. O login dos agentes é reaproveitado,
sem exportação de tokens. As integrações nativas do Maestri ficam em
`.agents/skills/maestri*` apenas nos dois repositórios, geradas pelo app e excluídas
do Git local. O destino global automático foi arquivado no backup. O ID do Argon foi confirmado
no catálogo do Antigravity CLI e configurado. Um prompt mínimo em pasta vazia
retornou `OK`, status `SUCCESS`, sem fornecer arquivos dos projetos, via `agy --model gemini-4-argon-medium --mode plan`. Comunicação entre agentes e uma
entrega real com limites/gates ainda precisam ser homologadas no Maestri.

Reversão: retirar os espaços/papéis destes dois pilotos no Maestri e reverter
os arquivos desta mudança no Git. A instalação pode ser removida pelo instalador
oficial com `--uninstall`; manter dados/perfis existentes. Backup pré-configuração
local em `~/.local/state/oracle-maestri-20261102/`.

Fontes: [Linux oficial](https://www.themaestri.app/en/linux),
[papéis](https://www.themaestri.app/en/docs/terminals),
[Maestro](https://www.themaestri.app/en/docs/maestro),
[partituras](https://www.themaestri.app/en/docs/partituras).
