"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  return (
    <SmoothScrollContext.Provider value={null}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
