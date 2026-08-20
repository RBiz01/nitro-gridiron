let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let crowd: AudioBufferSourceNode | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function unlockAudio() {
  const c = ac();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  startCrowd();
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, at = 0) {
  const c = ac();
  if (!c || !master) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = c.currentTime + at;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, gain: number, hp = 200, lp = 1800) {
  const c = ac();
  if (!c || !master) return;
  const n = c.sampleRate * dur;
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = (hp + lp) / 2;
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(master);
  src.start();
}

export function sfx(kind: "hike" | "hit" | "catch" | "whistle" | "td" | "ui" | "kick" | "crowdup") {
  unlockAudio();
  switch (kind) {
    case "hike":
      noise(0.12, 0.28, 400, 2400);
      tone(180, 0.08, "square", 0.08);
      break;
    case "hit":
      noise(0.18, 0.4, 80, 600);
      tone(90, 0.12, "sine", 0.18);
      break;
    case "catch":
      noise(0.08, 0.22, 300, 900);
      tone(220, 0.07, "triangle", 0.1);
      break;
    case "whistle":
      tone(1680, 0.16, "sine", 0.12);
      tone(1480, 0.2, "sine", 0.1, 0.14);
      break;
    case "td":
      tone(523, 0.18, "triangle", 0.12);
      tone(659, 0.2, "triangle", 0.12, 0.12);
      tone(784, 0.35, "triangle", 0.14, 0.24);
      noise(0.6, 0.18, 200, 2000);
      break;
    case "ui":
      tone(640, 0.05, "square", 0.05);
      break;
    case "kick":
      noise(0.15, 0.3, 100, 700);
      tone(140, 0.1, "sine", 0.12);
      break;
    case "crowdup":
      noise(0.8, 0.16, 250, 1600);
      break;
  }
}

function startCrowd() {
  const c = ac();
  if (!c || !master || crowd) return;
  const n = c.sampleRate * 2;
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.35;
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 900;
  const g = c.createGain();
  g.gain.value = 0.045;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start();
  crowd = src;
}
