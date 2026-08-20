import { Menu } from "lucide-react";
import { match } from "../match";
import { teamById } from "../teams";
import { useGame } from "../store";

function clock(n: number) {
  const s = Math.max(0, Math.ceil(n));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

const DOWNS = ["1ST", "2ND", "3RD", "4TH"];

export function HUD() {
  const hud = useGame((s) => s.hud);
  const home = teamById(useGame((s) => s.homeId));
  const away = teamById(useGame((s) => s.awayId));
  const pause = () => {
    match.paused = true;
    useGame.getState().sync();
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 pt-[max(10px,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-md items-stretch gap-1 px-2">
        <TeamChip
          abbr={home.abbr}
          score={hud.score[0]}
          active={hud.poss === 0}
          align="left"
        />
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-md border border-border bg-surface/90 px-2 py-1">
          <div className="flex items-center gap-2 font-display text-[11px] tracking-[0.18em] text-muted">
            <span>Q{hud.quarter}</span>
            <span className="font-mono text-sm tracking-normal text-fg tabular-nums">
              {clock(hud.clock)}
            </span>
          </div>
          <div className="font-display text-[12px] tracking-[0.14em] text-fg">
            {DOWNS[hud.down - 1] ?? "1ST"} & {hud.toGo} · {match.yardLabel()}
          </div>
        </div>
        <TeamChip
          abbr={away.abbr}
          score={hud.score[1]}
          active={hud.poss === 1}
          align="right"
        />
        <button
          type="button"
          className="pointer-events-auto grid h-11 w-11 place-items-center rounded-md border border-border bg-surface/90 text-fg"
          onClick={pause}
          aria-label="Pause"
        >
          <Menu className="size-4" />
        </button>
      </div>
      {hud.phase === "presnap" && (
        <p className="mt-2 text-center font-display text-[11px] tracking-[0.28em] text-muted">
          PLAY CLOCK {Math.ceil(hud.playClock)}
        </p>
      )}
      {hud.banner && hud.phase === "whistle" && (
        <div className="mx-auto mt-6 w-max max-w-[90%] rounded-md border border-border bg-surface px-5 py-2 text-center">
          <p className="font-display text-xl tracking-[0.14em] text-fg">{hud.banner}</p>
          <p className="text-[11px] tracking-[0.2em] text-muted uppercase">{hud.result}</p>
        </div>
      )}
      {hud.phase === "final" && (
        <div className="mx-auto mt-10 w-[min(90%,20rem)] rounded-lg border border-border bg-surface p-5 text-center">
          <p className="font-display text-sm tracking-[0.3em] text-muted">FINAL</p>
          <p className="mt-2 font-display text-3xl tracking-wide text-fg">
            {hud.score[0]} — {hud.score[1]}
          </p>
          <p className="mt-1 text-sm text-muted">{hud.banner}</p>
          <button
            type="button"
            className="pointer-events-auto mt-4 min-h-11 w-full rounded-md bg-fg text-sm font-medium text-bg"
            onClick={() => useGame.getState().setScreen("title")}
          >
            Back to menu
          </button>
        </div>
      )}
    </div>
  );
}

function TeamChip({
  abbr,
  score,
  active,
  align,
}: {
  abbr: string;
  score: number;
  active: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-[4.6rem] items-center gap-2 rounded-md border bg-surface/90 px-2 py-1 ${active ? "border-fg/40" : "border-border"} ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      <span className="font-display text-[11px] tracking-[0.16em] text-muted">{abbr}</span>
      <span className="font-display text-2xl leading-none text-fg tabular-nums">{score}</span>
    </div>
  );
}
