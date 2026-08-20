export type Role = "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "CB" | "S";
export type TeamId = "iron" | "frost" | "outlaws" | "tide";
export type Screen =
  | "title"
  | "mode"
  | "howto"
  | "lobby"
  | "playing"
  | "final";
export type MatchPhase =
  | "playcall"
  | "presnap"
  | "live"
  | "whistle"
  | "kick"
  | "final";

export interface TeamInfo {
  id: TeamId;
  city: string;
  name: string;
  abbr: string;
  primary: string;
  secondary: string;
  accent: string;
  helmet: string;
}

export interface Vec2 {
  x: number;
  z: number;
}

export interface RoutePoint extends Vec2 {
  wait?: number;
}

export interface Slot {
  role: Role;
  x: number;
  z: number;
}

export type OffKind = "run" | "pass";
export type DefKind = "zone" | "man" | "blitz";

export interface OffPlay {
  id: string;
  name: string;
  kind: OffKind;
  info: string;
  form: Slot[];
  routes: RoutePoint[][];
  handoff: number;
  runHole: Vec2;
}

export interface DefPlay {
  id: string;
  name: string;
  kind: DefKind;
  info: string;
  form: Slot[];
  cover: Array<"man" | "zone" | "blitz" | "spy">;
  zones: Vec2[];
}

export interface Player {
  id: number;
  team: 0 | 1;
  role: Role;
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  yaw: number;
  maxSpeed: number;
  stamina: number;
  fallen: number;
  route: RoutePoint[] | null;
  routeI: number;
  origin: Vec2;
  cover: "man" | "zone" | "blitz" | "spy" | "block" | "route" | "idle";
  assign: number;
  zone: Vec2;
  caught: number;
}

export interface Ball {
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  vy: number;
  carrier: number;
  flight: number;
  target: number;
}

export interface MatchSnap {
  phase: MatchPhase;
  quarter: number;
  clock: number;
  playClock: number;
  down: number;
  toGo: number;
  los: number;
  firstZ: number;
  poss: 0 | 1;
  score: [number, number];
  banner: string;
  result: string;
  userOff: boolean;
  control: number;
  qb: number;
  recIds: number[];
  canThrow: boolean;
  canKick: boolean;
  kickPower: number;
  kickLock: boolean;
  twoMin: boolean;
}
