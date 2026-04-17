# `src/components/` Context

## Organization
- `sections/` — page/portfolio sections composed by routes.
- `three/` or current canvas folder — React Three Fiber scenes and WebGL-only components.
- `motion/` — GSAP, Framer Motion, and scroll animation helpers.
- `ui/` — small reusable primitives.

Existing folders may differ (`canvas/`, `dom/`, `providers/`, `ui/`). Follow the local structure unless a larger cleanup is explicitly requested.

## Rules
- Keep components server-renderable unless they need browser APIs.
- R3F scenes must be client-only and loaded through `next/dynamic` with `{ ssr: false }` from server-facing wrappers.
- Use `Suspense` and a stable non-WebGL fallback for 3D scenes.
- Memoize static geometries, materials, and expensive values. Avoid allocation inside `useFrame`.
- GSAP code should use `useGSAP({ scope })` from `@gsap/react`.
- Motion must respect `prefers-reduced-motion`.
- Use `next/image` for images. Confirm new remote hosts in `next.config.ts`.
- UI primitives should use `clsx`, `tailwind-merge`, and existing class helpers where available.

## Styling
- Tailwind v4 is CSS-first via `src/app/globals.css`.
- Do not create `tailwind.config.*`.
