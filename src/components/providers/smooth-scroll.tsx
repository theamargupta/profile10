"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";

const SmoothScrollContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;
    if (pathname === "/admin" || pathname?.startsWith("/admin/")) return;
    if (pathname === "/blog" || pathname?.startsWith("/blog/")) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    // Defer Lenis + GSAP ScrollTrigger loading until after first paint.
    // These deps are ~40KB combined and aren't needed for LCP.
    const start = async () => {
      const [{ default: Lenis }, gsapMod, scrollTriggerMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      const gsap = gsapMod.default;
      const ScrollTrigger = scrollTriggerMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        touchMultiplier: 2,
        syncTouch: false,
      });

      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      const ticker = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        lenis.off("scroll", ScrollTrigger.update);
        gsap.ticker.remove(ticker);
        lenis.destroy();
        lenisRef.current = null;
      };
    };

    const ric =
      (window as Window & { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const id = ric(() => {
      void start();
    });

    return () => {
      cancelled = true;
      const cancel = (window as Window & {
        cancelIdleCallback?: (id: number) => void;
      }).cancelIdleCallback;
      if (cancel) cancel(id as number);
      else window.clearTimeout(id as number);
      cleanup?.();
    };
  }, [pathname]);

  return (
    <SmoothScrollContext.Provider value={null}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
