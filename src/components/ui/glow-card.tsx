"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlowCard({ children, className, hover = true }: GlowCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[var(--color-surface-3)] bg-[var(--color-surface-1)]/60 p-8 backdrop-blur-xl transition-all duration-500",
        hover && "hover:border-[var(--color-accent-400)]/60 hover:translate-y-[-4px]",
        className
      )}
    >
      {children}
    </div>
  );
}
