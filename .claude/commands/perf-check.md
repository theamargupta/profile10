---
description: Build the site and inspect bundle/performance risks, especially non-lazy 3D imports.
argument-hint: "[scope]"
allowed-tools: Read, Grep, Glob, Bash
---

Run a performance check for `$ARGUMENTS` or the current app.

Steps:
1. Run `npm run build`.
2. Parse the Next.js output for large routes, dynamic rendering, and warnings.
3. Search for static imports of `three`, `@react-three/fiber`, `@react-three/drei`, and `@react-three/postprocessing` outside client-only scene modules.
4. Flag R3F scenes that are not loaded with `next/dynamic` and `{ ssr: false }`.
5. Check expensive GSAP/Lenis effects for reduced-motion and cleanup.
6. Report risks with file:line evidence and suggested fixes.

Do not modify files unless the user asks for fixes.
