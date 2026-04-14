"use client";

/**
 * ParticleField — instanced point cloud in a spherical volume.
 * Drifts on mouse parallax and slow-breathes.
 * Color gradient from primary indigo to accent lime based on y-position.
 */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PALETTE } from "@/lib/palette";

export default function ParticleField({
  count = 4000,
  radius = 6,
}: {
  count?: number;
  radius?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cPrimary = new THREE.Color(PALETTE.primary[500]);
    const cAccent = new THREE.Color(PALETTE.accent[400]);
    const cMix = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * Math.cbrt(Math.random());
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      const t = (y / radius + 1) * 0.5;
      cMix.copy(cPrimary).lerp(cAccent, t);
      colors[i * 3] = cMix.r;
      colors[i * 3 + 1] = cMix.g;
      colors[i * 3 + 2] = cMix.b;
    }
    return { positions, colors };
  }, [count, radius]);

  useFrame((_, delta) => {
    const p = pointsRef.current;
    if (!p) return;
    p.rotation.y += delta * 0.04;
    p.rotation.x += (mouse.y * 0.3 - p.rotation.x) * 0.04;
    p.rotation.z += (mouse.x * 0.2 - p.rotation.z) * 0.04;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
