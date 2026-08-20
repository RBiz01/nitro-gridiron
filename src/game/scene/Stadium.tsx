import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeFieldTexture } from "../fieldTexture";
import { GOAL_A, GOAL_H, HALF_W, match } from "../match";

export function Stadium() {
  const fieldTex = useMemo(() => makeFieldTexture(), []);
  const fieldMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: fieldTex,
        roughness: 0.78,
        metalness: 0.0,
        emissive: "#163820",
        emissiveIntensity: 0.22,
      }),
    [fieldTex],
  );
  const deck = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#16181d",
        roughness: 0.86,
      }),
    [],
  );
  const seat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a3038",
        roughness: 0.8,
      }),
    [],
  );
  const lightMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f0e6c8",
        emissive: "#f0e6c8",
        emissiveIntensity: 2.2,
      }),
    [],
  );

  const length = GOAL_A - GOAL_H + 20;
  const width = HALF_W * 2 + 4;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[width, length]} />
        <primitive object={fieldMat} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[width + 18, length + 22]} />
        <primitive object={deck} attach="material" />
      </mesh>
      <mesh position={[HALF_W + 10, 4, 0]} rotation={[0, 0, -0.38]}>
        <boxGeometry args={[12, 9, 128]} />
        <primitive object={seat} attach="material" />
      </mesh>
      <mesh position={[-(HALF_W + 10), 4, 0]} rotation={[0, 0, 0.38]}>
        <boxGeometry args={[12, 9, 128]} />
        <primitive object={seat} attach="material" />
      </mesh>
      <Goal z={GOAL_H} />
      <Goal z={GOAL_A} />
      {[
        [-HALF_W - 3, 18, -22],
        [HALF_W + 3, 18, -22],
        [-HALF_W - 3, 18, 22],
        [HALF_W + 3, 18, 22],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[2.2, 1.1, 6]} />
          <primitive object={lightMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function Goal({ z }: { z: number }) {
  const post = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d5d8de",
        metalness: 0.55,
        roughness: 0.28,
      }),
    [],
  );
  return (
    <group position={[0, 0, z]}>
      <mesh position={[-3.1, 5, 0]} material={post}>
        <boxGeometry args={[0.16, 10, 0.16]} />
      </mesh>
      <mesh position={[3.1, 5, 0]} material={post}>
        <boxGeometry args={[0.16, 10, 0.16]} />
      </mesh>
      <mesh position={[0, 10, 0]} material={post}>
        <boxGeometry args={[6.4, 0.14, 0.14]} />
      </mesh>
      <mesh position={[0, 1.6, 0.6]} material={post}>
        <boxGeometry args={[0.18, 3.2, 0.18]} />
      </mesh>
    </group>
  );
}

export function Markers() {
  const losM = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: "#9eb4d4",
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, 0.18), mat);
    m.rotation.x = -Math.PI / 2;
    return m;
  }, []);
  const fdM = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color: "#d8c98a",
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, 0.18), mat);
    m.rotation.x = -Math.PI / 2;
    return m;
  }, []);
  useFrame(() => {
    losM.position.set(0, 0.04, match.los);
    fdM.position.set(0, 0.045, match.firstZ);
  });
  return (
    <>
      <primitive object={losM} />
      <primitive object={fdM} />
    </>
  );
}
