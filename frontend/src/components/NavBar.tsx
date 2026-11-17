import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface NavBarProps {
  sports?: string[];
  sport?: string;
  onSportChange?: (sport: string) => void;
  right?: ReactNode;
}

export default function NavBar({ sports, sport, onSportChange, right }: NavBarProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <header className="pub-nav">
      <div className="pub-nav-block pub-nav-left">
        <Link to="/" className="pub-brand">
          <span className="pub-logo-mark" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h4l2.5-6.5 3.5 13 2.5-6.5H21" />
            </svg>
          </span>
          <span className="pub-brand-text">
            sport<span>Pulse</span>
          </span>
        </Link>
      </div>

      <div className="pub-nav-block pub-nav-center">
        {sports && onSportChange && (
          <div className="pub-sport-filters">
            <button
              className={sport === "all" ? "nav-filter active" : "nav-filter"}
              onClick={() => onSportChange("all")}
            >
              All
            </button>
            {sports.map((s) => (
              <button
                key={s}
                className={sport === s ? "nav-filter active" : "nav-filter"}
                onClick={() => onSportChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pub-nav-block pub-nav-right">
        {right ?? (
          <>
            <span className="live-dot" title="Live scores" />
            <button
              type="button"
              className="nav-icon-btn"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Link to="/admin" className="nav-admin-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Admin
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
