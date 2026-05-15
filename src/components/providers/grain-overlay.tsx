"use client";

export default function GrainOverlay() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[var(--z-grain)]"
        style={{
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
          opacity: 0.08,
          mixBlendMode: "overlay",
        }}
      />
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[var(--z-grain-top)]"
        style={{ width: "100%", height: "100%", opacity: 0.06, mixBlendMode: "overlay" }}
      >
        <filter id="grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
    </>
  );
}
