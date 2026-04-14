/**
 * Brand palette constants for use in Three.js, GSAP, and other JS contexts.
 * Mirrors the CSS custom properties in globals.css.
 */
export const PALETTE = {
  primary: {
    50:  "#eef1ff",
    400: "#6275ff",
    500: "#3d4bff",
    600: "#2a33e6",
    900: "#0f1359",
  },
  accent: {
    300: "#c1ff3d",
    400: "#a8f500",
    500: "#8ad400",
  },
  secondary: {
    500: "#ff7a5c",
  },
  surface: {
    0: "#050507",
    1: "#0b0c10",
    2: "#121319",
    3: "#1c1d27",
    4: "#2a2b38",
  },
  fg: {
    0: "#f7f8fb",
    1: "#c9ccd6",
    2: "#8a8f9e",
    3: "#5b5f6c",
  },
} as const;
