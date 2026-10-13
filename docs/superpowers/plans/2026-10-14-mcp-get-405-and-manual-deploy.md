# profile10: MCP GET answers 405 (ADMIN-76) + manual Mac-Docker deploy

Leader: `amar-gupta-admin-51`. Amar approved both on 2026-10-14 ~01:10 IST: "Haan, fix + push + deploy" for
ADMIN-76, and "Haan, wo bhi raat mein" for the manual Docker deploy. The build loop is global Rule 0.

## One lane, on purpose

Two small phases, one owner per file, and both run serially through one leader who is also running admin's deploys tonight. Splitting them would buy nothing.

## Why

- **ADMIN-76 (high).** `src/app/api/mcp/route.ts:113` GET, called with `Accept: text/event-stream` and a valid bearer,
  opens an SSE stream on a stateless transport that never ends. Each one holds a 2 GB Hobby function for up to 300 s.
  The lane-1 estimate is that ~120 of profile10's 141 GB-h of Provisioned Memory comes from this (an estimate; the
  17 Oct billing read will confirm it). Global Rule 11 (`~/.claude/rules/mcp-routes.md`): GET answers **405** with
  an `Allow` header. The SDK client stops quietly only on 405.
- **Build minutes.** Today every push to `main` builds on Vercel, and those minutes count against the same Hobby team
  as amar-gupta-admin. Admin moved to "build on the Mac in Docker, `vercel deploy --prebuilt`" on 2026-10-13. Port
  that here.

## Phase 1: GET → 405 (ship first, alone)

Files: modify `src/app/api/mcp/route.ts` (GET at line 113); NEW (do not exist yet) `src/app/api/mcp/route.test.ts`, `tests/e2e/mcp-get-405.spec.ts`.

1. Red first. Unit test: GET with no Accept → 405 + `Allow: POST`; GET with `Accept: text/event-stream` and a valid
   bearer → 405 (the bug case: today it streams). Also pin that POST still answers. E2E: `request.get('/api/mcp')`
   → 405.
2. Make GET return 405 + `Allow: POST` (a short JSON body is fine), and add HEAD → 200 for liveness. Read the MCP spec
   transports page first and quote it in the comment: "The server MUST either return Content-Type: text/event-stream
   in response to this HTTP GET, or else return HTTP 405 Method Not Allowed". Discovery stays on the `.well-known`
   routes plus the 401 a POST without a token already returns. Check that the SDK version this repo installs (DOC-MAP)
   handles a 405 GET without retrying, by reading `_startOrAuthSse` in the installed client.
3. Gate: `npm run type-check`, `npm run lint`, `npm run lint:colors`, `npm test`, and `npm run test:e2e` for the new
   spec plus `routes.spec.ts`. Commit, then send the leader the SHA. The leader pushes; today a push still deploys
   profile10 through git, which is the fastest way to get this live.

## Phase 2: manual deploy, as in admin

NEW in this repo (none exist yet): `scripts/deploy-prod.sh`, `scripts/deploy/Dockerfile`, `scripts/deploy/build-in-container.sh`, `docs/specs/manual-prod-deploy.md` and the tests. Copy from amar-gupta-admin at `origin/main` (bfc8831c or later). Read them there, don't recall them:
`scripts/deploy-prod.sh` (including the 2026-10-14 empty-`NEXT_PUBLIC_*` guard), `scripts/deploy/Dockerfile`,
`scripts/deploy/build-in-container.sh`, and their tests in `__tests__/scripts/` (deploy-prod-harness.ts,
deploy-prod.test.ts, deploy-prod-public-env.test.ts, build-in-container.test.ts, vercel-git-config.test.ts). Then
adapt them:

- Colima profile: reuse `vercel-build`. Both repos never deploy at once: the leader serialises deploys. Use volume
  names `profile10-npm-cache` and `profile10-next-cache`, and image `profile10-vercel-build`.
- Find out whether profile10 has native deps (`npm ls --all | grep -i -E 'sharp|bcrypt|canvas|node-gyp'`, plus
  `.node` files under node_modules). Linux x64 is still required either way: the function architecture comes from
  `process.arch` (`@vercel/build-utils/dist/lambda.js`). Say what you found in the spec.
- `vercel.json`: `git.deploymentEnabled: false`. `next.config.ts`: `typescript.ignoreBuildErrors` only when
  `VERCEL === '1'`, and the container runs `tsc --noEmit` itself. Check `next.config.ts` against the lane-4 SEO work
  in `../profile10-lane-4-seo-leftovers` first, so you don't fight over that file.
- Spec: `docs/specs/manual-prod-deploy.md`, a short one that points at admin's spec for the reasoning and records only
  what's true here. Add a CLAUDE.md "Deploy is manual" bullet, and a DOC-MAP row for the Vercel CLI and colima.
- Gate as in phase 1 (the script tests, plus the whole gate). Commit, then send the leader the SHA.

**Leader-only, never the lane:** the Vercel project's Ignored Build Step `exit 0`, every `vercel env` change, every
push, and the first manual deploy (`DEPLOY_SKIP_DOMAIN=1`, then `vercel curl` smoke, then `vercel promote`, then
step 8).

## Rules for the lane

- Never push, deploy, or change Vercel settings. Report each phase's SHA with SendMessage to `amar-gupta-admin-51` and
  keep going without waiting.
- Any `vercel env add` that is ever needed: `--no-sensitive` (CLI 53 defaults to Sensitive; a Sensitive value pulls
  empty and a Mac build inlines `''`). That's the leader's job anyway.
- Codex (`-m gpt-5.6-terra`, read-only) reviews the phase-2 build before you report it done.
- Leftovers go to the leader as a list, never into a ticket yourself.

## Checkpoints

| Phase | Done when |
|---|---|
| 1 | red→green unit + e2e for GET 405, gate exit 0, SHA sent |
| 2 | script tests red→green, gate exit 0, Codex review findings fixed, SHA sent |
