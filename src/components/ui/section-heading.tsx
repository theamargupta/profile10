import { cn } from "@/lib/utils";
import { typeClasses } from "@/lib/type-classes";

interface SectionHeadingProps {
  label?: string;
  title: string;
  className?: string;
}

export function SectionHeading({ label, title, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-16 text-center", className)}>
      {label && (
        <p className={cn(typeClasses.micro, "mb-4 text-primary")}>{label}</p>
      )}
      <h2 className={typeClasses.h2}>{title}</h2>
    </div>
  );
}
