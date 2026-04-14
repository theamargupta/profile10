import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface-0)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-accent-400)] text-[var(--color-surface-0)] hover:bg-[var(--color-accent-300)] hover:translate-y-[-2px]",
        secondary:
          "bg-transparent text-[var(--color-fg-0)] border border-[var(--color-surface-4)] hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]",
        ghost:
          "bg-transparent text-[var(--color-fg-0)] hover:bg-[var(--color-surface-2)]",
        glass:
          "bg-[var(--color-surface-1)]/60 backdrop-blur-xl border border-[var(--color-surface-3)] text-[var(--color-fg-0)] hover:border-[var(--color-accent-400)]/60",
        outline:
          "border border-[var(--color-surface-4)] text-[var(--color-fg-0)] hover:border-[var(--color-accent-400)]/60 hover:bg-[var(--color-surface-2)]",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-cursor="magnet"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
