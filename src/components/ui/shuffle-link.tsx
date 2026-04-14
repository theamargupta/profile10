"use client";

/**
 * ShuffleLink — Characters shuffle through random glyphs on hover,
 * then settle into the real text. Respects prefers-reduced-motion.
 */

import Link from "next/link";
import { useCallback, useRef } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|*@#&";

type Props = {
  href: string;
  children: string;
  className?: string;
  external?: boolean;
  onClick?: () => void;
};

export default function ShuffleLink({
  href,
  children,
  className,
  external,
  onClick,
}: Props) {
  const elRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number | null>(null);

  const shuffle = useCallback((text: string) => {
    const el = elRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timer.current) window.clearInterval(timer.current);

    const original = text;
    let i = 0;
    const step = 2;
    timer.current = window.setInterval(() => {
      let out = "";
      for (let c = 0; c < original.length; c++) {
        if (c < i) out += original[c];
        else if (original[c] === " ") out += " ";
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      i += step;
      if (i >= original.length) {
        if (timer.current) window.clearInterval(timer.current);
        el.textContent = original;
      }
    }, 30);
  }, []);

  const reset = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (elRef.current) elRef.current.textContent = children;
  }, [children]);

  const onEnter = () => shuffle(children);
  const onLeave = () => reset();

  const content = (
    <span
      ref={elRef}
      className={className}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      data-cursor="magnet"
    >
      {children}
    </span>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick}>
      {content}
    </Link>
  );
}
