"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import FloatingCodeEditor from "./floating-code-editor";
import ParticleField from "./particle-field";

export default function HeroScene() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reducedMotion) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(61,75,255,0.35) 0%, rgba(5,5,7,0) 60%)",
        }}
      />
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <fog attach="fog" args={["#050507", 8, 20]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={0.8} />
      <pointLight position={[-2, 2, 3]} intensity={0.3} color="#a8f500" />
      <FloatingCodeEditor />
      <ParticleField count={1200} radius={8} />
    </Canvas>
  );
}
