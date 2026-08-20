import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { Link } from "@tanstack/react-router";
import { unlockAudio, sfx } from "../audio";
import { useGame } from "../store";

export function Title() {
  const startSolo = useGame((s) => s.startSolo);
  const setScreen = useGame((s) => s.setScreen);
  const { user, isPending } = useCurrentUserState();

  const go = (fn: () => void) => {
    unlockAudio();
    sfx("ui");
    fn();
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg">
      <img
        src="/title-hero.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_30%] opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/55 to-bg" />
      <header className="relative z-10 flex items-center justify-between px-4 pt-[max(14px,env(safe-area-inset-top))]">
        <p className="font-display text-[11px] tracking-[0.32em] text-muted">NIGHT SERIES</p>
        {isPending ? (
          <div className="h-8 w-8 animate-pulse rounded-full bg-elevated" />
        ) : user ? (
          <button
            type="button"
            className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-border bg-surface text-[11px] text-fg"
            onClick={() => void signOut()}
            aria-label="Sign out"
          >
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              (user.displayName ?? "C").charAt(0)
            )}
          </button>
        ) : (
          <Link
            to="/login"
            className="grid h-8 place-items-center rounded-full border border-border px-3 text-[10px] tracking-[0.14em] text-fg"
          >
            Sign in
          </Link>
        )}
      </header>
      <div className="relative z-10 mt-auto px-5 pb-[max(28px,env(safe-area-inset-bottom))]">
        <p className="font-display text-[13px] tracking-[0.38em] text-muted">POCKET BROADCAST</p>
        <h1 className="mt-1 font-display text-[3.4rem] leading-[0.9] tracking-wide text-fg">
          NITRO
          <br />
          GRIDIRON
        </h1>
        <p className="mt-3 max-w-[18rem] text-sm leading-snug text-muted">
          Call the play. Drive the field. Vertical pro football built for one hand.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            className="min-h-12 rounded-md bg-fg text-sm font-medium text-bg"
            onClick={() => go(startSolo)}
          >
            Play now
          </button>
          <button
            type="button"
            className="min-h-12 rounded-md border border-border bg-surface/80 text-sm font-medium text-fg"
            onClick={() =>
              go(() => {
                setScreen("mode");
              })
            }
          >
            Versus · Join code
          </button>
          <button
            type="button"
            className="min-h-11 text-sm text-muted"
            onClick={() =>
              go(() => {
                setScreen("howto");
              })
            }
          >
            How to play
          </button>
        </div>
      </div>
    </div>
  );
}

export function ModePick() {
  const setScreen = useGame((s) => s.setScreen);
  const startSolo = useGame((s) => s.startSolo);
  const setMode = useGame((s) => s.setMode);
  return (
    <div className="flex h-full flex-col bg-bg px-5 pt-[max(24px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]">
      <button
        type="button"
        className="self-start text-sm text-muted"
        onClick={() => setScreen("title")}
      >
        Back
      </button>
      <h2 className="mt-6 font-display text-3xl tracking-wide text-fg">Choose a drive</h2>
      <p className="mt-2 text-sm text-muted">Solo against the CPU, or share a code with a friend.</p>
      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          className="min-h-16 rounded-lg border border-border bg-surface px-4 py-3 text-left"
          onClick={() => {
            sfx("ui");
            unlockAudio();
            startSolo();
          }}
        >
          <span className="block font-display text-lg text-fg">Solo exhibition</span>
          <span className="text-sm text-muted">Call offense. Play defense when the CPU has the ball.</span>
        </button>
        <button
          type="button"
          className="min-h-16 rounded-lg border border-border bg-surface px-4 py-3 text-left"
          onClick={() => {
            sfx("ui");
            setMode("p2p");
            setScreen("lobby");
          }}
        >
          <span className="block font-display text-lg text-fg">Pass and play</span>
          <span className="text-sm text-muted">Create or join a six-character room code.</span>
        </button>
      </div>
    </div>
  );
}

export function HowTo() {
  const setScreen = useGame((s) => s.setScreen);
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bg px-5 pt-[max(24px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]">
      <button type="button" className="self-start text-sm text-muted" onClick={() => setScreen("title")}>
        Back
      </button>
      <h2 className="mt-6 font-display text-3xl tracking-wide text-fg">How to play</h2>
      <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted">
        <li>
          <span className="text-fg">1. Call the play.</span> Pick a run or a pass. Defense picks a coverage.
        </li>
        <li>
          <span className="text-fg">2. Hike.</span> Tap HIKE or press Space. Left stick / WASD moves your player.
        </li>
        <li>
          <span className="text-fg">3. Pass.</span> Tap X Y B A for receivers, or THROW to hit the open man. Sprint to scramble.
        </li>
        <li>
          <span className="text-fg">4. Run.</span> After the handoff, steer the hole. Flick + sprint to juke.
        </li>
        <li>
          <span className="text-fg">5. Defense.</span> SWITCH to the nearest man. Angle tackles; don’t grab air.
        </li>
        <li>
          <span className="text-fg">Scoring.</span> TD 7 (PAT auto), FG 3, Safety 2. Four 90-second quarters.
        </li>
      </ul>
    </div>
  );
}