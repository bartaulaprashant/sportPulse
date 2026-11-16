import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type Commentary, type Match } from "../api/client";
import { MatchScoreline } from "../components/MatchCard";
import StatusBadge from "../components/StatusBadge";
import TeamLogo from "../components/TeamLogo";

const EVENT_STYLES: Record<string, string> = {
  goal: "ev-goal",
  "own goal": "ev-goal",
  card: "ev-card",
  "yellow card": "ev-card",
  "red card": "ev-card",
  sub: "ev-sub",
  substitution: "ev-sub",
  penalty: "ev-penalty",
};

function eventClass(eventType: string | null) {
  if (!eventType) return "";
  return EVENT_STYLES[eventType.toLowerCase()] ?? "ev-default";
}

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = Number(id);

  const [match, setMatch] = useState<Match | null>(null);
  const [commentary, setCommentary] = useState<Commentary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([
        api.getMatch(matchId),
        api.listCommentary(matchId),
      ]);
      setMatch(m.data);
      setCommentary(c.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load match");
    }
  }, [matchId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  if (error) {
    return (
      <div className="pub">
        <div className="pub-nav">
          <Link to="/" className="pub-brand">sport<span>Pulse</span></Link>
        </div>
        <main className="pub-main">
          <div className="error">{error}</div>
          <p><Link to="/">← Back to matches</Link></p>
        </main>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="pub">
        <div className="pub-nav">
          <Link to="/" className="pub-brand">sport<span>Pulse</span></Link>
        </div>
        <main className="pub-main"><p className="muted">Loading match…</p></main>
      </div>
    );
  }

  return (
    <div className="pub">
      <header className="pub-nav">
        <Link to="/" className="pub-brand">sport<span>Pulse</span></Link>
        <nav className="pub-nav-links">
          <Link to="/">← All matches</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>

      <main className="pub-main pub-detail">
        <div className="card pub-scoreboard">
          <div className="pub-scoreboard-top">
            <span className="muted">{match.sport}</span>
            <StatusBadge status={match.status} />
          </div>

          <MatchScoreline match={match} large />

          <div className="pub-match-info muted">
            <span>
              {match.status === "scheduled" && "Starts"}{" "}
              {match.status === "live" && "Started"}{" "}
              {match.status === "finished" && "Played"}{" "}
              {new Date(match.startTime).toLocaleString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {match.endTime && (
              <span>
                {match.status === "live" ? "Ends" : "Ended"}{" "}
                {new Date(match.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        <section className="pub-commentary">
          <h2>Commentary</h2>
          {commentary.length === 0 ? (
            <p className="muted">No commentary yet{match.status === "live" ? " — updates will appear here" : ""}.</p>
          ) : (
            <ol className="commentary-feed">
              {[...commentary].reverse().map((c) => (
                <li key={c.id} className="commentary-item">
                  <span className={`commentary-minute ${eventClass(c.eventType)}`}>
                    {c.minute != null ? `${c.minute}'` : "—"}
                  </span>
                  <div className="commentary-body">
                    {c.eventType && (
                      <span className={`commentary-tag ${eventClass(c.eventType)}`}>
                        {c.eventType}
                      </span>
                    )}
                    {c.actor && <strong className="commentary-actor">{c.actor}</strong>}
                    {c.team && <TeamLogo name={c.team} size={20} />}
                    <p>{c.message}</p>
                    <time className="muted">
                      {new Date(c.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}
