import { create } from "zustand";
import type { MatchSnap, Screen, TeamId } from "./types";
import { match } from "./match";

export interface GameStore {
  screen: Screen;
  mode: "solo" | "p2p";
  homeId: TeamId;
  awayId: TeamId;
  roomCode: string;
  displayName: string;
  isHost: boolean;
  hud: MatchSnap;
  tick: number;
  pendingPlay: string | null;
  setScreen: (s: Screen) => void;
  setMode: (m: "solo" | "p2p") => void;
  setTeams: (home: TeamId, away: TeamId) => void;
  setRoom: (code: string, host: boolean) => void;
  setName: (n: string) => void;
  sync: () => void;
  startSolo: () => void;
  setPendingPlay: (id: string | null) => void;
}

export const useGame = create<GameStore>((set) => ({
  screen: "title",
  mode: "solo",
  homeId: "iron",
  awayId: "frost",
  roomCode: "",
  displayName: "Coach",
  isHost: true,
  hud: match.snapshot(),
  tick: 0,
  pendingPlay: null,
  setScreen: (screen) => set({ screen }),
  setMode: (mode) => set({ mode }),
  setTeams: (homeId, awayId) => set({ homeId, awayId }),
  setRoom: (roomCode, isHost) => set({ roomCode, isHost }),
  setName: (displayName) => set({ displayName }),
  sync: () => set((s) => ({ hud: match.snapshot(), tick: s.tick + 1 })),
  startSolo: () => {
    match.p2pHost = true;
    match.p2pMode = false;
    match.localTeam = 0;
    match.resetGame(0);
    set({ screen: "playing", mode: "solo", isHost: true, hud: match.snapshot() });
  },
  setPendingPlay: (pendingPlay) => set({ pendingPlay }),
}));
