import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { match } from "../match";
import { teamById } from "../teams";
import { useGame } from "../store";

const torso = new THREE.BoxGeometry(0.52, 0.5, 0.3);
const pad = new THREE.BoxGeometry(0.78, 0.2, 0.36);
const helmet = new THREE.SphereGeometry(0.2, 14, 12);
const visor = new THREE.BoxGeometry(0.22, 0.07, 0.14);
const hip = new THREE.BoxGeometry(0.46, 0.2, 0.28);
const limb = new THREE.CapsuleGeometry(0.075, 0.32, 4, 8);
const foot = new THREE.BoxGeometry(0.12, 0.07, 0.22);
const shadow = new THREE.CircleGeometry(0.42, 14);
helmet.translate(0, 0.02, 0.02);

function makeMat(color: string, rough = 0.62) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: rough,
    metalness: 0.08,
  });
}

export function Players() {
  const homeId = useGame((s) => s.homeId);
  const awayId = useGame((s) => s.awayId);
  const home = teamById(homeId);
  const away = teamById(awayId);

  const mats = useMemo(() => {
    return {
      hJ: makeMat(home.primary, 0.7),
      hP: makeMat(home.secondary, 0.55),
      hH: makeMat(home.helmet, 0.35),
      aJ: makeMat(away.primary, 0.7),
      aP: makeMat(away.secondary, 0.55),
      aH: makeMat(away.helmet, 0.35),
      visor: makeMat("#0a0c10", 0.15),
      skin: makeMat("#c4a882", 0.7),
      shoe: makeMat("#141414", 0.5),
      shadow: new THREE.MeshBasicMaterial({
        color: "#000000",
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
      ctrl: new THREE.MeshBasicMaterial({
        color: "#e8eaee",
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    };
  }, [home, away]);

  const group = useMemo(() => new THREE.Group(), []);

  useFrame(() => {
    const n = match.players.length;
    while (group.children.length < n) {
      const g = buildPlayer();
      group.add(g);
    }
    for (let i = 0; i < n; i++) {
      const p = match.players[i];
      const g = group.children[i] as THREE.Group;
      g.visible = true;
      g.position.set(p.x, p.fallen > 0 ? 0.12 : 0, p.z);
      g.rotation.y = p.yaw;
      g.rotation.x = p.fallen > 0 ? 1.15 : 0;
      const spd = Math.hypot(p.vx, p.vz);
      const swing = Math.sin(performance.now() * 0.018 * (0.6 + spd)) * Math.min(0.8, spd * 0.18);
      const leftLeg = g.children[5];
      const rightLeg = g.children[6];
      const leftArm = g.children[7];
      const rightArm = g.children[8];
      if (leftLeg) leftLeg.rotation.x = swing;
      if (rightLeg) rightLeg.rotation.x = -swing;
      if (leftArm) leftArm.rotation.x = -swing * 0.7;
      if (rightArm) rightArm.rotation.x = swing * 0.7;
      const jersey = p.team === 0 ? mats.hJ : mats.aJ;
      const pants = p.team === 0 ? mats.hP : mats.aP;
      const helm = p.team === 0 ? mats.hH : mats.aH;
      applyMat(g.children[0], jersey);
      applyMat(g.children[1], jersey);
      applyMat(g.children[2], helm);
      applyMat(g.children[3], mats.visor);
      applyMat(g.children[4], pants);
      applyMat(g.children[5], pants);
      applyMat(g.children[6], pants);
      applyMat(g.children[7], jersey);
      applyMat(g.children[8], jersey);
      const ring = g.children[9] as THREE.Mesh;
      ring.visible = p.id === match.control;
      const sh = g.children[10] as THREE.Mesh;
      sh.scale.setScalar(p.id === match.ball.carrier ? 1.25 : 1);
    }
    for (let i = n; i < group.children.length; i++) group.children[i].visible = false;
  });

  return <primitive object={group} />;
}

function applyMat(obj: THREE.Object3D, mat: THREE.Material) {
  obj.traverse((ch) => {
    if (ch instanceof THREE.Mesh) ch.material = mat;
  });
}

function buildPlayer() {
  const g = new THREE.Group();
  const t = new THREE.Mesh(torso);
  t.position.set(0, 1.12, 0);
  const pds = new THREE.Mesh(pad);
  pds.position.set(0, 1.32, 0);
  const h = new THREE.Mesh(helmet);
  h.position.set(0, 1.58, 0.04);
  const v = new THREE.Mesh(visor);
  v.position.set(0, 1.56, 0.16);
  const hp = new THREE.Mesh(hip);
  hp.position.set(0, 0.82, 0);
  const ll = new THREE.Mesh(limb);
  ll.position.set(-0.14, 0.42, 0);
  const rl = new THREE.Mesh(limb);
  rl.position.set(0.14, 0.42, 0);
  const la = new THREE.Mesh(limb);
  la.position.set(-0.38, 1.12, 0);
  la.rotation.z = 0.55;
  const ra = new THREE.Mesh(limb);
  ra.position.set(0.38, 1.12, 0);
  ra.rotation.z = -0.55;
  const ring = new THREE.Mesh(shadow);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  ring.scale.setScalar(1.15);
  const sh = new THREE.Mesh(shadow);
  sh.rotation.x = -Math.PI / 2;
  sh.position.y = 0.02;
  g.add(t, pds, h, v, hp, ll, rl, la, ra, ring, sh);
  const lf = new THREE.Mesh(foot);
  lf.position.set(-0.14, 0.04, 0.04);
  const rf = new THREE.Mesh(foot);
  rf.position.set(0.14, 0.04, 0.04);
  ll.add(lf);
  rl.add(rf);
  return g;
}

export function BallMesh() {
  const geo = useMemo(() => new THREE.SphereGeometry(0.16, 12, 10), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#6b3a22",
        roughness: 0.55,
        metalness: 0.05,
      }),
    [],
  );
  const mesh = useMemo(() => {
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(0.85, 0.62, 1.35);
    return m;
  }, [geo, mat]);
  useFrame(() => {
    mesh.position.set(match.ball.x, match.ball.y, match.ball.z);
    mesh.rotation.x += 0.08;
  });
  return <primitive object={mesh} />;
}
