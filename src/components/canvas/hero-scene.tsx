"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { SceneContents } from "./scene-contents";

export default function HeroScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        toneMapping: THREE.NoToneMapping,
        alpha: true,
      }}
      camera={{ position: [0, 0, 8], fov: 40 }}
      frameloop="always"
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <SceneContents />
      </Suspense>
    </Canvas>
  );
}
