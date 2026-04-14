"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 40;
const CONNECTION_THRESHOLD = 2.8;

export function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  const nodes = useMemo(() => {
    return Array.from({ length: NODE_COUNT }, () => ({
      position: new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(5),
        THREE.MathUtils.randFloatSpread(4),
        THREE.MathUtils.randFloatSpread(3)
      ),
      basePosition: new THREE.Vector3(),
      speed: THREE.MathUtils.randFloat(0.2, 0.6),
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useMemo(() => {
    nodes.forEach((n) => n.basePosition.copy(n.position));
  }, [nodes]);

  const connections = useMemo(() => {
    const lines: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (
          nodes[i].position.distanceTo(nodes[j].position) < CONNECTION_THRESHOLD
        ) {
          lines.push([i, j]);
        }
      }
    }
    return lines;
  }, [nodes]);

  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(connections.length * 6);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [connections]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    nodes.forEach((node, i) => {
      node.position.x =
        node.basePosition.x + Math.sin(t * node.speed + node.phase) * 0.15;
      node.position.y =
        node.basePosition.y + Math.cos(t * node.speed * 1.3 + node.phase) * 0.12;
      node.position.z =
        node.basePosition.z + Math.sin(t * node.speed * 0.7 + node.phase) * 0.1;

      const mesh = groupRef.current!.children[i] as THREE.Mesh;
      if (mesh) {
        mesh.position.copy(node.position);
      }
    });

    const posAttr = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
    connections.forEach(([a, b], idx) => {
      posAttr.setXYZ(idx * 2, nodes[a].position.x, nodes[a].position.y, nodes[a].position.z);
      posAttr.setXYZ(idx * 2 + 1, nodes[b].position.x, nodes[b].position.y, nodes[b].position.z);
    });
    posAttr.needsUpdate = true;

    groupRef.current.rotation.y += pointer.x * 0.001;
    groupRef.current.rotation.x += pointer.y * 0.0005;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <icosahedronGeometry args={[0.06, 2]} />
          <meshStandardMaterial
            color="#7c6aef"
            emissive="#7c6aef"
            emissiveIntensity={0.8}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
      ))}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#5b8cf7"
          transparent
          opacity={0.15}
          linewidth={1}
        />
      </lineSegments>
    </group>
  );
}
