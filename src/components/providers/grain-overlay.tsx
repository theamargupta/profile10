"use client";

import { useEffect, useState } from "react";

export default function GrainOverlay() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70]"
        style={{
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
          opacity: 0.08,
          mixBlendMode: "overlay",
        }}
      />
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[71]"
        style={{ width: "100%", height: "100%", opacity: 0.06, mixBlendMode: "overlay" }}
      >
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          >
            {!reduced && (
              <animate
                attributeName="seed"
                from="1"
                to="100"
                dur="6s"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
    </>
  );
}
