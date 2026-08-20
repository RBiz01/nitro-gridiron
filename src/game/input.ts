export interface Actions {
  moveX: number;
  moveY: number;
  sprint: boolean;
  action: boolean;
  switchP: boolean;
  justAction: boolean;
  justSwitch: boolean;
  kick: boolean;
  justKick: boolean;
}

const keys = new Set<string>();
const prev = { action: false, switchP: false, kick: false };

export const touch = {
  moveX: 0,
  moveY: 0,
  sprint: false,
  action: false,
  switchP: false,
  kick: false,
  throwTo: -1,
};

const GAME_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ShiftLeft",
  "ShiftRight",
  "Space",
  "KeyE",
  "KeyQ",
  "KeyF",
  "KeyK",
]);

let bound = false;
const qaKeys = new Set<string>();

export function bindInput() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  const down = (e: KeyboardEvent) => {
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    keys.add(e.code);
  };
  const up = (e: KeyboardEvent) => {
    keys.delete(e.code);
  };
  const clear = () => keys.clear();
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
}

export function setQaKeys(codes: string[]) {
  qaKeys.clear();
  for (const c of codes) qaKeys.add(c);
}

function radial(x: number, y: number, dz = 0.16) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const s = ((m - dz) / (1 - dz)) / m;
  return { x: x * s, y: y * s };
}

export function pollInput(): Actions {
  let mx = touch.moveX;
  let my = touch.moveY;
  const held = (c: string) => keys.has(c) || qaKeys.has(c);
  if (held("KeyA") || held("ArrowLeft")) mx -= 1;
  if (held("KeyD") || held("ArrowRight")) mx += 1;
  if (held("KeyW") || held("ArrowUp")) my += 1;
  if (held("KeyS") || held("ArrowDown")) my -= 1;

  const pads = typeof navigator !== "undefined" ? navigator.getGamepads() : [];
  for (const p of pads) {
    if (!p || p.mapping !== "standard") continue;
    mx += p.axes[0] ?? 0;
    my -= p.axes[1] ?? 0;
    if (p.buttons[0]?.pressed) touch.action = true;
    if (p.buttons[1]?.pressed || p.buttons[7]?.pressed) touch.sprint = true;
    if (p.buttons[2]?.pressed) touch.switchP = true;
    if (p.buttons[3]?.pressed) touch.kick = true;
  }

  const stick = radial(mx, my);
  const action = held("Space") || touch.action;
  const switchP = held("KeyE") || held("KeyQ") || touch.switchP;
  const kick = held("KeyK") || held("KeyF") || touch.kick;
  const sprint = held("ShiftLeft") || held("ShiftRight") || touch.sprint;

  const out: Actions = {
    moveX: Math.max(-1, Math.min(1, stick.x)),
    moveY: Math.max(-1, Math.min(1, stick.y)),
    sprint,
    action,
    switchP,
    justAction: action && !prev.action,
    justSwitch: switchP && !prev.switchP,
    kick,
    justKick: kick && !prev.kick,
  };
  prev.action = action;
  prev.switchP = switchP;
  prev.kick = kick;
  return out;
}

export function consumeThrowTo(): number {
  const t = touch.throwTo;
  touch.throwTo = -1;
  return t;
}
