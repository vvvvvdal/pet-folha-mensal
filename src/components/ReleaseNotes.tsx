import { RELEASES } from "@/lib/releases";

function releaseDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" })
    .format(new Date(date + "T12:00:00-03:00"));
}

export function ReleaseNotes() {
  const [latest, ...history] = RELEASES;
  return (
    <section className="release-notes" aria-label="Novidades do site">
      <div className="release-heading">
        <p className="section-kicker">Novidades</p>
        <p className="release-date">Última atualização <time dateTime={latest.date}>{releaseDate(latest.date)}</time></p>
      </div>
      <h2 id="release-title">{latest.title}</h2>
      <ul className="release-changes">
        {latest.changes.map((change) => <li key={change}>{change}</li>)}
      </ul>
      <details className="release-history">
        <summary>Ver histórico de atualizações</summary>
        <ol>
          {history.map((release) => (
            <li key={release.date + release.title}>
              <time dateTime={release.date}>{releaseDate(release.date)}</time>
              <h3>{release.title}</h3>
              <ul>{release.changes.map((change) => <li key={change}>{change}</li>)}</ul>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
