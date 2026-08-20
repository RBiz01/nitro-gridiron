import { match } from "../match";
import { useGame } from "../store";

export function Pause() {
  const tick = useGame((s) => s.tick);
  void tick;
  if (!match.paused) return null;
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-bg/80 px-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-2xl tracking-wide text-fg">Paused</h2>
        <p className="mt-1 text-sm text-muted">Clock holds. Drive stays spotted.</p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            className="min-h-12 rounded-md bg-fg text-sm font-medium text-bg"
            onClick={() => {
              match.paused = false;
              useGame.getState().sync();
            }}
          >
            Resume
          </button>
          <button
            type="button"
            className="min-h-12 rounded-md border border-border text-sm font-medium text-fg"
            onClick={() => {
              match.paused = false;
              useGame.getState().setScreen("title");
            }}
          >
            Quit to menu
          </button>
        </div>
      </div>
    </div>
  );
}
