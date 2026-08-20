import { DEF_PLAYS, OFF_PLAYS } from "../plays";
import { match } from "../match";
import { sfx } from "../audio";
import { useGame } from "../store";
import { DefArt, OffArt } from "./PlayArt";

export function PlayCall() {
  const hud = useGame((s) => s.hud);
  if (hud.phase !== "playcall") return null;
  const offense = hud.userOff;

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-bg/78 pt-[max(72px,env(safe-area-inset-top))] backdrop-blur-[2px]">
      <div className="px-4">
        <p className="font-display text-[11px] tracking-[0.32em] text-muted">
          {offense ? "OFFENSE" : "DEFENSE"} · {hud.down === 1 ? "1ST" : hud.down === 2 ? "2ND" : hud.down === 3 ? "3RD" : "4TH"} & {hud.toGo}
        </p>
        <h2 className="font-display text-2xl tracking-wide text-fg">
          {offense ? "Call a play" : "Call a coverage"}
        </h2>
      </div>
      <div className="mt-3 grid flex-1 grid-cols-2 content-start gap-2 overflow-y-auto px-3 pb-6">
        {offense
          ? OFF_PLAYS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="flex min-h-[7.5rem] flex-col rounded-md border border-border bg-surface p-2 text-left text-fg"
                onClick={() => {
                  sfx("ui");
                  const { mode, isHost, setPendingPlay } = useGame.getState();
                  if (mode === "p2p" && !isHost) setPendingPlay(p.id);
                  match.callOffense(p.id);
                }}
              >
                <span className="font-display text-sm tracking-wide">{p.name}</span>
                <span className="text-[10px] tracking-[0.14em] text-muted uppercase">{p.kind}</span>
                <div className="mt-1 h-16 text-fg/80">
                  <OffArt play={p} />
                </div>
              </button>
            ))
          : DEF_PLAYS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="flex min-h-[7.5rem] flex-col rounded-md border border-border bg-surface p-2 text-left text-fg"
                onClick={() => {
                  sfx("ui");
                  const { mode, isHost, setPendingPlay } = useGame.getState();
                  if (mode === "p2p" && !isHost) setPendingPlay(p.id);
                  match.callDefense(p.id);
                }}
              >
                <span className="font-display text-sm tracking-wide">{p.name}</span>
                <span className="text-[10px] tracking-[0.14em] text-muted uppercase">{p.kind}</span>
                <div className="mt-1 h-16 text-fg/80">
                  <DefArt play={p} />
                </div>
              </button>
            ))}
      </div>
      {hud.canKick && offense && (
        <div className="px-3 pb-[max(16px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            className="min-h-12 w-full rounded-md border border-border bg-elevated text-sm font-medium text-fg"
            onClick={() => {
              sfx("ui");
              match.startKick();
            }}
          >
            Kick field goal
          </button>
        </div>
      )}
    </div>
  );
}
