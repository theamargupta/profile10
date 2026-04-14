export const typeClasses = {
  display:
    "font-display text-[clamp(3.5rem,8vw,7rem)] font-semibold tracking-[-0.06em] leading-[0.92] [text-wrap:balance]",
  h1: "font-display text-[clamp(2.75rem,6vw,4.75rem)] font-semibold tracking-[-0.05em] leading-[0.96] [text-wrap:balance]",
  h2: "font-display text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.04em] leading-[1] [text-wrap:balance]",
  h3: "font-display text-[clamp(1.5rem,2.5vw,2rem)] font-semibold tracking-[-0.03em] leading-[1.1] [text-wrap:balance]",
  body: "text-[clamp(1rem,1.1vw,1.125rem)] leading-7 text-foreground/70 [text-wrap:pretty]",
  micro:
    "text-xs font-medium uppercase tracking-[0.28em] text-foreground/50",
} as const;
