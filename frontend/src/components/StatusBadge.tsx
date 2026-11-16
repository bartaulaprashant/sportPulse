import type { Match } from "../api/client";

export default function StatusBadge({ status }: { status: Match["status"] }) {
  const label = status === "live" ? "LIVE" : status === "scheduled" ? "UPCOMING" : "FT";
  return <span className={`badge badge-${status}`}>{label}</span>;
}
