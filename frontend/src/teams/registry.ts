// Frontend-only team registry. Matches store team names as plain text in the
// backend; this file maps a team name to a CSS-rendered logo design so any
// name resolves to a consistent badge without storing images anywhere.

export type LogoShape = "shield" | "circle" | "hex" | "badge";

export interface TeamDesign {
  /** Primary (dominant) color of the crest. */
  primary: string;
  /** Optional secondary color used for stripes/halves of the crest. */
  secondary?: string;
  /** Text/monogram color. Defaults to a contrast-safe light or dark value. */
  ink?: string;
  /** Crest silhouette. */
  shape?: LogoShape;
  /** Monogram override (1-3 chars). Defaults to initials derived from the name. */
  monogram?: string;
}

// Keyed by normalized team name (lowercase, trimmed).
const TEAMS: Record<string, TeamDesign> = {
  // Football
  "mumbai meteors": { primary: "#2563eb", secondary: "#93c5fd", shape: "shield", monogram: "MM" },
  "delhi dynamos": { primary: "#dc2626", secondary: "#fca5a5", shape: "shield", monogram: "DD" },
  "chennai chargers": { primary: "#f59e0b", secondary: "#1f2937", shape: "shield", monogram: "CC" },
  "bengaluru blasters": { primary: "#7c3aed", secondary: "#c4b5fd", shape: "shield", monogram: "BB" },
  "kolkata knights": { primary: "#0891b2", secondary: "#a5f3fc", shape: "circle", monogram: "KK" },
  "hyderabad hawks": { primary: "#16a34a", secondary: "#bbf7d0", shape: "hex", monogram: "HH" },
  "pune panthers": { primary: "#1d4ed8", secondary: "#fbbf24", shape: "shield", monogram: "PP" },
  "ahmedabad amazons": { primary: "#ea580c", secondary: "#fed7aa", shape: "badge", monogram: "AA" },
  "goa giants": { primary: "#0d9488", secondary: "#99f6e4", shape: "circle", monogram: "GG" },
  "kerala kings": { primary: "#be123c", secondary: "#fecdd3", shape: "hex", monogram: "KK" },
  "manchester rovers": { primary: "#dc2626", secondary: "#f8fafc", shape: "shield", monogram: "MR" },
  "lyon lions": { primary: "#2563eb", secondary: "#facc15", shape: "shield", monogram: "LL" },
  "madrid mavericks": { primary: "#7f1d1d", secondary: "#fde68a", shape: "shield", monogram: "MM" },
  "berlin bears": { primary: "#1e3a8a", secondary: "#f87171", shape: "circle", monogram: "BB" },
  "turin titans": { primary: "#111827", secondary: "#e5e7eb", shape: "shield", monogram: "TT" },
  "amsterdam arrows": { primary: "#ea580c", secondary: "#111827", shape: "hex", monogram: "AA" },
  "lisbon lizards": { primary: "#15803d", secondary: "#fef08a", shape: "badge", monogram: "LL" },
  "dublin dragons": { primary: "#166534", secondary: "#fbbf24", shape: "hex", monogram: "DD" },
  "warsaw wolves": { primary: "#b91c1c", secondary: "#e2e8f0", shape: "shield", monogram: "WW" },
  "prague panthers": { primary: "#1e40af", secondary: "#f87171", shape: "circle", monogram: "PP" },

  // Basketball
  "new york knicks": { primary: "#f97316", secondary: "#1d4ed8", shape: "circle", monogram: "NY" },
  "la lakers": { primary: "#7c3aed", secondary: "#facc15", shape: "circle", monogram: "LA" },
  "boston celtics": { primary: "#16a34a", secondary: "#ffffff", shape: "circle", monogram: "BC" },
  "golden state warriors": { primary: "#2563eb", secondary: "#facc15", shape: "circle", monogram: "GS" },
  "chicago bulls": { primary: "#dc2626", secondary: "#111827", shape: "circle", monogram: "CH" },
  "miami heat": { primary: "#dc2626", secondary: "#f97316", shape: "hex", monogram: "MH" },
  "denver nuggets": { primary: "#b45309", secondary: "#fef3c7", shape: "hex", monogram: "DN" },
  "toronto raptors": { primary: "#dc2626", secondary: "#1e3a8a", shape: "circle", monogram: "TR" },

  // Cricket
  "mumbai indians": { primary: "#2563eb", secondary: "#facc15", shape: "circle", monogram: "MI" },
  "chennai super kings": { primary: "#facc15", secondary: "#1e3a8a", shape: "circle", monogram: "CS" },
  "royal challengers": { primary: "#dc2626", secondary: "#111827", shape: "circle", monogram: "RC" },
  "kolkata knight riders": { primary: "#7c3aed", secondary: "#facc15", shape: "circle", monogram: "KK" },
  "delhi capitals": { primary: "#2563eb", secondary: "#dc2626", shape: "circle", monogram: "DC" },
  "sunrisers hyderabad": { primary: "#ea580c", secondary: "#111827", shape: "hex", monogram: "SH" },
  "rajasthan royals": { primary: "#dc2626", secondary: "#facc15", shape: "circle", monogram: "RR" },
  "gujarat titans": { primary: "#1d4ed8", secondary: "#f97316", shape: "hex", monogram: "GT" },

  // National teams
  "india": { primary: "#f97316", secondary: "#16a34a", shape: "shield", monogram: "IN" },
  "nepal": { primary: "#dc2626", secondary: "#1e3a8a", shape: "shield", monogram: "NP" },
  "australia": { primary: "#facc15", secondary: "#1e3a8a", shape: "shield", monogram: "AU" },
  "england": { primary: "#dc2626", secondary: "#f8fafc", shape: "shield", monogram: "EN" },
  "new zealand": { primary: "#111827", secondary: "#dc2626", shape: "shield", monogram: "NZ" },
  "south africa": { primary: "#16a34a", secondary: "#facc15", shape: "shield", monogram: "SA" },

  // Tennis / other
  "serena williams": { primary: "#7c3aed", secondary: "#facc15", shape: "circle", monogram: "SW" },
  "carlos alcaraz": { primary: "#ea580c", secondary: "#111827", shape: "circle", monogram: "CA" },
  "novak djokovic": { primary: "#16a34a", secondary: "#facc15", shape: "circle", monogram: "ND" },
  "iga swiatek": { primary: "#dc2626", secondary: "#1d4ed8", shape: "circle", monogram: "IS" },
};

