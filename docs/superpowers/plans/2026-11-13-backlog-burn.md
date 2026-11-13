# Backlog burn — profile10 (lane)

Who: sonnet
Leader: kamai-74. Repo: profile10. Model: sonnet.

**Rules:** Global Rule 0 build-loop per phase. Facts first: read the route/test before changing. Red-first for real bugs. Gate: profile10's test + E2E command bare, read $?. **DO NOT DEPLOY, DO NOT push main** — commit each phase on this lane's branch with the ticket key; leader kamai-74 batch-deploys profile10 once at the end. After each phase SendMessage kamai-74 the ticket key + SHA + gate.

## Phases
1. **ADMIN-302** — profile10 `/api/mcp` unauthenticated GET answers 401, must be **405 with an Allow header** (global Rule 11; a 200/401 makes connected SDK clients reconnect). Read `app/api/mcp/**/route.ts` GET first. Red-first: a test asserting GET → 405 + Allow. Fix the handler. Keep POST unchanged.
2. **ADMIN-311** — `/about` depends on an `i.ibb.co` image; the host times out so `routes.spec '/about renders without console errors'` fails (2 of 90 E2E). Fix: self-host the image in the repo (or remove the dependency) so `/about` renders with no external image and no console error. Red-first: the route test green offline.

## Done
Gate green, committed on this branch per ticket, SHA to kamai-74. No deploy, no merge to main.
