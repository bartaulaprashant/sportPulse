const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "sportpulse_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    window.location.href = "/login";
    throw new ApiError(401, "Session expired");
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`);
  }
  return body as T;
}

export interface Admin {
  id: number;
  email: string;
}

export interface Match {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  status: "scheduled" | "live" | "finished";
  startTime: string;
  endTime: string;
  homescore: number;
  awayscore: number;
  createdAt: string;
}

export interface Commentary {
  id: number;
  matchId: number;
  minute: number | null;
  period: string | null;
  eventType: string | null;
  actor: string | null;
  team: string | null;
  message: string;
  createdAt: string;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ data: { token: string; admin: Admin } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  listMatches: (params: Record<string, string | undefined> = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined) as [
          string,
          string,
        ][],
      ),
    ).toString();
    return request<{ data: Match[]; total: number }>(
      `/matches${qs ? `?${qs}` : ""}`,
    );
  },

  createMatch: (data: {
    sport: string;
    homeTeam: string;
    awayTeam: string;
    startTime: string;
    endTime: string;
    homeScore?: number;
    awayScore?: number;
  }) =>
    request<{ data: Match }>("/matches", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMatch: (id: number, data: Record<string, unknown>) =>
    request<{ data: Match }>(`/matches/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getMatch: (id: number) =>
    request<{ data: Match }>(`/matches/${id}`),

  listCommentary: (matchId: number) =>
    request<{ data: Commentary[] }>(`/matches/${matchId}/commentary?limit=100`),

  addCommentary: (
    matchId: number,
    data: {
      minutes: number;
      message: string;
      eventType?: string;
      actor?: string;
      team?: string;
    },
  ) =>
    request<{ data: Commentary }>(`/matches/${matchId}/commentary`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
