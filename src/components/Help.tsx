"use client";

import { ChevronDown, X } from "lucide-react";
import { Modal } from "./Modal";

const localQuestions = [
  [
    "Como começo minha folha?",
    "Informe seu nome, função e GAT. Nos próximos meses, abra seu perfil neste navegador e escolha o mês. Você não precisa de uma cópia para começar um novo mês aqui.",
  ],
  [
    "Como restauro minha folha?",
    "Use “Restaurar cópia” e escolha o arquivo .json que você salvou. Ele guarda sua identificação, atividades, comprovantes e relatórios. O PDF serve para assinatura e não restaura os registros.",
  ],
  [
    "Onde ficam meus dados?",
    "Neste navegador. Limpar seus dados pode apagar os registros. Use “Salvar cópia” e guarde o arquivo .json em local seguro.",
  ],
  [
    "Perdi a cópia. Posso continuar?",
    "Se ainda usa o mesmo navegador, abra seu perfil em “Continuar”. Em outro aparelho ou após limpar os dados, você pode começar um novo mês. Para recuperar registros antigos, use a cópia ou o navegador original. Os aparelhos não são sincronizados.",
  ],
];

const googleQuestions = [
  [
    "Como começo minha folha?",
    "Entre com o Google. Vincule uma folha deste navegador ou importe seu arquivo .json no primeiro acesso. Se estiver começando do zero, confira seu nome, função e GAT. A primeira atividade salva cria a pasta PET Folha no Drive.",
  ],
  [
    "Por que preciso autorizar o Google Drive?",
    "O PET Folha usa a permissão para salvar e recuperar os meses na pasta PET Folha. Na tela do Google, marque a caixa do Drive se ela aparecer e selecione “Continuar”. A permissão vale para os arquivos que você usa com o app.",
  ],
  [
    "Como abro minha folha em outro aparelho?",
    "Entre com a mesma conta Google. O PET Folha busca os meses sincronizados na pasta PET Folha do seu Drive.",
  ],
  [
    "Como baixo ou importo uma cópia manual?",
    "Na Conta, escolha “Baixar cópia .json” ou “Importar cópia .json”. Se o arquivo antigo estiver no Drive, baixe-o antes de importar. Importe um arquivo por mês e acompanhe o envio até aparecer “Salvo no Drive”.",
  ],
];

const commonQuestions = [
  [
    "Como as horas são calculadas?",
    "Cada hora iniciada conta como uma hora inteira. Por exemplo, das 13h30 às 17h30 são 5 horas. A referência é de 8 horas por semana e cerca de 32 horas por mês.",
  ],
  [
    "Como preparo o formulário de cada atividade?",
    "Em “Atividades do mês”, escolha “Forms” e confira os dados. Abra o formulário e envie pelo Google. Depois volte e marque “Já enviei”. Se editar a atividade, confira o envio novamente.",
  ],
  [
    "Como imprimo e assino?",
    "Em “Comprovantes”, escolha os arquivos, confira as prévias e selecione as atividades de cada um. Um arquivo pode comprovar várias atividades. Depois, escolha “Salvar comprovantes”. Em “Folha”, confira e imprima em A4 horizontal. Os comprovantes aparecem depois da folha. Arquivos sem atividade ficam no final.",
  ],
];

export function FAQ({ google = false }: { google?: boolean }) {
  const questions = google ? googleQuestions : localQuestions;
  return (
    <div className="faq-list">
      {[...questions, ...commonQuestions].map(([question, answer]) => (
        <details key={question}>
          <summary>
            {question}
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}

export function HelpModal({
  google,
  isOpen,
  onClose,
}: {
  google?: boolean;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Ajuda com sua folha">
      <div className="help-panel">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2>Ajuda</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Fechar ajuda"
          >
            <X size={20} />
          </button>
        </div>
        <FAQ google={google} />
      </div>
    </Modal>
  );
}
