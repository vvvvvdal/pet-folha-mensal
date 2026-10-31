"use client";

import { ChevronDown, X } from "lucide-react";
import { Modal } from "./Modal";

const questions = [
  [
    "Como começo minha folha?",
    "Escolha “Criar minha folha” e informe nome, função e GAT. Depois, adicione as atividades no painel.",
  ],
  [
    "Como restauro uma folha?",
    "Use “Restaurar minha folha” ou “Restaurar cópia” e selecione o arquivo .json salvo anteriormente. O PDF não restaura os registros.",
  ],
  [
    "Onde ficam meus dados?",
    "Neste navegador. Use “Salvar cópia” para baixar o arquivo .json; limpar os dados do navegador pode apagar seus registros. Guarde a cópia em local seguro.",
  ],
  [
    "Posso trocar de dispositivo?",
    "Sim. Salve a cópia .json e restaure no outro aparelho. Não há sincronização automática.",
  ],
  [
    "Como as horas são calculadas?",
    "A chegada é arredondada para a hora anterior; a saída, para a seguinte. Exemplo: 13h30 às 17h30 = 5h. A referência é de 8h semanais e aproximadamente 32h mensais.",
  ],
  [
    "Como imprimo e assino?",
    "Em “Folha oficial”, escolha “Imprimir / salvar PDF”. Use papel A4 em paisagem e assine conforme a orientação da coordenação. Guarde o .json para continuar editando.",
  ],
];

export function FAQ() {
  return (
    <div className="faq-list">
      {questions.map(([question, answer]) => (
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
  isOpen,
  onClose,
}: {
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
        <FAQ />
      </div>
    </Modal>
  );
}
