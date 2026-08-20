import type { DefPlay, OffPlay, RoutePoint, Slot } from "./types";

const ol = (x: number): Slot => ({ role: "OL", x, z: 0 });

const GUN: Slot[] = [
  { role: "QB", x: 0, z: -5 },
  { role: "RB", x: -2.2, z: -6.2 },
  { role: "WR", x: -22, z: -1 },
  { role: "WR", x: 22, z: -1 },
  { role: "WR", x: -12, z: -1.2 },
  { role: "TE", x: 6.4, z: 0 },
  ol(-4.6),
  ol(-2.2),
  ol(0),
  ol(2.2),
  ol(4.6),
];

const IFORM: Slot[] = [
  { role: "QB", x: 0, z: -3.2 },
  { role: "RB", x: 0, z: -6.4 },
  { role: "WR", x: -20, z: -1 },
  { role: "WR", x: 20, z: -1 },
  { role: "TE", x: -6.4, z: 0 },
  { role: "TE", x: 6.4, z: 0 },
  ol(-4.6),
  ol(-2.2),
  ol(0),
  ol(2.2),
  ol(4.6),
];

const empty = (): RoutePoint[][] => Array.from({ length: 11 }, () => []);

export const OFF_PLAYS: OffPlay[] = [
  {
    id: "izone",
    name: "Inside Zone",
    kind: "run",
    info: "RB hits the A-gap. Steer after the handoff.",
    form: IFORM,
    routes: empty(),
    handoff: 1,
    runHole: { x: 1.2, z: 8 },
  },
  {
    id: "power",
    name: "Power O",
    kind: "run",
    info: "Downhill off-tackle. Follow the pull.",
    form: IFORM,
    routes: empty(),
    handoff: 1,
    runHole: { x: 4.5, z: 9 },
  },
  {
    id: "sweep",
    name: "Toss Sweep",
    kind: "run",
    info: "Stretch the edge. Cut upfield when the hole opens.",
    form: IFORM,
    routes: empty(),
    handoff: 1,
    runHole: { x: 12, z: 6 },
  },
  {
    id: "slants",
    name: "Slants",
    kind: "pass",
    info: "Quick timing. Hit the first window.",
    form: GUN,
    routes: [
      [],
      [{ x: 1, z: 2 }],
      [
        { x: 4, z: 5 },
        { x: 8, z: 7 },
      ],
      [
        { x: -4, z: 5 },
        { x: -8, z: 7 },
      ],
      [
        { x: 3, z: 6 },
        { x: 7, z: 8 },
      ],
      [
        { x: 2, z: 6 },
        { x: 3, z: 12 },
      ],
      [],
      [],
      [],
      [],
      [],
    ],
    handoff: 1,
    runHole: { x: 0, z: 4 },
  },
  {
    id: "smash",
    name: "Smash",
    kind: "pass",
    info: "Hitch outside, corner behind it.",
    form: GUN,
    routes: [
      [],
      [{ x: -3, z: 1 }],
      [
        { x: 0, z: 6 },
        { x: 0, z: 6 },
      ],
      [
        { x: -2, z: 10 },
        { x: -8, z: 16 },
      ],
      [
        { x: 0, z: 12 },
        { x: 0, z: 22 },
      ],
      [
        { x: 2, z: 8 },
        { x: 6, z: 14 },
      ],
      [],
      [],
      [],
      [],
      [],
    ],
    handoff: 1,
    runHole: { x: 0, z: 4 },
  },
  {
    id: "verts",
    name: "Four Verts",
    kind: "pass",
    info: "Clear-out go routes. Hold, then launch.",
    form: GUN,
    routes: [
      [],
      [
        { x: 2, z: 4 },
        { x: 4, z: 8 },
      ],
      [{ x: 0, z: 28 }],
      [{ x: 0, z: 28 }],
      [{ x: 0, z: 26 }],
      [
        { x: 1, z: 10 },
        { x: 1, z: 22 },
      ],
      [],
      [],
      [],
      [],
      [],
    ],
    handoff: 1,
    runHole: { x: 0, z: 4 },
  },
  {
    id: "boot",
    name: "PA Boot",
    kind: "pass",
    info: "Fake the dive, roll out. Throw on the run.",
    form: IFORM,
    routes: [
      [],
      [
        { x: 2, z: 3 },
        { x: 2, z: 6 },
      ],
      [
        { x: 2, z: 8 },
        { x: 6, z: 14 },
      ],
      [
        { x: -1, z: 12 },
        { x: -4, z: 20 },
      ],
      [
        { x: 4, z: 6 },
        { x: 10, z: 8 },
      ],
      [
        { x: 3, z: 8 },
        { x: 8, z: 10 },
      ],
      [],
      [],
      [],
      [],
      [],
    ],
    handoff: 1,
    runHole: { x: 2, z: 5 },
  },
  {
    id: "screen",
    name: "RB Screen",
    kind: "pass",
    info: "Sell the drop, dump it to the back.",
    form: GUN,
    routes: [
      [],
      [
        { x: -6, z: -1 },
        { x: -8, z: 2 },
      ],
      [{ x: 0, z: 16 }],
      [{ x: 0, z: 16 }],
      [{ x: 2, z: 14 }],
      [{ x: 0, z: 12 }],
      [],
      [],
      [],
      [],
      [],
    ],
    handoff: 1,
    runHole: { x: -8, z: 6 },
  },
];

