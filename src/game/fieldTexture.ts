import * as THREE from "three";

let cached: THREE.CanvasTexture | null = null;

export function makeFieldTexture(): THREE.CanvasTexture {
  if (cached) return cached;
  const w = 1024;
  const h = 2048;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const turfA = "#2f8a4e";
  const turfB = "#277844";
  const stripeH = h / 24;
  for (let i = 0; i < 24; i++) {
    g.fillStyle = i % 2 === 0 ? turfA : turfB;
    g.fillRect(0, i * stripeH, w, stripeH + 1);
  }
  // endzones
  g.fillStyle = "#123a4a";
  g.fillRect(0, 0, w, h * (10 / 120));
  g.fillStyle = "#3a1a1c";
  g.fillRect(0, h * (110 / 120), w, h * (10 / 120));

  g.strokeStyle = "rgba(250,252,246,0.95)";
  g.lineWidth = 5;
  const yard = h / 120;
  for (let yds = 0; yds <= 100; yds += 5) {
    const y = (10 + yds) * yard;
    g.beginPath();
    g.moveTo(w * 0.04, y);
    g.lineTo(w * 0.96, y);
    g.stroke();
  }
  g.lineWidth = 5;
  for (const ez of [10, 110]) {
    g.beginPath();
    g.moveTo(w * 0.02, ez * yard);
    g.lineTo(w * 0.98, ez * yard);
    g.stroke();
  }
  // hashes
  g.lineWidth = 2;
  for (let yds = 1; yds < 100; yds++) {
    if (yds % 5 === 0) continue;
    const y = (10 + yds) * yard;
    for (const x of [0.18, 0.37, 0.63, 0.82]) {
      g.beginPath();
      g.moveTo(w * x - 8, y);
      g.lineTo(w * x + 8, y);
      g.stroke();
    }
  }
  // numbers
  g.fillStyle = "rgba(245,246,242,0.9)";
  g.font = "bold 54px 'Oswald', Impact, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const nums = [10, 20, 30, 40, 50, 40, 30, 20, 10];
  nums.forEach((n, i) => {
    const yds = (i + 1) * 10;
    const y = (10 + yds) * yard;
    const label = String(n);
    g.save();
    g.translate(w * 0.16, y);
    g.rotate(Math.PI / 2);
    g.fillText(label, 0, 0);
    g.restore();
    g.save();
    g.translate(w * 0.84, y);
    g.rotate(-Math.PI / 2);
    g.fillText(label, 0, 0);
    g.restore();
  });
  // endzone words
  g.font = "bold 72px 'Oswald', Impact, sans-serif";
  g.fillStyle = "rgba(197,204,214,0.55)";
  g.save();
  g.translate(w * 0.5, h * (5 / 120));
  g.rotate(Math.PI);
  g.fillText("NITRO", 0, 0);
  g.restore();
  g.fillStyle = "rgba(232,220,214,0.5)";
  g.save();
  g.translate(w * 0.5, h * (115 / 120));
  g.fillText("GRIDIRON", 0, 0);
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  cached = tex;
  return tex;
}
