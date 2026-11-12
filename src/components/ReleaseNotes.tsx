import { RELEASES } from "@/lib/releases";

function releaseDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" })
    .format(new Date(date + "T12:00:00-03:00"));
}

export function ReleaseNotes({ inDialog = false, variant, unreadCount = 0 }: { inDialog?: boolean; variant?: "popover"; unreadCount?: number }) {
  if (variant === "popover") {
    const fresh = RELEASES.slice(0, unreadCount);
    const previous = RELEASES.slice(unreadCount);
    return <section className="release-notes compact-releases" aria-label="Histórico de atualizações">
      {fresh.map((release) => <article key={release.date + release.title}>
        <p className="release-date"><span className="new-release">Nova</span> <time dateTime={release.date}>{releaseDate(release.date)}</time></p>
        <h3>{release.title}</h3>
        <ul>{release.changes.map((change) => <li key={change}>{change}</li>)}</ul>
      </article>)}
      {previous.length > 0 && <details className="release-history"><summary>Ver atualizações anteriores</summary>
        {previous.map((release) => <details className="previous-release" key={release.date + release.title}>
          <summary><time dateTime={release.date}>{releaseDate(release.date)}</time><h3>{release.title}</h3></summary>
          <ul>{release.changes.map((change) => <li key={change}>{change}</li>)}</ul>
        </details>)}
      </details>}
    </section>;
  }
  const [latest, ...history] = RELEASES;
  const Title = inDialog ? "h3" : "h2";
  const HistoryTitle = inDialog ? "h4" : "h3";
  return (
    <section className="release-notes" aria-label={inDialog ? "Histórico de atualizações" : "Novidades do site"}>
      <div className="release-heading">
        {!inDialog && <p className="section-kicker">Novidades</p>}
        <p className="release-date">Última atualização <time dateTime={latest.date}>{releaseDate(latest.date)}</time></p>
      </div>
      <Title className="release-title">{latest.title}</Title>
      <ul className="release-changes">
        {latest.changes.map((change) => <li key={change}>{change}</li>)}
      </ul>
      <details className="release-history">
        <summary>Ver histórico de atualizações</summary>
        <ol>
          {history.map((release) => (
            <li key={release.date + release.title}>
              <time dateTime={release.date}>{releaseDate(release.date)}</time>
              <HistoryTitle>{release.title}</HistoryTitle>
              <ul>{release.changes.map((change) => <li key={change}>{change}</li>)}</ul>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
