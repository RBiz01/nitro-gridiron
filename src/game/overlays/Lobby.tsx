import { useEffect, useRef, useState } from "react";
import { useP2PRoom } from "@/lib/multiplayer/use-p2p-room";
import { sfx, unlockAudio } from "../audio";
import { touch } from "../input";
import { match } from "../match";
import { useGame } from "../store";

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  return s;
}

export function Lobby() {
  const setScreen = useGame((s) => s.setScreen);
  const setRoom = useGame((s) => s.setRoom);
  const name = useGame((s) => s.displayName);
  const setName = useGame((s) => s.setName);
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState("");
  const [host, setHost] = useState(false);

  const create = () => {
    unlockAudio();
    sfx("ui");
    const c = makeCode();
    setCode(c);
    setHost(true);
    setJoined(c);
    setRoom(c, true);
  };

  const join = () => {
    const c = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    if (c.length < 4) return;
    unlockAudio();
    sfx("ui");
    setHost(false);
    setJoined(c);
    setRoom(c, false);
  };

  if (joined) {
    return <LiveLobbyInner key={joined} code={joined} host={host} name={name || "Coach"} />;
  }

  return (
    <div className="flex h-full flex-col bg-bg px-5 pt-[max(24px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]">
      <button type="button" className="self-start text-sm text-muted" onClick={() => setScreen("mode")}>
        Back
      </button>
      <h2 className="mt-6 font-display text-3xl tracking-wide text-fg">Pass and play</h2>
      <p className="mt-2 text-sm text-muted">
        Both phones enter the same code. Host is home, guest is away. Casual play among friends.
      </p>
      <label className="mt-6 text-[11px] tracking-[0.2em] text-muted uppercase">Coach name</label>
      <input
        className="mt-1 min-h-12 rounded-md border border-border bg-surface px-3 text-fg"
        value={name}
        maxLength={18}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        type="button"
        className="mt-6 min-h-12 rounded-md bg-fg text-sm font-medium text-bg"
        onClick={create}
      >
        Create room
      </button>
      <div className="mt-8 h-px bg-border" />
      <label className="mt-6 text-[11px] tracking-[0.2em] text-muted uppercase">Join with code</label>
      <input
        className="mt-1 min-h-12 rounded-md border border-border bg-surface px-3 font-display tracking-[0.28em] text-fg uppercase"
        value={code}
        maxLength={6}
        placeholder="XXXXXX"
        onChange={(e) => setCode(e.target.value.toUpperCase())}
      />
      <button
        type="button"
        className="mt-3 min-h-12 rounded-md border border-border text-sm font-medium text-fg"
        onClick={join}
      >
        Join room
      </button>
    </div>
  );
}

