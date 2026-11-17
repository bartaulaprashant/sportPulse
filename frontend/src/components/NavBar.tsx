import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface NavBarProps {
  sports?: string[];
  sport?: string;
  onSportChange?: (sport: string) => void;
  right?: ReactNode;
}

export default function NavBar({ sports, sport, onSportChange, right }: NavBarProps) {
  return (
    <header className="pub-nav">
      <div className="pub-nav-block pub-nav-left">
        <Link to="/" className="pub-brand">
          <span className="pub-logo-mark" aria-hidden="true">
            <svg
              width="20"
              height="20"
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
            <span className="live-dot" /> Live scores
            <Link to="/admin">Admin</Link>
          </>
        )}
      </div>
    </header>
  );
}
