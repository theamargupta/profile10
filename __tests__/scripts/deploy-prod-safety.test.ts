import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { setup } from './deploy-prod-harness'

// Codex build review of phase 2 (2026-10-14), findings 2 and 3. Spec: docs/specs/manual-prod-deploy.md.
describe('scripts/deploy-prod.sh — safety beyond admin', () => {
  it('refuses a .vercel/project.json linked to another project before pulling anything', () => {
    const { commandLog, run, work } = setup()
    writeFileSync(join(work, '.vercel/project.json'), '{"projectId":"prj_someOtherProject"}')

    const result = run()

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('prj_someOtherProject')
    expect(commandLog().some((line) => line.startsWith('vercel'))).toBe(false)
  })

  it('still restores the Docker context and deletes pulled variables when colima stop fails', () => {
    const { commandLog, run, work } = setup('READY', 9)

    const result = run({ COLIMA_STOP_EXIT: '5' })

    expect(result.status).toBe(9)
    expect(commandLog()).toContain('docker context use default')
    expect(existsSync(join(work, '.vercel/.env.production.local'))).toBe(false)
  })

  it('stops the shared Colima profile when colima start itself fails', () => {
    const { commandLog, run } = setup()

    const result = run({ COLIMA_START_EXIT: '7' })

    expect(result.status).toBe(7)
    expect(commandLog()).toContain('colima stop -p vercel-build')
    expect(commandLog()).toContain('docker context use default')
  })
})
