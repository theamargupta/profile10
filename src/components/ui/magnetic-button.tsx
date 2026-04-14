"use client";

/**
 * MagneticButton — Cursor-attracted CTA.
 * Translates the element toward the cursor on mouse-over with a spring return.
 */

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import gsap from "gsap";

interface MagneticButtonProps {
  children: ReactNode;
  href: string;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  strength?: number;
  className?: string;
  external?: boolean;
}

const base =
  "relative inline-flex items-center justify-center rounded-full font-medium transition-colors will-change-transform";

const variantStyles = {
  primary:
    "bg-[var(--color-accent-400)] text-[var(--color-surface-0)] hover:bg-[var(--color-accent-300)]",
  ghost:
    "border border-[var(--color-surface-4)] text-[var(--color-fg-0)] hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]",
} as const;

const sizeStyles = {
  sm: "h-11 px-5 text-sm",
  md: "h-14 px-8 text-base",
  lg: "h-14 px-8 text-base",
} as const;

export default function MagneticButton({
  children,
  href,
  variant = "primary",
  size = "md",
  strength = 0.28,
  className = "",
  external = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      gsap.to(el, {
        x: dx,
        y: dy,
        duration: 0.4,
        ease: "power4.out",
      });
    };
    const onLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.35)",
      });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  const classes = `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (external) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="magnet"
        className={classes}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </a>
    );
  }

  return (
    <Link
      ref={ref}
      href={href}
      data-cursor="magnet"
      className={classes}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Link>
  );
}
