import { cpuDefense, cpuOffense, defById, offById } from "./plays";
import { sfx } from "./audio";
import type { Actions } from "./input";
import type { Ball, DefPlay, MatchSnap, OffPlay, Player, Role } from "./types";

export const HALF_W = 26.4;
export const EZ = 10;
export const GOAL_H = -50;
export const GOAL_A = 50;
export const QLEN = 90;

const SPEEDS: Record<Role, number> = {
  QB: 7.4,
  RB: 8.3,
  WR: 8.7,
  TE: 7.2,
  OL: 5.4,
  DL: 6.2,
  LB: 7.6,
  CB: 8.6,
  S: 8.1,
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function dist(ax: number, az: number, bx: number, bz: number) {
  return Math.hypot(ax - bx, az - bz);
}
function ang(dx: number, dz: number) {
  return Math.atan2(dx, dz);
}

function yardsToGain(poss: 0 | 1, fromZ: number, firstZ: number) {
  return poss === 0 ? firstZ - fromZ : fromZ - firstZ;
}

function yardLineLabel(z: number) {
  const fromHome = clamp(z - GOAL_H, 0, 100);
  if (fromHome <= 0) return "H EZ";
  if (fromHome >= 100) return "A EZ";
  if (fromHome < 50) return `STL ${Math.round(fromHome)}`;
  if (fromHome > 50) return `VIS ${Math.round(100 - fromHome)}`;
  return "50";
}

export class Match {
  players: Player[] = [];
  ball: Ball = {
    x: 0,
    z: -15,
    y: 1.1,
    vx: 0,
    vz: 0,
    vy: 0,
    carrier: 0,
    flight: 0,
    target: -1,
  };
  phase: MatchSnap["phase"] = "playcall";
  quarter = 1;
  clock = QLEN;
  playClock = 22;
  down = 1;
  toGo = 10;
  los = -15;
  firstZ = -5;
  poss: 0 | 1 = 0;
  score: [number, number] = [0, 0];
  banner = "";
  result = "";
  localTeam: 0 | 1 = 0;
  control = 0;
  offPlay: OffPlay = offById("izone");
  defPlay: DefPlay = defById("c2");
  offReady = false;
  defReady = false;
  liveT = 0;
  whistleT = 0;
  contact = 0;
  trauma = 0;
  kickPower = 0;
  kickDir = 0;
  kickLock = false;
  lastThrow = -1;
  userPickedOff = false;
  userPickedDef = false;
  twoMin = false;
  lastJuke = 0;
  jukeCD = 0;
  recIds: number[] = [];
  qb = 0;
  paused = false;
  p2pHost = true;
  p2pMode = false;
  remoteMoveX = 0;
  remoteMoveY = 0;
  remoteSprint = false;
  remoteAction = false;
  remoteThrow = -1;
  ended = false;
  clockRun = false;
  lastSpot = -15;

  resetGame(localTeam: 0 | 1 = 0) {
    this.localTeam = localTeam;
    this.score = [0, 0];
    this.quarter = 1;
    this.clock = QLEN;
    this.poss = 0;
    this.down = 1;
    this.toGo = 10;
    this.los = -15;
    this.firstZ = -5;
    this.ended = false;
    this.phase = "playcall";
    this.banner = "";
    this.offReady = false;
    this.defReady = false;
    this.userPickedOff = false;
    this.userPickedDef = false;
    this.kickLock = false;
    this.spawnPlay();
  }

  attack(): number {
    return this.poss === 0 ? 1 : -1;
  }

  userOnOffense(): boolean {
    return this.poss === this.localTeam;
  }

  spawnPlay() {
    const atk = this.attack();
    this.players = [];
    const off = this.offPlay;
    const def = this.defPlay;
    for (let i = 0; i < 11; i++) {
      const s = off.form[i];
      this.players.push(this.mk(i, this.poss, s.role, s.x, s.z, atk, true));
    }
    const defTeam: 0 | 1 = this.poss === 0 ? 1 : 0;
    for (let i = 0; i < 11; i++) {
      const s = def.form[i];
      this.players.push(this.mk(11 + i, defTeam, s.role, s.x, s.z, atk, false));
    }
    this.qb = this.players.find((p) => p.team === this.poss && p.role === "QB")?.id ?? 0;
    this.ball.carrier = this.qb;
    this.ball.flight = 0;
    this.ball.target = -1;
    this.ball.y = 1.15;
    this.syncBallToCarrier();
    this.recIds = this.players
      .filter((p) => p.team === this.poss && (p.role === "WR" || p.role === "TE" || p.role === "RB"))
      .map((p) => p.id);
    this.control = this.userOnOffense() ? this.qb : this.nearestDefender();
    this.liveT = 0;
    this.contact = 0;
    this.playClock = 22;
  }

  private mk(
    id: number,
    team: 0 | 1,
    role: Role,
    ox: number,
    oz: number,
    atk: number,
    offense: boolean,
  ): Player {
    const x = atk > 0 ? ox : -ox;
    const z = this.los + oz * atk;
    return {
      id,
      team,
      role,
      x,
      z,
      y: 0,
      vx: 0,
      vz: 0,
      yaw: atk > 0 ? 0 : Math.PI,
      maxSpeed: SPEEDS[role],
      stamina: 1,
      fallen: 0,
      route: null,
      routeI: 0,
      origin: { x, z },
      cover: offense ? "idle" : "idle",
      assign: -1,
      zone: { x, z },
      caught: 0,
    };
  }

  callOffense(id: string) {
    this.offPlay = offById(id);
    this.offReady = true;
    this.userPickedOff = true;
    this.spawnPlay();
  }

  callDefense(id: string) {
    this.defPlay = defById(id);
    this.defReady = true;
    this.userPickedDef = true;
    this.spawnPlay();
  }

  maybeCpuCalls() {
    if (this.p2pMode) return;
    const fp = this.poss === 0 ? this.los - GOAL_H : GOAL_A - this.los;
    if (this.userOnOffense()) {
      if (!this.defReady) {
        this.defPlay = cpuDefense(this.down, this.toGo, fp);
        this.defReady = true;
        this.spawnPlay();
      }
    } else if (this.p2pHost) {
      if (!this.offReady) {
        this.offPlay = cpuOffense(this.down, this.toGo, fp);
        this.offReady = true;
        this.spawnPlay();
      }
      if (!this.userPickedDef && !this.defReady) {
        this.defPlay = cpuDefense(this.down, this.toGo, fp);
        this.defReady = true;
        this.spawnPlay();
      }
    }
  }

  trySnap() {
    if (this.phase !== "presnap" && this.phase !== "playcall") return;
    if (!this.offReady || !this.defReady) return;
    this.armRoutes();
    this.phase = "live";
    this.liveT = 0;
    this.clockRun = true;
    this.ball.carrier = this.qb;
    this.control = this.userOnOffense() ? this.qb : this.nearestDefender();
    sfx("hike");
  }

  private armRoutes() {
    const atk = this.attack();
    for (let i = 0; i < 11; i++) {
      const p = this.players[i];
      const pts = this.offPlay.routes[i] ?? [];
      p.origin = { x: p.x, z: p.z };
      p.routeI = 0;
      p.route =
        pts.length > 0
          ? pts.map((pt) => ({
              x: p.x + (atk > 0 ? pt.x : -pt.x),
              z: p.z + pt.z * atk,
            }))
          : null;
      p.cover = p.role === "OL" ? "block" : p.route ? "route" : "idle";
    }
    const wr = this.players.filter((p) => p.team === this.poss && (p.role === "WR" || p.role === "TE"));
    for (let i = 0; i < 11; i++) {
      const p = this.players[11 + i];
      const kind = this.defPlay.cover[i];
      p.cover = kind;
      const zn = this.defPlay.zones[i];
      p.zone = {
        x: atk > 0 ? zn.x : -zn.x,
        z: this.los + zn.z * atk,
      };
      if (kind === "man" && wr.length) {
        p.assign = wr[i % wr.length].id;
      }
    }
  }

  throwTo(pid: number) {
    const rec = this.players[pid];
    const qb = this.players[this.qb];
    if (!rec || !qb) return;
    if (this.phase !== "live") return;
    if (this.ball.carrier !== this.qb) return;
    if (this.ball.flight > 0) return;
    const atk = this.attack();
    const crossed = atk > 0 ? qb.z > this.los + 0.4 : qb.z < this.los - 0.4;
    if (crossed) return;
    const d = dist(qb.x, qb.z, rec.x, rec.z);
    const spd = 24;
    const t = clamp(d / spd, 0.35, 2.1);
    const lead = 0.85;
    const tx = rec.x + rec.vx * t * lead;
    const tz = rec.z + rec.vz * t * lead;
    this.ball.carrier = -1;
    this.ball.target = pid;
    this.ball.flight = t;
    this.ball.vx = (tx - this.ball.x) / t;
    this.ball.vz = (tz - this.ball.z) / t;
    this.ball.vy = 4.2 + d * 0.12;
    this.lastThrow = pid;
    sfx("kick");
  }

  switchDefender() {
    if (this.userOnOffense()) return;
    const defs = this.players
      .filter((p) => p.team !== this.poss && p.fallen <= 0)
      .sort((a, b) => dist(a.x, a.z, this.ball.x, this.ball.z) - dist(b.x, b.z, this.ball.x, this.ball.z));
    if (!defs.length) return;
    const i = defs.findIndex((p) => p.id === this.control);
    this.control = defs[(i + 1) % defs.length].id;
  }

  nearestDefender(): number {
    let best = 11;
    let bd = 1e9;
    for (const p of this.players) {
      if (p.team === this.poss) continue;
      const d = dist(p.x, p.z, this.ball.x, this.ball.z);
      if (d < bd) {
        bd = d;
        best = p.id;
      }
    }
    return best;
  }

  startKick() {
    this.phase = "kick";
    this.kickPower = 0;
    this.kickLock = false;
    this.kickDir = 0;
  }

  canFieldGoal(): boolean {
    const goal = this.poss === 0 ? GOAL_A : GOAL_H;
    const distYds = Math.abs(goal - this.los) + 17;
    return this.down === 4 && distYds <= 48;
  }

  attemptKick(power: number) {
    const goal = this.poss === 0 ? GOAL_A : GOAL_H;
    const distYds = Math.abs(goal - this.los) + 17;
    const acc = 1 - Math.abs(power - 0.72) * 1.6;
    const range = 1 - clamp((distYds - 28) / 28, 0, 1) * 0.55;
    const good = acc * range > 0.28 && power > 0.28;
    sfx("kick");
    if (good) {
      this.score[this.poss] += 3;
      this.banner = `${Math.round(distYds)} YD FIELD GOAL`;
      this.result = "FIELD GOAL";
      sfx("td");
      this.afterScore();
    } else {
      this.banner = "NO GOOD";
      this.result = "MISSED FG";
      this.changePoss(this.los);
    }
  }

  private afterScore() {
    this.score[this.poss] += 0;
    this.phase = "whistle";
    this.whistleT = 2.4;
    this.clockRun = false;
    const next: 0 | 1 = this.poss === 0 ? 1 : 0;
    this.poss = next;
    this.down = 1;
    this.toGo = 10;
    this.los = next === 0 ? -25 : 25;
    this.firstZ = this.los + 10 * (next === 0 ? 1 : -1);
  }

  private changePoss(atZ: number) {
    this.phase = "whistle";
    this.whistleT = 1.8;
    this.clockRun = false;
    this.poss = this.poss === 0 ? 1 : 0;
    this.down = 1;
    this.toGo = 10;
    this.los = clamp(atZ, GOAL_H + 1, GOAL_A - 1);
    this.firstZ = clamp(this.los + 10 * this.attack(), GOAL_H + 1, GOAL_A - 1);
  }

  private endPlay(kind: string, spotZ: number, spotX: number) {
    if (this.phase !== "live") return;
    this.phase = "whistle";
    this.whistleT = 1.85;
    this.clockRun = false;
    this.result = kind;
    this.lastSpot = spotZ;
    sfx("whistle");

    const atk = this.attack();
    const td = atk > 0 ? spotZ >= GOAL_A : spotZ <= GOAL_H;
    const safety =
      this.ball.carrier >= 0 &&
      ((this.poss === 0 && spotZ <= GOAL_H && kind === "TACKLE") ||
        (this.poss === 1 && spotZ >= GOAL_A && kind === "TACKLE"));

    if (kind === "INT") {
      this.banner = "INTERCEPTION";
      this.changePoss(spotZ);
      return;
    }
    if (td && kind !== "INCOMPLETE") {
      this.score[this.poss] += 7;
      this.banner = "TOUCHDOWN";
      this.result = "TOUCHDOWN";
      sfx("td");
      this.trauma = 0.85;
      this.afterScore();
      return;
    }
    if (safety) {
      const other: 0 | 1 = this.poss === 0 ? 1 : 0;
      this.score[other] += 2;
      this.banner = "SAFETY";
      this.changePoss(other === 0 ? -25 : 25);
      return;
    }
    if (kind === "INCOMPLETE") {
      this.banner = "INCOMPLETE";
      this.nextDown(this.los);
      return;
    }
    if (kind === "OOB" || kind === "TACKLE" || kind === "SACK") {
      const gained = atk > 0 ? spotZ - this.los : this.los - spotZ;
      const first = yardsToGain(this.poss, spotZ, this.firstZ) <= 0.35;
      this.banner =
        gained >= 0.4 ? `+${gained.toFixed(0)} YARDS` : `${gained.toFixed(0)} YARDS`;
      if (kind === "SACK") this.banner = `SACK  ${this.banner}`;
      if (first) {
        this.los = clamp(spotZ, GOAL_H + 0.5, GOAL_A - 0.5);
        this.firstZ = clamp(this.los + 10 * atk, GOAL_H + 1, GOAL_A);
        this.down = 1;
        this.toGo = 10;
        this.banner = `FIRST DOWN  ${this.banner}`;
        sfx("crowdup");
      } else {
        this.los = clamp(spotZ, GOAL_H + 0.5, GOAL_A - 0.5);
        this.nextDown(this.los);
      }
    }
    void spotX;
  }

  private nextDown(spotZ: number) {
    if (this.down >= 4) {
      this.banner = "TURNOVER ON DOWNS";
      this.changePoss(spotZ);
      return;
    }
    this.down += 1;
    this.toGo = Math.max(1, Math.round(yardsToGain(this.poss, this.los, this.firstZ)));
    this.phase = "whistle";
    this.whistleT = Math.max(this.whistleT, 1.3);
  }

  update(dt: number, input: Actions, throwTo: number) {
    if (this.paused || this.ended) return;
    const d = Math.min(dt, 0.05);
    this.trauma = Math.max(0, this.trauma - d * 1.6);

    if (this.phase === "playcall") {
      this.maybeCpuCalls();
      if (this.offReady && this.defReady) {
        this.phase = "presnap";
        this.playClock = 18;
      }
      return;
    }

    if (this.phase === "presnap") {
      this.playClock -= d;
      if (input.justAction || this.remoteAction || this.playClock <= 0) this.trySnap();
      this.idleBreathe(d);
      this.syncBallToCarrier();
      return;
    }

    if (this.phase === "kick") {
      if (!this.kickLock) {
        this.kickPower = (this.kickPower + d * 0.7) % 1;
        if (input.justAction || input.justKick) {
          this.kickLock = true;
          this.attemptKick(this.kickPower);
        }
      }
      return;
    }

    if (this.phase === "whistle") {
      this.whistleT -= d;
      this.settle(d);
      if (this.whistleT <= 0) {
        if (this.clock <= 0) this.advanceQuarter();
        else {
          this.phase = "playcall";
          this.offReady = false;
          this.defReady = false;
          this.userPickedOff = false;
          this.userPickedDef = false;
          this.banner = "";
          this.spawnPlay();
        }
      }
      return;
    }

    if (this.phase === "final") return;

    if (this.phase === "live") {
      this.liveT += d;
      if (this.clockRun) {
        this.clock = Math.max(0, this.clock - d);
        if (this.clock <= 0) {
          this.endPlay(this.ball.flight > 0 ? "INCOMPLETE" : "TACKLE", this.ball.z, this.ball.x);
          return;
        }
      }
      if (throwTo >= 0) this.throwTo(throwTo);
      if (this.p2pMode && this.remoteThrow >= 0) {
        this.throwTo(this.remoteThrow);
        this.remoteThrow = -1;
      }
      if (input.justAction && this.userOnOffense() && this.ball.carrier === this.qb) {
        const open = this.bestReceiver();
        if (open >= 0 && this.liveT > 0.55) this.throwTo(open);
      }
      if (input.justSwitch) this.switchDefender();
      this.stepPlayers(d, input);
      this.stepBall(d);
      this.collisions(d);
      this.checkBounds();
    }
  }

  private idleBreathe(dt: number) {
    for (const p of this.players) {
      p.y = Math.sin(performance.now() * 0.004 + p.id) * 0.02;
      p.vx *= 1 - 6 * dt;
      p.vz *= 1 - 6 * dt;
    }
  }

  private settle(dt: number) {
    for (const p of this.players) {
      p.vx *= 1 - 8 * dt;
      p.vz *= 1 - 8 * dt;
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.fallen = Math.max(0, p.fallen - dt);
    }
    this.syncBallToCarrier();
  }

  private stepPlayers(dt: number, input: Actions) {
    const atk = this.attack();
    const qb = this.players[this.qb];
    const carrier =
      this.ball.carrier >= 0 ? this.players[this.ball.carrier] : null;

    if (
      this.offPlay.kind === "run" &&
      this.ball.carrier === this.qb &&
      this.liveT > 0.28
    ) {
      const hb = this.players[this.offPlay.handoff];
      if (hb && dist(qb.x, qb.z, hb.x, hb.z) < 1.6) {
        this.ball.carrier = hb.id;
        if (this.userOnOffense()) this.control = hb.id;
        sfx("catch");
      }
    }

    this.jukeCD = Math.max(0, this.jukeCD - dt);
    const flick = Math.hypot(input.moveX, input.moveY) > 0.85 && input.sprint;
    if (flick && this.jukeCD <= 0 && carrier && carrier.id === this.control) {
      this.lastJuke = 0.28;
      this.jukeCD = 0.9;
    }
    this.lastJuke = Math.max(0, this.lastJuke - dt);

    for (const p of this.players) {
      if (p.fallen > 0) {
        p.fallen -= dt;
        p.vx *= 1 - 10 * dt;
        p.vz *= 1 - 10 * dt;
        p.x += p.vx * dt;
        p.z += p.vz * dt;
        continue;
      }

      let tx = 0;
      let tz = 0;
      let want = p.maxSpeed * 0.55;
      const user = p.id === this.control;
        const remoteUser = this.p2pMode && p.id === this.remoteControl();
        const drive = user ? input : remoteUser ? this.remoteActions() : null;

        if (drive) {
          const fx = 0;
          const fz = atk;
          const rx = -atk;
          const rz = 0;
          // camForward = (0, atk), camRight = (-atk, 0)
          tx = rx * drive.moveX + fx * drive.moveY;
          tz = rz * drive.moveX + fz * drive.moveY;
          const mag = Math.hypot(tx, tz);
          want = p.maxSpeed * (drive.sprint && p.stamina > 0.05 ? 1.22 : 0.92);
          if (mag < 0.08) {
            tx = 0;
            tz = 0;
          }
          p.stamina = clamp(p.stamina + (drive.sprint ? -0.22 : 0.18) * dt, 0, 1);
          if (this.lastJuke > 0 && carrier?.id === p.id) {
            const jx = rx * (drive.moveX >= 0 ? 1 : -1);
            tx += jx * 1.4;
            want *= 1.15;
          }
        } else if (p.team === this.poss) {
        if (p.id === this.ball.carrier && p.role !== "QB") {
          const holeX = this.los * 0 + (atk > 0 ? this.offPlay.runHole.x : -this.offPlay.runHole.x);
          const holeZ = this.los + this.offPlay.runHole.z * atk;
          if (this.liveT < 1.1) {
            tx = holeX - p.x;
            tz = holeZ - p.z;
          } else {
            tx = this.avoid(p, 0) * 0.6;
            tz = atk * 8;
          }
          want = p.maxSpeed * 0.95;
        } else if (p.role === "QB") {
          if (this.offPlay.kind === "pass" && this.ball.carrier === p.id) {
            const drop = this.los - 6.5 * atk;
            tx = (this.offPlay.id === "boot" ? 7 * (atk > 0 ? 1 : -1) : 0) - p.x * 0.15;
            tz = drop - p.z;
            want = 5.2;
            if (this.liveT > 1.7 && this.p2pHost && !this.userOnOffense() && !this.p2pMode) {
              const r = this.bestReceiver();
              if (r >= 0) this.throwTo(r);
            }
          } else if (this.ball.carrier === p.id) {
            tz = atk;
            want = 6.2;
          }
        } else if (p.cover === "route" && p.route && p.routeI < p.route.length) {
          const wp = p.route[p.routeI];
          tx = wp.x - p.x;
          tz = wp.z - p.z;
          want = p.maxSpeed * 0.88;
          if (Math.hypot(tx, tz) < 1.1) p.routeI++;
        } else if (p.cover === "block") {
          const dl = this.closestOpp(p);
          if (dl) {
            tx = (dl.x + qb.x) * 0.5 - p.x;
            tz = (dl.z + qb.z) * 0.5 - p.z;
            want = 5.4;
          }
        } else if (p.role === "RB" && this.offPlay.kind === "run") {
          const hx = atk > 0 ? this.offPlay.runHole.x : -this.offPlay.runHole.x;
          tx = hx - p.x;
          tz = this.los + 1.5 * atk - p.z;
          want = 7.4;
        }
      } else {
        // defense AI
        if (p.cover === "blitz" || (carrier && carrier.role !== "QB" && p.role !== "CB")) {
          const tgt = carrier ?? qb;
          tx = tgt.x - p.x;
          tz = tgt.z - p.z;
          want = p.maxSpeed * (p.cover === "blitz" ? 0.96 : 0.82);
        } else if (p.cover === "man" && p.assign >= 0) {
          const wr = this.players[p.assign];
          if (wr) {
            tx = wr.x - p.x;
            tz = wr.z - atk * 1.4 - p.z;
            want = p.maxSpeed * 0.9;
          }
        } else if (p.cover === "zone" || p.cover === "spy") {
          const zx = p.zone.x;
          const zz = p.zone.z;
          if (this.ball.flight > 0) {
            tx = this.ball.x - p.x;
            tz = this.ball.z - p.z;
            want = p.maxSpeed;
          } else if (carrier && carrier.role !== "QB" && dist(p.x, p.z, carrier.x, carrier.z) < 9) {
            tx = carrier.x - p.x;
            tz = carrier.z - p.z;
            want = p.maxSpeed * 0.92;
          } else {
            tx = zx - p.x;
            tz = zz - p.z;
            want = 6.2;
          }
        }
      }

      this.steer(p, tx, tz, want, dt);
      p.x = clamp(p.x, -HALF_W + 0.4, HALF_W - 0.4);
      p.z = clamp(p.z, GOAL_H - EZ + 0.4, GOAL_A + EZ - 0.4);
      if (Math.hypot(p.vx, p.vz) > 0.4) p.yaw = ang(p.vx, p.vz);
    }

    this.separate(dt);
  }

  private avoid(p: Player, _side: number) {
    let push = 0;
    for (const o of this.players) {
      if (o.id === p.id || o.team === p.team) continue;
      const d = dist(p.x, p.z, o.x, o.z);
      if (d < 2.2 && d > 0.01) {
        push += ((p.x - o.x) / d) * (2.2 - d);
      }
    }
    return push;
  }

  private steer(p: Player, tx: number, tz: number, want: number, dt: number) {
    const mag = Math.hypot(tx, tz);
    let ax = 0;
    let az = 0;
    if (mag > 0.05) {
      ax = (tx / mag) * want;
      az = (tz / mag) * want;
    }
    const acc = 22;
    p.vx = lerp(p.vx, ax, 1 - Math.exp(-acc * dt * 0.12));
    p.vz = lerp(p.vz, az, 1 - Math.exp(-acc * dt * 0.12));
    const spd = Math.hypot(p.vx, p.vz);
    if (spd > want) {
      p.vx *= want / spd;
      p.vz *= want / spd;
    }
    p.x += p.vx * dt;
    p.z += p.vz * dt;
  }

  private closestOpp(p: Player): Player | null {
    let b: Player | null = null;
    let bd = 1e9;
    for (const o of this.players) {
      if (o.team === p.team) continue;
      const d = dist(p.x, p.z, o.x, o.z);
      if (d < bd) {
        bd = d;
        b = o;
      }
    }
    return b;
  }

  private separate(dt: number) {
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const a = this.players[i];
        const b = this.players[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const d = Math.hypot(dx, dz);
        const min = a.role === "OL" || b.role === "OL" ? 0.95 : 0.78;
        if (d > 0.001 && d < min) {
          const push = ((min - d) / min) * 0.5;
          const nx = dx / d;
          const nz = dz / d;
          a.x -= nx * push;
          a.z -= nz * push;
          b.x += nx * push;
          b.z += nz * push;
          a.vx -= nx * 4 * dt;
          a.vz -= nz * 4 * dt;
          b.vx += nx * 4 * dt;
          b.vz += nz * 4 * dt;
        }
      }
    }
  }

  private stepBall(dt: number) {
    if (this.ball.carrier >= 0) {
      this.syncBallToCarrier();
      return;
    }
    if (this.ball.flight > 0) {
      this.ball.x += this.ball.vx * dt;
      this.ball.z += this.ball.vz * dt;
      this.ball.vy -= 9.2 * dt;
      this.ball.y += this.ball.vy * dt;
      this.ball.flight -= dt;
      if (this.ball.y < 1.05) {
        this.tryCatch();
      }
      if (this.ball.y < 0.25 || this.ball.flight <= -0.15) {
        if (this.phase === "live") this.endPlay("INCOMPLETE", this.los, this.ball.x);
      }
    }
  }

  private tryCatch() {
    let best = -1;
    let bd = 1.55;
    for (const p of this.players) {
      if (p.role === "OL" || p.role === "DL") continue;
      const d = dist(p.x, p.z, this.ball.x, this.ball.z);
      if (d < bd) {
        bd = d;
        best = p.id;
      }
    }
    if (best < 0) return;
    const p = this.players[best];
    this.ball.carrier = best;
    this.ball.flight = 0;
    this.ball.y = 1.15;
    p.caught = 0.4;
    sfx("catch");
    if (p.team !== this.poss) {
      this.endPlay("INT", p.z, p.x);
      return;
    }
    if (this.userOnOffense()) this.control = p.id;
  }

  private collisions(dt: number) {
    if (this.ball.carrier < 0) return;
    const c = this.players[this.ball.carrier];
    if (!c) return;
    for (const d of this.players) {
      if (d.team === c.team || d.fallen > 0) continue;
      const gap = dist(c.x, c.z, d.x, d.z);
      if (gap < 0.95) {
        const rel = Math.hypot(c.vx - d.vx, c.vz - d.vz);
        this.contact += dt * (1.1 + rel * 0.15);
        d.vx += (d.x - c.x) * 8 * dt;
        d.vz += (d.z - c.z) * 8 * dt;
        if (this.lastJuke > 0 && gap > 0.55) {
          this.contact *= 0.4;
        }
        if (this.contact > 0.26) {
          const sack = c.role === "QB" && this.offPlay.kind === "pass";
          c.fallen = 0.7;
          d.fallen = 0.25;
          this.trauma = sack ? 0.7 : 0.45;
          sfx("hit");
          this.contact = 0;
          this.endPlay(sack ? "SACK" : "TACKLE", c.z, c.x);
          return;
        }
      }
    }
    this.contact = Math.max(0, this.contact - dt * 0.35);
  }

  private checkBounds() {
    const c = this.ball.carrier >= 0 ? this.players[this.ball.carrier] : null;
    if (!c) return;
    if (Math.abs(c.x) >= HALF_W - 0.45) {
      this.endPlay("OOB", c.z, c.x);
      return;
    }
    const atk = this.attack();
    if (atk > 0 && c.z >= GOAL_A) this.endPlay("TACKLE", c.z, c.x);
    if (atk < 0 && c.z <= GOAL_H) this.endPlay("TACKLE", c.z, c.x);
  }

  private bestReceiver(): number {
    const qb = this.players[this.qb];
    let best = -1;
    let score = -1e9;
    for (const id of this.recIds) {
      const r = this.players[id];
      if (!r) continue;
      let sep = 12;
      for (const d of this.players) {
        if (d.team === r.team) continue;
        sep = Math.min(sep, dist(r.x, r.z, d.x, d.z));
      }
      const downfield = (r.z - qb.z) * this.attack();
      const s = sep * 2 + downfield * 0.15 - Math.abs(r.x - qb.x) * 0.04;
      if (s > score) {
        score = s;
        best = id;
      }
    }
    return best;
  }

  private syncBallToCarrier() {
    if (this.ball.carrier < 0) return;
    const p = this.players[this.ball.carrier];
    if (!p) return;
    this.ball.x = p.x + Math.sin(p.yaw) * 0.35;
    this.ball.z = p.z + Math.cos(p.yaw) * 0.28;
    this.ball.y = 1.05 + Math.sin(this.liveT * 12) * 0.02;
  }

  private remoteControl(): number {
    const guestTeam: 0 | 1 = this.localTeam === 0 ? 1 : 0;
    if (this.poss === guestTeam) {
      return this.ball.carrier >= 0 ? this.ball.carrier : this.qb;
    }
    return this.nearestDefender();
  }

  private remoteActions(): Actions {
    return {
      moveX: this.remoteMoveX,
      moveY: this.remoteMoveY,
      sprint: this.remoteSprint,
      action: this.remoteAction,
      switchP: false,
      justAction: false,
      justSwitch: false,
      kick: false,
      justKick: false,
    };
  }

  private advanceQuarter() {
    if (this.quarter >= 4) {
      this.phase = "final";
      this.ended = true;
      this.banner =
        this.score[0] === this.score[1]
          ? "FINAL  TIE"
          : this.score[0] > this.score[1]
            ? "FINAL  HOME WINS"
            : "FINAL  AWAY WINS";
      return;
    }
    this.quarter += 1;
    this.clock = QLEN;
    if (this.quarter === 3) {
      this.poss = 1;
      this.down = 1;
      this.toGo = 10;
      this.los = 15;
      this.firstZ = 5;
      this.banner = "THIRD QUARTER";
    } else {
      this.banner = `QUARTER ${this.quarter}`;
    }
    this.phase = "playcall";
    this.offReady = false;
    this.defReady = false;
    this.spawnPlay();
  }

  snapshot(): MatchSnap {
    return {
      phase: this.phase,
      quarter: this.quarter,
      clock: this.clock,
      playClock: this.playClock,
      down: this.down,
      toGo: this.toGo,
      los: this.los,
      firstZ: this.firstZ,
      poss: this.poss,
      score: [this.score[0], this.score[1]],
      banner: this.banner,
      result: this.result,
      userOff: this.userOnOffense(),
      control: this.control,
      qb: this.qb,
      recIds: this.recIds.slice(),
      canThrow: this.phase === "live" && this.ball.carrier === this.qb && this.userOnOffense(),
      canKick: this.canFieldGoal(),
      kickPower: this.kickPower,
      kickLock: this.kickLock,
      twoMin: this.clock <= 30 && this.quarter % 2 === 0,
    };
  }

  yardLabel() {
    return yardLineLabel(this.los);
  }

  netDump() {
    return {
      phase: this.phase,
      quarter: this.quarter,
      clock: this.clock,
      playClock: this.playClock,
      down: this.down,
      toGo: this.toGo,
      los: this.los,
      firstZ: this.firstZ,
      poss: this.poss,
      score: this.score,
      banner: this.banner,
      control: this.control,
      offId: this.offPlay.id,
      defId: this.defPlay.id,
      ball: { ...this.ball },
      players: this.players.map((p) => ({
        id: p.id,
        x: p.x,
        z: p.z,
        yaw: p.yaw,
        vx: p.vx,
        vz: p.vz,
        fallen: p.fallen,
      })),
    };
  }

  netApply(data: ReturnType<Match["netDump"]>) {
    this.phase = data.phase;
    this.quarter = data.quarter;
    this.clock = data.clock;
    this.playClock = data.playClock;
    this.down = data.down;
    this.toGo = data.toGo;
    this.los = data.los;
    this.firstZ = data.firstZ;
    this.poss = data.poss;
    this.score = [data.score[0], data.score[1]];
    this.banner = data.banner;
    this.control = data.control;
    this.offPlay = offById(data.offId);
    this.defPlay = defById(data.defId);
    Object.assign(this.ball, data.ball);
    for (const n of data.players) {
      const p = this.players[n.id];
      if (!p) continue;
      p.x = n.x;
      p.z = n.z;
      p.yaw = n.yaw;
      p.vx = n.vx;
      p.vz = n.vz;
      p.fallen = n.fallen;
    }
  }
}

export const match = new Match();
