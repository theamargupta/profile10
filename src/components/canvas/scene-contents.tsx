"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function FloatingOrb() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  // Wireframe icosahedron
  const wireGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.3, 1);
    return new THREE.WireframeGeometry(geo);
  }, []);

  // Inner solid
  const innerGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.1, 2), []);

  // Floating particles around the orb
  const particlePositions = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 1.2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Slow rotation + mouse tracking
    groupRef.current.rotation.y = t * 0.15 + pointer.x * 0.15;
    groupRef.current.rotation.x = t * 0.1 + pointer.y * 0.1;

    // Subtle breathing effect on the wireframe
    const scale = 1 + Math.sin(t * 0.8) * 0.03;
    groupRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group ref={groupRef}>
      {/* Wireframe icosahedron */}
      <lineSegments geometry={wireGeometry}>
        <lineBasicMaterial color="#9b8aff" transparent opacity={0.7} />
      </lineSegments>

      {/* Inner glow sphere */}
      <mesh geometry={innerGeometry}>
        <meshBasicMaterial color="#7b9fff" transparent opacity={0.1} />
      </mesh>

      {/* Floating particles */}
      <points geometry={particlePositions}>
        <pointsMaterial color="#c4b5fd" size={0.045} transparent opacity={0.85} />
      </points>
    </group>
  );
}

function OrbitalRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.08;
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.06;
  });

  return (
    <>
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2, 0.008, 16, 100]} />
        <meshBasicMaterial color="#9b8aff" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[2.3, 0.006, 16, 100]} />
        <meshBasicMaterial color="#7b9fff" transparent opacity={0.2} />
      </mesh>
    </>
  );
}

export function SceneContents() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} color="#9b8aff" />
      <pointLight position={[-3, -2, 2]} intensity={0.8} color="#7b9fff" />

      <FloatingOrb />
      <OrbitalRings />
    </>
  );
}
