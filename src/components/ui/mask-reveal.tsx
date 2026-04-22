"use client";

/**
 * MaskReveal — Scroll-linked clip-path wipe for headings.
 * Respects prefers-reduced-motion.
 */

import React, {
  useEffect,
  useState,
  useSyncExternalStore,
  type ElementType,
  type ReactNode,
} from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function MaskReveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  duration = 1100,
}: Props) {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const isVisible = reduced || visible;

  useEffect(() => {
    const el = wrapperElement;
    if (!el || reduced) return;

    const frame = window.requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
        setVisible(true);
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      window.cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [reduced, wrapperElement]);

  const innerStyle: React.CSSProperties = {
    display: "inline-block",
    clipPath: isVisible ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
    WebkitClipPath: isVisible ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
    transition: reduced
      ? "none"
      : `clip-path ${duration}ms cubic-bezier(0.76, 0, 0.24, 1) ${delay}ms, -webkit-clip-path ${duration}ms cubic-bezier(0.76, 0, 0.24, 1) ${delay}ms`,
    willChange: "clip-path",
  };

  return React.createElement(
    Tag,
    { ref: setWrapperElement, className },
    <span style={innerStyle}>{children}</span>,
  );
}