// Deterministic fallback palette for teams not in the registry.
const FALLBACK_PALETTE: Array<Pick<TeamDesign, "primary" | "secondary" | "shape">> = [
  { primary: "#0ea5e9", secondary: "#bae6fd", shape: "shield" },
  { primary: "#8b5cf6", secondary: "#ddd6fe", shape: "hex" },
  { primary: "#10b981", secondary: "#a7f3d0", shape: "circle" },
  { primary: "#f43f5e", secondary: "#fecdd3", shape: "badge" },
  { primary: "#f59e0b", secondary: "#fde68a", shape: "shield" },
  { primary: "#6366f1", secondary: "#c7d2fe", shape: "hex" },
  { primary: "#14b8a6", secondary: "#99f6e4", shape: "circle" },
  { primary: "#e11d48", secondary: "#fecdd3", shape: "badge" },
];

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

const cache = new Map<string, TeamDesign>();

/** Resolve a team name to a logo design. Unknown teams get a deterministic fallback. */
export function getTeamDesign(name: string): TeamDesign {
  const key = normalize(name);
  const hit = cache.get(key);
  if (hit) return hit;

  const registered = TEAMS[key];
  let design: TeamDesign;
  if (registered) {
    design = { ...registered, monogram: registered.monogram ?? initials(name) };
  } else {
    const h = hashString(key);
    const base = FALLBACK_PALETTE[h % FALLBACK_PALETTE.length];
    design = { ...base, monogram: initials(name) };
  }
  cache.set(key, design);
  return design;
}

/** All registered team names — useful for autocomplete in admin forms. */
export function listTeamNames(): string[] {
  return Object.keys(TEAMS)
    .map((k) => {
      // Restore a display-friendly casing: prefer the registered key as typed.
      return k
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");
    })
    .sort();
}

/** Check whether a team name exists in the registry (case-insensitive). */
export function isRegisteredTeam(name: string): boolean {
  return normalize(name) in TEAMS;
}
