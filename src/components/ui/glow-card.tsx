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
        "glass-panel rounded-2xl p-6 transition-all duration-500",
        hover && "glow-border hover:translate-y-[-4px] hover:shadow-[0_0_40px_hsl(var(--primary)/0.1)]",
        className
      )}
    >
      {children}
    </div>
  );
}
