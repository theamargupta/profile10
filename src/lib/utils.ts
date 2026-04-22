import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(start: string, end: string | null): string {
  const startFormatted = formatDate(start);
  const endFormatted = end ? formatDate(end) : "Present";
  return `${startFormatted} — ${endFormatted}`;
}

export function truncate(str: string, max: number): string {
  if (max <= 0) return "";
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1)}\u2026`;
}

export function capitalizeWords(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map((word) =>
      word.length === 0 ? "" : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}
