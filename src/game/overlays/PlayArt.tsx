import type { DefPlay, OffPlay } from "../types";

export function OffArt({ play }: { play: OffPlay }) {
  const w = 160;
  const h = 110;
  const sx = (x: number) => 80 + x * 2.4;
  const sy = (z: number) => 78 - z * 3.2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" aria-hidden>
      <rect width={w} height={h} fill="transparent" />
      <line x1={8} y1={78} x2={152} y2={78} stroke="currentColor" strokeOpacity={0.25} />
      {play.form.map((s, i) => {
        const route = play.routes[i] ?? [];
        const d = route
          .map((p, k) => `${k === 0 ? "M" : "L"} ${sx(s.x + p.x)} ${sy(s.z + p.z)}`)
          .join(" ");
        const start = `M ${sx(s.x)} ${sy(s.z)} `;
        return (
          <g key={i}>
            {route.length > 0 && (
              <path
                d={start + d.replace(/^M/, "L")}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.7}
                strokeWidth={1.4}
              />
            )}
            {play.kind === "run" && s.role === "RB" && (
              <path
                d={`M ${sx(s.x)} ${sy(s.z)} L ${sx(play.runHole.x)} ${sy(play.runHole.z)}`}
                fill="none"
                stroke="currentColor"
                strokeDasharray="3 2"
                strokeWidth={1.4}
              />
            )}
            <circle cx={sx(s.x)} cy={sy(s.z)} r={s.role === "OL" ? 2.2 : 3.2} fill="currentColor" />
          </g>
        );
      })}
    </svg>
  );
}

export function DefArt({ play }: { play: DefPlay }) {
  const sx = (x: number) => 80 + x * 2.4;
  const sy = (z: number) => 28 + z * 3.0;
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
      <line x1={8} y1={28} x2={152} y2={28} stroke="currentColor" strokeOpacity={0.25} />
      {play.form.map((s, i) => {
        const kind = play.cover[i];
        const z = play.zones[i];
        return (
          <g key={i}>
            {kind === "zone" && (
              <circle
                cx={sx(z.x)}
                cy={sy(z.z)}
                r={10}
                fill="currentColor"
                fillOpacity={0.08}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
            )}
            <rect
              x={sx(s.x) - 3}
              y={sy(s.z) - 3}
              width={6}
              height={6}
              fill="currentColor"
              opacity={kind === "blitz" ? 1 : 0.75}
            />
          </g>
        );
      })}
    </svg>
  );
}
