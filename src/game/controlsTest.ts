import { match } from "./match";
import { setQaKeys } from "./input";

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getX: () => number;
      getZ: () => number;
      setKeys: (codes: string[]) => void;
      snap: () => void;
    };
  }
}

export function installControlsTest() {
  if (typeof window === "undefined") return;
  window.__controlsTest = {
    getYaw: () => {
      const p = match.players[match.control];
      return p?.yaw ?? 0;
    },
    getSpeed: () => {
      const p = match.players[match.control];
      if (!p) return 0;
      return Math.hypot(p.vx, p.vz);
    },
    getX: () => match.players[match.control]?.x ?? 0,
    getZ: () => match.players[match.control]?.z ?? 0,
    setKeys: (codes) => setQaKeys(codes),
    snap: () => {
      if (match.phase === "playcall" || match.phase === "presnap") {
        match.offReady = true;
        match.defReady = true;
        match.trySnap();
      }
    },
  };
}
