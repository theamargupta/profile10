/**
 * Single source of truth for brand colour values used in JS / TS contexts
 * (edge runtime OG images, manifest, themeColor metadata, Three.js, GSAP).
 *
 * Mirrors the CSS custom properties in `src/app/globals.css`. When values
 * change, edit both — this is intentional because:
 *   1. The Edge runtime cannot parse CSS variables.
 *   2. `next/og` ImageResponse requires raw hex/rgb.
 *
 * For Tailwind / DOM consumption, prefer `var(--color-*)` over importing
 * from here. This module exists for surfaces that have no DOM.
 */

export const THEME = {
  // ── Brand ──────────────────────────────────────────────────────────────
  primary: {
    50: "#eef1ff",
    400: "#6275ff",
    500: "#3d4bff",
    600: "#2a33e6",
    900: "#0f1359",
  },
  accent: {
    300: "#c1ff3d",
    400: "#a8f500", // electric lime — primary brand accent
    500: "#8ad400",
  },
  secondary: {
    500: "#ff7a5c",
  },

  // ── Surface (dark-first) ───────────────────────────────────────────────
  surface: {
    0: "#050507",
    1: "#0b0c10",
    2: "#121319",
    3: "#1c1d27",
    4: "#2a2b38",
  },

  // ── Foreground ─────────────────────────────────────────────────────────
  fg: {
    0: "#f7f8fb",
    1: "#c9ccd6",
    2: "#8a8f9e",
    3: "#5b5f6c",
  },

  // ── Semantic ───────────────────────────────────────────────────────────
  success: "#26d07c",
  warning: "#ffb020",
  danger: "#ff5264",

  // ── `on-*` foregrounds ─────────────────────────────────────────────────
  onAccent: "#050507",
  onDanger: "#fff5f6",
  onSuccess: "#050507",
  onWarning: "#050507",
  onNeutral: "#f7f8fb",

  // ── Meta (browser chrome / PWA manifest) ───────────────────────────────
  meta: {
    /** <meta name="theme-color"> — matches body background. */
    themeColor: "#050507",
    /** PWA background_color — same as themeColor for seamless splash. */
    backgroundColor: "#050507",
  },
} as const;

export type Theme = typeof THEME;
