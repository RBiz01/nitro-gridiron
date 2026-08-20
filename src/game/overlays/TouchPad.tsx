import { useRef } from "react";
import { touch } from "../input";
import { match } from "../match";
import { useGame } from "../store";

export function TouchPad() {
  const hud = useGame((s) => s.hud);
  const live = hud.phase === "live" || hud.phase === "presnap";
  if (!live && hud.phase !== "kick") return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-[max(12px,env(safe-area-inset-bottom))]">
      {hud.phase === "kick" && <KickMeter />}
      {hud.canThrow && <ReceiverRow ids={hud.recIds} />}
      <div className="flex items-end justify-between px-3 pt-2">
        <Stick />
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {hud.phase === "presnap" && (
            <PadBtn label="HIKE" sub="snap" wide onDown={() => match.trySnap()} />
          )}
          {hud.phase === "live" && hud.userOff && (
            <PadBtn
              label={hud.canThrow ? "THROW" : "JUKE"}
              sub={hud.canThrow ? "pass" : "burst"}
              onDown={() => {
                touch.action = true;
              }}
              onUp={() => {
                touch.action = false;
              }}
            />
          )}
          {hud.phase === "live" && !hud.userOff && (
            <PadBtn
              label="SWITCH"
              sub="defender"
              onDown={() => {
                touch.switchP = true;
                match.switchDefender();
              }}
              onUp={() => {
                touch.switchP = false;
              }}
            />
          )}
          <PadBtn
            label="SPRINT"
            sub="hold"
            hold
            onDown={() => {
              touch.sprint = true;
            }}
            onUp={() => {
              touch.sprint = false;
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ReceiverRow({ ids }: { ids: number[] }) {
  const labels = ["X", "Y", "B", "A"];
  return (
    <div className="pointer-events-auto mb-1 flex justify-center gap-2 px-4">
      {ids.slice(0, 4).map((id, i) => (
        <button
          key={id}
          type="button"
          className="min-h-11 min-w-11 rounded-sm border border-border bg-surface/80 px-3 text-xs font-medium tracking-wide text-fg"
          onPointerDown={(e) => {
            e.preventDefault();
            touch.throwTo = id;
            match.throwTo(id);
          }}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}

function KickMeter() {
  const p = useGame((s) => s.hud.kickPower);
  return (
    <div className="pointer-events-auto mx-auto mb-3 w-[70%] max-w-xs">
      <p className="mb-1 text-center text-[10px] tracking-[0.2em] text-muted uppercase">
        Field goal — tap to kick
      </p>
      <button
        type="button"
        className="relative h-3 w-full overflow-hidden rounded-sm border border-border bg-surface"
        onPointerDown={() => match.attemptKick(match.kickPower)}
      >
        <span
          className="absolute inset-y-0 left-0 bg-fg/80"
          style={{ width: `${Math.round(p * 100)}%` }}
        />
        <span className="absolute top-0 h-full w-0.5 bg-accent" style={{ left: "72%" }} />
      </button>
    </div>
  );
}

function PadBtn({
  label,
  sub,
  onDown,
  onUp,
  wide,
  hold,
}: {
  label: string;
  sub: string;
  onDown: () => void;
  onUp?: () => void;
  wide?: boolean;
  hold?: boolean;
}) {
  return (
    <button
      type="button"
      className={`min-h-14 rounded-full border border-border bg-surface/85 text-fg shadow-hud ${wide ? "min-w-28 px-5" : "min-w-16 px-3"}`}
      onPointerDown={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
        onDown();
      }}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={hold ? onUp : undefined}
    >
      <span className="block text-[11px] font-semibold tracking-[0.16em]">{label}</span>
      <span className="block text-[9px] text-muted uppercase">{sub}</span>
    </button>
  );
}

function Stick() {
  const ref = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const pid = useRef<number | null>(null);

  const setFrom = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = (clientX - cx) / (r.width * 0.42);
    let dy = (clientY - cy) / (r.height * 0.42);
    const m = Math.hypot(dx, dy);
    if (m > 1) {
      dx /= m;
      dy /= m;
    }
    touch.moveX = dx;
    touch.moveY = -dy;
    if (knob.current) {
      knob.current.style.transform = `translate(${dx * 28}px, ${dy * 28}px)`;
    }
  };

  const clear = () => {
    pid.current = null;
    touch.moveX = 0;
    touch.moveY = 0;
    if (knob.current) knob.current.style.transform = "translate(0,0)";
  };

  return (
    <div
      ref={ref}
      className="pointer-events-auto relative h-[118px] w-[118px] touch-none rounded-full border border-border bg-surface/55"
      onPointerDown={(e) => {
        e.preventDefault();
        pid.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFrom(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (pid.current !== e.pointerId) return;
        setFrom(e.clientX, e.clientY);
      }}
      onPointerUp={clear}
      onPointerCancel={clear}
    >
      <div
        ref={knob}
        className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border-strong bg-fg/80"
      />
    </div>
  );
}
