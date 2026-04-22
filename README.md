# amargupta.tech — personal portfolio + writing site

## Overview

amargupta.tech is a Next.js 16 portfolio and writing site with heavy 3D
and motion work. Supabase is used as a lightweight content store for projects,
writing, and assets through Supabase Storage.

## Tech Stack

- Next.js 16.2.3 with App Router and Turbopack
- React 19.2.4 and React DOM 19.2.4
- TypeScript 5 with strict TypeScript conventions
- Tailwind CSS 4, CSS-first via `@theme` in `src/app/globals.css`
- `next-themes` 0.4.6 for dark mode
- Three.js 0.183.2, `@react-three/fiber` 9.6.0,
  `@react-three/drei` 10.7.7, and `@react-three/postprocessing` 3.0.4
- GSAP 3.15.0 and `@gsap/react` 2.1.2
- Framer Motion 12.38.0 and Lenis 1.3.21
- `@supabase/ssr` 0.10.2 and `@supabase/supabase-js` 2.103.0
- UI utilities: `@radix-ui/react-slot` 1.2.4,
  `class-variance-authority` 0.7.1, `clsx` 2.1.1,
  `tailwind-merge` 3.5.0, and `react-icons` 5.6.0

## Project Structure

```text
src/
  app/          routes + metadata conventions
  components/   section / three / motion / ui
  lib/          helpers + Supabase clients
supabase/       migrations + storage buckets
```

## Getting Started

Prerequisites:

- Node.js 24 LTS
- npm

Clone and install dependencies:

```bash
git clone <repository-url>
cd <repository-directory>
npm install
```

Create `.env.local` in the repository root and set the Supabase variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — starts the Next.js development server with `next dev`.
- `npm run build` — creates a production build with `next build`.
- `npm run lint` — runs ESLint with `eslint`.
- `npm start` — starts the production server with `next start`.

## Environment Variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL for browser and server clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key for browser-safe client access. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Privileged Supabase key for trusted server-side operations. |

Keep `SUPABASE_SERVICE_ROLE_KEY` out of client components and never commit
`.env*` files.

## Conventions

- Server Components are the default.
- 3D scenes are client-only and lazy-loaded with
  `next/dynamic { ssr: false }`; memoize geometries.
- GSAP animation uses `useGSAP({ scope })` from `@gsap/react`.
- Respect `prefers-reduced-motion` everywhere.
- Use `next/image` for images. Remote hosts currently whitelisted in
  `next.config.ts` are `i.ibb.co`, `img.youtube.com`, and
  `avcnoywxnkajfuobftmr.supabase.co` for public Supabase Storage objects.
- Tailwind CSS 4 is CSS-first; do not add `tailwind.config.*`.
- Supabase Storage URLs use the public bucket pattern configured in
  `next.config.ts`.
- The Supabase service-role key stays server-only.

## Deployment

Deploys on Vercel via `next build`. See the
[Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Author

Amar Gupta — [amargupta.tech](https://amargupta.tech)
