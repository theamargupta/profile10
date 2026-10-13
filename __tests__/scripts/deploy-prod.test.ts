import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROFILE10_PROJECT_ID, git, setup } from './deploy-prod-harness'

describe('scripts/deploy-prod.sh', () => {
  it('builds a clean pushed SHA, stops Docker, and deploys the verified prebuilt output', () => {
    const { commandLog, run, sha } = setup()
    const result = run()

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(commandLog()).toEqual([
      // The context is read and the trap set before the pull, so a failed pull leaves no secrets behind.
      'docker context show',
      'vercel pull --yes --environment=production --scope amargupta',
      'colima start -p vercel-build --vm-type vz --vz-rosetta --cpu 6 --memory 8 --disk 40',
      'docker --context colima-vercel-build build --platform linux/amd64 -t profile10-vercel-build scripts/deploy',
      expect.stringContaining('docker --context colima-vercel-build run --rm --platform linux/amd64 --cpus 6 --memory 8g'),
      'colima stop -p vercel-build',
      expect.stringContaining(`vercel deploy --prebuilt --prod --yes --scope amargupta --archive=tgz --meta gitSha=${sha}`),
      `vercel api /v6/deployments?projectId=${PROFILE10_PROJECT_ID}&target=production&limit=20 --scope amargupta`,
      'docker context use default',
    ])
    expect(result.stdout).toContain(`READY ${sha} amargupta-tech-x.vercel.app`)
  })

  // profile10 shares the vercel-build Colima profile with admin (the leader serialises deploys), so its image and
  // cache volumes carry their own names: a warm cache from one repo must never reach the other's build.
  it('builds with profile10-named image and cache volumes', () => {
    const { commandLog, run } = setup()

    expect(run().status).toBe(0)
    const dockerRun = commandLog().find((line) => line.includes(' run --rm ')) ?? ''
    expect(dockerRun).toContain('-v profile10-npm-cache:/root/.npm')
    expect(dockerRun).toContain('-v profile10-next-cache:/work/.next/cache')
    expect(dockerRun).toMatch(/ profile10-vercel-build \/build\.sh$/)
    expect(dockerRun).not.toContain('admin-')
  })

  it('removes pulled production variables and never starts Docker when vercel pull fails', () => {
    const { commandLog, run, work } = setup()
    const result = run({ PULL_EXIT: '4' })

    expect(result.status).toBe(4)
    expect(existsSync(join(work, '.vercel/.env.production.local'))).toBe(false)
    expect(commandLog().some((line) => line.startsWith('colima'))).toBe(false)
  })

  it('removes the built .vercel/output from the Mac checkout once the run ends', () => {
    const { run, work } = setup()

    expect(run().status).toBe(0)
    expect(existsSync(join(work, '.vercel/output'))).toBe(false)
  })

  it('stops Docker and skips deployment when the container build fails', () => {
    const { commandLog, run } = setup('READY', 9)
    const result = run()

    expect(result.status).toBe(9)
    expect(commandLog()).toContain('colima stop -p vercel-build')
    expect(commandLog().some((line) => line.startsWith('vercel deploy'))).toBe(false)
  })

  it.each([
    ['after a successful run', 0],
    ['after a failed container build', 9],
  ])('removes production environment variables %s', (_label, dockerRunExit) => {
    const { run, work } = setup('READY', dockerRunExit)

    run()

    expect(existsSync(join(work, '.vercel/.env.production.local'))).toBe(false)
  })

  it('restores the previous Docker context after the run', () => {
    const { commandLog, run } = setup()

    run()

    expect(commandLog()).toContain('docker context use default')
  })

  it.each([
    [
      'a tree with modified tracked files',
      (work: string) => {
        writeFileSync(join(work, 'a.txt'), 'dirty')
        git(work, 'add', 'a.txt')
      },
    ],
    ['no project configuration', (work: string) => rmSync(join(work, '.vercel'), { recursive: true })],
    [
      'a HEAD that is not on origin/main',
      (work: string) => git(work, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'unpushed'),
    ],
  ])('refuses %s before starting Colima', (_label, change) => {
    const { commandLog, run, work } = setup()
    change(work)

    const result = run()

    expect(result.status).toBe(1)
    expect(commandLog).not.toThrow()
    expect(commandLog()).not.toContain(expect.stringContaining('colima '))
  })

  it('explains each preflight refusal', () => {
    const dirty = setup()
    writeFileSync(join(dirty.work, 'a.txt'), 'dirty')
    git(dirty.work, 'add', 'a.txt')
    expect(dirty.run().stderr).toContain('tracked files are modified')

    const missingProject = setup()
    rmSync(join(missingProject.work, '.vercel'), { recursive: true })
    expect(missingProject.run().stderr).toContain('no .vercel/project.json')

    const unpushed = setup()
    git(unpushed.work, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'unpushed')
    expect(unpushed.run().stderr).toContain('not on origin/main')
  })

  it('adds --skip-domain only when DEPLOY_SKIP_DOMAIN is 1', () => {
    const skipped = setup()
    expect(skipped.run({ DEPLOY_SKIP_DOMAIN: '1' }).status).toBe(0)
    expect(skipped.commandLog().find((line) => line.startsWith('vercel deploy'))).toContain('--skip-domain')

    const normal = setup()
    expect(normal.run().status).toBe(0)
    expect(normal.commandLog().find((line) => line.startsWith('vercel deploy'))).not.toContain('--skip-domain')
  })

  it('exits non-zero when the deployment does not read back READY', () => {
    const { run } = setup('ERROR')
    const result = run()

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('not READY')
  })
})
