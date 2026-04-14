"use client";

/**
 * FloatingCodeEditor — A 3D tilted code editor/terminal panel
 * with glowing code lines, floating in the hero section.
 * Uses Three.js + @react-three/fiber + @react-three/drei.
 */

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PALETTE } from "@/lib/palette";

// Code lines with syntax highlighting colors
const CODE_LINES = [
  { text: "import { Agent } from '@anthropic/sdk';", colors: ["#c1ff3d", "#f7f8fb", "#6275ff", "#c9ccd6"] },
  { text: "", colors: [] },
  { text: "const server = new MCPServer({", colors: ["#c1ff3d", "#f7f8fb", "#6275ff"] },
  { text: "  name: 'portfolio-agent',", colors: ["#8a8f9e", "#a8f500"] },
  { text: "  version: '2.0.0',", colors: ["#8a8f9e", "#a8f500"] },
  { text: "  tools: [analyze, deploy],", colors: ["#8a8f9e", "#6275ff", "#6275ff"] },
  { text: "});", colors: ["#f7f8fb"] },
  { text: "", colors: [] },
  { text: "async function buildProject() {", colors: ["#c1ff3d", "#a8f500", "#f7f8fb"] },
  { text: "  const result = await agent.run({", colors: ["#8a8f9e", "#f7f8fb", "#6275ff"] },
  { text: "    model: 'claude-sonnet-4',", colors: ["#8a8f9e", "#a8f500"] },
  { text: "    prompt: generatePrompt(),", colors: ["#8a8f9e", "#6275ff"] },
  { text: "  });", colors: ["#8a8f9e"] },
  { text: "  return deploy(result);", colors: ["#8a8f9e", "#c1ff3d"] },
  { text: "}", colors: ["#f7f8fb"] },
];

function CodePanel() {
  const groupRef = useRef<THREE.Group>(null);

  // Create text textures using canvas
  const canvasTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = PALETTE.surface[1];
    ctx.fillRect(0, 0, 512, 512);

    // Top bar
    ctx.fillStyle = PALETTE.surface[2];
    ctx.fillRect(0, 0, 512, 32);

    // Window dots
    const dotColors = ["#ff5f57", "#febc2e", "#28c840"];
    dotColors.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(16 + i * 18, 16, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Tab title
    ctx.fillStyle = PALETTE.fg[1];
    ctx.font = "11px monospace";
    ctx.fillText("server.ts", 80, 20);

    // Line numbers + code
    ctx.font = "11px monospace";
    const startY = 48;
    const lineHeight = 17;

    CODE_LINES.forEach((line, i) => {
      const y = startY + i * lineHeight;

      // Line number
      ctx.fillStyle = PALETTE.fg[3] ?? "#5b5f6c";
      ctx.fillText(String(i + 1).padStart(2, " "), 10, y);

      // Code text
      if (line.text) {
        ctx.fillStyle = line.colors[0] || PALETTE.fg[0];
        ctx.fillText(line.text, 34, y);
      }
    });

    // Cursor blink line
    ctx.fillStyle = PALETTE.accent[400];
    ctx.fillRect(34 + 11 * 14, startY + 9 * lineHeight - 12, 2, 14);

    // Bottom status bar
    ctx.fillStyle = PALETTE.surface[2];
    ctx.fillRect(0, 480, 512, 32);
    ctx.fillStyle = PALETTE.accent[400];
    ctx.fillRect(0, 480, 80, 32);
    ctx.fillStyle = PALETTE.surface[0];
    ctx.font = "10px monospace";
    ctx.fillText("NORMAL", 12, 500);
    ctx.fillStyle = PALETTE.fg[2];
    ctx.fillText("TypeScript  UTF-8  LF", 300, 500);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Main code panel */}
      <mesh>
        <planeGeometry args={[3.6, 3.6]} />
        <meshBasicMaterial
          map={canvasTexture}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Glow border frame */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(3.6, 3.6)]} />
        <lineBasicMaterial color={PALETTE.accent[400]} transparent opacity={0.3} />
      </lineSegments>

      {/* Subtle glow behind panel */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial
          color={PALETTE.primary[500]}
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

export default function FloatingCodeEditor() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Slow floating
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.15;

    // Tilt toward mouse (subtle)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouse.y * 0.08 + 0.05,
      0.03
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      -mouse.x * 0.12 - 0.15,
      0.03
    );
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0.05, -0.15, 0.02]}>
      <CodePanel />
    </group>
  );
}