function LiveLobbyInner({ code, host, name }: { code: string; host: boolean; name: string }) {
  const p2p = useP2PRoom({ room: `ng${code}`.slice(0, 64), name });
  const setScreen = useGame((s) => s.setScreen);
  const connected = p2p.peers.filter((p) => p.connectionState === "connected");
  const failed = p2p.peers.some((p) => p.connectionState === "failed");
  const started = useRef(false);

  useEffect(() => {
    return p2p.onMessage((_from, data) => {
      const msg = data as { t?: string };
      if (msg?.t === "kickoff" && !host) begin(false);
    });
  }, [p2p, host]);

  const begin = (asHost: boolean) => {
    if (started.current) return;
    started.current = true;
    match.p2pHost = asHost;
    match.p2pMode = true;
    match.localTeam = asHost ? 0 : 1;
    match.resetGame(asHost ? 0 : 1);
    useGame.getState().setScreen("playing");
  };

  const start = () => {
    sfx("ui");
    p2p.send({ t: "kickoff" });
    begin(true);
  };

  return (
    <div className="flex h-full flex-col bg-bg px-5 pt-[max(24px,env(safe-area-inset-top))]">
      <button
        type="button"
        className="self-start text-sm text-muted"
        onClick={() => setScreen("title")}
      >
        Leave
      </button>
      <p className="mt-8 text-[11px] tracking-[0.3em] text-muted uppercase">Room code</p>
      <p className="font-display text-5xl tracking-[0.22em] text-fg">{code}</p>
      <p className="mt-2 text-sm text-muted">{host ? "You are home (host)." : "You are away (guest)."}</p>
      <ul className="mt-6 space-y-2 text-sm">
        <li className="rounded-md border border-border bg-surface px-3 py-2 text-fg">You · {name}</li>
        {p2p.peers.map((p) => (
          <li key={p.id} className="rounded-md border border-border bg-surface px-3 py-2 text-fg">
            {p.name || "Coach"} · {p.connectionState}
            {p.rttMs != null && ` · ${Math.round(p.rttMs)}ms`}
          </li>
        ))}
        {p2p.peers.length === 0 && <li className="text-muted">Waiting for the other coach…</li>}
      </ul>
      {failed && (
        <p className="mt-4 text-sm text-muted">
          Direct link failed on this network. Try the same Wi-Fi, or play solo.
        </p>
      )}
      {host ? (
        <button
          type="button"
          disabled={connected.length < 1}
          className="mt-auto mb-8 min-h-12 rounded-md bg-fg text-sm font-medium text-bg disabled:opacity-40"
          onClick={start}
        >
          {connected.length < 1 ? "Waiting for peer" : "Kickoff"}
        </button>
      ) : (
        <p className="mt-auto mb-8 text-center text-sm text-muted">Host starts the game.</p>
      )}
    </div>
  );
}

export function NetBridge() {
  const screen = useGame((s) => s.screen);
  const mode = useGame((s) => s.mode);
  const code = useGame((s) => s.roomCode);
  const name = useGame((s) => s.displayName);
  const isHost = useGame((s) => s.isHost);
  if (screen !== "playing" || mode !== "p2p" || !code) return null;
  return <NetBridgeInner key={code} code={code} name={name} isHost={isHost} />;
}

function NetBridgeInner({
  code,
  name,
  isHost,
}: {
  code: string;
  name: string;
  isHost: boolean;
}) {
  const p2p = useP2PRoom({ room: `ng${code}`.slice(0, 64), name });
  const acc = useRef(0);

  useEffect(() => {
    return p2p.onMessage((_from, data) => {
      const msg = data as Record<string, unknown>;
      if (!msg || typeof msg !== "object") return;
      if (msg.t === "state" && !isHost && msg.s) {
        match.netApply(msg.s as ReturnType<typeof match.netDump>);
      }
      if (msg.t === "input" && isHost) {
        match.remoteMoveX = Number(msg.moveX) || 0;
        match.remoteMoveY = Number(msg.moveY) || 0;
        match.remoteSprint = Boolean(msg.sprint);
        match.remoteAction = Boolean(msg.action);
        if (typeof msg.throwTo === "number" && msg.throwTo >= 0) match.remoteThrow = msg.throwTo;
        if (typeof msg.play === "string") {
          if (match.poss === 1) match.callOffense(msg.play);
          else match.callDefense(msg.play);
        }
      }
    });
  }, [p2p, isHost]);

  useEffect(() => {
    let raf = 0;
    const loop = (now: number) => {
      if (now - acc.current > 50) {
        acc.current = now;
        if (isHost) {
          p2p.broadcast({ t: "state", s: match.netDump() });
        } else {
          const play = useGame.getState().pendingPlay;
          p2p.broadcast({
            t: "input",
            moveX: touch.moveX,
            moveY: touch.moveY,
            sprint: touch.sprint,
            action: touch.action,
            throwTo: touch.throwTo,
            play: play ?? undefined,
          });
          if (play) useGame.getState().setPendingPlay(null);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [p2p, isHost]);

  return null;
}
