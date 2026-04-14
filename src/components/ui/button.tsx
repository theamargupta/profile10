import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-[hsl(250,80%,67%)] via-[hsl(219,90%,66%)] to-[hsl(270,70%,72%)] text-white shadow-[var(--shadow-elevated)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_hsl(250,80%,67%,0.3)]",
        secondary:
          "bg-transparent text-foreground border border-[rgba(255,255,255,0.06)] hover:border-[#7c6aef] hover:bg-[rgba(124,106,239,0.15)]",
        ghost:
          "bg-transparent text-foreground hover:bg-surface",
        glass:
          "glass-panel text-foreground hover:bg-white/10",
        outline:
          "border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary",
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
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
