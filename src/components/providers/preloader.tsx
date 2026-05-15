"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "profile.preloader.seen";

export default function Preloader() {
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"counting" | "revealing" | "leaving" | "done">(
    "counting",
  );
  const rafRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initTimeout = window.setTimeout(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
      if (reduce || seen) {
        setPhase("done");
        return;
      }
      setActive(true);
    }, 0);

    timeoutRefs.current = [initTimeout];
    return () => window.clearTimeout(initTimeout);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timeoutRefs.current.forEach((timeout) => window.clearTimeout(timeout));
      timeoutRefs.current = [];
    };
  }, []);

  useEffect(() => {
    if (!active || phase !== "counting") return;
    const start = performance.now();
    const duration = 450;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("revealing");
        const leavingTimeout = window.setTimeout(() => setPhase("leaving"), 180);
        const doneTimeout = window.setTimeout(() => {
          setPhase("done");
          try {
            window.sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* noop */
          }
        }, 700);
        timeoutRefs.current = [leavingTimeout, doneTimeout];
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, phase]);

  useEffect(() => {
    if (!active || phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active, phase]);

  if (!active || phase === "done") return null;

  const leaving = phase === "leaving";
  const maskShown = phase === "revealing" || phase === "leaving";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[var(--z-preloader)]"
      style={{ contain: "strict" }}
    >
      <div
        className="absolute inset-y-0 left-0 w-1/2 bg-[var(--color-surface-0)] transition-transform duration-[600ms]"
        style={{
          transform: leaving ? "translateY(-101%)" : "translateY(0)",
          transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-[var(--color-surface-0)] transition-transform duration-[600ms]"
        style={{
          transform: leaving ? "translateY(101%)" : "translateY(0)",
          transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)",
          transitionDelay: "80ms",
        }}
      />

      <div className="relative z-10 flex h-full w-full items-end justify-between px-[var(--gutter)] pb-10">
        <div className="overflow-hidden">
          <div
            className="font-mono text-sm uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-0)]"
            style={{
              transform: maskShown ? "translateY(0)" : "translateY(110%)",
              transition: "transform 700ms cubic-bezier(0.76, 0, 0.24, 1)",
            }}
          >
            Amar Gupta / Portfolio
          </div>
        </div>

        <div
          className="font-display font-semibold tabular-nums text-[var(--color-fg-0)]"
          style={{
            fontSize: "clamp(3rem, 9vw, 9rem)",
            lineHeight: 1,
            letterSpacing: "var(--tracking-tighter)",
            opacity: leaving ? 0 : 1,
            transform: leaving ? "translateY(-30%)" : "translateY(0)",
            transition:
              "opacity 500ms ease, transform 700ms cubic-bezier(0.76, 0, 0.24, 1)",
          }}
        >
          {String(count).padStart(3, "0")}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10">
        <div
          className="h-full bg-[var(--color-accent-400)]"
          style={{
            width: `${count}%`,
            transition: "width 80ms linear",
          }}
        />
      </div>
    </div>
  );
}
