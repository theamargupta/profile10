"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || prefersReduced) return;

    document.documentElement.classList.add("has-custom-cursor");

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let ringScale = 1;
    let ringScaleTarget = 1;
    let hidden = false;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;

      const target = e.target as HTMLElement | null;
      const magnet = target?.closest?.('[data-cursor="magnet"], a, button');
      const hide = target?.closest?.('[data-cursor="hide"]');
      ringScaleTarget = magnet ? 1.9 : 1;
      const shouldHide = !!hide;
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        ring.style.opacity = hidden ? "0" : "1";
        dot.style.opacity = hidden ? "0" : "1";
      }
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ringScale += (ringScaleTarget - ringScale) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-1.5 w-1.5 rounded-full bg-[var(--color-accent-400)] mix-blend-difference"
        style={{ transition: "opacity 180ms ease" }}
      />
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9997] h-9 w-9 rounded-full border border-[var(--color-fg-0)]/60 mix-blend-difference"
        style={{ transition: "opacity 180ms ease" }}
      />
    </>
  );
}
