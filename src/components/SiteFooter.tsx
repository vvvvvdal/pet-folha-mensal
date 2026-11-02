"use client";

const repository = "https://github.com/vvvvvdal/pet-folha-mensal";
const template =
  "/templates/PET%20-%20Folha%20de%20Frequ%C3%AAncia%20-%20Modelo%20Vazio.pdf";

export function SiteFooter({
  compact = false,
  onHelp,
  onFeedback,
}: {
  compact?: boolean;
  onHelp: () => void;
  onFeedback: () => void;
}) {
  return (
    <footer className="site-footer screen-only compact">
      <div className="footer-inner">
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} PET-Saúde Clima ·{" "}
            <a
              href="https://www.linkedin.com/in/vvvvvdal/"
              target="_blank"
              rel="noreferrer"
            >
              Felipe Vidal
            </a>
            {" e "}
            <a
              href="https://www.linkedin.com/in/robert-taveira/"
              target="_blank"
              rel="noreferrer"
            >
              Robert Taveira
            </a>
          </p>
          <nav className="footer-utilities" aria-label="Links do rodapé">
            {!compact && (
              <>
                <a href={repository} target="_blank" rel="noreferrer">
                  Projeto
                </a>
                <a href={template} target="_blank" rel="noreferrer">
                  Modelo em branco
                </a>
              </>
            )}
            <button onClick={onHelp}>Ajuda</button>
            <button onClick={onFeedback}>Avaliar</button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
