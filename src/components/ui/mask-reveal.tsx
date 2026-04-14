"use client";

/**
 * MaskReveal — Scroll-linked clip-path wipe for headings.
 * Respects prefers-reduced-motion.
 */

import React, {
  useEffect,
  useRef,
  useState,
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

export default function MaskReveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  duration = 1100,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (reduced) {
      setVisible(true);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
      setVisible(true);
      return;
    }
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
    return () => io.disconnect();
  }, [reduced]);

  const innerStyle: React.CSSProperties = {
    display: "inline-block",
    clipPath: visible ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
    WebkitClipPath: visible ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
    transition: reduced
      ? "none"
      : `clip-path ${duration}ms cubic-bezier(0.76, 0, 0.24, 1) ${delay}ms, -webkit-clip-path ${duration}ms cubic-bezier(0.76, 0, 0.24, 1) ${delay}ms`,
    willChange: "clip-path",
  };

  return React.createElement(
    Tag,
    { ref: wrapperRef, className },
    <span style={innerStyle}>{children}</span>,
  );
}
