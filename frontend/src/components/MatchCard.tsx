import { Link } from "react-router-dom";
import type { Match } from "../api/client";
import TeamLogo from "./TeamLogo";
import StatusBadge from "./StatusBadge";

function formatKickoff(iso: string | null) {
  if (!iso) return "TBD";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MatchScoreline({ match, large = false }: { match: Match; large?: boolean }) {
  const showScore = match.status !== "scheduled";
  return (
    <div className={`scoreline ${large ? "scoreline-lg" : ""}`}>
      <div className="scoreline-team">
        <TeamLogo name={match.homeTeam} size={large ? 56 : 34} />
        <span className="scoreline-name">{match.homeTeam}</span>
      </div>
      <div className="scoreline-mid">
        {showScore ? (
          <span className="scoreline-score">
            {match.homescore} – {match.awayscore}
          </span>
        ) : (
          <span className="scoreline-time muted">{formatKickoff(match.startTime)}</span>
        )}
      </div>
      <div className="scoreline-team scoreline-away">
        <span className="scoreline-name">{match.awayTeam}</span>
        <TeamLogo name={match.awayTeam} size={large ? 56 : 34} />
      </div>
    </div>
  );
}

export default function MatchCard({ match }: { match: Match }) {
  return (
    <Link to={`/match/${match.id}`} className="pub-match-card">
      <div className="pub-match-top">
        <span className="muted pub-sport">{match.sport}</span>
        <StatusBadge status={match.status} />
      </div>
      <MatchScoreline match={match} />
      {match.status === "live" && match.endTime && (
        <div className="muted pub-sub">until {formatKickoff(match.endTime)}</div>
      )}
      {match.status === "finished" && match.endTime && (
        <div className="muted pub-sub">ended {formatKickoff(match.endTime)}</div>
      )}
    </Link>
  );
}
