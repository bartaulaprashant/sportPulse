# sportPulse

> Live sports scores and real-time commentary — a full-stack sports scoreboard platform.

A modern web app for following live matches across multiple sports, with live score updates, minute-by-minute commentary feeds, and an admin dashboard for managing matches and posting events.

---

## Tech Stack

**Frontend** (`frontend/`)
- React 19 + TypeScript
- Vite (build tooling)
- React Router 7 (client-side routing)
- Custom CSS design system — glassmorphism theme with dark/light mode toggle

**Backend** (`backend/`)
- Node.js + Express 5 (REST API)
- PostgreSQL via Drizzle ORM (hosted on Neon)
- WebSocket (`ws`) for real-time score/commentary updates
- JWT authentication for the admin panel
- Arcjet for request security/inspection
- Zod for input validation

---

## Screenshots

<!-- TODO: replace these placeholders with actual screenshots -->

### Home — Live matches
![Home page with live matches](docs/Screenshot%20From%202026-11-18%2005-22-09.png)
![Home page with live matches mobile](docs/Screenshot%20From%202026-11-18%2005-24-02.png)

### Match detail — Live commentary
![Match detail page](docs/Screenshot%20From%202026-11-18%2005-23-30.png)


---

## Strengths

- **Real-time experience** — WebSocket-driven live scores and commentary without manual refresh.
- **Polished UI** — cohesive glassmorphism design system with a working dark/light theme toggle.
- **Type-safe end-to-end** — TypeScript frontend, Zod-validated API payloads, typed ORM schema.
- **Auto match states** — match status (scheduled → live → finished) is derived automatically from start/end times.
- **Admin tooling** — full dashboard to create matches, update live scores, and post commentary events.

##  Weaknesses

- **Single-admin auth** — only one role; no multi-user/team support or RBAC.
- **No persistence for theme** — the light/dark toggle resets on page reload (no `localStorage`).
- **Commentary is append-only** — no editing/deletion of posted events.

---

## Project Structure

```
sportPulse/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── pages/     # Home, MatchDetail, Dashboard, Login
│       ├── components/
│       ├── api/       # API client
│       └── teams/     # Team logo/crest registry
└── backend/           # Express API
    └── src/
        ├── routes/    # auth, matches, commentary
        ├── db/        # Drizzle schema + seed
        └── ws/        # WebSocket server
```

## Getting Started

```bash
# Backend (requires .env with DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD)
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

Frontend runs on `http://localhost:5173`, API on `http://localhost:8000`.

---