const FRONT: Slot[] = [
  { role: "DL", x: -6, z: 1.1 },
  { role: "DL", x: -2, z: 1.0 },
  { role: "DL", x: 2, z: 1.0 },
  { role: "DL", x: 6, z: 1.1 },
  { role: "LB", x: -4.5, z: 4.2 },
  { role: "LB", x: 0, z: 4.6 },
  { role: "LB", x: 4.5, z: 4.2 },
  { role: "CB", x: -20, z: 5 },
  { role: "CB", x: 20, z: 5 },
  { role: "S", x: -8, z: 12 },
  { role: "S", x: 8, z: 12 },
];

const GL: Slot[] = [
  { role: "DL", x: -5, z: 0.8 },
  { role: "DL", x: -1.6, z: 0.7 },
  { role: "DL", x: 1.6, z: 0.7 },
  { role: "DL", x: 5, z: 0.8 },
  { role: "LB", x: -7, z: 2.4 },
  { role: "LB", x: 0, z: 2.6 },
  { role: "LB", x: 7, z: 2.4 },
  { role: "CB", x: -16, z: 3.5 },
  { role: "CB", x: 16, z: 3.5 },
  { role: "S", x: -4, z: 6 },
  { role: "S", x: 4, z: 6 },
];

export const DEF_PLAYS: DefPlay[] = [
  {
    id: "c2",
    name: "Cover 2",
    kind: "zone",
    info: "Two deep safeties. Corners squat.",
    form: FRONT,
    cover: ["blitz", "blitz", "blitz", "blitz", "zone", "zone", "zone", "zone", "zone", "zone", "zone"],
    zones: [
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: -10, z: 8 },
      { x: 0, z: 7 },
      { x: 10, z: 8 },
      { x: -20, z: 7 },
      { x: 20, z: 7 },
      { x: -10, z: 16 },
      { x: 10, z: 16 },
    ],
  },
  {
    id: "c3",
    name: "Cover 3",
    kind: "zone",
    info: "Three deep. Tight windows downfield.",
    form: FRONT,
    cover: ["blitz", "blitz", "blitz", "blitz", "zone", "zone", "zone", "zone", "zone", "zone", "zone"],
    zones: [
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: -8, z: 7 },
      { x: 0, z: 6 },
      { x: 8, z: 7 },
      { x: -20, z: 16 },
      { x: 20, z: 16 },
      { x: 0, z: 16 },
      { x: 8, z: 10 },
    ],
  },
  {
    id: "c1",
    name: "Cover 1",
    kind: "man",
    info: "Man under, free safety help.",
    form: FRONT,
    cover: ["blitz", "blitz", "blitz", "blitz", "man", "man", "man", "man", "man", "zone", "spy"],
    zones: [
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 14 },
      { x: 0, z: 6 },
    ],
  },
  {
    id: "blitz",
    name: "Fire Blitz",
    kind: "blitz",
    info: "Six-man pressure. Beat the throw.",
    form: FRONT,
    cover: ["blitz", "blitz", "blitz", "blitz", "blitz", "blitz", "man", "man", "man", "zone", "man"],
    zones: [
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 0 },
      { x: 0, z: 13 },
      { x: 0, z: 0 },
    ],
  },
  {
    id: "gl",
    name: "Goal Line",
    kind: "man",
    info: "Packed box. Stuff the dive.",
    form: GL,
    cover: ["blitz", "blitz", "blitz", "blitz", "blitz", "blitz", "man", "man", "man", "man", "man"],
    zones: Array.from({ length: 11 }, () => ({ x: 0, z: 2 })),
  },
];

export function offById(id: string): OffPlay {
  return OFF_PLAYS.find((p) => p.id === id) ?? OFF_PLAYS[0];
}

export function defById(id: string): DefPlay {
  return DEF_PLAYS.find((p) => p.id === id) ?? DEF_PLAYS[0];
}

export function cpuOffense(down: number, toGo: number, fieldPos: number): OffPlay {
  const red = fieldPos > 35;
  if (down === 4 && toGo <= 2) return OFF_PLAYS[1];
  if (down >= 3 && toGo >= 7) return red ? OFF_PLAYS[4] : OFF_PLAYS[5];
  if (down >= 3 && toGo <= 2) return OFF_PLAYS[0];
  if (toGo <= 2) return OFF_PLAYS[Math.random() < 0.6 ? 0 : 1];
  const bag = [0, 1, 2, 3, 4, 5, 6, 7];
  return OFF_PLAYS[bag[Math.floor(Math.random() * bag.length)]];
}

export function cpuDefense(down: number, toGo: number, fieldPos: number): DefPlay {
  if (fieldPos > 42) return DEF_PLAYS[4];
  if (down >= 3 && toGo >= 8) return DEF_PLAYS[1];
  if (down >= 3 && toGo <= 3) return Math.random() < 0.45 ? DEF_PLAYS[3] : DEF_PLAYS[2];
  return DEF_PLAYS[Math.floor(Math.random() * 4)];
}
