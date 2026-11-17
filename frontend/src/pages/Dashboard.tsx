import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api, type Commentary, type Match } from "../api/client";
import { listTeamNames } from "../teams/registry";
import TeamLogo from "../components/TeamLogo";
import NavBar from "../components/NavBar";

const TEAM_NAMES = listTeamNames();

const STATUSES = ["all", "live", "scheduled", "finished"] as const;
type StatusFilter = (typeof STATUSES)[number];

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local: string) {
  return new Date(local).toISOString();
}

function StatusBadge({ status }: { status: Match["status"] }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export const Dashboard=() =>{
  const { admin, logout } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const params = filter === "all" ? {} : { status: filter };
      const res = await api.listMatches(params);
      setMatches(res.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load matches");
    }
  }, [filter]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="pub">
      <NavBar
        right={
          <>
            <span className="nav-profile" title={admin?.email ?? "Admin"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <Link className="nav-link-btn" to="/">
              View site
            </Link>
            <button className="ghost nav-logout" onClick={logout}>
              Log out
            </button>
          </>
        }
      />

      <main className="pub-main admin-main">
      <div className="toolbar">
        <div className="filters pub-tabs">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={filter === s ? "chip active" : "chip"}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <button className="ghost" onClick={load}>
            Refresh
          </button>
          <button onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? "Cancel" : "+ New match"}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <datalist id="team-list">
        {TEAM_NAMES.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      {showCreate && (
        <CreateMatchForm
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}

      <div className="match-list">
        {matches.length === 0 && !error && (
          <p className="muted">No matches found.</p>
        )}
        {matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            expanded={expandedId === m.id}
            onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
            onChanged={load}
          />
        ))}
      </div>
      </main>
    </div>
  );
}

