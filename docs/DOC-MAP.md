# DOC-MAP — where step 1 of the build loop starts

Versions read off `node_modules` on 2026-09-08. **Bump a dependency, fix its row in
the same commit** — `npm run doc-map:check` fails if you don't. Where context7 has
no tag matching what is installed, the row says which tag it fell back to; an
unlabelled pin means it matches.

## Read this row before any other

> **Zod here is v3 (`3.25.76`), not v4.** `devfrendlmsv1` runs 4.3.6 and
> `usstaffingagent` runs 4.5.4. A v4 answer carried across from either repo — or
> from a recent memory of Zod — **will not work here**, and the failure is a type
> error at build time if you are lucky and a silent parse difference if you are not.
> Pin `/colinhacks/zod/v3.24.2` and read v3 syntax. This is the single most likely
> cross-repo mistake in the whole set.

## The stack

| Thing (installed) | context7 ID | The one page that matters | What it already cost |
|---|---|---|---|
| **Zod 3.25.76** | `/colinhacks/zod/v3.24.2` (nearest tag) | v3 API — `.errors`, `z.infer`, v3 error shape | See the box above. The other two repos are v4. |
| Next.js 16.2.3 | `/vercel/next.js/v16.2.2` (nearest tag) | Upgrade guide → "Caching APIs" | Not yet. |
| React 19.2.4 | `/react/react/v19.2.7` (nearest tag) | React 19 — `use`, Actions, ref-as-prop | Not yet. |
| three 0.183.2 | `/websites/threejs` — resolve before first use | Migration guide for the r-number in use; three ships breaking changes per release | Not yet. |
| @react-three/fiber 9.6.0 | `/pmndrs/react-three-fiber` — **do not use its `__branch__v10` tag** | R3F **v9** docs; v9 is the React 19 line. The only tagged branch on context7 is v10 and it is the wrong major for this repo. | Not yet — recorded because the obvious pin is the wrong one. |
| @react-three/drei 10.7.7 | resolve before first use | Per-component docs; drei tracks R3F majors | Not yet. |
| GSAP 3.15.0 | `/websites/gsap_v3` core · `/greensock/react` for `useGSAP` | `useGSAP` — cleanup and `contextSafe`; a GSAP tween in a bare `useEffect` leaks on Fast Refresh | Not yet. |
| framer-motion 12.38.0 | resolve before first use | v12 API; the package also publishes as `motion` — check which one a file imports | Two animation libraries plus Lenis is a real interaction footgun. |
| Lenis 1.3.21 | resolve before first use | Smooth-scroll setup and its interaction with ScrollTrigger | Lenis + GSAP ScrollTrigger need explicit wiring or scroll position desyncs. |
| Playwright 1.60.0 | `/microsoft/playwright/v1.58.2` (nearest tag) | Web-first auto-retrying assertions | Not yet. |
| Vitest 4.1.5 | `/vitest-dev/vitest/v4.1.6` (nearest tag) | v4 migration; `vi.mock` is hoisted | Not yet. |
| @supabase/ssr 0.10.2 | `/supabase/ssr` | `createServerClient` cookies in App Router | Not yet. Note this is 0.10.2 — a third distinct version across the three repos. |
| Tailwind 4.2.2 | `/tailwindlabs/tailwindcss.com` | v4 upgrade guide — CSS-first `@theme`, no config file | Every v3 answer online is wrong here. |
| @modelcontextprotocol/sdk 1.29.0 | resolve before first use | Server transport + tool registration | Not yet. |

## Known-stale pointer — fix or delete

`supabase/CLAUDE.md` opens by pointing at a "cross-repo technical reference" at
`/Volumes/maersk/amargupta/Documents/LatestProjects/PortfolioProject/Setu/docs/README.md`.
**That path does not exist** — `/Volumes` has only `Macintosh HD` mounted, and these
repos now live under `~/Documents/setu/`. Verified 2026-09-08. A CLAUDE.md that
sends a session to a dead path costs a real detour; repoint it or drop the line.

## Docs that are not a library

| Question | Where the answer lives |
|---|---|
| What is this site and how is it run? | `CLAUDE.md` — Tech Stack, Commands, Env, MCP, Conventions |
| Migration conventions | `supabase/CLAUDE.md` — five-digit prefix, RLS on every new table, never edit an old migration |
| What the site says about its owner | this is the public portfolio; `../kamai/accounts.md` holds the reach data behind the positioning |

## Shared rules live in the global map

The version-independent traps for Next, React, Tailwind, shadcn, Zod, Playwright,
Vitest, Testing Library and `@supabase/ssr` — plus their canonical context7 IDs —
are in `~/.claude/docs/DOC-MAP-COMMON.md`, loaded in every session. Do not repeat
them here. **This file owns the versions**, the version-pinned IDs, and what each
one has cost *in this repo*. The repos share libraries, not versions.
