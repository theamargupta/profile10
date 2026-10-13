import { execFileSync, spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

// The production image only supplies the runtime. These PATH stubs prove the script's order and working directory.
const script = resolve(__dirname, '../../scripts/deploy/build-in-container.sh')
const dirs: string[] = []

// Stubs are written once per file and read STUB_LOG / STUB_NPX_EXIT: macOS assesses a newly written executable on its
// first launch (~400 ms each, measured 2026-10-14), which per-test stubs paid three times in every test.
let stubBin: string | undefined

function stubs() {
  if (stubBin) return stubBin
  const bin = mkdtempSync(join(tmpdir(), 'build-in-container-bin-'))
  writeFileSync(join(bin, 'npm'), '#!/usr/bin/env bash\necho "npm $PWD $*" >> "$STUB_LOG"\n')
  writeFileSync(join(bin, 'npx'), '#!/usr/bin/env bash\necho "npx $PWD $*" >> "$STUB_LOG"\nexit "$STUB_NPX_EXIT"\n')
  writeFileSync(
    join(bin, 'vercel'),
    '#!/usr/bin/env bash\necho "vercel $PWD $*" >> "$STUB_LOG"\nmkdir -p .vercel/output\necho built > .vercel/output/config.json\n',
  )
  for (const binary of ['npm', 'npx', 'vercel']) chmodSync(join(bin, binary), 0o755)
  // Pay each stub's first-launch assessment here, once, so no test body carries it.
  for (const binary of ['npm', 'npx', 'vercel']) {
    execFileSync(join(bin, binary), ['warm-up'], { cwd: bin, env: { ...process.env, STUB_LOG: '/dev/null', STUB_NPX_EXIT: '0', STUB_DOCKER_RUN_EXIT: '0' } })
  }
  stubBin = bin
  return bin
}

function setup(npxExit = 0) {
  const root = mkdtempSync(join(tmpdir(), 'build-in-container-'))
  dirs.push(root)
  const src = join(root, 'src')
  const work = join(root, 'work')
  const out = join(root, 'out')
  const bin = stubs()
  const log = join(root, 'commands.log')
  mkdirSync(src)
  mkdirSync(join(src, '.vercel'))
  writeFileSync(join(src, 'package.json'), '{}')
  // A Mac checkout may hold darwin node_modules, a local .next and a worktree .git file; none may reach the build.
  mkdirSync(join(src, 'node_modules/darwin-only'), { recursive: true })
  mkdirSync(join(src, '.next/cache'), { recursive: true })
  writeFileSync(join(src, '.next/cache/mac'), 'mac')
  writeFileSync(join(src, '.git'), 'gitdir: elsewhere')
  writeFileSync(join(src, '.env.example'), 'X=1')
  mkdirSync(join(work, '.next/cache'), { recursive: true })
  writeFileSync(join(work, '.next/cache/keep'), 'warm')
  const run = () =>
    spawnSync('bash', [script], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        SRC_DIR: src,
        WORK_DIR: work,
        OUT_DIR: out,
        STUB_LOG: log,
        STUB_NPX_EXIT: String(npxExit),
        PATH: `${bin}:${process.env.PATH}`,
      },
    })
  return { log, out, run, src, work }
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

describe('scripts/deploy/build-in-container.sh', () => {
  it('installs, type-checks, builds, and copies the Vercel output from WORK_DIR', () => {
    const { log, out, run, work } = setup()

    expect(run().status).toBe(0)
    expect(readFileSync(log, 'utf8').trim().split('\n')).toEqual([
      `npm ${work} ci --no-audit --no-fund`,
      `npx ${work} tsc --noEmit`,
      `vercel ${work} build --prod --standalone`,
    ])
    expect(readFileSync(join(out, 'output/config.json'), 'utf8')).toBe('built\n')
  })

  it('stops before Vercel build and leaves no output when type-checking fails', () => {
    const { log, out, run } = setup(3)

    expect(run().status).toBe(3)
    expect(readFileSync(log, 'utf8')).not.toContain('vercel ')
    expect(existsSync(join(out, 'output'))).toBe(false)
  })

  it('copies source and dotfiles but not node_modules, .next or .git', () => {
    const { run, work } = setup()

    expect(run().status).toBe(0)
    expect(existsSync(join(work, 'package.json'))).toBe(true)
    expect(existsSync(join(work, '.env.example'))).toBe(true)
    expect(existsSync(join(work, '.vercel'))).toBe(true)
    expect(existsSync(join(work, 'node_modules/darwin-only'))).toBe(false)
    expect(existsSync(join(work, '.next/cache/mac'))).toBe(false)
    expect(existsSync(join(work, '.git'))).toBe(false)
  })

  // Codex review finding 1 (2026-10-14): the main checkout holds a git-ignored .env.local with dev values, and Next loads
  // .env.local / .env.production in a production build. Only the pulled .vercel/.env.production.local may reach it.
  it('leaves local .env files behind but keeps .env.example and the pulled .vercel env', () => {
    const { run, src, work } = setup()
    writeFileSync(join(src, '.env.local'), 'NEXT_PUBLIC_SITE_URL=http://localhost:3000')
    writeFileSync(join(src, '.env.production'), 'X=local')
    writeFileSync(join(src, '.env'), 'X=local')
    writeFileSync(join(src, '.vercel/.env.production.local'), 'X=pulled')

    expect(run().status).toBe(0)
    expect(existsSync(join(work, '.env.local'))).toBe(false)
    expect(existsSync(join(work, '.env.production'))).toBe(false)
    expect(existsSync(join(work, '.env'))).toBe(false)
    expect(existsSync(join(work, '.env.example'))).toBe(true)
    expect(readFileSync(join(work, '.vercel/.env.production.local'), 'utf8')).toBe('X=pulled')
  })

  it('preserves the mounted Next cache while copying source into WORK_DIR', () => {
    const { run, work } = setup()

    expect(run().status).toBe(0)

    expect(readFileSync(join(work, '.next/cache/keep'), 'utf8')).toBe('warm')
  })
})
