import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { bindInput, consumeThrowTo, pollInput } from "../input";
import { match } from "../match";
import { useGame } from "../store";
import { installControlsTest } from "../controlsTest";
import { BallMesh, Players } from "./Players";
import { Markers, Stadium } from "./Stadium";

function Loop() {
  const sync = useGame((s) => s.sync);
  const acc = useRef(0);
  const hudAcc = useRef(0);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    if (useGame.getState().screen !== "playing") return;
    if (match.paused) return;
    const input = pollInput();
    const throwTo = consumeThrowTo();
    if (match.p2pMode && !match.p2pHost) {
      hudAcc.current += dt;
      if (hudAcc.current > 0.08) {
        hudAcc.current = 0;
        sync();
      }
      return;
    }
    acc.current += dt;
    const step = 1 / 60;
    while (acc.current >= step) {
      match.update(step, input, throwTo);
      acc.current -= step;
    }
    hudAcc.current += dt;
    if (hudAcc.current > 0.08) {
      hudAcc.current = 0;
      sync();
    }
  });
  return null;
}

function CameraRig() {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(0, 16, -22));
  const look = useRef(new THREE.Vector3(0, 0, 0));
  const target = useRef(new THREE.Vector3());
  const lookT = useRef(new THREE.Vector3());

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.1);
    const atk = match.attack();
    const bx = match.ball.x;
    const bz = match.ball.z;
    const presnap = match.phase === "presnap" || match.phase === "playcall";
    const h = presnap ? 16 : 12.5;
    const back = presnap ? 18 : 13;
    const ahead = presnap ? 20 : 15;
    target.current.set(bx * 0.28, h, bz - atk * back);
    lookT.current.set(bx * 0.18, 0.4, bz + atk * ahead);
    const k = 1 - Math.exp(-3.2 * dt);
    pos.current.lerp(target.current, k);
    look.current.lerp(lookT.current, k);
    const shake = match.trauma * match.trauma;
    const ox = (Math.random() - 0.5) * shake * 0.45;
    const oy = (Math.random() - 0.5) * shake * 0.25;
    camera.position.set(pos.current.x + ox, pos.current.y + oy, pos.current.z);
    camera.lookAt(look.current);
  });
  return null;
}

function Lights() {
  return (
    <>
      <color attach="background" args={["#0a1016"]} />
      <fog attach="fog" args={["#0d141c", 70, 170]} />
      <ambientLight intensity={0.62} color="#b7c4d4" />
      <hemisphereLight args={["#8ea4bc", "#2a5a3c", 0.7]} />
      <directionalLight
        position={[18, 42, 12]}
        intensity={1.85}
        color="#fff4dc"
        castShadow={false}
      />
      <directionalLight position={[-22, 18, -16]} intensity={0.45} color="#7e96b4" />
      <spotLight position={[0, 34, 0]} intensity={1.1} angle={0.85} penumbra={0.45} color="#fff6de" />
    </>
  );
}

export default function GameCanvas() {
  useEffect(() => {
    bindInput();
    installControlsTest();
  }, []);

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ fov: 42, near: 0.1, far: 220, position: [0, 16, -22] }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        gl.setClearColor("#07090c");
      }}
    >
      <Lights />
      <Stadium />
      <Markers />
      <Players />
      <BallMesh />
      <CameraRig />
      <Loop />
    </Canvas>
  );
}
