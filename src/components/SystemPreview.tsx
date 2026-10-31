import { FileText } from "lucide-react";

const examples = [
  {
    date: "06 out",
    time: "14:00 – 15:30",
    name: "Reunião do GAT",
    type: "Síncrona virtual",
    hours: 2,
  },
  {
    date: "13 out",
    time: "13:30 – 17:30",
    name: "Oficina de educação em saúde",
    type: "Síncrona presencial",
    hours: 5,
  },
  {
    date: "20 out",
    time: "19:00 – 20:40",
    name: "Encontro de planejamento",
    type: "Síncrona virtual",
    hours: 2,
  },
];

export function SystemPreview() {
  return (
    <section
      id="previa"
      className="preview-section"
      aria-labelledby="preview-title"
    >
      <div className="section-heading">
        <h2 id="preview-title">Prévia do sistema</h2>
      </div>
      <div className="product-preview">
        <div className="preview-top">
          <span className="example-badge">Exemplo · dados fictícios</span>
        </div>
        <div className="preview-content">
          <div className="preview-dashboard">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-muted text-xs mb-1">GAT 04 · Mangaba</p>
                <h3>Painel de frequência</h3>
              </div>
              <span className="text-muted text-xs">Outubro / 2026</span>
            </div>
            <div className="preview-metrics">
              <div>
                <span>Horas registradas</span>
                <strong>
                  9<span> / 32h</span>
                </strong>
                <div className="progress-track">
                  <span style={{ width: "28.125%" }} />
                </div>
              </div>
              <div>
                <span>Atividades no mês</span>
                <strong>3</strong>
              </div>
            </div>
            <div className="preview-rows">
              {examples.map((item) => (
                <div className="preview-row" key={item.name}>
                  <div className="preview-date">{item.date}</div>
                  <div className="min-w-0">
                    <strong>{item.name}</strong>
                    <span>
                      {item.time} · {item.type}
                    </span>
                  </div>
                  <b>{item.hours}h</b>
                </div>
              ))}
            </div>
          </div>
          <div className="preview-document">
            <div className="flex items-center gap-2 text-muted text-xs mb-5">
              <FileText size={16} />
              Folha oficial
            </div>
            <div
              className="mini-sheet"
              aria-label="Ilustração do modelo de folha mensal"
            >
              <div className="mini-institutions">
                MINISTÉRIO DA SAÚDE · PET-SAÚDE CLIMA
              </div>
              <h4>Folha de Frequência Mensal</h4>
              <p>Nome: Participante de exemplo</p>
              <p>Perfil: Estudante &nbsp; GAT: 04</p>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Chegada</th>
                    <th>Saída</th>
                    <th>Atividade</th>
                  </tr>
                </thead>
                <tbody>
                  {examples.map((item, i) => (
                    <tr key={item.name}>
                      <td>{[6, 13, 20][i]}/10</td>
                      <td>{item.time.slice(0, 5)}</td>
                      <td>{item.time.slice(-5)}</td>
                      <td>{item.name}</td>
                    </tr>
                  ))}
                  {Array.from({ length: 4 }, (_, i) => (
                    <tr key={i}>
                      <td>&nbsp;</td>
                      <td />
                      <td />
                      <td />
                    </tr>
                  ))}
                </tbody>
              </table>
              <b>TOTAL: 9 horas</b>
              <div className="mini-signatures">
                <span>Participante</span>
                <span>Supervisão do GAT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
