import type { CSSProperties } from "react";
import { getTeamDesign, type LogoShape } from "../teams/registry";

const SHAPE_CLASS: Record<LogoShape, string> = {
  shield: "tl-shield",
  circle: "tl-circle",
  hex: "tl-hex",
  badge: "tl-badge",
};

export default function TeamLogo({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) {
  const d = getTeamDesign(name);
  const style: CSSProperties = {
    width: size,
    height: size,
    background: d.secondary
      ? `linear-gradient(135deg, ${d.primary} 55%, ${d.secondary} 55%)`
      : d.primary,
    color: d.ink ?? "#ffffff",
    fontSize: Math.max(10, Math.round(size * 0.34)),
  };
  return (
    <span
      className={`team-logo ${SHAPE_CLASS[d.shape ?? "shield"]}`}
      style={style}
      title={name}
      aria-label={name}
    >
      {d.monogram}
    </span>
  );
}
