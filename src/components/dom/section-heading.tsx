"use client";

import { cn } from "@/lib/utils";
import MaskReveal from "@/components/ui/mask-reveal";

interface SectionHeadingProps {
  label?: string;
  title: string;
  className?: string;
}

export function SectionHeading({ label, title, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-16", className)}>
      {label && (
        <p className="mb-4 font-mono text-xs uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent-400)]">
          {label}
        </p>
      )}
      <MaskReveal
        as="h2"
        className="font-display font-semibold tracking-[var(--tracking-tight)] text-[var(--color-fg-0)]"
        delay={100}
      >
        <span style={{ fontSize: "var(--text-4xl)", lineHeight: "var(--leading-tight)" }}>
          {title}
        </span>
      </MaskReveal>
    </div>
  );
}
