import { lazy, Suspense, useEffect, useState } from "react";
import { useGame } from "../store";
import { HowTo, ModePick, Title } from "./Title";
import { Lobby, NetBridge } from "./Lobby";
import { HUD } from "./HUD";
import { PlayCall } from "./PlayCall";
import { TouchPad } from "./TouchPad";
import { Pause } from "./Pause";
import { match } from "../match";

const GameCanvas = lazy(() => import("../scene/GameCanvas"));

export function FootballApp() {
  const screen = useGame((s) => s.screen);
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);

  return (
    <div className="stage">
      {screen === "title" && <Title />}
      {screen === "mode" && <ModePick />}
      {screen === "howto" && <HowTo />}
      {screen === "lobby" && <Lobby />}
      {screen === "playing" && client && <PlayStage />}
      {screen === "final" && client && <PlayStage />}
    </div>
  );
}

function PlayStage() {
  const hud = useGame((s) => s.hud);
  useEffect(() => {
    match.paused = false;
  }, []);
  return (
    <div className="relative h-full w-full overflow-hidden bg-bg touch-none">
      <Suspense fallback={<div className="absolute inset-0 bg-bg" />}>
        <GameCanvas />
      </Suspense>
      <HUD />
      <PlayCall />
      <TouchPad />
      <Pause />
      <NetBridge />
      {hud.phase === "final" ? null : null}
    </div>
  );
}
