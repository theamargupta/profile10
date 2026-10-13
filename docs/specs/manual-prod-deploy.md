# Manual production deploy (2026-10-14)

Ported from amar-gupta-admin at `bfc8831c`. **The reasoning, the measurements and the Vercel doc quotes live in
admin's spec, `docs/superpowers/specs/2026-10-13-manual-prod-deploy.md`.** This file records only what is true here.

## Why here too

profile10 sits on the same Vercel Hobby team (`amargupta`) as admin. Every push to `main` built on Vercel, and those
Build CPU Minutes count against the team admin already cut on 2026-10-13. Amar approved it on 2026-10-14
("Haan, wo bhi raat mein"). Plan: `docs/superpowers/plans/2026-10-14-mcp-get-405-and-manual-deploy.md`, phase 2.

## What it does

- `vercel.json`: `"git": { "deploymentEnabled": false }`. A push creates no deployment for any branch.
- The Vercel project's Ignored Build Step `exit 0` is the second lock. **The leader sets it, never a lane.**
- Production ships with `bash scripts/deploy-prod.sh`, from a clean checkout whose HEAD is on `origin/main` and which
  has `.vercel/project.json` (copy it from the main checkout `../profile10`; worktrees do not have one).
- The script, in order: `vercel pull` (production env) → refuse any empty `NEXT_PUBLIC_*` → `colima start -p
  vercel-build` → build in a `linux/amd64` container (`scripts/deploy/Dockerfile`, `public.ecr.aws/lambda/nodejs:24`
  + Vercel CLI 62.7.0) running `scripts/deploy/build-in-container.sh`: `npm ci`, `npx tsc --noEmit`, `vercel build
  --prod --standalone` → `colima stop` → `vercel deploy --prebuilt --prod --meta gitSha=<sha>` → find the deployment
  by `meta.gitSha` and exit 0 only when it is `READY`. A trap stops Colima, restores the Docker context and deletes
  the pulled env file and `.vercel/output` however the run ends.
- `next.config.ts`: `typescript.ignoreBuildErrors` is true only when `VERCEL === "1"`. `vercel build` sets it, so the
  container's own `tsc --noEmit` is the type check. A local `next build` still type-checks.
- `DEPLOY_SKIP_DOMAIN=1` deploys without assigning the production domain (first run: smoke with `vercel curl`, then
  `vercel promote`). Leader-only.

## What is different from admin

- **Image and cache volumes are profile10's own:** image `profile10-vercel-build`, volumes `profile10-npm-cache` and
  `profile10-next-cache`. The Colima profile `vercel-build` is **shared** with admin; the leader serialises deploys
  so the two never run at once: each run's trap stops the shared VM.
- **No `regions` in `vercel.json`**: admin pins `sin1`; profile10 has never set one, and this change does not move it.
- **Node version:** `.vercel/project.json` shows `nodeVersion: null` (Vercel's default). The container runs Node 24,
  as admin's does. Not yet checked: which runtime the prebuilt functions get. The leader's first deploy reads it
  from the deployment.
- **Public variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` are
  baked into the bundle. All three were Sensitive in production; the leader re-added them `--no-sensitive` on
  2026-10-14, so `vercel pull` returns them. Any that pulls empty refuses the deploy before Docker starts. Re-add with
  `vercel env add <KEY> production --force --no-sensitive --scope amargupta` (leader-only).

## Beyond admin (Codex build review, 2026-10-14)

- **The linked project is checked, not just present:** `.vercel/project.json` must carry profile10's `projectId`
  (`prj_7ria9GQtYG9IaFjHMhraVGbnQMW9`), or the run refuses before `vercel pull`. A copied file would otherwise pull and
  deploy another project in the same scope.
- **Local `.env` files never reach the build:** the main checkout holds a git-ignored `.env.local` with dev values, and
  `next build` loads `.env.local` / `.env.production`. `build-in-container.sh` skips `.env` and `.env.*` (keeping
  `.env.example`); the build reads only the pulled `.vercel/.env.production.local`.
- **The trap is best-effort per step:** a failing `colima stop` no longer ends it before the Docker context is restored
  and the secrets deleted, and the VM is marked for stopping before `colima start`, so a half-failed start is stopped
  too. The run keeps its original exit status.
- **Test stubs are written once per file:** macOS assesses a newly written executable on first launch (~400 ms each,
  measured), which put per-test stubs at 4.7 s against Vitest's 5 s default under load. Now ≤ ~0.4 s per test.

## Native dependencies (checked 2026-10-14)

`npm ls --all | grep -i -E 'sharp|bcrypt|canvas|node-gyp'`: **sharp 0.34.5**, pulled in by `next@16.2.3` for
`next/image` optimisation. No bcrypt, canvas or node-gyp. `.node` files under `node_modules` on the Mac are all
darwin-arm64 build tooling (`@next/swc`, `lightningcss`, `@tailwindcss/oxide`, `@rolldown/binding`,
`@unrs/resolver-binding`, `fsevents`) plus `@img/sharp-darwin-arm64`. Linux x64 is required either way: the function
architecture comes from `process.arch` (`@vercel/build-utils/dist/lambda.js`), so a bare Mac build ships arm64.

## What it refuses

- Modified tracked files; no `.vercel/project.json`, or one linked to another project; HEAD not on `origin/main`.
- An empty `NEXT_PUBLIC_*` after the pull.
- A failing `tsc --noEmit` in the container (no output, no deploy).
- A deployment that does not read back `READY` at the SHA.

## What changes for sessions

- A push to `main` no longer deploys. "Confirm the deploy by SHA" means the script's `READY <sha> <url>` line.
- Who runs it: the leader, never a lane. Lanes commit and report SHAs.

## Tests

`__tests__/scripts/` — `deploy-prod.test.ts`, `deploy-prod-public-env.test.ts`, `deploy-prod-safety.test.ts` (shared harness
`deploy-prod-harness.ts`, PATH stubs for `vercel`, `colima`, `docker`: no test can start a VM or a deployment),
`build-in-container.test.ts`, `vercel-git-config.test.ts`. They run in `npm test`.