function MatchCard({
  match,
  expanded,
  onToggle,
  onChanged,
}: {
  match: Match;
  expanded: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  return (
    <div className="card match-card">
      <button className="match-header" onClick={onToggle}>
        <div className="match-teams">
          <TeamLogo name={match.homeTeam} size={30} />
          <strong>{match.homeTeam}</strong>
          <span className="score">
            {match.homescore} – {match.awayscore}
          </span>
          <strong>{match.awayTeam}</strong>
          <TeamLogo name={match.awayTeam} size={30} />
        </div>
        <div className="match-meta">
          <span className="muted">{match.sport}</span>
          <StatusBadge status={match.status} />
          <span className="muted">
            {new Date(match.startTime).toLocaleString()}
          </span>
        </div>
      </button>

      {expanded && (
        <MatchDetail match={match} onChanged={onChanged} />
      )}
    </div>
  );
}

function MatchDetail({
  match,
  onChanged,
}: {
  match: Match;
  onChanged: () => void;
}) {
  const [commentary, setCommentary] = useState<Commentary[]>([]);

  const loadCommentary = useCallback(async () => {
    try {
      const res = await api.listCommentary(match.id);
      setCommentary(res.data);
    } catch {
      /* commentary optional */
    }
  }, [match.id]);

  useEffect(() => {
    loadCommentary();
  }, [loadCommentary]);

  return (
    <div className="match-detail">
      {match.status !== "finished" && (
        <EditMatchForm match={match} onChanged={onChanged} />
      )}
      <CommentarySection
        match={match}
        commentary={commentary}
        onChanged={loadCommentary}
      />
    </div>
  );
}

function EditMatchForm({
  match,
  onChanged,
}: {
  match: Match;
  onChanged: () => void;
}) {
  const isLive = match.status === "live";
  const [form, setForm] = useState({
    sport: match.sport,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    startTime: toLocalInput(match.startTime),
    endTime: toLocalInput(match.endTime),
    homeScore: match.homescore,
    awayScore: match.awayscore,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (isLive) {
        payload.homeScore = Number(form.homeScore);
        payload.awayScore = Number(form.awayScore);
        payload.endTime = toIso(form.endTime);
      } else {
        payload.sport = form.sport;
        payload.homeTeam = form.homeTeam;
        payload.awayTeam = form.awayTeam;
        payload.startTime = toIso(form.startTime);
        payload.endTime = toIso(form.endTime);
      }
      await api.updateMatch(match.id, payload);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="edit-form" onSubmit={onSubmit}>
      <h3>Edit match</h3>
      {isLive ? (
        <p className="muted">Live match — only scores and end time can be updated.</p>
      ) : (
        <p className="muted">Scores are locked until the match goes live.</p>
      )}

      <div className="form-grid">
        {!isLive && (
          <>
            <label>
              Sport
              <input value={form.sport} onChange={(e) => set("sport", e.target.value)} />
            </label>
            <label>
              Home team
              <input
                value={form.homeTeam}
                onChange={(e) => set("homeTeam", e.target.value)}
                list="team-list"
              />
            </label>
            <label>
              Away team
              <input
                value={form.awayTeam}
                onChange={(e) => set("awayTeam", e.target.value)}
                list="team-list"
              />
            </label>
            <label>
              Start time
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
              />
            </label>
          </>
        )}
        <label>
          End time
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => set("endTime", e.target.value)}
          />
        </label>
        <label>
          Home score
          <input
            type="number"
            min={0}
            value={form.homeScore}
            onChange={(e) => set("homeScore", Number(e.target.value))}
            disabled={!isLive}
          />
        </label>
        <label>
          Away score
          <input
            type="number"
            min={0}
            value={form.awayScore}
            onChange={(e) => set("awayScore", Number(e.target.value))}
            disabled={!isLive}
          />
        </label>
      </div>

      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function CommentarySection({
  match,
  commentary,
  onChanged,
}: {
  match: Match;
  commentary: Commentary[];
  onChanged: () => void;
}) {
  const [minutes, setMinutes] = useState("");
  const [message, setMessage] = useState("");
  const [eventType, setEventType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isLive = match.status === "live";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.addCommentary(match.id, {
        minutes: Number(minutes),
        message,
        ...(eventType ? { eventType } : {}),
      });
      setMinutes("");
      setMessage("");
      setEventType("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add commentary");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="commentary">
      <h3>Commentary ({commentary.length})</h3>

      {isLive ? (
        <form className="commentary-form" onSubmit={onSubmit}>
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            required
          />
          <input
            placeholder="Event type (goal, card, sub…)"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          />
          <input
            className="grow"
            placeholder="Commentary message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit" disabled={saving}>
            Add
          </button>
        </form>
      ) : (
        <p className="muted">
          Commentary can only be added while the match is live.
        </p>
      )}

      {error && <div className="error">{error}</div>}

      <ul className="commentary-list">
        {commentary.map((c) => (
          <li key={c.id}>
            <span className="muted">
              {c.minute != null ? `${c.minute}'` : "—"}
              {c.eventType ? ` · ${c.eventType}` : ""}
            </span>{" "}
            {c.message}
          </li>
        ))}
        {commentary.length === 0 && <li className="muted">No commentary yet.</li>}
      </ul>
    </div>
  );
}

function CreateMatchForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    sport: "",
    homeTeam: "",
    awayTeam: "",
    startTime: "",
    endTime: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.createMatch({
        ...form,
        startTime: toIso(form.startTime),
        endTime: toIso(form.endTime),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create match");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card create-form" onSubmit={onSubmit}>
      <h3>New match</h3>
      <div className="form-grid">
        <label>
          Sport
          <input value={form.sport} onChange={(e) => set("sport", e.target.value)} required />
        </label>
        <label>
          Home team
          <input
            value={form.homeTeam}
            onChange={(e) => set("homeTeam", e.target.value)}
            list="team-list"
            required
          />
        </label>
        <label>
          Away team
          <input
            value={form.awayTeam}
            onChange={(e) => set("awayTeam", e.target.value)}
            list="team-list"
            required
          />
        </label>
        <label>
          Start time
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => set("startTime", e.target.value)}
            required
          />
        </label>
        <label>
          End time
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => set("endTime", e.target.value)}
            required
          />
        </label>
      </div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={saving}>
        {saving ? "Creating…" : "Create match"}
      </button>
    </form>
  );
}
