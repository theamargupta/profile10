"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import ParticleField from "./particle-field";
import ShaderBlob from "./shader-blob";

export default function HeroScene() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncInitial = window.setTimeout(() => setReducedMotion(mq.matches), 0);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => {
      window.clearTimeout(syncInitial);
      mq.removeEventListener("change", handler);
    };
  }, []);

  if (reducedMotion) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(50% 50% at 70% 35%, rgba(61,75,255,0.32) 0%, rgba(5,5,7,0) 60%), radial-gradient(40% 35% at 25% 70%, rgba(168,245,0,0.10) 0%, rgba(5,5,7,0) 70%)",
        }}
      />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <color attach="background" args={["#050507"]} />
      <fog attach="fog" args={["#050507", 7, 18]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      <ShaderBlob />
      <ParticleField count={2400} radius={7} />
    </Canvas>
  );
}
