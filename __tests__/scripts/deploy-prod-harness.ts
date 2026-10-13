import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, afterEach, beforeAll } from 'vitest'

// Shared by the deploy-prod suites. Spec: docs/specs/manual-prod-deploy.md. Real git uses a
// throwaway bare origin; every external deploy dependency is a PATH stub so no test can start Colima, Docker, or a
// Vercel deployment. PULL_ENV is what the stubbed `vercel pull` writes into .vercel/.env.production.local.
const script = resolve(__dirname, '../../scripts/deploy-prod.sh')
// The Vercel project the script must refuse to deploy anything but (from the main checkout's .vercel/project.json).
export const PROFILE10_PROJECT_ID = 'prj_7ria9GQtYG9IaFjHMhraVGbnQMW9'
const dirs: string[] = []

export function git(cwd: string, ...args: string[]) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim()
}

// The stubs are written ONCE per test file and read their per-test values from STUB_* variables. macOS assesses a
// newly written executable on its first launch: measured 2026-10-14, ~400 ms for each of the three stubs, so writing
// them per test cost ~1.2 s of a 1.4 s test and pushed tests to 4.7 s under load, against Vitest's 5 s default.
let stubBin: string | undefined

function stubs() {
  if (stubBin) return stubBin
  const bin = mkdtempSync(join(tmpdir(), 'deploy-prod-bin-'))
  writeFileSync(
    join(bin, 'vercel'),
    '#!/usr/bin/env bash\necho "vercel $*" >> "$STUB_LOG"\n' +
      `if [[ "$1" == pull ]]; then printf '%s' "\${PULL_ENV:-}" > .vercel/.env.production.local; exit "\${PULL_EXIT:-0}"; fi\n` +
      `if [[ "$1" == deploy ]]; then echo '{"status":"ok","next":[]}'; exit 0; fi\n` +
      `echo "{\\"deployments\\":[{\\"url\\":\\"amargupta-tech-x.vercel.app\\",\\"readyState\\":\\"$STUB_API_STATE\\",\\"meta\\":{\\"gitSha\\":\\"$STUB_SHA\\"}}]}"\n`,
  )
  // COLIMA_START_EXIT / COLIMA_STOP_EXIT make `colima start` / `colima stop` fail, to prove the cleanup still runs.
  writeFileSync(
    join(bin, 'colima'),
    '#!/usr/bin/env bash\necho "colima $*" >> "$STUB_LOG"\n' +
      'if [[ "$1" == start ]]; then exit "${COLIMA_START_EXIT:-0}"; fi\n' +
      'if [[ "$1" == stop ]]; then exit "${COLIMA_STOP_EXIT:-0}"; fi\n',
  )
  writeFileSync(
    join(bin, 'docker'),
    '#!/usr/bin/env bash\necho "docker $*" >> "$STUB_LOG"\n' +
      'if [[ "$1" == context && "$2" == show ]]; then echo default; exit 0; fi\n' +
      'if [[ " $* " == *" run "* ]]; then mkdir -p .vercel/output; exit "$STUB_DOCKER_RUN_EXIT"; fi\n',
  )
  for (const binary of ['vercel', 'colima', 'docker']) chmodSync(join(bin, binary), 0o755)
  // Pay each stub's first-launch assessment here, once, so no test body carries it.
  for (const binary of ['vercel', 'colima', 'docker']) {
    execFileSync(join(bin, binary), ['warm-up'], { cwd: bin, env: { ...process.env, STUB_LOG: '/dev/null', STUB_NPX_EXIT: '0', STUB_DOCKER_RUN_EXIT: '0' } })
  }
  stubBin = bin
  return bin
}

export function setup(apiState = 'READY', dockerRunExit = 0) {
  const bin = stubs()
  const root = mkdtempSync(join(tmpdir(), 'deploy-prod-'))
  dirs.push(root)
  const origin = join(root, 'origin.git')
  const work = join(root, 'work')
  const log = join(root, 'commands.log')
  git(root, 'init', '-q', '--bare', '-b', 'main', origin)
  git(root, 'clone', '-q', origin, work)
  git(work, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'one')
  git(work, 'push', '-q', 'origin', 'HEAD:main')
  mkdirSync(join(work, '.vercel'))
  writeFileSync(join(work, '.vercel/project.json'), `{"projectId":"${PROFILE10_PROJECT_ID}"}`)
  writeFileSync(log, '')
  const sha = git(work, 'rev-parse', 'HEAD')
  const run = (env: Record<string, string | undefined> = {}) =>
    spawnSync('bash', [script], {
      cwd: work,
      encoding: 'utf8',
      env: {
        ...process.env,
        ...env,
        STUB_LOG: log,
        STUB_SHA: sha,
        STUB_API_STATE: apiState,
        STUB_DOCKER_RUN_EXIT: String(dockerRunExit),
        PATH: `${bin}:${process.env.PATH}`,
      },
    })
  const commandLog = () => execFileSync('cat', [log], { encoding: 'utf8' }).trim().split('\n')
  return { commandLog, run, sha, work }
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

beforeAll(() => {
  stubs()
})

afterAll(() => {
  if (stubBin) rmSync(stubBin, { recursive: true, force: true })
})

