import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMatches } from "../hooks/useMatches";
import MatchCard from "../components/MatchCard";
import { MatchScoreline } from "../components/MatchCard";
import StatusBadge from "../components/StatusBadge";
import NavBar from "../components/NavBar";
import type { Match } from "../api/client";

type Tab = "live" | "upcoming" | "results";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "live", label: "Live now" },
  { id: "upcoming", label: "Upcoming" },
  { id: "results", label: "Results" },
];

function byStartAsc(a: Match, b: Match) {
  return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
}
function byStartDesc(a: Match, b: Match) {
  return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
}

export default function Home() {
  const { matches, error, loading } = useMatches({}, 10000);
  const [tab, setTab] = useState<Tab>("live");
  const [sport, setSport] = useState<string>("all");

  const sports = useMemo(() => {
    const seen = new Map<string, string>();
    for (const m of matches) {
      const key = m.sport.trim().toLowerCase();
      if (key && !seen.has(key)) seen.set(key, m.sport.trim());
    }
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [matches]);

  const filtered = useMemo(
    () =>
      sport === "all"
        ? matches
        : matches.filter(
            (m) => m.sport.trim().toLowerCase() === sport.trim().toLowerCase(),
          ),
    [matches, sport],
  );

  const sections = useMemo(() => {
    const live = filtered.filter((m) => m.status === "live").sort(byStartAsc);
    const upcoming = filtered
      .filter((m) => m.status === "scheduled")
      .sort(byStartAsc);
    const results = filtered.filter((m) => m.status === "finished").sort(byStartDesc);
    return { live, upcoming, results };
  }, [filtered]);

  const visible = sections[tab === "live" ? "live" : tab === "upcoming" ? "upcoming" : "results"];
  const featured = tab === "live" ? sections.live[0] : undefined;
  const rest = featured ? visible.filter((m) => m.id !== featured.id) : visible;

  return (
    <div className="pub">
      <NavBar sports={sports} sport={sport} onSportChange={setSport} />

      <main className="pub-main">
        <div className="pub-hero">
          <h1>
            {sections.live.length > 0
              ? `${sections.live.length} match${sections.live.length === 1 ? "" : "es"} live`
              : "Welcome to sportPulse"}
          </h1>
          <p className="muted">
            {sections.live.length > 0
              ? "Scores and commentary updated in real time."
              : "No matches in play right now — check the fixtures below."}
          </p>
        </div>

        <div className="pub-controls">
          <div className="pub-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? "chip active" : "chip"}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <span className="tab-count">
                  {t.id === "live"
                    ? sections.live.length
                    : t.id === "upcoming"
                      ? sections.upcoming.length
                      : sections.results.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error">{error}</div>}
        {loading && <p className="muted">Loading…</p>}

        {!loading && !error && visible.length === 0 && (
          <div className="card pub-empty">
            <p className="muted">No {TABS.find((t) => t.id === tab)?.label.toLowerCase()} matches.</p>
          </div>
        )}

        {featured && (
          <Link to={`/match/${featured.id}`} className="pub-featured">
            <div className="pub-featured-top">
              <span className="pub-featured-tag">Featured · Live</span>
              <StatusBadge status={featured.status} />
            </div>
            <MatchScoreline match={featured} large />
            <div className="muted pub-featured-meta">
              {featured.sport}
              {featured.endTime &&
                ` · ends ${new Date(featured.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            </div>
          </Link>
        )}

        <div className="pub-grid">
          {rest.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </main>

      <footer className="pub-footer muted">
        sportPulse — live scores & commentary
      </footer>
    </div>
  );
}
